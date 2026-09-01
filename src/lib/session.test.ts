import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../storage/db'
import { getOrCreateReviewState } from '../storage/progressRepo'
import { buildNextLesson, buildFocusedSession, exerciseForReviewable } from './session'
import type { ReviewState } from '../srs/types'

beforeEach(async () => {
  await Promise.all([
    db.reviewStates.clear(), db.savedItems.clear(), db.learningEvents.clear(),
    db.unitProgress.clear(), db.settings.clear(),
  ])
})

describe('matching exercises in lesson rotation', () => {
  it('adds a matching batch (4-6 pairs) when a lesson introduces 4+ new vocab items', async () => {
    // Mark the three alphabet units complete so the next lesson is
    // "Vowels, Numbers & Reading" (u1-vowels-numbers), whose first lesson
    // introduces 6 new vocab items (11 items / 2 lessons, chunked).
    const now = Date.now()
    await db.unitProgress.bulkPut([
      { unitId: 'u1-alphabet-1', lessonsCompleted: 3, updatedAt: now },
      { unitId: 'u1-alphabet-2', lessonsCompleted: 3, updatedAt: now },
      { unitId: 'u1-alphabet-3', lessonsCompleted: 3, updatedAt: now },
    ])

    const plan = await buildNextLesson()
    expect(plan?.unit.id).toBe('u1-vowels-numbers')

    const matchingSteps = (plan?.steps ?? []).filter(
      (s): s is Extract<typeof s, { step: 'exercise' }> => s.step === 'exercise' && s.exercise.kind === 'matching',
    )
    expect(matchingSteps.length).toBeGreaterThan(0)
    for (const s of matchingSteps) {
      const pairs = s.exercise.kind === 'matching' ? s.exercise.pairs : []
      expect(pairs.length).toBeGreaterThanOrEqual(4)
      expect(pairs.length).toBeLessThanOrEqual(6)
    }
  })

  it('does not add a matching batch for a lesson with fewer than 4 new vocab items', async () => {
    // The very first lesson (alphabet only, no vocab) should never produce
    // a matching exercise — there's nothing to match.
    const plan = await buildNextLesson()
    expect(plan?.unit.id).toBe('u1-alphabet-1')
    const matchingSteps = (plan?.steps ?? []).filter((s) => s.step === 'exercise' && s.exercise.kind === 'matching')
    expect(matchingSteps.length).toBe(0)
  })
})

describe('full SRS integration for saved words (custom entries)', () => {
  it('generates a gradable exercise for a learner-authored saved entry', async () => {
    const now = Date.now()
    await db.savedItems.add({ id: 'custom-test-1', fa: 'قلم', translit: 'ghalam', en: 'pen', createdAt: now })
    await getOrCreateReviewState('custom', 'custom-test-1', now)

    const ex = await exerciseForReviewable('custom', 'custom-test-1', 'standard')
    expect(ex).toBeTruthy()
    expect(ex?.reviewable).toEqual({ kind: 'custom', itemId: 'custom-test-1' })
    if (ex?.kind === 'mcq') {
      expect(ex.options.length).toBe(4)
      expect(ex.options.some((o) => o.id === ex.correctOptionId)).toBe(true)
    } else if (ex?.kind === 'type-answer') {
      expect(ex.acceptedAnswers.length).toBeGreaterThan(0)
    }
  })

  it('returns null for a custom id with no matching saved item (deleted/unknown)', async () => {
    const ex = await exerciseForReviewable('custom', 'does-not-exist', 'standard')
    expect(ex).toBeNull()
  })
})

describe('buildFocusedSession', () => {
  const FAR_FUTURE = Date.now() + 1000 * 60 * 60 * 24 * 30 // 30 days out — deliberately NOT due

  function reviewState(overrides: Partial<ReviewState> & Pick<ReviewState, 'key' | 'kind' | 'itemId'>): ReviewState {
    const now = Date.now()
    return {
      state: 'review', dueAt: FAR_FUTURE, intervalDays: 30, easeFactor: 2.5,
      reviewCount: 3, lapseCount: 0, learningStepIndex: 0, createdAt: now, updatedAt: now,
      ...overrides,
    }
  }

  it('"weak" ignores due dates entirely and only returns items that have lapsed, are relearning, or have a below-default ease', async () => {
    await db.reviewStates.bulkPut([
      reviewState({ key: 'vocab:greet-salam', kind: 'vocab', itemId: 'greet-salam', lapseCount: 2 }),
      reviewState({ key: 'vocab:greet-khodahafez', kind: 'vocab', itemId: 'greet-khodahafez', easeFactor: 1.9 }),
      reviewState({ key: 'vocab:num-1', kind: 'vocab', itemId: 'num-1' }), // healthy — not weak
    ])

    const exercises = await buildFocusedSession({ filterBy: 'weak' })
    const itemIds = exercises.map((e) => e.reviewable?.itemId)
    expect(itemIds).toContain('greet-salam')
    expect(itemIds).toContain('greet-khodahafez')
    expect(itemIds).not.toContain('num-1')
  })

  it('"weak" orders the most-lapsed items first', async () => {
    await db.reviewStates.bulkPut([
      reviewState({ key: 'vocab:greet-salam', kind: 'vocab', itemId: 'greet-salam', lapseCount: 1 }),
      reviewState({ key: 'vocab:greet-khodahafez', kind: 'vocab', itemId: 'greet-khodahafez', lapseCount: 5 }),
    ])
    const exercises = await buildFocusedSession({ filterBy: 'weak' })
    expect(exercises[0]?.reviewable?.itemId).toBe('greet-khodahafez')
  })

  it('"category" returns only items whose vocab category matches, ignoring due dates', async () => {
    await db.reviewStates.bulkPut([
      reviewState({ key: 'vocab:greet-salam', kind: 'vocab', itemId: 'greet-salam' }), // category: greetings
      reviewState({ key: 'vocab:greet-khodahafez', kind: 'vocab', itemId: 'greet-khodahafez' }), // greetings
      reviewState({ key: 'vocab:num-1', kind: 'vocab', itemId: 'num-1' }), // numbers
    ])
    const exercises = await buildFocusedSession({ filterBy: 'category', category: 'greetings' })
    const itemIds = exercises.map((e) => e.reviewable?.itemId)
    expect(itemIds).toContain('greet-salam')
    expect(itemIds).toContain('greet-khodahafez')
    expect(itemIds).not.toContain('num-1')
  })

  it('excludes suspended items and items still in the "new" state', async () => {
    await db.reviewStates.bulkPut([
      reviewState({ key: 'vocab:greet-salam', kind: 'vocab', itemId: 'greet-salam', lapseCount: 3, suspended: true }),
      reviewState({ key: 'vocab:greet-khodahafez', kind: 'vocab', itemId: 'greet-khodahafez', lapseCount: 3, state: 'new' }),
    ])
    const exercises = await buildFocusedSession({ filterBy: 'weak' })
    expect(exercises.length).toBe(0)
  })

  it('every returned exercise is gradable (has a reviewable ref matching the source state)', async () => {
    await db.reviewStates.put(reviewState({ key: 'vocab:greet-salam', kind: 'vocab', itemId: 'greet-salam', lapseCount: 1 }))
    const exercises = await buildFocusedSession({ filterBy: 'weak' })
    expect(exercises.length).toBeGreaterThan(0)
    for (const ex of exercises) expect(ex.reviewable?.kind).toBe('vocab')
  })
})
