import { db } from '../storage/db'
import { getDueSummary, getOrCreateReviewState, getSchedulerConfig } from '../storage/progressRepo'
import type { ReviewState } from '../srs/types'
import type { ReviewableKind, VocabItem } from '../content/types'
import { allUnitsSorted, findUnit } from '../content/curriculum'
import type { Unit } from '../content/types'
import { findLetter } from '../content/alphabet'
import { findVocab, vocabulary } from '../content/vocabulary'
import { findGrammarConcept } from '../content/grammar'
import { findSentence, sentences } from '../content/sentences'
import type { Exercise } from './exercises/types'
import {
  generateVocabMcq, generateVocabTypeAnswer, generateVocabMatching, generateVocabListening,
  generateLetterSoundMcq, generateLetterNameMcq, generateLetterPositionMcq,
  generateSentenceWordOrder, generateSentenceTranslationMcq, generateSentenceFillBlank,
  generateSentenceListening, generateCustomMcq, generateCustomTypeAnswer,
  type ExerciseDifficultyHint,
} from './exercises/generator'

export interface TeachCard {
  step: 'teach'
  contentType: ReviewableKind
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

export async function getCurrentUnit(): Promise<Unit> {
  const progress = await db.unitProgress.toArray()
  const progressById = new Map(progress.map((p) => [p.unitId, p]))
  for (const unit of allUnitsSorted) {
    const p = progressById.get(unit.id)
    if (!p || p.lessonsCompleted < unit.lessonCount) return unit
  }
  return allUnitsSorted[allUnitsSorted.length - 1]
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
  // grammar concepts are drilled through their example sentences
  const concept = findGrammarConcept(itemId)
  if (!concept || concept.exampleSentenceIds.length === 0) return null
  const sentenceId = concept.exampleSentenceIds[Math.floor(Math.random() * concept.exampleSentenceIds.length)]
  const sentence = findSentence(sentenceId)
  if (!sentence) return null
  return generateSentenceFillBlank(sentence) ?? generateSentenceTranslationMcq(sentence, sentences)
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
// Lesson session (teach + practice for the next unfinished lesson)
// ---------------------------------------------------------------------------

export interface LessonPlan {
  unit: Unit
  lessonIndex: number
  lessonNumber: number
  totalLessons: number
  steps: LessonStep[]
}

export async function buildNextLesson(): Promise<LessonPlan | null> {
  const unit = await getCurrentUnit()
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

  // Practice: one pass over everything just taught, scaffolded difficulty.
  const allTaught: Array<{ kind: ReviewableKind; id: string }> = [
    ...content.alphabetIds.map((id) => ({ kind: 'alphabet' as const, id })),
    ...content.vocabIds.map((id) => ({ kind: 'vocab' as const, id })),
    ...content.grammarConceptIds.map((id) => ({ kind: 'grammar' as const, id })),
    ...content.sentenceIds.map((id) => ({ kind: 'sentence' as const, id })),
  ]
  for (const { kind, id } of allTaught) {
    const ex = await exerciseForReviewable(kind, id, 'scaffolded')
    if (ex) steps.push({ step: 'exercise', exercise: ex })
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

  return { unit, lessonIndex, lessonNumber: lessonIndex + 1, totalLessons: unit.lessonCount, steps }
}

// ---------------------------------------------------------------------------
// Combined "what to do now" summary for the dashboard
// ---------------------------------------------------------------------------

export interface TodaySummary {
  reviewsDue: number
  hasLesson: boolean
  currentUnit: Unit
  lessonNumber: number
  totalLessons: number
  newItemsToday: number
  newItemsCap: number
}

export async function getTodaySummary(): Promise<TodaySummary> {
  const [{ learningDue, reviewDue, introducedTodayCount }, unit, config] = await Promise.all([
    getDueSummary(), getCurrentUnit(), getSchedulerConfig(),
  ])
  const lessonIndex = await getLessonsCompleted(unit.id)
  return {
    reviewsDue: learningDue.length + reviewDue.length,
    hasLesson: lessonIndex < unit.lessonCount,
    currentUnit: unit,
    lessonNumber: lessonIndex + 1,
    totalLessons: unit.lessonCount,
    newItemsToday: introducedTodayCount,
    newItemsCap: config.newItemsPerDay,
  }
}

export { findUnit }
export const totalVocabCount = vocabulary.length
