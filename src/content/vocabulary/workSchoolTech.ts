import type { VocabItem } from '../types'

export const workVocab: VocabItem[] = [
  { id: 'work-kar', fa: 'کار', translit: 'kār', en: 'work / job', pos: 'noun', category: 'work', register: 'neutral', frequency: 1, level: 1, confidence: 'high-confidence' },
  { id: 'work-shoghl', fa: 'شغل', translit: 'shoghl', en: 'occupation / profession', pos: 'noun', category: 'work', register: 'formal', frequency: 3, level: 2, confidence: 'high-confidence' },
  { id: 'work-edare', fa: 'اداره', translit: 'edāre', en: 'office (govt./formal)', pos: 'noun', category: 'work', register: 'formal', frequency: 3, level: 2, altEn: ['دفتر (daftar) is the common word for "office" in everyday use.'], confidence: 'high-confidence' },
  { id: 'work-daftar', fa: 'دفتر', translit: 'daftar', en: 'office / notebook', pos: 'noun', category: 'work', register: 'neutral', frequency: 2, level: 1, confidence: 'high-confidence' },
  { id: 'work-rais', fa: 'رئیس', translit: 'ra\'is', en: 'boss', pos: 'noun', category: 'work', register: 'neutral', frequency: 3, level: 2, confidence: 'high-confidence' },
  { id: 'work-hoghugh', fa: 'حقوق', translit: 'hoquq', en: 'salary', pos: 'noun', category: 'work', register: 'neutral', frequency: 3, level: 2, confidence: 'high-confidence' },
]

export const schoolVocab: VocabItem[] = [
  { id: 'sch-madrese', fa: 'مدرسه', translit: 'madrese', en: 'school', pos: 'noun', category: 'school', register: 'neutral', frequency: 1, level: 1, confidence: 'high-confidence' },
  { id: 'sch-daneshgah', fa: 'دانشگاه', translit: 'dāneshgāh', en: 'university', pos: 'noun', category: 'school', register: 'neutral', frequency: 2, level: 1, confidence: 'high-confidence' },
  { id: 'sch-daneshjoo', fa: 'دانشجو', translit: 'dāneshju', en: 'university student', pos: 'noun', category: 'school', register: 'neutral', frequency: 2, level: 1, notes: 'دانش‌آموز (dānesh-āmuz) is used for a school-age student instead.', confidence: 'high-confidence' },
  { id: 'sch-moallem', fa: 'معلم', translit: 'mo\'allem', en: 'teacher', pos: 'noun', category: 'school', register: 'neutral', frequency: 2, level: 1, confidence: 'high-confidence' },
  { id: 'sch-ostad', fa: 'استاد', translit: 'ostād', en: 'professor', pos: 'noun', category: 'school', register: 'neutral', frequency: 2, level: 1, confidence: 'high-confidence' },
  { id: 'sch-kelas', fa: 'کلاس', translit: 'kelās', en: 'class / classroom', pos: 'noun', category: 'school', register: 'neutral', frequency: 1, level: 1, confidence: 'high-confidence' },
  { id: 'sch-ketab', fa: 'کتاب', translit: 'ketāb', en: 'book', pos: 'noun', category: 'school', register: 'neutral', frequency: 1, level: 1, pluralFa: 'کتاب‌ها', confidence: 'high-confidence' },
  { id: 'sch-emtehan', fa: 'امتحان', translit: 'emtehān', en: 'exam / test', pos: 'noun', category: 'school', register: 'neutral', frequency: 2, level: 1, confidence: 'high-confidence' },
  { id: 'sch-tamrin', fa: 'تمرین', translit: 'tamrin', en: 'exercise / practice', pos: 'noun', category: 'school', register: 'neutral', frequency: 2, level: 1, confidence: 'high-confidence' },
]

export const technologyVocab: VocabItem[] = [
  { id: 'tech-computer', fa: 'کامپیوتر', translit: 'kāmpyuter', en: 'computer', pos: 'noun', category: 'technology', register: 'neutral', frequency: 1, level: 1, confidence: 'high-confidence' },
  { id: 'tech-mobile', fa: 'موبایل', translit: 'mobāyl', en: 'mobile phone', pos: 'noun', category: 'technology', register: 'colloquial', frequency: 1, level: 1, altEn: ['تلفن همراه (telefon-e hamrāh) is the formal term.'], confidence: 'high-confidence' },
  { id: 'tech-internet', fa: 'اینترنت', translit: 'internet', en: 'internet', pos: 'noun', category: 'technology', register: 'neutral', frequency: 1, level: 1, confidence: 'high-confidence' },
  { id: 'tech-email', fa: 'ایمیل', translit: 'imeyl', en: 'email', pos: 'noun', category: 'technology', register: 'neutral', frequency: 2, level: 1, confidence: 'high-confidence' },
  { id: 'tech-app', fa: 'اپلیکیشن', translit: 'āplikeyshen', en: 'app', pos: 'noun', category: 'technology', register: 'colloquial', frequency: 2, level: 1, confidence: 'high-confidence' },
  { id: 'tech-akswapardazi', fa: 'عکس', translit: 'aks', en: 'photo / picture', pos: 'noun', category: 'technology', register: 'neutral', frequency: 2, level: 1, confidence: 'high-confidence' },
]
