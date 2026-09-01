import { describe, expect, it, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { axe } from 'vitest-axe'
import App from './App'
import { db, DEFAULT_SETTINGS } from './storage/db'
import { Onboarding } from './components/onboarding/Onboarding'
import { PersianKeyboard } from './components/exercises/PersianKeyboard'
import { McqRunner } from './components/exercises/McqRunner'
import { generateVocabMcq } from './lib/exercises/generator'
import { vocabulary } from './content/vocabulary'
import { Dictionary } from './screens/Dictionary'
import { Stats } from './screens/Stats'
import { AlphabetCheatSheet } from './screens/Alphabet/AlphabetCheatSheet'

/**
 * A small automated accessibility pass (axe-core via vitest-axe), run
 * against the screens/components most likely to have real users on them
 * and the parts touched by this change (onboarding, the Persian keyboard,
 * exercise runners). Not exhaustive — a real screen reader/manual pass
 * would still be worthwhile — but catches obvious regressions (missing
 * labels, contrast, invalid ARIA) automatically going forward.
 */

beforeEach(async () => {
  window.location.hash = ''
  await Promise.all([
    db.reviewStates.clear(), db.savedItems.clear(), db.learningEvents.clear(),
    db.unitProgress.clear(), db.settings.clear(),
  ])
})

describe('accessibility', () => {
  it('the dashboard (returning user) has no obvious axe violations', async () => {
    await db.settings.put({ ...DEFAULT_SETTINGS, onboardingComplete: true })
    const { container } = render(<App />)
    // Let the dashboard's async data resolve before auditing.
    await screen.findByRole('heading', { name: /Farsi Learn/i })
    expect(await axe(container)).toHaveNoViolations()
  })

  it('the onboarding welcome step has no obvious axe violations', async () => {
    const { container } = render(<Onboarding onFinish={() => {}} />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('the Persian keyboard has no obvious axe violations', async () => {
    const { container } = render(
      <PersianKeyboard onInsert={() => {}} onBackspace={() => {}} onClear={() => {}} />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('an MCQ exercise runner has no obvious axe violations', async () => {
    const item = vocabulary.find((v) => v.id === 'greet-salam')!
    const exercise = generateVocabMcq(item, 'fa-en')
    const { container } = render(<McqRunner exercise={exercise} onComplete={() => {}} />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('the dictionary browse-by-category view has no obvious axe violations', async () => {
    const { container } = render(<MemoryRouter><Dictionary /></MemoryRouter>)
    fireEvent.click(screen.getByRole('tab', { name: /Browse by category/i }))
    // Drill into a category so a populated word list (with save/queue
    // badges) is what actually gets audited, not just the category grid.
    const categoryButtons = await screen.findAllByRole('button')
    fireEvent.click(categoryButtons[0])
    expect(await axe(container)).toHaveNoViolations()
  })

  it('the stats/mastery screen has no obvious axe violations', async () => {
    const { container } = render(<MemoryRouter><Stats /></MemoryRouter>)
    await screen.findByRole('heading', { name: /Stats & Mastery/i })
    expect(await axe(container)).toHaveNoViolations()
  })

  it('the alphabet cheat sheet has no obvious axe violations, collapsed and expanded', async () => {
    const { container } = render(<MemoryRouter><AlphabetCheatSheet /></MemoryRouter>)
    expect(await axe(container)).toHaveNoViolations()
    fireEvent.click(screen.getByRole('button', { name: /Expand all/i }))
    expect(await axe(container)).toHaveNoViolations()
  })
})
