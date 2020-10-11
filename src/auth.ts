import { reactive, toRefs, provide, inject } from 'vue'
import { useFirebase } from './firebase.js'
import 'firebase/auth'

const AuthSymbol = Symbol('FirebaseAuth')

export function useAuth(): any {
  const result = inject(AuthSymbol)

  if (!result) {
    throw Error('No Auth provided')
  }

  return result
}

export async function provideAuth(): Promise<void> {
  const { firebase } = useFirebase()

  const state = reactive({
    loading: true,
    signingIn: false,
    uid: null,
    user: null,
  })

  firebase.auth().onAuthStateChanged(setUser)

  if (firebase.auth().isSignInWithEmailLink(window.location.href)) {
    await signInWithEmailLink(window.location.href)
  }

  async function setUser(user: any) {
    state.user = user
    state.uid = user ? user.uid : null
    state.loading = false
    state.signingIn = false
  }

  async function signOut() {
    await firebase.auth().signOut()
    await setUser(null)
  }

  async function signInAnonymously() {
    await firebase.auth().signInAnonymously()
  }

  async function signInWithEmailLink(link: string) {
    state.signingIn = true

    // todo: add email extraction from url
    const email = ''
    if (!email) {
      console.error('email is missing')
    }

    await firebase.auth().signInWithEmailLink(email, link)
  }

  async function sendSignInLinkToEmail(email: string) {
    const actionCodeSettings = {
      // todo: add to url: ?email=email
      url: window.location.href,
      handleCodeInApp: true,
    }

    await firebase.auth().sendSignInLinkToEmail(email, actionCodeSettings)
  }

  function signInWithGoogle() {
    state.signingIn = true

    const provider = new firebase.auth.GoogleAuthProvider()
    provider.addScope('https://www.googleapis.com/auth/userinfo.email')
    firebase.auth().signInWithRedirect(provider)
  }

  provide(AuthSymbol, {
    ...toRefs(state),
    signInWithGoogle,
    sendSignInLinkToEmail,
    signOut,
    signInAnonymously,
    signInWithEmailLink,
  })
}
