interface ProgressBarProps {
  value: number
  max: number
  label?: string
}

export function ProgressBar({ value, max, label }: ProgressBarProps) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  return (
    <div className="w-full">
      {label && <div className="mb-1 text-xs text-[var(--color-ink-muted)]">{label}</div>}
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-border)]"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div className="h-full rounded-full bg-[var(--color-brand)] transition-all duration-300" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
