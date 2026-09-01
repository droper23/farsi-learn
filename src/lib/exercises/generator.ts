import type { AlphabetLetter } from '../../content/types'
import type { VocabItem, ExampleSentence, PassageQuestion, GrammarConcept } from '../../content/types'
import { vocabulary } from '../../content/vocabulary'
import { alphabet } from '../../content/alphabet'
import { findSentence } from '../../content/sentences'
import { conjugate, pronounLabel, type ConjugationPerson, type ConjugationTense } from '../conjugation'
import type {
  ExerciseOption, McqExercise, TypeAnswerExercise, WordOrderExercise, MatchingExercise,
  ListeningExercise, CustomReviewableSource,
} from './types'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function sample<T>(pool: T[], count: number, exclude: (x: T) => boolean): T[] {
  const candidates = shuffle(pool.filter((x) => !exclude(x)))
  return candidates.slice(0, count)
}

/** Like `sample`, but also guarantees no two picks (nor a pick and
 *  `reservedLabel`) share the same `label(...)` — used where the option
 *  text itself must be unique, e.g. letters that are true homophones
 *  (ز/ذ/ض/ظ are all transliterated "z") would otherwise let two distractors
 *  display the identical label. */
function sampleUniqueByLabel<T>(
  pool: T[], count: number, reservedLabel: string, label: (x: T) => string, exclude: (x: T) => boolean,
): T[] {
  const seen = new Set([reservedLabel])
  const result: T[] = []
  for (const c of shuffle(pool.filter((x) => !exclude(x)))) {
    const l = label(c)
    if (seen.has(l)) continue
    seen.add(l)
    result.push(c)
    if (result.length === count) break
  }
  return result
}

let uid = 0
function exerciseId(prefix: string): string {
  uid += 1
  return `${prefix}-${Date.now().toString(36)}-${uid}`
}

// ---------------------------------------------------------------------------
// Vocabulary exercises
// ---------------------------------------------------------------------------

export function generateVocabMcq(item: VocabItem, direction: 'fa-en' | 'en-fa', pool: VocabItem[] = vocabulary): McqExercise {
  const distractorPool = pool.filter((v) => v.category === item.category && v.id !== item.id)
  const fallbackPool = pool.filter((v) => v.id !== item.id)
  const distractors = sample(distractorPool.length >= 3 ? distractorPool : fallbackPool, 3, (v) => v.id === item.id)
  const options: ExerciseOption[] = shuffle([
    { id: item.id, en: item.en, fa: item.fa, translit: item.translit },
    ...distractors.map((d) => ({ id: d.id, en: d.en, fa: d.fa, translit: d.translit })),
  ])

  if (direction === 'fa-en') {
    return {
      id: exerciseId(`mcq-fa-en-${item.id}`), kind: 'mcq',
      reviewable: { kind: 'vocab', itemId: item.id },
      instructions: 'Choose the correct meaning',
      promptFa: item.fa, promptTranslit: item.translit,
      options: options.map((o) => ({ id: o.id, en: o.en })),
      correctOptionId: item.id,
      hints: buildVocabHints(item, 'en'),
    }
  }
  return {
    id: exerciseId(`mcq-en-fa-${item.id}`), kind: 'mcq',
    reviewable: { kind: 'vocab', itemId: item.id },
    instructions: 'Choose the correct Persian word',
    promptEn: item.en,
    options: options.map((o) => ({ id: o.id, fa: o.fa, translit: o.translit })),
    correctOptionId: item.id,
    hints: buildVocabHints(item, 'fa'),
  }
}

function buildVocabHints(item: VocabItem, target: 'en' | 'fa'): string[] {
  const hints = [`Part of speech: ${item.pos}${item.isCompoundVerb ? ' (compound verb)' : ''}`]
  if (target === 'en') {
    hints.push(`Starts with "${item.en[0]}"`)
    hints.push(`Transliteration: ${item.translit}`)
  } else {
    hints.push(`Transliteration: ${item.translit}`)
    hints.push(`First letter: ${item.fa[0]}`)
  }
  return hints
}

