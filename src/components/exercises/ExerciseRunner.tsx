import type { Exercise } from '../../lib/exercises/types'
import type { RatingForecast } from '../../srs/types'
import { McqRunner } from './McqRunner'
import { TypeAnswerRunner } from './TypeAnswerRunner'
import { WordOrderRunner } from './WordOrderRunner'
import { MatchingRunner } from './MatchingRunner'
import { ListeningRunner } from './ListeningRunner'

interface Props {
  exercise: Exercise
  onComplete: (correct: boolean, hintsUsed: number) => void
  /** Pre-fetched "what would each rating do" forecast for this exercise's
   *  reviewable (see session.ts `forecastForReviewable`), so the runner can
   *  show a "Next review: ~X" line the instant it grades an answer.
   *  Undefined for a matching exercise (no single reviewable to forecast). */
  forecasts?: RatingForecast[]
}

/** Dispatches to the right exercise UI by `exercise.kind`. Keyed by
 *  exercise.id so React remounts (and resets internal state) whenever the
 *  exercise changes, instead of stale state leaking between questions. */
export function ExerciseRunner({ exercise, onComplete, forecasts }: Props) {
  switch (exercise.kind) {
    case 'mcq':
      return <McqRunner key={exercise.id} exercise={exercise} onComplete={onComplete} forecasts={forecasts} />
    case 'type-answer':
      return <TypeAnswerRunner key={exercise.id} exercise={exercise} onComplete={onComplete} forecasts={forecasts} />
    case 'word-order':
      return <WordOrderRunner key={exercise.id} exercise={exercise} onComplete={onComplete} forecasts={forecasts} />
    case 'matching':
      return <MatchingRunner key={exercise.id} exercise={exercise} onComplete={onComplete} />
    case 'listening':
      return <ListeningRunner key={exercise.id} exercise={exercise} onComplete={onComplete} forecasts={forecasts} />
  }
}
