import { alphabet } from '../../content/alphabet'

/** Zero-width non-joiner ("half-space", نیم‌فاصله) — needed to type plurals
 *  (کتاب‌ها), the present-tense می‌ prefix, and other standard Persian
 *  spellings correctly. See lib/persianText.ts — grading already treats it
 *  as equivalent to a plain space, so learners aren't penalized for using
 *  a regular space instead if they don't have this key on a real keyboard. */
const ZWNJ = '‌'

const keys = alphabet.map((l) => ({ id: l.id, char: l.forms.isolated, name: l.name }))

/** Letter variants that aren't among the 32 base alphabet letters but do
 *  appear in real vocabulary spellings (آب "water", متأسفم "I'm sorry",
 *  رئیس "boss", مطمئن "sure"...) — without these, those words are
 *  literally untypable from the on-screen keyboard. */
const extraLetterKeys = [
  { id: 'alef-madda', char: 'آ', name: 'Alef madda' },
  { id: 'hamza-alef', char: 'أ', name: 'Hamza on alef' },
  { id: 'hamza-ye', char: 'ئ', name: 'Hamza on ye' },
]

/** Punctuation that appears in phrase-style vocabulary entries (چطوری؟
 *  "how are you?", میشه...؟ "would it be possible...?") — the base
 *  letter keys alone can't produce these. */
const punctuationKeys = [
  { id: 'question-mark', char: '؟', name: 'Persian question mark' },
  { id: 'comma', char: '،', name: 'Persian comma' },
  { id: 'period', char: '.', name: 'Period' },
  { id: 'exclamation', char: '!', name: 'Exclamation mark' },
]

interface Props {
  onInsert: (text: string) => void
  onBackspace: () => void
  onClear: () => void
  disabled?: boolean
}

/** An on-screen Persian letter picker for typed-answer exercises, so a
 *  learner without a Persian keyboard layout installed can still build an
 *  answer. Composes with the existing text input: each tap inserts at the
 *  input's current cursor position (see TypeAnswerRunner), rather than
 *  always appending to the end. */
export function PersianKeyboard({ onInsert, onBackspace, onClear, disabled }: Props) {
  return (
    <div
      className="flex flex-col gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-2"
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
      role="group"
      aria-label="Persian letter keyboard"
    >
      <div className="grid grid-cols-7 gap-1 sm:grid-cols-8" dir="rtl">
        {keys.map((k) => (
          <button
            key={k.id}
            type="button"
            data-testid={`kbd-key-${k.id}`}
            onClick={() => onInsert(k.char)}
            disabled={disabled}
            aria-label={`Insert ${k.name}`}
            className="fa-text min-h-10 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-lg transition-colors hover:bg-[var(--color-brand-soft)] disabled:opacity-40"
          >
            {k.char}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 sm:grid-cols-8" dir="rtl">
        {[...extraLetterKeys, ...punctuationKeys].map((k) => (
          <button
            key={k.id}
            type="button"
            data-testid={`kbd-key-${k.id}`}
            onClick={() => onInsert(k.char)}
            disabled={disabled}
            aria-label={`Insert ${k.name}`}
            className="fa-text min-h-10 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-raised)] text-lg transition-colors hover:bg-[var(--color-brand-soft)] disabled:opacity-40"
          >
            {k.char}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-1">
        <button
          type="button"
          onClick={() => onInsert(ZWNJ)}
          disabled={disabled}
          aria-label="Insert half-space (zero-width non-joiner)"
          className="min-h-10 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-xs font-medium transition-colors hover:bg-[var(--color-brand-soft)] disabled:opacity-40"
        >
          half-space
        </button>
        <button
          type="button"
          onClick={() => onInsert(' ')}
          disabled={disabled}
          aria-label="Insert space"
          className="min-h-10 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-xs font-medium transition-colors hover:bg-[var(--color-brand-soft)] disabled:opacity-40"
        >
          space
        </button>
        <button
          type="button"
          data-testid="kbd-backspace"
          onClick={onBackspace}
          disabled={disabled}
          aria-label="Backspace"
          className="min-h-10 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm font-medium transition-colors hover:bg-[var(--color-bad-soft)] disabled:opacity-40"
        >
          ⌫ delete
        </button>
        <button
          type="button"
          data-testid="kbd-clear"
          onClick={onClear}
          disabled={disabled}
          aria-label="Clear the answer"
          className="min-h-10 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-xs font-medium transition-colors hover:bg-[var(--color-bad-soft)] disabled:opacity-40"
        >
          clear
        </button>
      </div>
    </div>
  )
}