export function generateVocabTypeAnswer(item: VocabItem, direction: 'fa-en' | 'en-fa'): TypeAnswerExercise {
  if (direction === 'fa-en') {
    return {
      id: exerciseId(`type-fa-en-${item.id}`), kind: 'type-answer',
      reviewable: { kind: 'vocab', itemId: item.id },
      instructions: 'Type the English meaning',
      promptFa: item.fa, promptTranslit: item.translit,
      answerLang: 'en', acceptedAnswers: [item.en, ...(item.altEn ?? [])],
      hints: buildVocabHints(item, 'en'),
    }
  }
  return {
    id: exerciseId(`type-en-fa-${item.id}`), kind: 'type-answer',
    reviewable: { kind: 'vocab', itemId: item.id },
    instructions: 'Type the Persian word',
    promptEn: item.en,
    answerLang: 'fa', acceptedAnswers: [item.fa],
    hints: buildVocabHints(item, 'fa'),
  }
}

export function generateVocabMatching(items: VocabItem[]): MatchingExercise {
  return {
    id: exerciseId('matching-vocab'), kind: 'matching',
    instructions: 'Match each Persian word to its meaning',
    pairs: items.slice(0, 6).map((v) => ({ id: v.id, fa: v.fa, translit: v.translit, en: v.en })),
    hints: [],
  }
}

export function generateVocabListening(item: VocabItem, pool: VocabItem[] = vocabulary): ListeningExercise {
  const distractorPool = pool.filter((v) => v.category === item.category && v.id !== item.id)
  const fallbackPool = pool.filter((v) => v.id !== item.id)
  const distractors = sample(distractorPool.length >= 3 ? distractorPool : fallbackPool, 3, (v) => v.id === item.id)
  const options: ExerciseOption[] = shuffle([
    { id: item.id, en: item.en },
    ...distractors.map((d) => ({ id: d.id, en: d.en })),
  ])
  return {
    id: exerciseId(`listen-vocab-${item.id}`), kind: 'listening',
    reviewable: { kind: 'vocab', itemId: item.id },
    instructions: 'Listen, then choose the meaning',
    audioText: item.fa, audioTranslit: item.translit,
    options, correctOptionId: item.id,
    hints: buildVocabHints(item, 'en'),
  }
}

// ---------------------------------------------------------------------------
// Learner-authored saved entries (custom words with no vocabId — see
// CustomReviewableSource / SavedItem). Distractors are drawn from the
// general vocabulary pool since a custom entry has no category of its own.
// ---------------------------------------------------------------------------

export function generateCustomMcq(item: CustomReviewableSource, direction: 'fa-en' | 'en-fa', pool: VocabItem[] = vocabulary): McqExercise {
  const distractors = sample(pool, 3, () => false)
  const options: ExerciseOption[] = shuffle([
    { id: item.id, en: item.en, fa: item.fa, translit: item.translit },
    ...distractors.map((d) => ({ id: d.id, en: d.en, fa: d.fa, translit: d.translit })),
  ])
  const hints = [`Transliteration: ${item.translit}`, 'This is one of your own saved words (learner-added, not vetted content).']
  if (direction === 'fa-en') {
    return {
      id: exerciseId(`mcq-custom-fa-en-${item.id}`), kind: 'mcq',
      reviewable: { kind: 'custom', itemId: item.id },
      instructions: 'Choose the correct meaning',
      promptFa: item.fa, promptTranslit: item.translit,
      options: options.map((o) => ({ id: o.id, en: o.en })),
      correctOptionId: item.id,
      hints,
    }
  }
  return {
    id: exerciseId(`mcq-custom-en-fa-${item.id}`), kind: 'mcq',
    reviewable: { kind: 'custom', itemId: item.id },
    instructions: 'Choose the correct Persian word',
    promptEn: item.en,
    options: options.map((o) => ({ id: o.id, fa: o.fa, translit: o.translit })),
    correctOptionId: item.id,
    hints,
  }
}

