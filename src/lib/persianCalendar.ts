/**
 * Gregorian ↔ Solar Hijri (Jalaali/Persian) calendar conversion.
 *
 * This is deterministic date math, not linguistic content — it doesn't
 * carry a `confidence`/`note` field the way vocabulary or grammar content
 * does (see content/types.ts `SourceNote`). Correctness instead comes from
 * implementing a well-established published algorithm and testing it
 * against known reference dates (see persianCalendar.test.ts).
 *
 * Algorithm: the astronomical Solar Hijri calculation published by
 * Kazimierz M. Borkowski, "The Persian calendar for 3000 years" (1996),
 * https://www.astro.uni.torun.pl/~kb/Papers/EMP/PersianC-EMP.htm — this is
 * the same algorithm implemented by the widely-used `jalaali-js` npm
 * library (MIT licensed; source: github.com/jalaali/jalaali-js). This file
 * is an independent, self-contained re-implementation (no new dependency
 * added), ported and adapted to just the conversions this app needs.
 *
 * Verified against jalaali-js's own documented examples and independently
 * against publicly reported Nowruz dates before being wired into the UI:
 *   - toJalaali(2016, 4, 11)  -> {jy: 1395, jm: 1, jd: 23}   (jalaali-js docs)
 *   - toGregorian(1395, 1, 23) -> {gy: 2016, gm: 4, gd: 11}  (jalaali-js docs)
 *   - 2024-03-20 (Gregorian)  -> 1403-01-01 (Nowruz 1403; widely reported,
 *     e.g. VOA News, "Iranians ... Persian New Year Festivities", Mar 2024)
 *   - 2021-03-21 (Gregorian)  -> 1400-01-01 (Nowruz 1400; widely reported)
 * Plus a round-trip property test (Gregorian -> Solar Hijri -> Gregorian)
 * across a wide range of years — see persianCalendar.test.ts for the full
 * suite, which is what actually gives this confidence, not the comment.
 */

export interface SolarHijriDate {
  year: number
  month: number // 1 = Farvardin ... 12 = Esfand
  day: number
}

export interface GregorianDate {
  year: number
  month: number // 1 = January ... 12 = December
  day: number
}

/** English (common romanization) names, in order, 1-indexed via `month`. */
export const PERSIAN_MONTH_NAMES: string[] = [
  'Farvardin', 'Ordibehesht', 'Khordad', 'Tir', 'Mordad', 'Shahrivar',
  'Mehr', 'Aban', 'Azar', 'Dey', 'Bahman', 'Esfand',
]

/** Persian-script names, same order. */
export const PERSIAN_MONTH_NAMES_FA: string[] = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند',
]

export function persianMonthName(month: number): string {
  return PERSIAN_MONTH_NAMES[month - 1] ?? ''
}

export function persianMonthNameFa(month: number): string {
  return PERSIAN_MONTH_NAMES_FA[month - 1] ?? ''
}

// ---------------------------------------------------------------------------
// Internals — Borkowski algorithm (see file header for source/verification)
// ---------------------------------------------------------------------------

/** Integer division, truncating toward zero. */
function div(a: number, b: number): number {
  return Math.trunc(a / b)
}

/** Mathematical modulo — always non-negative for a positive divisor
 *  (unlike JS's `%`, which can return a negative result). */
function mod(a: number, b: number): number {
  return a - Math.trunc(a / b) * b
}

/** Jalaali years that begin a new 33-year leap cycle, per Borkowski's
 *  tables. Valid for Jalaali years -61..3177 inclusive (Gregorian
 *  ~560..3798) — comfortably outside any date this app will ever show. */
const BREAKS = [
  -61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181,
  1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178,
]

/** Gregorian date -> Julian Day Number. */
function g2d(gy: number, gm: number, gd: number): number {
  let d = div((gy + div(gm - 8, 6) + 100100) * 1461, 4)
    + div(153 * mod(gm + 9, 12) + 2, 5)
    + gd - 34840408
  d = d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752
  return d
}

