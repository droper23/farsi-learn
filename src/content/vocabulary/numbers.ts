import type { VocabItem } from '../types'

const base: Array<[string, string, string, string]> = [
  ['0', 'صفر', 'sefr', 'zero'],
  ['1', 'یک', 'yek', 'one'],
  ['2', 'دو', 'do', 'two'],
  ['3', 'سه', 'se', 'three'],
  ['4', 'چهار', 'chahār', 'four'],
  ['5', 'پنج', 'panj', 'five'],
  ['6', 'شش', 'shesh', 'six'],
  ['7', 'هفت', 'haft', 'seven'],
  ['8', 'هشت', 'hasht', 'eight'],
  ['9', 'نه', 'noh', 'nine'],
  ['10', 'ده', 'dah', 'ten'],
  ['11', 'یازده', 'yāzdah', 'eleven'],
  ['12', 'دوازده', 'davāzdah', 'twelve'],
  ['13', 'سیزده', 'sizdah', 'thirteen'],
  ['14', 'چهارده', 'chahārdah', 'fourteen'],
  ['15', 'پانزده', 'pānzdah', 'fifteen'],
  ['16', 'شانزده', 'shānzdah', 'sixteen'],
  ['17', 'هفده', 'hefdah', 'seventeen'],
  ['18', 'هجده', 'hejdah', 'eighteen'],
  ['19', 'نوزده', 'nuzdah', 'nineteen'],
  ['20', 'بیست', 'bist', 'twenty'],
]

const numberWords: VocabItem[] = base.map(([n, fa, translit, en]) => ({
  id: `num-${n}`,
  fa, translit, en,
  pos: 'number',
  category: 'numbers',
  register: 'neutral',
  frequency: 1,
  level: 1,
  confidence: 'high-confidence',
} satisfies VocabItem))

const roundNumbers: VocabItem[] = [
  { id: 'num-30', fa: 'سی', translit: 'si', en: 'thirty', pos: 'number', category: 'numbers', register: 'neutral', frequency: 2, level: 1, confidence: 'high-confidence' },
  { id: 'num-40', fa: 'چهل', translit: 'chehel', en: 'forty', pos: 'number', category: 'numbers', register: 'neutral', frequency: 2, level: 1, confidence: 'high-confidence' },
  { id: 'num-50', fa: 'پنجاه', translit: 'panjāh', en: 'fifty', pos: 'number', category: 'numbers', register: 'neutral', frequency: 2, level: 1, confidence: 'high-confidence' },
  { id: 'num-60', fa: 'شصت', translit: 'shast', en: 'sixty', pos: 'number', category: 'numbers', register: 'neutral', frequency: 2, level: 1, confidence: 'high-confidence' },
  { id: 'num-70', fa: 'هفتاد', translit: 'haftād', en: 'seventy', pos: 'number', category: 'numbers', register: 'neutral', frequency: 3, level: 2, confidence: 'high-confidence' },
  { id: 'num-80', fa: 'هشتاد', translit: 'hashtād', en: 'eighty', pos: 'number', category: 'numbers', register: 'neutral', frequency: 3, level: 2, confidence: 'high-confidence' },
  { id: 'num-90', fa: 'نود', translit: 'navad', en: 'ninety', pos: 'number', category: 'numbers', register: 'neutral', frequency: 3, level: 2, confidence: 'high-confidence' },
  { id: 'num-100', fa: 'صد', translit: 'sad', en: 'one hundred', pos: 'number', category: 'numbers', register: 'neutral', frequency: 2, level: 1, confidence: 'high-confidence' },
  { id: 'num-1000', fa: 'هزار', translit: 'hezār', en: 'one thousand', pos: 'number', category: 'numbers', register: 'neutral', frequency: 2, level: 1, confidence: 'high-confidence' },
  { id: 'num-avval', fa: 'اول', translit: 'avval', en: 'first', pos: 'adjective', category: 'numbers', register: 'neutral', frequency: 2, level: 2, confidence: 'high-confidence' },
  { id: 'num-dovom', fa: 'دوم', translit: 'dovvom', en: 'second', pos: 'adjective', category: 'numbers', register: 'neutral', frequency: 2, level: 2, notes: 'Ordinal pattern: cardinal number + -om (یک→یکم/اول, دو→دوم, سه→سوم are the irregular ones).', confidence: 'high-confidence' },
  { id: 'num-sevom', fa: 'سوم', translit: 'sevvom', en: 'third', pos: 'adjective', category: 'numbers', register: 'neutral', frequency: 2, level: 2, confidence: 'high-confidence' },
]

export const numbersVocab: VocabItem[] = [...numberWords, ...roundNumbers]
