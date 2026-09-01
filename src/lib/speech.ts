/**
 * Pronunciation audio, in priority order:
 *  1. A pre-generated clip (scripts/generate_audio.py, Microsoft Edge's
 *     free neural TTS) shipped as a static asset and looked up by exact
 *     text in `audioManifest` — covers every alphabet/vocabulary/sentence
 *     string in the app's content, and (unlike option 2) works identically
 *     on every device, with no dependency on what voices happen to be
 *     installed locally.
 *  2. The browser's built-in Web Speech API, for text with no pre-generated
 *     clip (learner-typed custom saved words, generated exercise text that
 *     isn't a literal content string). Voice quality/availability varies
 *     wildly by OS/browser.
 * Neither is authoritative, native-speaker audio — both are labeled
 * computer-generated/approximate in the UI. See README "Audio".
 */
import { audioManifest } from '../content/audioManifest'

export function speechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

let cachedVoice: SpeechSynthesisVoice | null | undefined

function findPersianVoice(): SpeechSynthesisVoice | null {
  if (!speechSupported()) return null
  if (cachedVoice !== undefined) return cachedVoice
  const voices = window.speechSynthesis.getVoices()
  cachedVoice = voices.find((v) => v.lang?.toLowerCase().startsWith('fa')) ?? null
  return cachedVoice
}

export function hasPersianVoice(): boolean {
  return findPersianVoice() !== null
}

/** Test-only: clears the module-level voice cache so hasPersianVoice()
 *  re-checks window.speechSynthesis.getVoices() on the next call. Real app
 *  code never needs this (see primeVoices for the real-world equivalent,
 *  driven by the 'voiceschanged' event) — it exists so tests can simulate
 *  both a with-voice and a no-voice device without stale caching between
 *  cases. */
export function __resetVoiceCacheForTests() {
  cachedVoice = undefined
}

/** Refreshes the voice cache once the async voiceschanged event fires
 *  (many browsers load voices asynchronously after page load). */
export function primeVoices(onReady?: () => void) {
  if (!speechSupported()) return
  window.speechSynthesis.getVoices()
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoice = undefined
    findPersianVoice()
    onReady?.()
  }
}

export function speakPersian(text: string) {
  if (!speechSupported()) return
  const utterance = new SpeechSynthesisUtterance(text)
  const voice = findPersianVoice()
  if (voice) utterance.voice = voice
  utterance.lang = voice?.lang ?? 'fa-IR'
  utterance.rate = 0.9
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(utterance)
}

/** Resolves a pre-generated audio clip's URL for exact-match text, relative
 *  to the app's base path (so it works both at the domain root and under a
 *  GitHub Pages project subpath — see vite.config.ts `base`). */
export function audioUrlFor(text: string): string | undefined {
  const path = audioManifest[text]
  return path ? `${import.meta.env.BASE_URL}${path}` : undefined
}

const audioElementCache = new Map<string, HTMLAudioElement>()

/** Plays a pre-generated clip if one exists for this exact text. Returns
 *  whether it found (and started playing) one, so callers can fall back to
 *  `speakPersian`. Reuses one `<audio>` element per clip so rapid re-taps
 *  (replay) restart cleanly instead of overlapping. */
export function playPersianAudio(text: string): boolean {
  const url = audioUrlFor(text)
  if (!url) return false
  let audio = audioElementCache.get(url)
  if (!audio) {
    audio = new Audio(url)
    audioElementCache.set(url, audio)
  }
  audio.currentTime = 0
  // play() returns a Promise in real browsers, but jsdom's stub (used in
  // tests) returns undefined — guard rather than assume a thenable.
  audio.play()?.catch(() => {})
  return true
}

/** Whether *some* pronunciation source is available for this text — a
 *  pre-generated clip, or (if not) a device Persian voice. Drives whether
 *  the UI shows a speak control at all. */
export function canPronounce(text: string): boolean {
  return audioUrlFor(text) !== undefined || hasPersianVoice()
}

/** Plays the best available pronunciation for this text: a pre-generated
 *  clip first, the Web Speech API otherwise. */
export function pronouncePersian(text: string): void {
  if (playPersianAudio(text)) return
  speakPersian(text)
}
