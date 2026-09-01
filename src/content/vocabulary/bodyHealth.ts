import type { VocabItem } from '../types'

/** A handful of additional body-part words to round out the existing
 *  (previously-untaught) `body-*` vocabulary in `colorsBodyNature.ts` — see
 *  curriculum/units.ts `u3-body` for where both sets get taught together,
 *  alongside sentences that combine a body part with health vocabulary
 *  already taught in `u3-health-emotions` (e.g. "my head hurts"). */
export const bodyHealthVocab: VocabItem[] = [
  { id: 'body2-zanu', fa: 'زانو', translit: 'zānu', en: 'knee', pos: 'noun', category: 'body', register: 'neutral', frequency: 3, level: 3, confidence: 'high-confidence' },
  { id: 'body2-shekam', fa: 'شکم', translit: 'shekam', en: 'stomach / belly', pos: 'noun', category: 'body', register: 'neutral', frequency: 2, level: 3, confidence: 'high-confidence' },
  { id: 'body2-angosht', fa: 'انگشت', translit: 'angosht', en: 'finger / toe', pos: 'noun', category: 'body', register: 'neutral', frequency: 3, level: 3, confidence: 'high-confidence' },
  { id: 'body2-poost', fa: 'پوست', translit: 'pust', en: 'skin', pos: 'noun', category: 'body', register: 'neutral', frequency: 3, level: 3, confidence: 'high-confidence' },
  { id: 'body2-ghadd', fa: 'قد', translit: 'qadd', en: 'height (of a person)', pos: 'noun', category: 'body', register: 'neutral', frequency: 3, level: 3, notes: 'قدم بلنده "I am tall" (lit. "my height is long") is the everyday way to talk about height, not an adjective on its own.', confidence: 'high-confidence' },
]
