import type { VocabItem } from '../types'

/** A handful of additional weather words to round out the existing
 *  (previously-untaught) `nat-*` weather/nature vocabulary in
 *  `colorsBodyNature.ts` — see curriculum/units.ts `u2-weather-nature` for
 *  where both sets get taught together. */
export const weatherVocab: VocabItem[] = [
  { id: 'weath-toofan', fa: 'طوفان', translit: 'tufān', en: 'storm', pos: 'noun', category: 'weather', register: 'neutral', frequency: 3, level: 2, confidence: 'high-confidence' },
  { id: 'weath-rotoobat', fa: 'رطوبت', translit: 'rotubat', en: 'humidity', pos: 'noun', category: 'weather', register: 'neutral', frequency: 3, level: 2, confidence: 'high-confidence' },
  { id: 'weath-daraje', fa: 'درجه', translit: 'daraje', en: 'degree (temperature)', pos: 'noun', category: 'weather', register: 'neutral', frequency: 2, level: 2, confidence: 'high-confidence' },
  { id: 'weath-meh', fa: 'مه', translit: 'meh', en: 'fog', pos: 'noun', category: 'weather', register: 'neutral', frequency: 3, level: 2, confidence: 'high-confidence' },
  { id: 'weath-yakh', fa: 'یخ', translit: 'yakh', en: 'ice', pos: 'noun', category: 'weather', register: 'neutral', frequency: 2, level: 2, confidence: 'high-confidence' },
  { id: 'weath-fasl', fa: 'فصل', translit: 'fasl', en: 'season', pos: 'noun', category: 'weather', register: 'neutral', frequency: 2, level: 2, confidence: 'high-confidence' },
  { id: 'weath-bahar', fa: 'بهار', translit: 'bahār', en: 'spring', pos: 'noun', category: 'weather', register: 'neutral', frequency: 2, level: 2, confidence: 'high-confidence' },
  { id: 'weath-tabestan', fa: 'تابستان', translit: 'tābestān', en: 'summer', pos: 'noun', category: 'weather', register: 'neutral', frequency: 2, level: 2, confidence: 'high-confidence' },
  { id: 'weath-paeez', fa: 'پاییز', translit: "pā'iz", en: 'autumn / fall', pos: 'noun', category: 'weather', register: 'neutral', frequency: 2, level: 2, confidence: 'high-confidence' },
  { id: 'weath-zemestan', fa: 'زمستان', translit: 'zemestān', en: 'winter', pos: 'noun', category: 'weather', register: 'neutral', frequency: 2, level: 2, confidence: 'high-confidence' },
]
