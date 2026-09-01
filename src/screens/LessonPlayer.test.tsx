import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'
import { db, DEFAULT_SETTINGS } from '../storage/db'

/** Regression coverage for review M4: during a lesson the header was just
 *  ✕ + a bare progress bar, with no indication of which unit/lesson the
 *  learner was in or how many steps remained. */
describe('LessonPlayer — unit/lesson/step context header (M4)', () => {
  beforeEach(async () => {
    window.location.hash = ''
    await Promise.all([
      db.reviewStates.clear(), db.savedItems.clear(), db.learningEvents.clear(),
      db.unitProgress.clear(), db.settings.clear(),
    ])
    await db.settings.put({ ...DEFAULT_SETTINGS, onboardingComplete: true })
  })

  it('shows the unit title, lesson number, and step number', async () => {
    const user = userEvent.setup()
    render(<App />)
    const startButton = await screen.findByRole('button', { name: /Start lesson/i })
    await user.click(startButton)

    expect(await screen.findByText(/The Alphabet, Part 1 — lesson 1 of 3 · step 1 of \d+/i)).toBeInTheDocument()
  })
})
