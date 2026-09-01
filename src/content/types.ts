/**
 * Core content model for Farsi Learn.
 *
 * Design principle: all learning content (alphabet, vocabulary, grammar,
 * sentences, lessons) is plain, statically-typed data — never hard-coded
 * into UI components. Adding the 501st vocabulary word means adding one
 * object to a data file, not touching a component. See the repo README's
 * "Where the learning content lives" section for the full guide.
 *
 * Every piece of *linguistic* content (anything a learner will read as a
 * fact about Persian) carries a `confidence` field. Content authored by the
 * assistant during the initial build is marked "ai-generated" and should be
 * spot-checked by a Persian speaker before being trusted as gospel; content
 * explicitly reviewed is "verified". Never remove the field — flip it once
 * a human has actually checked the item.
 */

export type CEFRLevel = 1 | 2 | 3 | 4 | 5 | 6

export type Register = 'neutral' | 'formal' | 'colloquial' | 'literary'

export type ConfidenceStatus =
  /** Standard, extremely well-established content (e.g. سلام = hello). Low error risk. */
  | 'high-confidence'
  /** Correct to the author's knowledge but worth a native-speaker spot check
   *  (idioms, colloquial contractions, nuanced register calls). */
  | 'needs-review'
  /** A human has explicitly reviewed and confirmed this item. */
  | 'verified'

export interface SourceNote {
  confidence: ConfidenceStatus
  /** Optional free-text note, e.g. "colloquial Tehrani contraction of می‌خواهم" */
  note?: string
}

/** A Persian text fragment paired with a learner-support transliteration.
 *  Transliteration uses a simplified, consistent Latin scheme (not strict
 *  academic IPA) intended purely as training wheels — the UI is designed to
 *  let learners hide it once they can read the script. */
export interface PersianText {
  fa: string
  translit: string
}

// ---------------------------------------------------------------------------
// Alphabet
// ---------------------------------------------------------------------------

export type LetterJoin = 'both' | 'none-after' /* connects to previous letter only */

export interface LetterForms {
  isolated: string
  initial: string
  medial: string
  final: string
}

export interface AlphabetLetter extends SourceNote {
  id: string
  order: number
  /** e.g. "Alef", "Be", "Pe" */
  name: string
  nameFa: string
  forms: LetterForms
  /** Whether this letter connects to the following letter. Six letters
   *  (ا د ذ ر ز ژ و) never connect forward, which is why Persian words
   *  break into separate "connected chunks". */
  joinsNext: boolean
  transliteration: string
  soundDescription: string
  /** IPA where the author is confident of it; omit rather than guess. */
  ipa?: string
  englishSoundHint: string
  /** Letters frequently confused with this one (shape or sound). */
  oftenConfusedWith?: string[]
  exampleWords: Array<PersianText & { en: string }>
  category: 'consonant' | 'vowel-letter'
}

export interface ShortVowel extends SourceNote {
  id: string
  name: string
  /** short vowels are diacritics, rarely written in ordinary text */
  diacritic: string
  transliteration: string
  soundDescription: string
  exampleWords: Array<PersianText & { en: string }>
}

export interface PersianDigit {
  digit: string
  arabicIndicDigit: string
  name: string
  nameFa: string
  transliteration: string
}

// ---------------------------------------------------------------------------
// Vocabulary
// ---------------------------------------------------------------------------

export type PartOfSpeech =
  | 'noun' | 'verb' | 'adjective' | 'adverb' | 'pronoun' | 'preposition'
  | 'conjunction' | 'question-word' | 'number' | 'interjection' | 'phrase' | 'particle'

export type VocabCategory =
  | 'greetings' | 'introductions' | 'family' | 'numbers' | 'time' | 'dates'
  | 'food' | 'restaurant' | 'shopping' | 'travel' | 'transportation' | 'directions'
  | 'housing' | 'school' | 'work' | 'technology' | 'daily-activities' | 'weather'
  | 'health' | 'emotions' | 'adjectives' | 'verbs-core' | 'question-words'
  | 'connectors' | 'prepositions' | 'expressions' | 'colors' | 'body' | 'nature' | 'pronouns'

export interface VocabItem extends SourceNote {
  id: string
  fa: string
  translit: string
  /** Natural, idiomatic English meaning — what a fluent speaker would say. */
  en: string
  /** Alternate acceptable English translations (for grading typed answers
   *  and to show learners a term isn't 1:1 with a single English word). */
  altEn?: string[]
  /** Literal/structural gloss, shown only when it differs meaningfully from `en`. */
  literalEn?: string
  pos: PartOfSpeech
  category: VocabCategory
  register: Register
  /** 1 = extremely high frequency ... 5 = rare/specialized */
  frequency: 1 | 2 | 3 | 4 | 5
  level: CEFRLevel
  /** Persian plural form, for nouns where it's not fully regular/predictable. */
  pluralFa?: string
  /** Present & past stems for verbs — the two building blocks of the whole
   *  Persian conjugation system. Only present on pos: 'verb'. */
  verbStems?: { present: string; past: string; presentTranslit: string; pastTranslit: string }
  /** Is this a light-verb / compound verb (e.g. صحبت کردن)? */
  isCompoundVerb?: boolean
  relatedWordIds?: string[]
  exampleSentenceIds?: string[]
  notes?: string
}

// ---------------------------------------------------------------------------
// Sentences
// ---------------------------------------------------------------------------

