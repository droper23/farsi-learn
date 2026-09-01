import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { getTodaySummary } from '../lib/session'
import { getRecentMistakes } from '../storage/progressRepo'
import { db, getSettings, type SavedItem } from '../storage/db'
import { findVocab } from '../content/vocabulary'
import { findLetter } from '../content/alphabet'
import { findSentence } from '../content/sentences'
import { findGrammarConcept } from '../content/grammar'
import { useAsyncData } from '../hooks/useAsyncData'
import { PageHeader } from '../components/shared/PageHeader'
import { Card } from '../components/shared/Card'
import { Button } from '../components/shared/Button'
import { PersianText } from '../components/shared/PersianText'

function contentLabel(kind: string, itemId: string, savedItems: Map<string, SavedItem> | undefined): { fa?: string; en: string } {
  if (kind === 'vocab') { const v = findVocab(itemId); return v ? { fa: v.fa, en: v.en } : { en: itemId } }
  if (kind === 'alphabet') { const l = findLetter(itemId); return l ? { fa: l.forms.isolated, en: l.name } : { en: itemId } }
  if (kind === 'sentence') { const s = findSentence(itemId); return s ? { fa: s.fa, en: s.en } : { en: itemId } }
  if (kind === 'custom') { const c = savedItems?.get(itemId); return c ? { fa: c.fa, en: c.en } : { en: 'your saved word' } }
  const g = findGrammarConcept(itemId); return g ? { en: g.title } : { en: itemId }
}

export function Dashboard() {
  const navigate = useNavigate()
  const summary = useAsyncData(() => getTodaySummary(), [])
  const mistakes = useAsyncData(() => getRecentMistakes(5), [])
  const settings = useLiveQuery(() => getSettings(), [])
  const totalReviewables = useLiveQuery(() => db.reviewStates.count(), [])
  const savedItemsById = useLiveQuery(
    () => db.savedItems.toArray().then((items) => new Map(items.map((i) => [i.id, i]))),
    [],
  )

  const streak = settings?.currentStreak ?? 0

  return (
    <div>
      <PageHeader title="Farsi Learn" subtitle={streak > 0 ? `${streak}-day streak — keep it going` : 'Welcome back'} />

      <div className="flex flex-col gap-4 px-4 md:px-0">
        <Card className="flex flex-col gap-3 bg-[var(--color-brand-soft)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--color-brand-strong)]">Today</p>
              {summary.data && (
                <p className="text-lg font-semibold text-[var(--color-ink)]">
                  {summary.data.hasLesson
                    ? `Lesson ${summary.data.lessonNumber} of ${summary.data.totalLessons} — ${summary.data.currentUnit.title}`
                    : 'This unit is complete!'}
                </p>
              )}
            </div>
            <span className="fa-text text-3xl text-[var(--color-brand)]">ف</span>
          </div>
          {summary.data && (
            <p className="text-sm text-[var(--color-ink-muted)]">
              {summary.data.reviewsDue > 0
                ? `${summary.data.reviewsDue} review${summary.data.reviewsDue === 1 ? '' : 's'} due`
                : 'No reviews due right now'}
            </p>
          )}
          {summary.data && (
            <p className="text-sm text-[var(--color-ink-muted)]">
              {summary.data.newItemsToday} of {summary.data.newItemsCap} new items today
            </p>
          )}
          <div className="flex gap-2">
            {summary.data?.hasLesson && (
              <Button onClick={() => navigate('/lesson')} className="flex-1">Start lesson</Button>
            )}
            {summary.data && summary.data.reviewsDue > 0 && (
              <Button onClick={() => navigate('/review')} variant={summary.data.hasLesson ? 'secondary' : 'primary'} className="flex-1">
                Review ({summary.data.reviewsDue})
              </Button>
            )}
          </div>
          {summary.data && !summary.data.hasLesson && summary.data.reviewsDue === 0 && (
            <p className="text-sm text-[var(--color-ink-muted)]">
              You're all caught up! Browse the <a className="underline" href="#/dictionary">dictionary</a> or revisit a unit in{' '}
              <a className="underline" href="#/learn">Learn</a>.
            </p>
          )}
        </Card>

        <div className="grid grid-cols-3 gap-3">
          <Card className="text-center">
            <p className="text-2xl font-semibold">{streak}</p>
            <p className="text-xs text-[var(--color-ink-muted)]">Day streak</p>
          </Card>
          <Card className="text-center">
            <p className="text-2xl font-semibold">{totalReviewables ?? 0}</p>
            <p className="text-xs text-[var(--color-ink-muted)]">Items in progress</p>
          </Card>
          <Card className="text-center">
            <p className="text-2xl font-semibold">{settings?.longestStreak ?? 0}</p>
            <p className="text-xs text-[var(--color-ink-muted)]">Best streak</p>
          </Card>
        </div>

        {mistakes.data && mistakes.data.length > 0 && (
          <Card>
            <p className="mb-3 text-sm font-medium text-[var(--color-ink)]">Recent mix-ups</p>
            <ul className="flex flex-col gap-2">
              {mistakes.data.map((m) => {
                const label = contentLabel(m.kind, m.itemId, savedItemsById)
                return (
                  <li key={m.key} className="flex items-center justify-between text-sm">
                    {label.fa ? <PersianText fa={label.fa} size="sm" /> : <span>{label.en}</span>}
                    {label.fa && <span className="text-[var(--color-ink-muted)]">{label.en}</span>}
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
