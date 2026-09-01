import { describe, expect, it } from 'vitest'
import { vocabulary } from '../../content/vocabulary'
import { alphabet } from '../../content/alphabet'
import { sentences } from '../../content/sentences'
import {
  generateVocabMcq, generateVocabTypeAnswer, generateLetterSoundMcq,
  generateLetterPositionMcq, generateSentenceWordOrder, generateSentenceFillBlank,
  generateVocabListening, generateSentenceListening, generateCustomMcq, generateCustomTypeAnswer,
} from './generator'
import { gradeMcq, gradeTypeAnswer, gradeWordOrder, gradeListening, ratingFor } from './grade'
import type { CustomReviewableSource } from './types'

const sampleVocab = vocabulary.find((v) => v.id === 'greet-salam')!
const sampleLetter = alphabet.find((l) => l.id === 'be')!
const nonJoiningLetter = alphabet.find((l) => l.id === 'alef')!
const sampleSentence = sentences.find((s) => s.id === 's-intro-name')!

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

  it('non-joining letters only offer isolated/final positions', () => {
    const ex = generateLetterPositionMcq(nonJoiningLetter)
    expect(['isolated', 'final']).toContain(ex.correctOptionId)
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
