import type { ExampleSentence } from '../types'
import { basicsSentences } from './basics'
import { presentTenseSentences, pastTenseSentences } from './presentPast'
import { grammarFocusSentences } from './grammarFocus'
import { grammarExampleSentences, cafeDialogueSentences, catchupDialogueSentences } from './upperIntermediate'
import { thinSpotSentences } from './thinSpots'
import { passageSentences } from './passages'

export const sentences: ExampleSentence[] = [
  ...basicsSentences,
  ...presentTenseSentences,
  ...pastTenseSentences,
  ...grammarFocusSentences,
  ...grammarExampleSentences,
  ...cafeDialogueSentences,
  ...catchupDialogueSentences,
  ...thinSpotSentences,
  ...passageSentences,
]

const sentenceById = new Map(sentences.map((s) => [s.id, s]))

export function findSentence(id: string): ExampleSentence | undefined {
  return sentenceById.get(id)
}
