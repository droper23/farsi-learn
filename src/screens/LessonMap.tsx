import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { levels, unitsForLevel } from '../content/curriculum'
import { db } from '../storage/db'
import { getCurrentUnit } from '../lib/session'
import { useAsyncData } from '../hooks/useAsyncData'
import { PageHeader } from '../components/shared/PageHeader'
import { Card } from '../components/shared/Card'
import { ProgressBar } from '../components/shared/ProgressBar'

export function LessonMap() {
  const progress = useLiveQuery(() => db.unitProgress.toArray(), []) ?? []
  const progressById = new Map(progress.map((p) => [p.unitId, p]))
  // The curriculum is strictly sequential (buildNextLesson/getCurrentUnit
  // always picks the first not-yet-complete unit in order), so any unit
  // that isn't done and isn't the current one hasn't been reached yet —
  // reusing that same reachability rule here (UnitDetail already applies
  // it per-unit) to dim/lock those cards instead of every card looking
  // equally clickable. See Pass 4 UX review.
  const currentUnit = useAsyncData(() => getCurrentUnit(), [])

  return (
    <div>
      <PageHeader title="Learn" subtitle="Your path from the alphabet to advanced reading" />
      <div className="flex flex-col gap-8 px-4 pb-6 md:px-0">
        {levels.map((level) => (
          <section key={level.level}>
            <h2 className="mb-1 text-lg font-semibold">Level {level.level} — {level.title}</h2>
            <p className="mb-3 text-sm text-[var(--color-ink-muted)]">{level.goal}</p>
            <div className="flex flex-col gap-2">
              {unitsForLevel(level.level).map((unit) => {
                const completed = progressById.get(unit.id)?.lessonsCompleted ?? 0
                const done = completed >= unit.lessonCount
                const locked = !done && currentUnit.data !== null && currentUnit.data?.id !== unit.id
                return (
                  <Link key={unit.id} to={`/learn/${unit.id}`}>
                    <Card className={`flex items-center justify-between gap-3 transition-colors hover:border-[var(--color-brand)] ${locked ? 'opacity-60' : ''}`}>
                      <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-1.5 font-medium">
                          {locked && <LockIcon />}
                          {unit.title}
                        </p>
                        <p className="truncate text-xs text-[var(--color-ink-muted)]">{unit.description}</p>
                        <div className="mt-2 max-w-40">
                          <ProgressBar value={completed} max={unit.lessonCount} />
                        </div>
                      </div>
                      <span className={`shrink-0 text-xs font-medium ${done ? 'text-[var(--color-good)]' : 'text-[var(--color-ink-muted)]'}`}>
                        {done ? 'Done' : locked ? 'Locked' : `${completed}/${unit.lessonCount}`}
                      </span>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

function LockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0 text-[var(--color-ink-muted)]">
      <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}
