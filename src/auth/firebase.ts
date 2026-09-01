import type { FirebaseApp } from 'firebase/app'
import type { Auth } from 'firebase/auth'
import type { Firestore } from 'firebase/firestore'

/**
 * Optional cloud sync, OFF by default. The app is fully functional and
 * fully local (IndexedDB) with none of these env vars set — this only
 * activates if *you* create your own free Firebase project and put its
 * config in a `.env.local` file. See README "Optional cloud sync" for the
 * five-minute setup.
 *
 * The Firebase SDK (~300KB) is loaded via dynamic import, not a static
 * one, so it never ships in the main bundle and never crosses the network
 * for the large majority of users who don't configure sync — only
 * `cloudSyncEnabled` (a plain boolean, free) is evaluated eagerly.
 */
const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const cloudSyncEnabled = Boolean(config.apiKey && config.projectId && config.appId)

interface FirebaseServices {
  app: FirebaseApp
  auth: Auth
  db: Firestore
}

let servicesPromise: Promise<FirebaseServices> | null = null

export function getFirebaseServices(): Promise<FirebaseServices> {
  if (!cloudSyncEnabled) return Promise.reject(new Error('Cloud sync is not configured'))
  if (!servicesPromise) {
    servicesPromise = Promise.all([
      import('firebase/app'),
      import('firebase/auth'),
      import('firebase/firestore'),
    ]).then(([{ initializeApp }, { getAuth }, { getFirestore }]) => {
      const app = initializeApp(config)
      return { app, auth: getAuth(app), db: getFirestore(app) }
    })
  }
  return servicesPromise
}
