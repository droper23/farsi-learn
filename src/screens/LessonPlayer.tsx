import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { buildNextLesson, markLessonComplete } from '../lib/session'
import { recordReview } from '../storage/progressRepo'
import { ratingFor } from '../lib/exercises/grade'
import { useAsyncData } from '../hooks/useAsyncData'
import { PageHeader } from '../components/shared/PageHeader'
import { ProgressBar } from '../components/shared/ProgressBar'
import { Button } from '../components/shared/Button'
import { Card } from '../components/shared/Card'
import { TeachCard } from '../components/lesson/TeachCard'
import { ExerciseRunner } from '../components/exercises/ExerciseRunner'

export function LessonPlayer() {
  const navigate = useNavigate()
  const plan = useAsyncData(() => buildNextLesson(), [])
  const [stepIndex, setStepIndex] = useState(0)
  const [finished, setFinished] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [exerciseCount, setExerciseCount] = useState(0)

  async function advance() {
    if (!plan.data) return
    if (stepIndex + 1 >= plan.data.steps.length) {
      await markLessonComplete(plan.data.unit.id)
      setFinished(true)
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
        <PageHeader title="No lesson available" subtitle="Every unit is complete for now." />
        <div className="px-4 md:px-0"><Button onClick={() => navigate('/')}>Back to home</Button></div>
      </div>
    )
  }

  if (finished) {
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
          <Button onClick={() => navigate('/')} fullWidth>Back to home</Button>
        </div>
      </div>
    )
  }

  const step = plan.data.steps[stepIndex]

  return (
    <div>
      <div className="px-4 pt-5 md:px-0">
        <div className="mb-4 flex items-center gap-3">
          <button onClick={() => navigate('/')} aria-label="Exit lesson" className="text-[var(--color-ink-muted)]">✕</button>
          <ProgressBar value={stepIndex} max={plan.data.steps.length} />
        </div>
      </div>
      <div className="px-4 pb-8 md:px-0">
        {step.step === 'teach' && (
          <TeachCard contentType={step.contentType} id={step.id} onContinue={advance} />
        )}
        {step.step === 'exercise' && (
          <ExerciseRunner exercise={step.exercise} onComplete={handleExerciseComplete} />
        )}
      </div>
    </div>
  )
}
