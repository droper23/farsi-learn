import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NextReviewLine } from './NextReviewLine'
import type { McqExercise } from '../../lib/exercises/types'

const exercise: McqExercise = {
  id: 'x', kind: 'mcq', instructions: 'x', promptEn: 'x',
  options: [{ id: 'a', en: 'a' }], correctOptionId: 'a', hints: [],
}

describe('NextReviewLine', () => {
  it('renders nothing when no forecasts are provided', () => {
    const { container } = render(<NextReviewLine exercise={exercise} correct hintsUsed={0} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('shows the interval matching the rating this answer maps to', () => {
    const now = Date.now()
    const forecasts = [
      { rating: 'again' as const, dueAt: now, intervalDays: 0, state: 'relearning' as const },
      { rating: 'hard' as const, dueAt: now, intervalDays: 0, state: 'learning' as const },
      { rating: 'good' as const, dueAt: now + 3 * 86_400_000, intervalDays: 3, state: 'review' as const },
      { rating: 'easy' as const, dueAt: now + 4 * 86_400_000, intervalDays: 4, state: 'review' as const },
    ]
    render(<NextReviewLine exercise={exercise} correct hintsUsed={0} forecasts={forecasts} />)
    expect(screen.getByText(/Next review: ~3 days/i)).toBeInTheDocument()
  })
})
