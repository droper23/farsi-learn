import type { Exercise } from '../../lib/exercises/types'
import type { RatingForecast } from '../../srs/types'
import { ratingFor, nextReviewLabel } from '../../lib/exercises/grade'

interface Props {
  exercise: Exercise
  correct: boolean
  hintsUsed: number
  forecasts?: RatingForecast[]
}

/** "Next review: ~3 days" — makes the SRS scheduler visible right after
 *  grading (review M2), reusing forecasts pre-fetched by the parent screen
 *  (see session.ts `forecastForReviewable`). Renders nothing if no forecast
 *  was fetched for this exercise. */
export function NextReviewLine({ exercise, correct, hintsUsed, forecasts }: Props) {
  const label = nextReviewLabel(forecasts, ratingFor(exercise, correct, hintsUsed))
  if (!label) return null
  return <p className="text-xs text-[var(--color-ink-muted)]">Next review: ~{label}</p>
}
