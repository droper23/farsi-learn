import type { AlphabetLetter } from '../../content/types'
import type { VocabItem, ExampleSentence } from '../../content/types'
import { vocabulary } from '../../content/vocabulary'
import { alphabet } from '../../content/alphabet'
import type {
  Exercise, ExerciseOption, McqExercise, TypeAnswerExercise, WordOrderExercise, MatchingExercise,
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
  const distractors = sample(pool, 3, (l) => l.id === letter.id)
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
  const applicable = letter.joinsNext
    ? positions
    : positions.filter((p) => p.id === 'isolated' || p.id === 'final')
  const target = applicable[Math.floor(Math.random() * applicable.length)]
  return {
    id: exerciseId(`letter-pos-${letter.id}`), kind: 'mcq',
    reviewable: { kind: 'alphabet', itemId: letter.id },
    instructions: `Which form of ${letter.name} (${letter.forms.isolated}) is shown?`,
    promptFa: letter.forms[target.id],
    options: positions.map((p) => ({ id: p.id, en: p.label })),
    correctOptionId: target.id,
    hints: [letter.joinsNext ? 'This letter connects on both sides.' : 'This letter never connects to the letter after it.'],
  }
}

export function generateLetterWordMatching(letters: AlphabetLetter[]): MatchingExercise {
  const withWords = letters.filter((l) => l.exampleWords.length > 0).slice(0, 6)
  return {
    id: exerciseId('matching-letters'), kind: 'matching',
    instructions: 'Match each letter to a word that starts with it',
    pairs: withWords.map((l) => ({ id: l.id, fa: l.forms.isolated, translit: l.transliteration, en: l.exampleWords[0].fa })),
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
// Adaptive exercise selection
// ---------------------------------------------------------------------------

export type ExerciseDifficultyHint = 'scaffolded' | 'standard' | 'production'

/** Chooses a variety of exercise shapes for a vocab item, biased by how
 *  well the learner already knows it — struggling/new items lean on
 *  recognition (MCQ), well-established items lean on production
 *  (typing, word order) per the adaptive-difficulty requirement. */
export function pickVocabExercise(item: VocabItem, difficulty: ExerciseDifficultyHint): Exercise {
  const direction: 'fa-en' | 'en-fa' = Math.random() < 0.5 ? 'fa-en' : 'en-fa'
  if (difficulty === 'production' && Math.random() < 0.6) {
    return generateVocabTypeAnswer(item, direction)
  }
  return generateVocabMcq(item, direction)
}
