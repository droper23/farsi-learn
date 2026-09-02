import type { VocabItem } from '../types'

export const healthVocab: VocabItem[] = [
  { id: 'health-doctor', fa: 'دکتر', translit: 'doktor', en: 'doctor', pos: 'noun', category: 'health', register: 'neutral', frequency: 1, level: 1, confidence: 'high-confidence' },
  { id: 'health-bimarestan', fa: 'بیمارستان', translit: 'bimārestān', en: 'hospital', pos: 'noun', category: 'health', register: 'neutral', frequency: 2, level: 1, confidence: 'high-confidence' },
  { id: 'health-daru', fa: 'دارو', translit: 'dāru', en: 'medicine', pos: 'noun', category: 'health', register: 'neutral', frequency: 2, level: 1, confidence: 'high-confidence' },
  { id: 'health-dard', fa: 'درد', translit: 'dard', en: 'pain', pos: 'noun', category: 'health', register: 'neutral', frequency: 2, level: 1, confidence: 'high-confidence' },
  { id: 'health-mariz', fa: 'مریض', translit: 'mariz', en: 'sick', pos: 'adjective', category: 'health', register: 'colloquial', frequency: 1, level: 1, altEn: ['بیمار (bimār) is the more formal word for "sick/ill".'], confidence: 'high-confidence' },
  { id: 'health-halet-chetore', fa: 'حالت چطوره؟', translit: 'hālet chetore?', en: 'how are you feeling? (informal)', pos: 'phrase', category: 'health', register: 'colloquial', frequency: 2, level: 1, confidence: 'high-confidence' },
  { id: 'health-sardard', fa: 'سردرد دارم', translit: 'sardard dāram', en: 'I have a headache', pos: 'phrase', category: 'health', register: 'neutral', frequency: 2, level: 1, confidence: 'high-confidence' },
  { id: 'health-tab', fa: 'تب', translit: 'tab', en: 'fever', pos: 'noun', category: 'health', register: 'neutral', frequency: 2, level: 1, confidence: 'high-confidence' },
  { id: 'health-sorfe', fa: 'سرفه', translit: 'sorfe', en: 'cough', pos: 'noun', category: 'health', register: 'neutral', frequency: 2, level: 1, confidence: 'high-confidence' },
  { id: 'health-ghors', fa: 'قرص', translit: 'ghors', en: 'pill / tablet', pos: 'noun', category: 'health', register: 'neutral', frequency: 2, level: 1, confidence: 'high-confidence' },
  { id: 'health-darukhane', fa: 'داروخانه', translit: 'dāru-khāne', en: 'pharmacy', pos: 'noun', category: 'health', register: 'neutral', frequency: 2, level: 1, literalEn: 'medicine-house', confidence: 'high-confidence' },
  { id: 'health-dandanpezeshk', fa: 'دندان‌پزشک', translit: 'dandān-pezeshk', en: 'dentist', pos: 'noun', category: 'health', register: 'neutral', frequency: 2, level: 2, literalEn: 'tooth-doctor', confidence: 'high-confidence' },
  { id: 'health-salem', fa: 'سالم', translit: 'sālem', en: 'healthy', pos: 'adjective', category: 'health', register: 'neutral', frequency: 2, level: 1, confidence: 'high-confidence' },
  { id: 'health-ambulance', fa: 'آمبولانس', translit: 'āmbulāns', en: 'ambulance', pos: 'noun', category: 'health', register: 'neutral', frequency: 3, level: 2, notes: 'A French/English loanword, same as in many other languages.', confidence: 'high-confidence' },
  { id: 'health-sarma-khordan', fa: 'سرما خوردن', translit: 'sarmā khordan', en: 'to catch a cold', pos: 'verb', category: 'health', register: 'neutral', frequency: 2, level: 2, literalEn: 'to eat cold', isCompoundVerb: true, verbStems: { present: 'سرما خور', past: 'سرما خورد', presentTranslit: 'sarmā khor', pastTranslit: 'sarmā khord' }, confidence: 'high-confidence' },
]

export const emotionsVocab: VocabItem[] = [
  { id: 'emo-eshgh', fa: 'عشق', translit: 'eshgh', en: 'love', pos: 'noun', category: 'emotions', register: 'neutral', frequency: 2, level: 1, confidence: 'high-confidence' },
  { id: 'emo-doostetdaram', fa: 'دوستت دارم', translit: 'dustet dāram', en: 'I love you', pos: 'phrase', category: 'emotions', register: 'colloquial', frequency: 2, level: 1, literalEn: 'I have you [as] friend/beloved', confidence: 'high-confidence' },
  { id: 'emo-tarsidan', fa: 'ترسیدن', translit: 'tarsidan', en: 'to be afraid', pos: 'verb', category: 'emotions', register: 'neutral', frequency: 2, level: 2, verbStems: { present: 'ترس', past: 'ترسید', presentTranslit: 'tars', pastTranslit: 'tarsid' }, confidence: 'high-confidence' },
  { id: 'emo-negaran', fa: 'نگران', translit: 'negarān', en: 'worried', pos: 'adjective', category: 'emotions', register: 'neutral', frequency: 2, level: 1, confidence: 'high-confidence' },
  { id: 'emo-hayjan', fa: 'هیجان‌زده', translit: 'haijān-zade', en: 'excited', pos: 'adjective', category: 'emotions', register: 'neutral', frequency: 2, level: 2, confidence: 'high-confidence' },
  { id: 'emo-asabani', fa: 'عصبانی', translit: 'asabāni', en: 'angry', pos: 'adjective', category: 'emotions', register: 'neutral', frequency: 2, level: 1, confidence: 'high-confidence' },
  { id: 'emo-motmaen', fa: 'مطمئن', translit: 'motma\'en', en: 'sure / certain', pos: 'adjective', category: 'emotions', register: 'neutral', frequency: 2, level: 2, confidence: 'high-confidence' },
]

