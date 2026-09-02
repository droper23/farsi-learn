import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { levels, unitsForLevel } from '../content/curriculum'
import { db } from '../storage/db'
import { PageHeader } from '../components/shared/PageHeader'
import { Card } from '../components/shared/Card'
import { ProgressBar } from '../components/shared/ProgressBar'

/** The practice hub: every way to drill material outside the day's
 *  scheduled review queue, in one place — weak spots, writing practice,
 *  reading practice, and (new) jumping into any unit/lesson directly,
 *  regardless of curriculum order or due dates. Previously these entry
 *  points were scattered (weak spots buried in Stats, no unit-picker, no
 *  writing or reading mode at all). */
export function Practice() {
  const navigate = useNavigate()
  const progress = useLiveQuery(() => db.unitProgress.toArray(), []) ?? []
  const progressById = new Map(progress.map((p) => [p.unitId, p]))
  const [openUnitId, setOpenUnitId] = useState<string | null>(null)

  return (
    <div>
      <PageHeader title="Practice" subtitle="Drill anything you've already learned, any time — not just what's due today" />
      <div className="flex flex-col gap-6 px-4 pb-8 md:px-0">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => navigate('/focused', { state: { filterBy: 'weak' } })}
            className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-left hover:border-[var(--color-brand)] hover:bg-[var(--color-brand-soft)]"
          >
            <p className="font-medium">Weak spots</p>
            <p className="mt-1 text-xs text-[var(--color-ink-muted)]">Things you keep getting wrong, across everything you've learned.</p>
          </button>
          <button
            type="button"
            onClick={() => navigate('/focused', { state: { writing: true } })}
            className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-left hover:border-[var(--color-brand)] hover:bg-[var(--color-brand-soft)]"
          >
            <p className="font-medium">Writing practice</p>
            <p className="mt-1 text-xs text-[var(--color-ink-muted)]">Type the Persian for words you already know — production, not recognition.</p>
          </button>
          <Link
            to="/reading"
            className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 hover:border-[var(--color-brand)] hover:bg-[var(--color-brand-soft)]"
          >
            <p className="font-medium">Reading practice</p>
            <p className="mt-1 text-xs text-[var(--color-ink-muted)]">Revisit any passage and re-check your comprehension.</p>
          </Link>
        </div>

        <section>
          <h2 className="mb-1 text-lg font-semibold">Practice by unit</h2>
          <p className="mb-3 text-sm text-[var(--color-ink-muted)]">
            Jump into any unit's material directly — you don't need to finish earlier units first, and it doesn't have to be due for review.
          </p>
          <div className="flex flex-col gap-6">
            {levels.map((level) => (
              <div key={level.level}>
                <h3 className="mb-2 text-sm font-medium text-[var(--color-ink-muted)]">Level {level.level} — {level.title}</h3>
                <div className="flex flex-col gap-2">
                  {unitsForLevel(level.level).map((unit) => {
                    const completed = progressById.get(unit.id)?.lessonsCompleted ?? 0
                    const isOpen = openUnitId === unit.id
                    const hasPassages = (unit.passageIds?.length ?? 0) > 0
                    return (
                      <Card key={unit.id} className="flex flex-col gap-3">
                        <button
                          type="button"
                          aria-expanded={isOpen}
                          aria-label={`Choose a way to practice ${unit.title}`}
                          onClick={() => setOpenUnitId(isOpen ? null : unit.id)}
                          className="flex items-center justify-between gap-3 text-left"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-medium">{unit.title}</p>
                            {completed > 0 ? (
                              <div className="mt-2 max-w-40">
                                <ProgressBar value={completed} max={unit.lessonCount} />
                              </div>
                            ) : (
                              <p className="text-xs text-[var(--color-ink-muted)]">Not started yet</p>
                            )}
                          </div>
                          <span className="shrink-0 text-[var(--color-ink-muted)]" aria-hidden="true">{isOpen ? '▲' : '▼'}</span>
                        </button>

                        {isOpen && (
                          <div className="grid grid-cols-2 gap-2 border-t border-[var(--color-border)] pt-3 sm:grid-cols-4">
                            <button
                              type="button"
                              onClick={() => navigate('/focused', { state: { filterBy: 'unit', unitId: unit.id } })}
                              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-left text-sm font-medium hover:border-[var(--color-brand)] hover:bg-[var(--color-brand-soft)]"
                            >
                              Standard practice
                            </button>
                            <button
                              type="button"
                              onClick={() => navigate('/focused', { state: { filterBy: 'unit', unitId: unit.id, onlyWeak: true } })}
                              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-left text-sm font-medium hover:border-[var(--color-brand)] hover:bg-[var(--color-brand-soft)]"
                            >
                              Weak spots
                            </button>
                            <button
                              type="button"
                              onClick={() => navigate('/focused', { state: { writing: true, unitId: unit.id } })}
                              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-left text-sm font-medium hover:border-[var(--color-brand)] hover:bg-[var(--color-brand-soft)]"
                            >
                              Writing practice
                            </button>
                            {hasPassages && (
                              <Link
                                to="/reading"
                                state={{ unitId: unit.id }}
                                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-left text-sm font-medium hover:border-[var(--color-brand)] hover:bg-[var(--color-brand-soft)]"
                              >
                                Reading practice
                              </Link>
                            )}
                          </div>
                        )}
                      </Card>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
