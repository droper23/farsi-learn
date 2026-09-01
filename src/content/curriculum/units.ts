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
    description: 'Tell time, name the days of the week, count past twenty, and learn the twelve Persian calendar months.',
    vocabIds: [
      'num-20', 'num-30', 'num-40', 'num-50', 'num-100', 'num-1000', 'time-saat', 'time-daghighe', 'time-chandsaate',
      'time-shanbe', 'time-yekshanbe', 'time-doshanbe', 'time-seshanbe', 'time-chaharshanbe', 'time-panjshanbe', 'time-jome',
      'time-hafte', 'time-mah', 'time-sal',
      // NEW (Pass 4): the 12 Solar Hijri month names — previously absent
      // from the vocabulary entirely (only a stray mention in a `notes`
      // string on time-noruz) despite dates otherwise being covered. See
      // content/vocabulary/calendar.ts and lib/persianCalendar.ts.
      'date-farvardin', 'date-ordibehesht', 'date-khordad', 'date-tir', 'date-mordad', 'date-shahrivar',
      'date-mehr', 'date-aban', 'date-azar', 'date-dey', 'date-bahman', 'date-esfand',
    ],
    lessonCount: 3,
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
  {
    // NEW (content-depth pass): weather/nature words existed in the corpus
    // (colorsBodyNature.ts `natureVocab`, dictionary-searchable) but were
    // taught in no unit — see PROGRESS.md. Placed at the end of Level 2:
    // straightforward concrete nouns + short "the weather is ___" phrases
    // fit a beginner, and by here the learner already has the adjectives
    // (سرد/گرم from u2-adjectives-comparison) that combine with them.
    id: 'u2-weather-nature', level: 2, order: 19, title: 'Weather & Nature', titleFa: 'آب و هوا و طبیعت',
    description: 'Talk about the weather, the seasons, and the natural world around you.',
    vocabIds: ['nat-khorshid', 'nat-mah', 'nat-setare', 'nat-darya', 'nat-kuh', 'nat-derakht', 'nat-gol', 'nat-baran', 'nat-barf', 'nat-bad', 'nat-havakhube', 'nat-havagarmast', 'nat-havasarde', 'nat-aftab', 'nat-abr', 'nat-dama', 'weath-toofan', 'weath-rotoobat', 'weath-daraje', 'weath-meh', 'weath-yakh', 'weath-fasl', 'weath-bahar', 'weath-tabestan', 'weath-paeez', 'weath-zemestan'],
    sentenceIds: ['s-weather-cloudy-cold'],
    lessonCount: 3,
  },

  // ---------------------------------------------------------------- Level 3
  {
    id: 'u3-modals', level: 3, order: 20, title: 'Can, Must, Want: Modals & Subjunctive', titleFa: 'وجه التزامی',
    description: 'Express ability, obligation, and desire — and meet the subjunctive that ties them together.',
    vocabIds: ['verb-tavanestan'],
    grammarConceptIds: ['g-modals', 'g-subjunctive'],
    sentenceIds: ['s-pres-mikhaham', 's-pres-mitavanam', 's-must-bayad'],
    lessonCount: 3,
  },
  {
    id: 'u3-progressive-perfect', level: 3, order: 21, title: 'Right Now, and Already Done', titleFa: 'استمراری و نقلی',
    description: 'The progressive ("I am eating right now") and the present perfect ("I have already seen this").',
    grammarConceptIds: ['g-progressive', 'g-present-perfect'],
    sentenceIds: ['s-pres-progressive', 's-past-perfect', 's-pres-progressive-khandan', 's-present-perfect-negative'],
    lessonCount: 2,
  },
  {
    id: 'u3-clauses', level: 3, order: 22, title: 'Connecting Ideas with که', titleFa: 'جملات وابسته',
    description: 'Build longer sentences using که to connect and describe.',
    grammarConceptIds: ['g-relative-clauses'],
    sentenceIds: ['s-relative-ke', 's-relative-ketab'],
    lessonCount: 1,
  },
  {
    id: 'u3-register', level: 3, order: 23, title: 'Formal vs. Colloquial Persian', titleFa: 'رسمی و محاوره‌ای',
    description: 'Recognize the everyday spoken forms that differ from the formal Persian taught in most textbooks.',
    grammarConceptIds: ['g-register', 'g-colloquial-contractions', 'g-compound-verbs'],
    sentenceIds: ['s-colloquial-mikham', 's-future-colloquial', 's-compound-verb'],
    lessonCount: 2,
  },
  {
    id: 'u3-health-emotions', level: 3, order: 24, title: 'Health & Emotions', titleFa: 'سلامتی و احساسات',
    description: 'Say how you feel, physically and emotionally.',
    vocabIds: ['health-doctor', 'health-bimarestan', 'health-daru', 'health-dard', 'health-mariz', 'health-halet-chetore', 'health-sardard', 'emo-eshgh', 'emo-negaran', 'emo-hayjan', 'emo-asabani', 'adj-khaste', 'adj-khoshhal', 'adj-narahat'],
    lessonCount: 2,
  },
  {
    // NEW (content-depth pass): body-part words existed in the corpus
    // (colorsBodyNature.ts `bodyVocab`) but were taught in no unit, unlike
    // health/emotions which already had u3-health-emotions — see
    // PROGRESS.md. Placed right after health-emotions in Level 3 so the
    // "my head hurts" sentences can lean on health-dard (already taught).
    id: 'u3-body', level: 3, order: 25, title: 'Body & Health Vocabulary', titleFa: 'اعضای بدن',
    description: "Name your body parts, and combine them with health/emotion words you've already learned (\"my head hurts\").",
    vocabIds: ['body-sar', 'body-dast', 'body-pa', 'body-cheshm', 'body-gush', 'body-dahan', 'body-ghalb', 'body-bini', 'body-mo', 'body2-zanu', 'body2-shekam', 'body2-angosht', 'body2-poost', 'body2-ghadd'],
    sentenceIds: ['s-body-headache', 's-body-hand-hurts'],
    lessonCount: 2,
  },

  // ---------------------------------------------------------------- Level 4
  {
    id: 'u4-conditionals', level: 4, order: 26, title: 'If... Conditionals', titleFa: 'شرطی',
    description: 'Real and hypothetical "if" sentences — and the tense shift that separates them.',
    grammarConceptIds: ['g-conditionals'],
    sentenceIds: ['s-conditional-real', 's-conditional-unreal'],
    lessonCount: 2,
  },
  {
    id: 'u4-reported-speech', level: 4, order: 27, title: 'Reported Speech', titleFa: 'نقل قول',
    description: 'Report what someone else said, Persian-style.',
    grammarConceptIds: ['g-reported-speech'],
    sentenceIds: ['s-reported-speech'],
    lessonCount: 1,
  },
  {
    id: 'u4-future-passive', level: 4, order: 28, title: 'The Future & Passive Voice', titleFa: 'آینده و مجهول',
    description: 'The formal future tense, and how Persian builds the passive voice.',
    grammarConceptIds: ['g-future'],
    sentenceIds: ['s-future-khaham', 's-passive'],
    lessonCount: 2,
  },
  {
    // NEW (content-depth pass): work/school/technology words existed in the
    // corpus (workSchoolTech.ts) but were taught in no unit — see
    // PROGRESS.md. Placed at Level 4 (Intermediate): enough grammar is in
    // place by here (possession, ra, modals) to build real sentences about
    // work life, not just isolated nouns.
    id: 'u4-work-school-tech', level: 4, order: 29, title: 'Work, School & Technology', titleFa: 'کار، مدرسه و فناوری',
    description: 'Talk about your job, your studies, and everyday technology — meetings, devices, and getting online.',
    vocabIds: ['work-kar', 'work-shoghl', 'work-edare', 'work-daftar', 'work-rais', 'work-hoghugh', 'work-hamkar', 'verb-kar-kardan', 'work2-jalase', 'work2-shoghl-kardan', 'sch-madrese', 'sch-daneshgah', 'sch-daneshjoo', 'sch-moallem', 'sch-ostad', 'sch-kelas', 'sch-emtehan', 'sch-tamrin', 'sch2-madrak', 'tech-computer', 'tech-mobile', 'tech-internet', 'tech-email', 'tech-app', 'tech-akswapardazi', 'tech-ramzobur', 'tech2-sharj', 'tech2-vasl-shodan', 'tech2-fail'],
    sentenceIds: ['s-work-meeting-tomorrow', 's-tech-phone-dead'],
    lessonCount: 4,
  },

  // ---------------------------------------------------------------- Level 5
  // "Upper Intermediate": idioms/discourse markers, register shifts, real
  // multi-turn dialogues, and the nuanced-aspect/subordination grammar a
  // genuinely mid-level learner needs. Reaching Level 5 means the app is no
  // longer "beginner-only" — see PROGRESS.md for where UI copy was checked.
  {
    id: 'u5-natural-conversation', level: 5, order: 30, title: 'Natural Conversation: Discourse Markers & Idioms', titleFa: 'مکالمه طبیعی',
    description: 'The small connective words (راستش, یعنی, خب...) that make spoken Persian sound natural, plus a few common idioms.',
    vocabIds: ['exp-che-khabar', 'exp-salamati', 'exp-nooshejan', 'exp-dastodorost', 'exp-khastenabashid', 'exp-ghorboonat', 'exp-eshkali-nadare', 'exp-mishe', 'exp-rasti', 'exp-rastesh', 'exp-yani', 'exp-dar-vaghe', 'exp-behar-hal', 'exp-kholase', 'exp-belakhare', 'exp-aslan', 'exp-vaghean', 'exp-khob', 'exp-fekr-konam', 'exp-benazare-man', 'exp-masalan', 'exp-chizi-nist', 'exp-ab-zire-kah', 'exp-damet-garm', 'exp-sang-tamam'],
    lessonCount: 3,
  },
  {
    id: 'u5-register-shifts', level: 5, order: 31, title: 'Register in Action: Formal ↔ Colloquial', titleFa: 'رسمی و محاوره‌ای در عمل',
    description: 'Beyond the Level 3 introduction: recognize and produce the same idea in both formal written Persian and everyday spoken Persian.',
    grammarConceptIds: ['g-register', 'g-colloquial-contractions'],
    sentenceIds: ['s-future-colloquial', 's-colloquial-mikham'],
    lessonCount: 1,
  },
  {
    id: 'u5-dialogues', level: 5, order: 32, title: 'Multi-Turn Dialogues', titleFa: 'مکالمات چند نفره',
    description: 'Two full natural conversations — ordering at a café, and catching up with a friend — with every line individually glossed.',
    sentenceIds: ['s-dlg-cafe-1', 's-dlg-cafe-2', 's-dlg-cafe-3', 's-dlg-cafe-4', 's-dlg-cafe-5', 's-dlg-cafe-6', 's-dlg-cafe-7', 's-dlg-catchup-1', 's-dlg-catchup-2', 's-dlg-catchup-3', 's-dlg-catchup-4', 's-dlg-catchup-5', 's-dlg-catchup-6', 's-dlg-catchup-7'],
    lessonCount: 2,
  },
  {
    id: 'u5-advanced-grammar', level: 5, order: 33, title: 'Nuanced Aspect & Subordination', titleFa: 'جنبه و جملات وابسته پیشرفته',
    description: 'The habitual/continuous past, and three ways to subordinate a clause: although, because, and in order to.',
    grammarConceptIds: ['g-imperfect-past', 'g-concessive-clauses', 'g-causal-clauses', 'g-purpose-clauses'],
    sentenceIds: ['s-imperfect-habitual', 's-imperfect-child', 's-concessive-cold', 's-causal-tired', 's-purpose-traffic', 's-purpose-class'],
    lessonCount: 3,
  },

  // ---------------------------------------------------------------- Level 6
  // "Advanced": reading authentic-style text. See content/types.ts `Passage`
  // for the content-model extension chosen for this (a thin composition
  // layer over already-glossed ExampleSentences, not a parallel text blob),
  // and content/sentences/passages.ts for why these are original composed
  // passages rather than claimed excerpts from a real published source.
  {
    id: 'u6-reading-authentic', level: 6, order: 34, title: 'Reading Authentic Text: Everyday Life', titleFa: 'خواندن متون: زندگی روزمره',
    description: 'Two informational reading passages — a day in Tehran, and the seasons in Iran — each with full word-by-word glossing and comprehension questions.',
    passageIds: ['passage-tehran-life', 'passage-seasons-iran'],
    lessonCount: 2,
  },
  {
    id: 'u6-reading-narrative', level: 6, order: 35, title: 'Reading Authentic Text: Letters & Narrative', titleFa: 'خواندن متون: نامه و داستان',
    description: 'A personal letter and a short story, both in a more literary register, with reported speech and subordinate clauses in real use.',
    passageIds: ['passage-letter-friend', 'passage-old-man-garden'],
    lessonCount: 2,
  },
]