export const shoppingVocab: VocabItem[] = [
  { id: 'shop-maghaze', fa: 'مغازه', translit: 'maghāze', en: 'shop / store', pos: 'noun', category: 'shopping', register: 'neutral', frequency: 1, level: 1, confidence: 'high-confidence' },
  { id: 'shop-bazar', fa: 'بازار', translit: 'bāzār', en: 'market/bazaar', pos: 'noun', category: 'shopping', register: 'neutral', frequency: 1, level: 1, confidence: 'high-confidence' },
  { id: 'shop-gheymat', fa: 'قیمت', translit: 'qeymat', en: 'price', pos: 'noun', category: 'shopping', register: 'neutral', frequency: 1, level: 1, confidence: 'high-confidence' },
  { id: 'shop-pool', fa: 'پول', translit: 'pul', en: 'money', pos: 'noun', category: 'shopping', register: 'neutral', frequency: 1, level: 1, confidence: 'high-confidence' },
  { id: 'shop-chandeh', fa: 'چنده؟', translit: 'chand-e?', en: 'how much is it?', pos: 'phrase', category: 'shopping', register: 'colloquial', frequency: 1, level: 1, altEn: ['چند است؟ (chand ast?) is the formal/written form.'], confidence: 'high-confidence' },
  { id: 'shop-gerooneh', fa: 'گرونه', translit: 'gerune', en: "it's expensive (colloquial)", pos: 'phrase', category: 'shopping', register: 'colloquial', frequency: 2, level: 1, altEn: ['گران است (gerān ast) is the formal form.'], confidence: 'verified', note: 'Confirmed as the standard Tehrani colloquial contraction of گران است ("it is expensive") — matches everyday usage such as "چرا بنزین اینقدر گرونه؟" (why is gas so expensive?).' },
  { id: 'shop-taarof', fa: 'تعارف', translit: 'ta\'ārof', en: 'ritual politeness / polite offering-and-declining', pos: 'noun', category: 'shopping', register: 'neutral', frequency: 3, level: 3, notes: 'A key Iranian cultural-linguistic practice: offering things (or discounts, or declining payment) as a social ritual, not always meant literally. Understanding taarof is essential for reading real Persian social interactions, including shopping.', confidence: 'high-confidence' },
  { id: 'shop-takhfif', fa: 'تخفیف', translit: 'takhfif', en: 'discount', pos: 'noun', category: 'shopping', register: 'neutral', frequency: 2, level: 2, confidence: 'high-confidence' },
  { id: 'shop-lebas', fa: 'لباس', translit: 'lebās', en: 'clothes', pos: 'noun', category: 'shopping', register: 'neutral', frequency: 1, level: 1, confidence: 'high-confidence' },
  { id: 'shop-andaze', fa: 'اندازه', translit: 'andāze', en: 'size', pos: 'noun', category: 'shopping', register: 'neutral', frequency: 2, level: 2, confidence: 'high-confidence' },
  { id: 'shop-forushande', fa: 'فروشنده', translit: 'forushande', en: 'salesperson / shopkeeper', pos: 'noun', category: 'shopping', register: 'neutral', frequency: 2, level: 2, confidence: 'high-confidence' },
  { id: 'shop-moshtari', fa: 'مشتری', translit: 'moshtari', en: 'customer', pos: 'noun', category: 'shopping', register: 'neutral', frequency: 2, level: 2, confidence: 'high-confidence' },
  { id: 'shop-naghd', fa: 'نقد', translit: 'naghd', en: 'cash', pos: 'noun', category: 'shopping', register: 'neutral', frequency: 2, level: 2, confidence: 'high-confidence' },
  { id: 'shop-poro-kardan', fa: 'پرو کردن', translit: 'poro kardan', en: 'to try on (clothes)', pos: 'verb', category: 'shopping', register: 'neutral', frequency: 2, level: 2, isCompoundVerb: true, verbStems: { present: 'پرو کن', past: 'پرو کرد', presentTranslit: 'poro kon', pastTranslit: 'poro kard' }, confidence: 'high-confidence' },
]
