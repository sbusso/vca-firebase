import { computed, toRefs, watchEffect, reactive, inject, provide } from 'vue'
import { useFirebase } from './firebase.js'
import { useAuth } from './auth.js'

const CollectionSymbol = Symbol('FirebaseCollection')

export function provideCollections(): any {
  provide(CollectionSymbol, reactive({}))
}

export function useCollection(name: string, filter: any): any {
  const state: any = inject(CollectionSymbol)

  if (!state) {
    throw Error('No Collection provided')
  }

  const { firestore } = useFirebase()

  let field = ''
  let value = ''

  if (filter) {
    field = Object.keys(filter)[0]
    value = filter[field]
  }

  const hash = `${name}-${field}-${value}`

  const { uid } = useAuth()

  if (!state[hash]) {
    let collection = firestore.collection(name)

    state[hash] = {}

    watchEffect(() => {
      if (!uid.value) {
        return
      }

      if (field) {
        collection = collection.where(field, '==', value)
      }

      collection.onSnapshot(
        { includeMetadataChanges: true },
        (snapshot: any) => {
          snapshot.docChanges().forEach((change: any) => {
            if (change.type === 'removed') {
              delete state[hash][change.doc.id]
            } else {
              state[hash][change.doc.id] = change.doc.data()
            }
          })
        },
      )
    })
  }

  function get(id: string) {
    if (!state[hash]) {
      return {}
    }

    return state[hash][id]
  }

  const docs = computed(() => {
    if (!state[hash]) {
      return []
    }

    return Object.keys(state[hash]).map((key) => ({
      ...state[hash][key],
      id: key,
    }))
  })

  return {
    ...toRefs(state),
    get,
    docs,
  }
}