/** Julian Day Number -> Gregorian date. */
function d2g(jdn: number): GregorianDate {
  let j = 4 * jdn + 139361631
  j = j + div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908
  const i = div(mod(j, 1461), 4) * 5 + 308
  const gd = div(mod(i, 153), 5) + 1
  const gm = mod(div(i, 153), 12) + 1
  const gy = div(j, 1461) - 100100 + div(8 - gm, 6)
  return { year: gy, month: gm, day: gd }
}

/** Number of years since the last leap year (0..4; 0 = this year is leap),
 *  given the current 33-year cycle length (`jump`) and offset (`n`). */
function leapFromCycle(jump: number, n: number): number {
  let adjusted = n
  if (jump - n < 6) adjusted = n - jump + div(jump + 4, 33) * 33
  let leap = mod(mod(adjusted + 1, 33) - 1, 4)
  if (leap === -1) leap = 4
  return leap
}

interface JalCalResult {
  leap: number
  gy: number
  /** Day of March (Gregorian) on which Farvardin 1 falls for this year. */
  march: number
}

/** Locates a Jalaali year inside the 33-year-cycle break table and returns
 *  its leap status plus the Gregorian date of its Farvardin 1. */
function jalCal(jy: number): JalCalResult {
  const gy = jy + 621
  let leapJ = -14
  let jp = BREAKS[0]
  let jm = 0
  let jump = 0
  for (let i = 1; i < BREAKS.length; i++) {
    jm = BREAKS[i]
    jump = jm - jp
    if (jy < jm) break
    leapJ = leapJ + div(jump, 33) * 8 + div(mod(jump, 33), 4)
    jp = jm
  }
  const n = jy - jp
  leapJ = leapJ + div(n, 33) * 8 + div(mod(n, 33) + 3, 4)
  if (mod(jump, 33) === 4 && jump - n === 4) leapJ += 1
  const leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150
  const march = 20 + leapJ - leapG
  return { leap: leapFromCycle(jump, n), gy, march }
}

function d2j(jdn: number): SolarHijriDate {
  const gy = d2g(jdn).year
  let jy = gy - 621
  const r = jalCal(jy)
  const jdn1f = g2d(r.gy, 3, r.march)
  let k = jdn - jdn1f
  if (k >= 0) {
    if (k <= 185) return { year: jy, month: 1 + div(k, 31), day: mod(k, 31) + 1 }
    k -= 186
  } else {
    jy -= 1
    k += 179
    if (r.leap === 1) k += 1
  }
  return { year: jy, month: 7 + div(k, 30), day: mod(k, 30) + 1 }
}

function j2d(jy: number, jm: number, jd: number): number {
  const r = jalCal(jy)
  return g2d(r.gy, 3, r.march) + (jm - 1) * 31 - div(jm, 7) * (jm - 7) + jd - 1
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Converts a Gregorian calendar date to Solar Hijri. */
export function gregorianToSolarHijri(gy: number, gm: number, gd: number): SolarHijriDate {
  return d2j(g2d(gy, gm, gd))
}

/** Converts a Solar Hijri date to Gregorian. */
export function solarHijriToGregorian(jy: number, jm: number, jd: number): GregorianDate {
  return d2g(j2d(jy, jm, jd))
}

/** Returns true if the given Solar Hijri year is leap (Esfand has 30 days
 *  instead of 29). */
export function isLeapSolarHijriYear(jy: number): boolean {
  return jalCal(jy).leap === 0
}

/** Today's Solar Hijri date, from the caller's local-time `Date` (defaults
 *  to `new Date()` — a parameter mainly so tests can pass a fixed date). */
export function todaySolarHijri(now: Date = new Date()): SolarHijriDate {
  return gregorianToSolarHijri(now.getFullYear(), now.getMonth() + 1, now.getDate())
}

/** "9 Shahrivar 1405" style plain-English formatting for the dashboard
 *  widget. Persian-script formatting uses `persianMonthNameFa` directly
 *  where a caller wants it (kept separate since digit direction/shaping is
 *  a UI concern, not this module's). */
export function formatSolarHijri(date: SolarHijriDate): string {
  return `${date.day} ${persianMonthName(date.month)} ${date.year}`
}
