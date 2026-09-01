import { db, getSettings, updateSettings } from './db'
import { applyRating, isDue, introducedToday, newReviewState } from '../srs/scheduler'
import { DEFAULT_SCHEDULER_CONFIG, type ReviewRating, type ReviewState, type SchedulerConfig } from '../srs/types'
import { reviewableKey, type ReviewableKind } from '../content/types'

export async function getSchedulerConfig(): Promise<SchedulerConfig> {
  const s = await getSettings()
  return { ...DEFAULT_SCHEDULER_CONFIG, newItemsPerDay: s.newItemsPerDay, maxReviewsPerDay: s.maxReviewsPerDay }
}

export async function getOrCreateReviewState(kind: ReviewableKind, itemId: string, now = Date.now()): Promise<ReviewState> {
  const key = reviewableKey(kind, itemId)
  const existing = await db.reviewStates.get(key)
  if (existing) return existing
  const fresh = newReviewState(key, kind, itemId, now)
  await db.reviewStates.put(fresh)
  return fresh
}

export async function getReviewStates(kind?: ReviewableKind): Promise<ReviewState[]> {
  if (kind) return db.reviewStates.where('kind').equals(kind).toArray()
  return db.reviewStates.toArray()
}

/** Record an answer: advances the SRS state, logs the event, and (once per
 *  calendar day, on the first successful review event) updates the streak. */
export async function recordReview(
  kind: ReviewableKind,
  itemId: string,
  rating: ReviewRating,
  correct: boolean,
  now = Date.now(),
): Promise<ReviewState> {
  const config = await getSchedulerConfig()
  const prev = await getOrCreateReviewState(kind, itemId, now)
  const next = applyRating(prev, rating, config, now)
  await db.reviewStates.put(next)
  await db.learningEvents.add({
    key: next.key, kind, itemId, rating, correct, timestamp: now,
  })
  await trimLearningEvents(now)
  await bumpStreak(now)
  return next
}

/** `learningEvents` is append-only and otherwise grows forever (see H2 in
 *  the 2026-09-01 review): every review adds a row, nothing removed them,
 *  and the whole log is serialized into both the local export/backup and
 *  the single Firestore doc `uploadProgress` writes — which caps out at
 *  1 MiB and would silently break cloud sync after roughly 5-10k reviews.
 *  Keep only recent history; the dashboard's "recent mix-ups" widget only
 *  ever reads the newest 200 events (see getRecentMistakes). A ranged
 *  delete on the `timestamp` index is cheap, so this runs on every review. */
export const LEARNING_EVENT_RETENTION_DAYS = 90
export const MAX_LEARNING_EVENTS = 2000

async function trimLearningEvents(now: number): Promise<void> {
  const cutoff = now - LEARNING_EVENT_RETENTION_DAYS * 86_400_000
  await db.learningEvents.where('timestamp').below(cutoff).delete()

  const count = await db.learningEvents.count()
  if (count <= MAX_LEARNING_EVENTS) return
  const excess = count - MAX_LEARNING_EVENTS
  const oldestKeys = await db.learningEvents.orderBy('timestamp').limit(excess).primaryKeys()
  await db.learningEvents.bulkDelete(oldestKeys)
}

async function bumpStreak(now: number) {
  const day = localDayKey(now)
  const settings = await getSettings()
  if (settings.lastStudyDay === day) return // already counted today

  const yesterday = localDayKey(now - 86_400_000)
  const continuing = settings.lastStudyDay === yesterday
  const currentStreak = continuing ? settings.currentStreak + 1 : 1
  await updateSettings({
    lastStudyDay: day,
    currentStreak,
    longestStreak: Math.max(settings.longestStreak, currentStreak),
  })
}

function localDayKey(ts: number): string {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export interface DueSummary {
  learningDue: ReviewState[]
  reviewDue: ReviewState[]
  newAvailable: ReviewState[]
  /** Count of items introduced (moved out of "new") today, regardless of
   *  their current state. Used both to cap how many new items are offered
   *  and to show real "X of Y new items today" progress on the dashboard. */
  introducedTodayCount: number
}

/** Split all known review states into learning-due / review-due / new,
 *  applying the daily new-item cap and per-day review cap. Ordering within
 *  each bucket favors the most overdue and, for reviews, the most
 *  lapse-prone items first — struggling material resurfaces sooner. */
export async function getDueSummary(now = Date.now()): Promise<DueSummary> {
  const config = await getSchedulerConfig()
  const all = await db.reviewStates.toArray()

  const learningDue = all
    .filter((s) => (s.state === 'learning' || s.state === 'relearning') && isDue(s, now))
    .sort((a, b) => a.dueAt - b.dueAt)

  const allReviewDue = all
    .filter((s) => s.state === 'review' && isDue(s, now))
    .sort((a, b) => b.lapseCount - a.lapseCount || a.dueAt - b.dueAt)
  const reviewDue = allReviewDue.slice(0, config.maxReviewsPerDay)

  // `lastIntroducedDay` is stamped once, the moment an item's first rating
  // moves it *out* of the 'new' state (see scheduler.ts `step`), and is
  // never cleared — so an item introduced today is essentially never still
  // 'new' by the time we check. Counting must NOT also require state ===
  // 'new', or the daily new-item cap silently never triggers.
  const introducedTodayCount = all.filter((s) => introducedToday(s, now)).length
  const remainingNewSlots = Math.max(0, config.newItemsPerDay - introducedTodayCount)
  const newAvailable = all
    .filter((s) => s.state === 'new')
    .slice(0, remainingNewSlots)

  return { learningDue, reviewDue, newAvailable, introducedTodayCount }
}

export async function getRecentMistakes(limit = 10) {
  const events = await db.learningEvents.orderBy('timestamp').reverse().limit(200).toArray()
  const mistakes = events.filter((e) => !e.correct)
  const seen = new Set<string>()
  const result = []
  for (const m of mistakes) {
    if (seen.has(m.key)) continue
    seen.add(m.key)
    result.push(m)
    if (result.length >= limit) break
  }
  return result
}

export async function suspendItem(kind: ReviewableKind, itemId: string, suspended: boolean) {
  const key = reviewableKey(kind, itemId)
  const existing = await db.reviewStates.get(key)
  if (!existing) return
  await db.reviewStates.put({ ...existing, suspended, updatedAt: Date.now() })
}
