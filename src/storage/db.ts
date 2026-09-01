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
  /** Last-modified timestamp, for cloud-sync merging (see
   *  storage/backup.ts). Falls back to `createdAt` where absent (older
   *  records/backups predating this field). */
  updatedAt?: number
}

/** One row per learning event, for the "recent mistakes" dashboard widget
 *  and lightweight stats. Not a full audit log — trimmed on every write by
 *  progressRepo.ts `recordReview` (see LEARNING_EVENT_RETENTION_DAYS /
 *  MAX_LEARNING_EVENTS there) so it can't grow without bound. */
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
  /** Shows short-vowel diacritics (harakat/e'rab) on Persian text that has
   *  them authored — see content/diacriticsManifest.ts. Off by default:
   *  ordinary Persian writing omits these, so most real-world text a
   *  learner encounters won't have them either; this is an optional
   *  training-wheels view, not the default reading experience. */
  showDiacritics: boolean
  reducedMotion: boolean
  newItemsPerDay: number
  maxReviewsPerDay: number
  currentStreak: number
  longestStreak: number
  lastStudyDay?: string
  onboardingComplete: boolean
  /** 'system' (default) follows the OS `prefers-color-scheme`; 'light'/
   *  'dark' is an explicit override — see src/lib/theme.ts. */
  theme?: 'system' | 'light' | 'dark'
  /** Set on every settings write; used for last-write-wins cloud-sync
   *  merging (see storage/backup.ts mergePayloads). Optional so old
   *  backups/rows without it still import — treated as "very old" (0). */
  updatedAt?: number
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
  showDiacritics: false,
  reducedMotion: false,
  newItemsPerDay: 15,
  maxReviewsPerDay: 150,
  currentStreak: 0,
  longestStreak: 0,
  onboardingComplete: false,
  theme: 'system',
}

/** Pure read, safe to call from useLiveQuery — never writes. Falls back to
 *  in-memory defaults until the row is created (see ensureSettingsRow). */
export async function getSettings(): Promise<SettingsRow> {
  const row = await db.settings.get('app-settings')
  return row ?? DEFAULT_SETTINGS
}

/** Creates the settings row if it doesn't exist yet. Called once at app
 *  startup — kept separate from getSettings() because Dexie's useLiveQuery
 *  runs its querier in a read-only transaction and throws on any write. */
export async function ensureSettingsRow(): Promise<void> {
  const row = await db.settings.get('app-settings')
  if (!row) await db.settings.put(DEFAULT_SETTINGS)
}

export async function updateSettings(patch: Partial<SettingsRow>): Promise<SettingsRow> {
  const current = await getSettings()
  const next = { ...current, ...patch, updatedAt: Date.now() }
  await db.settings.put(next)
  return next
}
