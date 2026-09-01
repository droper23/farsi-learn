import { useState } from 'react'
import type { ListeningExercise } from '../../lib/exercises/types'
import type { RatingForecast } from '../../srs/types'
import { gradeListening } from '../../lib/exercises/grade'
import { canPronounce, pronouncePersian } from '../../lib/speech'
import { PersianText } from '../shared/PersianText'
import { Button } from '../shared/Button'
import { HintPanel } from '../shared/HintPanel'
import { NextReviewLine } from '../shared/NextReviewLine'

interface Props {
  exercise: ListeningExercise
  onComplete: (correct: boolean, hintsUsed: number) => void
  forecasts?: RatingForecast[]
}

/** Listening comprehension: play (and replay) the Persian audio — a
 *  pre-generated clip where one exists, the browser's speech synthesis
 *  otherwise (see lib/speech.ts `pronouncePersian`) — then choose the
 *  meaning. If neither source can produce audio for this text, playing
 *  would be silent and broken — so instead of pretending to be an audio
 *  exercise, it gracefully falls back to showing the Persian text +
 *  transliteration directly, clearly labeled as a fallback, rather than
 *  being unusable. */
export function ListeningRunner({ exercise, onComplete, forecasts }: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const [hintsRevealed, setHintsRevealed] = useState(0)
  const [voiceAvailable] = useState(() => canPronounce(exercise.audioText))
  const [played, setPlayed] = useState(false)
  const answered = selected !== null
  const correct = selected !== null && gradeListening(exercise, selected)

  function play() {
    pronouncePersian(exercise.audioText)
    setPlayed(true)
  }

  function choose(id: string) {
    if (answered) return
    setSelected(id)
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-[var(--color-ink-muted)]">{exercise.instructions}</p>

      {voiceAvailable ? (
        <div className="flex flex-col items-center gap-2 py-2">
          <button
            type="button"
            onClick={play}
            aria-label={played ? 'Replay the Persian audio' : 'Play the Persian audio'}
            className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-brand-soft)] text-[var(--color-brand)] transition-colors hover:brightness-105"
          >
            <LargeSpeakerIcon />
          </button>
          <p className="text-xs text-[var(--color-ink-muted)]">
            Approximate, computer-generated pronunciation — tap to {played ? 'replay' : 'play'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 py-2">
          <PersianText fa={exercise.audioText} translit={exercise.audioTranslit} size="xl" forceShowTranslit />
          <p className="text-xs text-[var(--color-ink-muted)]">
            No pronunciation available for this item — showing the text instead of audio.
          </p>
        </div>
      )}

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
              data-testid="exercise-option"
              onClick={() => choose(opt.id)}
              disabled={answered}
              className={`min-h-14 rounded-2xl border-2 px-4 py-3 text-left transition-colors ${stateClasses} disabled:opacity-100`}
            >
              <span className="text-base">{opt.en}</span>
            </button>
          )
        })}
      </div>

      {!answered && voiceAvailable && (
        <HintPanel hints={exercise.hints} revealedCount={hintsRevealed} onReveal={() => setHintsRevealed((n) => n + 1)} />
      )}

      {answered && (
        <div className="flex flex-col gap-3">
          <p className={correct ? 'font-medium text-[var(--color-good)]' : 'font-medium text-[var(--color-bad)]'}>
            {correct ? 'Correct!' : 'Not quite.'}
          </p>
          {voiceAvailable && (
            <p className="text-sm text-[var(--color-ink-muted)]">
              <bdi lang="fa" dir="rtl" className="fa-text">{exercise.audioText}</bdi> — {exercise.audioTranslit}
            </p>
          )}
          <NextReviewLine exercise={exercise} correct={correct} hintsUsed={hintsRevealed} forecasts={forecasts} />
          <Button onClick={() => onComplete(correct, hintsRevealed)} fullWidth>Continue</Button>
        </div>
      )}
    </div>
  )
}

function LargeSpeakerIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" />
      <path d="M16.5 8.5a5 5 0 0 1 0 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M19 6a9 9 0 0 1 0 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
