import type { ExampleSentence } from '../types'

/** A few example sentences tying the new weather/body/work-tech "thin spot"
 *  vocabulary units (see curriculum/units.ts) into real usage, rather than
 *  leaving them as bare word lists. */
export const thinSpotSentences: ExampleSentence[] = [
  {
    id: 's-weather-cloudy-cold', fa: 'امروز هوا ابری و سرد است.', translit: 'emruz havā abri va sard ast.',
    en: "Today's weather is cloudy and cold.", literalEn: 'today weather cloudy and cold is',
    register: 'neutral', level: 2,
    words: [
      { fa: 'امروز', translit: 'emruz', en: 'today', vocabId: 'time-emruz' },
      { fa: 'هوا', translit: 'havā', en: 'weather/air' },
      { fa: 'ابری', translit: 'abri', en: 'cloudy', vocabId: 'nat-abr' },
      { fa: 'و سرد است', translit: 'va sard ast', en: 'and is cold', vocabId: 'adj-sard' },
    ],
    vocabIds: ['time-emruz', 'nat-abr', 'adj-sard'],
    confidence: 'high-confidence',
  },
  {
    id: 's-body-headache', fa: 'سرم درد می‌کند.', translit: 'saram dard mikonad.',
    en: 'My head hurts.', literalEn: 'my-head pain it-does',
    register: 'neutral', level: 3,
    words: [
      { fa: 'سرم', translit: 'saram', en: 'my head', vocabId: 'body-sar' },
      { fa: 'درد می‌کند', translit: 'dard mikonad', en: 'hurts', vocabId: 'health-dard' },
    ],
    grammarConceptIds: ['g-possession'], vocabIds: ['body-sar', 'health-dard'],
    notes: 'The -am possessive suffix (سر + م) is the everyday way to say "my [body part]" — much more common than a separate possessive pronoun here.',
    confidence: 'high-confidence',
  },
  {
    id: 's-body-hand-hurts', fa: 'دستم درد می‌کند، نمی‌تونم بنویسم.', translit: 'dastam dard mikonad, nemitunam benevisam.',
    en: "My hand hurts, I can't write.", literalEn: 'my-hand pain it-does, I-cannot I-write',
    register: 'colloquial', level: 3,
    words: [
      { fa: 'دستم درد می‌کند', translit: 'dastam dard mikonad', en: 'my hand hurts', vocabId: 'body-dast' },
      { fa: 'نمی‌تونم بنویسم', translit: 'nemitunam benevisam', en: "I can't write" },
    ],
    grammarConceptIds: ['g-modals'], vocabIds: ['body-dast'],
    confidence: 'high-confidence',
  },
  {
    id: 's-work-meeting-tomorrow', fa: 'فردا یک جلسه مهم در اداره دارم.', translit: 'fardā yek jalase-ye mohem dar edāre dāram.',
    en: 'I have an important meeting at the office tomorrow.', literalEn: 'tomorrow one meeting-of important in office I-have',
    register: 'formal', level: 4,
    words: [
      { fa: 'فردا', translit: 'fardā', en: 'tomorrow', vocabId: 'time-farda' },
      { fa: 'یک جلسه مهم', translit: 'yek jalase-ye mohem', en: 'an important meeting', vocabId: 'work2-jalase' },
      { fa: 'در اداره دارم', translit: 'dar edāre dāram', en: 'I have at the office', vocabId: 'work-edare' },
    ],
    vocabIds: ['time-farda', 'work2-jalase', 'work-edare'],
    confidence: 'high-confidence',
  },
  {
    id: 's-tech-phone-dead', fa: 'گوشیم شارژ نداره، باید وصلش کنم.', translit: 'gushiam shārj nadāre, bāyad vasl-esh konam.',
    en: 'My phone has no battery, I need to plug it in.', literalEn: 'my-phone charge it-has-not, must connect-it I-do',
    register: 'colloquial', level: 4,
    words: [
      { fa: 'گوشیم شارژ نداره', translit: 'gushiam shārj nadāre', en: 'my phone has no battery', vocabId: 'tech2-sharj' },
      { fa: 'باید وصلش کنم', translit: 'bāyad vasl-esh konam', en: 'I need to plug it in', vocabId: 'tech2-vasl-shodan' },
    ],
    grammarConceptIds: ['g-modals'], vocabIds: ['tech2-sharj', 'tech2-vasl-shodan'],
    confidence: 'high-confidence',
  },
]
