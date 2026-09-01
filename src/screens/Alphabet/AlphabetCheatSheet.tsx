import { useState } from 'react'
import { Link } from 'react-router-dom'
import { alphabet } from '../../content/alphabet'
import type { AlphabetLetter } from '../../content/types'
import { PageHeader } from '../../components/shared/PageHeader'
import { Card } from '../../components/shared/Card'
import { PersianText } from '../../components/shared/PersianText'

/** A dense, all-on-one-page reference: every letter in dictionary order,
 *  collapsed to its glyph/name/transliteration by default so the whole
 *  alphabet fits in a quick scroll, expandable per-letter (or all at once)
 *  to see forms, pronunciation, and whether it's a "non-joining" (break)
 *  letter — the thing a learner actually reaches for a cheat sheet to
 *  check mid-read, as opposed to the one-letter-at-a-time detail/practice
 *  flow at /alphabet/:letterId. */
export function AlphabetCheatSheet() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const allExpanded = expanded.size === alphabet.length

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll() {
    setExpanded(allExpanded ? new Set() : new Set(alphabet.map((l) => l.id)))
  }

  return (
    <div>
      <PageHeader title="Alphabet cheat sheet" subtitle="Every letter at a glance — tap one to expand its forms, sound, and break-letter status" />
      <div className="flex flex-col gap-3 px-4 pb-8 md:px-0">
        <div className="flex items-center justify-between">
          <p className="text-xs text-[var(--color-ink-muted)]">
            <span className="mr-1 inline-block rounded-full bg-[var(--color-warn-soft)] px-2 py-0.5 font-medium text-[var(--color-warn)]">non-joining</span>
            = never connects to the letter after it — the word breaks into a new connected chunk there.
          </p>
          <button
            type="button"
            onClick={toggleAll}
            className="shrink-0 text-sm font-medium text-[var(--color-brand)] underline"
          >
            {allExpanded ? 'Collapse all' : 'Expand all'}
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {alphabet.map((letter) => (
            <LetterRow
              key={letter.id}
              letter={letter}
              isExpanded={expanded.has(letter.id)}
              onToggle={() => toggle(letter.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function LetterRow({ letter, isExpanded, onToggle }: { letter: AlphabetLetter; isExpanded: boolean; onToggle: () => void }) {
  return (
    <Card className="!p-0 overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <bdi lang="fa" dir="rtl" className="fa-text w-10 shrink-0 text-2xl">{letter.forms.isolated}</bdi>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">
            {letter.name} <span className="text-[var(--color-ink-muted)]">— {letter.nameFa}</span>
          </p>
          <p className="truncate text-xs text-[var(--color-ink-muted)]">{letter.transliteration}</p>
        </div>
        {!letter.joinsNext && (
          <span className="shrink-0 rounded-full bg-[var(--color-warn-soft)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-warn)]">
            non-joining
          </span>
        )}
        <span className="shrink-0 text-[var(--color-ink-muted)]" aria-hidden="true">{isExpanded ? '▲' : '▼'}</span>
      </button>

      {isExpanded && (
        <div className="flex flex-col gap-4 border-t border-[var(--color-border)] px-4 py-4">
          <div className="grid grid-cols-4 gap-2 text-center text-xs text-[var(--color-ink-muted)]">
            <div><bdi lang="fa" dir="rtl" className="fa-text block text-xl">{letter.forms.isolated}</bdi>Isolated</div>
            <div><bdi lang="fa" dir="rtl" className="fa-text block text-xl">{letter.forms.initial}</bdi>Initial</div>
            <div><bdi lang="fa" dir="rtl" className="fa-text block text-xl">{letter.forms.medial}</bdi>Medial</div>
            <div><bdi lang="fa" dir="rtl" className="fa-text block text-xl">{letter.forms.final}</bdi>Final</div>
          </div>

          <p className="text-sm">
            {letter.joinsNext
              ? 'Joins the letter after it — connects normally within a word.'
              : 'Non-joining (a "break" letter) — never connects to the letter after it, even mid-word.'}
          </p>

          <div>
            <p className="text-sm">{letter.soundDescription}</p>
            <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
              Sounds like: {letter.englishSoundHint}{letter.ipa ? ` · IPA: /${letter.ipa}/` : ''}
            </p>
          </div>

          {letter.oftenConfusedWith && letter.oftenConfusedWith.length > 0 && (
            <p className="text-xs text-[var(--color-accent)]">
              Often confused with: {letter.oftenConfusedWith
                .map((id) => alphabet.find((l) => l.id === id))
                .filter((l): l is AlphabetLetter => !!l)
                .map((l) => `${l.forms.isolated} (${l.name})`)
                .join(', ')}
            </p>
          )}

          {letter.homophoneNote && (
            <div className="rounded-xl bg-[var(--color-warn-soft)] px-3 py-2 text-sm text-[var(--color-ink)]">
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[var(--color-warn)]">Sounds the same as another letter</p>
              <p>{letter.homophoneNote}</p>
            </div>
          )}

          {letter.exampleWords.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium text-[var(--color-ink-muted)]">Example words</p>
              <div className="flex flex-wrap gap-4">
                {letter.exampleWords.map((w, i) => (
                  <div key={i} className="text-center">
                    <PersianText fa={w.fa} translit={w.translit} size="sm" showSpeak />
                    <p className="text-xs text-[var(--color-ink-muted)]">{w.en}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Link to={`/alphabet/${letter.id}`} className="text-sm font-medium text-[var(--color-brand)] underline">
            Full letter page & practice →
          </Link>
        </div>
      )}
    </Card>
  )
}
