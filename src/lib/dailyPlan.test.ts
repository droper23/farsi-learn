import { describe, expect, it } from 'vitest'
import { recommendDailyPlan } from './dailyPlan'

describe('recommendDailyPlan', () => {
  it('recommends nothing when fully caught up and no lesson available', () => {
    const plan = recommendDailyPlan({ reviewsDue: 0, hasLesson: false, newItemsToday: 0, newItemsCap: 15 })
    expect(plan.steps).toEqual([])
    expect(plan.headline).toMatch(/caught up/i)
  })

  it('recommends nothing actionable once the new-item goal is hit and no reviews are due', () => {
    const plan = recommendDailyPlan({ reviewsDue: 0, hasLesson: true, newItemsToday: 15, newItemsCap: 15 })
    expect(plan.steps).toEqual([])
    expect(plan.headline).toMatch(/new-item goal/i)
  })

  it('puts a large review queue first even when a lesson is available', () => {
    const plan = recommendDailyPlan({ reviewsDue: 25, hasLesson: true, newItemsToday: 0, newItemsCap: 15 })
    expect(plan.steps[0].action).toBe('review')
    expect(plan.steps[1]?.action).toBe('lesson')
  })

  it('does not offer a lesson once the daily new-item cap is reached, even with a large queue', () => {
    const plan = recommendDailyPlan({ reviewsDue: 25, hasLesson: true, newItemsToday: 15, newItemsCap: 15 })
    expect(plan.steps).toEqual([{ action: 'review', reason: expect.stringContaining('25 reviews') }])
  })

  it('leads with a lesson when new-item room remains and the review queue is small', () => {
    const plan = recommendDailyPlan({ reviewsDue: 5, hasLesson: true, newItemsToday: 3, newItemsCap: 15 })
    expect(plan.steps[0].action).toBe('lesson')
    expect(plan.steps[1]?.action).toBe('review')
  })

  it('recommends a lesson alone when there are no reviews due', () => {
    const plan = recommendDailyPlan({ reviewsDue: 0, hasLesson: true, newItemsToday: 0, newItemsCap: 15 })
    expect(plan.steps).toEqual([{ action: 'lesson', reason: expect.any(String) }])
  })

  it('recommends reviews alone when the new-item cap is reached but reviews remain', () => {
    const plan = recommendDailyPlan({ reviewsDue: 4, hasLesson: true, newItemsToday: 15, newItemsCap: 15 })
    expect(plan.steps).toEqual([{ action: 'review', reason: expect.any(String) }])
  })

  it('never recommends a lesson when none is available, regardless of new-item room', () => {
    const plan = recommendDailyPlan({ reviewsDue: 3, hasLesson: false, newItemsToday: 0, newItemsCap: 15 })
    expect(plan.steps.every((s) => s.action !== 'lesson')).toBe(true)
  })
})
