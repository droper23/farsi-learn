import { db } from '../storage/db'
import { getDueSummary, getOrCreateReviewState, getReviewStates, getSchedulerConfig } from '../storage/progressRepo'
import type { ReviewState, RatingForecast } from '../srs/types'
import { DEFAULT_SCHEDULER_CONFIG } from '../srs/types'
import { forecastRatings } from '../srs/scheduler'
import type { ReviewableKind, VocabCategory, VocabItem, AlphabetLetter } from '../content/types'
import { allUnitsSorted, findUnit } from '../content/curriculum'
import type { Unit } from '../content/types'
import { findLetter } from '../content/alphabet'
import { findVocab, vocabulary } from '../content/vocabulary'
import { findGrammarConcept, grammar } from '../content/grammar'
import { findSentence, sentences } from '../content/sentences'
import { findPassage } from '../content/passages'
import { hasConjugableStems, hasRegularPresent, type ConjugationTense } from './conjugation'
import type { Exercise } from './exercises/types'
import {
  generateVocabMcq, generateVocabTypeAnswer, generateVocabMatching, generateVocabListening,
  generateLetterSoundMcq, generateLetterNameMcq, generateLetterPositionMcq, generateLetterWordMatching,
  generateSentenceWordOrder, generateSentenceTranslationMcq, generateSentenceFillBlank,
  generateSentenceListening, generateCustomMcq, generateCustomTypeAnswer,
  generatePassageComprehensionMcq, generateConjugationMcq, generateConjugationTypeAnswer,
  generateGrammarRuleMcq,
  type ExerciseDifficultyHint,
} from './exercises/generator'

export interface TeachCard {
  step: 'teach'
  contentType: ReviewableKind | 'passage'
  id: string
}
export interface ExerciseStep {
  step: 'exercise'
  exercise: Exercise
}
export type LessonStep = TeachCard | ExerciseStep

// ---------------------------------------------------------------------------
// Curriculum progress
// ---------------------------------------------------------------------------

/** Returns the first unit with an incomplete lesson, or `null` once every
 *  unit in the curriculum is done — callers must render a genuine
 *  "curriculum complete" state rather than naming a stale unit. */
export async function getCurrentUnit(): Promise<Unit | null> {
  const progress = await db.unitProgress.toArray()
  const progressById = new Map(progress.map((p) => [p.unitId, p]))
  for (const unit of allUnitsSorted) {
    const p = progressById.get(unit.id)
    if (!p || p.lessonsCompleted < unit.lessonCount) return unit
  }
  return null
}

export async function getLessonsCompleted(unitId: string): Promise<number> {
  const p = await db.unitProgress.get(unitId)
  return p?.lessonsCompleted ?? 0
}

export async function markLessonComplete(unitId: string): Promise<void> {
  const existing = await db.unitProgress.get(unitId)
  const lessonsCompleted = (existing?.lessonsCompleted ?? 0) + 1
  await db.unitProgress.put({ unitId, lessonsCompleted, updatedAt: Date.now() })
}

export async function isUnitComplete(unit: Unit): Promise<boolean> {
  return (await getLessonsCompleted(unit.id)) >= unit.lessonCount
}

function chunk<T>(items: T[], parts: number, index: number): T[] {
  if (items.length === 0 || parts <= 0) return []
  const size = Math.ceil(items.length / parts)
  return items.slice(index * size, index * size + size)
}

/** Splits a unit's content pool into `unit.lessonCount` roughly-even
 *  sittings and returns the ids belonging to lesson `lessonIndex`. */
export function contentForLesson(unit: Unit, lessonIndex: number) {
  return {
    alphabetIds: chunk(unit.alphabetIds ?? [], unit.lessonCount, lessonIndex),
    vocabIds: chunk(unit.vocabIds ?? [], unit.lessonCount, lessonIndex),
    grammarConceptIds: chunk(unit.grammarConceptIds ?? [], unit.lessonCount, lessonIndex),
    sentenceIds: chunk(unit.sentenceIds ?? [], unit.lessonCount, lessonIndex),
    passageIds: chunk(unit.passageIds ?? [], unit.lessonCount, lessonIndex),
  }
}

// ---------------------------------------------------------------------------
// Exercise generation per reviewable
// ---------------------------------------------------------------------------

