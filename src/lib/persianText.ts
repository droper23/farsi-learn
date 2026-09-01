/**
 * Persian text normalization helpers. These matter for two reasons:
 *  1. Learners often type Arabic-keyboard variants of letters (ي vs ی, ك vs
 *     ک) that look identical or near-identical but are different Unicode
 *     codepoints — grading should treat them as the same answer.
 *  2. Diacritics, ZWNJ vs. plain space vs. no space, and Eastern Arabic
 *     digits vs. Latin digits are all "the same" for matching purposes even
 *     though they're visually/structurally different.
 */

const ARABIC_YEH = 'ي' // ي
const PERSIAN_YEH = 'ی' // ی
const ARABIC_KAF = 'ك' // ك
const PERSIAN_KEHEH = 'ک' // ک
const ZWNJ = '‌'
const DIACRITICS = /[ً-ٰٟ]/g

export function normalizePersian(input: string): string {
  return input
    .replace(new RegExp(ARABIC_YEH, 'g'), PERSIAN_YEH)
    .replace(new RegExp(ARABIC_KAF, 'g'), PERSIAN_KEHEH)
    .replace(DIACRITICS, '')
    .replace(new RegExp(ZWNJ, 'g'), ' ')
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0)) // Extended (Persian) digits
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660)) // Arabic-Indic digits
    .trim()
    .replace(/\s+/g, ' ')
}

export function normalizeLatin(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip Latin diacritics (ā -> a) for lenient matching
    .replace(/['’]/g, '')
    .trim()
    .replace(/\s+/g, ' ')
}

export function persianTextsMatch(a: string, b: string): boolean {
  return normalizePersian(a) === normalizePersian(b)
}

export function englishAnswerMatches(input: string, accepted: string[]): boolean {
  const normalizedInput = normalizeLatin(input)
  return accepted.some((a) => normalizeLatin(a) === normalizedInput)
}

/** Convert Latin digits to Eastern Arabic (Persian) digits for display. */
export function toPersianDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)])
}
