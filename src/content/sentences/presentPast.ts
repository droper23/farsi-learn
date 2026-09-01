import type { ExampleSentence } from '../types'

export const presentTenseSentences: ExampleSentence[] = [
  {
    id: 's-pres-miravam', fa: 'من هر روز به مدرسه می‌روم.', translit: 'man har ruz be madrese miravam.',
    en: 'I go to school every day.', register: 'formal', level: 1,
    words: [
      { fa: 'من', translit: 'man', en: 'I', vocabId: 'pron-man' },
      { fa: 'هر روز', translit: 'har ruz', en: 'every day' },
      { fa: 'به مدرسه', translit: 'be madrese', en: 'to school', vocabId: 'sch-madrese' },
      { fa: 'می‌روم', translit: 'miravam', en: 'I go', vocabId: 'verb-raftan' },
    ],
    grammarConceptIds: ['g-present-tense-verbs', 'g-sentence-order'], vocabIds: ['pron-man', 'sch-madrese', 'verb-raftan'],
    notes: 'Colloquial: می‌رم (miram).', confidence: 'high-confidence',
  },
  {
    id: 's-pres-mikhori', fa: 'تو چی می‌خوری؟', translit: 'to chi mikhori?', en: 'What are you eating?', register: 'colloquial', level: 1,
    words: [
      { fa: 'تو', translit: 'to', en: 'you', vocabId: 'pron-to' },
      { fa: 'چی', translit: 'chi', en: 'what', vocabId: 'q-chi' },
      { fa: 'می‌خوری؟', translit: 'mikhori?', en: 'do you eat?', vocabId: 'verb-khordan' },
    ],
    grammarConceptIds: ['g-present-tense-verbs', 'g-questions-yesno'], vocabIds: ['pron-to', 'q-chi', 'verb-khordan'],
    confidence: 'high-confidence',
  },
  {
    id: 's-pres-mikhaham', fa: 'می‌خواهم فارسی یاد بگیرم.', translit: 'mikhāham fārsi yād begiram.', en: 'I want to learn Persian.',
    register: 'formal', level: 2, literalEn: 'I-want Persian learning I-take',
    words: [
      { fa: 'می‌خواهم', translit: 'mikhāham', en: 'I want', vocabId: 'verb-khastan' },
      { fa: 'فارسی', translit: 'fārsi', en: 'Persian', vocabId: 'intro-farsi' },
      { fa: 'یاد بگیرم', translit: 'yād begiram', en: 'that I learn' },
    ],
    grammarConceptIds: ['g-subjunctive', 'g-modals'], vocabIds: ['verb-khastan', 'intro-farsi'],
    notes: 'Colloquial: می‌خوام فارسی یاد بگیرم (mikhām fārsi yād begiram).', confidence: 'high-confidence',
  },
  {
    id: 's-pres-nemifahmam', fa: 'من فارسی را نمی‌فهمم.', translit: 'man fārsi rā nemifahmam.', en: "I don't understand Persian.",
    register: 'formal', level: 1,
    words: [
      { fa: 'من', translit: 'man', en: 'I', vocabId: 'pron-man' },
      { fa: 'فارسی را', translit: 'fārsi rā', en: 'Persian (object)', vocabId: 'intro-farsi' },
      { fa: 'نمی‌فهمم', translit: 'nemifahmam', en: "I don't understand", vocabId: 'verb-fahmidan' },
    ],
    grammarConceptIds: ['g-object-marker-ra', 'g-negation'], vocabIds: ['pron-man', 'intro-farsi', 'verb-fahmidan'],
    confidence: 'high-confidence',
  },
  {
    id: 's-pres-mitavanam', fa: 'می‌توانم به شما کمک کنم؟', translit: 'mitavānam be shomā komak konam?', en: 'Can I help you?',
    register: 'formal', level: 2,
    words: [
      { fa: 'می‌توانم', translit: 'mitavānam', en: 'can I', vocabId: 'verb-tavanestan' },
      { fa: 'به شما', translit: 'be shomā', en: 'to you' },
      { fa: 'کمک کنم؟', translit: 'komak konam?', en: 'that I help?' },
    ],
    grammarConceptIds: ['g-modals', 'g-subjunctive'], vocabIds: ['verb-tavanestan'],
    notes: 'Colloquial: می‌تونم کمکتون کنم؟ (mitunam komaketun konam?).', confidence: 'high-confidence',
  },
  {
    id: 's-pres-darad', fa: 'او یک ماشین قرمز دارد.', translit: 'u yek māshin-e qermez dārad.', en: 'He/She has a red car.',
    register: 'formal', level: 1,
    words: [
      { fa: 'او', translit: 'u', en: 'he/she', vocabId: 'pron-oo' },
      { fa: 'یک ماشین قرمز', translit: 'yek māshin-e qermez', en: 'a red car' },
      { fa: 'دارد', translit: 'dārad', en: 'has', vocabId: 'verb-dashtan' },
    ],
    grammarConceptIds: ['g-ezafe-adjectives', 'g-present-tense-verbs'], vocabIds: ['pron-oo', 'trav-mashin', 'col-ghermez', 'verb-dashtan'],
    confidence: 'high-confidence',
  },
  {
    id: 's-pres-progressive', fa: 'من دارم غذا می‌خورم.', translit: 'man dāram ghazā mikhoram.', en: 'I am eating right now.',
    register: 'colloquial', level: 3,
    words: [
      { fa: 'من', translit: 'man', en: 'I', vocabId: 'pron-man' },
      { fa: 'دارم', translit: 'dāram', en: '(progressive marker)' },
      { fa: 'غذا', translit: 'ghazā', en: 'food', vocabId: 'food-ghaza' },
      { fa: 'می‌خورم', translit: 'mikhoram', en: 'I eat/am eating', vocabId: 'verb-khordan' },
    ],
    grammarConceptIds: ['g-progressive'], vocabIds: ['pron-man', 'food-ghaza', 'verb-khordan'],
    notes: 'داشتن + present tense marks an action happening right now — more emphatic than the plain present.', confidence: 'high-confidence',
  },
]

