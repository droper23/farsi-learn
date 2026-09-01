import { describe, expect, it } from 'vitest'
import { vocabulary, findVocab } from './vocabulary'
import { sentences, findSentence } from './sentences'
import { grammar, findGrammarConcept } from './grammar'
import { alphabet } from './alphabet'

function duplicates(ids: string[]): string[] {
  const seen = new Set<string>()
  const dupes = new Set<string>()
  for (const id of ids) {
    if (seen.has(id)) dupes.add(id)
    seen.add(id)
  }
  return [...dupes]
}

const persianRange = /[؀-ۿ]/

describe('vocabulary content', () => {
  it('has no duplicate ids', () => {
    expect(duplicates(vocabulary.map((v) => v.id))).toEqual([])
  })

  it('every item has non-empty fa, translit, and en', () => {
    for (const v of vocabulary) {
      expect(v.fa.trim(), `${v.id} fa`).not.toBe('')
      expect(v.translit.trim(), `${v.id} translit`).not.toBe('')
      expect(v.en.trim(), `${v.id} en`).not.toBe('')
    }
  })

  it('fa fields contain Persian script, not stray Latin text', () => {
    for (const v of vocabulary) {
      expect(persianRange.test(v.fa), `${v.id} fa should contain Persian script: ${v.fa}`).toBe(true)
    }
  })

  it('verb entries have both stems', () => {
    for (const v of vocabulary.filter((x) => x.pos === 'verb')) {
      expect(v.verbStems, `${v.id} should have verbStems`).toBeTruthy()
    }
  })

  it('relatedWordIds point at real vocab items', () => {
    for (const v of vocabulary) {
      for (const rid of v.relatedWordIds ?? []) {
        expect(findVocab(rid), `${v.id} relatedWordIds -> missing ${rid}`).toBeTruthy()
      }
    }
  })
})

describe('alphabet content', () => {
  it('has 32 letters with unique ids and order values', () => {
    expect(alphabet.length).toBe(32)
    expect(duplicates(alphabet.map((l) => l.id))).toEqual([])
    expect(duplicates(alphabet.map((l) => l.order))).toEqual([])
  })

  it('every letter has all four forms and example words in Persian script', () => {
    for (const l of alphabet) {
      expect(l.forms.isolated, l.id).not.toBe('')
      expect(l.forms.initial, l.id).not.toBe('')
      expect(l.forms.medial, l.id).not.toBe('')
      expect(l.forms.final, l.id).not.toBe('')
      expect(l.exampleWords.length, `${l.id} needs example words`).toBeGreaterThan(0)
      for (const w of l.exampleWords) {
        expect(persianRange.test(w.fa), `${l.id} example word should be Persian: ${w.fa}`).toBe(true)
      }
    }
  })

  it('non-joining letters have initial === isolated and medial === final', () => {
    for (const l of alphabet.filter((x) => !x.joinsNext)) {
      expect(l.forms.initial, l.id).toBe(l.forms.isolated)
      expect(l.forms.medial, l.id).toBe(l.forms.final)
    }
  })
})

describe('sentence content', () => {
  it('has no duplicate ids', () => {
    expect(duplicates(sentences.map((s) => s.id))).toEqual([])
  })

  it('every sentence has fa/translit/en and at least one word breakdown entry', () => {
    for (const s of sentences) {
      expect(s.fa.trim(), s.id).not.toBe('')
      expect(s.translit.trim(), s.id).not.toBe('')
      expect(s.en.trim(), s.id).not.toBe('')
      expect(s.words.length, `${s.id} needs a word breakdown`).toBeGreaterThan(0)
    }
  })

  it('vocabIds and word-level vocabId references point at real vocab items', () => {
    for (const s of sentences) {
      for (const vid of s.vocabIds ?? []) {
        expect(findVocab(vid), `${s.id} vocabIds -> missing ${vid}`).toBeTruthy()
      }
      for (const w of s.words) {
        if (w.vocabId) expect(findVocab(w.vocabId), `${s.id} word "${w.fa}" -> missing vocab ${w.vocabId}`).toBeTruthy()
      }
    }
  })

  it('grammarConceptIds point at real grammar concepts', () => {
    for (const s of sentences) {
      for (const gid of s.grammarConceptIds ?? []) {
        expect(findGrammarConcept(gid), `${s.id} grammarConceptIds -> missing ${gid}`).toBeTruthy()
      }
    }
  })
})

describe('grammar content', () => {
  it('has no duplicate ids or order collisions', () => {
    expect(duplicates(grammar.map((g) => g.id))).toEqual([])
    expect(duplicates(grammar.map((g) => g.order))).toEqual([])
  })

  it('every concept has a non-empty explanation', () => {
    for (const g of grammar) {
      expect(g.explanation.length, g.id).toBeGreaterThan(0)
      for (const p of g.explanation) expect(p.trim(), g.id).not.toBe('')
    }
  })

  it('exampleSentenceIds point at real sentences', () => {
    for (const g of grammar) {
      for (const sid of g.exampleSentenceIds) {
        expect(findSentence(sid), `${g.id} exampleSentenceIds -> missing ${sid}`).toBeTruthy()
      }
    }
  })

  it('relatedConceptIds point at real grammar concepts', () => {
    for (const g of grammar) {
      for (const rid of g.relatedConceptIds ?? []) {
        expect(findGrammarConcept(rid), `${g.id} relatedConceptIds -> missing ${rid}`).toBeTruthy()
      }
    }
  })
})
