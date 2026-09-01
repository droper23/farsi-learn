import type { VocabItem } from '../types'
import { greetingsVocab } from './greetings'
import { pronounsVocab } from './pronounsIntroductions'
import { numbersVocab } from './numbers'
import { familyVocab } from './family'
import { questionWordsVocab, connectorsPrepositionsVocab } from './questionsConnectors'
import { verbsCoreVocab } from './verbsCore'
import { foodVocab } from './food'
import { adjectivesVocab, adverbsVocab } from './adjectivesAdverbs'
import { colorsVocab, bodyVocab, natureVocab } from './colorsBodyNature'
import { timeDatesVocab } from './timeDates'
import { travelVocab, housingVocab } from './travelHousing'
import { workVocab, schoolVocab, technologyVocab } from './workSchoolTech'
import { healthVocab, emotionsVocab, shoppingVocab } from './healthEmotionsShopping'
import { expressionsVocab, dailyActivitiesVocab } from './expressions'
import { discourseMarkersVocab, idiomsVocab } from './upperIntermediate'
import { weatherVocab } from './weatherNature'
import { bodyHealthVocab } from './bodyHealth'
import { workTechVocab } from './workTech'

export const vocabulary: VocabItem[] = [
  ...greetingsVocab,
  ...pronounsVocab,
  ...numbersVocab,
  ...familyVocab,
  ...questionWordsVocab,
  ...connectorsPrepositionsVocab,
  ...verbsCoreVocab,
  ...foodVocab,
  ...adjectivesVocab,
  ...adverbsVocab,
  ...colorsVocab,
  ...bodyVocab,
  ...natureVocab,
  ...timeDatesVocab,
  ...travelVocab,
  ...housingVocab,
  ...workVocab,
  ...schoolVocab,
  ...technologyVocab,
  ...healthVocab,
  ...emotionsVocab,
  ...shoppingVocab,
  ...expressionsVocab,
  ...dailyActivitiesVocab,
  ...discourseMarkersVocab,
  ...idiomsVocab,
  ...weatherVocab,
  ...bodyHealthVocab,
  ...workTechVocab,
]

const vocabById = new Map(vocabulary.map((v) => [v.id, v]))

export function findVocab(id: string): VocabItem | undefined {
  return vocabById.get(id)
}

export function vocabByCategory(category: VocabItem['category']): VocabItem[] {
  return vocabulary.filter((v) => v.category === category)
}
