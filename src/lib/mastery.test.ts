import { describe, expect, it } from 'vitest'
import {
  categoryProgress, letterMasteryLevel, letterMastery, studiedDaysInMonth, daysInMonth,
  totalTeachableItemIds, estimateDaysToFinish, isMastered, MASTERED_INTERVAL_DAYS,
} from './mastery'
import type { VocabItem, AlphabetLetter, Unit } from '../content/types'
import type { ReviewState } from '../srs/types'

function state(overrides: Partial<ReviewState>): ReviewState {
  return {
    key: 'vocab:x', kind: 'vocab', itemId: 'x', state: 'new', dueAt: 0, intervalDays: 0,
    easeFactor: 2.5, reviewCount: 0, lapseCount: 0, learningStepIndex: 0, createdAt: 0, updatedAt: 0,
    ...overrides,
  }
}

function vocab(id: string, category: VocabItem['category']): VocabItem {
  return { id, fa: 'س', translit: 's', en: 'x', pos: 'noun', category, register: 'neutral', frequency: 1, level: 1, confidence: 'high-confidence' }
}

describe('isMastered (M1 — single shared definition)', () => {
  it('is true for a review-state item at or above the mastered interval', () => {
    expect(isMastered(state({ state: 'review', intervalDays: MASTERED_INTERVAL_DAYS }))).toBe(true)
    expect(isMastered(state({ state: 'review', intervalDays: MASTERED_INTERVAL_DAYS + 10 }))).toBe(true)
  })

  it('is false below the interval, for non-review states, and for undefined', () => {
    expect(isMastered(state({ state: 'review', intervalDays: MASTERED_INTERVAL_DAYS - 1 }))).toBe(false)
    expect(isMastered(state({ state: 'learning', intervalDays: 999 }))).toBe(false)
    expect(isMastered(undefined)).toBe(false)
  })

  it('agrees with letterMasteryLevel and categoryProgress on the same boundary — the two screens (Stats, Profile) that display a "mastered" count must never disagree', () => {
    const boundary = state({ state: 'review', intervalDays: MASTERED_INTERVAL_DAYS })
    expect(isMastered(boundary)).toBe(true)
    expect(letterMasteryLevel(boundary)).toBe('mastered')
    const vocabulary = [vocab('a', 'food')]
    const result = categoryProgress(vocabulary, [{ ...boundary, kind: 'vocab', itemId: 'a', key: 'vocab:a' }])
    expect(result[0].mastered).toBe(1)
  })
})

describe('suspended items excluded from progress (H3)', () => {
  it('categoryProgress does not count a suspended vocab item as introduced or mastered', () => {
    const vocabulary = [vocab('a', 'food')]
    const suspendedMastered = state({
      kind: 'vocab', itemId: 'a', key: 'vocab:a', state: 'review', intervalDays: 30, suspended: true,
    })
    const result = categoryProgress(vocabulary, [suspendedMastered])
    expect(result[0]).toEqual({ category: 'food', total: 1, introduced: 0, mastered: 0 })
  })

  it('letterMasteryLevel/letterMastery treat a suspended letter as not-started', () => {
    const suspended = state({ kind: 'alphabet', itemId: 'alef', key: 'alphabet:alef', state: 'review', intervalDays: 30, suspended: true })
    expect(letterMasteryLevel(suspended)).toBe('mastered') // the raw state itself is unaffected
    const alphabet = [{ id: 'alef', order: 1 } as AlphabetLetter]
    const result = letterMastery(alphabet, [suspended])
    expect(result[0].level).toBe('not-started') // but excluded once looked up through the reviewStates list
  })
})

describe('categoryProgress', () => {
  it('counts totals, introduced, and mastered per category', () => {
    const vocabulary = [vocab('a', 'food'), vocab('b', 'food'), vocab('c', 'work')]
    const reviewStates = [
      state({ kind: 'vocab', itemId: 'a', key: 'vocab:a', state: 'review', intervalDays: 30 }),
      state({ kind: 'vocab', itemId: 'b', key: 'vocab:b', state: 'learning', intervalDays: 0 }),
    ]
    const result = categoryProgress(vocabulary, reviewStates)
    const food = result.find((r) => r.category === 'food')!
    const work = result.find((r) => r.category === 'work')!
    expect(food).toEqual({ category: 'food', total: 2, introduced: 2, mastered: 1 })
    expect(work).toEqual({ category: 'work', total: 1, introduced: 0, mastered: 0 })
  })
})