function difficultyFor(state: ReviewState): ExerciseDifficultyHint {
  if (state.state === 'new' || state.lapseCount > 0) return 'scaffolded'
  if (state.state === 'review' && state.reviewCount >= 3 && state.easeFactor >= 2.3) return 'production'
  return 'standard'
}

/** Generates one exercise for a reviewable item. Async because 'custom'
 *  items (learner-authored saved words with no vocabId) live in Dexie, not
 *  the static content model — every other kind resolves synchronously
 *  under the hood, but the function is uniformly async so callers (which
 *  are already inside async session-building functions) don't need to
 *  special-case it. */
export async function exerciseForReviewable(kind: ReviewableKind, itemId: string, difficulty: ExerciseDifficultyHint): Promise<Exercise | null> {
  if (kind === 'vocab') {
    const item = findVocab(itemId)
    if (!item) return null
    // Conjugation drills: only for verbs with recorded stems, only outside
    // brand-new ("scaffolded") practice — conjugating a verb the learner
    // just met for the first time is too big a jump. بودن's present tense
    // is excluded (irregular copula, outside the fully rule-based system —
    // see lib/conjugation.ts); its past tense is regular and still used.
    if (difficulty !== 'scaffolded' && hasConjugableStems(item) && Math.random() < 0.35) {
      const canPresent = hasRegularPresent(item)
      const tense: ConjugationTense = canPresent && Math.random() < 0.5 ? 'present' : 'past'
      return difficulty === 'production' && Math.random() < 0.5
        ? generateConjugationTypeAnswer(item, tense)
        : generateConjugationMcq(item, tense)
    }
    // Listening comprehension is only offered outside brand-new ("scaffolded")
    // practice, where the learner hasn't seen the word's sound/spelling yet —
    // it needs at least one prior exposure to be a fair recognition test.
    if (difficulty !== 'scaffolded' && Math.random() < 0.15) return generateVocabListening(item)
    const direction = Math.random() < 0.5 ? 'fa-en' : 'en-fa'
    return difficulty === 'production' && Math.random() < 0.6
      ? generateVocabTypeAnswer(item, direction)
      : generateVocabMcq(item, direction)
  }
  if (kind === 'custom') {
    const saved = await db.savedItems.get(itemId)
    if (!saved) return null
    const direction: 'fa-en' | 'en-fa' = Math.random() < 0.5 ? 'fa-en' : 'en-fa'
    return difficulty === 'production' && Math.random() < 0.6
      ? generateCustomTypeAnswer(saved, direction)
      : generateCustomMcq(saved, direction)
  }
  if (kind === 'alphabet') {
    const letter = findLetter(itemId)
    if (!letter) return null
    const roll = Math.random()
    if (roll < 0.4) return generateLetterSoundMcq(letter)
    if (roll < 0.7) return generateLetterNameMcq(letter)
    return generateLetterPositionMcq(letter)
  }
  if (kind === 'sentence') {
    const sentence = findSentence(itemId)
    if (!sentence) return null
    if (difficulty !== 'scaffolded' && Math.random() < 0.25) return generateSentenceListening(sentence, sentences)
    if (difficulty === 'production') return generateSentenceWordOrder(sentence)
    return generateSentenceFillBlank(sentence) ?? generateSentenceTranslationMcq(sentence, sentences)
  }
  // grammar concepts are drilled through their example sentences, plus
  // (outside brand-new "scaffolded" practice) a direct "which sentence
  // demonstrates this rule" self-check — see generateGrammarRuleMcq.
  const concept = findGrammarConcept(itemId)
  if (!concept || concept.exampleSentenceIds.length === 0) return null
  if (difficulty !== 'scaffolded' && Math.random() < 0.3) {
    const ruleMcq = generateGrammarRuleMcq(concept, grammar)
    if (ruleMcq) return ruleMcq
  }
  const sentenceId = concept.exampleSentenceIds[Math.floor(Math.random() * concept.exampleSentenceIds.length)]
  const sentence = findSentence(sentenceId)
  if (!sentence) return null
  return generateSentenceFillBlank(sentence) ?? generateSentenceTranslationMcq(sentence, sentences)
}

