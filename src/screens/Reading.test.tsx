import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { Reading } from './Reading'
import { passages } from '../content/passages'

function renderAt(state: unknown) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: '/reading', state }]}>
      <Routes><Route path="/reading" element={<Reading />} /></Routes>
    </MemoryRouter>,
  )
}

describe('Reading — optional per-unit passage filter (Practice tab: pick a unit, then "Reading practice")', () => {
  it('shows every passage when arriving with no unit filter', () => {
    renderAt(undefined)
    for (const p of passages) expect(screen.getByText(p.title)).toBeInTheDocument()
  })

  it('shows only the given unit\'s passages, and names the unit in the subtitle', () => {
    renderAt({ unitId: 'u6-reading-authentic' })
    expect(screen.getByText('Passages from Reading Authentic Text: Everyday Life')).toBeInTheDocument()
    const inUnit = passages.find((p) => p.id === 'passage-tehran-life')!
    const otherUnitOnly = passages.find((p) => p.id === 'passage-letter-friend')!
    expect(screen.getByText(inUnit.title)).toBeInTheDocument()
    expect(screen.queryByText(otherUnitOnly.title)).not.toBeInTheDocument()
  })
})