export const pastTenseSentences: ExampleSentence[] = [
  {
    id: 's-past-raftam', fa: 'دیروز به دانشگاه رفتم.', translit: 'diruz be dāneshgāh raftam.', en: 'Yesterday I went to university.',
    register: 'neutral', level: 2,
    words: [
      { fa: 'دیروز', translit: 'diruz', en: 'yesterday', vocabId: 'time-diruz' },
      { fa: 'به دانشگاه', translit: 'be dāneshgāh', en: 'to university', vocabId: 'sch-daneshgah' },
      { fa: 'رفتم', translit: 'raftam', en: 'I went', vocabId: 'verb-raftan' },
    ],
    grammarConceptIds: ['g-simple-past'], vocabIds: ['time-diruz', 'sch-daneshgah', 'verb-raftan'], confidence: 'high-confidence',
  },
  {
    id: 's-past-khordim', fa: 'ما دیشب در رستوران غذا خوردیم.', translit: 'mā dishab dar resturān ghazā khordim.',
    en: 'We ate at a restaurant last night.', register: 'neutral', level: 2,
    words: [
      { fa: 'ما', translit: 'mā', en: 'we', vocabId: 'pron-ma' },
      { fa: 'دیشب', translit: 'dishab', en: 'last night' },
      { fa: 'در رستوران', translit: 'dar resturān', en: 'at a restaurant', vocabId: 'food-restoran' },
      { fa: 'غذا خوردیم', translit: 'ghazā khordim', en: 'we ate' },
    ],
    grammarConceptIds: ['g-simple-past'], vocabIds: ['pron-ma', 'food-restoran', 'verb-khordan'], confidence: 'high-confidence',
  },
  {
    id: 's-past-nadidam', fa: 'من او را ندیدم.', translit: 'man u rā nadidam.', en: "I didn't see him/her.",
    register: 'formal', level: 2,
    words: [
      { fa: 'من', translit: 'man', en: 'I', vocabId: 'pron-man' },
      { fa: 'او را', translit: 'u rā', en: 'him/her (object)', vocabId: 'pron-oo' },
      { fa: 'ندیدم', translit: 'nadidam', en: "I didn't see", vocabId: 'verb-didan' },
    ],
    grammarConceptIds: ['g-simple-past', 'g-negation', 'g-object-marker-ra'], vocabIds: ['pron-man', 'pron-oo', 'verb-didan'],
    confidence: 'high-confidence',
  },
  {
    id: 's-past-perfect', fa: 'من قبلاً این فیلم را دیده‌ام.', translit: 'man qablan in film rā dide-am.', en: "I have (already) seen this movie.",
    register: 'formal', level: 3, literalEn: 'I previously this film seen-am',
    words: [
      { fa: 'من', translit: 'man', en: 'I', vocabId: 'pron-man' },
      { fa: 'قبلاً', translit: 'qablan', en: 'previously/already' },
      { fa: 'این فیلم را', translit: 'in film rā', en: 'this movie (object)' },
      { fa: 'دیده‌ام', translit: 'dide-am', en: 'I have seen', vocabId: 'verb-didan' },
    ],
    grammarConceptIds: ['g-present-perfect', 'g-object-marker-ra'], vocabIds: ['pron-man', 'verb-didan'],
    confidence: 'high-confidence',
  },
  {
    id: 's-past-bud', fa: 'دیروز هوا سرد بود.', translit: 'diruz havā sard bud.', en: 'The weather was cold yesterday.',
    register: 'neutral', level: 2,
    words: [
      { fa: 'دیروز', translit: 'diruz', en: 'yesterday', vocabId: 'time-diruz' },
      { fa: 'هوا', translit: 'havā', en: 'weather/air' },
      { fa: 'سرد', translit: 'sard', en: 'cold', vocabId: 'adj-sard' },
      { fa: 'بود', translit: 'bud', en: 'was', vocabId: 'verb-budan' },
    ],
    grammarConceptIds: ['g-simple-past'], vocabIds: ['time-diruz', 'adj-sard', 'verb-budan'], confidence: 'high-confidence',
  },
  {
    id: 's-future-khaham', fa: 'فردا به سفر خواهم رفت.', translit: 'fardā be safar khāham raft.', en: 'Tomorrow I will go on a trip.',
    register: 'formal', level: 3,
    words: [
      { fa: 'فردا', translit: 'fardā', en: 'tomorrow', vocabId: 'time-farda' },
      { fa: 'به سفر', translit: 'be safar', en: 'on a trip', vocabId: 'trav-safar' },
      { fa: 'خواهم رفت', translit: 'khāham raft', en: 'I will go' },
    ],
    grammarConceptIds: ['g-future'], vocabIds: ['time-farda', 'trav-safar', 'verb-raftan'],
    notes: 'This formal future (خواهم + past stem) is mostly written; everyday speech uses the present tense with a future time word instead: فردا می‌رم (fardā miram).', confidence: 'high-confidence',
  },
  {
    id: 's-future-colloquial', fa: 'فردا میام پیشت.', translit: 'fardā miyām pishet.', en: "Tomorrow I'll come over to your place.",
    register: 'colloquial', level: 3, literalEn: 'tomorrow I-come near-you',
    words: [
      { fa: 'فردا', translit: 'fardā', en: 'tomorrow', vocabId: 'time-farda' },
      { fa: 'میام', translit: 'miyām', en: "I'm coming", vocabId: 'verb-amadan' },
      { fa: 'پیشت', translit: 'pishet', en: 'to your place' },
    ],
    grammarConceptIds: ['g-future', 'g-colloquial-contractions'], vocabIds: ['time-farda', 'verb-amadan'],
    note: 'Colloquial construction (میام for می‌آیم, پیشت for پیش تو) — worth a native speaker spot-checking spelling and how natural this exact phrasing sounds.',
    confidence: 'needs-review',
  },
]
