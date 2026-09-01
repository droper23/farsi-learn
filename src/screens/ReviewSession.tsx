import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { buildReviewExercises, getTodaySummary, forecastForReviewable } from '../lib/session'
import { recordReview } from '../storage/progressRepo'
import { ratingFor } from '../lib/exercises/grade'
import { getSettings } from '../storage/db'
import { useAsyncData } from '../hooks/useAsyncData'
import { PageHeader } from '../components/shared/PageHeader'
import { ProgressBar } from '../components/shared/ProgressBar'
import { Button } from '../components/shared/Button'
import { Card } from '../components/shared/Card'
import { ExerciseRunner } from '../components/exercises/ExerciseRunner'

export function ReviewSession() {
  const navigate = useNavigate()
  const exercises = useAsyncData(() => buildReviewExercises(30), [])
  const [index, setIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  // Only needed to fill the empty/complete states with something useful
  // (streak, next-lesson pointer) — not fetched on the hot path of
  // answering a review question.
  const settings = useLiveQuery(() => getSettings(), [])
  const summary = useAsyncData(() => getTodaySummary(), [])
  const currentReviewable = exercises.data?.[index]?.reviewable
  const forecasts = useAsyncData(
    () => currentReviewable ? forecastForReviewable(currentReviewable.kind, currentReviewable.itemId) : Promise.resolve(undefined),
    [currentReviewable?.kind, currentReviewable?.itemId],
  )

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

  if (exercises.loading) return <PageHeader title="Loading review..." />

  const list = exercises.data ?? []

  if (list.length === 0) {
    const streak = settings?.currentStreak ?? 0
    return (
      <div>
        <PageHeader title="Nothing due right now" subtitle="Come back later, or start today's lesson instead." />
        <div className="flex flex-col gap-4 px-4 md:px-0">
          {streak > 0 && (
            <Card className="flex items-center gap-3">
              <span className="text-2xl" aria-hidden="true">🔥</span>
              <div>
                <p className="text-sm font-medium">{streak}-day streak</p>
                <p className="text-xs text-[var(--color-ink-muted)]">A lesson today keeps it going, even with no reviews due.</p>
              </div>
            </Card>
          )}
          {summary.data?.hasLesson && (
            <Card className="flex flex-col gap-2">
              <p className="text-sm font-medium">Up next</p>
              <p className="text-sm text-[var(--color-ink-muted)]">
                <span className="font-medium text-[var(--color-ink)]">{summary.data.currentUnit!.title}</span> — lesson {summary.data.lessonNumber} of {summary.data.totalLessons}
              </p>
              <Button onClick={() => navigate('/lesson')} fullWidth>Start lesson</Button>
            </Card>
          )}
          <Button onClick={() => navigate('/')} variant={summary.data?.hasLesson ? 'secondary' : 'primary'}>Back to home</Button>
        </div>
      </div>
    )
  }

  if (index >= list.length) {
    return (
      <div>
        <PageHeader title="Review complete!" />
        <div className="flex flex-col gap-4 px-4 md:px-0">
          <Card className="text-center">
            <p className="text-3xl font-semibold text-[var(--color-good)]">{Math.round((correctCount / list.length) * 100)}%</p>
            <p className="text-sm text-[var(--color-ink-muted)]">{correctCount} of {list.length} correct</p>
          </Card>
          {(settings?.currentStreak ?? 0) > 0 && (
            <Card className="flex items-center gap-3">
              <span className="text-2xl" aria-hidden="true">🔥</span>
              <p className="text-sm font-medium">{settings?.currentStreak}-day streak</p>
            </Card>
          )}
          {summary.data?.hasLesson && (
            <Card className="flex flex-col gap-2">
              <p className="text-sm font-medium">Up next</p>
              <p className="text-sm text-[var(--color-ink-muted)]">
                <span className="font-medium text-[var(--color-ink)]">{summary.data.currentUnit!.title}</span> — lesson {summary.data.lessonNumber} of {summary.data.totalLessons}
              </p>
            </Card>
          )}
          <Button onClick={() => navigate('/')} fullWidth>Back to home</Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="px-4 pt-5 md:px-0">
        <div className="mb-4 flex items-center gap-3">
          <button onClick={() => navigate('/')} aria-label="Exit review" className="text-[var(--color-ink-muted)]">✕</button>
          <ProgressBar value={index} max={list.length} />
        </div>
      </div>
      <div className="px-4 pb-8 md:px-0">
        <ExerciseRunner exercise={list[index]} onComplete={handleComplete} forecasts={forecasts.data ?? undefined} />
      </div>
    </div>
  )
}
