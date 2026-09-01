import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'
import { db, DEFAULT_SETTINGS } from '../storage/db'
import { getOrCreateReviewState } from '../storage/progressRepo'

/** Regression coverage for review H3: a learner previously had no way to
 *  stop a vocab-backed saved word from coming back in review forever —
 *  un-starring it only deleted the bookmark, the reviewState lived on. */
describe('ProgressSettings — Saved words "Stop reviewing" control (H3)', () => {
  beforeEach(async () => {
    window.location.hash = ''
    await Promise.all([
      db.reviewStates.clear(), db.savedItems.clear(), db.learningEvents.clear(),
      db.unitProgress.clear(), db.settings.clear(),
    ])
    await db.settings.put({ ...DEFAULT_SETTINGS, onboardingComplete: true })
  })

  it('suspends the vocab review state without deleting the saved bookmark, and can be resumed', async () => {
    const now = Date.now()
    await db.savedItems.add({
      id: 'saved-1', vocabId: 'greet-salam', fa: 'سلام', translit: 'salām', en: 'hello / hi', createdAt: now, updatedAt: now,
    })
    await getOrCreateReviewState('vocab', 'greet-salam', now)

    const user = userEvent.setup()
    render(<App />)
    window.location.hash = '#/progress'

    const stopButton = await screen.findByRole('button', { name: /Stop reviewing "hello/i })
    await user.click(stopButton)

    expect(await screen.findByText(/not being reviewed/i)).toBeInTheDocument()
    // The bookmark itself is untouched — un-saving is a separate action.
    expect(screen.getByText('سلام')).toBeInTheDocument()

    const state = await db.reviewStates.get('vocab:greet-salam')
    expect(state?.suspended).toBe(true)

    const resumeButton = await screen.findByRole('button', { name: /Resume reviewing "hello/i })
    await user.click(resumeButton)
    await waitFor(async () => expect(await db.reviewStates.get('vocab:greet-salam')).toMatchObject({ suspended: false }))
    await waitFor(() => expect(screen.queryByText(/not being reviewed/i)).not.toBeInTheDocument())
  })
})
