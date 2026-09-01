interface HintPanelProps {
  hints: string[]
  revealedCount: number
  onReveal: () => void
}

/** Progressive hints: each tap reveals one more, from vaguest to most
 *  specific. Hint usage is reported back by the caller for SRS rating
 *  (heavy hint use downgrades a "correct" answer to a "hard" rating). */
export function HintPanel({ hints, revealedCount, onReveal }: HintPanelProps) {
  if (hints.length === 0) return null
  const canRevealMore = revealedCount < hints.length

  return (
    <div className="flex flex-col gap-2">
      {hints.slice(0, revealedCount).map((h, i) => (
        <div key={i} className="rounded-xl bg-[var(--color-warn-soft)] px-3 py-2 text-sm text-[var(--color-ink)]">
          {h}
        </div>
      ))}
      {canRevealMore && (
        <button
          type="button"
          onClick={onReveal}
          className="self-start text-sm font-medium text-[var(--color-brand)] underline decoration-dotted underline-offset-4"
        >
          {revealedCount === 0 ? 'Show a hint' : 'Show another hint'} ({hints.length - revealedCount} left)
        </button>
      )}
    </div>
  )
}
