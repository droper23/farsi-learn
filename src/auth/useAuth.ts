import { useEffect, useState } from 'react'
import type { User } from 'firebase/auth'
import { cloudSyncEnabled, getFirebaseServices } from './firebase'

export interface AuthState {
  enabled: boolean
  user: User | null
  loading: boolean
}

export function useAuth(): AuthState & { signIn: () => Promise<void>; signOut: () => Promise<void> } {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(cloudSyncEnabled)

  useEffect(() => {
    if (!cloudSyncEnabled) return
    let unsubscribe: (() => void) | undefined
    let cancelled = false
    Promise.all([getFirebaseServices(), import('firebase/auth')]).then(([{ auth }, { onAuthStateChanged }]) => {
      if (cancelled) return
      unsubscribe = onAuthStateChanged(auth, (u) => {
        setUser(u)
        setLoading(false)
      })
    })
    return () => { cancelled = true; unsubscribe?.() }
  }, [])

  return {
    enabled: cloudSyncEnabled,
    user,
    loading,
    async signIn() {
      const [{ auth }, { GoogleAuthProvider, signInWithPopup }] = await Promise.all([getFirebaseServices(), import('firebase/auth')])
      await signInWithPopup(auth, new GoogleAuthProvider())
    },
    async signOut() {
      const [{ auth }, { signOut: fbSignOut }] = await Promise.all([getFirebaseServices(), import('firebase/auth')])
      await fbSignOut(auth)
    },
  }
}
