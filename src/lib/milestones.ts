/**
 * Lightweight, non-competitive milestones (Phase C1). No XP, no points, no
 * leaderboards — just real learning milestones computed from data that
 * already exists (reviewStates, unitProgress, settings.currentStreak),
 * per the standing "streak + daily goals are the core motivation" brief.
 */
import type { CEFRLevel, Unit } from '../content/types'
import type { ReviewState } from '../srs/types'
import { letterMasteryLevel } from './mastery'

export interface UnitProgressLike {
  unitId: string
  lessonsCompleted: number
}

export interface MilestonesInput {
  reviewStates: ReviewState[]
  unitProgress: UnitProgressLike[]
  units: Unit[]
  currentStreak: number
  longestStreak: number
  totalAlphabetLetters: number
}

export interface Milestone {
  id: string
  title: string
  description: string
  achieved: boolean
}

const STREAK_MILESTONES = [7, 30, 100, 365]

export function computeMilestones(input: MilestonesInput): Milestone[] {
  const { reviewStates, unitProgress, units, currentStreak, longestStreak, totalAlphabetLetters } = input
  const milestones: Milestone[] = []

  // Alphabet mastered: every letter has reached 'review' or 'mastered'.
  const alphabetStates = reviewStates.filter((s) => s.kind === 'alphabet')
  const alphabetMasteredCount = alphabetStates.filter((s) => {
    const level = letterMasteryLevel(s)
    return level === 'review' || level === 'mastered'
  }).length
  milestones.push({
    id: 'alphabet-mastered',
    title: 'Alphabet mastered',
    description: `Learned to recognize all ${totalAlphabetLetters} Persian letters reliably.`,
    achieved: totalAlphabetLetters > 0 && alphabetMasteredCount >= totalAlphabetLetters,
  })

  // Word-count milestones.
  const vocabCount = reviewStates.filter((s) => s.kind === 'vocab').length
  for (const n of [50, 100, 250, 500]) {
    milestones.push({
      id: `words-${n}`,
      title: `First ${n} words`,
      description: `Started learning ${n} or more vocabulary words.`,
      achieved: vocabCount >= n,
    })
  }

  // First sentence.
  const sentenceCount = reviewStates.filter((s) => s.kind === 'sentence').length
  milestones.push({
    id: 'first-sentence',
    title: 'First sentence',
    description: 'Learned your first complete Persian sentence.',
    achieved: sentenceCount >= 1,
  })

  // Level-complete milestones — every unit in the level has all its lessons done.
  const lessonsCompletedByUnit = new Map(unitProgress.map((p) => [p.unitId, p.lessonsCompleted]))
  const levelsPresent = [...new Set(units.map((u) => u.level))].sort((a, b) => a - b) as CEFRLevel[]
  for (const level of levelsPresent) {
    const levelUnits = units.filter((u) => u.level === level)
    const complete = levelUnits.length > 0 && levelUnits.every((u) => (lessonsCompletedByUnit.get(u.id) ?? 0) >= u.lessonCount)
    milestones.push({
      id: `level-${level}-complete`,
      title: `Level ${level} complete`,
      description: `Finished every unit in Level ${level}.`,
      achieved: complete,
    })
  }

  // Streak milestones — based on the best streak ever reached, so a
  // once-hit milestone stays "achieved" even after a streak later resets.
  const bestStreak = Math.max(currentStreak, longestStreak)
  for (const n of STREAK_MILESTONES) {
    milestones.push({
      id: `streak-${n}`,
      title: `${n}-day streak`,
      description: `Studied ${n} days in a row.`,
      achieved: bestStreak >= n,
    })
  }

  return milestones
}

/** Milestones newly achieved in `next` that were not achieved in `prev` —
 *  used to decide whether to show a "you just hit a milestone" banner
 *  without persisting any new tracking state (recomputed from the same
 *  data every time, compared against what was true a moment ago). */
export function newlyAchieved(prev: Milestone[], next: Milestone[]): Milestone[] {
  const prevAchieved = new Set(prev.filter((m) => m.achieved).map((m) => m.id))
  return next.filter((m) => m.achieved && !prevAchieved.has(m.id))
}
