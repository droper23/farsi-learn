import { describe, expect, it } from 'vitest'
import {
  gregorianToSolarHijri, solarHijriToGregorian, isLeapSolarHijriYear,
  todaySolarHijri, formatSolarHijri, persianMonthName, persianMonthNameFa,
} from './persianCalendar'

// Reference dates verified against jalaali-js's own documented examples and
// independently against publicly reported Nowruz dates — see the file
// header comment in persianCalendar.ts for sources.
describe('gregorianToSolarHijri — known reference dates', () => {
  it('matches the jalaali-js README example (2016-04-11 -> 1395-01-23)', () => {
    expect(gregorianToSolarHijri(2016, 4, 11)).toEqual({ year: 1395, month: 1, day: 23 })
  })

  it('Nowruz 1403 fell on 2024-03-20 (widely reported)', () => {
    expect(gregorianToSolarHijri(2024, 3, 20)).toEqual({ year: 1403, month: 1, day: 1 })
  })

  it('Nowruz 1400 fell on 2021-03-21 (widely reported)', () => {
    expect(gregorianToSolarHijri(2021, 3, 21)).toEqual({ year: 1400, month: 1, day: 1 })
  })

  it('the day before Nowruz 1400 is the last day of 1399 (Esfand)', () => {
    expect(gregorianToSolarHijri(2021, 3, 20)).toEqual({ year: 1399, month: 12, day: 30 })
  })
})

describe('solarHijriToGregorian — known reference dates', () => {
  it('matches the jalaali-js README example (1395-01-23 -> 2016-04-11)', () => {
    expect(solarHijriToGregorian(1395, 1, 23)).toEqual({ year: 2016, month: 4, day: 11 })
  })

  it('1403-01-01 -> 2024-03-20 (Nowruz)', () => {
    expect(solarHijriToGregorian(1403, 1, 1)).toEqual({ year: 2024, month: 3, day: 20 })
  })
})

describe('round trip: gregorian -> solar hijri -> gregorian', () => {
  it('recovers the original date across a wide range of years and days', () => {
    const samplesPerYear: Array<[number, number]> = [[1, 1], [3, 20], [3, 21], [6, 15], [9, 23], [12, 31]]
    for (let year = 1950; year <= 2060; year += 1) {
      for (const [month, day] of samplesPerYear) {
        const jalaali = gregorianToSolarHijri(year, month, day)
        const back = solarHijriToGregorian(jalaali.year, jalaali.month, jalaali.day)
        expect(back).toEqual({ year, month, day })
      }
    }
  })
})

describe('isLeapSolarHijriYear', () => {
  it('1395 is a leap year (Esfand has 30 days)', () => {
    expect(isLeapSolarHijriYear(1395)).toBe(true)
    // Confirmed indirectly: day 30 of month 12 round-trips to a real date.
    const g = solarHijriToGregorian(1395, 12, 30)
    expect(gregorianToSolarHijri(g.year, g.month, g.day)).toEqual({ year: 1395, month: 12, day: 30 })
  })

  it('1399 is a leap year (matches the 30-day Esfand reference date above)', () => {
    expect(isLeapSolarHijriYear(1399)).toBe(true)
  })

  it('1394 is not a leap year', () => {
    expect(isLeapSolarHijriYear(1394)).toBe(false)
  })
})

describe('todaySolarHijri', () => {
  it('delegates to gregorianToSolarHijri for the given date', () => {
    // 2026-08-31 -> Solar Hijri (year 1405 began 2026-03-21; Shahrivar
    // spans ~Aug 23 - Sep 22, so this lands in month 6).
    const result = todaySolarHijri(new Date(2026, 7, 31))
    expect(result).toEqual(gregorianToSolarHijri(2026, 8, 31))
    expect(result.month).toBe(6)
  })
})

describe('formatSolarHijri / month names', () => {
  it('formats as "day month year"', () => {
    expect(formatSolarHijri({ year: 1403, month: 1, day: 1 })).toBe('1 Farvardin 1403')
  })

  it('has 12 English and 12 Persian month names, Farvardin/فروردین first and Esfand/اسفند last', () => {
    expect(persianMonthName(1)).toBe('Farvardin')
    expect(persianMonthName(12)).toBe('Esfand')
    expect(persianMonthNameFa(1)).toBe('فروردین')
    expect(persianMonthNameFa(12)).toBe('اسفند')
  })
})
