import type { ExampleSentence } from '../types'
import { basicsSentences } from './basics'
import { presentTenseSentences, pastTenseSentences } from './presentPast'
import { grammarFocusSentences } from './grammarFocus'

export const sentences: ExampleSentence[] = [
  ...basicsSentences,
  ...presentTenseSentences,
  ...pastTenseSentences,
  ...grammarFocusSentences,
]

const sentenceById = new Map(sentences.map((s) => [s.id, s]))

export function findSentence(id: string): ExampleSentence | undefined {
  return sentenceById.get(id)
}
