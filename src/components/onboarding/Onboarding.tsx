import { useState } from 'react'
import { updateSettings } from '../../storage/db'
import { Card } from '../shared/Card'
import { Button } from '../shared/Button'
import { PersianText } from '../shared/PersianText'

interface Props {
  /** Called once onboarding is done and settings are saved — the caller
   *  decides where to send the learner next (first lesson vs. dashboard). */
  onFinish: (destination: 'lesson' | 'dashboard') => void
}

const GOAL_PRESETS: Array<{ value: number; label: string }> = [
  { value: 5, label: 'Casual — 5 new items a day' },
  { value: 10, label: 'Steady — 10 new items a day' },
  { value: 15, label: 'Focused — 15 new items a day' },
  { value: 25, label: 'Intense — 25 new items a day' },
]

const TOTAL_STEPS = 4

/** First-run welcome flow, shown once (gated on the `onboardingComplete`
 *  setting — see App.tsx). Deliberately short: four small steps rather than
 *  a long walkthrough, since the goal is to get a beginner reading Persian,
 *  not to read about the app. */
export function Onboarding({ onFinish }: Props) {
  const [step, setStep] = useState(0)
  // Defaults to "Steady" (10/day), not the more aggressive "Focused" (15/day)
  // — a brand-new learner who hasn't finished a single lesson yet shouldn't
  // be pre-committed to the second-most-aggressive daily goal; overcommitting
  // on day one is a classic churn trap. See Pass 4 UX review.
  const [goal, setGoal] = useState(10)
  const [showTranslit, setShowTranslit] = useState(true)
  const [saving, setSaving] = useState(false)

  async function finish(destination: 'lesson' | 'dashboard') {
    if (saving) return
    setSaving(true)
    await updateSettings({
      onboardingComplete: true,
      newItemsPerDay: goal,
      showTransliteration: showTranslit,
    })
    onFinish(destination)
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 px-6 py-10">
      <div
        className="flex justify-center gap-1.5"
        // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
        role="progressbar"
        aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={TOTAL_STEPS} aria-label="Onboarding progress"
      >
        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
          <span
            key={i}
            className={`h-1.5 w-8 rounded-full ${i <= step ? 'bg-[var(--color-brand)]' : 'bg-[var(--color-border)]'}`}
          />
        ))}
      </div>

      {step === 0 && <WelcomeStep onNext={() => setStep(1)} />}
      {step === 1 && (
        <GoalStep goal={goal} onChange={setGoal} onNext={() => setStep(2)} onBack={() => setStep(0)} />
      )}
      {step === 2 && (
        <TranslitStep value={showTranslit} onChange={setShowTranslit} onNext={() => setStep(3)} onBack={() => setStep(1)} />
      )}
      {step === 3 && (
        <FinishStep saving={saving} onStart={() => finish('lesson')} onDashboard={() => finish('dashboard')} onBack={() => setStep(2)} />
      )}
    </div>
  )
}

function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <Card className="flex flex-col items-center gap-4 text-center">
      <PersianText fa="سلام!" translit="salām! — hello!" size="xl" />
      <h1 className="text-xl font-semibold text-[var(--color-ink)]">Welcome to Farsi Learn</h1>
      <p className="text-sm text-[var(--color-ink-muted)]">
        You'll start with the Persian alphabet — how each letter looks and sounds, and how letters
        connect into words — then build up through everyday vocabulary, grammar, and full sentences.
        Spaced-repetition review keeps everything you've learned fresh automatically.
      </p>
      <p className="text-xs text-[var(--color-ink-muted)]">
        No account needed — your progress is saved right on this device. If you want it backed up or
        synced to another device, you can optionally sign in later from Progress → Settings.
      </p>
      <Button onClick={onNext} fullWidth>Let's go</Button>
    </Card>
  )
}

function GoalStep({ goal, onChange, onNext, onBack }: { goal: number; onChange: (v: number) => void; onNext: () => void; onBack: () => void }) {
  return (
    <Card className="flex flex-col gap-4">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-[var(--color-ink)]">Set a daily goal</h2>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
          How many new letters/words/sentences per day? You can change this any time in Progress → Settings.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        {GOAL_PRESETS.map((preset) => (
          <button
            key={preset.value}
            type="button"
            onClick={() => onChange(preset.value)}
            aria-pressed={goal === preset.value}
            className={`min-h-12 rounded-2xl border-2 px-4 py-3 text-left text-sm font-medium transition-colors ${
              goal === preset.value
                ? 'border-[var(--color-brand)] bg-[var(--color-brand-soft)] text-[var(--color-brand-strong)]'
                : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink)]'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <Button variant="ghost" onClick={onBack}>Back</Button>
        <Button onClick={onNext} fullWidth>Continue</Button>
      </div>
    </Card>
  )
}

function TranslitStep({ value, onChange, onNext, onBack }: { value: boolean; onChange: (v: boolean) => void; onNext: () => void; onBack: () => void }) {
  return (
    <Card className="flex flex-col gap-4">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-[var(--color-ink)]">Show transliteration?</h2>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
          Latin-letter transliteration (like <span className="ltr-isolate">"salām"</span> under سلام) is a
          training wheel — helpful at first, but the goal is to read Persian script directly. You can hide
          or show it any time in Progress → Settings.
        </p>
      </div>
      <PersianText fa="سلام" translit="salām" size="lg" forceShowTranslit={value} />
      <label className="flex items-center justify-between rounded-2xl border border-[var(--color-border)] px-4 py-3">
        <span className="text-sm font-medium">Show transliteration for now</span>
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
          className="h-5 w-5"
          aria-label="Show transliteration for now"
        />
      </label>
      <div className="flex gap-2">
        <Button variant="ghost" onClick={onBack}>Back</Button>
        <Button onClick={onNext} fullWidth>Continue</Button>
      </div>
    </Card>
  )
}

function FinishStep({ saving, onStart, onDashboard, onBack }: { saving: boolean; onStart: () => void; onDashboard: () => void; onBack: () => void }) {
  return (
    <Card className="flex flex-col items-center gap-4 text-center">
      <PersianText fa="موفق باشید!" translit="movaffagh bāshid! — good luck!" size="lg" />
      <h2 className="text-lg font-semibold text-[var(--color-ink)]">You're ready</h2>
      <p className="text-sm text-[var(--color-ink-muted)]">
        Jump straight into your first alphabet lesson, or take a look around the dashboard first.
      </p>
      <div className="flex w-full flex-col gap-2">
        <Button onClick={onStart} fullWidth disabled={saving}>Start my first lesson</Button>
        <Button onClick={onDashboard} variant="secondary" fullWidth disabled={saving}>Take me to the dashboard</Button>
        <Button onClick={onBack} variant="ghost" disabled={saving}>Back</Button>
      </div>
    </Card>
  )
}
