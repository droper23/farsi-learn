import { useLiveQuery } from 'dexie-react-hooks'
import { getSettings, updateSettings } from '../../storage/db'

/** A small, always-reachable toggle for the "show vowel marks" setting —
 *  placed directly on lesson/review/practice screens rather than requiring
 *  a trip to Profile settings, since it's the kind of thing a learner
 *  wants to flip mid-session (e.g. "let me peek at the vowels for this
 *  one") rather than decide once and forget. */
export function DiacriticsToggle() {
  const settings = useLiveQuery(() => getSettings(), [])
  const on = settings?.showDiacritics ?? false

  return (
    <button
      type="button"
      onClick={() => updateSettings({ showDiacritics: !on })}
      aria-pressed={on}
      aria-label={on ? 'Hide vowel marks' : 'Show vowel marks'}
      title={on ? 'Hide vowel marks (اَ اِ اُ)' : 'Show vowel marks (اَ اِ اُ)'}
      className={`fa-text flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-base transition-colors ${
        on
          ? 'border-[var(--color-brand)] bg-[var(--color-brand-soft)] text-[var(--color-brand)]'
          : 'border-[var(--color-border)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]'
      }`}
    >
      اَ
    </button>
  )
}
