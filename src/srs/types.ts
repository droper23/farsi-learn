import type { ReviewableKey, ReviewableKind } from '../content/types'

export type CardState = 'new' | 'learning' | 'review' | 'relearning'

export type ReviewRating = 'again' | 'hard' | 'good' | 'easy'

/** Persisted SRS state for one reviewable item (a letter, a word, a grammar
 *  concept, or a sentence). Mirrors the classic Anki/SM-2 field set — this
 *  shape is a direct, deliberate port of the scheduler proven out in the
 *  Danki iOS app, adapted to a single global config instead of per-deck
 *  config and to a flat cross-content-type key instead of a Flashcard row. */
export interface ReviewState {
  key: ReviewableKey
  kind: ReviewableKind
  itemId: string
  state: CardState
  dueAt: number
  intervalDays: number
  easeFactor: number
  reviewCount: number
  lapseCount: number
  learningStepIndex: number
  lastReviewedAt?: number
  /** Day (yyyy-mm-dd, local) a *new* item was first introduced, used to
   *  enforce "don't reintroduce this again today" without extra queries. */
  lastIntroducedDay?: string
  createdAt: number
  updatedAt: number
  suspended?: boolean
}

export interface SchedulerConfig {
  learningStepsMinutes: number[]
  relearningStepsMinutes: number[]
  graduatingIntervalDays: number
  easyIntervalDays: number
  startingEase: number
  easyBonus: number
  hardIntervalFactor: number
  /** Multiplier applied to the pre-lapse interval to seed the new interval
   *  after a card graduates back out of relearning. 0 = "start over". */
  lapseNewIntervalFactor: number
  minimumLapseIntervalDays: number
  minimumEase: number
  newItemsPerDay: number
  maxReviewsPerDay: number
}

export const DEFAULT_SCHEDULER_CONFIG: SchedulerConfig = {
  learningStepsMinutes: [1, 10],
  relearningStepsMinutes: [10],
  graduatingIntervalDays: 1,
  easyIntervalDays: 4,
  startingEase: 2.5,
  easyBonus: 1.3,
  hardIntervalFactor: 1.2,
  lapseNewIntervalFactor: 0.0,
  minimumLapseIntervalDays: 1,
  minimumEase: 1.3,
  newItemsPerDay: 15,
  maxReviewsPerDay: 150,
}

export interface RatingForecast {
  rating: ReviewRating
  dueAt: number
  intervalDays: number
  state: CardState
}
