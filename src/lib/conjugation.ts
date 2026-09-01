/**
 * Persian regular-verb conjugation (present & simple past).
 *
 * `VocabItem.verbStems` (present/past stem pairs) has existed on ~35 verbs
 * since an earlier pass but was only ever used to drill the bare
 * infinitive — nothing actually taught or tested conjugation. Persian
 * person/number suffixes on present and past stems are fully rule-based,
 * so generating the whole paradigm from a verb's two stems is low
 * fabrication-risk despite being a big usability win.
 *
 * Rule set (verified against this repo's own already-verified grammar
 * concepts — content/grammar/concepts.ts g-present-tense-verbs,
 * g-simple-past, g-copula-present, all `confidence: 'high-confidence'` —
 * and cross-checked against dastur.info §8 "Verbs" and UT Austin's
 * "Persian Online" present/past tense units, the same class of reference
 * cited elsewhere in this content set, e.g. g-purpose-clauses):
 *
 * - Present tense = می‌ (mi-, with a ZWNJ before the stem) + present stem +
 *   person ending. Endings: -am, -i, -ad, -im, -id, -and
 *   (م, ی, د, یم, ید, ند). E.g. رفتن (raftan) present stem رو (rav) ->
 *   می‌روم (miravam) "I go".
 * - Simple past = past stem + person ending, with the SAME six endings
 *   except the 3rd-person-singular ending is bare (no suffix at all) —
 *   e.g. رفتم (raftam) "I went" but رفت (raft) "he/she went", not *رفتد.
 * - Compound (light) verbs (`isCompoundVerb`, e.g. کار کردن "to work")
 *   only conjugate their light-verb half; the noun/adjective part in front
 *   never changes, and می‌ attaches immediately before the light verb, not
 *   at the front of the phrase: کار می‌کنم (kār mikonam) "I work", not
 *   *می‌کار کنم. Implemented by only prefixing/suffixing the LAST
 *   whitespace-separated token of the stored stem string.
 * - داشتن (dāshtan, "to have") and its compounds (e.g. دوست داشتن "to
 *   like") drop the می‌ prefix in the present tense entirely — این already
 *   documented in this repo's own content/vocabulary/verbsCore.ts `notes`
 *   field for verb-dashtan. Detected here structurally (present stem is or
 *   ends with "دار") rather than by a per-verb id list, so it
 *   automatically covers any future دار-stem compound too.
 * - بودن ("to be") is genuinely irregular in the present — it isn't
 *   می‌+stem at all, but the copula endings هستم/هستی/است/هستیم/هستید/
 *   هستند already documented (and marked high-confidence) on
 *   g-copula-present. Hardcoded here rather than derived, and — out of
 *   caution, since it sits outside the fully rule-based system this file
 *   otherwise is — excluded from *generated exercises* in
 *   lib/session.ts even though it's still shown in the teach view. بودن's
 *   past tense is fully regular (بودم "I was" etc.) and needs no special
 *   case.
 *
 * See conjugation.test.ts for the correctness suite (this is pure logic,
 * not authored content, so it doesn't carry a `confidence` field the way
 * vocabulary/grammar do — correctness comes from the tests, same
 * philosophy as lib/persianCalendar.ts).
 */
import type { VocabItem } from '../content/types'

export type ConjugationPerson = '1sg' | '2sg' | '3sg' | '1pl' | '2pl' | '3pl'
export type ConjugationTense = 'present' | 'past'

export interface ConjugatedForm {
  person: ConjugationPerson
  pronounFa: string
  pronounTranslit: string
  fa: string
  translit: string
}

const PERSONS: ConjugationPerson[] = ['1sg', '2sg', '3sg', '1pl', '2pl', '3pl']

const PRONOUNS: Record<ConjugationPerson, { fa: string; translit: string; label: string }> = {
  '1sg': { fa: 'من', translit: 'man', label: 'I' },
  '2sg': { fa: 'تو', translit: 'to', label: 'you (informal)' },
  '3sg': { fa: 'او', translit: 'u', label: 'he/she' },
  '1pl': { fa: 'ما', translit: 'mā', label: 'we' },
  '2pl': { fa: 'شما', translit: 'shomā', label: 'you (plural/formal)' },
  '3pl': { fa: 'آنها', translit: 'ānhā', label: 'they' },
}

export function pronounLabel(person: ConjugationPerson): string {
  return PRONOUNS[person].label
}

interface Ending { fa: string; translit: string }

const PRESENT_ENDINGS: Record<ConjugationPerson, Ending> = {
  '1sg': { fa: 'م', translit: 'am' },
  '2sg': { fa: 'ی', translit: 'i' },
  '3sg': { fa: 'د', translit: 'ad' },
  '1pl': { fa: 'یم', translit: 'im' },
  '2pl': { fa: 'ید', translit: 'id' },
  '3pl': { fa: 'ند', translit: 'and' },
}