describe('letterMasteryLevel', () => {
  it('classifies undefined as not-started', () => {
    expect(letterMasteryLevel(undefined)).toBe('not-started')
  })
  it('classifies a fresh new state as not-started', () => {
    expect(letterMasteryLevel(state({ state: 'new' }))).toBe('not-started')
  })
  it('classifies learning/relearning as introduced', () => {
    expect(letterMasteryLevel(state({ state: 'learning' }))).toBe('introduced')
    expect(letterMasteryLevel(state({ state: 'relearning' }))).toBe('introduced')
  })
  it('classifies a short-interval review as review', () => {
    expect(letterMasteryLevel(state({ state: 'review', intervalDays: 5 }))).toBe('review')
  })
  it('classifies a long-interval review as mastered', () => {
    expect(letterMasteryLevel(state({ state: 'review', intervalDays: 30 }))).toBe('mastered')
  })
})

describe('letterMastery', () => {
  it('returns one row per letter, sorted by alphabet order', () => {
    const alphabet: AlphabetLetter[] = [
      { id: 'be', order: 2, name: 'Be', nameFa: 'ب', forms: { isolated: 'ب', initial: 'ب', medial: 'ب', final: 'ب' }, joinsNext: true, transliteration: 'b', soundDescription: '', englishSoundHint: '', exampleWords: [{ fa: 'ب', translit: 'b', en: 'b' }], category: 'consonant', confidence: 'high-confidence' },
      { id: 'alef', order: 1, name: 'Alef', nameFa: 'ا', forms: { isolated: 'ا', initial: 'ا', medial: 'ا', final: 'ا' }, joinsNext: false, transliteration: 'a', soundDescription: '', englishSoundHint: '', exampleWords: [{ fa: 'ا', translit: 'a', en: 'a' }], category: 'vowel-letter', confidence: 'high-confidence' },
    ]
    const reviewStates = [state({ kind: 'alphabet', itemId: 'alef', key: 'alphabet:alef', state: 'review', intervalDays: 30 })]
    const result = letterMastery(alphabet, reviewStates)
    expect(result.map((r) => r.letter.id)).toEqual(['alef', 'be'])
    expect(result[0].level).toBe('mastered')
    expect(result[1].level).toBe('not-started')
  })
})

describe('studiedDaysInMonth / daysInMonth', () => {
  it('only counts events within the given month', () => {
    const anchor = new Date(2026, 7, 15) // August 2026
    const inMonth = new Date(2026, 7, 3).getTime()
    const outOfMonth = new Date(2026, 6, 30).getTime()
    const days = studiedDaysInMonth([inMonth, outOfMonth], anchor)
    expect(days.has('2026-08-03')).toBe(true)
    expect(days.has('2026-07-30')).toBe(false)
  })

  it('daysInMonth returns every day key for the month', () => {
    const days = daysInMonth(new Date(2026, 1, 10)) // February 2026 (28 days, not a leap year)
    expect(days.length).toBe(28)
    expect(days[0]).toBe('2026-02-01')
    expect(days[27]).toBe('2026-02-28')
  })
})

describe('totalTeachableItemIds', () => {
  it('collects all referenced ids across units, including passage sentences', () => {
    const units: Unit[] = [
      { id: 'u1', level: 1, order: 1, title: 'U1', description: '', vocabIds: ['v1'], alphabetIds: ['a1'], lessonCount: 1 },
      { id: 'u2', level: 6, order: 2, title: 'U2', description: '', passageIds: ['p1'], lessonCount: 1 },
    ]
    const ids = totalTeachableItemIds(units, (pid) => (pid === 'p1' ? ['s1', 's2'] : []))
    expect(ids).toEqual(new Set(['vocab:v1', 'alphabet:a1', 'sentence:s1', 'sentence:s2']))
  })
})

describe('estimateDaysToFinish', () => {
  it('estimates remaining days from total/introduced/newItemsPerDay', () => {
    const total = new Set(['vocab:a', 'vocab:b', 'vocab:c', 'vocab:d'])
    const introduced = new Set(['vocab:a', 'vocab:b'])
    const estimate = estimateDaysToFinish(total, introduced, 1)
    expect(estimate).toEqual({ totalItems: 4, introducedItems: 2, remainingItems: 2, newItemsPerDay: 1, estimatedDays: 2 })
  })

  it('returns 0 estimated days once everything is introduced', () => {
    const total = new Set(['vocab:a'])
    const estimate = estimateDaysToFinish(total, new Set(['vocab:a']), 10)
    expect(estimate.estimatedDays).toBe(0)
  })

  it('returns null (cannot estimate) when newItemsPerDay is 0 and items remain', () => {
    const total = new Set(['vocab:a'])
    const estimate = estimateDaysToFinish(total, new Set(), 0)
    expect(estimate.estimatedDays).toBeNull()
  })
})