export function generateCustomTypeAnswer(item: CustomReviewableSource, direction: 'fa-en' | 'en-fa'): TypeAnswerExercise {
  const hints = ['This is one of your own saved words (learner-added, not vetted content).']
  if (direction === 'fa-en') {
    return {
      id: exerciseId(`type-custom-fa-en-${item.id}`), kind: 'type-answer',
      reviewable: { kind: 'custom', itemId: item.id },
      instructions: 'Type the English meaning',
      promptFa: item.fa, promptTranslit: item.translit,
      answerLang: 'en', acceptedAnswers: [item.en],
      hints,
    }
  }
  return {
    id: exerciseId(`type-custom-en-fa-${item.id}`), kind: 'type-answer',
    reviewable: { kind: 'custom', itemId: item.id },
    instructions: 'Type the Persian word',
    promptEn: item.en,
    answerLang: 'fa', acceptedAnswers: [item.fa],
    hints,
  }
}

// ---------------------------------------------------------------------------
// Alphabet exercises
// ---------------------------------------------------------------------------

export function generateLetterSoundMcq(letter: AlphabetLetter, pool: AlphabetLetter[] = alphabet): McqExercise {
  // Several letters share an identical transliteration (e.g. ز/ذ/ض/ظ are
  // all "z") because they're true homophones in modern Persian — see
  // AlphabetLetter.homophoneNote. sampleUniqueByLabel keeps every option's
  // label unique so two options never display the exact same text with
  // only one graded correct.
  const distractors = sampleUniqueByLabel(pool, 3, letter.transliteration, (l) => l.transliteration, (l) => l.id === letter.id)
  const options: ExerciseOption[] = shuffle([
    { id: letter.id, en: letter.transliteration },
    ...distractors.map((d) => ({ id: d.id, en: d.transliteration })),
  ])
  return {
    id: exerciseId(`letter-sound-${letter.id}`), kind: 'mcq',
    reviewable: { kind: 'alphabet', itemId: letter.id },
    instructions: 'Which sound does this letter make?',
    promptFa: letter.forms.isolated,
    options,
    correctOptionId: letter.id,
    hints: [letter.englishSoundHint, `Letter name: ${letter.name}`],
  }
}

export function generateLetterNameMcq(letter: AlphabetLetter, pool: AlphabetLetter[] = alphabet): McqExercise {
  const distractors = sample(pool, 3, (l) => l.id === letter.id)
  const options: ExerciseOption[] = shuffle([
    { id: letter.id, en: letter.name },
    ...distractors.map((d) => ({ id: d.id, en: d.name })),
  ])
  return {
    id: exerciseId(`letter-name-${letter.id}`), kind: 'mcq',
    reviewable: { kind: 'alphabet', itemId: letter.id },
    instructions: 'What is this letter called?',
    promptFa: letter.forms.isolated,
    options,
    correctOptionId: letter.id,
    hints: [`Sounds like: ${letter.transliteration}`],
  }
}

/** Given a letter and one of its joined forms, ask the learner to identify
 *  which position (isolated / initial / medial / final) it's shown in —
 *  this is what actually teaches word-reading, not just glyph memorization. */
export function generateLetterPositionMcq(letter: AlphabetLetter): McqExercise {
  const positions: Array<{ id: 'isolated' | 'initial' | 'medial' | 'final'; label: string }> = [
    { id: 'isolated', label: 'Isolated (alone)' },
    { id: 'initial', label: 'Initial (start of a word)' },
    { id: 'medial', label: 'Medial (middle of a word)' },
    { id: 'final', label: 'Final (end of a word)' },
  ]
  // Non-joining letters (ا د ذ ر ز ژ و) render isolated===initial and
  // medial===final as identical glyphs, so offering all four positions as
  // options would give two visually-indistinguishable "correct" choices.
  // Restrict both the target and the offered options to the positions that
  // are actually distinguishable for this letter.
  const applicable = letter.joinsNext
    ? positions
    : positions.filter((p) => p.id === 'isolated' || p.id === 'final')
  const target = applicable[Math.floor(Math.random() * applicable.length)]
  return {
    id: exerciseId(`letter-pos-${letter.id}`), kind: 'mcq',
    reviewable: { kind: 'alphabet', itemId: letter.id },
    instructions: `Which form of ${letter.name} (${letter.forms.isolated}) is shown?`,
    promptFa: letter.forms[target.id],
    options: applicable.map((p) => ({ id: p.id, en: p.label })),
    correctOptionId: target.id,
    hints: [letter.joinsNext ? 'This letter connects on both sides.' : 'This letter never connects to the letter after it.'],
  }
}

