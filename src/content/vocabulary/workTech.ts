import type { VocabItem } from '../types'

/** A handful of additional work/technology words to round out the existing
 *  (previously-untaught) `work-*`/`tech-*` vocabulary in
 *  `workSchoolTech.ts` — see curriculum/units.ts `u4-work-school-tech` for
 *  where all three sets (work, school, technology) get taught together. */
export const workTechVocab: VocabItem[] = [
  { id: 'work2-jalase', fa: 'جلسه', translit: 'jalase', en: 'meeting', pos: 'noun', category: 'work', register: 'neutral', frequency: 2, level: 4, confidence: 'high-confidence' },
  { id: 'work2-shoghl-kardan', fa: 'مشغول بودن', translit: 'mashghul budan', en: 'to be busy (with work)', pos: 'verb', category: 'work', register: 'neutral', frequency: 2, level: 4, isCompoundVerb: true, verbStems: { present: 'مشغول باش', past: 'مشغول بود', presentTranslit: 'mashghul bāsh', pastTranslit: 'mashghul bud' }, confidence: 'high-confidence' },
  { id: 'tech2-sharj', fa: 'شارژ', translit: 'shārj', en: 'battery charge / phone credit', pos: 'noun', category: 'technology', register: 'colloquial', frequency: 2, level: 4, notes: 'A French loanword (charge) used both for phone battery level and prepaid phone credit — گوشیم شارژ نداره "my phone has no battery".', confidence: 'high-confidence' },
  { id: 'tech2-vasl-shodan', fa: 'وصل شدن', translit: 'vasl shodan', en: 'to connect (to the internet/a device)', pos: 'verb', category: 'technology', register: 'neutral', frequency: 2, level: 4, isCompoundVerb: true, verbStems: { present: 'وصل شو', past: 'وصل شد', presentTranslit: 'vasl sho', pastTranslit: 'vasl shod' }, confidence: 'high-confidence' },
  { id: 'tech2-fail', fa: 'فایل', translit: 'fāyl', en: 'file (computer)', pos: 'noun', category: 'technology', register: 'neutral', frequency: 2, level: 4, confidence: 'high-confidence' },
  { id: 'sch2-madrak', fa: 'مدرک', translit: 'madrak', en: 'degree / diploma / document', pos: 'noun', category: 'school', register: 'neutral', frequency: 3, level: 4, confidence: 'high-confidence' },
]
