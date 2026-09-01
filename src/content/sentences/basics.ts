import type { ExampleSentence } from '../types'

/** Level 1: greetings, introductions, the copula ("to be"), basic
 *  identification sentences ("this is a ..."). */
export const basicsSentences: ExampleSentence[] = [
  {
    id: 's-intro-name', fa: 'اسم من سارا است.', translit: 'esm-e man Sārā ast.', en: 'My name is Sara.',
    literalEn: 'name-of me Sara is.', register: 'formal', level: 1,
    words: [
      { fa: 'اسم', translit: 'esm', en: 'name', vocabId: 'intro-esm' },
      { fa: 'من', translit: 'man', en: 'of me / my', vocabId: 'pron-man' },
      { fa: 'سارا', translit: 'Sārā', en: 'Sara' },
      { fa: 'است', translit: 'ast', en: 'is' },
    ],
    grammarConceptIds: ['g-ezafe-basics', 'g-copula-present'], vocabIds: ['intro-esm', 'pron-man'],
    notes: 'Colloquially: اسمم ساراس (esmam Sārās).', confidence: 'high-confidence',
  },
  {
    id: 's-hello-name', fa: 'سلام! اسم من رضا است. اسم شما چیست؟', translit: 'salām! esm-e man Rezā ast. esm-e shomā chist?',
    en: 'Hello! My name is Reza. What is your name?', register: 'formal', level: 1,
    words: [
      { fa: 'سلام', translit: 'salām', en: 'hello', vocabId: 'greet-salam' },
      { fa: 'اسم من رضا است', translit: 'esm-e man Rezā ast', en: 'my name is Reza' },
      { fa: 'اسم شما', translit: 'esm-e shomā', en: 'your name' },
      { fa: 'چیست؟', translit: 'chist?', en: 'what is [it]?' },
    ],
    grammarConceptIds: ['g-questions-yesno', 'g-copula-present'], vocabIds: ['greet-salam', 'intro-esm', 'pron-shoma'],
    confidence: 'high-confidence',
  },
  {
    id: 's-man-daneshjoo', fa: 'من دانشجو هستم.', translit: 'man dāneshju hastam.', en: 'I am a university student.',
    register: 'neutral', level: 1,
    words: [
      { fa: 'من', translit: 'man', en: 'I', vocabId: 'pron-man' },
      { fa: 'دانشجو', translit: 'dāneshju', en: 'university student', vocabId: 'sch-daneshjoo' },
      { fa: 'هستم', translit: 'hastam', en: 'am' },
    ],
    grammarConceptIds: ['g-copula-present', 'g-sentence-order'], vocabIds: ['pron-man', 'sch-daneshjoo'],
    confidence: 'high-confidence',
  },
  {
    id: 's-oo-moallem', fa: 'او معلم است.', translit: 'u mo\'allem ast.', en: 'He/She is a teacher.',
    register: 'neutral', level: 1,
    words: [
      { fa: 'او', translit: 'u', en: 'he/she', vocabId: 'pron-oo' },
      { fa: 'معلم', translit: 'mo\'allem', en: 'teacher', vocabId: 'sch-moallem' },
      { fa: 'است', translit: 'ast', en: 'is' },
    ],
    grammarConceptIds: ['g-copula-present'], vocabIds: ['pron-oo', 'sch-moallem'], confidence: 'high-confidence',
  },
  {
    id: 's-in-ketabe', fa: 'این کتاب است.', translit: 'in ketāb ast.', en: 'This is a book.',
    register: 'neutral', level: 1,
    words: [
      { fa: 'این', translit: 'in', en: 'this' },
      { fa: 'کتاب', translit: 'ketāb', en: 'book', vocabId: 'sch-ketab' },
      { fa: 'است', translit: 'ast', en: 'is' },
    ],
    grammarConceptIds: ['g-demonstratives', 'g-copula-present'], vocabIds: ['sch-ketab'], confidence: 'high-confidence',
  },
  {
    id: 's-an-khaneye', fa: 'آن خانه بزرگ است.', translit: 'ān khāne bozorg ast.', en: 'That house is big.',
    register: 'neutral', level: 1,
    words: [
      { fa: 'آن', translit: 'ān', en: 'that' },
      { fa: 'خانه', translit: 'khāne', en: 'house', vocabId: 'home-khane' },
      { fa: 'بزرگ', translit: 'bozorg', en: 'big', vocabId: 'adj-bozorg' },
      { fa: 'است', translit: 'ast', en: 'is' },
    ],
    grammarConceptIds: ['g-demonstratives', 'g-ezafe-adjectives'], vocabIds: ['home-khane', 'adj-bozorg'],
    confidence: 'high-confidence',
  },
  {
    id: 's-hale-shoma', fa: 'حال شما چطور است؟ — خوبم، ممنون.', translit: 'hāl-e shomā chetor ast? — khubam, mamnun.',
    en: 'How are you? — I\'m good, thanks.', register: 'formal', level: 1,
    words: [
      { fa: 'حال شما', translit: 'hāl-e shomā', en: 'your condition/state' },
      { fa: 'چطور است؟', translit: 'chetor ast?', en: 'how is [it]?' },
      { fa: 'خوبم', translit: 'khubam', en: "I'm good" },
      { fa: 'ممنون', translit: 'mamnun', en: 'thanks', vocabId: 'greet-mamnoon' },
    ],
    grammarConceptIds: ['g-copula-present', 'g-ezafe-basics'], vocabIds: ['greet-mamnoon'], confidence: 'high-confidence',
  },
  {
    id: 's-man-irani-nistam', fa: 'من ایرانی نیستم، آمریکایی هستم.', translit: 'man irāni nistam, āmrikāyi hastam.',
    en: "I'm not Iranian, I'm American.", register: 'neutral', level: 1,
    words: [
      { fa: 'من', translit: 'man', en: 'I', vocabId: 'pron-man' },
      { fa: 'ایرانی', translit: 'irāni', en: 'Iranian' },
      { fa: 'نیستم', translit: 'nistam', en: 'am not' },
      { fa: 'آمریکایی', translit: 'āmrikāyi', en: 'American' },
      { fa: 'هستم', translit: 'hastam', en: 'am' },
    ],
    grammarConceptIds: ['g-negation', 'g-copula-present'], vocabIds: ['pron-man'], confidence: 'high-confidence',
  },
  {
    id: 's-chandta-ketab', fa: 'من سه تا کتاب دارم.', translit: 'man se tā ketāb dāram.', en: 'I have three books.',
    register: 'neutral', level: 1, literalEn: 'I three-count book have',
    words: [
      { fa: 'من', translit: 'man', en: 'I', vocabId: 'pron-man' },
      { fa: 'سه تا', translit: 'se tā', en: 'three (of)' },
      { fa: 'کتاب', translit: 'ketāb', en: 'book', vocabId: 'sch-ketab' },
      { fa: 'دارم', translit: 'dāram', en: 'I have' },
    ],
    grammarConceptIds: ['g-nouns-plurals', 'g-present-tense-verbs'], vocabIds: ['pron-man', 'sch-ketab', 'verb-dashtan'],
    notes: 'After a counted number, Persian nouns normally stay singular; تا is a common counter word.', confidence: 'high-confidence',
  },
  {
    id: 's-baradaram-hast', fa: 'من دو برادر و یک خواهر دارم.', translit: 'man do barādar va yek khāhar dāram.',
    en: 'I have two brothers and one sister.', register: 'neutral', level: 1,
    words: [
      { fa: 'من', translit: 'man', en: 'I', vocabId: 'pron-man' },
      { fa: 'دو برادر', translit: 'do barādar', en: 'two brothers', vocabId: 'fam-baradar' },
      { fa: 'و', translit: 'va', en: 'and', vocabId: 'conn-va' },
      { fa: 'یک خواهر', translit: 'yek khāhar', en: 'one sister', vocabId: 'fam-khahar' },
      { fa: 'دارم', translit: 'dāram', en: 'I have' },
    ],
    grammarConceptIds: ['g-nouns-plurals'], vocabIds: ['fam-baradar', 'fam-khahar', 'verb-dashtan'], confidence: 'high-confidence',
  },
  {
    id: 's-zwnj-bacheha', fa: 'بچه‌ها در خانه هستند.', translit: 'bache-hā dar khāne hastand.', en: 'The children are at home.',
    register: 'neutral', level: 1, literalEn: 'children in home are',
    words: [
      { fa: 'بچه‌ها', translit: 'bache-hā', en: 'children', vocabId: 'fam-bache' },
      { fa: 'در', translit: 'dar', en: 'in / at' },
      { fa: 'خانه', translit: 'khāne', en: 'home', vocabId: 'home-khane' },
      { fa: 'هستند', translit: 'hastand', en: 'are' },
    ],
    grammarConceptIds: ['g-orthography-zwnj', 'g-nouns-plurals'], vocabIds: ['fam-bache', 'home-khane'],
    notes: 'بچه‌ها is written with a ZWNJ between the noun and the -ها plural suffix, not a full space or no space at all.',
    confidence: 'verified',
  },
]
