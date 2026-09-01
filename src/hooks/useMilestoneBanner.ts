import { useEffect, useState } from 'react'
import type { Milestone } from '../lib/milestones'
import { newlyAchieved } from '../lib/milestones'

const STORAGE_KEY = 'farsi-learn-celebrated-milestones'

function readCelebrated(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}

function writeCelebrated(ids: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]))
  } catch {
    // Private browsing / storage disabled — the banner just won't persist
    // "already seen" across reloads, which is a harmless degradation.
  }
}

/** Shows a calm "you just reached a milestone" banner the first time a
 *  milestone flips to achieved, then remembers it was shown (in
 *  localStorage, a per-device UI flag — deliberately NOT a new Dexie
 *  tracking table, since milestone achievement is already fully derivable
 *  from existing data every time this hook runs). */
export function useMilestoneBanner(milestones: Milestone[] | null): { banner: Milestone | null; dismiss: () => void } {
  const [banner, setBanner] = useState<Milestone | null>(null)

  useEffect(() => {
    if (!milestones) return
    const celebrated = readCelebrated()
    const prevAsUncelebrated = milestones.map((m) => ({ ...m, achieved: m.achieved && celebrated.has(m.id) }))
    const fresh = newlyAchieved(prevAsUncelebrated, milestones)
    if (fresh.length > 0) {
      setBanner(fresh[0])
      const next = new Set(celebrated)
      for (const m of milestones) if (m.achieved) next.add(m.id)
      writeCelebrated(next)
    }
    // Only re-run when the set of achieved ids actually changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [milestones?.filter((m) => m.achieved).map((m) => m.id).join(',')])

  return { banner, dismiss: () => setBanner(null) }
}
