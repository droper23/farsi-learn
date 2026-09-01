import type { Passage } from '../types'
import { passages } from './passages'

export { passages }

const passageById = new Map(passages.map((p) => [p.id, p]))

export function findPassage(id: string): Passage | undefined {
  return passageById.get(id)
}
