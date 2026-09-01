import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ErrorBoundary } from './ErrorBoundary'

function Bomb(): never {
  throw new Error('boom')
}

describe('ErrorBoundary', () => {
  it('renders children when nothing throws', () => {
    render(
      <ErrorBoundary>
        <p>all good</p>
      </ErrorBoundary>,
    )
    expect(screen.getByText('all good')).toBeInTheDocument()
  })

  it('catches a render error and shows a calm recoverable fallback instead of a blank page', () => {
    // React logs the error to the console during the throw — silence it for this test.
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    )
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText(/your progress is safe/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reload' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reset progress/i })).toBeInTheDocument()
    consoleError.mockRestore()
  })
})
