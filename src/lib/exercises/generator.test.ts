import { describe, expect, it } from 'vitest'
import { vocabulary, findVocab } from '../../content/vocabulary'
import { alphabet } from '../../content/alphabet'
import { sentences } from '../../content/sentences'
import { grammar } from '../../content/grammar'
import {
  generateVocabMcq, generateVocabTypeAnswer, generateLetterSoundMcq,
  generateLetterPositionMcq, generateSentenceWordOrder, generateSentenceFillBlank,
  generateVocabListening, generateSentenceListening, generateCustomMcq, generateCustomTypeAnswer,
  generateConjugationMcq, generateConjugationTypeAnswer, generateGrammarRuleMcq,
} from './generator'
import { gradeMcq, gradeTypeAnswer, gradeWordOrder, gradeListening, ratingFor } from './grade'
import type { CustomReviewableSource } from './types'

const sampleVocab = vocabulary.find((v) => v.id === 'greet-salam')!
const sampleLetter = alphabet.find((l) => l.id === 'be')!
const nonJoiningLetter = alphabet.find((l) => l.id === 'alef')!
const sampleSentence = sentences.find((s) => s.id === 's-intro-name')!
const sampleVerb = findVocab('verb-raftan')!

describe('vocab exercises', () => {
  it('mcq fa->en has exactly one correct option among 4 distinct options', () => {
    const ex = generateVocabMcq(sampleVocab, 'fa-en')
    expect(ex.options.length).toBe(4)
    expect(new Set(ex.options.map((o) => o.id)).size).toBe(4)
    expect(gradeMcq(ex, ex.correctOptionId)).toBe(true)
    expect(gradeMcq(ex, 'not-a-real-id')).toBe(false)
  })

  it('type-answer grades correct and near-variant English answers as correct', () => {
    const ex = generateVocabTypeAnswer(sampleVocab, 'fa-en')
    expect(gradeTypeAnswer(ex, sampleVocab.en)).toBe(true)
    expect(gradeTypeAnswer(ex, sampleVocab.en.toUpperCase())).toBe(true)
    expect(gradeTypeAnswer(ex, 'definitely wrong answer')).toBe(false)
  })

  it('type-answer fa direction accepts Arabic-keyboard letter variants', () => {
    const ex = generateVocabTypeAnswer(sampleVocab, 'en-fa')
    const withArabicYeh = sampleVocab.fa.replace(/ی/g, 'ي')
    expect(gradeTypeAnswer(ex, withArabicYeh)).toBe(true)
  })
})

describe('alphabet exercises', () => {
  it('letter sound mcq is answerable and gradable', () => {
    const ex = generateLetterSoundMcq(sampleLetter)
    expect(ex.options.some((o) => o.id === sampleLetter.id)).toBe(true)
    expect(gradeMcq(ex, sampleLetter.id)).toBe(true)
  })

  it('letter sound mcq never offers two options with the same transliteration label', () => {
    // Several letters are true homophones in modern Persian (e.g. ز ذ ض ظ
    // are all "z" — see AlphabetLetter.homophoneNote). If a distractor
    // shares the target's transliteration, the option list would show the
    // same label twice with only one graded correct.
    for (const letter of alphabet) {
      for (let i = 0; i < 20; i++) {
        const ex = generateLetterSoundMcq(letter)
        const labels = ex.options.map((o) => o.en)
        expect(new Set(labels).size).toBe(labels.length)
      }
    }
  })

  it('non-joining letters only offer isolated/final positions', () => {
    const ex = generateLetterPositionMcq(nonJoiningLetter)
    expect(['isolated', 'final']).toContain(ex.correctOptionId)
    // isolated===initial and medial===final are identical glyphs for
    // non-joining letters, so initial/medial must never be offered — doing
    // so would give a second visually-correct-looking option graded wrong.
    expect(ex.options.map((o) => o.id).sort()).toEqual(['final', 'isolated'])
  })

  it('joining letters offer all four distinguishable positions', () => {
    const ex = generateLetterPositionMcq(sampleLetter)
    expect(ex.options.map((o) => o.id).sort()).toEqual(['final', 'initial', 'isolated', 'medial'])
  })

  it('every offered option for the shown glyph is unambiguously wrong except the correct one', () => {
    for (const letter of alphabet) {
      for (let i = 0; i < 20; i++) {
        const ex = generateLetterPositionMcq(letter)
        const shownGlyph = letter.forms[ex.correctOptionId as 'isolated' | 'initial' | 'medial' | 'final']
        for (const opt of ex.options) {
          const optGlyph = letter.forms[opt.id as 'isolated' | 'initial' | 'medial' | 'final']
          if (opt.id !== ex.correctOptionId) {
            expect(optGlyph).not.toBe(shownGlyph)
          }
        }
      }
    }
  })
})

