import { HashRouter, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { Dashboard } from './screens/Dashboard'
import { LessonMap } from './screens/LessonMap'
import { UnitDetail } from './screens/UnitDetail'
import { LessonPlayer } from './screens/LessonPlayer'
import { ReviewSession } from './screens/ReviewSession'
import { AlphabetOverview } from './screens/Alphabet/AlphabetOverview'
import { AlphabetLetterDetail } from './screens/Alphabet/AlphabetLetterDetail'
import { Dictionary } from './screens/Dictionary'
import { ProgressSettings } from './screens/ProgressSettings'
import { NotFound } from './screens/NotFound'

/** HashRouter, deliberately: GitHub Pages serves static files with no
 *  server-side rewrite rule, so a path-based route like /review would
 *  404 on a hard refresh or direct link. Hash routes (#/review) never hit
 *  the server for anything but index.html, so they just work everywhere
 *  this app is hosted without any extra Pages configuration. */
export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Dashboard />} />
          <Route path="learn" element={<LessonMap />} />
          <Route path="learn/:unitId" element={<UnitDetail />} />
          <Route path="lesson" element={<LessonPlayer />} />
          <Route path="review" element={<ReviewSession />} />
          <Route path="alphabet" element={<AlphabetOverview />} />
          <Route path="alphabet/:letterId" element={<AlphabetLetterDetail />} />
          <Route path="dictionary" element={<Dictionary />} />
          <Route path="progress" element={<ProgressSettings />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
