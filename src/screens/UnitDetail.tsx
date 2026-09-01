import { useNavigate, useParams, Link } from 'react-router-dom'
import { findUnit } from '../content/curriculum'
import { findVocab } from '../content/vocabulary'
import { findLetter } from '../content/alphabet'
import { findGrammarConcept } from '../content/grammar'
import { findSentence } from '../content/sentences'
import { getCurrentUnit, getLessonsCompleted } from '../lib/session'
import { useAsyncData } from '../hooks/useAsyncData'
import { PageHeader } from '../components/shared/PageHeader'
import { Card } from '../components/shared/Card'
import { Button } from '../components/shared/Button'
import { PersianText } from '../components/shared/PersianText'
import { ProgressBar } from '../components/shared/ProgressBar'

export function UnitDetail() {
  const { unitId } = useParams()
  const navigate = useNavigate()
  const unit = unitId ? findUnit(unitId) : undefined
  const state = useAsyncData(async () => {
    if (!unit) return null
    const [current, completed] = await Promise.all([getCurrentUnit(), getLessonsCompleted(unit.id)])
    return { isCurrent: current.id === unit.id, completed, currentUnit: current }
  }, [unit?.id])

  if (!unit) return <PageHeader title="Unit not found" />

  const isDone = (state.data?.completed ?? 0) >= unit.lessonCount
  const isCurrent = state.data?.isCurrent ?? false
  const currentUnit = state.data?.currentUnit

  return (
    <div>
      <PageHeader title={unit.title} subtitle={unit.description} />
      <div className="flex flex-col gap-4 px-4 pb-6 md:px-0">
        <Card>
          <ProgressBar value={state.data?.completed ?? 0} max={unit.lessonCount} label={`${state.data?.completed ?? 0} of ${unit.lessonCount} lessons`} />
          <div className="mt-3">
            {!isDone && (
              <Button onClick={() => navigate(`/lesson/${unit.id}`)} fullWidth>
                {(state.data?.completed ?? 0) > 0 ? 'Continue this unit' : 'Start this unit'}
              </Button>
            )}
            {isDone && <p className="text-sm text-[var(--color-good)]">Unit complete — its items stay in your review queue.</p>}
          </div>
        </Card>

        {!isCurrent && !isDone && currentUnit && (
          <Card className="flex flex-col gap-2 bg-[var(--color-brand-soft)]">
            <p className="text-sm font-medium text-[var(--color-brand-strong)]">Recommended: your current unit</p>
            <p className="font-medium">{currentUnit.title}</p>
            <p className="text-sm text-[var(--color-ink-muted)]">{currentUnit.description}</p>
            <Button variant="secondary" onClick={() => navigate(`/lesson/${currentUnit.id}`)} fullWidth>Go to "{currentUnit.title}" instead</Button>
          </Card>
        )}

        {(unit.alphabetIds?.length ?? 0) > 0 && (
          <Card>
            <p className="mb-2 text-sm font-medium">Letters</p>
            <div className="flex flex-wrap gap-2">
              {unit.alphabetIds!.map((id) => {
                const l = findLetter(id)
                if (!l) return null
                return (
                  <Link key={id} to={`/alphabet/${id}`}>
                    <PersianText fa={l.forms.isolated} translit={l.name} size="lg" />
                  </Link>
                )
              })}
            </div>
          </Card>
        )}

        {(unit.vocabIds?.length ?? 0) > 0 && (
          <Card>
            <p className="mb-2 text-sm font-medium">Vocabulary ({unit.vocabIds!.length})</p>
            <ul className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
              {unit.vocabIds!.map((id) => {
                const v = findVocab(id)
                if (!v) return null
                return (
                  <li key={id} className="flex items-baseline justify-between gap-2 text-sm">
                    <bdi lang="fa" dir="rtl" className="fa-text">{v.fa}</bdi>
                    <span className="truncate text-[var(--color-ink-muted)]">{v.en}</span>
                  </li>
                )
              })}
            </ul>
          </Card>
        )}

        {(unit.grammarConceptIds?.length ?? 0) > 0 && (
          <Card>
            <p className="mb-2 text-sm font-medium">Grammar</p>
            <ul className="flex flex-col gap-1">
              {unit.grammarConceptIds!.map((id) => {
                const g = findGrammarConcept(id)
                return g ? <li key={id} className="text-sm">{g.title}</li> : null
              })}
            </ul>
          </Card>
        )}

        {(unit.sentenceIds?.length ?? 0) > 0 && (
          <Card>
            <p className="mb-2 text-sm font-medium">Example sentences</p>
            <ul className="flex flex-col gap-3">
              {unit.sentenceIds!.map((id) => {
                const s = findSentence(id)
                if (!s) return null
                return (
                  <li key={id}>
                    <PersianText fa={s.fa} translit={s.translit} size="sm" />
                    <p className="text-sm text-[var(--color-ink-muted)]">{s.en}</p>
                  </li>
                )
              })}
            </ul>
          </Card>
        )}
      </div>
    </div>
  )
}
