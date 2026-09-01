import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AlphabetCheatSheet } from './AlphabetCheatSheet'
import { alphabet } from '../../content/alphabet'

describe('AlphabetCheatSheet', () => {
  it('lists every letter collapsed by default', () => {
    const { container } = render(<MemoryRouter><AlphabetCheatSheet /></MemoryRouter>)
    // One row (button) per letter, and every letter's name/glyph appears
    // somewhere in the collapsed view.
    expect(screen.getAllByRole('button').length).toBeGreaterThanOrEqual(alphabet.length)
    for (const letter of alphabet) {
      expect(container.textContent).toContain(letter.name)
      expect(container.textContent).toContain(letter.forms.isolated)
    }
    // Forms/pronunciation detail is not shown until expanded.
    expect(screen.queryByText(/Isolated/)).not.toBeInTheDocument()
  })

  it('flags non-joining letters with a badge even when collapsed', () => {
    render(<MemoryRouter><AlphabetCheatSheet /></MemoryRouter>)
    const nonJoining = alphabet.filter((l) => !l.joinsNext)
    expect(screen.getAllByText('non-joining').length).toBeGreaterThanOrEqual(nonJoining.length)
  })

  it('expands a letter on click to reveal forms and break-letter explanation', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><AlphabetCheatSheet /></MemoryRouter>)
    const alef = alphabet.find((l) => l.id === 'alef')!
    const row = screen.getByRole('button', { name: new RegExp(alef.name) })
    expect(row).toHaveAttribute('aria-expanded', 'false')

    await user.click(row)

    expect(row).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Isolated')).toBeInTheDocument()
    expect(screen.getByText(/Non-joining \(a "break" letter\)/i)).toBeInTheDocument()
  })

  it('"Expand all" opens every row, "Collapse all" closes them', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><AlphabetCheatSheet /></MemoryRouter>)

    await user.click(screen.getByRole('button', { name: /Expand all/i }))
    expect(screen.getAllByText('Isolated').length).toBe(alphabet.length)

    await user.click(screen.getByRole('button', { name: /Collapse all/i }))
    expect(screen.queryByText('Isolated')).not.toBeInTheDocument()
  })
})
