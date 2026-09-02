import { useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { passages } from '../content/passages'
import { findUnit } from '../content/curriculum'
import { generatePassageComprehensionMcq } from '../lib/exercises/generator'
import { PageHeader } from '../components/shared/PageHeader'
import { Card } from '../components/shared/Card'
import { Button } from '../components/shared/Button'
import { PassageTeach } from '../components/lesson/TeachCard'
import { ExerciseRunner } from '../components/exercises/ExerciseRunner'

interface ReadingState {
  /** Set when arriving from Practice tab's "Reading practice" for one
   *  specific unit — narrows the list to just that unit's passages
   *  instead of the whole library. */
  unitId?: string
}

/** Reading library (review M3): the four Level-6 passages were previously
 *  viewable only once, while their lesson was being taught, with no way to
 *  come back and re-read them — even though re-reading is the whole point
 *  of reading-comprehension practice. This is a pure browse/re-read
 *  surface reusing PassageTeach; "mark as read again" is purely cosmetic
 *  (no new SRS tracking — the passage's sentences are already individually
 *  tracked wherever they were first taught). */
export function Reading() {
  const location = useLocation()
  const { unitId } = (location.state as ReadingState | null) ?? {}
  const unit = unitId ? findUnit(unitId) : undefined
  const visiblePassages = unit ? passages.filter((p) => unit.passageIds?.includes(p.id)) : passages
  const [openId, setOpenId] = useState<string | null>(null)
  const [quizId, setQuizId] = useState<string | null>(null)

  if (quizId) {
    return <PassageQuiz passageId={quizId} onExit={() => setQuizId(null)} />
  }

  return (
    <div>
      <PageHeader
        title="Reading practice"
        subtitle={unit ? `Passages from ${unit.title}` : "Revisit any passage you've already learned, or re-check your comprehension"}
      />
      <div className="flex flex-col gap-3 px-4 pb-8 md:px-0">
        {visiblePassages.length === 0 && (
          <p className="text-sm text-[var(--color-ink-muted)]">
            {unit ? "This unit doesn't have any reading passages." : 'No reading passages yet.'}
          </p>
        )}
        {visiblePassages.map((p) => {
          const isOpen = openId === p.id
          return (
            <Card key={p.id} className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : p.id)}
                aria-expanded={isOpen}
                className="flex items-center justify-between gap-3 text-left"
              >
                <div className="min-w-0">
                  <p className="font-medium">{p.title}</p>
                  {p.titleFa && <bdi lang="fa" dir="rtl" className="fa-text block text-sm text-[var(--color-ink-muted)]">{p.titleFa}</bdi>}
                  <p className="text-xs text-[var(--color-ink-muted)]">{p.level} · {p.register}</p>
                </div>
                <span className="shrink-0 text-[var(--color-ink-muted)]" aria-hidden="true">{isOpen ? '▲' : '▼'}</span>
              </button>

              {isOpen && (
                <div className="flex flex-col gap-3">
                  <PassageTeach id={p.id} />
                  {p.comprehensionQuestions.length > 0 && (
                    <Button variant="secondary" onClick={() => setQuizId(p.id)} fullWidth>
                      Practice comprehension questions
                    </Button>
                  )}
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}

function PassageQuiz({ passageId, onExit }: { passageId: string; onExit: () => void }) {
  const passage = passages.find((p) => p.id === passageId)
  const [index, setIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)

  const questions = passage?.comprehensionQuestions ?? []
  // Memoized so this generates one fresh exercise per question index (new
  // distractor shuffle each time it's practiced), not a brand-new id on
  // every unrelated re-render — exerciseId() is not deterministic, and a
  // changing key would remount McqRunner mid-answer, wiping its selection.
  // Depends on passage.id/questions.length (stable primitives), not the
  // `questions` array reference, which is a fresh `[]` on every render
  // when there's no passage.
  const exercise = useMemo(
    () => (passage && index < questions.length ? generatePassageComprehensionMcq(passage.id, questions[index]) : null),
    // oxlint-disable-next-line react-hooks/exhaustive-deps
    [passage?.id, questions.length, index],
  )

  if (!passage) return null

  if (index >= questions.length) {
    return (
      <div>
        <PageHeader title="Comprehension check complete!" />
        <div className="flex flex-col gap-4 px-4 md:px-0">
          <Card className="text-center">
            <p className="text-3xl font-semibold text-[var(--color-good)]">{Math.round((correctCount / questions.length) * 100)}%</p>
            <p className="text-sm text-[var(--color-ink-muted)]">{correctCount} of {questions.length} correct</p>
          </Card>
          <Button onClick={onExit} fullWidth>Back to reading</Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="px-4 pt-5 md:px-0">
        <div className="mb-4 flex items-center gap-3">
          <button onClick={onExit} aria-label="Exit comprehension check" className="text-[var(--color-ink-muted)]">✕</button>
          <p className="text-sm text-[var(--color-ink-muted)]">{passage.title} — question {index + 1} of {questions.length}</p>
        </div>
      </div>
      <div className="px-4 pb-8 md:px-0">
        {exercise && (
          <ExerciseRunner
            exercise={exercise}
            onComplete={(correct) => {
              if (correct) setCorrectCount((n) => n + 1)
              setIndex((i) => i + 1)
            }}
          />
        )}
      </div>
    </div>
  )
}
