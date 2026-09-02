import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../storage/db'
import { getOrCreateReviewState } from '../storage/progressRepo'
import { buildNextLesson, buildFocusedSession, buildWritingPractice, exerciseForReviewable, forecastForReviewable } from './session'
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

  it('does not add a vocab matching batch for a lesson with fewer than 4 new vocab items', async () => {
    // The very first lesson has no vocabIds at all, so it can never produce
    // a *vocab* matching exercise — there's no vocab to match.
    const plan = await buildNextLesson()
    expect(plan?.unit.id).toBe('u1-alphabet-1')
    const matchingSteps = (plan?.steps ?? []).filter(
      (s): s is Extract<typeof s, { step: 'exercise' }> => s.step === 'exercise' && s.exercise.kind === 'matching',
    )
    for (const s of matchingSteps) {
      const pairIds = s.exercise.kind === 'matching' ? s.exercise.pairs.map((p) => p.id) : []
      // Every pair id in this lesson's matching batch(es) should be one of
      // this lesson's alphabet ids, never a vocab id (there are none).
      expect(pairIds.every((id) => plan?.steps.some((t) => t.step === 'teach' && t.contentType === 'alphabet' && t.id === id))).toBe(true)
    }
  })

  it('adds an alphabet letter-matching batch (4-6 pairs) when a lesson introduces 4+ new letters with example words', async () => {
    // u1-alphabet-1's first lesson introduces 4 letters (11 letters / 3
    // lessons, chunked) — enough to clear the same 4-pair minimum used for
    // vocab matching (review M7: generateLetterWordMatching was previously
    // authored but never wired up).
    const plan = await buildNextLesson()
    expect(plan?.unit.id).toBe('u1-alphabet-1')
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
})

