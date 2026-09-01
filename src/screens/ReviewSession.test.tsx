import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'
import { db, DEFAULT_SETTINGS } from '../storage/db'
import { recordReview } from '../storage/progressRepo'
import { vocabulary } from '../content/vocabulary'

/** Regression coverage for review M5: reviews had a hard cap of 30 with no
 *  way out mid-session except the silent ✕, and no way to continue past
 *  the cap when more was due. */
describe('ReviewSession — End session & Load more (M5)', () => {
  beforeEach(async () => {
    window.location.hash = ''
    await Promise.all([
      db.reviewStates.clear(), db.savedItems.clear(), db.learningEvents.clear(),
      db.unitProgress.clear(), db.settings.clear(),
    ])
    await db.settings.put({ ...DEFAULT_SETTINGS, onboardingComplete: true })
  })

  async function seedDueVocab(count: number) {
    const now = Date.now()
    const ids = vocabulary.slice(0, count).map((v) => v.id)
    for (const id of ids) {
      // 'easy' graduates a brand-new item straight to 'review' (see
      // srs/scheduler.ts) — then force it due now instead of days out.
      await recordReview('vocab', id, 'easy', true, now)
    }
    await db.reviewStates.where('kind').equals('vocab').modify({ dueAt: now - 1000 })
    return ids
  }

  // Review-session exercises for a graduated item can come back as mcq,
  // type-answer, word-order, listening, or (for conjugable verbs)
  // conjugation mcq/type-answer — handle every control shape the same way
  // the App.test.tsx lesson-completion smoke test does.
  async function answerOneQuestion(user: ReturnType<typeof userEvent.setup>) {
    await screen.findByRole('progressbar')
    const options = screen.queryAllByTestId('exercise-option')
    const textInput = screen.queryByRole('textbox') as HTMLInputElement | null
    const wordPool = screen.queryAllByTestId('word-pool-item')
    if (options.length > 0) {
      await user.click(options[0])
    } else if (textInput) {
      await user.type(textInput, 'x')
      await user.click(await screen.findByRole('button', { name: /^Check$/i }))
    } else if (wordPool.length > 0) {
      for (const w of wordPool) await user.click(w)
      const checkButton = await screen.findByRole('button', { name: /^Check$/i })
      await waitFor(() => expect(checkButton).not.toBeDisabled())
      await user.click(checkButton)
    } else {
      throw new Error('answerOneQuestion: no recognizable exercise control on screen')
    }
    await user.click(await screen.findByRole('button', { name: /^Continue$/i }))
    // Wait for the click's async recordReview()/setIndex() to fully settle
    // (the Continue button for THIS question disappears once we've moved
    // on) before the next call re-queries the DOM — otherwise a still-stale
    // reference to the outgoing question's controls can silently no-op
    // mid-click if the state update lands in between.
    await waitFor(() => expect(screen.queryByRole('button', { name: /^Continue$/i })).not.toBeInTheDocument())
  }

  it('shows End session only after answering at least one question, and scores against what was actually answered', async () => {
    await seedDueVocab(3)
    const user = userEvent.setup()
    render(<App />)
    window.location.hash = '#/review'

    await screen.findByRole('progressbar')
    expect(screen.queryByRole('button', { name: /^End session$/i })).not.toBeInTheDocument()

    await answerOneQuestion(user)

    const endButton = await screen.findByRole('button', { name: /^End session$/i })
    await user.click(endButton)

    expect(await screen.findByText(/Review complete!/i)).toBeInTheDocument()
    // One of one answered, regardless of the 3 seeded — never divides by
    // the full due count when ended early.
    expect(screen.getByText(/of 1 correct/i)).toBeInTheDocument()
  })

  it('offers "Load more reviews" after finishing a full 30-item batch when more is due', async () => {
    await seedDueVocab(35)
    const user = userEvent.setup()
    render(<App />)
    window.location.hash = '#/review'

    for (let i = 0; i < 30; i++) {
      await answerOneQuestion(user)
    }

    const loadMoreButton = await screen.findByRole('button', { name: /Load more reviews/i })
    await user.click(loadMoreButton)

    // A fresh batch starts — back to an in-progress review screen (with a
    // fresh progress bar at 0), not the completion screen.
    await waitFor(() => expect(screen.queryByText(/Review complete!/i)).not.toBeInTheDocument())
    expect(await screen.findByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')
  }, 20000)
})
