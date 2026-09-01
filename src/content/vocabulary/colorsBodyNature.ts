import type { VocabItem } from '../types'

export const colorsVocab: VocabItem[] = [
  { id: 'col-ghermez', fa: 'قرمز', translit: 'qermez', en: 'red', pos: 'adjective', category: 'colors', register: 'neutral', frequency: 1, level: 1, confidence: 'high-confidence' },
  { id: 'col-abi', fa: 'آبی', translit: 'ābi', en: 'blue', pos: 'adjective', category: 'colors', register: 'neutral', frequency: 1, level: 1, confidence: 'high-confidence' },
  { id: 'col-sabz', fa: 'سبز', translit: 'sabz', en: 'green', pos: 'adjective', category: 'colors', register: 'neutral', frequency: 1, level: 1, confidence: 'high-confidence' },
  { id: 'col-zard', fa: 'زرد', translit: 'zard', en: 'yellow', pos: 'adjective', category: 'colors', register: 'neutral', frequency: 1, level: 1, confidence: 'high-confidence' },
  { id: 'col-siah', fa: 'سیاه', translit: 'siāh', en: 'black', pos: 'adjective', category: 'colors', register: 'neutral', frequency: 1, level: 1, altEn: ['مشکی (meshki) is equally common, especially for objects/clothing.'], confidence: 'high-confidence' },
  { id: 'col-sefid', fa: 'سفید', translit: 'sefid', en: 'white', pos: 'adjective', category: 'colors', register: 'neutral', frequency: 1, level: 1, confidence: 'high-confidence' },
  { id: 'col-narenji', fa: 'نارنجی', translit: 'nārenji', en: 'orange', pos: 'adjective', category: 'colors', register: 'neutral', frequency: 2, level: 1, confidence: 'high-confidence' },
  { id: 'col-banafsh', fa: 'بنفش', translit: 'banafsh', en: 'purple', pos: 'adjective', category: 'colors', register: 'neutral', frequency: 3, level: 1, confidence: 'high-confidence' },
  { id: 'col-khakestari', fa: 'خاکستری', translit: 'khākestari', en: 'gray', pos: 'adjective', category: 'colors', register: 'neutral', frequency: 3, level: 1, confidence: 'high-confidence' },
  { id: 'col-ghahvei', fa: 'قهوه‌ای', translit: 'qahve-i', en: 'brown', pos: 'adjective', category: 'colors', register: 'neutral', frequency: 2, level: 1, literalEn: 'coffee-colored', confidence: 'high-confidence' },
]

export const bodyVocab: VocabItem[] = [
  { id: 'body-sar', fa: 'سر', translit: 'sar', en: 'head', pos: 'noun', category: 'body', register: 'neutral', frequency: 1, level: 2, confidence: 'high-confidence' },
  { id: 'body-dast', fa: 'دست', translit: 'dast', en: 'hand / arm', pos: 'noun', category: 'body', register: 'neutral', frequency: 1, level: 2, confidence: 'high-confidence' },
  { id: 'body-pa', fa: 'پا', translit: 'pā', en: 'foot / leg', pos: 'noun', category: 'body', register: 'neutral', frequency: 1, level: 2, confidence: 'high-confidence' },
  { id: 'body-cheshm', fa: 'چشم', translit: 'cheshm', en: 'eye', pos: 'noun', category: 'body', register: 'neutral', frequency: 1, level: 2, confidence: 'high-confidence' },
  { id: 'body-gush', fa: 'گوش', translit: 'gush', en: 'ear', pos: 'noun', category: 'body', register: 'neutral', frequency: 2, level: 2, confidence: 'high-confidence' },
  { id: 'body-dahan', fa: 'دهان', translit: 'dahān', en: 'mouth', pos: 'noun', category: 'body', register: 'neutral', frequency: 2, level: 2, confidence: 'high-confidence' },
  { id: 'body-ghalb', fa: 'قلب', translit: 'qalb', en: 'heart (organ)', pos: 'noun', category: 'body', register: 'neutral', frequency: 3, level: 2, notes: 'دل (del) is used for "heart" in the emotional/figurative sense (دلم می‌خواهد "my heart wants" = "I feel like").', confidence: 'high-confidence' },
  { id: 'body-bini', fa: 'بینی', translit: 'bini', en: 'nose', pos: 'noun', category: 'body', register: 'neutral', frequency: 2, level: 2, altEn: ['دماغ (damāgh) is the everyday colloquial word for "nose".'], confidence: 'high-confidence' },
  { id: 'body-mo', fa: 'مو', translit: 'mu', en: 'hair', pos: 'noun', category: 'body', register: 'neutral', frequency: 2, level: 2, pluralFa: 'موها', confidence: 'high-confidence' },
]

