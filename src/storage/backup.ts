import { db, DEFAULT_SETTINGS, type SavedItem, type SettingsRow } from './db'
import type { ReviewState } from '../srs/types'
import type { LearningEvent, UnitProgress } from './db'

/**
 * Backup JSON version history:
 *  - v1: whole-database snapshot, no per-record timestamps on savedItems
 *    or settings (reviewStates/unitProgress already had `updatedAt`).
 *  - v2 (current): adds `updatedAt` to SavedItem and SettingsRow so
 *    per-record last-write-wins merging (see `mergePayloads` below) has a
 *    timestamp to compare on every table, not just some. A v1 backup still
 *    imports/merges fine — missing `updatedAt` is treated as 0 (oldest
 *    possible), so v2 data on the other side always wins the comparison
 *    without ever discarding the v1-side record entirely (it's still a
 *    candidate, just loses ties).
 */
const BACKUP_VERSION = 2
const SUPPORTED_IMPORT_VERSIONS = new Set([1, 2])

export interface BackupPayload {
  backupVersion: number
  exportedAt: string
  reviewStates: ReviewState[]
  savedItems: SavedItem[]
  learningEvents: LearningEvent[]
  unitProgress: UnitProgress[]
  settings: SettingsRow[]
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

function assertValidPayload(payload: unknown): asserts payload is BackupPayload {
  if (
    !payload || typeof payload !== 'object'
    || !SUPPORTED_IMPORT_VERSIONS.has((payload as BackupPayload).backupVersion)
  ) {
    throw new BackupImportError('This file is not a recognized Farsi Learn backup.')
  }
}

/** Replaces all local progress with the contents of `payload`. Destructive
 *  by design (it's a restore) — callers must confirm with the user first.
 *  Unlike cloud sync (see `mergeBackup`/`auth/sync.ts`), this is a
 *  deliberate one-way overwrite: importing a file you explicitly chose is
 *  an unambiguous "use this instead" action, not two devices that drifted
 *  apart. */
export async function importBackup(payload: unknown): Promise<void> {
  assertValidPayload(payload)
  await db.transaction('rw', db.reviewStates, db.savedItems, db.learningEvents, db.unitProgress, db.settings, async () => {
    await Promise.all([
      db.reviewStates.clear(),
      db.savedItems.clear(),
      db.learningEvents.clear(),
      db.unitProgress.clear(),
      db.settings.clear(),
    ])
    await Promise.all([
      db.reviewStates.bulkAdd(payload.reviewStates ?? []),
      db.savedItems.bulkAdd(payload.savedItems ?? []),
      db.learningEvents.bulkAdd((payload.learningEvents ?? []).map(stripAutoId)),
      db.unitProgress.bulkAdd(payload.unitProgress ?? []),
      db.settings.bulkAdd(payload.settings ?? []),
    ])
  })
}

// A learningEvents row's `id` is a Dexie auto-increment primary key local
// to one database — reusing ids from a different database (a cloud
// backup, another device's export) risks colliding with unrelated local
// rows. Strip it and let Dexie assign a fresh one on insert.
function stripAutoId(e: LearningEvent): Omit<LearningEvent, 'id'> {
  const { id: _id, ...rest } = e
  return rest
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

// ---------------------------------------------------------------------------
// Conflict-aware merge (Phase C2 — replaces whole-database overwrite sync)
// ---------------------------------------------------------------------------

export interface MergeSummary {
  reviewStates: { total: number; fromRemote: number }
  savedItems: { total: number; fromRemote: number }
  learningEvents: { total: number; addedFromRemote: number }
  unitProgress: { total: number; fromRemote: number }
  settingsSource: 'local' | 'remote' | 'none'
}

/** Per-record last-write-wins merge, keyed by each table's natural key,
 *  comparing `updatedAt` (missing = 0, i.e. oldest). Never drops a record
 *  that exists on only one side — every id in either payload appears in
 *  the merged result. `learningEvents` is append-only, so it's a dedup'd
 *  union instead of a per-key pick (there's no single natural key to pick
 *  a "winner" for — every event is its own fact). `settings` is a single
 *  row: the newer whole row wins by `updatedAt`, except `longestStreak`
 *  which always takes the max of both sides — a personal best should never
 *  regress just because the other device's settings row happened to be
 *  written more recently for an unrelated reason (e.g. toggling a
 *  checkbox). This is a pure function — no I/O — so it's easy to unit test
 *  and reused by both `mergeBackup` (writes the result to local Dexie) and
 *  `uploadProgress` (writes the result to the cloud) in auth/sync.ts. */
export function mergePayloads(a: BackupPayload, b: BackupPayload): { merged: BackupPayload; summary: MergeSummary } {
  const reviewStates = mergeByKey(a.reviewStates, b.reviewStates, (r) => r.key, (r) => r.updatedAt ?? 0)
  const savedItems = mergeByKey(a.savedItems, b.savedItems, (r) => r.id, (r) => r.updatedAt ?? r.createdAt ?? 0)
  const unitProgress = mergeByKey(a.unitProgress, b.unitProgress, (r) => r.unitId, (r) => r.updatedAt ?? 0)
  const learningEvents = mergeLearningEvents(a.learningEvents, b.learningEvents)
  const { settings, source } = mergeSettings(a.settings[0], b.settings[0])

  const merged: BackupPayload = {
    backupVersion: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    reviewStates: reviewStates.merged,
    savedItems: savedItems.merged,
    unitProgress: unitProgress.merged,
    learningEvents,
    settings: settings ? [settings] : [],
  }
  const summary: MergeSummary = {
    reviewStates: { total: reviewStates.merged.length, fromRemote: reviewStates.fromB },
    savedItems: { total: savedItems.merged.length, fromRemote: savedItems.fromB },
    learningEvents: { total: learningEvents.length, addedFromRemote: learningEvents.length - a.learningEvents.length },
    unitProgress: { total: unitProgress.merged.length, fromRemote: unitProgress.fromB },
    settingsSource: source,
  }
  return { merged, summary }
}

function mergeByKey<T>(
  listA: T[], listB: T[], keyOf: (item: T) => string, updatedAtOf: (item: T) => number,
): { merged: T[]; fromB: number } {
  const byKey = new Map<string, T>()
  for (const item of listA) byKey.set(keyOf(item), item)
  let fromB = 0
  for (const item of listB) {
    const key = keyOf(item)
    const existing = byKey.get(key)
    if (!existing || updatedAtOf(item) > updatedAtOf(existing)) {
      byKey.set(key, item)
      fromB += 1
    }
  }
  return { merged: [...byKey.values()], fromB }
}

function learningEventNaturalKey(e: LearningEvent): string {
  return `${e.key}|${e.timestamp}|${e.rating}|${e.correct}`
}

function mergeLearningEvents(listA: LearningEvent[], listB: LearningEvent[]): LearningEvent[] {
  const seen = new Set(listA.map(learningEventNaturalKey))
  const merged = listA.map(stripAutoId) as LearningEvent[]
  for (const e of listB) {
    const key = learningEventNaturalKey(e)
    if (!seen.has(key)) {
      seen.add(key)
      merged.push(stripAutoId(e) as LearningEvent)
    }
  }
  return merged
}

function mergeSettings(a: SettingsRow | undefined, b: SettingsRow | undefined): { settings: SettingsRow | undefined; source: 'local' | 'remote' | 'none' } {
  if (!a && !b) return { settings: undefined, source: 'none' }
  if (!a) return { settings: b, source: 'remote' }
  if (!b) return { settings: a, source: 'local' }
  const aTime = a.updatedAt ?? 0
  const bTime = b.updatedAt ?? 0
  const winner = bTime > aTime ? b : a
  return {
    settings: { ...winner, longestStreak: Math.max(a.longestStreak, b.longestStreak) },
    source: bTime > aTime ? 'remote' : 'local',
  }
}

/** Overwrites local Dexie tables with an already-merged payload (the
 *  write-side of both `mergeBackup` and `uploadProgress` in auth/sync.ts —
 *  factored out so uploading doesn't have to merge twice). Safe to call
 *  with a payload that IS the merge result (a superset of local + remote),
 *  never with a raw one-sided payload. */
export async function applyMergedToLocal(merged: BackupPayload): Promise<void> {
  await db.transaction('rw', db.reviewStates, db.savedItems, db.learningEvents, db.unitProgress, db.settings, async () => {
    await Promise.all([
      db.reviewStates.clear(),
      db.savedItems.clear(),
      db.learningEvents.clear(),
      db.unitProgress.clear(),
      db.settings.clear(),
    ])
    await Promise.all([
      db.reviewStates.bulkAdd(merged.reviewStates),
      db.savedItems.bulkAdd(merged.savedItems),
      db.learningEvents.bulkAdd(merged.learningEvents.map(stripAutoId)),
      db.unitProgress.bulkAdd(merged.unitProgress),
      db.settings.bulkAdd(merged.settings.length > 0 ? merged.settings : [DEFAULT_SETTINGS]),
    ])
  })
}

/** Merges a remote payload into the local database (used by cloud
 *  download — see auth/sync.ts). Unlike `importBackup`, this never drops
 *  a local-only record; it only adds/updates per the last-write-wins rules
 *  above. Returns a summary for a "here's what changed" UI message. */
export async function mergeBackup(remote: BackupPayload): Promise<MergeSummary> {
  const local = await exportBackup()
  const { merged, summary } = mergePayloads(local, remote)
  await applyMergedToLocal(merged)
  return summary
}