/** A letter-matched-to-a-word drill: the left column shows each letter's
 *  isolated glyph, the right column each word's English gloss (matching
 *  MatchingRunner's fa-left/en-right rendering, same convention as
 *  generateVocabMatching above) — the learner has to recall a word
 *  starting with that letter and pick its meaning. */
export function generateLetterWordMatching(letters: AlphabetLetter[]): MatchingExercise {
  const withWords = letters.filter((l) => l.exampleWords.length > 0).slice(0, 6)
  return {
    id: exerciseId('matching-letters'), kind: 'matching',
    instructions: 'Match each letter to a word that starts with it',
    pairs: withWords.map((l) => ({ id: l.id, fa: l.forms.isolated, translit: l.transliteration, en: l.exampleWords[0].en })),
    hints: [],
  }
}

// ---------------------------------------------------------------------------
// Sentence exercises
// ---------------------------------------------------------------------------

export function generateSentenceWordOrder(sentence: ExampleSentence): WordOrderExercise {
  const words = sentence.words.map((w, i) => ({ id: `${sentence.id}-w${i}`, fa: w.fa, translit: w.translit }))
  return {
    id: exerciseId(`word-order-${sentence.id}`), kind: 'word-order',
    reviewable: { kind: 'sentence', itemId: sentence.id },
    instructions: 'Tap the words in the correct order',
    promptEn: sentence.en,
    words: shuffle(words),
    correctOrder: words.map((w) => w.id),
    hints: [sentence.literalEn ?? sentence.en, `Starts with: ${words[0]?.fa ?? ''}`],
  }
}

export function generateSentenceTranslationMcq(sentence: ExampleSentence, pool: ExampleSentence[]): McqExercise {
  const distractors = sample(pool, 3, (s) => s.id === sentence.id || s.en === sentence.en)
  const options: ExerciseOption[] = shuffle([
    { id: sentence.id, en: sentence.en },
    ...distractors.map((d) => ({ id: d.id, en: d.en })),
  ])
  return {
    id: exerciseId(`sentence-mcq-${sentence.id}`), kind: 'mcq',
    reviewable: { kind: 'sentence', itemId: sentence.id },
    instructions: 'Choose the natural English translation',
    promptFa: sentence.fa, promptTranslit: sentence.translit,
    options, correctOptionId: sentence.id,
    hints: sentence.literalEn ? [`Literal: ${sentence.literalEn}`] : [],
  }
}

export function generateSentenceListening(sentence: ExampleSentence, pool: ExampleSentence[]): ListeningExercise {
  const distractors = sample(pool, 3, (s) => s.id === sentence.id || s.en === sentence.en)
  const options: ExerciseOption[] = shuffle([
    { id: sentence.id, en: sentence.en },
    ...distractors.map((d) => ({ id: d.id, en: d.en })),
  ])
  return {
    id: exerciseId(`listen-sentence-${sentence.id}`), kind: 'listening',
    reviewable: { kind: 'sentence', itemId: sentence.id },
    instructions: 'Listen, then choose the correct meaning',
    audioText: sentence.fa, audioTranslit: sentence.translit,
    options, correctOptionId: sentence.id,
    hints: sentence.literalEn ? [`Literal: ${sentence.literalEn}`] : [],
  }
}

/** Fill-in-the-blank: blanks out one glossed word and asks the learner to
 *  pick it from options drawn from other words in the sentence bank that
 *  share a vocab category, so distractors are plausible, not random. */
