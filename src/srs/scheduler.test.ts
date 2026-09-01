import { describe, expect, it } from 'vitest'
import { applyRating, describeInterval, isDue, newReviewState } from './scheduler'
import { DEFAULT_SCHEDULER_CONFIG } from './types'
import { reviewableKey } from '../content/types'

const cfg = DEFAULT_SCHEDULER_CONFIG
const T0 = new Date('2026-01-01T09:00:00Z').getTime()

function fresh() {
  return newReviewState(reviewableKey('vocab', 'w1'), 'vocab', 'w1', T0)
}

describe('new card progression', () => {
  it('starts in the new state, due immediately', () => {
    const s = fresh()
    expect(s.state).toBe('new')
    expect(isDue(s, T0)).toBe(true)
  })

  it('again on a new card enters learning at the first step (1 min)', () => {
    const next = applyRating(fresh(), 'again', cfg, T0)
    expect(next.state).toBe('learning')
    expect(next.dueAt - T0).toBe(1 * 60_000)
  })

  it('good advances through learning steps then graduates to review', () => {
    let s = fresh()
    s = applyRating(s, 'good', cfg, T0) // step 0 -> step 1 (10 min)
    expect(s.state).toBe('learning')
    expect(s.dueAt - T0).toBe(10 * 60_000)

    s = applyRating(s, 'good', cfg, T0 + 10 * 60_000) // graduates
    expect(s.state).toBe('review')
    expect(s.intervalDays).toBe(cfg.graduatingIntervalDays)
  })

  it('easy graduates immediately to the easy interval', () => {
    const s = applyRating(fresh(), 'easy', cfg, T0)
    expect(s.state).toBe('review')
    expect(s.intervalDays).toBe(cfg.easyIntervalDays)
  })
})

describe('review-state progression (SM-2 style)', () => {
  function graduated() {
    return applyRating(fresh(), 'easy', cfg, T0) // interval = 4 days, ease 2.5
  }

  it('good multiplies interval by ease factor and grows over repeated success', () => {
    let s = graduated()
    const firstInterval = s.intervalDays
    s = applyRating(s, 'good', cfg, s.dueAt)
    expect(s.intervalDays).toBeGreaterThan(firstInterval)
    const secondInterval = s.intervalDays
    s = applyRating(s, 'good', cfg, s.dueAt)
    expect(s.intervalDays).toBeGreaterThan(secondInterval)
  })

  it('again lapses: resets to relearning, increments lapseCount, drops ease', () => {
    const before = graduated()
    const after = applyRating(before, 'again', cfg, before.dueAt)
    expect(after.state).toBe('relearning')
    expect(after.lapseCount).toBe(before.lapseCount + 1)
    expect(after.easeFactor).toBeLessThan(before.easeFactor)
  })

  it('hard grows the interval more slowly than good', () => {
    const base = graduated()
    const hard = applyRating(base, 'hard', cfg, base.dueAt)
    const good = applyRating(base, 'good', cfg, base.dueAt)
    expect(hard.intervalDays).toBeLessThanOrEqual(good.intervalDays)
  })

  it('ease factor never drops below the configured floor', () => {
    let s = graduated()
    for (let i = 0; i < 20; i++) {
      s = applyRating(s, 'again', cfg, s.dueAt)
      s = applyRating(s, 'easy', cfg, s.dueAt) // re-graduate so state stays 'review' for next lapse
    }
    expect(s.easeFactor).toBeGreaterThanOrEqual(cfg.minimumEase)
  })

  it('relearning graduates back to review, not straight to new', () => {
    const lapsed = applyRating(graduated(), 'again', cfg, T0)
    const regraduated = applyRating(lapsed, 'good', cfg, lapsed.dueAt)
    expect(regraduated.state).toBe('review')
  })
})

describe('isDue', () => {
  it('is false before the due date and true at/after it', () => {
    const s = applyRating(fresh(), 'good', cfg, T0)
    expect(isDue(s, s.dueAt - 1000)).toBe(false)
    expect(isDue(s, s.dueAt)).toBe(true)
  })

  it('suspended items are never due', () => {
    const s = { ...fresh(), suspended: true }
    expect(isDue(s, T0 + 999_999_999)).toBe(false)
  })
})

describe('describeInterval', () => {
  it('formats minutes, hours, days, and months sensibly', () => {
    expect(describeInterval(0, 30_000)).toBe('now')
    expect(describeInterval(0, 5 * 60_000)).toBe('5 min')
    expect(describeInterval(0, 3 * 3_600_000)).toBe('3 hr')
    expect(describeInterval(0, 3 * 86_400_000)).toBe('3 days')
    expect(describeInterval(0, 90 * 86_400_000)).toBe('3 mo')
  })
})
