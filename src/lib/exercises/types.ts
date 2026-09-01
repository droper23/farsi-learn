import type { ReviewableKind } from '../../content/types'

export interface ReviewableRef {
  kind: ReviewableKind
  itemId: string
}

export interface ExerciseOption {
  id: string
  fa?: string
  translit?: string
  en?: string
}

interface ExerciseBase {
  id: string
  reviewable?: ReviewableRef
  /** Short instruction shown above the prompt, e.g. "Choose the meaning". */
  instructions: string
  hints: string[]
}

export interface McqExercise extends ExerciseBase {
  kind: 'mcq'
  promptFa?: string
  promptTranslit?: string
  promptEn?: string
  options: ExerciseOption[]
  correctOptionId: string
}

export interface TypeAnswerExercise extends ExerciseBase {
  kind: 'type-answer'
  promptFa?: string
  promptTranslit?: string
  promptEn?: string
  answerLang: 'en' | 'fa'
  acceptedAnswers: string[]
}

export interface WordOrderExercise extends ExerciseBase {
  kind: 'word-order'
  promptEn: string
  words: Array<{ id: string; fa: string; translit: string }>
  correctOrder: string[]
}

export interface MatchingExercise extends ExerciseBase {
  kind: 'matching'
  pairs: Array<{ id: string; fa: string; translit: string; en: string }>
}

/** Listening comprehension: the learner hears a Persian word or sentence
 *  (via `speakPersian`) and picks its meaning. `audioText`/`audioTranslit`
 *  are only shown up front as a no-voice fallback (see `hasPersianVoice`)
 *  — showing them whenever a voice IS available would defeat the exercise. */
export interface ListeningExercise extends ExerciseBase {
  kind: 'listening'
  audioText: string
  audioTranslit: string
  options: ExerciseOption[]
  correctOptionId: string
}

export type Exercise = McqExercise | TypeAnswerExercise | WordOrderExercise | MatchingExercise | ListeningExercise

/** Structural shape needed to generate an exercise for a learner-authored
 *  saved entry (`SavedItem` with no `vocabId`) — kept storage-agnostic
 *  (lib/exercises never imports the storage layer) by matching just the
 *  fields generation actually needs. */
export interface CustomReviewableSource {
  id: string
  fa: string
  translit: string
  en: string
}

export type ExerciseResult = {
  exerciseId: string
  correct: boolean
  hintsUsed: number
  reviewable?: ReviewableRef
}
