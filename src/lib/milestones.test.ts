import { describe, expect, it } from 'vitest'
import { computeMilestones, newlyAchieved, type Milestone } from './milestones'
import type { Unit } from '../content/types'
import type { ReviewState } from '../srs/types'

function state(overrides: Partial<ReviewState>): ReviewState {
  return {
    key: 'vocab:x', kind: 'vocab', itemId: 'x', state: 'new', dueAt: 0, intervalDays: 0,
    easeFactor: 2.5, reviewCount: 0, lapseCount: 0, learningStepIndex: 0, createdAt: 0, updatedAt: 0,
    ...overrides,
  }
}

const units: Unit[] = [
  { id: 'u1a', level: 1, order: 1, title: 'A', description: '', lessonCount: 2 },
  { id: 'u1b', level: 1, order: 2, title: 'B', description: '', lessonCount: 1 },
  { id: 'u2a', level: 2, order: 3, title: 'C', description: '', lessonCount: 1 },
]

describe('computeMilestones', () => {
  it('marks nothing achieved with no data', () => {
    const milestones = computeMilestones({
      reviewStates: [], unitProgress: [], units, currentStreak: 0, longestStreak: 0, totalAlphabetLetters: 32,
    })
    expect(milestones.every((m) => !m.achieved)).toBe(true)
  })

  it('marks word-count milestones based on vocab reviewState count', () => {
    const reviewStates = Array.from({ length: 60 }, (_, i) => state({ kind: 'vocab', itemId: `v${i}`, key: `vocab:v${i}` }))
    const milestones = computeMilestones({ reviewStates, unitProgress: [], units, currentStreak: 0, longestStreak: 0, totalAlphabetLetters: 32 })
    expect(milestones.find((m) => m.id === 'words-50')!.achieved).toBe(true)
    expect(milestones.find((m) => m.id === 'words-100')!.achieved).toBe(false)
  })

  it('marks alphabet-mastered only when every letter has reached review/mastered', () => {
    const partial = Array.from({ length: 31 }, (_, i) => state({ kind: 'alphabet', itemId: `l${i}`, key: `alphabet:l${i}`, state: 'review', intervalDays: 30 }))
    const full = [...partial, state({ kind: 'alphabet', itemId: 'l31', key: 'alphabet:l31', state: 'review', intervalDays: 30 })]
    expect(computeMilestones({ reviewStates: partial, unitProgress: [], units, currentStreak: 0, longestStreak: 0, totalAlphabetLetters: 32 }).find((m) => m.id === 'alphabet-mastered')!.achieved).toBe(false)
    expect(computeMilestones({ reviewStates: full, unitProgress: [], units, currentStreak: 0, longestStreak: 0, totalAlphabetLetters: 32 }).find((m) => m.id === 'alphabet-mastered')!.achieved).toBe(true)
  })

  it('marks a level complete only when every unit in it has all lessons done', () => {
    const partial = computeMilestones({
      reviewStates: [], unitProgress: [{ unitId: 'u1a', lessonsCompleted: 2 }], units,
      currentStreak: 0, longestStreak: 0, totalAlphabetLetters: 32,
    })
    expect(partial.find((m) => m.id === 'level-1-complete')!.achieved).toBe(false)

    const complete = computeMilestones({
      reviewStates: [], unitProgress: [{ unitId: 'u1a', lessonsCompleted: 2 }, { unitId: 'u1b', lessonsCompleted: 1 }], units,
      currentStreak: 0, longestStreak: 0, totalAlphabetLetters: 32,
    })
    expect(complete.find((m) => m.id === 'level-1-complete')!.achieved).toBe(true)
    expect(complete.find((m) => m.id === 'level-2-complete')!.achieved).toBe(false)
  })

  it('uses the best of currentStreak/longestStreak for streak milestones', () => {
    const milestones = computeMilestones({
      reviewStates: [], unitProgress: [], units, currentStreak: 2, longestStreak: 30, totalAlphabetLetters: 32,
    })
    expect(milestones.find((m) => m.id === 'streak-7')!.achieved).toBe(true)
    expect(milestones.find((m) => m.id === 'streak-30')!.achieved).toBe(true)
    expect(milestones.find((m) => m.id === 'streak-100')!.achieved).toBe(false)
  })
})

describe('newlyAchieved', () => {
  it('returns only milestones that flipped from not-achieved to achieved', () => {
    const prev: Milestone[] = [
      { id: 'a', title: 'A', description: '', achieved: false },
      { id: 'b', title: 'B', description: '', achieved: true },
    ]
    const next: Milestone[] = [
      { id: 'a', title: 'A', description: '', achieved: true },
      { id: 'b', title: 'B', description: '', achieved: true },
    ]
    expect(newlyAchieved(prev, next).map((m) => m.id)).toEqual(['a'])
  })

  it('returns nothing when nothing newly flipped', () => {
    const prev: Milestone[] = [{ id: 'a', title: 'A', description: '', achieved: true }]
    const next: Milestone[] = [{ id: 'a', title: 'A', description: '', achieved: true }]
    expect(newlyAchieved(prev, next)).toEqual([])
  })
})
