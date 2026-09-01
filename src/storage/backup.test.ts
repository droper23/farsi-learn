import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { db, DEFAULT_SETTINGS } from './db'
import { exportBackup, importBackup, mergePayloads, mergeBackup, BackupImportError, type BackupPayload } from './backup'
import type { ReviewState } from '../srs/types'

function emptyPayload(overrides: Partial<BackupPayload> = {}): BackupPayload {
  return {
    backupVersion: 2, exportedAt: new Date(0).toISOString(),
    reviewStates: [], savedItems: [], learningEvents: [], unitProgress: [], settings: [],
    ...overrides,
  }
}

function rs(overrides: Partial<ReviewState>): ReviewState {
  return {
    key: 'vocab:x', kind: 'vocab', itemId: 'x', state: 'new', dueAt: 0, intervalDays: 0,
    easeFactor: 2.5, reviewCount: 0, lapseCount: 0, learningStepIndex: 0, createdAt: 0, updatedAt: 0,
    ...overrides,
  }
}

describe('mergePayloads (pure)', () => {
  it('keeps a record that exists on only one side', () => {
    const a = emptyPayload({ reviewStates: [rs({ key: 'vocab:a', itemId: 'a', updatedAt: 100 })] })
    const b = emptyPayload()
    const { merged, summary } = mergePayloads(a, b)
    expect(merged.reviewStates.map((r) => r.key)).toEqual(['vocab:a'])
    expect(summary.reviewStates.fromRemote).toBe(0)
  })

  it('picks the newer reviewState by updatedAt on a key collision', () => {
    const a = emptyPayload({ reviewStates: [rs({ key: 'vocab:a', itemId: 'a', updatedAt: 100, reviewCount: 1 })] })
    const b = emptyPayload({ reviewStates: [rs({ key: 'vocab:a', itemId: 'a', updatedAt: 200, reviewCount: 5 })] })
    const { merged, summary } = mergePayloads(a, b)
    expect(merged.reviewStates).toHaveLength(1)
    expect(merged.reviewStates[0].reviewCount).toBe(5)
    expect(summary.reviewStates.fromRemote).toBe(1)
  })

  it('keeps the older side when it is newer than the other side', () => {
    const a = emptyPayload({ reviewStates: [rs({ key: 'vocab:a', itemId: 'a', updatedAt: 500, reviewCount: 9 })] })
    const b = emptyPayload({ reviewStates: [rs({ key: 'vocab:a', itemId: 'a', updatedAt: 200, reviewCount: 5 })] })
    const { merged, summary } = mergePayloads(a, b)
    expect(merged.reviewStates[0].reviewCount).toBe(9)
    expect(summary.reviewStates.fromRemote).toBe(0)
  })

  it('unions savedItems, keyed by id, newer updatedAt wins on collision', () => {
    const a = emptyPayload({
      savedItems: [
        { id: 's1', fa: 'س', translit: 's', en: 'one', createdAt: 0, updatedAt: 100 },
        { id: 's2', fa: 'د', translit: 'd', en: 'two', createdAt: 0, updatedAt: 100 },
      ],
    })
    const b = emptyPayload({
      savedItems: [{ id: 's1', fa: 'س', translit: 's', en: 'ONE (edited)', createdAt: 0, updatedAt: 300 }],
    })
    const { merged } = mergePayloads(a, b)
    expect(merged.savedItems).toHaveLength(2)
    expect(merged.savedItems.find((s) => s.id === 's1')!.en).toBe('ONE (edited)')
    expect(merged.savedItems.find((s) => s.id === 's2')!.en).toBe('two')
  })

  it('falls back to createdAt for savedItems missing updatedAt (old v1 backups)', () => {
    const a = emptyPayload({ savedItems: [{ id: 's1', fa: 'س', translit: 's', en: 'old', createdAt: 50 }] })
    const b = emptyPayload({ savedItems: [{ id: 's1', fa: 'س', translit: 's', en: 'new', createdAt: 0, updatedAt: 200 }] })
    const { merged } = mergePayloads(a, b)
    expect(merged.savedItems[0].en).toBe('new')
  })

  it('unions unitProgress by unitId, newer updatedAt wins', () => {
    const a = emptyPayload({ unitProgress: [{ unitId: 'u1', lessonsCompleted: 1, updatedAt: 100 }] })
    const b = emptyPayload({ unitProgress: [{ unitId: 'u1', lessonsCompleted: 3, updatedAt: 200 }] })
    const { merged } = mergePayloads(a, b)
    expect(merged.unitProgress).toEqual([{ unitId: 'u1', lessonsCompleted: 3, updatedAt: 200 }])
  })

  it('deduplicates learningEvents by natural key (key+timestamp+rating+correct) instead of dropping either side', () => {
    const a = emptyPayload({ learningEvents: [{ id: 1, key: 'vocab:a', kind: 'vocab', itemId: 'a', rating: 'good', correct: true, timestamp: 100 }] })
    const b = emptyPayload({
      learningEvents: [
        { id: 1, key: 'vocab:a', kind: 'vocab', itemId: 'a', rating: 'good', correct: true, timestamp: 100 }, // exact duplicate (same device history re-synced)
        { id: 2, key: 'vocab:b', kind: 'vocab', itemId: 'b', rating: 'again', correct: false, timestamp: 150 }, // genuinely new
      ],
    })
    const { merged } = mergePayloads(a, b)
    expect(merged.learningEvents).toHaveLength(2)
    expect(merged.learningEvents.every((e) => e.id === undefined)).toBe(true) // ids stripped, DB reassigns
  })

  it('merges settings by newer updatedAt but always takes the max longestStreak', () => {
    const a = emptyPayload({ settings: [{ ...DEFAULT_SETTINGS, newItemsPerDay: 10, longestStreak: 40, updatedAt: 500 }] })
    const b = emptyPayload({ settings: [{ ...DEFAULT_SETTINGS, newItemsPerDay: 20, longestStreak: 12, updatedAt: 900 }] })
    const { merged, summary } = mergePayloads(a, b)
    expect(merged.settings[0].newItemsPerDay).toBe(20) // b is newer, wins the row
    expect(merged.settings[0].longestStreak).toBe(40) // but the higher streak is never dropped
    expect(summary.settingsSource).toBe('remote')
  })

  it('never drops a record that exists on only one side, across every table', () => {
    const a = emptyPayload({
      reviewStates: [rs({ key: 'vocab:a', itemId: 'a' })],
      savedItems: [{ id: 'sa', fa: 'س', translit: 's', en: 'a', createdAt: 0 }],
      unitProgress: [{ unitId: 'ua', lessonsCompleted: 1, updatedAt: 0 }],
    })
    const b = emptyPayload({
      reviewStates: [rs({ key: 'vocab:b', itemId: 'b' })],
      savedItems: [{ id: 'sb', fa: 'د', translit: 'd', en: 'b', createdAt: 0 }],
      unitProgress: [{ unitId: 'ub', lessonsCompleted: 1, updatedAt: 0 }],
    })
    const { merged } = mergePayloads(a, b)
    expect(merged.reviewStates.map((r) => r.key).sort()).toEqual(['vocab:a', 'vocab:b'])
    expect(merged.savedItems.map((s) => s.id).sort()).toEqual(['sa', 'sb'])
    expect(merged.unitProgress.map((u) => u.unitId).sort()).toEqual(['ua', 'ub'])
  })
})

