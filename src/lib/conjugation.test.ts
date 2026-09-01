import { describe, expect, it } from 'vitest'
import { findVocab } from '../content/vocabulary'
import { conjugate, hasConjugableStems, hasRegularPresent, pronounLabel } from './conjugation'

const raftan = findVocab('verb-raftan')! // رفتن, present رو (rav), past رفت (raft)
const dashtan = findVocab('verb-dashtan')! // داشتن, drops می‌ in the present
const dustDashtan = findVocab('verb-dust-dashtan')! // دوست داشتن, compound + drops mi
const karKardan = findVocab('verb-kar-kardan')! // کار کردن, compound, keeps mi before the light verb
const budan = findVocab('verb-budan')! // بودن, irregular present (copula)
const khordan = findVocab('verb-khordan')! // خوردن, plain regular verb, for a second cross-check

describe('conjugate — present tense', () => {
  it('a plain regular verb: mi- + stem + ending, matching this repo\'s own content (میروم)', () => {
    const forms = conjugate(raftan, 'present')
    expect(forms.find((f) => f.person === '1sg')).toMatchObject({ fa: 'می‌روم', translit: 'miravam' })
    expect(forms.find((f) => f.person === '2sg')).toMatchObject({ fa: 'می‌روی', translit: 'miravi' })
    expect(forms.find((f) => f.person === '3sg')).toMatchObject({ fa: 'می‌رود', translit: 'miravad' })
    expect(forms.find((f) => f.person === '1pl')).toMatchObject({ fa: 'می‌رویم', translit: 'miravim' })
    expect(forms.find((f) => f.person === '2pl')).toMatchObject({ fa: 'می‌روید', translit: 'miravid' })
    expect(forms.find((f) => f.person === '3pl')).toMatchObject({ fa: 'می‌روند', translit: 'miravand' })
  })

  it('a second plain regular verb cross-check (خوردن)', () => {
    const forms = conjugate(khordan, 'present')
    expect(forms.find((f) => f.person === '1sg')).toMatchObject({ fa: 'می‌خورم', translit: 'mikhoram' })
  })

  it('داشتن drops the mi- prefix (دارم not میدارم)', () => {
    const forms = conjugate(dashtan, 'present')
    expect(forms.find((f) => f.person === '1sg')).toMatchObject({ fa: 'دارم', translit: 'dāram' })
    expect(forms.find((f) => f.person === '3sg')).toMatchObject({ fa: 'دارد', translit: 'dārad' })
    for (const f of forms) expect(f.fa).not.toContain('می')
  })

  it('a compound verb built on داشتن also drops mi- (دوست دارم)', () => {
    const forms = conjugate(dustDashtan, 'present')
    expect(forms.find((f) => f.person === '1sg')).toMatchObject({ fa: 'دوست دارم', translit: 'dust dāram' })
  })

  it('a compound verb inserts mi- before the light verb, not the phrase front (کار میکنم not میکار کنم)', () => {
    const forms = conjugate(karKardan, 'present')
    const first = forms.find((f) => f.person === '1sg')!
    expect(first.fa).toBe('کار می‌کنم')
    expect(first.translit).toBe('kār mikonam')
    expect(first.fa.startsWith('می')).toBe(false)
  })

  it('بودن uses the irregular copula (هستم/است...), not mi-+stem', () => {
    const forms = conjugate(budan, 'present')
    expect(forms.find((f) => f.person === '1sg')).toMatchObject({ fa: 'هستم', translit: 'hastam' })
    expect(forms.find((f) => f.person === '3sg')).toMatchObject({ fa: 'است', translit: 'ast' })
    expect(forms.find((f) => f.person === '3pl')).toMatchObject({ fa: 'هستند', translit: 'hastand' })
  })
})

describe('conjugate — simple past', () => {
  it('a plain regular verb: past stem + ending, with a BARE 3rd-singular (رفت not رفتد)', () => {
    const forms = conjugate(raftan, 'past')
    expect(forms.find((f) => f.person === '1sg')).toMatchObject({ fa: 'رفتم', translit: 'raftam' })
    expect(forms.find((f) => f.person === '2sg')).toMatchObject({ fa: 'رفتی', translit: 'rafti' })
    expect(forms.find((f) => f.person === '3sg')).toMatchObject({ fa: 'رفت', translit: 'raft' })
    expect(forms.find((f) => f.person === '1pl')).toMatchObject({ fa: 'رفتیم', translit: 'raftim' })
    expect(forms.find((f) => f.person === '2pl')).toMatchObject({ fa: 'رفتید', translit: 'raftid' })
    expect(forms.find((f) => f.person === '3pl')).toMatchObject({ fa: 'رفتند', translit: 'raftand' })
  })

  it('بودن\'s past tense is fully regular (بودم), unlike its irregular present', () => {
    const forms = conjugate(budan, 'past')
    expect(forms.find((f) => f.person === '1sg')).toMatchObject({ fa: 'بودم', translit: 'budam' })
    expect(forms.find((f) => f.person === '3sg')).toMatchObject({ fa: 'بود', translit: 'bud' })
  })

  it('a compound verb\'s past only conjugates the light verb (کار کردم not کارم کرد)', () => {
    const forms = conjugate(karKardan, 'past')
    expect(forms.find((f) => f.person === '1sg')).toMatchObject({ fa: 'کار کردم', translit: 'kār kardam' })
    expect(forms.find((f) => f.person === '3sg')).toMatchObject({ fa: 'کار کرد', translit: 'kār kard' })
  })
})

describe('hasConjugableStems / hasRegularPresent', () => {
  it('every verb in the vocabulary with verbStems is reported conjugable', () => {
    expect(hasConjugableStems(raftan)).toBe(true)
    expect(hasConjugableStems(dashtan)).toBe(true)
  })

  it('a non-verb vocab item is not conjugable', () => {
    const noun = findVocab('greet-salam')!
    expect(hasConjugableStems(noun)).toBe(false)
  })

  it('only بودن is excluded from the regular-present rule', () => {
    expect(hasRegularPresent(budan)).toBe(false)
    expect(hasRegularPresent(raftan)).toBe(true)
    expect(hasRegularPresent(dashtan)).toBe(true)
  })
})

describe('pronounLabel', () => {
  it('has a readable English label for every person', () => {
    expect(pronounLabel('1sg')).toBe('I')
    expect(pronounLabel('3pl')).toBe('they')
  })
})