export interface SentenceWord {
  fa: string
  translit: string
  /** Gloss of just this word/chunk, for word-by-word breakdown display. */
  en: string
  vocabId?: string
}

export interface ExampleSentence extends SourceNote {
  id: string
  fa: string
  translit: string
  /** Natural English translation a fluent speaker would actually say. */
  en: string
  /** Literal, structural translation — included whenever it diverges from
   *  natural English enough to be pedagogically useful. */
  literalEn?: string
  register: Register
  level: CEFRLevel
  /** Ordered word-by-word breakdown, used for word-order & tap exercises. */
  words: SentenceWord[]
  grammarConceptIds?: string[]
  vocabIds?: string[]
  notes?: string
  /** Who says this line, for multi-turn dialogues (e.g. "Barista", "Sara").
   *  Omitted for standalone (non-dialogue) example sentences. */
  speaker?: string
}

// ---------------------------------------------------------------------------
// Reading passages (Level 6 — advanced reading)
// ---------------------------------------------------------------------------

/** A single comprehension-check question about a Passage. Deliberately a
 *  plain English MCQ (not a new exercise runner) — it's generated straight
 *  into a `McqExercise` with no `reviewable` ref, the same way multi-item
 *  matching exercises are extra in-lesson practice rather than an SRS-
 *  tracked item. The passage's *sentences* are what carry the long-term SRS
 *  state (each already reused as an ordinary `ExampleSentence`). */
export interface PassageQuestion {
  id: string
  question: string
  /** English answer choices; `correctIndex` points at the right one. */
  options: string[]
  correctIndex: number
}

/** A short reading passage composed from existing, already-vetted
 *  `ExampleSentence`s (in order) rather than a new blob of untyped text —
 *  this keeps every sentence individually glossed word-by-word (reusing
 *  `SentenceWord`) and individually SRS-tracked, while letting the passage
 *  itself carry a title and comprehension questions. This is the minimal
 *  extension chosen for Level 6 "read authentic text" content: a thin
 *  composition layer over the existing sentence model, not a parallel
 *  content type with its own glossing/validation logic. */
export interface Passage extends SourceNote {
  id: string
  title: string
  titleFa?: string
  level: CEFRLevel
  register: Register
  /** Ordered `ExampleSentence` ids that make up the passage's body text. */
  sentenceIds: string[]
  comprehensionQuestions: PassageQuestion[]
}

// ---------------------------------------------------------------------------
// Grammar
// ---------------------------------------------------------------------------

export type GrammarCategory =
  | 'sentence-structure' | 'nouns-plurals' | 'ezafe' | 'pronouns' | 'demonstratives'
  | 'possession' | 'adjectives' | 'adverbs' | 'prepositions' | 'questions' | 'negation'
  | 'present-tense' | 'past-tense' | 'future' | 'imperative' | 'subjunctive'
  | 'progressive' | 'perfect' | 'modals' | 'compound-verbs' | 'object-marker-ra'
  | 'comparison' | 'relative-clauses' | 'conjunctions' | 'conditionals'
  | 'reported-speech' | 'register' | 'colloquial-contractions' | 'orthography'

export interface GrammarConcept extends SourceNote {
  id: string
  title: string
  titleFa?: string
  category: GrammarCategory
  level: CEFRLevel
  order: number
  /** Short paragraphs, plain text. Kept short by design — a wall of
   *  reference-grammar prose defeats "explanation -> examples -> practice". */
  explanation: string[]
  exampleSentenceIds: string[]
  relatedConceptIds?: string[]
  /** A single common mistake English speakers make with this concept. */
  commonMistake?: string
}

// ---------------------------------------------------------------------------
// Curriculum: levels / units / lessons
// ---------------------------------------------------------------------------

export interface LevelInfo {
  level: CEFRLevel
  title: string
  goal: string
}

export type UnitContentRef =
  | { kind: 'alphabet'; id: string }
  | { kind: 'vocab'; id: string }
  | { kind: 'grammar'; id: string }
  | { kind: 'sentence'; id: string }

/** A Unit groups a coherent topic's teaching content. Lessons within it are
 *  generated (not hand-authored) from this pool — see lib/exerciseGenerator. */
export interface Unit {
  id: string
  level: CEFRLevel
  order: number
  title: string
  titleFa?: string
  description: string
  alphabetIds?: string[]
  vocabIds?: string[]
  grammarConceptIds?: string[]
  sentenceIds?: string[]
  /** Advanced reading passages (Level 6) — see `Passage`. */
  passageIds?: string[]
  /** Roughly how many short lessons this unit is split into. The lesson
   *  engine paginates the unit's content pool into this many sittings. */
  lessonCount: number
}

/** 'custom' covers learner-authored saved entries with no `vocabId` (see
 *  `SavedItem` in `src/storage/db.ts`) — they ride the same unified SRS
 *  queue as everything else, keyed by the SavedItem's own id. Saved
 *  entries that *do* have a `vocabId` reuse the ordinary 'vocab' kind
 *  instead, since they already point at real, vetted content. */
export type ReviewableKind = 'alphabet' | 'vocab' | 'grammar' | 'sentence' | 'custom'

/** A globally unique key into the SRS store: `${kind}:${id}`. */
export type ReviewableKey = `${ReviewableKind}:${string}`

export function reviewableKey(kind: ReviewableKind, id: string): ReviewableKey {
  return `${kind}:${id}` as ReviewableKey
}
