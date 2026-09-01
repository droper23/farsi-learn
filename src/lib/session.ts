import { db } from '../storage/db'
import { getDueSummary, getOrCreateReviewState, getSchedulerConfig } from '../storage/progressRepo'
import type { ReviewState } from '../srs/types'
import type { ReviewableKind } from '../content/types'
import { allUnitsSorted, findUnit } from '../content/curriculum'
import type { Unit } from '../content/types'
import { findLetter } from '../content/alphabet'
import { findVocab, vocabulary } from '../content/vocabulary'
import { findGrammarConcept } from '../content/grammar'
import { findSentence, sentences } from '../content/sentences'
import type { Exercise } from './exercises/types'
import {
  generateVocabMcq, generateVocabTypeAnswer, generateLetterSoundMcq, generateLetterNameMcq,
  generateLetterPositionMcq, generateSentenceWordOrder, generateSentenceTranslationMcq,
  generateSentenceFillBlank, type ExerciseDifficultyHint,
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

export function exerciseForReviewable(kind: ReviewableKind, itemId: string, difficulty: ExerciseDifficultyHint): Exercise | null {
  if (kind === 'vocab') {
    const item = findVocab(itemId)
    if (!item) return null
    const direction = Math.random() < 0.5 ? 'fa-en' : 'en-fa'
    return difficulty === 'production' && Math.random() < 0.6
      ? generateVocabTypeAnswer(item, direction)
      : generateVocabMcq(item, direction)
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
    const ex = exerciseForReviewable(state.kind, state.itemId, difficultyFor(state))
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

  // Practice: two passes over everything just taught, scaffolded difficulty.
  const allTaught: Array<{ kind: ReviewableKind; id: string }> = [
    ...content.alphabetIds.map((id) => ({ kind: 'alphabet' as const, id })),
    ...content.vocabIds.map((id) => ({ kind: 'vocab' as const, id })),
    ...content.grammarConceptIds.map((id) => ({ kind: 'grammar' as const, id })),
    ...content.sentenceIds.map((id) => ({ kind: 'sentence' as const, id })),
  ]
  for (const { kind, id } of allTaught) {
    const ex = exerciseForReviewable(kind, id, 'scaffolded')
    if (ex) steps.push({ step: 'exercise', exercise: ex })
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
  const [{ learningDue, reviewDue }, unit, config] = await Promise.all([
    getDueSummary(), getCurrentUnit(), getSchedulerConfig(),
  ])
  const lessonIndex = await getLessonsCompleted(unit.id)
  return {
    reviewsDue: learningDue.length + reviewDue.length,
    hasLesson: lessonIndex < unit.lessonCount,
    currentUnit: unit,
    lessonNumber: lessonIndex + 1,
    totalLessons: unit.lessonCount,
    newItemsToday: 0,
    newItemsCap: config.newItemsPerDay,
  }
}

export { findUnit }
export const totalVocabCount = vocabulary.length
