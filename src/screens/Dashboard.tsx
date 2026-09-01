import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { getTodaySummary } from '../lib/session'
import { recommendDailyPlan, type PlanAction } from '../lib/dailyPlan'
import { computeMilestones } from '../lib/milestones'
import { getRecentMistakes } from '../storage/progressRepo'
import { db, getSettings, type SavedItem } from '../storage/db'
import { findVocab } from '../content/vocabulary'
import { findLetter } from '../content/alphabet'
import { alphabet } from '../content/alphabet'
import { findSentence } from '../content/sentences'
import { findGrammarConcept } from '../content/grammar'
import { units } from '../content/curriculum/units'
import { useAsyncData } from '../hooks/useAsyncData'
import { useMilestoneBanner } from '../hooks/useMilestoneBanner'
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
  const reviewStates = useLiveQuery(() => db.reviewStates.toArray(), [])
  const unitProgress = useLiveQuery(() => db.unitProgress.toArray(), [])
  const milestones = reviewStates && unitProgress && settings
    ? computeMilestones({
        reviewStates, unitProgress, units,
        currentStreak: settings.currentStreak, longestStreak: settings.longestStreak,
        totalAlphabetLetters: alphabet.length,
      })
    : null
  const { banner, dismiss } = useMilestoneBanner(milestones)

  const streak = settings?.currentStreak ?? 0
  const plan = summary.data
    ? recommendDailyPlan({
        reviewsDue: summary.data.reviewsDue,
        hasLesson: summary.data.hasLesson,
        newItemsToday: summary.data.newItemsToday,
        newItemsCap: summary.data.newItemsCap,
      })
    : null
  const actionLabel: Record<PlanAction, string> = {
    lesson: summary.data ? `Start lesson (${summary.data.lessonNumber} of ${summary.data.totalLessons})` : 'Start lesson',
    review: summary.data ? `Review (${summary.data.reviewsDue})` : 'Review',
  }

  return (
    <div>
      <PageHeader title="Farsi Learn" subtitle={streak > 0 ? `${streak}-day streak — keep it going` : 'Welcome back'} />

      <div className="flex flex-col gap-4 px-4 md:px-0">
        {banner && (
          <Card aria-live="polite" className="flex items-center justify-between gap-3 bg-[var(--color-good-soft)]">
            <div className="flex items-center gap-2">
              <span className="text-xl" aria-hidden="true">🎉</span>
              <div>
                <p className="text-sm font-semibold text-[var(--color-good)]">Milestone: {banner.title}</p>
                <p className="text-xs text-[var(--color-ink-muted)]">{banner.description}</p>
              </div>
            </div>
            <button onClick={dismiss} aria-label="Dismiss milestone banner" className="min-h-11 min-w-11 shrink-0 text-[var(--color-ink-muted)]">✕</button>
          </Card>
        )}
        <Card className="flex flex-col gap-3 bg-[var(--color-brand-soft)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--color-brand-strong)]">Today's plan</p>
              {summary.data && plan && (
                <p className="text-lg font-semibold text-[var(--color-ink)]">{plan.headline}</p>
              )}
            </div>
            <span className="fa-text text-3xl text-[var(--color-brand)]">ف</span>
          </div>
          {summary.data && (
            <p className="text-sm text-[var(--color-ink-muted)]">
              {summary.data.hasLesson
                ? `Current unit: ${summary.data.currentUnit.title} (lesson ${summary.data.lessonNumber} of ${summary.data.totalLessons})`
                : 'Current unit complete'}
              {' · '}
              {summary.data.newItemsToday} of {summary.data.newItemsCap} new items today
            </p>
          )}
          {plan && plan.steps.length > 0 && (
            <ol className="flex flex-col gap-2">
              {plan.steps.map((step, i) => (
                <li key={step.action} className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand)] text-[10px] font-semibold text-white">{i + 1}</span>
                    <Button
                      onClick={() => navigate(step.action === 'lesson' ? '/lesson' : '/review')}
                      variant={i === 0 ? 'primary' : 'secondary'}
                      className="flex-1"
                    >
                      {actionLabel[step.action]}
                    </Button>
                  </div>
                  <p className="pl-7 text-xs text-[var(--color-ink-muted)]">{step.reason}</p>
                </li>
              ))}
            </ol>
          )}
          {plan && plan.steps.length === 0 && (
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
                  <li key={m.key} className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-sm">
                    {label.fa
                      ? <div className="min-w-0 max-w-full"><PersianText fa={label.fa} size="sm" /></div>
                      : <span>{label.en}</span>}
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
