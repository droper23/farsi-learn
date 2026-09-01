import { useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { findLetter, alphabet } from '../../content/alphabet'
import { getOrCreateReviewState, recordReview } from '../../storage/progressRepo'
import { ratingFor } from '../../lib/exercises/grade'
import { generateLetterNameMcq, generateLetterPositionMcq, generateLetterSoundMcq } from '../../lib/exercises/generator'
import { PageHeader } from '../../components/shared/PageHeader'
import { Card } from '../../components/shared/Card'
import { Button } from '../../components/shared/Button'
import { PersianText } from '../../components/shared/PersianText'
import { ExerciseRunner } from '../../components/exercises/ExerciseRunner'

export function AlphabetLetterDetail() {
  const { letterId } = useParams()
  const letter = letterId ? findLetter(letterId) : undefined
  const [practicing, setPracticing] = useState(false)
  const [round, setRound] = useState(0)
  // Bumped on every "Practice this letter" click so the memo below
  // regenerates a fresh set of exercises (new distractors) each session,
  // rather than reusing the first session's questions forever.
  const [practiceSession, setPracticeSession] = useState(0)

  const exercises = useMemo(() => {
    if (!letter) return []
    return [generateLetterSoundMcq(letter), generateLetterNameMcq(letter), generateLetterPositionMcq(letter)]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [letter, practiceSession])

  if (!letter) return <PageHeader title="Letter not found" />

  async function startPractice() {
    await getOrCreateReviewState('alphabet', letter!.id)
    setRound(0)
    setPracticeSession((n) => n + 1)
    setPracticing(true)
  }

  async function onComplete(correct: boolean, hintsUsed: number) {
    const ex = exercises[round]
    const rating = ratingFor(ex, correct, hintsUsed)
    await recordReview('alphabet', letter!.id, rating, correct)
    if (round + 1 >= exercises.length) setPracticing(false)
    else setRound((r) => r + 1)
  }

  const idx = alphabet.findIndex((l) => l.id === letter.id)
  const prev = alphabet[idx - 1]
  const next = alphabet[idx + 1]

  if (practicing) {
    return (
      <div className="px-4 pt-5 md:px-0">
        <ExerciseRunner key={round} exercise={exercises[round]} onComplete={onComplete} />
      </div>
    )
  }

  return (
    <div>
      <PageHeader title={`${letter.name} — ${letter.nameFa}`} />
      <div className="flex flex-col gap-4 px-4 pb-8 md:px-0">
        <Card className="flex flex-col items-center gap-4 text-center">
          <PersianText fa={letter.forms.isolated} speakText={letter.nameFa} translit={letter.transliteration} size="xl" showSpeak />
          <p className="text-sm">{letter.soundDescription}</p>
          <div className="grid w-full grid-cols-4 gap-2 text-center text-xs text-[var(--color-ink-muted)]">
            <div><bdi lang="fa" dir="rtl" className="fa-text block text-2xl">{letter.forms.isolated}</bdi>Isolated</div>
            <div><bdi lang="fa" dir="rtl" className="fa-text block text-2xl">{letter.forms.initial}</bdi>Initial</div>
            <div><bdi lang="fa" dir="rtl" className="fa-text block text-2xl">{letter.forms.medial}</bdi>Medial</div>
            <div><bdi lang="fa" dir="rtl" className="fa-text block text-2xl">{letter.forms.final}</bdi>Final</div>
          </div>
          {letter.oftenConfusedWith && letter.oftenConfusedWith.length > 0 && (
            <p className="text-xs text-[var(--color-accent)]">
              Often confused with: {letter.oftenConfusedWith.map((id) => findLetter(id)?.forms.isolated).join(' ')}
            </p>
          )}
          {letter.homophoneNote && (
            <div className="w-full rounded-xl bg-[var(--color-warn-soft)] px-3 py-2 text-left text-sm text-[var(--color-ink)]">
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[var(--color-warn)]">Sounds the same as another letter</p>
              <p>{letter.homophoneNote}</p>
            </div>
          )}
          <Button onClick={startPractice}>Practice this letter</Button>
        </Card>

        <Card>
          <p className="mb-2 text-sm font-medium">Example words</p>
          <div className="flex flex-wrap gap-4">
            {letter.exampleWords.map((w, i) => (
              <div key={i} className="text-center">
                <PersianText fa={w.fa} translit={w.translit} showSpeak />
                <p className="text-xs text-[var(--color-ink-muted)]">{w.en}</p>
              </div>
            ))}
          </div>
        </Card>

        <div className="flex justify-between text-sm">
          {prev ? <Link to={`/alphabet/${prev.id}`} className="text-[var(--color-brand)]">← {prev.name}</Link> : <span />}
          {next ? <Link to={`/alphabet/${next.id}`} className="text-[var(--color-brand)]">{next.name} →</Link> : <span />}
        </div>
      </div>
    </div>
  )
}
