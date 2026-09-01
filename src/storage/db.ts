import Dexie, { type EntityTable } from 'dexie'
import type { ReviewState } from '../srs/types'
import type { ReviewableKey, ReviewableKind } from '../content/types'

/** A learner-saved word or phrase — either bookmarking an existing vocab
 *  item ("I keep forgetting this") or a fully custom entry the learner
 *  typed in themselves. Custom entries are learner-authored, not
 *  linguistically vetted content, and are labeled as such in the UI. */
export interface SavedItem {
  id: string
  vocabId?: string
  fa: string
  translit: string
  en: string
  note?: string
  createdAt: number
}

/** One row per learning event, for the "recent mistakes" dashboard widget
 *  and lightweight stats. Not a full audit log — trimmed periodically. */
export interface LearningEvent {
  id?: number
  key: ReviewableKey
  kind: ReviewableKind
  itemId: string
  rating: 'again' | 'hard' | 'good' | 'easy'
  correct: boolean
  timestamp: number
}

export interface UnitProgress {
  unitId: string
  lessonsCompleted: number
  updatedAt: number
}

export interface SettingsRow {
  id: 'app-settings'
  showTransliteration: boolean
  reducedMotion: boolean
  newItemsPerDay: number
  maxReviewsPerDay: number
  currentStreak: number
  longestStreak: number
  lastStudyDay?: string
  onboardingComplete: boolean
}

class FarsiLearnDB extends Dexie {
  reviewStates!: EntityTable<ReviewState, 'key'>
  savedItems!: EntityTable<SavedItem, 'id'>
  learningEvents!: EntityTable<LearningEvent, 'id'>
  unitProgress!: EntityTable<UnitProgress, 'unitId'>
  settings!: EntityTable<SettingsRow, 'id'>

  constructor() {
    super('farsi-learn')
    this.version(1).stores({
      reviewStates: 'key, kind, state, dueAt, itemId',
      savedItems: 'id, vocabId, createdAt',
      learningEvents: '++id, key, kind, timestamp',
      unitProgress: 'unitId',
      settings: 'id',
    })
  }
}

export const db = new FarsiLearnDB()

export const DEFAULT_SETTINGS: SettingsRow = {
  id: 'app-settings',
  showTransliteration: true,
  reducedMotion: false,
  newItemsPerDay: 15,
  maxReviewsPerDay: 150,
  currentStreak: 0,
  longestStreak: 0,
  onboardingComplete: false,
}

export async function getSettings(): Promise<SettingsRow> {
  const row = await db.settings.get('app-settings')
  if (row) return row
  await db.settings.put(DEFAULT_SETTINGS)
  return DEFAULT_SETTINGS
}

export async function updateSettings(patch: Partial<SettingsRow>): Promise<SettingsRow> {
  const current = await getSettings()
  const next = { ...current, ...patch }
  await db.settings.put(next)
  return next
}