describe('sentence exercises', () => {
  it('word-order shuffles but preserves the correct order set', () => {
    const ex = generateSentenceWordOrder(sampleSentence)
    expect(ex.words.length).toBe(sampleSentence.words.length)
    expect(gradeWordOrder(ex, ex.correctOrder)).toBe(true)
    expect(gradeWordOrder(ex, [...ex.correctOrder].reverse())).toBe(
      ex.correctOrder.length <= 1,
    )
  })

  it('fill-blank returns null gracefully for sentences with no glossed words, otherwise a valid mcq', () => {
    const ex = generateSentenceFillBlank(sampleSentence)
    if (ex) {
      expect(ex.options.some((o) => o.id === ex.correctOptionId)).toBe(true)
    }
  })
})

describe('listening exercises', () => {
  it('vocab listening has one correct option among 4 distinct options and is gradable', () => {
    const ex = generateVocabListening(sampleVocab)
    expect(ex.audioText).toBe(sampleVocab.fa)
    expect(ex.options.length).toBe(4)
    expect(new Set(ex.options.map((o) => o.id)).size).toBe(4)
    expect(gradeListening(ex, ex.correctOptionId)).toBe(true)
    expect(gradeListening(ex, 'not-a-real-id')).toBe(false)
  })

  it('sentence listening picks distractors that are not the correct sentence', () => {
    const ex = generateSentenceListening(sampleSentence, sentences)
    expect(ex.audioText).toBe(sampleSentence.fa)
    expect(ex.options.some((o) => o.id === sampleSentence.id)).toBe(true)
    expect(gradeListening(ex, sampleSentence.id)).toBe(true)
  })
})

describe('custom (learner-authored saved word) exercises', () => {
  const customItem: CustomReviewableSource = { id: 'custom-1', fa: 'قلم', translit: 'ghalam', en: 'pen' }

  it('mcq is gradable and distractors come from the vocabulary pool', () => {
    const ex = generateCustomMcq(customItem, 'fa-en')
    expect(ex.reviewable).toEqual({ kind: 'custom', itemId: 'custom-1' })
    expect(ex.options.length).toBe(4)
    expect(ex.options.some((o) => o.id === customItem.id && o.en === customItem.en)).toBe(true)
    expect(gradeMcq(ex, customItem.id)).toBe(true)
  })

  it('type-answer fa->en and en->fa both grade the exact custom answer correctly', () => {
    const faToEn = generateCustomTypeAnswer(customItem, 'fa-en')
    expect(gradeTypeAnswer(faToEn, customItem.en)).toBe(true)
    expect(gradeTypeAnswer(faToEn, 'totally wrong')).toBe(false)

    const enToFa = generateCustomTypeAnswer(customItem, 'en-fa')
    expect(gradeTypeAnswer(enToFa, customItem.fa)).toBe(true)
  })
})