// Same set except the 3rd-person-singular ending is bare (رفت not *رفتد).
const PAST_ENDINGS: Record<ConjugationPerson, Ending> = {
  ...PRESENT_ENDINGS,
  '3sg': { fa: '', translit: '' },
}

// "mi" + an explicit ZWNJ (U+200C) escape, so the exact invisible character
// isn't at the mercy of copy/paste or editor encoding — matches how می‌روم
// etc. are written throughout this repo's own content.
const MI_PREFIX_FA = 'می' + '‌'
const MI_PREFIX_TRANSLIT = 'mi'

/** داشتن and compounds built on it (دوست داشتن, etc.) drop می‌ in the
 *  present tense — detected structurally by their present stem being (or
 *  ending in, for compounds) "دار". */
function dropsMiPrefix(verb: VocabItem): boolean {
  const stem = verb.verbStems?.present ?? ''
  return stem === 'دار' || stem.endsWith(' دار')
}

/** Splits a (possibly compound) stem string on its last space: everything
 *  before stays fixed, the last token is what actually conjugates. For a
 *  simple (non-compound) verb this is a no-op split (one token, no
 *  prefix). */
function splitStem(stem: string): { prefix: string; last: string } {
  const tokens = stem.split(' ')
  const last = tokens.pop() ?? ''
  return { prefix: tokens.length > 0 ? tokens.join(' ') + ' ' : '', last }
}

function buildPresent(verb: VocabItem, ending: Ending): { fa: string; translit: string } {
  const stems = verb.verbStems!
  const faSplit = splitStem(stems.present)
  const translitSplit = splitStem(stems.presentTranslit)
  const dropMi = dropsMiPrefix(verb)
  return {
    fa: `${faSplit.prefix}${dropMi ? '' : MI_PREFIX_FA}${faSplit.last}${ending.fa}`,
    translit: `${translitSplit.prefix}${dropMi ? '' : MI_PREFIX_TRANSLIT}${translitSplit.last}${ending.translit}`,
  }
}

function buildPast(verb: VocabItem, ending: Ending): { fa: string; translit: string } {
  const stems = verb.verbStems!
  const faSplit = splitStem(stems.past)
  const translitSplit = splitStem(stems.pastTranslit)
  return {
    fa: `${faSplit.prefix}${faSplit.last}${ending.fa}`,
    translit: `${translitSplit.prefix}${translitSplit.last}${ending.translit}`,
  }
}

/** بودن ("to be") present tense uses the copula, not می‌+stem — see file
 *  header. Text matches g-copula-present (content/grammar/concepts.ts)
 *  verbatim. */
const BUDAN_PRESENT_COPULA: Record<ConjugationPerson, { fa: string; translit: string }> = {
  '1sg': { fa: 'هستم', translit: 'hastam' },
  '2sg': { fa: 'هستی', translit: 'hasti' },
  '3sg': { fa: 'است', translit: 'ast' },
  '1pl': { fa: 'هستیم', translit: 'hastim' },
  '2pl': { fa: 'هستید', translit: 'hastid' },
  '3pl': { fa: 'هستند', translit: 'hastand' },
}

const BUDAN_ID = 'verb-budan'

/** True for any vocab item with the stem data conjugation needs. */
export function hasConjugableStems(verb: VocabItem): boolean {
  return verb.pos === 'verb' && !!verb.verbStems
}

/** True if this verb's *present* tense can be generated by the regular
 *  می‌+stem+ending rule — false only for بودن, whose present is the
 *  irregular copula (still shown in the teach view via `conjugate`, just
 *  excluded from generated quiz exercises out of caution — see file
 *  header). */
export function hasRegularPresent(verb: VocabItem): boolean {
  return verb.id !== BUDAN_ID
}

/** Returns all six person-forms of `verb` in the given tense. Throws if
 *  the verb has no `verbStems` — check `hasConjugableStems` first. */
export function conjugate(verb: VocabItem, tense: ConjugationTense): ConjugatedForm[] {
  if (!verb.verbStems) throw new Error(`conjugate: "${verb.id}" has no verbStems`)
  return PERSONS.map((person) => {
    const pronoun = PRONOUNS[person]
    const form = tense === 'present'
      ? (verb.id === BUDAN_ID ? BUDAN_PRESENT_COPULA[person] : buildPresent(verb, PRESENT_ENDINGS[person]))
      : buildPast(verb, PAST_ENDINGS[person])
    return { person, pronounFa: pronoun.fa, pronounTranslit: pronoun.translit, fa: form.fa, translit: form.translit }
  })
}
