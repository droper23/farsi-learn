import { describe, expect, it } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Dictionary } from './Dictionary'
import { vocabulary } from '../content/vocabulary'

describe('Dictionary — default view shows every word, A-Z (instead of nothing)', () => {
  it('lists all vocabulary sorted alphabetically by English gloss before any search is typed', () => {
    render(<MemoryRouter><Dictionary /></MemoryRouter>)

    expect(screen.getByText(`All words (${vocabulary.length})`)).toBeInTheDocument()
    const sortedEn = [...vocabulary].map((v) => v.en).sort((a, b) => a.localeCompare(b))
    // Spot-check ordering: the first and last alphabetically should each
    // appear, and in the right relative order in the rendered list.
    const first = screen.getByText(sortedEn[0])
    const last = screen.getByText(sortedEn[sortedEn.length - 1])
    expect(first.compareDocumentPosition(last) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('switches to search results once a query is typed, hiding the full A-Z list', async () => {
    render(<MemoryRouter><Dictionary /></MemoryRouter>)

    // A single change event (one re-render) rather than typing character by
    // character — the default view renders ~390 cards, so each keystroke's
    // re-render is heavy enough that 5 of them in a row under full-suite
    // parallel load caused this test to occasionally time out.
    fireEvent.change(screen.getByLabelText(/Search the dictionary/i), { target: { value: 'hello' } })
    expect(screen.queryByText(`All words (${vocabulary.length})`)).not.toBeInTheDocument()
    expect(await screen.findByText('hello / hi')).toBeInTheDocument()
  })
})
