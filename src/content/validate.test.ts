import { describe, expect, it } from 'vitest'
import { vocabulary, findVocab } from './vocabulary'
import { sentences, findSentence } from './sentences'
import { grammar, findGrammarConcept } from './grammar'
import { alphabet, findLetter, shortVowels } from './alphabet'
import { passages, findPassage } from './passages'
import { units } from './curriculum/units'
import { levels } from './curriculum/levels'
import type { ConfidenceStatus, SourceNote } from './types'

function duplicates<T>(ids: T[]): T[] {
  const seen = new Set<T>()
  const dupes = new Set<T>()
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

describe('passage content', () => {
  it('has no duplicate ids', () => {
    expect(duplicates(passages.map((p) => p.id))).toEqual([])
  })

  it('every passage has a title and at least one sentence, and its sentenceIds resolve', () => {
    for (const p of passages) {
      expect(p.title.trim(), p.id).not.toBe('')
      expect(p.sentenceIds.length, `${p.id} needs at least one sentence`).toBeGreaterThan(0)
      for (const sid of p.sentenceIds) {
        expect(findSentence(sid), `${p.id} sentenceIds -> missing ${sid}`).toBeTruthy()
      }
    }
  })

  it('every comprehension question has a valid correctIndex into its own options', () => {
    for (const p of passages) {
      for (const q of p.comprehensionQuestions) {
        expect(q.question.trim(), `${p.id} ${q.id}`).not.toBe('')
        expect(q.options.length, `${p.id} ${q.id} needs options`).toBeGreaterThan(1)
        expect(q.correctIndex, `${p.id} ${q.id} correctIndex out of range`).toBeGreaterThanOrEqual(0)
        expect(q.correctIndex, `${p.id} ${q.id} correctIndex out of range`).toBeLessThan(q.options.length)
      }
    }
  })

  it('question ids are unique within a passage', () => {
    for (const p of passages) {
      expect(duplicates(p.comprehensionQuestions.map((q) => q.id)), p.id).toEqual([])
    }
  })
})

describe('curriculum content', () => {
  it('units have no duplicate ids', () => {
    expect(duplicates(units.map((u) => u.id))).toEqual([])
  })

  it('every unit level exists in the level list', () => {
    const levelNums = new Set(levels.map((l) => l.level))
    for (const u of units) expect(levelNums.has(u.level), u.id).toBe(true)
  })

  it('unit content refs (alphabet/vocab/grammar/sentence/passage) all point at real content', () => {
    for (const u of units) {
      for (const id of u.alphabetIds ?? []) expect(findLetter(id), `${u.id} alphabetIds -> missing ${id}`).toBeTruthy()
      for (const id of u.vocabIds ?? []) expect(findVocab(id), `${u.id} vocabIds -> missing ${id}`).toBeTruthy()
      for (const id of u.grammarConceptIds ?? []) expect(findGrammarConcept(id), `${u.id} grammarConceptIds -> missing ${id}`).toBeTruthy()
      for (const id of u.sentenceIds ?? []) expect(findSentence(id), `${u.id} sentenceIds -> missing ${id}`).toBeTruthy()
      for (const id of u.passageIds ?? []) expect(findPassage(id), `${u.id} passageIds -> missing ${id}`).toBeTruthy()
    }
  })

  it('no unit is entirely empty', () => {
    // Levels 5-6 are now fully built out (content-depth pass), so the
    // earlier exemption for the Level 6 seed unit no longer applies —
    // every unit must carry real content.
    for (const u of units) {
      const total = (u.alphabetIds?.length ?? 0) + (u.vocabIds?.length ?? 0) + (u.grammarConceptIds?.length ?? 0) + (u.sentenceIds?.length ?? 0) + (u.passageIds?.length ?? 0)
      expect(total, `${u.id} has no content at all`).toBeGreaterThan(0)
    }
  })

  it('unit order values are unique within their level', () => {
    const byLevel = new Map<number, number[]>()
    for (const u of units) {
      const list = byLevel.get(u.level) ?? []
      list.push(u.order)
      byLevel.set(u.level, list)
    }
    for (const [level, orders] of byLevel) {
      expect(duplicates(orders), `level ${level} has duplicate unit order values`).toEqual([])
    }
  })
})

// ---------------------------------------------------------------------------
// Content-quality discipline: every piece of linguistic content must carry
// an explicit, valid `confidence` (see SourceNote in types.ts). The type
// system already forces every literal to set one, but this makes the rule
// explicit and catches anything built dynamically or cast around the type
// (e.g. `as VocabItem`) where TypeScript wouldn't. It's cheap, so it runs
// across every content collection that carries a SourceNote.
// ---------------------------------------------------------------------------

const VALID_CONFIDENCE: ConfidenceStatus[] = ['high-confidence', 'needs-review', 'verified']

function expectValidConfidence(items: Array<SourceNote & { id: string }>, label: string) {
  for (const item of items) {
    expect(VALID_CONFIDENCE, `${label} ${item.id} has an invalid confidence value: ${item.confidence}`)
      .toContain(item.confidence)
    if (item.confidence === 'needs-review') {
      expect(item.note?.trim(), `${label} ${item.id} is needs-review but has no note explaining why`).toBeTruthy()
    }
  }
}

describe('content confidence discipline', () => {
  it('every vocabulary item has a valid confidence, and needs-review items have a note', () => {
    expectValidConfidence(vocabulary, 'vocab')
  })

  it('every sentence has a valid confidence, and needs-review items have a note', () => {
    expectValidConfidence(sentences, 'sentence')
  })

  it('every grammar concept has a valid confidence, and needs-review items have a note', () => {
    expectValidConfidence(grammar, 'grammar')
  })

  it('every alphabet letter has a valid confidence, and needs-review items have a note', () => {
    expectValidConfidence(alphabet, 'alphabet')
  })

  it('every short vowel has a valid confidence, and needs-review items have a note', () => {
    expectValidConfidence(shortVowels, 'short-vowel')
  })

  it('every passage has a valid confidence, and needs-review items have a note', () => {
    expectValidConfidence(passages, 'passage')
  })
})
