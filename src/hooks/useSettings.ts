import { useLiveQuery } from 'dexie-react-hooks'
import { db, DEFAULT_SETTINGS } from '../storage/db'

/** Reactive settings — re-renders automatically whenever the settings row
 *  changes in IndexedDB, from this tab or (via Dexie's storage events) any
 *  other open tab. */
export function useSettings() {
  const settings = useLiveQuery(() => db.settings.get('app-settings'), [])
  return settings ?? DEFAULT_SETTINGS
}
