import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, getSettings } from '../storage/db'
import { vocabulary } from '../content/vocabulary'
import { alphabet } from '../content/alphabet'
import { units } from '../content/curriculum/units'
import { findPassage } from '../content/passages'
import {
  categoryProgress, letterMastery, studiedDaysInMonth, daysInMonth,
  totalTeachableItemIds, estimateDaysToFinish,
} from '../lib/mastery'
import { computeMilestones } from '../lib/milestones'
import { PageHeader } from '../components/shared/PageHeader'
import { Card } from '../components/shared/Card'
import { Button } from '../components/shared/Button'

export function Stats() {
  const navigate = useNavigate()
  const [showAllCategories, setShowAllCategories] = useState(false)
  const reviewStates = useLiveQuery(() => db.reviewStates.toArray(), []) ?? []
  const unitProgress = useLiveQuery(() => db.unitProgress.toArray(), []) ?? []
  const learningEvents = useLiveQuery(() => db.learningEvents.toArray(), []) ?? []
  const settings = useLiveQuery(() => getSettings(), [])

  if (!settings) return <PageHeader title="Loading stats..." />

  // Started categories first (most relevant to a learner mid-curriculum),
  // then untouched ones — collapsed behind a toggle by default so a newer
  // learner isn't forced to scroll past ~20 zero-progress rows to see the
  // milestones card below. See Pass 4 UX review.
  const allCategories = categoryProgress(vocabulary, reviewStates)
  const startedCategories = allCategories.filter((c) => c.introduced > 0)
  const untouchedCategories = allCategories.filter((c) => c.introduced === 0)
  const categories = showAllCategories ? [...startedCategories, ...untouchedCategories] : startedCategories
  const letters = letterMastery(alphabet, reviewStates)
  // "Weak spots" mirrors the buildFocusedSession('weak') criteria in
  // lib/session.ts (lapsed at least once, or currently relearning) — kept
  // as a simple count here since the button just needs to know whether
  // there's anything to practice, not the exact set.
  const weakCount = reviewStates.filter((s) => !s.suspended && (s.lapseCount > 0 || s.state === 'relearning')).length
  const now = new Date()
  const studiedDays = studiedDaysInMonth(learningEvents.map((e) => e.timestamp), now)
  const monthDays = daysInMonth(now)
  const totalIds = totalTeachableItemIds(units, (pid) => findPassage(pid)?.sentenceIds ?? [])
  const introducedKeys = new Set(reviewStates.map((s) => s.key))
  const estimate = estimateDaysToFinish(totalIds, introducedKeys, settings.newItemsPerDay)
  const milestones = computeMilestones({
    reviewStates, unitProgress, units,
    currentStreak: settings.currentStreak, longestStreak: settings.longestStreak,
    totalAlphabetLetters: alphabet.length,
  })
  const achievedMilestones = milestones.filter((m) => m.achieved)
  const nextMilestones = milestones.filter((m) => !m.achieved).slice(0, 3)

  return (
    <div>
      <PageHeader title="Stats & Mastery" subtitle="A calm look at your progress — no scores, just where you stand" />
      <div className="flex flex-col gap-4 px-4 pb-8 md:px-0">
        <Card>
          <p className="mb-2 text-sm font-medium">Curriculum estimate</p>
          <p className="text-sm text-[var(--color-ink-muted)]">
            {estimate.introducedItems} of {estimate.totalItems} teachable items introduced so far.
          </p>
          <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
            {estimate.estimatedDays === null && 'Set a daily new-item goal above 0 to estimate a finish date.'}
            {estimate.estimatedDays === 0 && "You've been introduced to everything currently in the curriculum!"}
            {estimate.estimatedDays !== null && estimate.estimatedDays > 0 && (
              <>Estimated <strong>~{estimate.estimatedDays} day{estimate.estimatedDays === 1 ? '' : 's'}</strong> to reach the end of the curriculum at your current {estimate.newItemsPerDay}-new-item daily goal. This is a rough estimate, not a promise — it assumes you hit that goal every day.</>
            )}
          </p>
        </Card>

        <Card>
          <p className="mb-3 text-sm font-medium">This month</p>
          <div className="grid grid-cols-7 gap-1" aria-label={`${studiedDays.size} days studied this month`}>
            {monthDays.map((day) => (
              <div
                key={day}
                title={day}
                className={`aspect-square rounded ${studiedDays.has(day) ? 'bg-[var(--color-brand)]' : 'bg-[var(--color-surface-raised)]'}`}
              />
            ))}
          </div>
          <p className="mt-2 text-xs text-[var(--color-ink-muted)]">{studiedDays.size} day{studiedDays.size === 1 ? '' : 's'} studied this month</p>
        </Card>

        <Card>
          <p className="mb-3 text-sm font-medium">Letter mastery</p>
          <div className="grid grid-cols-8 gap-1.5">
            {letters.map(({ letter, level }) => (
              <div
                key={letter.id}
                title={`${letter.name}: ${level.replace('-', ' ')}`}
                className={`fa-text flex aspect-square items-center justify-center rounded-lg text-sm ${letterColor(level)}`}
              >
                {letter.forms.isolated}
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-[var(--color-ink-muted)]">
            <LegendDot className="bg-[var(--color-surface-raised)]" label="Not started" />
            <LegendDot className="bg-[var(--color-warn-soft)]" label="Introduced" />
            <LegendDot className="bg-[var(--color-brand-soft)]" label="Review" />
            <LegendDot className="bg-[var(--color-good-soft)]" label="Mastered" />
          </div>
        </Card>

        {weakCount > 0 && (
          <Card className="flex flex-col gap-2 bg-[var(--color-warn-soft)]">
            <p className="text-sm font-medium">Weak spots</p>
            <p className="text-sm text-[var(--color-ink-muted)]">
              {weakCount} item{weakCount === 1 ? '' : 's'} you've stumbled on before — practice these now, outside your regular due schedule.
            </p>
            <Button onClick={() => navigate('/focused', { state: { filterBy: 'weak' } })} fullWidth>
              Practice weak spots ({weakCount})
            </Button>
          </Card>
        )}

        <Card>
          <p className="mb-3 text-sm font-medium">Progress by category</p>
          <div className="flex flex-col gap-2">
            {categories.map((c) => (
              <div key={c.category}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="capitalize text-[var(--color-ink)]">{c.category.replace('-', ' ')}</span>
                  <span className="text-[var(--color-ink-muted)]">{c.introduced}/{c.total}{c.mastered > 0 ? ` (${c.mastered} mastered)` : ''}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[var(--color-surface-raised)]">
                  <div
                    className="h-full rounded-full bg-[var(--color-brand)]"
                    style={{ width: `${c.total > 0 ? Math.round((c.introduced / c.total) * 100) : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          {untouchedCategories.length > 0 && (
            <button
              type="button"
              onClick={() => setShowAllCategories((v) => !v)}
              className="mt-3 min-h-11 w-full text-center text-sm font-medium text-[var(--color-brand)]"
            >
              {showAllCategories
                ? 'Show only started categories'
                : `Show all categories (${untouchedCategories.length} not started)`}
            </button>
          )}
        </Card>

        <Card>
          <p className="mb-1 text-sm font-medium">Milestones ({achievedMilestones.length} of {milestones.length})</p>
          {achievedMilestones.length === 0 && (
            <p className="text-sm text-[var(--color-ink-muted)]">Keep going — your first milestone is close.</p>
          )}
          {achievedMilestones.length > 0 && (
            <ul className="mt-2 flex flex-col gap-2">
              {achievedMilestones.map((m) => (
                <li key={m.id} className="flex items-center gap-2 text-sm">
                  <span aria-hidden="true">🎉</span>
                  <span>
                    <span className="font-medium">{m.title}</span>
                    <span className="block text-xs text-[var(--color-ink-muted)]">{m.description}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
          {nextMilestones.length > 0 && (
            <>
              <p className="mb-1 mt-4 text-xs font-medium text-[var(--color-ink-muted)]">Up next</p>
              <ul className="flex flex-col gap-2">
                {nextMilestones.map((m) => (
                  <li key={m.id} className="flex items-center gap-2 text-sm text-[var(--color-ink-muted)]">
                    <span aria-hidden="true">○</span>
                    <span>{m.title}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}

function letterColor(level: string): string {
  if (level === 'mastered') return 'bg-[var(--color-good-soft)] text-[var(--color-good)]'
  if (level === 'review') return 'bg-[var(--color-brand-soft)] text-[var(--color-brand-strong)]'
  if (level === 'introduced') return 'bg-[var(--color-warn-soft)] text-[var(--color-warn)]'
  return 'bg-[var(--color-surface-raised)] text-[var(--color-ink-muted)]'
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1">
      <span className={`h-2.5 w-2.5 rounded-full ${className}`} />
      {label}
    </span>
  )
}
