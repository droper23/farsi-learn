import type { User } from 'firebase/auth'
import { getFirebaseServices } from './firebase'
import { exportBackup, mergeBackup, mergePayloads, applyMergedToLocal, type BackupPayload, type MergeSummary } from '../storage/backup'

/**
 * Explicit, manual sync (no realtime listeners, no background autosync —
 * the learner always presses a button) that now merges per-record instead
 * of blindly overwriting one side (see storage/backup.ts `mergePayloads`
 * for the last-write-wins rules). Both directions converge to the same
 * merged state on both the device and the cloud, so neither "Upload" nor
 * "Download" can silently drop progress made on the other device since the
 * last sync — the previous behavior (see PROGRESS.md) where the loser of
 * two actively-used devices lost everything since the last sync.
 */

async function backupDocRef(uid: string) {
  const [{ db }, { doc }] = await Promise.all([getFirebaseServices(), import('firebase/firestore')])
  return doc(db, 'farsiLearnBackups', uid)
}

async function fetchRemote(user: User): Promise<BackupPayload | null> {
  const [ref, { getDoc }] = await Promise.all([backupDocRef(user.uid), import('firebase/firestore')])
  const snap = await getDoc(ref)
  return snap.exists() ? (snap.data() as BackupPayload) : null
}

/** Merges local + remote (if any), pushes the merged result to the cloud,
 *  AND applies it locally too — so an "Upload" also heals this device with
 *  anything newer that was only on the other device, rather than being a
 *  pure one-way push that could still cause data loss on the next
 *  "Download" elsewhere. */
export async function uploadProgress(user: User): Promise<MergeSummary> {
  const [ref, local, remote, { setDoc, Timestamp }] = await Promise.all([
    backupDocRef(user.uid), exportBackup(), fetchRemote(user), import('firebase/firestore'),
  ])
  if (!remote) {
    await setDoc(ref, { ...local, updatedAt: Timestamp.now() })
    return { reviewStates: { total: local.reviewStates.length, fromRemote: 0 }, savedItems: { total: local.savedItems.length, fromRemote: 0 }, learningEvents: { total: local.learningEvents.length, addedFromRemote: 0 }, unitProgress: { total: local.unitProgress.length, fromRemote: 0 }, settingsSource: 'local' }
  }
  const { merged, summary } = mergePayloads(local, remote)
  await Promise.all([
    setDoc(ref, { ...merged, updatedAt: Timestamp.now() }),
    applyMergedToLocal(merged), // also heal local state with anything newer from remote
  ])
  return summary
}

/** Merges the cloud backup (if any) into local progress. Never a blind
 *  overwrite — see `mergeBackup`. */
export async function downloadProgress(user: User): Promise<{ found: boolean; exportedAt?: string; summary?: MergeSummary }> {
  const remote = await fetchRemote(user)
  if (!remote) return { found: false }
  const summary = await mergeBackup(remote)
  return { found: true, exportedAt: remote.exportedAt, summary }
}
