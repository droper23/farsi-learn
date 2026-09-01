/**
 * Best-effort pronunciation via the browser's built-in Web Speech API.
 * This is NOT authoritative audio — voice quality and even availability of
 * a Persian voice varies wildly by OS/browser, and synthesized speech can
 * mispronounce loanwords, homographs, and anything with an unwritten short
 * vowel (which is most Persian words). It is offered as an optional aid,
 * always labeled as computer-generated/approximate in the UI, never
 * presented as a substitute for real recorded audio. See README "Audio".
 */

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
