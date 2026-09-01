import type { Exercise } from '../../lib/exercises/types'
import { McqRunner } from './McqRunner'
import { TypeAnswerRunner } from './TypeAnswerRunner'
import { WordOrderRunner } from './WordOrderRunner'
import { MatchingRunner } from './MatchingRunner'

interface Props {
  exercise: Exercise
  onComplete: (correct: boolean, hintsUsed: number) => void
}

/** Dispatches to the right exercise UI by `exercise.kind`. Keyed by
 *  exercise.id so React remounts (and resets internal state) whenever the
 *  exercise changes, instead of stale state leaking between questions. */
export function ExerciseRunner({ exercise, onComplete }: Props) {
  switch (exercise.kind) {
    case 'mcq':
      return <McqRunner key={exercise.id} exercise={exercise} onComplete={onComplete} />
    case 'type-answer':
      return <TypeAnswerRunner key={exercise.id} exercise={exercise} onComplete={onComplete} />
    case 'word-order':
      return <WordOrderRunner key={exercise.id} exercise={exercise} onComplete={onComplete} />
    case 'matching':
      return <MatchingRunner key={exercise.id} exercise={exercise} onComplete={onComplete} />
  }
}
