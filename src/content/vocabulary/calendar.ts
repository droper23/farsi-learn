import type { VocabItem } from '../types'

/**
 * The twelve months of the Solar Hijri (Iranian/Persian) calendar — Iran's
 * official civil calendar (see the existing `time-noruz` entry in
 * timeDates.ts). Names, order, and approximate Gregorian date ranges
 * confirmed against the standard, universally-used Solar Hijri month list
 * (astronomically fixed: each month begins at a solar-longitude boundary,
 * not a fixed Gregorian date, so ranges below are typical, occasionally
 * shifting by a day). Cross-checked against src/lib/persianCalendar.ts,
 * whose conversion algorithm is independently verified against known
 * reference dates in persianCalendar.test.ts.
 *
 * The first six months have 31 days, the next five have 30, and the last
 * (Esfand) has 29 (30 in a leap year) — genuinely useful to know once a
 * learner is reading dates, so it's noted per-item below.
 */
export const calendarVocab: VocabItem[] = [
  { id: 'date-farvardin', fa: 'فروردین', translit: 'farvardin', en: 'Farvardin (1st month, ≈ Mar 21 – Apr 20)', pos: 'noun', category: 'dates', register: 'neutral', frequency: 3, level: 2,
    notes: '31 days. Contains Nowruz (Persian New Year), 1 Farvardin.',
    note: 'Confirmed against the standard Solar Hijri month list (e.g. Iran Chamber Society / general Persian-calendar references); month order and day-counts are fixed by the calendar\'s own rules, not a matter of dialect or usage.',
    confidence: 'verified' },
  { id: 'date-ordibehesht', fa: 'اردیبهشت', translit: 'ordibehesht', en: 'Ordibehesht (2nd month, ≈ Apr 21 – May 21)', pos: 'noun', category: 'dates', register: 'neutral', frequency: 3, level: 2,
    notes: '31 days.', confidence: 'verified' },
  { id: 'date-khordad', fa: 'خرداد', translit: 'khordad', en: 'Khordad (3rd month, ≈ May 22 – Jun 21)', pos: 'noun', category: 'dates', register: 'neutral', frequency: 3, level: 2,
    notes: '31 days.', confidence: 'verified' },
  { id: 'date-tir', fa: 'تیر', translit: 'tir', en: 'Tir (4th month, ≈ Jun 22 – Jul 22)', pos: 'noun', category: 'dates', register: 'neutral', frequency: 3, level: 2,
    notes: '31 days.', confidence: 'verified' },
  { id: 'date-mordad', fa: 'مرداد', translit: 'mordad', en: 'Mordad (5th month, ≈ Jul 23 – Aug 22)', pos: 'noun', category: 'dates', register: 'neutral', frequency: 3, level: 2,
    notes: '31 days. Also spelled/pronounced Amordad in more formal usage.', confidence: 'verified' },
  { id: 'date-shahrivar', fa: 'شهریور', translit: 'shahrivar', en: 'Shahrivar (6th month, ≈ Aug 23 – Sep 22)', pos: 'noun', category: 'dates', register: 'neutral', frequency: 3, level: 2,
    notes: '31 days — the last of the six 31-day months.', confidence: 'verified' },
  { id: 'date-mehr', fa: 'مهر', translit: 'mehr', en: 'Mehr (7th month, ≈ Sep 23 – Oct 22)', pos: 'noun', category: 'dates', register: 'neutral', frequency: 3, level: 2,
    notes: '30 days. The Iranian school year traditionally starts 1 Mehr.', confidence: 'verified' },
  { id: 'date-aban', fa: 'آبان', translit: 'ābān', en: 'Aban (8th month, ≈ Oct 23 – Nov 21)', pos: 'noun', category: 'dates', register: 'neutral', frequency: 3, level: 2,
    notes: '30 days.', confidence: 'verified' },
  { id: 'date-azar', fa: 'آذر', translit: 'āzar', en: 'Azar (9th month, ≈ Nov 22 – Dec 21)', pos: 'noun', category: 'dates', register: 'neutral', frequency: 3, level: 2,
    notes: '30 days.', confidence: 'verified' },
  { id: 'date-dey', fa: 'دی', translit: 'dey', en: 'Dey (10th month, ≈ Dec 22 – Jan 20)', pos: 'noun', category: 'dates', register: 'neutral', frequency: 3, level: 2,
    notes: '30 days.', confidence: 'verified' },
  { id: 'date-bahman', fa: 'بهمن', translit: 'bahman', en: 'Bahman (11th month, ≈ Jan 21 – Feb 19)', pos: 'noun', category: 'dates', register: 'neutral', frequency: 3, level: 2,
    notes: '30 days — the last of the five 30-day months.', confidence: 'verified' },
  { id: 'date-esfand', fa: 'اسفند', translit: 'esfand', en: 'Esfand (12th and last month, ≈ Feb 20 – Mar 20)', pos: 'noun', category: 'dates', register: 'neutral', frequency: 3, level: 2,
    notes: '29 days in a common year, 30 in a leap year — the calendar\'s only variable-length month.', confidence: 'verified' },
]
