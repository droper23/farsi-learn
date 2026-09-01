import type { ReviewableKind, VocabItem } from '../../content/types'
import { findLetter } from '../../content/alphabet'
import { findVocab } from '../../content/vocabulary'
import { findGrammarConcept } from '../../content/grammar'
import { findSentence } from '../../content/sentences'
import { findPassage } from '../../content/passages'
import { conjugate, hasRegularPresent, type ConjugationTense } from '../../lib/conjugation'
import { PersianText } from '../shared/PersianText'
import { Card } from '../shared/Card'
import { Button } from '../shared/Button'

interface Props {
  contentType: ReviewableKind | 'passage'
  id: string
  onContinue: () => void
}

export function TeachCard({ contentType, id, onContinue }: Props) {
  return (
    <div className="flex flex-col gap-5">
      {contentType === 'alphabet' && <AlphabetTeach id={id} />}
      {contentType === 'vocab' && <VocabTeach id={id} />}
      {contentType === 'grammar' && <GrammarTeach id={id} />}
      {contentType === 'sentence' && <SentenceTeach id={id} />}
      {contentType === 'passage' && <PassageTeach id={id} />}
      <Button onClick={onContinue} fullWidth>Got it</Button>
    </div>
  )
}

function AlphabetTeach({ id }: { id: string }) {
  const l = findLetter(id)
  if (!l) return null
  return (
    <Card className="flex flex-col items-center gap-4 text-center">
      <PersianText fa={l.forms.isolated} translit={`${l.name} — ${l.transliteration}`} size="xl" showSpeak />
      <p className="text-sm text-[var(--color-ink)]">{l.soundDescription}</p>
      <div className="grid w-full grid-cols-4 gap-2 text-center text-xs text-[var(--color-ink-muted)]">
        <div><bdi lang="fa" dir="rtl" className="fa-text block text-xl">{l.forms.isolated}</bdi>Isolated</div>
        <div><bdi lang="fa" dir="rtl" className="fa-text block text-xl">{l.forms.initial}</bdi>Initial</div>
        <div><bdi lang="fa" dir="rtl" className="fa-text block text-xl">{l.forms.medial}</bdi>Medial</div>
        <div><bdi lang="fa" dir="rtl" className="fa-text block text-xl">{l.forms.final}</bdi>Final</div>
      </div>
      {!l.joinsNext && <p className="text-xs text-[var(--color-accent)]">This letter never connects to the letter after it.</p>}
      <div className="flex flex-wrap justify-center gap-3">
        {l.exampleWords.map((w, i) => (
          <div key={i} className="text-center">
            <PersianText fa={w.fa} translit={w.translit} size="sm" />
            <p className="text-xs text-[var(--color-ink-muted)]">{w.en}</p>
          </div>
        ))}
      </div>
    </Card>
  )
}

function VocabTeach({ id }: { id: string }) {
  const v = findVocab(id)
  if (!v) return null
  return (
    <Card className="flex flex-col items-center gap-3 text-center">
      <PersianText fa={v.fa} translit={v.translit} size="xl" showSpeak />
      <p className="text-lg font-medium">{v.en}</p>
      {v.literalEn && <p className="text-xs text-[var(--color-ink-muted)]">Literally: {v.literalEn}</p>}
      {v.notes && <p className="text-sm text-[var(--color-ink-muted)]">{v.notes}</p>}
      {v.register !== 'neutral' && (
        <span className="rounded-full bg-[var(--color-warn-soft)] px-2 py-0.5 text-xs">{v.register}</span>
      )}
      {v.pos === 'verb' && v.verbStems && <ConjugationTable verb={v} />}
    </Card>
  )
}

/** Shows the full present + simple-past conjugation paradigm for a verb,
 *  computed from its stored stems via the rule-based lib/conjugation.ts
 *  (see that file for the rule set and sourcing). Purely a teaching aid —
 *  see generateConjugationMcq/TypeAnswer in lib/exercises/generator.ts for
 *  where this gets drilled. */
function ConjugationTable({ verb }: { verb: VocabItem }) {
  return (
    <div className="mt-1 flex w-full flex-col gap-3 border-t border-[var(--color-border)] pt-3 text-left">
      <p className="text-center text-xs font-medium text-[var(--color-ink-muted)]">Conjugation</p>
      {hasRegularPresent(verb)
        ? <ConjugationRows verb={verb} tense="present" label="Present" />
        : (
          <div>
            <p className="mb-1 text-xs font-medium text-[var(--color-ink-muted)]">Present (irregular — copula)</p>
            <ConjugationRows verb={verb} tense="present" label="Present" />
          </div>
        )}
      <ConjugationRows verb={verb} tense="past" label="Simple past" />
    </div>
  )
}