/** What each of the four ratings would do to this item's next-due date, for
 *  the "Next review: ~X" line shown after grading (review M2 — the
 *  scheduler was previously invisible to learners: forecastRatings existed
 *  but had no caller). Reuses getOrCreateReviewState so it's safe to call
 *  even for an item whose state hasn't been touched yet this session. */
export async function forecastForReviewable(kind: ReviewableKind, itemId: string, now = Date.now()): Promise<RatingForecast[]> {
  const [state, config] = await Promise.all([
    getOrCreateReviewState(kind, itemId, now),
    getSchedulerConfig(),
  ])
  return forecastRatings(state, config, now)
}

// ---------------------------------------------------------------------------
// Review session (pure SRS queue, no new material)
// ---------------------------------------------------------------------------

export async function buildReviewExercises(limit = 30): Promise<Exercise[]> {
  const { learningDue, reviewDue } = await getDueSummary()
  const due = [...learningDue, ...reviewDue].slice(0, limit)
  const exercises: Exercise[] = []
  for (const state of due) {
    const ex = await exerciseForReviewable(state.kind, state.itemId, difficultyFor(state))
    if (ex) exercises.push(ex)
  }
  return exercises
}

// ---------------------------------------------------------------------------
// Focused study (Pass 4) — practice outside the due-date schedule.
//
// Review today is 100% due-date-gated (buildReviewExercises above only
// ever looks at getDueSummary's learningDue/reviewDue). `lapseCount` and
// `easeFactor` already exist on every ReviewState and already bias
// due-queue *ordering* (see getDueSummary), but nothing lets a learner
// proactively study "the stuff I keep getting wrong" or "just this topic"
// ahead of its actual due date. This reads only existing reviewStates —
// no new Dexie tables, no change to the SRS scheduler itself (answering
// still calls the normal recordReview/applyRating path).
// ---------------------------------------------------------------------------

export type FocusedFilter = 'weak' | 'category' | 'unit'

export interface FocusedSessionOptions {
  /** Restrict to one reviewable kind (e.g. only vocab). Omit for all kinds. */
  kind?: ReviewableKind
  filterBy: FocusedFilter
  /** Required when filterBy is 'category' — matched against vocab/custom
   *  items' resolved category (letters/grammar/sentences have no vocab
   *  category, so they're excluded from a category-filtered session). */
  category?: VocabCategory
  /** Required when filterBy is 'unit' — practice any already-taught item
   *  from a specific unit, regardless of curriculum order or due dates
   *  (the Practice tab's "practice any lesson" entry point). */
  unitId?: string
  limit?: number
}

/** Every reviewable id a unit teaches, across all its content kinds
 *  (including the sentences inside any passages it references) — same
 *  "flat cross-kind id set" shape used by mastery.ts totalTeachableItemIds. */
function unitReviewableIds(unit: Unit): Set<string> {
  const ids = new Set<string>()
  for (const id of unit.alphabetIds ?? []) ids.add(`alphabet:${id}`)
  for (const id of unit.vocabIds ?? []) ids.add(`vocab:${id}`)
  for (const id of unit.grammarConceptIds ?? []) ids.add(`grammar:${id}`)
  for (const id of unit.sentenceIds ?? []) ids.add(`sentence:${id}`)
  for (const pid of unit.passageIds ?? []) {
    for (const sid of findPassage(pid)?.sentenceIds ?? []) ids.add(`sentence:${sid}`)
  }
  return ids
}

/** "Weak" = has lapsed at least once, is currently relearning, or has an
 *  ease factor pulled below the starting default — the same signal
 *  getDueSummary already uses to prioritize *within* the due queue, just
 *  applied here without the due-date gate. */
function isWeak(state: ReviewState): boolean {
  return state.lapseCount > 0 || state.state === 'relearning' || state.easeFactor < DEFAULT_SCHEDULER_CONFIG.startingEase
}

function stateVocabCategory(state: ReviewState): VocabCategory | null {
  if (state.kind === 'vocab') return findVocab(state.itemId)?.category ?? null
  return null
}

