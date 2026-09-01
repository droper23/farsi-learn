import type { ReviewableKey, ReviewableKind } from '../content/types'
import type { CardState, RatingForecast, ReviewRating, ReviewState, SchedulerConfig } from './types'

const MINUTE = 60_000
const DAY = 86_400_000

export function newReviewState(key: ReviewableKey, kind: ReviewableKind, itemId: string, now: number): ReviewState {
  return {
    key,
    kind,
    itemId,
    state: 'new',
    dueAt: now,
    intervalDays: 0,
    easeFactor: 2.5,
    reviewCount: 0,
    lapseCount: 0,
    learningStepIndex: 0,
    createdAt: now,
    updatedAt: now,
  }
}

function localDayKey(ts: number): string {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function roundInterval(days: number): number {
  return Math.max(1, Math.round(days))
}

function addDays(now: number, days: number): number {
  return now + roundInterval(days) * DAY
}

function graduate(s: Mutable, intervalDays: number, easeFactor: number, config: SchedulerConfig, now: number) {
  s.state = 'review'
  s.learningStepIndex = 0
  s.intervalDays = roundInterval(intervalDays)
  s.easeFactor = Math.max(config.minimumEase, easeFactor)
  s.dueAt = addDays(now, s.intervalDays)
}

type Mutable = {
  state: CardState
  dueAt: number
  intervalDays: number
  easeFactor: number
  reviewCount: number
  lapseCount: number
  learningStepIndex: number
}

function learningStateFor(current: CardState): CardState {
  return current === 'relearning' ? 'relearning' : 'learning'
}

function applyLearning(
  rating: ReviewRating,
  s: Mutable,
  steps: number[],
  graduatingInterval: number,
  easyInterval: number,
  startingEase: number,
  config: SchedulerConfig,
  now: number,
) {
  s.reviewCount += 1
  s.easeFactor = Math.max(config.minimumEase, startingEase)

  switch (rating) {
    case 'again': {
      if (steps.length === 0) {
        graduate(s, graduatingInterval, startingEase, config, now)
        return
      }
      s.state = learningStateFor(s.state)
      s.learningStepIndex = 0
      s.dueAt = now + steps[0] * MINUTE
      s.intervalDays = 0
      return
    }
    case 'hard': {
      if (steps.length === 0) {
        graduate(s, graduatingInterval, startingEase, config, now)
        return
      }
      s.state = learningStateFor(s.state)
      const idx = Math.min(s.learningStepIndex, Math.max(0, steps.length - 1))
      const hardMinutes = idx === 0 ? (steps.length > 1 ? (steps[0] + steps[1]) / 2 : steps[0] * 1.5) : steps[idx]
      s.learningStepIndex = idx
      s.dueAt = now + hardMinutes * MINUTE
      s.intervalDays = 0
      return
    }
    case 'good': {
      if (steps.length === 0) {
        graduate(s, graduatingInterval, startingEase, config, now)
        return
      }
      const nextIdx = s.learningStepIndex + 1
      if (nextIdx >= steps.length) {
        graduate(s, graduatingInterval, startingEase, config, now)
      } else {
        s.state = learningStateFor(s.state)
        s.learningStepIndex = nextIdx
        s.dueAt = now + steps[nextIdx] * MINUTE
        s.intervalDays = 0
      }
      return
    }
    case 'easy': {
      graduate(s, easyInterval, startingEase, config, now)
    }
  }
}

function applyReview(rating: ReviewRating, s: Mutable, config: SchedulerConfig, now: number) {
  const currentInterval = Math.max(1, s.intervalDays)
  s.reviewCount += 1

  switch (rating) {
    case 'again': {
      s.lapseCount += 1
      s.easeFactor = Math.max(config.minimumEase, s.easeFactor - 0.2)
      s.intervalDays = roundInterval(
        Math.max(config.minimumLapseIntervalDays, currentInterval * config.lapseNewIntervalFactor),
      )
      if (config.relearningStepsMinutes.length > 0) {
        s.state = 'relearning'
        s.learningStepIndex = 0
        s.dueAt = now + config.relearningStepsMinutes[0] * MINUTE
      } else {
        graduate(s, s.intervalDays, s.easeFactor, config, now)
      }
      return
    }
    case 'hard': {
      s.easeFactor = Math.max(config.minimumEase, s.easeFactor - 0.15)
      const next = Math.max(currentInterval + 1, currentInterval * config.hardIntervalFactor)
      graduate(s, next, s.easeFactor, config, now)
      return
    }
    case 'good': {
      const next = Math.max(currentInterval + 1, currentInterval * s.easeFactor)
      graduate(s, next, s.easeFactor, config, now)
      return
    }
    case 'easy': {
      s.easeFactor = Math.max(config.minimumEase, s.easeFactor + 0.15)
      const next = Math.max(currentInterval + 1, currentInterval * s.easeFactor * config.easyBonus)
      graduate(s, next, s.easeFactor, config, now)
    }
  }
}

function step(rating: ReviewRating, prev: ReviewState, config: SchedulerConfig, now: number): ReviewState {
  const s: Mutable = {
    state: prev.state,
    dueAt: prev.dueAt,
    intervalDays: prev.intervalDays,
    easeFactor: prev.easeFactor,
    reviewCount: prev.reviewCount,
    lapseCount: prev.lapseCount,
    learningStepIndex: prev.learningStepIndex,
  }

  if (s.state === 'new' || s.state === 'learning') {
    applyLearning(
      rating, s, config.learningStepsMinutes, config.graduatingIntervalDays,
      config.easyIntervalDays, config.startingEase, config, now,
    )
  } else if (s.state === 'review') {
    applyReview(rating, s, config, now)
  } else {
    const relearnInterval = Math.max(config.minimumLapseIntervalDays, s.intervalDays)
    applyLearning(
      rating, s, config.relearningStepsMinutes, relearnInterval,
      Math.max(relearnInterval, config.easyIntervalDays), s.easeFactor, config, now,
    )
  }

  return {
    ...prev,
    state: s.state,
    dueAt: s.dueAt,
    intervalDays: s.intervalDays,
    easeFactor: s.easeFactor,
    reviewCount: s.reviewCount,
    lapseCount: s.lapseCount,
    learningStepIndex: s.learningStepIndex,
    lastReviewedAt: now,
    updatedAt: now,
    lastIntroducedDay: prev.state === 'new' ? localDayKey(now) : prev.lastIntroducedDay,
  }
}

/** Apply a rating to a review item, returning the *new* state. Pure — does
 *  not mutate `prev` and does not touch storage. Callers persist the result. */
export function applyRating(prev: ReviewState, rating: ReviewRating, config: SchedulerConfig, now = Date.now()): ReviewState {
  return step(rating, prev, config, now)
}

/** Preview what each of the four ratings would do, for an optional
 *  "this will come back in..." hint under the rating buttons. */
export function forecastRatings(prev: ReviewState, config: SchedulerConfig, now = Date.now()): RatingForecast[] {
  return (['again', 'hard', 'good', 'easy'] as ReviewRating[]).map((rating) => {
    const next = step(rating, prev, config, now)
    return { rating, dueAt: next.dueAt, intervalDays: next.intervalDays, state: next.state }
  })
}

export function isDue(item: ReviewState, now = Date.now()): boolean {
  return !item.suspended && item.dueAt <= now
}

export function introducedToday(item: ReviewState, now = Date.now()): boolean {
  return item.lastIntroducedDay === localDayKey(now)
}

/** Human-friendly interval text ("10 min", "3 days", "2 mo") for review UI. */
export function describeInterval(fromMs: number, toMs: number): string {
  const delta = Math.max(0, toMs - fromMs)
  if (delta < MINUTE) return 'now'
  if (delta < 3_600_000) return `${Math.round(delta / MINUTE)} min`
  if (delta < DAY) return `${Math.round(delta / 3_600_000)} hr`
  const days = Math.round(delta / DAY)
  if (days < 30) return `${days} day${days === 1 ? '' : 's'}`
  const months = Math.max(1, Math.round(days / 30))
  return `${months} mo`
}
