import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { buildNextLesson, markLessonComplete, getTodaySummary, forecastForReviewable } from '../lib/session'
import { recordReview } from '../storage/progressRepo'
import { ratingFor } from '../lib/exercises/grade'
import { getSettings } from '../storage/db'
import { useAsyncData } from '../hooks/useAsyncData'
import { PageHeader } from '../components/shared/PageHeader'
import { ProgressBar } from '../components/shared/ProgressBar'
import { Button } from '../components/shared/Button'
import { Card } from '../components/shared/Card'
import { TeachCard } from '../components/lesson/TeachCard'
import { ExerciseRunner } from '../components/exercises/ExerciseRunner'
import { DiacriticsToggle } from '../components/shared/DiacriticsToggle'

export function LessonPlayer() {
  const navigate = useNavigate()
  const { unitId } = useParams()
  const plan = useAsyncData(() => buildNextLesson(unitId), [unitId])
  const [stepIndex, setStepIndex] = useState(0)
  const [finished, setFinished] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [exerciseCount, setExerciseCount] = useState(0)
  const [finishedAt, setFinishedAt] = useState(0)
  // Settings (streak) update live via Dexie's liveQuery regardless. The
  // "what's next" summary is a one-shot async fetch, so it's re-run once the
  // lesson actually finishes (finishedAt bump) to reflect post-lesson state
  // (freshly-taught items now due, streak just bumped) instead of a stale
  // snapshot from before the lesson started.
  const settings = useLiveQuery(() => getSettings(), [])
  const nextSummary = useAsyncData(() => getTodaySummary(), [finishedAt])
  const currentStep = plan.data?.steps[stepIndex]
  const currentReviewable = currentStep?.step === 'exercise' ? currentStep.exercise.reviewable : undefined
  const forecasts = useAsyncData(
    () => currentReviewable ? forecastForReviewable(currentReviewable.kind, currentReviewable.itemId) : Promise.resolve(undefined),
    [currentReviewable?.kind, currentReviewable?.itemId],
  )

  // Guards against advancing twice for the same step. advance() reads
  // stepIndex from the render closure to decide "is this the last step?" —
  // if it's called a second time before React commits the first call's
  // state update (e.g. a rapid double-click/double-tap on "Got it" or
  // "Continue"), both calls see the same stale stepIndex, both conclude
  // "not the last step", and stepIndex ends up incremented twice instead
  // of once — running past plan.data.steps.length and crashing the render
  // (`step.step` on undefined). The ref is released by the effect below,
  // once stepIndex/finished actually change, not synchronously — so it
  // stays locked for the entire span between "advance was requested" and
  // "the resulting render committed".
  const advancing = useRef(false)
  useEffect(() => { advancing.current = false }, [stepIndex, finished])

  async function advance() {
    if (!plan.data || advancing.current) return
    advancing.current = true
    if (stepIndex + 1 >= plan.data.steps.length) {
      await markLessonComplete(plan.data.unit.id)
      setFinished(true)
      setFinishedAt((t) => t + 1)
    } else {
      setStepIndex((i) => i + 1)
    }
  }

  async function handleExerciseComplete(correct: boolean, hintsUsed: number) {
    if (!plan.data) return
    const step = plan.data.steps[stepIndex]
    if (step.step === 'exercise' && step.exercise.reviewable) {
      const rating = ratingFor(step.exercise, correct, hintsUsed)
      await recordReview(step.exercise.reviewable.kind, step.exercise.reviewable.itemId, rating, correct)
    }
    setExerciseCount((n) => n + 1)
    if (correct) setCorrectCount((n) => n + 1)
    advance()
  }

  if (plan.loading) return <PageHeader title="Loading lesson..." />

  if (!plan.data) {
    return (
      <div>
        <PageHeader
          title="No lesson available"
          subtitle={unitId ? 'This unit is already fully complete — its items stay in your review queue.' : 'Every unit is complete for now.'}
        />
        <div className="px-4 md:px-0"><Button onClick={() => navigate('/')}>Back to home</Button></div>
      </div>
    )
  }

  if (finished) {
    const streak = settings?.currentStreak ?? 0
    const summary = nextSummary.data
    return (
      <div>
        <PageHeader title="Lesson complete!" subtitle={plan.data.unit.title} />
        <div className="flex flex-col gap-4 px-4 md:px-0">
          <Card className="text-center">
            <p className="text-3xl font-semibold text-[var(--color-good)]">
              {exerciseCount > 0 ? Math.round((correctCount / exerciseCount) * 100) : 100}%
            </p>
            <p className="text-sm text-[var(--color-ink-muted)]">{correctCount} of {exerciseCount} correct on the first try</p>
          </Card>

          {streak > 0 && (
            <Card className="flex items-center gap-3">
              <span className="text-2xl" aria-hidden="true">🔥</span>
              <div>
                <p className="text-sm font-medium">{streak}-day streak</p>
                <p className="text-xs text-[var(--color-ink-muted)]">Keep it going — come back tomorrow.</p>
              </div>
            </Card>
          )}

          {summary && (
            <Card className="flex flex-col gap-2">
              <p className="text-sm font-medium">What's next</p>
              {summary.reviewsDue > 0 && (
                <p className="text-sm text-[var(--color-ink-muted)]">
                  {summary.reviewsDue} review{summary.reviewsDue === 1 ? '' : 's'} due, including what you just learned.
                </p>
              )}
              {summary.hasLesson && (
                <p className="text-sm text-[var(--color-ink-muted)]">
                  Next up: <span className="font-medium text-[var(--color-ink)]">{summary.currentUnit!.title}</span> (lesson {summary.lessonNumber} of {summary.totalLessons}).
                </p>
              )}
              {!summary.hasLesson && summary.reviewsDue === 0 && (
                <p className="text-sm text-[var(--color-ink-muted)]">You're all caught up for now.</p>
              )}
              {summary.reviewsDue > 0 && (
                <Button variant="secondary" onClick={() => navigate('/review')} fullWidth>Review now ({summary.reviewsDue})</Button>
              )}
            </Card>
          )}

          <Button onClick={() => navigate('/')} fullWidth>Back to home</Button>
        </div>
      </div>
    )
  }

  const step = plan.data.steps[stepIndex]

  return (
    <div>
      <div className="px-4 pt-5 md:px-0">
        <div className="mb-2 flex items-center gap-3">
          <button onClick={() => navigate('/')} aria-label="Exit lesson" className="text-[var(--color-ink-muted)]">✕</button>
          <ProgressBar value={stepIndex} max={plan.data.steps.length} />
          <DiacriticsToggle />
        </div>
        <p className="mb-4 truncate text-xs text-[var(--color-ink-muted)]">
          {plan.data.unit.title} — lesson {plan.data.lessonNumber} of {plan.data.totalLessons} · step {stepIndex + 1} of {plan.data.steps.length}
        </p>
      </div>
      <div className="px-4 pb-8 md:px-0">
        {step.step === 'teach' && (
          <TeachCard contentType={step.contentType} id={step.id} onContinue={advance} />
        )}
        {step.step === 'exercise' && (
          <ExerciseRunner exercise={step.exercise} onComplete={handleExerciseComplete} forecasts={forecasts.data ?? undefined} />
        )}
      </div>
    </div>
  )
}
