import { afterEach, describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DiacriticsToggle } from './DiacriticsToggle'
import { db, DEFAULT_SETTINGS } from '../../storage/db'

afterEach(async () => {
  await db.settings.clear()
})

describe('DiacriticsToggle', () => {
  it('reflects the current setting and flips it on click', async () => {
    await db.settings.put({ ...DEFAULT_SETTINGS, showDiacritics: false })
    const user = userEvent.setup()
    render(<DiacriticsToggle />)

    const button = await screen.findByRole('button', { name: /Show vowel marks/i })
    expect(button).toHaveAttribute('aria-pressed', 'false')

    await user.click(button)
    await waitFor(async () => expect(await db.settings.get('app-settings')).toMatchObject({ showDiacritics: true }))
    expect(await screen.findByRole('button', { name: /Hide vowel marks/i })).toHaveAttribute('aria-pressed', 'true')
  })
})
