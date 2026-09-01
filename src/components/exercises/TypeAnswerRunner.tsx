import { useLayoutEffect, useRef, useState } from 'react'
import type { TypeAnswerExercise } from '../../lib/exercises/types'
import { gradeTypeAnswer } from '../../lib/exercises/grade'
import { PersianText } from '../shared/PersianText'
import { Button } from '../shared/Button'
import { HintPanel } from '../shared/HintPanel'
import { PersianKeyboard } from './PersianKeyboard'

interface Props {
  exercise: TypeAnswerExercise
  onComplete: (correct: boolean, hintsUsed: number) => void
}

export function TypeAnswerRunner({ exercise, onComplete }: Props) {
  const [value, setValue] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [hintsRevealed, setHintsRevealed] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  // Cursor position to restore after the next render whose `value` reflects
  // a keyboard-driven edit. A controlled <input>'s DOM value only updates
  // once React commits the re-render, so restoring selection has to happen
  // in a layout effect keyed off `value` — not immediately in the click
  // handler (the DOM text is still stale then) and not via
  // requestAnimationFrame (fires on the next paint, which races with
  // whatever the *next* click does in fast succession — a real source of
  // flakiness under rapid input, automated or otherwise).
  const [pendingCursor, setPendingCursor] = useState<number | null>(null)

  useLayoutEffect(() => {
    if (pendingCursor === null) return
    inputRef.current?.focus()
    inputRef.current?.setSelectionRange(pendingCursor, pendingCursor)
    // Resetting the "consumed" trigger back to null is the standard way to
    // synchronize an imperative DOM action (restoring cursor position) with
    // an external system (the input element) — not state derived from
    // props/state that belongs in render.
    // oxlint-disable-next-line react/set-state-in-effect
    setPendingCursor(null)
  }, [value, pendingCursor])

  const correct = submitted && gradeTypeAnswer(exercise, value)

  function submit() {
    if (value.trim() === '' || submitted) return
    setSubmitted(true)
  }

  /** Inserts text at the input's current cursor position (not always the
   *  end), so the on-screen Persian keyboard composes naturally with a
   *  learner who's also typing/editing with a real keyboard. Falls back to
   *  appending at the end when there's no known cursor position yet. */
  function insertAtCursor(text: string) {
    if (submitted) return
    const el = inputRef.current
    const start = el?.selectionStart ?? value.length
    const end = el?.selectionEnd ?? value.length
    setValue(value.slice(0, start) + text + value.slice(end))
    setPendingCursor(start + text.length)
  }

  function backspaceAtCursor() {
    if (submitted) return
    const el = inputRef.current
    const start = el?.selectionStart ?? value.length
    const end = el?.selectionEnd ?? value.length
    if (start === end) {
      if (start === 0) return
      setValue(value.slice(0, start - 1) + value.slice(end))
      setPendingCursor(start - 1)
    } else {
      setValue(value.slice(0, start) + value.slice(end))
      setPendingCursor(start)
    }
  }

  function clearAnswer() {
    if (submitted) return
    setValue('')
    setPendingCursor(0)
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-[var(--color-ink-muted)]">{exercise.instructions}</p>
      <div className="flex flex-col items-center gap-2 py-2">
        {exercise.promptFa && <PersianText fa={exercise.promptFa} translit={exercise.promptTranslit} size="xl" showSpeak />}
        {exercise.promptEn && <p className="text-xl font-medium text-[var(--color-ink)]">{exercise.promptEn}</p>}
      </div>

      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        disabled={submitted}
        dir={exercise.answerLang === 'fa' ? 'rtl' : 'ltr'}
        lang={exercise.answerLang}
        aria-label={exercise.answerLang === 'fa' ? 'Type your answer in Persian' : 'Type your answer in English'}
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

      {!submitted && exercise.answerLang === 'fa' && (
        <PersianKeyboard onInsert={insertAtCursor} onBackspace={backspaceAtCursor} onClear={clearAnswer} />
      )}

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
