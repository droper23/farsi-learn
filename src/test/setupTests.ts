import { expect } from 'vitest'
import '@testing-library/jest-dom/vitest'
import 'fake-indexeddb/auto'
// vitest-axe@0.1.0's runtime matcher registration (its own
// 'vitest-axe/extend-expect' entry point) and its type declarations are
// both broken against this project's setup — see ./vitest-axe.d.ts for the
// type side and the comment below for the runtime side. The top-level
// 'vitest-axe/matchers' entry point also re-exports the matcher as a type
// only (yet another packaging bug), so import the real implementation from
// its dist path instead.
import * as vitestAxeMatchers from 'vitest-axe/dist/matchers'

expect.extend({ toHaveNoViolations: vitestAxeMatchers.toHaveNoViolations })

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