export function generateSentenceFillBlank(sentence: ExampleSentence): McqExercise | null {
  const blankable = sentence.words.filter((w) => w.vocabId)
  if (blankable.length === 0) return null
  const target = blankable[Math.floor(Math.random() * blankable.length)]
  const targetVocab = vocabulary.find((v) => v.id === target.vocabId)
  const distractorPool = targetVocab
    ? vocabulary.filter((v) => v.category === targetVocab.category && v.id !== targetVocab.id)
    : vocabulary.filter((v) => v.id !== target.vocabId)
  const distractors = sample(distractorPool, 3, () => false)
  const blankedFa = sentence.words.map((w) => (w === target ? '______' : w.fa)).join(' ')
  const options: ExerciseOption[] = shuffle([
    { id: target.vocabId!, fa: target.fa, translit: target.translit },
    ...distractors.map((d) => ({ id: d.id, fa: d.fa, translit: d.translit })),
  ])
  return {
    id: exerciseId(`fill-blank-${sentence.id}`), kind: 'mcq',
    reviewable: { kind: 'sentence', itemId: sentence.id },
    instructions: 'Choose the word that fills the blank',
    promptFa: blankedFa, promptEn: sentence.en,
    options, correctOptionId: target.vocabId!,
    hints: [`Meaning of the sentence: ${sentence.en}`],
  }
}

// ---------------------------------------------------------------------------
// Reading passage comprehension (Level 6)
// ---------------------------------------------------------------------------

/** A passage comprehension question becomes a plain English MCQ with no
 *  `reviewable` ref — like a matching-exercise batch, it's extra in-lesson
 *  practice, not an SRS-tracked item (the passage's individual sentences
 *  already carry that via the ordinary 'sentence' reviewable kind). */
export function generatePassageComprehensionMcq(passageId: string, question: PassageQuestion): McqExercise {
  const options: ExerciseOption[] = question.options.map((opt, i) => ({ id: `${question.id}-opt${i}`, en: opt }))
  return {
    id: exerciseId(`passage-q-${question.id}`), kind: 'mcq',
    instructions: 'Answer based on the passage you just read',
    promptEn: question.question,
    options,
    correctOptionId: `${question.id}-opt${question.correctIndex}`,
    hints: [`This is a comprehension check for "${passageId}" — reread the passage if unsure.`],
  }
}

// ---------------------------------------------------------------------------
// Verb conjugation (Pass 4) — reuses the 'vocab' ReviewableKind, since a
// conjugation drill is still testing the same underlying vocab item (the
// verb), just a harder facet of it. See lib/conjugation.ts for the rule
// set and its sourcing.
// ---------------------------------------------------------------------------

function conjugationPrompt(verb: VocabItem, tense: ConjugationTense, person: ConjugationPerson): string {
  return `${verb.en} — ${tense === 'present' ? 'present' : 'simple past'} tense, "${pronounLabel(person)}"`
}

/** MCQ conjugation drill: distractors are the SAME verb's other five
 *  person-forms, not other vocabulary — the most pedagogically meaningful
 *  near-misses (mixing up person endings), and guaranteed-correct Persian
 *  since they come straight from the same rule-based `conjugate()` call as
 *  the right answer. */
export function generateConjugationMcq(verb: VocabItem, tense: ConjugationTense, person?: ConjugationPerson): McqExercise {
  const forms = conjugate(verb, tense)
  const targetPerson = person ?? forms[Math.floor(Math.random() * forms.length)].person
  const target = forms.find((f) => f.person === targetPerson)!
  const distractors = shuffle(forms.filter((f) => f.person !== targetPerson)).slice(0, 3)
  const options: ExerciseOption[] = shuffle([
    { id: target.person, fa: target.fa, translit: target.translit },
    ...distractors.map((d) => ({ id: d.person, fa: d.fa, translit: d.translit })),
  ])
  return {
    id: exerciseId(`conj-mcq-${verb.id}-${tense}-${targetPerson}`), kind: 'mcq',
    reviewable: { kind: 'vocab', itemId: verb.id },
    instructions: `Choose the correct form for "${target.pronounFa}" (${target.pronounTranslit})`,
    promptFa: verb.fa, promptTranslit: verb.translit,
    promptEn: conjugationPrompt(verb, tense, targetPerson),
    options,
    correctOptionId: target.person,
    hints: [
      `Infinitive: ${verb.fa} (${verb.translit})`,
      `${tense === 'present' ? 'Present' : 'Past'} stem: ${tense === 'present' ? verb.verbStems!.present : verb.verbStems!.past}`,
    ],
  }
}

