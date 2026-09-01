import type { User } from 'firebase/auth'
import { getFirebaseServices } from './firebase'
import { exportBackup, importBackup, type BackupPayload } from '../storage/backup'

/**
 * Deliberately simple, explicit sync — no realtime listeners, no automatic
 * conflict merging. Persian-learning progress is small (a few thousand
 * rows at most), so "upload everything" / "download everything" is fast
 * and, unlike a merge algorithm, never silently loses review history by
 * getting a merge heuristic wrong. The user chooses a direction.
 */

async function backupDocRef(uid: string) {
  const [{ db }, { doc }] = await Promise.all([getFirebaseServices(), import('firebase/firestore')])
  return doc(db, 'farsiLearnBackups', uid)
}

export async function uploadProgress(user: User): Promise<void> {
  const [ref, payload, { setDoc, Timestamp }] = await Promise.all([
    backupDocRef(user.uid), exportBackup(), import('firebase/firestore'),
  ])
  await setDoc(ref, { ...payload, updatedAt: Timestamp.now() })
}

export async function downloadProgress(user: User): Promise<{ found: boolean; exportedAt?: string }> {
  const [ref, { getDoc }] = await Promise.all([backupDocRef(user.uid), import('firebase/firestore')])
  const snap = await getDoc(ref)
  if (!snap.exists()) return { found: false }
  const data = snap.data() as BackupPayload
  await importBackup(data)
  return { found: true, exportedAt: data.exportedAt }
}
