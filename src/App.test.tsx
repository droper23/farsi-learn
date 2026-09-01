import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import { db, DEFAULT_SETTINGS } from './storage/db'
import { getOrCreateReviewState, recordReview } from './storage/progressRepo'
import { PERSIAN_MONTH_NAMES } from './lib/persianCalendar'

/**
 * End-to-end-ish smoke test: renders the real app (real IndexedDB via
 * fake-indexeddb, real content, real router) and walks through the core
 * flows a brand-new learner would hit first. This is the substitute for a
 * manual browser walkthrough in this environment — it would catch a route
 * that throws, a screen that never resolves its loading state, or an
 * exercise flow that can't be completed.
 */

beforeEach(async () => {
  window.location.hash = ''
  await Promise.all([
    db.reviewStates.clear(), db.savedItems.clear(), db.learningEvents.clear(),
    db.unitProgress.clear(), db.settings.clear(),
  ])
  // Onboarding is exercised by its own dedicated test below (starting from
  // a genuinely fresh/unseeded settings row); every other test pre-seeds
  // onboardingComplete so it deterministically skips straight to the
  // dashboard/router, matching what a returning user would see.
  await db.settings.put({ ...DEFAULT_SETTINGS, onboardingComplete: true })
})

describe('App smoke test', () => {
  it('renders the dashboard by default with navigation visible', async () => {
    render(<App />)
    expect(await screen.findByRole('heading', { name: /Farsi Learn/i })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /Learn/i }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: /Review/i }).length).toBeGreaterThan(0)
  })

  it('navigates to Learn and shows the level structure', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click((await screen.findAllByRole('link', { name: /^Learn$/i }))[0])
    expect(await screen.findByText((text) => text.includes('Level 1') && text.includes('Foundations'))).toBeInTheDocument()
    expect(screen.getByText((text) => text.includes('Level 6') && text.includes('Advanced'))).toBeInTheDocument()
  })

  it('opens the alphabet overview and a letter detail page', async () => {
    const user = userEvent.setup()
    render(<App />)
    window.location.hash = '#/alphabet'
    expect(await screen.findByText(/32 letters/i)).toBeInTheDocument()
    const beLink = await screen.findByRole('link', { name: /Be/i })
    await user.click(beLink)
    expect(await screen.findByRole('heading', { name: /Be/i })).toBeInTheDocument()
    expect(screen.getByText(/Practice this letter/i)).toBeInTheDocument()
  })

  it('opens the alphabet cheat sheet and expands a letter to its full detail', async () => {
    const user = userEvent.setup()
    render(<App />)
    window.location.hash = '#/alphabet'
    await user.click(await screen.findByRole('link', { name: /cheat sheet/i }))

    expect(await screen.findByRole('heading', { name: /Alphabet cheat sheet/i })).toBeInTheDocument()
    const alefRow = await screen.findByRole('button', { name: /Alef/i })
    await user.click(alefRow)
    expect(await screen.findByText('Isolated')).toBeInTheDocument()
    expect(screen.getAllByText(/non-joining/i).length).toBeGreaterThan(0)
  })

  it('opens the Practice tab, reads a passage, and starts a not-yet-started unit\'s practice session', async () => {
    const user = userEvent.setup()
    render(<App />)
    window.location.hash = '#/practice'

    expect(await screen.findByRole('heading', { name: /^Practice$/i })).toBeInTheDocument()

    // Reading practice: a real, always-available passage list (content, not progress-gated).
    await user.click(screen.getByRole('link', { name: /Reading practice/i }))
    expect(await screen.findByRole('heading', { name: /Reading practice/i })).toBeInTheDocument()
    const firstPassage = (await screen.findAllByRole('button', { name: /formal|literary/i }))[0]
    await user.click(firstPassage)
    expect(await screen.findByText('Isolated', { exact: false }).catch(() => null)).toBeFalsy() // sanity: not the cheat sheet
    expect(screen.getAllByRole('button', { name: /Hear an approximate/i }).length).toBeGreaterThan(0)

    // Practice by unit: a unit with no progress yet shows a graceful empty state.
    window.location.hash = '#/practice'
    await screen.findByRole('heading', { name: /^Practice$/i })
    expect(screen.queryByRole('button', { name: /Practice comprehension questions/i })).not.toBeInTheDocument()
    const unitButton = await screen.findByRole('button', { name: /^Practice The Alphabet, Part 1$/i })
    await user.click(unitButton)
    expect(await screen.findByText(/haven't started this unit/i)).toBeInTheDocument()
  })

  it('can search the dictionary and find a known word', async () => {
    const user = userEvent.setup()
    render(<App />)
    window.location.hash = '#/dictionary'
    const input = await screen.findByPlaceholderText(/Search/i)
    await user.type(input, 'hello')
    expect(await screen.findByText('hello / hi')).toBeInTheDocument()
  })

  it('can browse the dictionary by category and save a word from the list', async () => {
    const user = userEvent.setup()
    render(<App />)
    window.location.hash = '#/dictionary'
    await user.click(await screen.findByRole('tab', { name: /Browse by category/i }))
    const greetingsButton = await screen.findByRole('button', { name: /Greetings/i })
    await user.click(greetingsButton)
    const saveButtons = await screen.findAllByRole('button', { name: /^Save "/i })
    expect(saveButtons.length).toBeGreaterThan(0)
    await user.click(saveButtons[0])
    expect(await screen.findAllByRole('button', { name: /^Remove "/i })).not.toHaveLength(0)
  })

  it('shows a goal-aware daily plan on the dashboard', async () => {
    render(<App />)
    expect(await screen.findByText(/Today's plan/i)).toBeInTheDocument()
    // A brand-new (post-onboarding) account with no reviews due and a
    // lesson available should recommend starting with the lesson.
    expect(await screen.findByText(/Start with a lesson/i)).toBeInTheDocument()
  })

  it('shows today\'s Solar Hijri date widget on the dashboard (Pass 4 B3)', async () => {
    render(<App />)
    expect(await screen.findByText(/Today's date \(Solar Hijri\)/i)).toBeInTheDocument()
    // Don't assert a specific date (the suite can run any day) — just that
    // a real Persian month name shows up, proving the converter actually
    // ran rather than rendering a placeholder.
    const monthPattern = new RegExp(PERSIAN_MONTH_NAMES.join('|'))
    expect(await screen.findByText(monthPattern)).toBeInTheDocument()
  })

  it('practices weak spots end to end from the Stats screen (Pass 4 B2)', async () => {
    const user = userEvent.setup()
    // Seed one item with a real lapse so it's flagged "weak" regardless of
    // its (irrelevant here) due date. A single "again" on a brand-new item
    // just stays in the learning steps (no lapse yet) — graduate it to
    // "review" first (an "easy" rating graduates immediately), then fail
    // it, which is what actually increments lapseCount / flips it to
    // "relearning" per srs/scheduler.ts applyReview.
    const now = Date.now()
    await getOrCreateReviewState('vocab', 'greet-salam', now)
    await recordReview('vocab', 'greet-salam', 'easy', true, now)
    await recordReview('vocab', 'greet-salam', 'again', false, now + 1000)

    render(<App />)
    window.location.hash = '#/stats'
    const practiceButton = await screen.findByRole('button', { name: /Practice weak spots/i })
    await user.click(practiceButton)

    expect(await screen.findByText(/Weak spots/i)).toBeInTheDocument()
    // Whatever exercise shape came up, there should be a way to answer it
    // and reach either the next question or the completion screen.
    await waitFor(() => expect(screen.queryByText(/^Loading/i)).not.toBeInTheDocument())
    const options = screen.queryAllByTestId('exercise-option')
    const textInput = screen.queryByRole('textbox') as HTMLInputElement | null
    if (options.length > 0) {
      await user.click(options[0])
      expect(await screen.findByRole('button', { name: /^Continue$/i })).toBeInTheDocument()
    } else if (textInput) {
      await user.type(textInput, 'x')
      expect(await screen.findByRole('button', { name: /^Check$/i })).toBeInTheDocument()
    }
  })

  it('completes a full lesson end to end from the dashboard', async () => {
    const user = userEvent.setup()
    render(<App />)
    const startButton = await screen.findByRole('button', { name: /Start lesson/i })
    await user.click(startButton)

    async function waitForLoaded() {
      await waitFor(() => expect(screen.queryByText(/Loading lesson/i)).not.toBeInTheDocument())
    }

    // Walk through every step until we hit the "Lesson complete!" screen.
    // Cap iterations so a real bug (infinite loop) fails fast instead of
    // hanging the suite.
    for (let i = 0; i < 80; i++) {
      await waitForLoaded()
      if (screen.queryByText(/Lesson complete!/i)) break

      const gotIt = screen.queryByRole('button', { name: /^Got it$/i })
      if (gotIt) {
        await user.click(gotIt)
        continue
      }

      const textInput = screen.queryByRole('textbox') as HTMLInputElement | null
      const wordPool = screen.queryAllByTestId('word-pool-item')
      const options = screen.queryAllByTestId('exercise-option')
      const matchingLeft = (screen.queryAllByTestId('matching-left') as HTMLButtonElement[]).filter((el) => !el.disabled)
      const checkButton = screen.queryByRole('button', { name: /^Check$/i }) as HTMLButtonElement | null
      const continueButton = screen.queryByRole('button', { name: /^Continue$/i })

      if (continueButton) {
        await user.click(continueButton)
      } else if (textInput) {
        await user.type(textInput, 'x')
        await user.click(checkButton!)
      } else if (wordPool.length > 0) {
        for (const w of wordPool) await user.click(w)
        await waitFor(() => expect(checkButton).not.toBeDisabled())
        await user.click(checkButton!)
      } else if (matchingLeft.length > 0) {
        // Matching exercise: click a left pair, then the right button
        // sharing its data-pair-id (matched by our own generated id, not
        // by reading the displayed text) — repeat until all pairs matched.
        const left = matchingLeft[0]
        const pairId = left.getAttribute('data-pair-id')
        await user.click(left)
        const right = screen.getAllByTestId('matching-right').find((el) => el.getAttribute('data-pair-id') === pairId) as HTMLButtonElement
        await user.click(right)
      } else if (options.length > 0) {
        await user.click(options[0])
      } else {
        throw new Error(`Stuck: no recognizable exercise control on screen at iteration ${i}`)
      }
    }

    expect(screen.getByText(/Lesson complete!/i)).toBeInTheDocument()
  }, 20000)

  it('walks a brand-new user through onboarding before showing the dashboard', async () => {
    const user = userEvent.setup()
    // Genuinely fresh: no settings row at all, so onboardingComplete falls
    // back to false (see DEFAULT_SETTINGS) exactly like a first-ever visit.
    await db.settings.clear()

    render(<App />)

    expect(await screen.findByText(/Welcome to Farsi Learn/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Let's go/i }))

    expect(await screen.findByText(/Set a daily goal/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Steady — 10 new items a day/i }))
    await user.click(screen.getByRole('button', { name: /^Continue$/i }))

    expect(await screen.findByText(/Show transliteration\?/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /^Continue$/i }))

    expect(await screen.findByText(/You're ready/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Start my first lesson/i }))

    // Onboarding is gone and we land in the app proper (the lesson screen,
    // since "Start my first lesson" was chosen) — not stuck on onboarding.
    await waitFor(() => expect(screen.queryByText(/Welcome to Farsi Learn/i)).not.toBeInTheDocument())
    const settings = await db.settings.get('app-settings')
    expect(settings?.onboardingComplete).toBe(true)
    expect(settings?.newItemsPerDay).toBe(10)
  })
})
