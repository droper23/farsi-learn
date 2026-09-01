import type { VocabItem } from '../types'

export const questionWordsVocab: VocabItem[] = [
  { id: 'q-chi', fa: 'چی', translit: 'chi', en: 'what', pos: 'question-word', category: 'question-words', register: 'colloquial', frequency: 1, level: 1, altEn: ['چه (che) is the formal/written equivalent, used before a noun: چه کتابی "what book".'], confidence: 'high-confidence' },
  { id: 'q-ki-who', fa: 'کی', translit: 'ki', en: 'who', pos: 'question-word', category: 'question-words', register: 'neutral', frequency: 1, level: 1, notes: 'Careful: کی also means "when" — context (or stress) tells them apart; چه کسی (che kasi) is the unambiguous formal "who".', confidence: 'needs-review' },
  { id: 'q-koja', fa: 'کجا', translit: 'kojā', en: 'where', pos: 'question-word', category: 'question-words', register: 'neutral', frequency: 1, level: 1, confidence: 'high-confidence' },
  { id: 'q-chera', fa: 'چرا', translit: 'cherā', en: 'why', pos: 'question-word', category: 'question-words', register: 'neutral', frequency: 1, level: 1, confidence: 'high-confidence' },
  { id: 'q-chetor', fa: 'چطور', translit: 'chetor', en: 'how', pos: 'question-word', category: 'question-words', register: 'neutral', frequency: 1, level: 1, confidence: 'high-confidence' },
  { id: 'q-chand', fa: 'چند', translit: 'chand', en: 'how many / how much', pos: 'question-word', category: 'question-words', register: 'neutral', frequency: 1, level: 1, confidence: 'high-confidence' },
  { id: 'q-chegh', fa: 'چقدر', translit: 'cheqadr', en: 'how much (quantity, price, degree)', pos: 'question-word', category: 'question-words', register: 'neutral', frequency: 1, level: 1, confidence: 'high-confidence' },
  { id: 'q-kodoom', fa: 'کدام', translit: 'kodām', en: 'which', pos: 'question-word', category: 'question-words', register: 'neutral', frequency: 2, level: 1, confidence: 'high-confidence' },
]

export const connectorsPrepositionsVocab: VocabItem[] = [
  { id: 'prep-dar', fa: 'در', translit: 'dar', en: 'in / at', pos: 'preposition', category: 'prepositions', register: 'neutral', frequency: 1, level: 1, notes: 'Often dropped in casual speech in favor of just placing the noun.', confidence: 'high-confidence' },
  { id: 'prep-be', fa: 'به', translit: 'be', en: 'to', pos: 'preposition', category: 'prepositions', register: 'neutral', frequency: 1, level: 1, confidence: 'high-confidence' },
  { id: 'prep-az', fa: 'از', translit: 'az', en: 'from', pos: 'preposition', category: 'prepositions', register: 'neutral', frequency: 1, level: 1, confidence: 'high-confidence' },
  { id: 'prep-ba', fa: 'با', translit: 'bā', en: 'with', pos: 'preposition', category: 'prepositions', register: 'neutral', frequency: 1, level: 1, confidence: 'high-confidence' },
  { id: 'prep-baraye', fa: 'برای', translit: 'barāye', en: 'for', pos: 'preposition', category: 'prepositions', register: 'neutral', frequency: 1, level: 1, confidence: 'high-confidence' },
  { id: 'prep-ru', fa: 'روی', translit: 'ru-ye', en: 'on / on top of', pos: 'preposition', category: 'prepositions', register: 'neutral', frequency: 2, level: 1, confidence: 'high-confidence' },
  { id: 'prep-zir', fa: 'زیر', translit: 'zir-e', en: 'under', pos: 'preposition', category: 'prepositions', register: 'neutral', frequency: 2, level: 1, confidence: 'high-confidence' },
  { id: 'prep-kenar', fa: 'کنار', translit: 'kenār-e', en: 'next to / beside', pos: 'preposition', category: 'prepositions', register: 'neutral', frequency: 2, level: 1, confidence: 'high-confidence' },
  { id: 'prep-jelo', fa: 'جلوی', translit: 'jelo-ye', en: 'in front of', pos: 'preposition', category: 'prepositions', register: 'neutral', frequency: 2, level: 1, confidence: 'high-confidence' },
  { id: 'prep-poshte', fa: 'پشت', translit: 'posht-e', en: 'behind', pos: 'preposition', category: 'prepositions', register: 'neutral', frequency: 2, level: 1, confidence: 'high-confidence' },
  { id: 'prep-beyn', fa: 'بین', translit: 'beyn-e', en: 'between', pos: 'preposition', category: 'prepositions', register: 'neutral', frequency: 3, level: 2, confidence: 'high-confidence' },
  { id: 'conn-va', fa: 'و', translit: 'va', en: 'and', pos: 'conjunction', category: 'connectors', register: 'neutral', frequency: 1, level: 1, notes: 'Often reduced to "o" in fast speech, e.g. نان و پنیر → nun-o panir.', confidence: 'high-confidence' },
  { id: 'conn-ya', fa: 'یا', translit: 'yā', en: 'or', pos: 'conjunction', category: 'connectors', register: 'neutral', frequency: 1, level: 1, confidence: 'high-confidence' },
  { id: 'conn-vali', fa: 'ولی', translit: 'vali', en: 'but', pos: 'conjunction', category: 'connectors', register: 'neutral', frequency: 1, level: 1, confidence: 'high-confidence' },
  { id: 'conn-ama', fa: 'اما', translit: 'ammā', en: 'but (more formal/emphatic)', pos: 'conjunction', category: 'connectors', register: 'formal', frequency: 2, level: 1, confidence: 'high-confidence' },
  { id: 'conn-chon', fa: 'چون', translit: 'chon', en: 'because', pos: 'conjunction', category: 'connectors', register: 'neutral', frequency: 1, level: 1, confidence: 'high-confidence' },
  { id: 'conn-age', fa: 'اگر', translit: 'agar', en: 'if', pos: 'conjunction', category: 'connectors', register: 'neutral', frequency: 1, level: 2, confidence: 'high-confidence' },
  { id: 'conn-ke', fa: 'که', translit: 'ke', en: 'that / who / which (relative connector)', pos: 'conjunction', category: 'connectors', register: 'neutral', frequency: 1, level: 2, notes: 'The single most common word for introducing a relative or subordinate clause.', confidence: 'high-confidence' },
  { id: 'conn-pas', fa: 'پس', translit: 'pas', en: 'so / then', pos: 'conjunction', category: 'connectors', register: 'neutral', frequency: 2, level: 2, confidence: 'high-confidence' },
  { id: 'conn-hamintor', fa: 'همچنین', translit: 'hamchenin', en: 'also / additionally', pos: 'conjunction', category: 'connectors', register: 'formal', frequency: 3, level: 2, confidence: 'high-confidence' },
]