export function generateConjugationTypeAnswer(verb: VocabItem, tense: ConjugationTense, person?: ConjugationPerson): TypeAnswerExercise {
  const forms = conjugate(verb, tense)
  const targetPerson = person ?? forms[Math.floor(Math.random() * forms.length)].person
  const target = forms.find((f) => f.person === targetPerson)!
  const example = forms.find((f) => f.person !== targetPerson)!
  return {
    id: exerciseId(`conj-type-${verb.id}-${tense}-${targetPerson}`), kind: 'type-answer',
    reviewable: { kind: 'vocab', itemId: verb.id },
    instructions: `Type the ${tense === 'present' ? 'present' : 'simple past'} tense form for "${target.pronounFa}" (${target.pronounTranslit})`,
    promptFa: verb.fa, promptTranslit: verb.translit,
    promptEn: conjugationPrompt(verb, tense, targetPerson),
    answerLang: 'fa', acceptedAnswers: [target.fa],
    hints: [
      `${tense === 'present' ? 'Present' : 'Past'} stem: ${tense === 'present' ? verb.verbStems!.present : verb.verbStems!.past}`,
      `Example: ${example.pronounFa} → ${example.fa}`,
    ],
  }
}

// ---------------------------------------------------------------------------
// Grammar-rule self-check (Pass 4) — tests "do you understand this rule"
// directly, rather than only indirectly through generic sentence drills.
// ---------------------------------------------------------------------------

/** Asks the learner to pick which sentence actually demonstrates the given
 *  grammar concept. The correct answer is one of the concept's own linked
 *  `exampleSentenceIds`; distractors are example sentences borrowed from
 *  *other* grammar concepts already in the corpus (excluding related
 *  concepts, so distractors aren't near-misses of the same rule) — this
 *  needs zero new linguistic content, just a new combination of existing,
 *  already-vetted sentences. Returns null if the corpus can't support a
 *  fair 4-option question (concept has no examples, or too few other
 *  concepts have examples of their own to draw distractors from). */
export function generateGrammarRuleMcq(concept: GrammarConcept, pool: GrammarConcept[]): McqExercise | null {
  if (concept.exampleSentenceIds.length === 0) return null
  const correctSentenceId = concept.exampleSentenceIds[Math.floor(Math.random() * concept.exampleSentenceIds.length)]
  const correctSentence = findSentence(correctSentenceId)
  if (!correctSentence) return null

  const relatedIds = new Set(concept.relatedConceptIds ?? [])
  const distractorConcepts = shuffle(
    pool.filter((c) => c.id !== concept.id && !relatedIds.has(c.id) && c.exampleSentenceIds.length > 0),
  )
  const distractors: ExampleSentence[] = []
  for (const c of distractorConcepts) {
    if (distractors.length >= 3) break
    const sid = c.exampleSentenceIds[Math.floor(Math.random() * c.exampleSentenceIds.length)]
    const s = findSentence(sid)
    if (s && s.id !== correctSentence.id && !distractors.some((d) => d.id === s.id)) distractors.push(s)
  }
  if (distractors.length < 3) return null

  const options: ExerciseOption[] = shuffle([
    { id: correctSentence.id, fa: correctSentence.fa, translit: correctSentence.translit },
    ...distractors.map((s) => ({ id: s.id, fa: s.fa, translit: s.translit })),
  ])
  return {
    id: exerciseId(`grammar-rule-${concept.id}`), kind: 'mcq',
    reviewable: { kind: 'grammar', itemId: concept.id },
    instructions: `Which sentence demonstrates: ${concept.title}?`,
    promptEn: concept.explanation[0],
    options,
    correctOptionId: correctSentence.id,
    hints: [
      concept.commonMistake ? `Common mistake: ${concept.commonMistake}` : concept.explanation[0],
      `Look for: ${concept.title}`,
    ],
  }
}

// ---------------------------------------------------------------------------
// Adaptive exercise selection
// ---------------------------------------------------------------------------

export type ExerciseDifficultyHint = 'scaffolded' | 'standard' | 'production'
