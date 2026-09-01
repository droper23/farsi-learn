import type { CEFRLevel, Unit } from '../types'
import { levels } from './levels'
import { units } from './units'

export { levels, units }

const unitsByLevel = new Map<CEFRLevel, Unit[]>()
for (const u of units) {
  const list = unitsByLevel.get(u.level) ?? []
  list.push(u)
  unitsByLevel.set(u.level, list)
}
for (const list of unitsByLevel.values()) list.sort((a, b) => a.order - b.order)

export function unitsForLevel(level: CEFRLevel): Unit[] {
  return unitsByLevel.get(level) ?? []
}

const unitById = new Map(units.map((u) => [u.id, u]))

export function findUnit(id: string): Unit | undefined {
  return unitById.get(id)
}

export function nextUnit(id: string): Unit | undefined {
  const sorted = [...units].sort((a, b) => a.level - b.level || a.order - b.order)
  const idx = sorted.findIndex((u) => u.id === id)
  return idx >= 0 ? sorted[idx + 1] : undefined
}

export const allUnitsSorted: Unit[] = [...units].sort((a, b) => a.level - b.level || a.order - b.order)
