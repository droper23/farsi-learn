import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { levels, unitsForLevel } from '../content/curriculum'
import { db } from '../storage/db'
import { PageHeader } from '../components/shared/PageHeader'
import { Card } from '../components/shared/Card'
import { ProgressBar } from '../components/shared/ProgressBar'

export function LessonMap() {
  const progress = useLiveQuery(() => db.unitProgress.toArray(), []) ?? []
  const progressById = new Map(progress.map((p) => [p.unitId, p]))
  // Units are shown in curriculum order as the recommended path, but every
  // unit is directly playable regardless of progress elsewhere — nothing
  // is gated behind finishing earlier units first.

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
                return (
                  <Link key={unit.id} to={`/learn/${unit.id}`}>
                    <Card className="flex items-center justify-between gap-3 transition-colors hover:border-[var(--color-brand)]">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">{unit.title}</p>
                        <p className="truncate text-xs text-[var(--color-ink-muted)]">{unit.description}</p>
                        <div className="mt-2 max-w-40">
                          <ProgressBar value={completed} max={unit.lessonCount} />
                        </div>
                      </div>
                      <span className={`shrink-0 text-xs font-medium ${done ? 'text-[var(--color-good)]' : 'text-[var(--color-ink-muted)]'}`}>
                        {done ? 'Done' : `${completed}/${unit.lessonCount}`}
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
