import type { GrammarConcept } from '../types'

export const grammarConcepts: GrammarConcept[] = [
  {
    id: 'g-sentence-order', title: 'Basic sentence order: Subject – Object – Verb', category: 'sentence-structure',
    level: 1, order: 1,
    explanation: [
      'Persian sentences normally end with the verb. Where English says "I go to school" (Subject–Verb–Object-ish), Persian says the equivalent of "I to school go."',
      'This one habit — verb last — matters more than any other single fact about Persian word order, and it holds true across almost every tense and sentence type you\'ll learn.',
    ],
    exampleSentenceIds: ['s-man-daneshjoo', 's-pres-miravam'],
    commonMistake: 'Putting the verb where English would put it (after the subject) instead of at the end of the sentence.',
    confidence: 'high-confidence',
  },
  {
    id: 'g-copula-present', title: '"To be": هستم / است (the present copula)', category: 'present-tense', level: 1, order: 2,
    explanation: [
      'Persian "to be" in the present tense is a short set of endings attached directly to the word being described, not a separate free-standing verb like English "am/is/are".',
      'من خوبم (man khubam) = "I [am] good". The endings are: -am (I), -i (you, informal), -ast/-e (he/she/it), -im (we), -id (you, plural/formal), -and (they). A fuller, slightly more formal alternative uses هستم، هستی، است، هستیم، هستید، هستند.',
    ],
    exampleSentenceIds: ['s-intro-name', 's-hello-name', 's-man-daneshjoo', 's-oo-moallem', 's-hale-shoma'],
    relatedConceptIds: ['g-negation'],
    commonMistake: 'Trying to translate English "am/is/are" as a separate word instead of an ending.',
    confidence: 'high-confidence',
  },
  {
    id: 'g-ezafe-basics', title: 'Ezāfe: linking two words with a short "-e" sound', category: 'ezafe', level: 1, order: 3,
    explanation: [
      'Ezāfe (اضافه) is a short, usually unwritten "-e" sound (spelled "-ye" after a vowel) that links two words into one phrase: noun + noun ("book of me" = my book), or noun + adjective ("house big" = big house).',
      'It is almost never written with a diacritic in ordinary text — you have to know it\'s there. When the first word ends in the vowel ا or و, ezāfe is written with a ی: خانه‌ی من (khāne-ye man).',
      'Ezāfe is the single most common piece of "invisible grammar" in Persian — most possessive phrases and every adjective-noun pair use it.',
    ],
    exampleSentenceIds: ['s-intro-name', 's-hale-shoma', 's-ezafe-ketabeman', 's-ezafe-khanareza'],
    relatedConceptIds: ['g-ezafe-adjectives', 'g-possession'],
    commonMistake: 'Forgetting that the link is pronounced even though it is (almost) never written.',
    confidence: 'high-confidence',
  },
  {
    id: 'g-questions-yesno', title: 'Asking questions', category: 'questions', level: 1, order: 4,
    explanation: [
      'Yes/no questions in Persian usually use exactly the same word order as statements — only the intonation rises at the end. There is no word like English "do/does" to insert.',
      'Question-word questions (what, where, who, why...) simply put the question word where the answer would go — Persian does not move it to the front the way English does.',
    ],
    exampleSentenceIds: ['s-hello-name', 's-pres-mikhori'],
    commonMistake: 'Trying to invert word order like an English question, or inserting a "do/does" equivalent that doesn\'t exist.',
    confidence: 'high-confidence',
  },
  {
    id: 'g-demonstratives', title: 'این and آن: this and that', category: 'demonstratives', level: 1, order: 5,
    explanation: [
      'این (in) = "this", آن (ān, colloquially un) = "that". Both go before the noun: این کتاب "this book". Their plurals are اینها/این‌ها (these) and آنها/آن‌ها (those) — the same words also double as "he/she/they" in casual reference to people.',
    ],
    exampleSentenceIds: ['s-in-ketabe', 's-an-khaneye'],
    confidence: 'high-confidence',
  },
  {
    id: 'g-ezafe-adjectives', title: 'Adjectives follow the noun (via ezāfe)', category: 'adjectives', level: 1, order: 6,
    explanation: [
      'Unlike English, Persian puts descriptive adjectives *after* the noun, connected by ezāfe: خانه‌ی بزرگ (khāne-ye bozorg) = "big house", literally "house-of big".',
      'Several adjectives can stack, each linked by another ezāfe: کتاب قرمز بزرگ (ketāb-e qermez-e bozorg) = "the big red book".',
    ],
    exampleSentenceIds: ['s-an-khaneye', 's-pres-darad'],
    relatedConceptIds: ['g-ezafe-basics', 'g-comparison'],
    commonMistake: 'Putting the adjective before the noun the way English does.',
    confidence: 'high-confidence',
  },
  {
    id: 'g-negation', title: 'Negation with نـ', category: 'negation', level: 1, order: 7,
    explanation: [
      'Persian negates a verb by prefixing نـ (na-/ne-) directly onto it: می‌روم "I go" → نمی‌روم "I don\'t go". The vowel is "na" before most stems and "ne" before a stem that itself starts with "mi-" (as in the present tense, where negation actually replaces می‌ with نمی‌).',
      'The copula negates the same way: خوبم "I\'m good" → خوب نیستم "I\'m not good" (نیستم replaces the whole -am ending, it does not just prefix نـ).',
    ],
    exampleSentenceIds: ['s-man-irani-nistam', 's-pres-nemifahmam', 's-past-nadidam', 's-imperative-negative'],
    relatedConceptIds: ['g-copula-present'],
    commonMistake: 'Adding a separate negation word (like English "not") instead of altering the verb itself.',
    confidence: 'high-confidence',
  },
  {
    id: 'g-nouns-plurals', title: 'Plurals with -ها, and staying singular after numbers', category: 'nouns-plurals', level: 1, order: 8,
    explanation: [
      'The everyday, all-purpose plural suffix is ها‌ (-hā): کتاب → کتاب‌ها (books). It is written with a ZWNJ (non-joining half-space) before it in standard modern spelling, not a full space or joined directly.',
      'A more literary/formal plural for animate nouns is ان‌ (-ān): دوست → دوستان (friends). Many Arabic-origin nouns also keep an irregular Arabic "broken" plural (کتاب → کتب), but these are learned case by case.',
      'After a specific number, the noun normally stays singular: سه کتاب (se ketāb) = "three books", not سه کتاب‌ها.',
    ],
    exampleSentenceIds: ['s-chandta-ketab', 's-baradaram-hast'],
    relatedConceptIds: ['g-orthography-zwnj'],
    commonMistake: 'Pluralizing the noun after a number, the way English requires.',
    confidence: 'high-confidence',
  },
  {
    id: 'g-present-tense-verbs', title: 'Simple present tense: می‌ + stem + ending', category: 'present-tense', level: 1, order: 9,
    explanation: [
      'The ordinary present tense is built as: می‌ (mi-) + present stem + person ending. For رفتن "to go" (present stem رو‌, rav): می‌روم (miravam, I go), می‌روی (miravi, you go), می‌رود (miravad, he/she goes), می‌رویم (miravim), می‌روید (miravid), می‌روند (miravand).',
      'This same pattern covers both "I go" and "I am going" habitually — Persian doesn\'t distinguish simple present from present habitual the way some languages do.',
    ],
    exampleSentenceIds: ['s-pres-miravam', 's-pres-mikhori', 's-chandta-ketab', 's-pres-darad'],
    relatedConceptIds: ['g-progressive'],
    commonMistake: 'Forgetting the می‌ prefix, or using it with داشتن (which normally drops it in the present).',
    confidence: 'high-confidence',
  },
  {
    id: 'g-object-marker-ra', title: 'را: marking a definite direct object', category: 'object-marker-ra', level: 2, order: 10,
    explanation: [
      'را (rā) goes after a direct object exactly when that object is *definite* — "the book", "this movie", a specific person — and is skipped for indefinite objects: کتاب می‌خرم "I buy a book" vs. کتاب را می‌خرم "I buy the book".',
      'را is one of the most distinctive features of Persian grammar and has no direct English equivalent — English marks definiteness with "the" on the noun itself, while Persian marks it after the object with را.',
      'Colloquially را is often shortened to رو (ro) or just و after a vowel: کتابو بده "give [me] the book".',
    ],
    exampleSentenceIds: ['s-ra-ketab', 's-ra-vs-indefinite', 's-pres-nemifahmam', 's-past-nadidam', 's-past-perfect'],
    commonMistake: 'Adding را to every direct object regardless of definiteness, or omitting it for a clearly definite one.',
    confidence: 'high-confidence',
  },
  {
    id: 'g-modals', title: 'Modal verbs: توانستن (can) and باید (must)', category: 'modals', level: 2, order: 11,
    explanation: [
      'می‌توانم (mitavānam, "I can") conjugates like a normal verb and is followed by a second verb in the subjunctive: می‌توانم بروم "I can go".',
      'باید (bāyad, "must/should") never changes form for person — the person is carried entirely by the subjunctive verb that follows it: باید بروم "I must go", باید بروی "you must go".',
    ],
    exampleSentenceIds: ['s-pres-mitavanam', 's-must-bayad'],
    relatedConceptIds: ['g-subjunctive'],
    confidence: 'high-confidence',
  },
  {
    id: 'g-subjunctive', title: 'The present subjunctive', category: 'subjunctive', level: 2, order: 12,
    explanation: [
      'The subjunctive replaces می‌ with بـ (be-) on the present stem, and shows up after "want", "must", "can", "if", and many other trigger words: خواستن + subjunctive = "want to [verb]": می‌خواهم بروم "I want to go" (literally "I want [that] I go").',
      'It looks almost identical to the ordinary present tense — the only difference for most verbs is می‌ versus بـ‌ at the front.',
    ],
    exampleSentenceIds: ['s-pres-mikhaham', 's-pres-mitavanam', 's-conditional-real', 's-must-bayad', 's-colloquial-mikham'],
    relatedConceptIds: ['g-modals', 'g-conditionals'],
    commonMistake: 'Using می‌ instead of بـ after "want to", "must", or "if".',
    confidence: 'high-confidence',
  },
  {
    id: 'g-progressive', title: 'Progressive ("right now"): داشتن + present tense', category: 'progressive', level: 3, order: 13,
    explanation: [
      'To emphasize that something is happening at this exact moment, add دارم/داری/دارد... in front of the ordinary present tense: دارم غذا می‌خورم "I am eating (right now)".',
      'This construction is mostly a spoken-language feature; formal writing tends to just use the plain present tense and let context show it\'s ongoing.',
    ],
    exampleSentenceIds: ['s-pres-progressive'],
    relatedConceptIds: ['g-present-tense-verbs'],
    confidence: 'high-confidence',
  },
  {
    id: 'g-simple-past', title: 'Simple past: past stem + ending', category: 'past-tense', level: 2, order: 14,
    explanation: [
      'The simple past is just the past stem plus a person ending, with no می‌ and no extra prefix: رفت (raft, past stem of رفتن) → رفتم (raftam, "I went"), رفتی، رفت، رفتیم، رفتید، رفتند.',
      'This is usually the very first past tense learners meet, and the endings (-am, -i, [bare], -im, -id, -and) reappear across almost every other Persian tense.',
    ],
    exampleSentenceIds: ['s-past-raftam', 's-past-khordim', 's-past-nadidam', 's-past-bud', 's-compound-verb'],
    commonMistake: 'Adding می‌ to the simple past the way it\'s needed in the present tense.',
    confidence: 'high-confidence',
  },
  {
    id: 'g-present-perfect', title: 'Present perfect ("have done"): past participle + -ام', category: 'perfect', level: 3, order: 15,
    explanation: [
      'Formed from the past stem + ه (past participle) + the same personal endings used for "to be": دیده‌ام (dide-am) = "I have seen". It describes a past action whose *result* still matters now, similar to English "have done".',
    ],
    exampleSentenceIds: ['s-past-perfect'],
    relatedConceptIds: ['g-simple-past'],
    confidence: 'high-confidence',
  },
  {
    id: 'g-future', title: 'Future tense: formal خواهم‌ + colloquial present', category: 'future', level: 3, order: 16,
    explanation: [
      'Formal/written Persian has a dedicated future tense: خواهم رفت (khāham raft) = "I will go" (خواهم + bare past stem). It is common in writing and news but rare in casual conversation.',
      'In everyday speech, Persian normally just uses the ordinary present tense plus a time word: فردا می‌رم "tomorrow I go" = "I\'ll go tomorrow".',
    ],
    exampleSentenceIds: ['s-future-khaham', 's-future-colloquial'],
    relatedConceptIds: ['g-present-tense-verbs', 'g-register'],
    confidence: 'high-confidence',
  },
  {
    id: 'g-possession', title: 'Possession: ezāfe, possessive suffixes, and مال', category: 'possession', level: 2, order: 17,
    explanation: [
      'Three ways to say "my/your/his...": (1) ezāfe + pronoun — کتاب من "my book"; (2) attached possessive suffixes -am/-at/-ash/-emān/-etān/-eshān — کتابم "my book"; (3) مال + pronoun for emphasis/standalone use — این مال من است "this is mine".',
      'The attached-suffix form (2) is extremely common in everyday speech for anything you\'d casually refer to (ماشینم "my car", خونم "my house").',
    ],
    exampleSentenceIds: ['s-ezafe-khanareza', 's-possession-am'],
    relatedConceptIds: ['g-ezafe-basics'],
    confidence: 'high-confidence',
  },
  {
    id: 'g-imperative', title: 'Commands (imperative)', category: 'imperative', level: 2, order: 18,
    explanation: [
      'Positive commands use بـ‌ + present stem (+ optional -id for polite/plural): برو "go!" (informal), بروید "go!" (polite/plural). Negative commands use نـ instead: نرو "don\'t go!".',
      'A handful of very common verbs drop the بـ‌ prefix in the imperative even in formal speech, notably داشتن-based and a few others; most verbs keep it.',
    ],
    exampleSentenceIds: ['s-ra-ketab', 's-imperative-negative'],
    relatedConceptIds: ['g-negation', 'g-subjunctive'],
    confidence: 'high-confidence',
  },
  {
    id: 'g-comparison', title: 'Comparative -تر and superlative -ترین', category: 'comparison', level: 2, order: 19,
    explanation: [
      'Comparative: adjective + تر (-tar): بزرگ‌تر "bigger". "Than" is از (az): از من بزرگ‌تر است "he/she is bigger than me".',
      'Superlative: adjective + ترین (-tarin), and — unlike ordinary adjectives — it goes *before* the noun: بهترین دوست "[the] best friend".',
    ],
    exampleSentenceIds: ['s-comparative', 's-superlative'],
    relatedConceptIds: ['g-ezafe-adjectives'],
    commonMistake: 'Placing a superlative after the noun like a regular adjective.',
    confidence: 'high-confidence',
  },
  {
    id: 'g-conditionals', title: 'Conditionals with اگر (if)', category: 'conditionals', level: 4, order: 20,
    explanation: [
      'Real/possible conditions ("if X happens, Y will happen") put the اگر-clause verb in the subjunctive: اگر باران بیاید، خانه می‌مانم "if it rains, I\'ll stay home".',
      'Unreal/hypothetical conditions ("if X had happened, Y would have happened" or present-unreal "if X were the case") instead use the simple past in *both* clauses: اگر پول داشتم، می‌خریدم "if I had money, I would buy [it]" — this is a common trap since English marks unreality very differently.',
    ],
    exampleSentenceIds: ['s-conditional-real', 's-conditional-unreal'],
    relatedConceptIds: ['g-subjunctive'],
    commonMistake: 'Using the subjunctive in an unreal/hypothetical conditional instead of the simple past.',
    confidence: 'high-confidence',
  },
  {
    id: 'g-relative-clauses', title: 'Relative clauses with که', category: 'relative-clauses', level: 3, order: 21,
    explanation: [
      'که (ke) is Persian\'s all-purpose relative pronoun/subordinator — it covers "who", "which", "that", and plain "that" introducing a clause, all with the same single word.',
      'Unlike English, there\'s no separate word choice based on whether you\'re describing a person or a thing.',
    ],
    exampleSentenceIds: ['s-relative-ke'],
    confidence: 'high-confidence',
  },
  {
    id: 'g-reported-speech', title: 'Reported speech: keeping the original tense', category: 'reported-speech', level: 4, order: 22,
    explanation: [
      'Reporting what someone said uses گفت که ("said that") followed by the clause — and unlike English, Persian usually keeps the *original* tense rather than shifting it back one step: او گفت که فردا می‌آید "he said that he is [not "was"] coming tomorrow".',
    ],
    exampleSentenceIds: ['s-reported-speech'],
    relatedConceptIds: ['g-simple-past'],
    commonMistake: 'Backshifting the tense the way English does ("he said he was coming" instead of "is coming").',
    confidence: 'needs-review',
  },
  {
    id: 'g-compound-verbs', title: 'Compound (light) verbs', category: 'compound-verbs', level: 2, order: 23,
    explanation: [
      'Most new concepts in Persian are expressed not with a single verb but with a noun/adjective + a small "light verb" — usually کردن (to do/make), but also شدن (to become), زدن (to strike), and others: کار کردن "to work" (work + do), صحبت کردن "to talk" (conversation + do).',
      'Only the light verb conjugates; the noun/adjective part stays fixed: کار می‌کنم "I work", کار کردم "I worked" — کار never changes.',
      'The passive voice is itself built this way, with a past participle + شدن: نوشته شد "it was written".',
    ],
    exampleSentenceIds: ['s-compound-verb', 's-passive'],
    commonMistake: 'Trying to conjugate the noun part of a compound verb instead of just the light verb.',
    confidence: 'high-confidence',
  },
  {
    id: 'g-register', title: 'Formal vs. colloquial Persian', category: 'register', level: 3, order: 24,
    explanation: [
      'Standard written/formal Persian and everyday spoken Persian differ more than most European language registers do — in vowels (می‌خواهم → می‌خوام), verb stems (خواندن: formal خوان‌، colloquial خون‌), pronunciation of می‌آید as میاد, and more.',
      'Learners generally need to *recognize* colloquial forms early (since that\'s what people actually say) even while *producing* more formal forms in writing or careful speech.',
    ],
    exampleSentenceIds: ['s-future-colloquial', 's-colloquial-mikham'],
    relatedConceptIds: ['g-colloquial-contractions'],
    confidence: 'high-confidence',
  },
  {
    id: 'g-colloquial-contractions', title: 'Common colloquial contractions', category: 'colloquial-contractions', level: 3, order: 25,
    explanation: [
      'A handful of very frequent contractions show up constantly in speech: می‌خواهم→می‌خوام (mikhāham→mikhām), می‌آید→میاد (miāyad→miyād), خانه→خونه (khāne→khune), نمی‌دانم→نمی‌دونم (nemidānam→nemidunam).',
      'These aren\'t "lazy" or "incorrect" — they are the normal spoken standard across virtually all of Iran; formal forms are for writing and careful/official speech.',
    ],
    exampleSentenceIds: ['s-future-colloquial', 's-colloquial-mikham'],
    relatedConceptIds: ['g-register'],
    confidence: 'needs-review',
  },
  {
    id: 'g-orthography-zwnj', title: 'The zero-width non-joiner (نیم‌فاصله)', category: 'orthography', level: 2, order: 26,
    explanation: [
      'Standard modern Persian spelling uses a special invisible character — the zero-width non-joiner (ZWNJ), called نیم‌فاصله ("half-space") — between certain word parts that are pronounced together but shouldn\'t visually connect: می‌روم (mi + ZWNJ + ravam), کتاب‌ها (ketāb + ZWNJ + hā).',
      'Using a regular space instead (کتاب ها) or joining with no space at all (کتابها) both appear in casual writing, but the ZWNJ form is the standard taught in schools and used in edited text — this app uses it throughout.',
    ],
    exampleSentenceIds: [],
    relatedConceptIds: ['g-nouns-plurals', 'g-present-tense-verbs'],
    confidence: 'high-confidence',
  },
]
