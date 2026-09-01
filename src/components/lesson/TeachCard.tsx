import type { ReviewableKind } from '../../content/types'
import { findLetter } from '../../content/alphabet'
import { findVocab } from '../../content/vocabulary'
import { findGrammarConcept } from '../../content/grammar'
import { findSentence } from '../../content/sentences'
import { PersianText } from '../shared/PersianText'
import { Card } from '../shared/Card'
import { Button } from '../shared/Button'

interface Props {
  contentType: ReviewableKind
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
    </Card>
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
