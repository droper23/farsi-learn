import type { Unit } from '../types'

export const units: Unit[] = [
  // ---------------------------------------------------------------- Level 1
  {
    id: 'u1-alphabet-1', level: 1, order: 1, title: 'The Alphabet, Part 1', titleFa: 'الفبا ۱',
    description: 'The first 11 letters, from ا (alef) to ذ (zal): shapes, sounds, and how letters connect.',
    alphabetIds: ['alef', 'be', 'pe', 'te', 'the', 'jim', 'che', 'he_jimi', 'khe', 'dal', 'zal'],
    lessonCount: 3,
  },
  {
    id: 'u1-alphabet-2', level: 1, order: 2, title: 'The Alphabet, Part 2', titleFa: 'الفبا ۲',
    description: 'Eleven more letters, from ر (re) to غ (gheyn), including several that never connect forward.',
    alphabetIds: ['re', 'ze', 'zhe', 'sin', 'shin', 'sad', 'zad', 'ta_arabic', 'za_arabic', 'eyn', 'gheyn'],
    lessonCount: 3,
  },
  {
    id: 'u1-alphabet-3', level: 1, order: 3, title: 'The Alphabet, Part 3', titleFa: 'الفبا ۳',
    description: 'The last 10 letters, from ف (fe) to ی (ye) — finishing the full 32-letter alphabet.',
    alphabetIds: ['fe', 'qaf', 'kaf', 'gaf', 'lam', 'mim', 'nun', 'vav', 'he_docheshm', 'ye'],
    lessonCount: 3,
  },
  {
    id: 'u1-vowels-numbers', level: 1, order: 4, title: 'Vowels, Numbers & Reading', titleFa: 'مصوت‌ها و اعداد',
    description: 'Short vowels, Persian digits, and the numbers 0–20 — the building blocks for reading real words.',
    grammarConceptIds: ['g-orthography-zwnj'],
    vocabIds: ['num-0', 'num-1', 'num-2', 'num-3', 'num-4', 'num-5', 'num-6', 'num-7', 'num-8', 'num-9', 'num-10'],
    sentenceIds: ['s-zwnj-bacheha'],
    lessonCount: 2,
  },
  {
    id: 'u1-greetings', level: 1, order: 5, title: 'Greetings & Introductions', titleFa: 'سلام و احوال‌پرسی',
    description: 'Say hello and goodbye, ask how someone is doing, and introduce yourself.',
    vocabIds: ['greet-salam', 'greet-khodahafez', 'greet-fely', 'greet-sobbekheir', 'greet-shabbekheir', 'greet-halshoma', 'greet-chetori', 'greet-khubam', 'greet-mamnoon', 'greet-mersi', 'greet-kheylimamnoon', 'greet-khahesh', 'greet-bebakhshid', 'greet-bale', 'greet-are', 'greet-na', 'greet-lotfan', 'pron-man', 'pron-to', 'pron-oo', 'pron-ma', 'pron-shoma', 'pron-anha', 'intro-esm', 'intro-esmeman', 'intro-khoshbakhtam'],
    grammarConceptIds: ['g-copula-present', 'g-ezafe-basics'],
    sentenceIds: ['s-intro-name', 's-hello-name', 's-hale-shoma'],
    lessonCount: 3,
  },
  {
    id: 'u1-this-is', level: 1, order: 6, title: '"This is..." — Basic Sentences', titleFa: 'این ... است',
    description: 'Point at things, say what they are, and build your first complete Persian sentences.',
    vocabIds: ['sch-ketab', 'home-khane', 'adj-bozorg', 'adj-khub', 'adj-kuchik'],
    grammarConceptIds: ['g-sentence-order', 'g-demonstratives', 'g-ezafe-adjectives', 'g-negation'],
    sentenceIds: ['s-in-ketabe', 's-an-khaneye', 's-man-daneshjoo', 's-oo-moallem', 's-man-irani-nistam'],
    lessonCount: 2,
  },
  {
    id: 'u1-family', level: 1, order: 7, title: 'Family & People', titleFa: 'خانواده',
    description: 'Talk about your family and count how many siblings, books, or friends you have.',
    vocabIds: ['fam-khanevade', 'fam-pedar', 'fam-mother', 'fam-baba', 'fam-maman', 'fam-baradar', 'fam-khahar', 'fam-pesar', 'fam-dokhtar', 'fam-zan', 'fam-mard', 'fam-dust'],
    grammarConceptIds: ['g-nouns-plurals'],
    sentenceIds: ['s-chandta-ketab', 's-baradaram-hast'],
    lessonCount: 2,
  },
  {
    id: 'u1-present-verbs', level: 1, order: 8, title: 'Everyday Verbs: Present Tense', titleFa: 'زمان حال',
    description: 'Build your first conjugated sentences: I go, I eat, I want, I have.',
    vocabIds: ['verb-raftan', 'verb-amadan', 'verb-khordan', 'verb-dashtan', 'verb-khastan', 'verb-didan', 'q-chi'],
    grammarConceptIds: ['g-present-tense-verbs'],
    sentenceIds: ['s-pres-miravam', 's-pres-mikhori', 's-pres-darad'],
    lessonCount: 3,
  },
  {
    id: 'u1-food', level: 1, order: 9, title: 'Food & Drink', titleFa: 'غذا و نوشیدنی',
    description: 'Order food, say what you like, and talk about being hungry or thirsty.',
    vocabIds: ['food-ghaza', 'food-nan', 'food-berenj', 'food-ab', 'food-chay', 'food-ghahve', 'food-miveh', 'food-sib', 'food-panir', 'food-tokhmemorgh', 'food-gusht', 'food-morgh', 'food-restoran', 'food-menu', 'food-garson', 'food-sefaresh', 'food-nushidani', 'food-goshnam', 'food-tashnamme', 'food-khoshmazast'],
    sentenceIds: ['s-past-khordim'],
    lessonCount: 2,
  },
  {
    id: 'u1-house-colors', level: 1, order: 10, title: 'Around the House & Colors', titleFa: 'خانه و رنگ‌ها',
    description: 'Rooms, furniture, and the colors of everyday objects.',
    vocabIds: ['home-khane', 'home-apartman', 'home-otagh', 'home-otaghkhab', 'home-ashpazkhane', 'home-dar', 'home-panjere', 'home-miz', 'home-sandali', 'home-takht', 'col-ghermez', 'col-abi', 'col-sabz', 'col-zard', 'col-siah', 'col-sefid'],
    grammarConceptIds: ['g-ezafe-basics'],
    sentenceIds: ['s-ezafe-ketabeman'],
    lessonCount: 2,
  },

  // ---------------------------------------------------------------- Level 2
  {
    id: 'u2-past-tense', level: 2, order: 11, title: 'Past Tense & Yesterday', titleFa: 'زمان گذشته',
    description: 'Talk about what happened: yesterday, last night, and everything already finished.',
    vocabIds: ['time-emruz', 'time-diruz', 'time-farda', 'verb-goftan', 'verb-kardan'],
    grammarConceptIds: ['g-simple-past'],
    sentenceIds: ['s-past-raftam', 's-past-khordim', 's-past-nadidam', 's-past-bud'],
    lessonCount: 3,
  },
  {
    id: 'u2-possession', level: 2, order: 12, title: 'Whose Is It? Possession', titleFa: 'مالکیت',
    description: 'Three ways to say "my", "your", and "his/hers" — and when to use each.',
    grammarConceptIds: ['g-possession'],
    sentenceIds: ['s-ezafe-khanareza', 's-possession-am'],
    lessonCount: 2,
  },
  {
    id: 'u2-ra', level: 2, order: 13, title: 'The Object Marker را', titleFa: 'را',
    description: 'The single most distinctive piece of Persian grammar: marking a definite direct object.',
    grammarConceptIds: ['g-object-marker-ra'],
    sentenceIds: ['s-ra-ketab', 's-ra-vs-indefinite', 's-pres-nemifahmam'],
    lessonCount: 2,
  },
  {
    id: 'u2-adjectives-comparison', level: 2, order: 14, title: 'Describing Things: Comparison', titleFa: 'مقایسه',
    description: 'Bigger, best, more interesting — comparatives and superlatives.',
    vocabIds: ['adj-jadid', 'adj-ghadimi', 'adj-ziba', 'adj-qashang', 'adj-garm', 'adj-sard', 'adj-sari', 'adj-kond', 'adj-asan', 'adj-sakht', 'adj-gerun', 'adj-arzoon'],
    grammarConceptIds: ['g-comparison'],
    sentenceIds: ['s-comparative', 's-superlative'],
    lessonCount: 2,
  },
  {
    id: 'u2-commands', level: 2, order: 15, title: 'Giving Commands', titleFa: 'امر',
    description: 'Ask people to do things, and tell them not to.',
    grammarConceptIds: ['g-imperative'],
    sentenceIds: ['s-ra-ketab', 's-imperative-negative'],
    lessonCount: 1,
  },
  {
    id: 'u2-time-dates', level: 2, order: 16, title: 'Numbers, Time & Dates', titleFa: 'زمان و تاریخ',
    description: 'Tell time, name the days of the week, and count past twenty.',
    vocabIds: ['num-20', 'num-30', 'num-40', 'num-50', 'num-100', 'num-1000', 'time-saat', 'time-daghighe', 'time-chandsaate', 'time-shanbe', 'time-yekshanbe', 'time-doshanbe', 'time-seshanbe', 'time-chaharshanbe', 'time-panjshanbe', 'time-jome', 'time-hafte', 'time-mah', 'time-sal'],
    lessonCount: 2,
  },
  {
    id: 'u2-travel', level: 2, order: 17, title: 'Getting Around: Travel & Directions', titleFa: 'سفر و مسیر',
    description: 'Transportation, asking for directions, and finding your way.',
    vocabIds: ['trav-havapeyma', 'trav-forudgah', 'trav-ghatar', 'trav-otobus', 'trav-taxi', 'trav-mashin', 'trav-bilit', 'trav-safar', 'trav-hotel', 'trav-chamedan', 'trav-viza', 'trav-naghshe', 'trav-docharkhe', 'trav-metro', 'trav-ranande', 'dir-rast', 'dir-chap', 'dir-mostaghim', 'dir-nazdik', 'dir-dur', 'dir-khiaban', 'dir-shomal', 'dir-jonub', 'dir-shargh', 'dir-gharb'],
    lessonCount: 2,
  },
  {
    id: 'u2-shopping', level: 2, order: 18, title: 'Shopping & Bargaining', titleFa: 'خرید',
    description: 'Ask prices, understand taarof, and handle a simple purchase.',
    vocabIds: ['shop-maghaze', 'shop-bazar', 'shop-gheymat', 'shop-pool', 'shop-chandeh', 'shop-gerooneh', 'shop-taarof'],
    lessonCount: 2,
  },

  // ---------------------------------------------------------------- Level 3
  {
    id: 'u3-modals', level: 3, order: 19, title: 'Can, Must, Want: Modals & Subjunctive', titleFa: 'وجه التزامی',
    description: 'Express ability, obligation, and desire — and meet the subjunctive that ties them together.',
    vocabIds: ['verb-tavanestan'],
    grammarConceptIds: ['g-modals', 'g-subjunctive'],
    sentenceIds: ['s-pres-mikhaham', 's-pres-mitavanam', 's-must-bayad'],
    lessonCount: 3,
  },
  {
    id: 'u3-progressive-perfect', level: 3, order: 20, title: 'Right Now, and Already Done', titleFa: 'استمراری و نقلی',
    description: 'The progressive ("I am eating right now") and the present perfect ("I have already seen this").',
    grammarConceptIds: ['g-progressive', 'g-present-perfect'],
    sentenceIds: ['s-pres-progressive', 's-past-perfect', 's-pres-progressive-khandan', 's-present-perfect-negative'],
    lessonCount: 2,
  },
  {
    id: 'u3-clauses', level: 3, order: 21, title: 'Connecting Ideas with که', titleFa: 'جملات وابسته',
    description: 'Build longer sentences using که to connect and describe.',
    grammarConceptIds: ['g-relative-clauses'],
    sentenceIds: ['s-relative-ke', 's-relative-ketab'],
    lessonCount: 1,
  },
  {
    id: 'u3-register', level: 3, order: 22, title: 'Formal vs. Colloquial Persian', titleFa: 'رسمی و محاوره‌ای',
    description: 'Recognize the everyday spoken forms that differ from the formal Persian taught in most textbooks.',
    grammarConceptIds: ['g-register', 'g-colloquial-contractions', 'g-compound-verbs'],
    sentenceIds: ['s-colloquial-mikham', 's-future-colloquial', 's-compound-verb'],
    lessonCount: 2,
  },
  {
    id: 'u3-health-emotions', level: 3, order: 23, title: 'Health & Emotions', titleFa: 'سلامتی و احساسات',
    description: 'Say how you feel, physically and emotionally.',
    vocabIds: ['health-doctor', 'health-bimarestan', 'health-daru', 'health-dard', 'health-mariz', 'health-halet-chetore', 'health-sardard', 'emo-eshgh', 'emo-negaran', 'emo-hayjan', 'emo-asabani', 'adj-khaste', 'adj-khoshhal', 'adj-narahat'],
    lessonCount: 2,
  },

  // ---------------------------------------------------------------- Level 4
  {
    id: 'u4-conditionals', level: 4, order: 24, title: 'If... Conditionals', titleFa: 'شرطی',
    description: 'Real and hypothetical "if" sentences — and the tense shift that separates them.',
    grammarConceptIds: ['g-conditionals'],
    sentenceIds: ['s-conditional-real', 's-conditional-unreal'],
    lessonCount: 2,
  },
  {
    id: 'u4-reported-speech', level: 4, order: 25, title: 'Reported Speech', titleFa: 'نقل قول',
    description: 'Report what someone else said, Persian-style.',
    grammarConceptIds: ['g-reported-speech'],
    sentenceIds: ['s-reported-speech'],
    lessonCount: 1,
  },
  {
    id: 'u4-future-passive', level: 4, order: 26, title: 'The Future & Passive Voice', titleFa: 'آینده و مجهول',
    description: 'The formal future tense, and how Persian builds the passive voice.',
    grammarConceptIds: ['g-future'],
    sentenceIds: ['s-future-khaham', 's-passive'],
    lessonCount: 2,
  },

  // ------------------------------------------------------- Levels 5 & 6
  // These levels are intentionally seeded rather than fully built out —
  // see PROGRESS.md "What's incomplete" for the expansion plan.
  {
    id: 'u5-natural-conversation', level: 5, order: 27, title: 'Natural Conversation & Idioms', titleFa: 'مکالمه طبیعی',
    description: 'A first pass at idiomatic, everyday expressions beyond textbook Persian. Seed content — expand with more idioms, discourse markers, and longer dialogues.',
    vocabIds: ['exp-che-khabar', 'exp-salamati', 'exp-nooshejan', 'exp-dastodorost', 'exp-khastenabashid', 'exp-ghorboonat', 'exp-eshkali-nadare', 'exp-mishe'],
    lessonCount: 2,
  },
  {
    id: 'u6-reading-authentic', level: 6, order: 28, title: 'Reading Authentic Text', titleFa: 'خواندن متون اصیل',
    description: 'A starting point for advanced reading practice. Seed content — expand with real news excerpts, literature, and longer passages with full glossing.',
    grammarConceptIds: [],
    sentenceIds: [],
    lessonCount: 1,
  },
]
