import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { db } from './db'
import {
  recordReview, getOrCreateReviewState,
  LEARNING_EVENT_RETENTION_DAYS, MAX_LEARNING_EVENTS,
} from './progressRepo'

async function clearAll() {
  await db.reviewStates.clear()
  await db.learningEvents.clear()
  await db.settings.clear()
}

beforeEach(clearAll)
afterEach(clearAll)

describe('recordReview event-log trimming (H2)', () => {
  it('deletes events older than the retention window on every write', async () => {
    const now = Date.now()
    const stale = now - (LEARNING_EVENT_RETENTION_DAYS + 1) * 86_400_000
    await db.learningEvents.add({ key: 'vocab:old', kind: 'vocab', itemId: 'old', rating: 'good', correct: true, timestamp: stale })

    await recordReview('vocab', 'x', 'good', true, now)

    const remaining = await db.learningEvents.toArray()
    expect(remaining.some((e) => e.itemId === 'old')).toBe(false)
    expect(remaining.some((e) => e.itemId === 'x')).toBe(true)
  })

  it('caps total event count, keeping the newest rows', async () => {
    const now = Date.now()
    // Seed one over the cap with recent, distinct timestamps so none get
    // caught by the retention-window delete.
    const seed = Array.from({ length: MAX_LEARNING_EVENTS }, (_, i) => ({
      key: `vocab:seed${i}` as const, kind: 'vocab' as const, itemId: `seed${i}`,
      rating: 'good' as const, correct: true, timestamp: now - (MAX_LEARNING_EVENTS - i) * 1000,
    }))
    await db.learningEvents.bulkAdd(seed)

    await recordReview('vocab', 'newest', 'good', true, now)

    const count = await db.learningEvents.count()
    expect(count).toBe(MAX_LEARNING_EVENTS)
    const remaining = await db.learningEvents.toArray()
    expect(remaining.some((e) => e.itemId === 'newest')).toBe(true)
    expect(remaining.some((e) => e.itemId === 'seed0')).toBe(false) // oldest, evicted
  })

  it('still advances the SRS state normally alongside trimming', async () => {
    const now = Date.now()
    const before = await getOrCreateReviewState('vocab', 'y', now)
    expect(before.state).toBe('new')
    const after = await recordReview('vocab', 'y', 'good', true, now)
    expect(after.reviewCount).toBe(1)
  })
})
