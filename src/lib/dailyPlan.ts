/**
 * Daily plan / smart guidance (dashboard "Today" card, Phase B1).
 *
 * A small, honest, pure recommendation function — no notifications, no
 * gamification, just "given what's due and what's available, what should
 * you probably do first". Respects the learner's own settings
 * (newItemsPerDay via `newItemsCap`, maxReviewsPerDay indirectly via
 * `reviewsDue` which the caller already caps — see getDueSummary) and the
 * standing decision that lessons always teach a full unit chunk (this
 * function only orders *whether* to suggest a lesson, never how much of it
 * to show — the new-items cap is deliberately NOT wired into lesson
 * pagination, see PROGRESS.md).
 */

export type PlanAction = 'review' | 'lesson'

export interface DailyPlanStep {
  action: PlanAction
  /** Short, plain-language reason shown under the recommendation. */
  reason: string
}

export interface DailyPlanInput {
  reviewsDue: number
  hasLesson: boolean
  newItemsToday: number
  newItemsCap: number
}

export interface DailyPlan {
  /** Ordered recommendation — 0, 1, or 2 entries. Empty means "nothing to
   *  do right now, you're caught up". */
  steps: DailyPlanStep[]
  headline: string
}

/** Once the due-review queue reaches this size, reviews jump to the front
 *  regardless of remaining new-item room — an unattended review queue is
 *  the thing most likely to snowball into "too much to catch up on". */
const LARGE_QUEUE_THRESHOLD = 20

export function recommendDailyPlan(input: DailyPlanInput): DailyPlan {
  const remainingNewSlots = Math.max(0, input.newItemsCap - input.newItemsToday)
  const canStartLesson = input.hasLesson && remainingNewSlots > 0
  const steps: DailyPlanStep[] = []

  if (input.reviewsDue === 0 && !canStartLesson) {
    const headline = input.hasLesson ? "You've hit today's new-item goal" : "You're all caught up"
    return { steps, headline }
  }

  if (input.reviewsDue >= LARGE_QUEUE_THRESHOLD) {
    // Large queue: clear it first no matter what, to stop it snowballing.
    steps.push({ action: 'review', reason: `${input.reviewsDue} reviews are due — clearing these first keeps your queue from piling up.` })
    if (canStartLesson) steps.push({ action: 'lesson', reason: "Then a lesson, since you're still under today's new-item goal." })
  } else if (canStartLesson && input.reviewsDue === 0) {
    steps.push({ action: 'lesson', reason: `You're under today's ${input.newItemsCap}-new-item goal and have no reviews due — good time for a lesson.` })
  } else if (canStartLesson) {
    // Small queue and room for new material: flexible, but lead with the
    // lesson so new items get spaced-repetition exposure sooner rather
    // than later in the day.
    steps.push({ action: 'lesson', reason: `You're under today's ${input.newItemsCap}-new-item goal — a lesson first keeps new material fresh.` })
    steps.push({ action: 'review', reason: `${input.reviewsDue} review${input.reviewsDue === 1 ? '' : 's'} due whenever you're ready.` })
  } else {
    steps.push({ action: 'review', reason: `${input.reviewsDue} review${input.reviewsDue === 1 ? '' : 's'} due.` })
  }

  const headline = steps[0]?.action === 'review' ? 'Start with reviews' : 'Start with a lesson'
  return { steps, headline }
}