describe('conjugation exercises', () => {
  it('mcq has exactly one correct option among 4 distinct options, all from the same verb', () => {
    const ex = generateConjugationMcq(sampleVerb, 'present', '1sg')
    expect(ex.reviewable).toEqual({ kind: 'vocab', itemId: sampleVerb.id })
    expect(ex.options.length).toBe(4)
    expect(new Set(ex.options.map((o) => o.id)).size).toBe(4)
    expect(ex.correctOptionId).toBe('1sg')
    expect(gradeMcq(ex, '1sg')).toBe(true)
    expect(ex.options.find((o) => o.id === '1sg')?.fa).toBe('می‌روم')
  })

  it('mcq for the past tense picks the bare 3rd-singular form as a valid option', () => {
    const ex = generateConjugationMcq(sampleVerb, 'past', '3sg')
    expect(ex.options.find((o) => o.id === '3sg')?.fa).toBe('رفت')
  })

  it('type-answer is gradable against the correct conjugated Persian form', () => {
    const ex = generateConjugationTypeAnswer(sampleVerb, 'present', '2pl')
    expect(ex.reviewable).toEqual({ kind: 'vocab', itemId: sampleVerb.id })
    expect(ex.answerLang).toBe('fa')
    expect(ex.acceptedAnswers).toEqual(['می‌روید'])
    expect(gradeTypeAnswer(ex, 'می‌روید')).toBe(true)
    expect(gradeTypeAnswer(ex, 'یک جواب اشتباه')).toBe(false)
  })

  it('a random (unspecified) person still produces a gradable exercise', () => {
    const ex = generateConjugationMcq(sampleVerb, 'past')
    expect(gradeMcq(ex, ex.correctOptionId)).toBe(true)
  })
})

describe('grammar-rule self-check mcq', () => {
  const conceptWithExamples = grammar.find((g) => g.id === 'g-object-marker-ra')!

  it('has one correct option (one of the concept\'s own example sentences) among 4', () => {
    const ex = generateGrammarRuleMcq(conceptWithExamples, grammar)
    expect(ex).toBeTruthy()
    if (!ex) return
    expect(ex.reviewable).toEqual({ kind: 'grammar', itemId: conceptWithExamples.id })
    expect(ex.options.length).toBe(4)
    expect(new Set(ex.options.map((o) => o.id)).size).toBe(4)
    expect(conceptWithExamples.exampleSentenceIds).toContain(ex.correctOptionId)
    expect(gradeMcq(ex, ex.correctOptionId)).toBe(true)
  })

  it('never picks a distractor from a related concept', () => {
    // Run several times since distractor selection is randomized.
    for (let i = 0; i < 20; i++) {
      const ex = generateGrammarRuleMcq(conceptWithExamples, grammar)
      if (!ex) continue
      const relatedIds = new Set(conceptWithExamples.relatedConceptIds ?? [])
      for (const opt of ex.options) {
        if (opt.id === ex.correctOptionId) continue
        const owningConcept = grammar.find((g) => g.exampleSentenceIds.includes(opt.id))
        if (owningConcept) expect(relatedIds.has(owningConcept.id)).toBe(false)
      }
    }
  })

  it('returns null for a concept with no example sentences', () => {
    const empty = grammar.find((g) => g.exampleSentenceIds.length === 0)!
    expect(generateGrammarRuleMcq(empty, grammar)).toBeNull()
  })
})

describe('ratingFor', () => {
  it('wrong answers always rate again', () => {
    const ex = generateVocabMcq(sampleVocab, 'fa-en')
    expect(ratingFor(ex, false, 0)).toBe('again')
    expect(ratingFor(ex, false, 3)).toBe('again')
  })

  it('correct with many hints rates hard; correct with no hints on production rates easy', () => {
    const mcq = generateVocabMcq(sampleVocab, 'fa-en')
    expect(ratingFor(mcq, true, 2)).toBe('hard')
    const typed = generateVocabTypeAnswer(sampleVocab, 'fa-en')
    expect(ratingFor(typed, true, 0)).toBe('easy')
    expect(ratingFor(mcq, true, 0)).toBe('good')
  })
})
