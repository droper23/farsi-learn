import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('../content/audioManifest', () => ({
  audioManifest: { 'سلام': 'audio/deadbeefdeadbeef.mp3' },
}))

import { audioUrlFor, canPronounce, playPersianAudio, __resetVoiceCacheForTests } from './speech'

function setVoices(voices: Array<{ lang: string }>) {
  window.speechSynthesis = { getVoices: () => voices, speak: vi.fn(), cancel: vi.fn(), onvoiceschanged: null } as unknown as SpeechSynthesis
  __resetVoiceCacheForTests()
}

afterEach(() => setVoices([]))

describe('audioUrlFor', () => {
  it('resolves a base-relative URL for text present in the manifest', () => {
    expect(audioUrlFor('سلام')).toBe(`${import.meta.env.BASE_URL}audio/deadbeefdeadbeef.mp3`)
  })

  it('returns undefined for text not in the manifest', () => {
    expect(audioUrlFor('not in the manifest')).toBeUndefined()
  })
})

describe('canPronounce', () => {
  it('is true when a pre-generated clip exists, even with no device voice', () => {
    setVoices([])
    expect(canPronounce('سلام')).toBe(true)
  })

  it('is true when no clip exists but a device voice does', () => {
    setVoices([{ lang: 'fa-IR' }])
    expect(canPronounce('not in the manifest')).toBe(true)
  })

  it('is false when neither a clip nor a device voice is available', () => {
    setVoices([])
    expect(canPronounce('not in the manifest')).toBe(false)
  })
})

describe('playPersianAudio', () => {
  it('returns true and attempts playback when a clip exists', () => {
    const playSpy = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined)
    expect(playPersianAudio('سلام')).toBe(true)
    expect(playSpy).toHaveBeenCalled()
    playSpy.mockRestore()
  })

  it('returns false without touching audio playback when no clip exists', () => {
    const playSpy = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined)
    expect(playPersianAudio('not in the manifest')).toBe(false)
    expect(playSpy).not.toHaveBeenCalled()
    playSpy.mockRestore()
  })
})
