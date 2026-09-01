import type { VocabItem } from '../types'

/** Personal pronouns and the core building blocks of introducing yourself.
 *  Persian pronouns don't mark gender (او means both "he" and "she"). */
export const pronounsVocab: VocabItem[] = [
  { id: 'pron-man', fa: 'من', translit: 'man', en: 'I / me', pos: 'pronoun', category: 'pronouns', register: 'neutral', frequency: 1, level: 1, confidence: 'high-confidence' },
  { id: 'pron-to', fa: 'تو', translit: 'to', en: 'you (singular, informal)', pos: 'pronoun', category: 'pronouns', register: 'colloquial', frequency: 1, level: 1, confidence: 'high-confidence' },
  { id: 'pron-oo', fa: 'او', translit: 'u', en: 'he / she', pos: 'pronoun', category: 'pronouns', register: 'neutral', frequency: 1, level: 1, notes: 'No grammatical gender — او covers both "he" and "she".', confidence: 'high-confidence' },
  { id: 'pron-in-person', fa: 'این', translit: 'in', en: 'this / this one (referring to a person)', pos: 'pronoun', category: 'pronouns', register: 'colloquial', frequency: 2, level: 1, notes: 'این and آن are used for people as well as things in casual speech, e.g. این آقای احمدی است.', confidence: 'high-confidence' },
  { id: 'pron-ma', fa: 'ما', translit: 'mā', en: 'we / us', pos: 'pronoun', category: 'pronouns', register: 'neutral', frequency: 1, level: 1, confidence: 'high-confidence' },
  { id: 'pron-shoma', fa: 'شما', translit: 'shomā', en: 'you (plural, or singular formal/polite)', pos: 'pronoun', category: 'pronouns', register: 'neutral', frequency: 1, level: 1, confidence: 'high-confidence' },
  { id: 'pron-anha', fa: 'آن‌ها', translit: 'ānhā', en: 'they / them', pos: 'pronoun', category: 'pronouns', register: 'neutral', frequency: 1, level: 1, altEn: ['ایشان (ishān) is a formal/polite alternative for "they" or a respected "he/she".'], confidence: 'high-confidence' },
  { id: 'intro-esm', fa: 'اسم', translit: 'esm', en: 'name', pos: 'noun', category: 'introductions', register: 'neutral', frequency: 1, level: 1, pluralFa: 'اسم‌ها', confidence: 'high-confidence' },
  { id: 'intro-esmeman', fa: 'اسم من ... است', translit: 'esm-e man ... ast', en: 'my name is ...', pos: 'phrase', category: 'introductions', register: 'formal', frequency: 1, level: 1, exampleSentenceIds: ['s-intro-name'], confidence: 'high-confidence' },
  { id: 'intro-ahlchejaee', fa: 'اهل کجا هستید؟', translit: 'ahl-e kojā hastid?', en: 'where are you from?', pos: 'phrase', category: 'introductions', register: 'formal', frequency: 2, level: 1, confidence: 'high-confidence' },
  { id: 'intro-khoshbakhtam', fa: 'خوشبختم', translit: 'khoshbakhtam', en: 'nice to meet you', pos: 'interjection', category: 'introductions', register: 'neutral', frequency: 1, level: 1, literalEn: 'I am fortunate/happy', confidence: 'high-confidence' },
  { id: 'intro-hamchenin', fa: 'همچنین', translit: 'hamchenin', en: 'likewise / you too', pos: 'adverb', category: 'introductions', register: 'formal', frequency: 3, level: 2, confidence: 'high-confidence' },
  { id: 'intro-chandsalete', fa: 'چند سالته؟', translit: 'chand sāl-et-e?', en: 'how old are you? (informal)', pos: 'phrase', category: 'introductions', register: 'colloquial', frequency: 2, level: 1, confidence: 'high-confidence' },
  { id: 'intro-sal', fa: 'سال', translit: 'sāl', en: 'year / years old', pos: 'noun', category: 'introductions', register: 'neutral', frequency: 1, level: 1, pluralFa: 'سال‌ها', confidence: 'high-confidence' },
  { id: 'intro-zaban', fa: 'زبان', translit: 'zabān', en: 'language', pos: 'noun', category: 'introductions', register: 'neutral', frequency: 1, level: 1, pluralFa: 'زبان‌ها', confidence: 'high-confidence' },
  { id: 'intro-farsi', fa: 'فارسی', translit: 'fārsi', en: 'Persian (the language)', pos: 'noun', category: 'introductions', register: 'neutral', frequency: 1, level: 1, notes: '"Farsi" is the Persian-language name for the language; "Persian" is standard in English.', confidence: 'high-confidence' },
  { id: 'intro-engelisi', fa: 'انگلیسی', translit: 'engelisi', en: 'English', pos: 'noun', category: 'introductions', register: 'neutral', frequency: 1, level: 1, confidence: 'high-confidence' },
]
