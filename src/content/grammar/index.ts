import type { GrammarConcept } from '../types'
import { grammarConcepts } from './concepts'

export const grammar: GrammarConcept[] = grammarConcepts

const grammarById = new Map(grammar.map((g) => [g.id, g]))

export function findGrammarConcept(id: string): GrammarConcept | undefined {
  return grammarById.get(id)
}
