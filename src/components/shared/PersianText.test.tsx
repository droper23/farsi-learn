import { afterEach, describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { PersianText } from './PersianText'
import { db, DEFAULT_SETTINGS } from '../../storage/db'

afterEach(async () => {
  await db.settings.clear()
})

describe('PersianText — diacritics (vowel marks) toggle', () => {
  it('shows the plain form by default (showDiacritics off)', async () => {
    await db.settings.put({ ...DEFAULT_SETTINGS, showDiacritics: false })
    render(<PersianText fa="سلام" />)
    await waitFor(() => expect(screen.getByText('سلام')).toBeInTheDocument())
  })

  it('shows the diacritized form when the setting is on and one exists', async () => {
    await db.settings.put({ ...DEFAULT_SETTINGS, showDiacritics: true })
    render(<PersianText fa="سلام" />)
    await waitFor(() => expect(screen.getByText('سَلام')).toBeInTheDocument())
    expect(screen.queryByText('سلام')).not.toBeInTheDocument()
  })

  it('falls back to the plain form when the setting is on but no diacritics are authored for this text', async () => {
    await db.settings.put({ ...DEFAULT_SETTINGS, showDiacritics: true })
    render(<PersianText fa="یک متن ناشناخته" />)
    await waitFor(() => expect(screen.getByText('یک متن ناشناخته')).toBeInTheDocument())
  })
})