function ConjugationRows({ verb, tense, label }: { verb: VocabItem; tense: ConjugationTense; label: string }) {
  const forms = conjugate(verb, tense)
  return (
    <div className="rounded-xl bg-[var(--color-surface-raised)] p-3">
      <p className="mb-2 text-xs font-medium text-[var(--color-ink-muted)]">{label}</p>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
        {forms.map((f) => (
          <div key={f.person} className="flex items-baseline justify-between gap-2 text-sm">
            <span className="text-[var(--color-ink-muted)]">{f.pronounFa}</span>
            <bdi lang="fa" dir="rtl" className="fa-text">{f.fa}</bdi>
          </div>
        ))}
      </div>
    </div>
  )
}

function GrammarTeach({ id }: { id: string }) {
  const g = findGrammarConcept(id)
  if (!g) return null
  return (
    <Card className="flex flex-col gap-3">
      <p className="text-lg font-semibold">{g.title}</p>
      {g.explanation.map((p, i) => <p key={i} className="text-sm text-[var(--color-ink)]">{p}</p>)}
      {g.exampleSentenceIds.slice(0, 2).map((sid) => {
        const s = findSentence(sid)
        if (!s) return null
        return (
          <div key={sid} className="rounded-xl bg-[var(--color-surface-raised)] p-3">
            <PersianText fa={s.fa} translit={s.translit} size="sm" />
            <p className="mt-1 text-sm text-[var(--color-ink-muted)]">{s.en}</p>
          </div>
        )
      })}
      {g.commonMistake && (
        <p className="text-xs text-[var(--color-accent)]">Watch out: {g.commonMistake}</p>
      )}
    </Card>
  )
}

function SentenceTeach({ id }: { id: string }) {
  const s = findSentence(id)
  if (!s) return null
  return (
    <Card className="flex flex-col items-center gap-3 text-center">
      {s.speaker && (
        <span className="self-start rounded-full bg-[var(--color-surface-raised)] px-2 py-0.5 text-xs font-medium text-[var(--color-ink-muted)]">{s.speaker}</span>
      )}
      <PersianText fa={s.fa} translit={s.translit} size="lg" showSpeak />
      <p className="text-base font-medium">{s.en}</p>
      {s.literalEn && <p className="text-xs text-[var(--color-ink-muted)]">Literally: {s.literalEn}</p>}
      <div className="flex flex-wrap justify-center gap-2 border-t border-[var(--color-border)] pt-3">
        {s.words.map((w, i) => (
          <div key={i} className="text-center">
            <bdi lang="fa" dir="rtl" className="fa-text block text-base">{w.fa}</bdi>
            <p className="text-xs text-[var(--color-ink-muted)]">{w.en}</p>
          </div>
        ))}
      </div>
    </Card>
  )
}

function PassageTeach({ id }: { id: string }) {
  const p = findPassage(id)
  if (!p) return null
  const sentences = p.sentenceIds.map(findSentence).filter((s): s is NonNullable<typeof s> => !!s)
  return (
    <Card className="flex flex-col gap-4">
      <div className="text-center">
        <p className="text-lg font-semibold">{p.title}</p>
        {p.titleFa && <bdi lang="fa" dir="rtl" className="fa-text block text-base text-[var(--color-ink-muted)]">{p.titleFa}</bdi>}
        <span className="mt-1 inline-block rounded-full bg-[var(--color-warn-soft)] px-2 py-0.5 text-xs">{p.register}</span>
      </div>
      <div className="flex flex-col gap-4">
        {sentences.map((s) => (
          <div key={s.id} className="rounded-xl bg-[var(--color-surface-raised)] p-3">
            <PersianText fa={s.fa} translit={s.translit} size="sm" showSpeak />
            <p className="mt-1 text-sm font-medium">{s.en}</p>
            <div className="mt-2 flex flex-wrap gap-2 border-t border-[var(--color-border)] pt-2">
              {s.words.map((w, i) => (
                <div key={i} className="text-center">
                  <bdi lang="fa" dir="rtl" className="fa-text block text-sm">{w.fa}</bdi>
                  <p className="text-[10px] text-[var(--color-ink-muted)]">{w.en}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