describe('direct unit access', () => {
  it('builds a lesson for any unit passed explicitly, with none of the earlier units complete', async () => {
    // No progress recorded anywhere — the current unit would default to
    // u1-alphabet-1 — but a learner should still be able to jump straight
    // into a much later unit without finishing everything before it.
    const plan = await buildNextLesson('u2-past-tense')
    expect(plan?.unit.id).toBe('u2-past-tense')
    expect(plan?.lessonIndex).toBe(0)
  })

  it('resumes the requested unit from its own progress, independent of the current unit', async () => {
    await db.unitProgress.put({ unitId: 'u2-past-tense', lessonsCompleted: 1, updatedAt: Date.now() })
    const plan = await buildNextLesson('u2-past-tense')
    expect(plan?.unit.id).toBe('u2-past-tense')
    expect(plan?.lessonIndex).toBe(1)
  })

  it('falls back to the current unit when no unitId is given', async () => {
    const plan = await buildNextLesson(undefined)
    expect(plan?.unit.id).toBe('u1-alphabet-1')
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

describe('forecastForReviewable (M2 — SRS legibility)', () => {
  it('returns one forecast per rating, each strictly due later than now for a brand-new item', async () => {
    const now = Date.now()
    const forecasts = await forecastForReviewable('vocab', 'greet-salam', now)
    expect(forecasts.map((f) => f.rating).sort()).toEqual(['again', 'easy', 'good', 'hard'])
    for (const f of forecasts) expect(f.dueAt).toBeGreaterThanOrEqual(now)
  })

  it('reflects the item\'s actual current state, not always a fresh "new" item', async () => {
    const now = Date.now()
    await getOrCreateReviewState('vocab', 'greet-salam', now)
    // Graduate the item into 'review' state first.
    const { recordReview } = await import('../storage/progressRepo')
    await recordReview('vocab', 'greet-salam', 'easy', true, now)

    const forecasts = await forecastForReviewable('vocab', 'greet-salam', now + 1000)
    const good = forecasts.find((f) => f.rating === 'good')!
    // Already graduated to 'review' with a multi-day interval — a 'good'
    // forecast should be more than a day out, not a few-minute learning step.
    expect(good.dueAt - (now + 1000)).toBeGreaterThan(20 * 60 * 60 * 1000)
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

  it('"unit" (Practice tab — practice any lesson) returns only already-taught items belonging to that unit', async () => {
    await db.reviewStates.bulkPut([
      // 'greet-salam' belongs to u1-greetings; 'num-1' does not.
      reviewState({ key: 'vocab:greet-salam', kind: 'vocab', itemId: 'greet-salam' }),
      reviewState({ key: 'vocab:num-1', kind: 'vocab', itemId: 'num-1' }),
    ])
    const exercises = await buildFocusedSession({ filterBy: 'unit', unitId: 'u1-greetings' })
    const itemIds = exercises.map((e) => e.reviewable?.itemId)
    expect(itemIds).toContain('greet-salam')
    expect(itemIds).not.toContain('num-1')
  })

  it('"unit" returns nothing for a unit with no reviewStates yet (not started)', async () => {
    const exercises = await buildFocusedSession({ filterBy: 'unit', unitId: 'u1-greetings' })
    expect(exercises).toEqual([])
  })

  it('onlyWeak narrows a unit-filtered session down to just the weak items in that unit (Practice tab: pick a unit, then "Weak spots")', async () => {
    await db.reviewStates.bulkPut([
      // both belong to u1-greetings; only one is weak.
      reviewState({ key: 'vocab:greet-salam', kind: 'vocab', itemId: 'greet-salam', lapseCount: 2 }),
      reviewState({ key: 'vocab:greet-khodahafez', kind: 'vocab', itemId: 'greet-khodahafez' }),
    ])
    const exercises = await buildFocusedSession({ filterBy: 'unit', unitId: 'u1-greetings', onlyWeak: true })
    const itemIds = exercises.map((e) => e.reviewable?.itemId)
    expect(itemIds).toContain('greet-salam')
    expect(itemIds).not.toContain('greet-khodahafez')
  })
})

describe('buildWritingPractice (Practice tab)', () => {
  it('forces the en→fa typing direction, ignoring letters/grammar/sentences', async () => {
    const now = Date.now()
    await db.reviewStates.bulkPut([
      { key: 'vocab:greet-salam', kind: 'vocab', itemId: 'greet-salam', state: 'review', dueAt: now, intervalDays: 10, easeFactor: 2.5, reviewCount: 3, lapseCount: 0, learningStepIndex: 0, createdAt: now, updatedAt: now },
      { key: 'alphabet:alef', kind: 'alphabet', itemId: 'alef', state: 'review', dueAt: now, intervalDays: 10, easeFactor: 2.5, reviewCount: 3, lapseCount: 0, learningStepIndex: 0, createdAt: now, updatedAt: now },
    ])
    const exercises = await buildWritingPractice()
    expect(exercises.length).toBe(1)
    expect(exercises[0].kind).toBe('type-answer')
    expect(exercises[0].reviewable).toEqual({ kind: 'vocab', itemId: 'greet-salam' })
    if (exercises[0].kind === 'type-answer') expect(exercises[0].answerLang).toBe('fa')
  })

  it('excludes suspended and never-introduced ("new") items', async () => {
    const now = Date.now()
    await db.reviewStates.bulkPut([
      { key: 'vocab:greet-salam', kind: 'vocab', itemId: 'greet-salam', state: 'review', dueAt: now, intervalDays: 10, easeFactor: 2.5, reviewCount: 3, lapseCount: 0, learningStepIndex: 0, createdAt: now, updatedAt: now, suspended: true },
      { key: 'vocab:num-1', kind: 'vocab', itemId: 'num-1', state: 'new', dueAt: now, intervalDays: 0, easeFactor: 2.5, reviewCount: 0, lapseCount: 0, learningStepIndex: 0, createdAt: now, updatedAt: now },
    ])
    expect(await buildWritingPractice()).toEqual([])
  })

  it('includes learner-authored custom saved words', async () => {
    const now = Date.now()
    await db.savedItems.add({ id: 'custom-1', fa: 'قلم', translit: 'ghalam', en: 'pen', createdAt: now })
    await db.reviewStates.put({ key: 'custom:custom-1', kind: 'custom', itemId: 'custom-1', state: 'review', dueAt: now, intervalDays: 10, easeFactor: 2.5, reviewCount: 3, lapseCount: 0, learningStepIndex: 0, createdAt: now, updatedAt: now })
    const exercises = await buildWritingPractice()
    expect(exercises.length).toBe(1)
    expect(exercises[0].reviewable).toEqual({ kind: 'custom', itemId: 'custom-1' })
  })

  it('scopes to one unit when unitId is given (Practice tab: pick a unit, then "Writing practice")', async () => {
    const now = Date.now()
    await db.reviewStates.bulkPut([
      // 'greet-salam' belongs to u1-greetings; 'num-1' does not.
      { key: 'vocab:greet-salam', kind: 'vocab', itemId: 'greet-salam', state: 'review', dueAt: now, intervalDays: 10, easeFactor: 2.5, reviewCount: 3, lapseCount: 0, learningStepIndex: 0, createdAt: now, updatedAt: now },
      { key: 'vocab:num-1', kind: 'vocab', itemId: 'num-1', state: 'review', dueAt: now, intervalDays: 10, easeFactor: 2.5, reviewCount: 3, lapseCount: 0, learningStepIndex: 0, createdAt: now, updatedAt: now },
    ])
    const exercises = await buildWritingPractice({ unitId: 'u1-greetings' })
    const itemIds = exercises.map((e) => e.reviewable?.itemId)
    expect(itemIds).toContain('greet-salam')
    expect(itemIds).not.toContain('num-1')
  })
})
