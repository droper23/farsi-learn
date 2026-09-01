import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../App'
import { db, DEFAULT_SETTINGS } from '../storage/db'

/** Regression test for review H1: the dashboard's empty-state body used to
 *  say "You're all caught up!" even when the headline said "You've hit
 *  today's new-item goal" — a direct contradiction, since there IS a next
 *  lesson, it's just capped until tomorrow. */
describe('Dashboard — new-item cap vs. genuinely caught up (H1)', () => {
  beforeEach(async () => {
    window.location.hash = ''
    await Promise.all([
      db.reviewStates.clear(), db.savedItems.clear(), db.learningEvents.clear(),
      db.unitProgress.clear(), db.settings.clear(),
    ])
  })

  it('shows a cap-specific message, not the generic "all caught up" copy, when the new-item cap is the limiter', async () => {
    // No reviews due, no units complete (so a lesson IS available), but a
    // 0 new-item cap means today's lesson can't start.
    await db.settings.put({ ...DEFAULT_SETTINGS, onboardingComplete: true, newItemsPerDay: 0 })

    render(<App />)

    expect(await screen.findByText("You've hit today's new-item goal")).toBeInTheDocument()
    expect(screen.getByText(/reached today's 0-new-item goal/i)).toBeInTheDocument()
    expect(screen.queryByText(/^You're all caught up!/i)).not.toBeInTheDocument()
  })
})
