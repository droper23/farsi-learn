import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { Practice } from './Practice'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

describe('Practice — per-unit practice-type picker', () => {
  it('does not navigate on the initial unit click — it expands a menu of practice types instead', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><Practice /></MemoryRouter>)
    await user.click(screen.getByRole('button', { name: /Choose a way to practice Greetings/i }))
    expect(mockNavigate).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: /^Standard practice$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Weak spots$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Writing practice$/i })).toBeInTheDocument()
  })

  it('"Weak spots" for a unit navigates to /focused with filterBy unit + onlyWeak', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><Practice /></MemoryRouter>)
    await user.click(screen.getByRole('button', { name: /Choose a way to practice Greetings/i }))
    await user.click(screen.getByRole('button', { name: /^Weak spots$/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/focused', { state: { filterBy: 'unit', unitId: 'u1-greetings', onlyWeak: true } })
  })

  it('only shows a "Reading practice" option for units that actually have reading passages', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><Practice /></MemoryRouter>)
    await user.click(screen.getByRole('button', { name: /Choose a way to practice Greetings/i }))
    expect(screen.queryByRole('link', { name: /^Reading practice$/i })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Choose a way to practice Reading Authentic Text: Everyday Life/i }))
    expect(screen.getByRole('link', { name: /^Reading practice$/i })).toBeInTheDocument()
  })
})
