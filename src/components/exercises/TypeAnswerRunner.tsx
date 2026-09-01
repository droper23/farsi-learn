import { useState } from 'react'
import type { TypeAnswerExercise } from '../../lib/exercises/types'
import { gradeTypeAnswer } from '../../lib/exercises/grade'
import { PersianText } from '../shared/PersianText'
import { Button } from '../shared/Button'
import { HintPanel } from '../shared/HintPanel'

interface Props {
  exercise: TypeAnswerExercise
  onComplete: (correct: boolean, hintsUsed: number) => void
}

export function TypeAnswerRunner({ exercise, onComplete }: Props) {
  const [value, setValue] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [hintsRevealed, setHintsRevealed] = useState(0)

  const correct = submitted && gradeTypeAnswer(exercise, value)

  function submit() {
    if (value.trim() === '' || submitted) return
    setSubmitted(true)
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-[var(--color-ink-muted)]">{exercise.instructions}</p>
      <div className="flex flex-col items-center gap-2 py-2">
        {exercise.promptFa && <PersianText fa={exercise.promptFa} translit={exercise.promptTranslit} size="xl" showSpeak />}
        {exercise.promptEn && <p className="text-xl font-medium text-[var(--color-ink)]">{exercise.promptEn}</p>}
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        disabled={submitted}
        dir={exercise.answerLang === 'fa' ? 'rtl' : 'ltr'}
        lang={exercise.answerLang}
        placeholder={exercise.answerLang === 'fa' ? 'بنویسید...' : 'Type your answer...'}
        className={`min-h-14 rounded-2xl border-2 px-4 py-3 text-lg outline-none ${
          submitted
            ? correct ? 'border-[var(--color-good)] bg-[var(--color-good-soft)]' : 'border-[var(--color-bad)] bg-[var(--color-bad-soft)]'
            : 'border-[var(--color-border)] bg-[var(--color-surface)] focus:border-[var(--color-brand)]'
        } ${exercise.answerLang === 'fa' ? 'fa-text text-right' : ''}`}
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
      />

      {!submitted && (
        <>
          <HintPanel hints={exercise.hints} revealedCount={hintsRevealed} onReveal={() => setHintsRevealed((n) => n + 1)} />
          <Button onClick={submit} fullWidth disabled={value.trim() === ''}>Check</Button>
        </>
      )}

      {submitted && (
        <div className="flex flex-col gap-3">
          <p className={correct ? 'font-medium text-[var(--color-good)]' : 'font-medium text-[var(--color-bad)]'}>
            {correct ? 'Correct!' : 'Not quite.'}
          </p>
          {!correct && (
            <p className="text-sm text-[var(--color-ink-muted)]">
              Accepted answer{exercise.acceptedAnswers.length > 1 ? 's' : ''}: {exercise.acceptedAnswers.join(' / ')}
            </p>
          )}
          <Button onClick={() => onComplete(correct, hintsRevealed)} fullWidth>Continue</Button>
        </div>
      )}
    </div>
  )
}