export const natureVocab: VocabItem[] = [
  { id: 'nat-khorshid', fa: 'خورشید', translit: 'khorshid', en: 'sun', pos: 'noun', category: 'nature', register: 'neutral', frequency: 2, level: 1, confidence: 'high-confidence' },
  { id: 'nat-mah', fa: 'ماه', translit: 'māh', en: 'moon / month', pos: 'noun', category: 'nature', register: 'neutral', frequency: 1, level: 1, confidence: 'high-confidence' },
  { id: 'nat-setare', fa: 'ستاره', translit: 'setāre', en: 'star', pos: 'noun', category: 'nature', register: 'neutral', frequency: 3, level: 1, confidence: 'high-confidence' },
  { id: 'nat-darya', fa: 'دریا', translit: 'daryā', en: 'sea', pos: 'noun', category: 'nature', register: 'neutral', frequency: 2, level: 1, confidence: 'high-confidence' },
  { id: 'nat-kuh', fa: 'کوه', translit: 'kuh', en: 'mountain', pos: 'noun', category: 'nature', register: 'neutral', frequency: 2, level: 1, confidence: 'high-confidence' },
  { id: 'nat-derakht', fa: 'درخت', translit: 'derakht', en: 'tree', pos: 'noun', category: 'nature', register: 'neutral', frequency: 2, level: 1, confidence: 'high-confidence' },
  { id: 'nat-gol', fa: 'گل', translit: 'gol', en: 'flower', pos: 'noun', category: 'nature', register: 'neutral', frequency: 1, level: 1, confidence: 'high-confidence' },
  { id: 'nat-baran', fa: 'باران', translit: 'bārān', en: 'rain', pos: 'noun', category: 'weather', register: 'neutral', frequency: 1, level: 1, confidence: 'high-confidence' },
  { id: 'nat-barf', fa: 'برف', translit: 'barf', en: 'snow', pos: 'noun', category: 'weather', register: 'neutral', frequency: 1, level: 1, confidence: 'high-confidence' },
  { id: 'nat-bad', fa: 'باد', translit: 'bād', en: 'wind', pos: 'noun', category: 'weather', register: 'neutral', frequency: 2, level: 1, confidence: 'high-confidence' },
  { id: 'nat-havakhube', fa: 'هوا خوب است', translit: 'havā khub ast', en: 'the weather is nice', pos: 'phrase', category: 'weather', register: 'neutral', frequency: 1, level: 1, confidence: 'high-confidence' },
  { id: 'nat-havagarmast', fa: 'هوا گرم است', translit: 'havā garm ast', en: "it's hot out", pos: 'phrase', category: 'weather', register: 'neutral', frequency: 1, level: 1, confidence: 'high-confidence' },
  { id: 'nat-havasarde', fa: 'هوا سرد است', translit: 'havā sard ast', en: "it's cold out", pos: 'phrase', category: 'weather', register: 'neutral', frequency: 1, level: 1, confidence: 'high-confidence' },
  { id: 'nat-aftab', fa: 'آفتاب', translit: 'āftāb', en: 'sun / sunshine', pos: 'noun', category: 'weather', register: 'neutral', frequency: 1, level: 1, altEn: ['آفتابی است (āftābi ast) = "it is sunny".'], confidence: 'high-confidence' },
  { id: 'nat-abr', fa: 'ابر', translit: 'abr', en: 'cloud', pos: 'noun', category: 'weather', register: 'neutral', frequency: 2, level: 1, altEn: ['ابری است (abri ast) = "it is cloudy".'], confidence: 'high-confidence' },
  { id: 'nat-dama', fa: 'دما', translit: 'damā', en: 'temperature', pos: 'noun', category: 'weather', register: 'neutral', frequency: 2, level: 2, confidence: 'high-confidence' },
]
