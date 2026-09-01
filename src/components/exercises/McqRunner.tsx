import { useState } from 'react'
import type { McqExercise } from '../../lib/exercises/types'
import { gradeMcq } from '../../lib/exercises/grade'
import { PersianText } from '../shared/PersianText'
import { Button } from '../shared/Button'
import { HintPanel } from '../shared/HintPanel'

interface Props {
  exercise: McqExercise
  onComplete: (correct: boolean, hintsUsed: number) => void
}

export function McqRunner({ exercise, onComplete }: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const [hintsRevealed, setHintsRevealed] = useState(0)
  const answered = selected !== null

  function choose(optionId: string) {
    if (answered) return
    setSelected(optionId)
  }

  const correct = selected !== null && gradeMcq(exercise, selected)

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-[var(--color-ink-muted)]">{exercise.instructions}</p>
      <div className="flex flex-col items-center gap-2 py-2">
        {exercise.promptFa && <PersianText fa={exercise.promptFa} translit={exercise.promptTranslit} size="xl" showSpeak />}
        {exercise.promptEn && <p className="text-xl font-medium text-[var(--color-ink)]">{exercise.promptEn}</p>}
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {exercise.options.map((opt) => {
          const isSelected = selected === opt.id
          const isCorrectOption = opt.id === exercise.correctOptionId
          let stateClasses = 'border-[var(--color-border)] bg-[var(--color-surface)]'
          if (answered && isCorrectOption) stateClasses = 'border-[var(--color-good)] bg-[var(--color-good-soft)]'
          else if (answered && isSelected && !isCorrectOption) stateClasses = 'border-[var(--color-bad)] bg-[var(--color-bad-soft)]'

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => choose(opt.id)}
              disabled={answered}
              className={`min-h-14 rounded-2xl border-2 px-4 py-3 text-left transition-colors ${stateClasses} disabled:opacity-100`}
            >
              {opt.fa ? (
                <bdi lang="fa" dir="rtl" className="fa-text text-xl">{opt.fa}</bdi>
              ) : (
                <span className="text-base">{opt.en}</span>
              )}
            </button>
          )
        })}
      </div>

      {!answered && <HintPanel hints={exercise.hints} revealedCount={hintsRevealed} onReveal={() => setHintsRevealed((n) => n + 1)} />}

      {answered && (
        <div className="flex flex-col gap-3">
          <p className={correct ? 'font-medium text-[var(--color-good)]' : 'font-medium text-[var(--color-bad)]'}>
            {correct ? 'Correct!' : 'Not quite.'}
          </p>
          <Button onClick={() => onComplete(correct, hintsRevealed)} fullWidth>Continue</Button>
        </div>
      )}
    </div>
  )
}
