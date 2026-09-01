import { afterEach, describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { McqRunner } from './McqRunner'
import { db, DEFAULT_SETTINGS } from '../../storage/db'
import type { McqExercise } from '../../lib/exercises/types'

const exercise: McqExercise = {
  id: 'x', kind: 'mcq', instructions: 'Choose the correct Persian word', promptEn: 'hello',
  options: [
    { id: 'a', fa: 'سلام', translit: 'salām' },
    { id: 'b', fa: 'خداحافظ', translit: 'khodāhāfez' },
  ],
  correctOptionId: 'a',
  hints: [],
}

afterEach(async () => {
  await db.settings.clear()
})

describe('McqRunner — transliteration on Persian-word options', () => {
  it('shows each option\'s transliteration when the setting is on', async () => {
    await db.settings.put({ ...DEFAULT_SETTINGS, showTransliteration: true })
    render(<McqRunner exercise={exercise} onComplete={() => {}} />)
    expect(await screen.findByText('salām')).toBeInTheDocument()
    expect(screen.getByText('khodāhāfez')).toBeInTheDocument()
  })

  it('hides transliteration when the setting is off', async () => {
    await db.settings.put({ ...DEFAULT_SETTINGS, showTransliteration: false })
    render(<McqRunner exercise={exercise} onComplete={() => {}} />)
    await screen.findByText('سلام')
    // useSettings() falls back to the (translit-on) default before its
    // live query resolves — wait for it to actually settle rather than
    // asserting on the first, possibly-still-default render.
    await waitFor(() => expect(screen.queryByText('salām')).not.toBeInTheDocument())
  })
})