describe('importBackup (destructive restore)', () => {
  beforeEach(async () => { await db.reviewStates.clear(); await db.savedItems.clear(); await db.settings.clear() })
  afterEach(async () => { await db.reviewStates.clear(); await db.savedItems.clear(); await db.settings.clear() })

  it('rejects an unrecognized file', async () => {
    await expect(importBackup({ backupVersion: 99 })).rejects.toThrow(BackupImportError)
    await expect(importBackup(null)).rejects.toThrow(BackupImportError)
  })

  it('accepts a legacy v1 backup (no updatedAt fields)', async () => {
    await importBackup({
      backupVersion: 1, exportedAt: new Date().toISOString(),
      reviewStates: [rs({ key: 'vocab:a', itemId: 'a' })],
      savedItems: [{ id: 's1', fa: 'س', translit: 's', en: 'one', createdAt: 0 }],
      learningEvents: [], unitProgress: [], settings: [],
    })
    expect(await db.reviewStates.count()).toBe(1)
    expect(await db.savedItems.count()).toBe(1)
  })

  it('replaces existing local data entirely', async () => {
    await db.reviewStates.put(rs({ key: 'vocab:old', itemId: 'old' }))
    await importBackup(emptyPayload({ reviewStates: [rs({ key: 'vocab:new', itemId: 'new' })] }))
    const all = await db.reviewStates.toArray()
    expect(all.map((r) => r.key)).toEqual(['vocab:new'])
  })
})

describe('mergeBackup (writes merge result to local db)', () => {
  beforeEach(async () => { await db.reviewStates.clear(); await db.savedItems.clear(); await db.settings.clear() })
  afterEach(async () => { await db.reviewStates.clear(); await db.savedItems.clear(); await db.settings.clear() })

  it('keeps local-only records and adds remote-only records', async () => {
    await db.reviewStates.put(rs({ key: 'vocab:local', itemId: 'local', updatedAt: 100 }))
    const remote = emptyPayload({ reviewStates: [rs({ key: 'vocab:remote', itemId: 'remote', updatedAt: 100 })] })
    await mergeBackup(remote)
    const keys = (await db.reviewStates.toArray()).map((r) => r.key).sort()
    expect(keys).toEqual(['vocab:local', 'vocab:remote'])
  })

  it('does not overwrite a newer local record with an older remote one', async () => {
    await db.reviewStates.put(rs({ key: 'vocab:a', itemId: 'a', updatedAt: 999, reviewCount: 7 }))
    const remote = emptyPayload({ reviewStates: [rs({ key: 'vocab:a', itemId: 'a', updatedAt: 1, reviewCount: 1 })] })
    await mergeBackup(remote)
    const state = await db.reviewStates.get('vocab:a')
    expect(state?.reviewCount).toBe(7)
  })

  it('round-trips through exportBackup unchanged for a single-device merge with nothing new', async () => {
    await db.reviewStates.put(rs({ key: 'vocab:a', itemId: 'a', updatedAt: 100 }))
    const before = await exportBackup()
    const summary = await mergeBackup(before)
    expect(summary.reviewStates.total).toBe(1)
    expect(summary.reviewStates.fromRemote).toBe(0)
  })
})
