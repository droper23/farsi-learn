import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { buildFocusedSession, forecastForReviewable, type FocusedFilter } from '../lib/session'
import { recordReview } from '../storage/progressRepo'
import { ratingFor } from '../lib/exercises/grade'
import { useAsyncData } from '../hooks/useAsyncData'
import { PageHeader } from '../components/shared/PageHeader'
import { ProgressBar } from '../components/shared/ProgressBar'
import { Button } from '../components/shared/Button'
import { Card } from '../components/shared/Card'
import { ExerciseRunner } from '../components/exercises/ExerciseRunner'
import type { ReviewableKind, VocabCategory } from '../content/types'

interface FocusedSessionState {
  filterBy?: FocusedFilter
  category?: VocabCategory
  kind?: ReviewableKind
}

/** Practice outside the due-date schedule — currently just "weak spots"
 *  (entry point on the Stats screen), but built generically (filterBy:
 *  'weak' | 'category') so a category-focused entry point can reuse it
 *  later without a new screen. See lib/session.ts buildFocusedSession. */
export function FocusedSession() {
  const navigate = useNavigate()
  const location = useLocation()
  const options = (location.state as FocusedSessionState | null) ?? { filterBy: 'weak' }
  const filterBy = options.filterBy ?? 'weak'
  const exercises = useAsyncData(
    () => buildFocusedSession({ filterBy, category: options.category, kind: options.kind }),
    [filterBy, options.category, options.kind],
  )
  const [index, setIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const currentReviewable = exercises.data?.[index]?.reviewable
  const forecasts = useAsyncData(
    () => currentReviewable ? forecastForReviewable(currentReviewable.kind, currentReviewable.itemId) : Promise.resolve(undefined),
    [currentReviewable?.kind, currentReviewable?.itemId],
  )

  const title = filterBy === 'weak' ? 'Weak spots' : `Practice: ${options.category ?? ''}`

  async function handleComplete(correct: boolean, hintsUsed: number) {
    const list = exercises.data
    if (!list) return
    const exercise = list[index]
    if (exercise.reviewable) {
      const rating = ratingFor(exercise, correct, hintsUsed)
      await recordReview(exercise.reviewable.kind, exercise.reviewable.itemId, rating, correct)
    }
    if (correct) setCorrectCount((n) => n + 1)
    setIndex((i) => i + 1)
  }

  if (exercises.loading) return <PageHeader title="Loading..." />

  const list = exercises.data ?? []

  if (list.length === 0) {
    return (
      <div>
        <PageHeader title={title} subtitle="Nothing to practice here right now." />
        <div className="px-4 md:px-0"><Button onClick={() => navigate('/stats')}>Back to stats</Button></div>
      </div>
    )
  }

  if (index >= list.length) {
    return (
      <div>
        <PageHeader title="Practice complete!" />
        <div className="flex flex-col gap-4 px-4 md:px-0">
          <Card className="text-center">
            <p className="text-3xl font-semibold text-[var(--color-good)]">{Math.round((correctCount / list.length) * 100)}%</p>
            <p className="text-sm text-[var(--color-ink-muted)]">{correctCount} of {list.length} correct</p>
          </Card>
          <Button onClick={() => navigate('/')} fullWidth>Back to home</Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="px-4 pt-5 md:px-0">
        <div className="mb-4 flex items-center gap-3">
          <button onClick={() => navigate('/')} aria-label="Exit practice" className="text-[var(--color-ink-muted)]">✕</button>
          <ProgressBar value={index} max={list.length} label={title} />
        </div>
      </div>
      <div className="px-4 pb-8 md:px-0">
        <ExerciseRunner exercise={list[index]} onComplete={handleComplete} forecasts={forecasts.data ?? undefined} />
      </div>
    </div>
  )
}
