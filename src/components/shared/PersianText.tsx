import { useState } from 'react'
import { useSettings } from '../../hooks/useSettings'
import { canPronounce, pronouncePersian } from '../../lib/speech'

interface PersianTextProps {
  fa: string
  translit?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /** Overrides the global transliteration-visibility setting for this instance. */
  forceShowTranslit?: boolean
  showSpeak?: boolean
  className?: string
  /** Text to pronounce instead of `fa`, for cases where the displayed glyph
   *  isn't itself pronounceable in isolation — e.g. a bare alphabet
   *  consonant shown as its isolated form, where the letter's *name* (e.g.
   *  "به" for ب) is what actually has a pronunciation. Defaults to `fa`. */
  speakText?: string
}

const sizeClasses: Record<NonNullable<PersianTextProps['size']>, string> = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-3xl',
  xl: 'text-5xl',
}

/** The single place Persian script gets rendered — always tagged lang="fa"
 *  dir="rtl" with the self-hosted Vazirmatn font, with an optional inline
 *  transliteration line whose visibility follows the user's settings
 *  (learners are meant to eventually turn it off). */
export function PersianText({ fa, translit, size = 'md', forceShowTranslit, showSpeak, className, speakText }: PersianTextProps) {
  const settings = useSettings()
  const showTranslit = forceShowTranslit ?? settings.showTransliteration
  const textToSpeak = speakText ?? fa
  const [voiceAvailable] = useState(() => canPronounce(textToSpeak))

  return (
    <span className={`inline-flex flex-col items-center gap-1 ${className ?? ''}`}>
      <span className="inline-flex items-center gap-2">
        <bdi lang="fa" dir="rtl" className={`fa-text ${sizeClasses[size]}`}>{fa}</bdi>
        {showSpeak && (
          <button
            type="button"
            onClick={() => pronouncePersian(textToSpeak)}
            aria-label="Hear an approximate, computer-generated pronunciation"
            title={voiceAvailable ? 'Approximate pronunciation (computer-generated)' : 'No pronunciation available for this text'}
            className="shrink-0 rounded-full p-1.5 text-[var(--color-ink-muted)] hover:text-[var(--color-brand)] hover:bg-[var(--color-brand-soft)] disabled:opacity-30"
            disabled={!voiceAvailable}
          >
            <SpeakerIcon />
          </button>
        )}
      </span>
      {showTranslit && translit && (
        <span className="ltr-isolate text-sm text-[var(--color-ink-muted)]">{translit}</span>
      )}
    </span>
  )
}

function SpeakerIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" />
      <path d="M16.5 8.5a5 5 0 0 1 0 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