export async function buildFocusedSession(options: FocusedSessionOptions): Promise<Exercise[]> {
  const { kind, filterBy, category, unitId, limit = 20 } = options
  let states = await getReviewStates(kind)
  states = states.filter((s) => !s.suspended && s.state !== 'new')

  if (filterBy === 'weak') {
    states = states.filter(isWeak)
    // Weakest first: most lapses, then lowest ease — surfaces the most
    // struggled-with items at the top of the session.
    states.sort((a, b) => b.lapseCount - a.lapseCount || a.easeFactor - b.easeFactor)
  } else if (filterBy === 'unit') {
    const unit = unitId ? findUnit(unitId) : undefined
    const ids = unit ? unitReviewableIds(unit) : new Set<string>()
    states = states.filter((s) => ids.has(`${s.kind}:${s.itemId}`))
  } else {
    states = category ? states.filter((s) => stateVocabCategory(s) === category) : []
  }

  const chosen = states.slice(0, limit)
  const exercises: Exercise[] = []
  for (const state of chosen) {
    const ex = await exerciseForReviewable(state.kind, state.itemId, 'standard')
    if (ex) exercises.push(ex)
  }
  return exercises
}

function shuffled<T>(items: T[]): T[] {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/** Writing practice (Practice tab): a session of nothing but "type the
 *  Persian" production exercises — the closest thing this app has to
 *  handwriting practice, since it's a browser app with no stylus/stroke
 *  input. Deliberately narrower than buildFocusedSession: it forces the
 *  en→fa typing direction on every item instead of letting
 *  exerciseForReviewable randomly pick a recognition (MCQ/listening)
 *  exercise, which is the whole point of a dedicated writing mode. Only
 *  vocab/custom items have a real "type the Persian" generator today —
 *  sentences' only production-shaped generator is word-order (arranging
 *  given words, not typing), so they're excluded rather than mislabeled
 *  as writing practice. */
export async function buildWritingPractice(limit = 20): Promise<Exercise[]> {
  const states = (await getReviewStates()).filter(
    (s) => !s.suspended && s.state !== 'new' && (s.kind === 'vocab' || s.kind === 'custom'),
  )
  const chosen = shuffled(states).slice(0, limit)

  const exercises: Exercise[] = []
  for (const state of chosen) {
    if (state.kind === 'vocab') {
      const item = findVocab(state.itemId)
      if (item) exercises.push(generateVocabTypeAnswer(item, 'en-fa'))
    } else {
      const saved = await db.savedItems.get(state.itemId)
      if (saved) exercises.push(generateCustomTypeAnswer(saved, 'en-fa'))
    }
  }
  return exercises
}

// ---------------------------------------------------------------------------
// Lesson session (teach + practice for the next unfinished lesson)
// ---------------------------------------------------------------------------

export interface LessonPlan {
  unit: Unit
  lessonIndex: number
  lessonNumber: number
  totalLessons: number
  steps: LessonStep[]
}

/** Builds the next unfinished lesson for a unit. Pass `unitId` to jump
 *  straight into any unit's lessons regardless of curriculum order —
 *  learners aren't required to finish earlier units first; omit it to use
 *  the recommended current unit (the dashboard's default "keep going"
 *  path). Either way, lessons within the chosen unit still resume from
 *  wherever that unit's own progress left off. */
export async function buildNextLesson(unitId?: string): Promise<LessonPlan | null> {
  const unit = (unitId && findUnit(unitId)) || (await getCurrentUnit())
  if (!unit) return null
  const lessonIndex = await getLessonsCompleted(unit.id)
  if (lessonIndex >= unit.lessonCount) return null
  const content = contentForLesson(unit, lessonIndex)

  const steps: LessonStep[] = []
  const now = Date.now()

  for (const id of content.alphabetIds) {
    steps.push({ step: 'teach', contentType: 'alphabet', id })
    await getOrCreateReviewState('alphabet', id, now)
  }
  for (const id of content.vocabIds) {
    steps.push({ step: 'teach', contentType: 'vocab', id })
    await getOrCreateReviewState('vocab', id, now)
  }
  for (const id of content.grammarConceptIds) {
    steps.push({ step: 'teach', contentType: 'grammar', id })
    await getOrCreateReviewState('grammar', id, now)
  }
  for (const id of content.sentenceIds) {
    steps.push({ step: 'teach', contentType: 'sentence', id })
    await getOrCreateReviewState('sentence', id, now)
  }
  // Reading passages (Level 6): one teach card shows the whole passage (its
  // sentences are already individually SRS-tracked below), followed by its
  // comprehension-check questions as extra practice.
  for (const id of content.passageIds) {
    const passage = findPassage(id)
    if (!passage) continue
    steps.push({ step: 'teach', contentType: 'passage', id })
    for (const sid of passage.sentenceIds) {
      await getOrCreateReviewState('sentence', sid, now)
    }
  }

  // Practice: one pass over everything just taught, scaffolded difficulty.
  const allTaught: Array<{ kind: ReviewableKind; id: string }> = [
    ...content.alphabetIds.map((id) => ({ kind: 'alphabet' as const, id })),
    ...content.vocabIds.map((id) => ({ kind: 'vocab' as const, id })),
    ...content.grammarConceptIds.map((id) => ({ kind: 'grammar' as const, id })),
    ...content.sentenceIds.map((id) => ({ kind: 'sentence' as const, id })),
    ...content.passageIds.flatMap((id) => (findPassage(id)?.sentenceIds ?? []).map((sid) => ({ kind: 'sentence' as const, id: sid }))),
  ]
  for (const { kind, id } of allTaught) {
    const ex = await exerciseForReviewable(kind, id, 'scaffolded')
    if (ex) steps.push({ step: 'exercise', exercise: ex })
  }

  // Comprehension-check questions for any passages just taught.
  for (const id of content.passageIds) {
    const passage = findPassage(id)
    if (!passage) continue
    for (const q of passage.comprehensionQuestions) {
      steps.push({ step: 'exercise', exercise: generatePassageComprehensionMcq(passage.id, q) })
    }
  }

  // Matching exercises are a strong fit for a batch of freshly-introduced
  // vocab (drilling fa<->en recognition across the whole group at once) but
  // a poor fit for review sessions, where every exercise needs to carry a
  // single `reviewable` ref so its result can update that one item's SRS
  // state — a matching exercise covers several items with no way to
  // attribute a pass/fail to any one of them. So: only new-vocab lesson
  // practice gets matching, in batches of 4-6, and only as *extra* practice
  // on top of (not instead of) the per-item exercises above, which still do
  // the SRS bookkeeping. Review-session rotation deliberately stays
  // MCQ/type-answer/word-order/fill-blank/listening, unchanged.
  const newVocabItems = content.vocabIds.map(findVocab).filter((v): v is VocabItem => !!v)
  for (let i = 0; i < newVocabItems.length; i += 6) {
    const batch = newVocabItems.slice(i, i + 6)
    if (batch.length >= 4) steps.push({ step: 'exercise', exercise: generateVocabMatching(batch) })
  }

  // Same batched-matching treatment for freshly-introduced alphabet letters
  // (see comment above) — a letter-to-a-word-that-starts-with-it drill,
  // previously an authored-but-unused generator (review M7).
  const newLetters = content.alphabetIds.map(findLetter).filter((l): l is AlphabetLetter => !!l)
  for (let i = 0; i < newLetters.length; i += 6) {
    const batch = newLetters.slice(i, i + 6)
    if (batch.length >= 4) steps.push({ step: 'exercise', exercise: generateLetterWordMatching(batch) })
  }

  return { unit, lessonIndex, lessonNumber: lessonIndex + 1, totalLessons: unit.lessonCount, steps }
}

// ---------------------------------------------------------------------------
// Combined "what to do now" summary for the dashboard
// ---------------------------------------------------------------------------

export interface TodaySummary {
  reviewsDue: number
  hasLesson: boolean
  /** `null` once every curriculum unit is complete. */
  currentUnit: Unit | null
  lessonNumber: number
  totalLessons: number
  newItemsToday: number
  newItemsCap: number
}

export async function getTodaySummary(): Promise<TodaySummary> {
  const [{ learningDue, reviewDue, introducedTodayCount }, unit, config] = await Promise.all([
    getDueSummary(), getCurrentUnit(), getSchedulerConfig(),
  ])
  const lessonIndex = unit ? await getLessonsCompleted(unit.id) : 0
  return {
    reviewsDue: learningDue.length + reviewDue.length,
    hasLesson: unit ? lessonIndex < unit.lessonCount : false,
    currentUnit: unit,
    lessonNumber: lessonIndex + 1,
    totalLessons: unit?.lessonCount ?? 0,
    newItemsToday: introducedTodayCount,
    newItemsCap: config.newItemsPerDay,
  }
}

export { findUnit }
export const totalVocabCount = vocabulary.length
