import { describe, expect, it } from 'vitest'
import { diacriticsManifest } from './diacriticsManifest'
import { vocabulary } from './vocabulary'
import { alphabet } from './alphabet'

// Arabic-script combining diacritics: fatha/damma/kasra, shadda, sukun, tanwin.
const DIACRITIC_MARKS = /[ً-ْ]/g
// Same range minus tanwin (فتحتان/ضمتان/کسرتان) — tanwin is ordinary,
// always-written Persian spelling for words like اصلاً/واقعاً/لطفاً, so it
// can legitimately appear in the *plain* key already; only the vowel/
// shadda/sukun marks below are ones this manifest actually adds.
const ADDED_MARKS = /[َ-ْ]/g

describe('diacriticsManifest', () => {
  const knownTexts = new Set<string>([
    ...vocabulary.map((v) => v.fa),
    ...alphabet.map((l) => l.nameFa),
    ...alphabet.flatMap((l) => l.exampleWords.map((w) => w.fa)),
  ])

  it('every key corresponds to a real, current vocabulary/alphabet string (no stale entries)', () => {
    for (const key of Object.keys(diacriticsManifest)) {
      expect(knownTexts.has(key), `"${key}" is not any current vocab/alphabet fa or letter name`).toBe(true)
    }
  })

  it('every value contains at least one diacritic mark and differs from its key', () => {
    for (const [key, value] of Object.entries(diacriticsManifest)) {
      expect(DIACRITIC_MARKS.test(value), `"${key}" -> "${value}" has no diacritic mark`).toBe(true)
      DIACRITIC_MARKS.lastIndex = 0
      expect(value, `"${key}" -> "${value}" is identical to the key`).not.toBe(key)
    }
  })

  it('stripping added diacritic marks from every value recovers exactly its key — the diacritized form must be the same letters, only with marks added, never a different word', () => {
    for (const [key, value] of Object.entries(diacriticsManifest)) {
      const stripped = value.replace(ADDED_MARKS, '')
      expect(stripped, `"${key}" -> "${value}" strips to "${stripped}", not the original key`).toBe(key)
    }
  })

  it('covers a meaningful share of vocabulary (regression guard against an empty/truncated manifest)', () => {
    expect(Object.keys(diacriticsManifest).length).toBeGreaterThan(250)
  })
})
