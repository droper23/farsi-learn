import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ListeningRunner } from './ListeningRunner'
import type { ListeningExercise } from '../../lib/exercises/types'
import { __resetVoiceCacheForTests } from '../../lib/speech'

const exercise: ListeningExercise = {
  id: 'listen-test-1', kind: 'listening',
  instructions: 'Listen, then choose the meaning',
  audioText: 'سلام', audioTranslit: 'salām',
  options: [
    { id: 'a', en: 'hello' }, { id: 'b', en: 'goodbye' }, { id: 'c', en: 'thanks' }, { id: 'd', en: 'yes' },
  ],
  correctOptionId: 'a',
  hints: [],
}

function setVoices(voices: Array<{ lang: string }>) {
  // setupTests.ts already defines window.speechSynthesis as writable (not
  // configurable), so reassign the value rather than redefining the
  // property descriptor.
  window.speechSynthesis = { getVoices: () => voices, speak: vi.fn(), cancel: vi.fn(), onvoiceschanged: null } as unknown as SpeechSynthesis
  __resetVoiceCacheForTests()
}

afterEach(() => {
  // Restore the no-voice stub from setupTests.ts so other test files aren't
  // affected by whichever voice list the last test in this file set.
  setVoices([])
})

describe('ListeningRunner', () => {
  it('falls back to showing the Persian text + transliteration when no Persian voice is available', () => {
    setVoices([]) // matches setupTests.ts jsdom default: no voices at all
    render(<ListeningRunner exercise={exercise} onComplete={vi.fn()} />)

    expect(screen.getByText(/No Persian voice found on this device/i)).toBeInTheDocument()
    expect(screen.getByText('سلام')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Play the Persian audio/i })).not.toBeInTheDocument()
  })

  it('offers a Play/Replay control and hides the text up front when a Persian voice is available', async () => {
    setVoices([{ lang: 'fa-IR' }])
    const user = userEvent.setup()
    render(<ListeningRunner exercise={exercise} onComplete={vi.fn()} />)

    expect(screen.queryByText(/No Persian voice found/i)).not.toBeInTheDocument()
    // The Persian text isn't shown up front — that would defeat a listening
    // exercise — only after answering.
    expect(screen.queryByText('سلام')).not.toBeInTheDocument()

    const playButton = screen.getByRole('button', { name: /Play the Persian audio/i })
    await user.click(playButton)
    expect(await screen.findByRole('button', { name: /Replay the Persian audio/i })).toBeInTheDocument()
  })

  it('grades the selected option and reveals the Persian text afterward', async () => {
    setVoices([{ lang: 'fa-IR' }])
    const user = userEvent.setup()
    const onComplete = vi.fn()
    render(<ListeningRunner exercise={exercise} onComplete={onComplete} />)

    await user.click(screen.getByRole('button', { name: 'hello' }))
    expect(await screen.findByText(/^Correct!$/i)).toBeInTheDocument()
    expect(screen.getByText('سلام')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /^Continue$/i }))
    expect(onComplete).toHaveBeenCalledWith(true, 0)
  })
})
