import type { Exercise } from './types'
import type { RatingForecast } from '../../srs/types'
import { describeInterval } from '../../srs/scheduler'
import { englishAnswerMatches, persianTextsMatch } from '../persianText'

export function gradeMcq(exercise: Extract<Exercise, { kind: 'mcq' }>, selectedOptionId: string): boolean {
  return selectedOptionId === exercise.correctOptionId
}

export function gradeTypeAnswer(exercise: Extract<Exercise, { kind: 'type-answer' }>, input: string): boolean {
  if (input.trim() === '') return false
  return exercise.answerLang === 'en'
    ? englishAnswerMatches(input, exercise.acceptedAnswers)
    : exercise.acceptedAnswers.some((a) => persianTextsMatch(a, input))
}

export function gradeWordOrder(exercise: Extract<Exercise, { kind: 'word-order' }>, orderedIds: string[]): boolean {
  if (orderedIds.length !== exercise.correctOrder.length) return false
  return orderedIds.every((id, i) => id === exercise.correctOrder[i])
}

export function gradeMatching(exercise: Extract<Exercise, { kind: 'matching' }>, matchedPairIds: Record<string, string>): boolean {
  return exercise.pairs.every((p) => matchedPairIds[p.id] === p.id)
}

export function gradeListening(exercise: Extract<Exercise, { kind: 'listening' }>, selectedOptionId: string): boolean {
  return selectedOptionId === exercise.correctOptionId
}

/** Map a raw correct/incorrect result plus hint usage to an SRS rating.
 *  Wrong -> again. Right with 2+ hints -> hard. Right with 0-1 hints -> good.
 *  Right with 0 hints on a production (typed/word-order) exercise -> easy,
 *  rewarding recall without scaffolding. */
export function ratingFor(exercise: Exercise, correct: boolean, hintsUsed: number): 'again' | 'hard' | 'good' | 'easy' {
  if (!correct) return 'again'
  if (hintsUsed >= 2) return 'hard'
  if (hintsUsed === 0 && (exercise.kind === 'type-answer' || exercise.kind === 'word-order')) return 'easy'
  return 'good'
}

/** Human-friendly "comes back in ~X" label for the rating this answer maps
 *  to, using pre-fetched forecasts (see session.ts `forecastForReviewable`)
 *  so it's available the instant grading happens — no extra DB round trip
 *  needed once the answer is known. Undefined when no forecast was fetched
 *  (e.g. a matching exercise, which has no single reviewable to forecast). */
export function nextReviewLabel(forecasts: RatingForecast[] | undefined, rating: ReturnType<typeof ratingFor>, now = Date.now()): string | undefined {
  const forecast = forecasts?.find((f) => f.rating === rating)
  return forecast ? describeInterval(now, forecast.dueAt) : undefined
}
