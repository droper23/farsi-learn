/**
 * Mastery & statistics (Phase B2) — pure functions over review states and
 * content, so they're easy to unit test and reused as-is by the Stats
 * screen. Deliberately derived from data that already exists
 * (`reviewStates`, `learningEvents`, curriculum units) rather than adding
 * new analytics-style tracking tables.
 */
import type { AlphabetLetter, Unit, VocabCategory, VocabItem } from '../content/types'
import type { ReviewState } from '../srs/types'

// ---------------------------------------------------------------------------
// Per-category vocabulary progress
// ---------------------------------------------------------------------------

export interface CategoryProgress {
  category: VocabCategory
  total: number
  /** Has any SRS state at all (taught or saved) — out of "new". */
  introduced: number
  /** In the 'review' state with a healthy interval — a reasonable proxy
   *  for "the learner reliably gets this right now". */
  mastered: number
}

/** Single definition of "mastered", shared by every screen that shows a
 *  mastered count (Stats' letter/category grids, Profile's "Learning
 *  stats"). Previously Profile used a different threshold (60 days) than
 *  Stats (21 days), so the same data produced two different "mastered"
 *  numbers on adjacent screens — see review M1. */
export const MASTERED_INTERVAL_DAYS = 21

export function isMastered(state: ReviewState | undefined): boolean {
  return state?.state === 'review' && state.intervalDays >= MASTERED_INTERVAL_DAYS
}

export function categoryProgress(vocabulary: VocabItem[], reviewStates: ReviewState[]): CategoryProgress[] {
  // Suspended items (H3 — learner explicitly opted out) shouldn't count as
  // "introduced" or "mastered" — they're absent from the review queue.
  const stateByItemId = new Map<string, ReviewState>()
  for (const s of reviewStates) if (s.kind === 'vocab' && !s.suspended) stateByItemId.set(s.itemId, s)

  const byCategory = new Map<VocabCategory, CategoryProgress>()
  for (const v of vocabulary) {
    const row = byCategory.get(v.category) ?? { category: v.category, total: 0, introduced: 0, mastered: 0 }
    row.total += 1
    const state = stateByItemId.get(v.id)
    if (state) {
      row.introduced += 1
      if (isMastered(state)) row.mastered += 1
    }
    byCategory.set(v.category, row)
  }
  return [...byCategory.values()].sort((a, b) => b.total - a.total)
}

// ---------------------------------------------------------------------------
// Letter mastery
// ---------------------------------------------------------------------------

export type LetterMasteryLevel = 'not-started' | 'introduced' | 'review' | 'mastered'

export function letterMasteryLevel(state: ReviewState | undefined): LetterMasteryLevel {
  if (!state) return 'not-started'
  if (state.state === 'new') return 'not-started'
  if (isMastered(state)) return 'mastered'
  if (state.state === 'review') return 'review'
  return 'introduced' // learning / relearning
}

export interface LetterMastery {
  letter: AlphabetLetter
  level: LetterMasteryLevel
}

export function letterMastery(alphabet: AlphabetLetter[], reviewStates: ReviewState[]): LetterMastery[] {
  const stateByItemId = new Map<string, ReviewState>()
  for (const s of reviewStates) if (s.kind === 'alphabet' && !s.suspended) stateByItemId.set(s.itemId, s)
  return alphabet
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((letter) => ({ letter, level: letterMasteryLevel(stateByItemId.get(letter.id)) }))
}

// ---------------------------------------------------------------------------
// Streak calendar (current month heat view)
// ---------------------------------------------------------------------------

function localDayKey(ts: number): string {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Set of yyyy-mm-dd day keys (local time) that had at least one learning
 *  event, restricted to the calendar month containing `monthAnchor`. */
export function studiedDaysInMonth(eventTimestamps: number[], monthAnchor: Date): Set<string> {
  const year = monthAnchor.getFullYear()
  const month = monthAnchor.getMonth()
  const days = new Set<string>()
  for (const ts of eventTimestamps) {
    const d = new Date(ts)
    if (d.getFullYear() === year && d.getMonth() === month) days.add(localDayKey(ts))
  }
  return days
}

/** All day keys in the calendar month containing `monthAnchor`, in order. */
export function daysInMonth(monthAnchor: Date): string[] {
  const year = monthAnchor.getFullYear()
  const month = monthAnchor.getMonth()
  const lastDay = new Date(year, month + 1, 0).getDate()
  const days: string[] = []
  for (let d = 1; d <= lastDay; d++) {
    days.push(`${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`)
  }
  return days
}

// ---------------------------------------------------------------------------
// "Days to finish the curriculum" estimate
// ---------------------------------------------------------------------------

/** Every distinct teachable content id across every unit (alphabet + vocab
 *  + grammar + sentence + the sentences inside referenced passages), since
 *  that's what actually consumes a "new item" slot when introduced. */
export function totalTeachableItemIds(units: Unit[], passageSentenceIds: (passageId: string) => string[]): Set<string> {
  const ids = new Set<string>()
  for (const u of units) {
    for (const id of u.alphabetIds ?? []) ids.add(`alphabet:${id}`)
    for (const id of u.vocabIds ?? []) ids.add(`vocab:${id}`)
    for (const id of u.grammarConceptIds ?? []) ids.add(`grammar:${id}`)
    for (const id of u.sentenceIds ?? []) ids.add(`sentence:${id}`)
    for (const pid of u.passageIds ?? []) for (const sid of passageSentenceIds(pid)) ids.add(`sentence:${sid}`)
  }
  return ids
}

export interface CurriculumEstimate {
  totalItems: number
  introducedItems: number
  remainingItems: number
  newItemsPerDay: number
  /** null when there's nothing left, or newItemsPerDay is 0 (can't estimate). */
  estimatedDays: number | null
}

export function estimateDaysToFinish(totalItemIds: Set<string>, introducedKeys: Set<string>, newItemsPerDay: number): CurriculumEstimate {
  const totalItems = totalItemIds.size
  let introducedItems = 0
  for (const id of totalItemIds) if (introducedKeys.has(id)) introducedItems += 1
  const remainingItems = Math.max(0, totalItems - introducedItems)
  const estimatedDays = remainingItems === 0 ? 0 : newItemsPerDay > 0 ? Math.ceil(remainingItems / newItemsPerDay) : null
  return { totalItems, introducedItems, remainingItems, newItemsPerDay, estimatedDays }
}
