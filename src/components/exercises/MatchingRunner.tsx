import { useMemo, useState } from 'react'
import type { MatchingExercise } from '../../lib/exercises/types'
import { useSettings } from '../../hooks/useSettings'
import { withDiacritics } from '../../lib/persianText'
import { Button } from '../shared/Button'

interface Props {
  exercise: MatchingExercise
  onComplete: (correct: boolean, hintsUsed: number) => void
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function MatchingRunner({ exercise, onComplete }: Props) {
  const rightOrder = useMemo(() => shuffle(exercise.pairs), [exercise])
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null)
  const [matched, setMatched] = useState<Set<string>>(new Set())
  const [wrongFlash, setWrongFlash] = useState<{ left: string; right: string } | null>(null)
  const [mistakes, setMistakes] = useState(0)
  const { showDiacritics } = useSettings()

  const allMatched = matched.size === exercise.pairs.length

  function chooseLeft(id: string) {
    if (matched.has(id) || wrongFlash) return
    setSelectedLeft(id)
  }

  function chooseRight(id: string) {
    if (!selectedLeft || matched.has(id) || wrongFlash) return
    if (selectedLeft === id) {
      setMatched((m) => new Set(m).add(id))
      setSelectedLeft(null)
    } else {
      setMistakes((n) => n + 1)
      setWrongFlash({ left: selectedLeft, right: id })
      setTimeout(() => {
        setWrongFlash(null)
        setSelectedLeft(null)
      }, 600)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-[var(--color-ink-muted)]">{exercise.instructions}</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          {exercise.pairs.map((p) => {
            const isMatched = matched.has(p.id)
            const isSelected = selectedLeft === p.id
            const isWrong = wrongFlash?.left === p.id
            return (
              <button
                key={p.id}
                type="button"
                data-testid="matching-left"
                data-pair-id={p.id}
                onClick={() => chooseLeft(p.id)}
                disabled={isMatched}
                dir="rtl"
                className={`fa-text min-h-12 rounded-xl border-2 px-3 py-2 text-lg transition-colors ${
                  isMatched ? 'border-[var(--color-good)] bg-[var(--color-good-soft)] opacity-60'
                  : isWrong ? 'border-[var(--color-bad)] bg-[var(--color-bad-soft)]'
                  : isSelected ? 'border-[var(--color-brand)] bg-[var(--color-brand-soft)]'
                  : 'border-[var(--color-border)] bg-[var(--color-surface)]'
                }`}
              >
                {withDiacritics(p.fa, showDiacritics)}
              </button>
            )
          })}
        </div>
        <div className="flex flex-col gap-2">
          {rightOrder.map((p) => {
            const isMatched = matched.has(p.id)
            const isWrong = wrongFlash?.right === p.id
            return (
              <button
                key={p.id}
                type="button"
                data-testid="matching-right"
                data-pair-id={p.id}
                onClick={() => chooseRight(p.id)}
                disabled={isMatched}
                className={`min-h-12 rounded-xl border-2 px-3 py-2 text-left text-sm transition-colors ${
                  isMatched ? 'border-[var(--color-good)] bg-[var(--color-good-soft)] opacity-60'
                  : isWrong ? 'border-[var(--color-bad)] bg-[var(--color-bad-soft)]'
                  : 'border-[var(--color-border)] bg-[var(--color-surface)]'
                }`}
              >
                {p.en}
              </button>
            )
          })}
        </div>
      </div>

      {allMatched && (
        <div className="flex flex-col gap-3">
          <p className="font-medium text-[var(--color-good)]">All matched!</p>
          <Button onClick={() => onComplete(true, mistakes)} fullWidth>Continue</Button>
        </div>
      )}
    </div>
  )
}
