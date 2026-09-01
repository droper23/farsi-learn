import { useState } from 'react'
import type { WordOrderExercise } from '../../lib/exercises/types'
import type { RatingForecast } from '../../srs/types'
import { gradeWordOrder } from '../../lib/exercises/grade'
import { Button } from '../shared/Button'
import { HintPanel } from '../shared/HintPanel'
import { NextReviewLine } from '../shared/NextReviewLine'

interface Props {
  exercise: WordOrderExercise
  onComplete: (correct: boolean, hintsUsed: number) => void
  forecasts?: RatingForecast[]
}

export function WordOrderRunner({ exercise, onComplete, forecasts }: Props) {
  const [pool, setPool] = useState(exercise.words)
  const [chosen, setChosen] = useState<typeof exercise.words>([])
  const [submitted, setSubmitted] = useState(false)
  const [hintsRevealed, setHintsRevealed] = useState(0)

  const correct = submitted && gradeWordOrder(exercise, chosen.map((w) => w.id))

  function pick(id: string) {
    if (submitted) return
    const word = pool.find((w) => w.id === id)
    if (!word) return
    setPool((p) => p.filter((w) => w.id !== id))
    setChosen((c) => [...c, word])
  }

  function unpick(id: string) {
    if (submitted) return
    const word = chosen.find((w) => w.id === id)
    if (!word) return
    setChosen((c) => c.filter((w) => w.id !== id))
    setPool((p) => [...p, word])
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-[var(--color-ink-muted)]">{exercise.instructions}</p>
      <p className="text-center text-xl font-medium text-[var(--color-ink)]">{exercise.promptEn}</p>

      <div className="min-h-16 rounded-2xl border-2 border-dashed border-[var(--color-border)] p-3" dir="rtl">
        <div className="flex flex-wrap justify-end gap-2">
          {chosen.map((w) => (
            <button
              key={w.id}
              type="button"
              onClick={() => unpick(w.id)}
              disabled={submitted}
              className="fa-text rounded-xl bg-[var(--color-brand-soft)] px-3 py-2 text-lg text-[var(--color-brand-strong)]"
            >
              {w.fa}
            </button>
          ))}
        </div>
      </div>

      <div dir="rtl" className="flex flex-wrap justify-end gap-2">
        {pool.map((w) => (
          <button
            key={w.id}
            type="button"
            data-testid="word-pool-item"
            onClick={() => pick(w.id)}
            disabled={submitted}
            className="fa-text rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-lg hover:bg-[var(--color-brand-soft)]"
          >
            {w.fa}
          </button>
        ))}
      </div>

      {!submitted && (
        <>
          <HintPanel hints={exercise.hints} revealedCount={hintsRevealed} onReveal={() => setHintsRevealed((n) => n + 1)} />
          <Button onClick={() => setSubmitted(true)} fullWidth disabled={pool.length > 0}>Check</Button>
        </>
      )}

      {submitted && (
        <div className="flex flex-col gap-3">
          <p className={correct ? 'font-medium text-[var(--color-good)]' : 'font-medium text-[var(--color-bad)]'}>
            {correct ? 'Correct!' : 'Not quite — here is the right order:'}
          </p>
          {!correct && (
            <div dir="rtl" className="fa-text rounded-xl bg-[var(--color-good-soft)] px-3 py-2 text-lg">
              {exercise.correctOrder.map((id) => exercise.words.find((w) => w.id === id)?.fa).join(' ')}
            </div>
          )}
          <NextReviewLine exercise={exercise} correct={correct} hintsUsed={hintsRevealed} forecasts={forecasts} />
          <Button onClick={() => onComplete(correct, hintsRevealed)} fullWidth>Continue</Button>
        </div>
      )}
    </div>
  )
}
