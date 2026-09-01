import { useEffect } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { applyTheme } from './lib/theme'
import { AppShell } from './components/layout/AppShell'
import { Onboarding } from './components/onboarding/Onboarding'
import { Dashboard } from './screens/Dashboard'
import { LessonMap } from './screens/LessonMap'
import { UnitDetail } from './screens/UnitDetail'
import { LessonPlayer } from './screens/LessonPlayer'
import { ReviewSession } from './screens/ReviewSession'
import { FocusedSession } from './screens/FocusedSession'
import { AlphabetOverview } from './screens/Alphabet/AlphabetOverview'
import { AlphabetLetterDetail } from './screens/Alphabet/AlphabetLetterDetail'
import { Dictionary } from './screens/Dictionary'
import { ProgressSettings } from './screens/ProgressSettings'
import { Stats } from './screens/Stats'
import { NotFound } from './screens/NotFound'
import { getSettings } from './storage/db'

/** HashRouter, deliberately: GitHub Pages serves static files with no
 *  server-side rewrite rule, so a path-based route like /review would
 *  404 on a hard refresh or direct link. Hash routes (#/review) never hit
 *  the server for anything but index.html, so they just work everywhere
 *  this app is hosted without any extra Pages configuration. */
export default function App() {
  // Gate the whole app behind onboarding until it's complete, per the
  // `onboardingComplete` setting — returning users (already true) skip
  // straight to the router below, exactly as before onboarding existed.
  const settings = useLiveQuery(() => getSettings(), [])

  // Applied as a side effect (not read straight from CSS) so an explicit
  // in-app choice can override the OS `prefers-color-scheme` — see
  // lib/theme.ts and index.css's data-theme selectors.
  useEffect(() => {
    applyTheme(settings?.theme ?? 'system')
  }, [settings?.theme])

  if (settings === undefined) return null

  if (!settings.onboardingComplete) {
    return (
      <Onboarding
        onFinish={(destination) => {
          window.location.hash = destination === 'lesson' ? '#/lesson' : '#/'
        }}
      />
    )
  }

  return (
    <HashRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Dashboard />} />
          <Route path="learn" element={<LessonMap />} />
          <Route path="learn/:unitId" element={<UnitDetail />} />
          <Route path="lesson" element={<LessonPlayer />} />
          <Route path="review" element={<ReviewSession />} />
          <Route path="focused" element={<FocusedSession />} />
          <Route path="alphabet" element={<AlphabetOverview />} />
          <Route path="alphabet/:letterId" element={<AlphabetLetterDetail />} />
          <Route path="dictionary" element={<Dictionary />} />
          <Route path="progress" element={<ProgressSettings />} />
          <Route path="stats" element={<Stats />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
