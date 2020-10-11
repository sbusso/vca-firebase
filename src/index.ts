import { provideFirebase, useFirebase } from './firebase.js'
import { provideCollections, useCollection } from './collection.js'
import { provideAuth, useAuth } from './auth.js'
import useDoc from './doc.js'

// import { config } from 'firebase'

async function initFirebase(config: any) {
  provideFirebase(config)
  await provideAuth()
  provideCollections()
}

export { initFirebase, useFirebase, useCollection, useAuth, useDoc }
