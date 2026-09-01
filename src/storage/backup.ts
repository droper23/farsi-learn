import { db } from './db'

const BACKUP_VERSION = 1

export interface BackupPayload {
  backupVersion: number
  exportedAt: string
  reviewStates: unknown[]
  savedItems: unknown[]
  learningEvents: unknown[]
  unitProgress: unknown[]
  settings: unknown[]
}

export async function exportBackup(): Promise<BackupPayload> {
  const [reviewStates, savedItems, learningEvents, unitProgress, settings] = await Promise.all([
    db.reviewStates.toArray(),
    db.savedItems.toArray(),
    db.learningEvents.toArray(),
    db.unitProgress.toArray(),
    db.settings.toArray(),
  ])
  return {
    backupVersion: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    reviewStates, savedItems, learningEvents, unitProgress, settings,
  }
}

export function downloadBackup(payload: BackupPayload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const date = payload.exportedAt.slice(0, 10)
  a.href = url
  a.download = `farsi-learn-backup-${date}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export class BackupImportError extends Error {}

/** Replaces all local progress with the contents of `payload`. Destructive
 *  by design (it's a restore) — callers must confirm with the user first. */
export async function importBackup(payload: BackupPayload): Promise<void> {
  if (!payload || typeof payload !== 'object' || payload.backupVersion !== BACKUP_VERSION) {
    throw new BackupImportError('This file is not a recognized Farsi Learn backup.')
  }
  await db.transaction('rw', db.reviewStates, db.savedItems, db.learningEvents, db.unitProgress, db.settings, async () => {
    await Promise.all([
      db.reviewStates.clear(),
      db.savedItems.clear(),
      db.learningEvents.clear(),
      db.unitProgress.clear(),
      db.settings.clear(),
    ])
    await Promise.all([
      db.reviewStates.bulkAdd(payload.reviewStates as never[]),
      db.savedItems.bulkAdd(payload.savedItems as never[]),
      db.learningEvents.bulkAdd(payload.learningEvents as never[]),
      db.unitProgress.bulkAdd(payload.unitProgress as never[]),
      db.settings.bulkAdd(payload.settings as never[]),
    ])
  })
}

export async function resetAllProgress(): Promise<void> {
  await db.transaction('rw', db.reviewStates, db.savedItems, db.learningEvents, db.unitProgress, db.settings, async () => {
    await Promise.all([
      db.reviewStates.clear(),
      db.savedItems.clear(),
      db.learningEvents.clear(),
      db.unitProgress.clear(),
      db.settings.clear(),
    ])
  })
}
