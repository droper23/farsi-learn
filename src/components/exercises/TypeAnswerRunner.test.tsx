import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TypeAnswerRunner } from './TypeAnswerRunner'
import type { TypeAnswerExercise } from '../../lib/exercises/types'

const faExercise: TypeAnswerExercise = {
  id: 'test-fa-1', kind: 'type-answer',
  instructions: 'Type the Persian word',
  promptEn: 'hello',
  answerLang: 'fa',
  acceptedAnswers: ['سلام'],
  hints: [],
}

describe('TypeAnswerRunner + Persian keyboard composition', () => {
  it('shows the on-screen keyboard only for fa answers, not en', () => {
    const { rerender } = render(<TypeAnswerRunner exercise={faExercise} onComplete={vi.fn()} />)
    expect(screen.getByRole('group', { name: /Persian letter keyboard/i })).toBeInTheDocument()

    rerender(<TypeAnswerRunner exercise={{ ...faExercise, answerLang: 'en', acceptedAnswers: ['hello'] }} onComplete={vi.fn()} />)
    expect(screen.queryByRole('group', { name: /Persian letter keyboard/i })).not.toBeInTheDocument()
  })

  it('composes an answer by tapping letters, supports mid-string insertion, backspace, and clear', async () => {
    const user = userEvent.setup()
    render(<TypeAnswerRunner exercise={faExercise} onComplete={vi.fn()} />)
    const input = screen.getByRole('textbox') as HTMLInputElement

    // Appends at the end when nothing else has moved the cursor.
    await user.click(screen.getByTestId('kbd-key-sin'))
    await waitFor(() => expect(input.value).toBe('س'))
    await user.click(screen.getByTestId('kbd-key-mim'))
    await waitFor(() => expect(input.value).toBe('سم'))

    // Inserts at the current cursor position, not just the end.
    input.focus()
    input.setSelectionRange(1, 1)
    await user.click(screen.getByTestId('kbd-key-lam'))
    await waitFor(() => expect(input.value).toBe('سلم'))

    // Backspace removes one character at the cursor.
    input.focus()
    input.setSelectionRange(3, 3)
    await user.click(screen.getByTestId('kbd-backspace'))
    await waitFor(() => expect(input.value).toBe('سل'))

    await user.click(screen.getByTestId('kbd-key-alef'))
    await user.click(screen.getByTestId('kbd-key-mim'))
    await waitFor(() => expect(input.value).toBe('سلام'))

    // Clear empties the field entirely.
    await user.click(screen.getByTestId('kbd-clear'))
    await waitFor(() => expect(input.value).toBe(''))
  })

  it('grades a keyboard-composed correct answer as correct', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    render(<TypeAnswerRunner exercise={faExercise} onComplete={onComplete} />)
    const input = screen.getByRole('textbox') as HTMLInputElement

    for (const id of ['kbd-key-sin', 'kbd-key-lam', 'kbd-key-alef', 'kbd-key-mim']) {
      await user.click(screen.getByTestId(id))
    }
    await waitFor(() => expect(input.value).toBe('سلام'))

    await user.click(screen.getByRole('button', { name: /^Check$/i }))
    expect(await screen.findByText(/^Correct!$/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /^Continue$/i }))
    expect(onComplete).toHaveBeenCalledWith(true, 0)
  })

  it('hides the keyboard once the answer is submitted, like the Check button', async () => {
    const user = userEvent.setup()
    render(<TypeAnswerRunner exercise={faExercise} onComplete={vi.fn()} />)
    await user.click(screen.getByTestId('kbd-key-sin'))
    await user.click(screen.getByRole('button', { name: /^Check$/i }))
    expect(screen.queryByRole('group', { name: /Persian letter keyboard/i })).not.toBeInTheDocument()
  })
})
