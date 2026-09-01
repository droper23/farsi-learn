import '@testing-library/jest-dom/vitest'
import 'fake-indexeddb/auto'

// jsdom doesn't implement matchMedia or speechSynthesis; stub them so
// components that check prefers-color-scheme / TTS availability don't crash.
if (!window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false, media: query, onchange: null,
    addListener: () => {}, removeListener: () => {},
    addEventListener: () => {}, removeEventListener: () => {}, dispatchEvent: () => false,
  }) as unknown as MediaQueryList
}
if (!('speechSynthesis' in window)) {
  Object.defineProperty(window, 'speechSynthesis', {
    value: { getVoices: () => [], speak: () => {}, cancel: () => {}, onvoiceschanged: null },
    writable: true,
  })
}
if (!('SpeechSynthesisUtterance' in window)) {
  // @ts-expect-error -- minimal jsdom stub, not a full SpeechSynthesisUtterance implementation
  window.SpeechSynthesisUtterance = class {
    text: string
    voice: unknown
    lang = ''
    rate = 1
    constructor(text: string) { this.text = text }
  }
}
