# Farsi Learn — Handoff / Progress Notes

Written for continuity — a future session (human or AI) picking this up
cold should be able to read this and know exactly where things stand.
Last updated: 2026-09-01, end of the fourth pass (UX/UI polish batch —
desktop width cap, onboarding default, locked-unit indicators, filled-in
empty states, nav relabel, category sort/collapse, bigger dictionary tap
targets, nav hidden during lesson/review — plus four new features: a
rule-based verb conjugation trainer, a "practice weak spots" focused study
mode, a Solar Hijri calendar converter + dashboard date widget, and a
grammar-rule self-check quiz) — see "What changed in the fourth pass"
below for the full rundown. The "third pass" and "second pass" sections
further down are kept for history.

## Status: functional, deployed, tested

- Live at https://droper23.github.io/farsi-learn/, auto-deploys on push to
  `main` via `.github/workflows/deploy.yml`.
- `npm run lint && npm run typecheck && npm run test && npm run build` all
  pass clean.
- Manually verified in Chrome (fourth pass, dev server, fresh profile):
  onboarding (confirmed "Steady" 10/day now pre-selected) → dashboard at a
  1440px desktop viewport (content now capped, no more full-bleed
  850px-wide buttons) with the new Solar Hijri date widget → Learn screen
  showing lock icons/dimming on not-yet-reachable units → a locked unit's
  detail page showing a "your current unit" card instead of dead space →
  Dictionary browse-by-category at 3 columns desktop-width, bigger save-
  star tap targets, the 12 new calendar-month entries → a full lesson
  (Everyday Verbs: Present Tense) showing the new per-verb conjugation
  teach table for رفتن/آمدن/خوردن → lesson-complete screen now showing
  streak + "what's next" instead of empty space → mobile-width (420px)
  check confirming the bottom tab bar is entirely absent from the DOM
  during `/lesson` and `/review` (not just CSS-hidden) → multiple review
  sessions that surfaced live conjugation MCQs (both present and past
  tense, graded correctly) and the new grammar-rule quiz ("Which sentence
  demonstrates: Simple present tense: می + stem + ending?", graded
  correctly) → Stats screen's category list showing only started
  categories with a "show all" toggle. Clean console throughout (checked
  via `read_console_messages`), no runtime errors.
- 164 automated tests (up from 124), including new suites for the
  conjugation rule engine, the Solar Hijri calendar converter (verified
  against jalaali-js's own documented examples, publicly reported Nowruz
  dates, and a multi-year round-trip property test), the focused/weak-
  spots session builder, and the grammar-rule MCQ generator — plus two new
  end-to-end smoke tests in `src/App.test.tsx` (the dashboard date widget,
  and a full "practice weak spots" flow from Stats through to a graded
  exercise).

## Architecture decisions worth knowing

- **HashRouter, not BrowserRouter.** GitHub Pages has no server-side
  rewrite rule, so path routes 404 on refresh. This was a deliberate
  trade-off (uglier URLs, zero extra Pages config) over the alternative
  (a `404.html` redirect trick) — see `src/App.tsx` comment.
- **Exercises are generated at runtime from content, never hand-authored
  per item.** `src/lib/exercises/generator.ts` turns a `VocabItem` /
  `AlphabetLetter` / `ExampleSentence` / `GrammarConcept` into an MCQ /
  typed-answer / word-order / matching exercise on the fly, with
  distractors drawn from the same category. This is what makes "add 1000
  more words without touching the UI" actually true.
- **One unified SRS queue across all content types**, keyed by
  `` `${kind}:${itemId}` `` (see `reviewableKey` in `content/types.ts`).
  Alphabet, vocab, grammar, and sentences all live in the same
  `reviewStates` table and the same due-queue logic — not four separate
  systems bolted together.
- **The SM-2-style scheduler (`src/srs/scheduler.ts`) is a pure function**
  ported from the Danki iOS app's `ReviewScheduler.swift`, adapted to a
  flat cross-content-type key instead of per-deck `Flashcard` rows. It has
  no dependency on storage or React and is fully unit tested.
- **Firebase (optional cloud sync) is dynamically `import()`-ed, not
  statically imported**, and excluded from both the PWA precache
  (`workbox.globIgnores`) and Vite's modulepreload injection
  (`build.modulePreload.resolveDependencies`). Getting this wrong the
  first time (see git history) silently forced a ~700KB download on every
  visitor regardless of whether they use cloud sync — worth knowing if you
  add more optional heavy dependencies later.
- **`getSettings()` must never write.** It's called from inside
  `useLiveQuery`, which runs its querier in a read-only Dexie transaction;
  a write throws `ReadOnlyError` and crashes the component silently caught
  only by React's error boundary logging. Settings-row creation is a
  separate `ensureSettingsRow()` call at app boot (`main.tsx`). This exact
  bug was caught by the App.test.tsx smoke test — a good example of why
  that test exists.

## What's inspired by Danki / hungarian-taivuta, and what changed

- **From Danki** (`~/XCode Projects/Danki`, SwiftUI/SwiftData): the SRS
  algorithm shape (states, ease factor, learning/relearning steps, daily
  new/review caps) is a direct port — it's a solid, proven design. Changed:
  flattened per-deck config into one global `SchedulerConfig`; replaced the
  `Flashcard`/`Deck` SwiftData model with a flat `ReviewState` keyed across
  four content kinds, since this app has one implicit "deck" (the whole
  curriculum) rather than user-created decks.
- **From hungarian-taivuta** (`~/code/Hungarian/hungarian-taivuta`, vanilla
  JS): the idea of generating exercises from structured data rather than
  hand-writing each question, and word-level hover/gloss info. Changed
  essentially everything else — that project has no SRS, no persistence, no
  curriculum structure, and is plain JS with global scripts; this app is
  TypeScript/React with a real content model, storage layer, and test
  suite. It was useful as a "keep it simple, data-driven" reference point,
  not as an architecture to replicate.
- **Deliberately not copied from either**: gamification/streak mechanics
  were kept minimal (streak count shown, no badges/leaderboards/hearts) per
  the explicit brief to prioritize learning effectiveness over engagement
  theater.

## What changed in the fifth pass (autonomous review fixes + audio + Practice tab)

Driven by `farsi-learn-review-2026-09-01.md`, an autonomous read-only review
that audited the whole app and produced a prioritized findings list, plus
direct follow-up requests during the same session. 234 automated tests now
(up from 166), `npm run typecheck`/`lint`/`build` all clean.

**Follow-up fixes/additions in the same session, after initial fifth-pass wrap-up:**
- **iOS Safari audio fix.** `edge-tts`'s raw output is a 24kHz MPEG-2 Layer
  III MP3 with no Xing/VBR header (ffprobe has to *estimate* its duration
  instead of reading it) — desktop browsers tolerate this, but it's a known
  cause of silent playback failure on iOS Safari's stricter
  AVFoundation-based decoder. `scripts/generate_audio.py` now re-encodes
  every clip through ffmpeg into a standard 44.1kHz MP3 immediately after
  generation; all 543 existing clips were re-encoded in place.
- **Bigger, more visible speak buttons.** `PersianText`'s 🔊 button was a
  tiny (~16px icon, hover-only) affordance — easy to miss and, on touch
  devices with no hover state, easy to mistake for broken audio. It's now a
  44px filled circular button matching `ListeningRunner`'s style, always
  visible.
- **Transliteration on Persian MCQ answer options** and **Dictionary
  defaults to an A-Z word list** — see below, same session.
- **Short-vowel diacritics (harakat/e'rab) — optional overlay.** Persian
  is normally written without short vowels; `src/content/diacriticsManifest.ts`
  (plain fa text -> diacritized fa text) is a first-pass, LLM-authored
  mapping covering the alphabet's example words and ~300 of ~390
  vocabulary items, shown via `PersianText` when the new "Show vowel
  marks" setting (`SettingsRow.showDiacritics`, default off) is on —
  falls back to plain text for anything not yet covered (all sentences,
  a handful of words with no hidden vowel to mark). Like the rest of this
  project's LLM-authored content, not yet spot-checked by a native
  speaker; `diacriticsManifest.test.ts` at least structurally guards it —
  every value must contain a genuine diacritic mark, and stripping the
  *added* marks (fatha/damma/kasra/shadda/sukun, not tanwin, which is
  already standard spelling) from a value must recover its key exactly,
  so a typo that drops/changes a base letter fails the test suite rather
  than shipping silently. Kasra (a small below-baseline mark) is legible
  at the alphabet screens' larger sizes but quite subtle in dense list
  views at default text size — an inherent property of the mark at small
  sizes, not a bug.
- **Diacritics toggle moved onto every lesson/review/practice screen**
  (`DiacriticsToggle.tsx`, a small "اَ" pill button next to the progress
  bar) instead of living only in Profile settings — flipping it mid-session
  ("let me peek at the vowels for this one") is the actual use case.
  Wiring this up surfaced that the toggle previously only worked on
  `PersianText` — MCQ answer options, matching-exercise pairs, word-order
  tiles, and the listening-exercise post-answer reveal all render `fa`
  text directly (for independent selection-state/transliteration styling)
  and silently ignored the setting. New `lib/persianText.ts`
  `withDiacritics(fa, show)` is now the one shared lookup, used
  everywhere Persian text is displayed with the option to show vowel
  marks, not just inside PersianText itself.
- **Speak button: hidden, not disabled, when nothing can pronounce the
  text.** Fill-in-the-blank sentence exercises pass a *blanked* prompt
  (`"...zud ______"`) to `PersianText`, which never matches an audio clip
  — the old `disabled:opacity-30` styling on the now-larger 44px button
  rendered as a faint, confusing "ghost" circle that looked broken rather
  than "nothing to hear here." `PersianText` now simply doesn't render
  the button at all when `canPronounce()` is false, matching how
  `ListeningRunner` already handles the same case.

- **Real pronunciation audio, finally.** The single biggest gap: audio
  previously depended entirely on the browser's `speechSynthesis`, and
  Persian voice availability turned out to be inconsistent enough across
  OS/browser combos that many learners got no audio at all. Every alphabet
  letter name/example word, vocabulary item, and sentence (543 strings) now
  has a real pre-generated MP3 via `edge-tts` (Microsoft's free neural TTS
  — see `scripts/generate_audio.py`, `npm run generate:audio`), shipped
  under `public/audio/` and looked up by exact text in
  `src/content/audioManifest.ts`. `lib/speech.ts` `pronouncePersian()` plays
  the clip when one exists, falls back to `speechSynthesis` otherwise
  (mainly for learner-typed custom words). Clips are runtime-cached
  (`CacheFirst`), not precached, so they don't add to the app's upfront
  install size. Still explicitly labeled computer-generated, same honesty
  stance as before — see README "Audio / pronunciation".
- **Review findings fixed**: H1 (dashboard cap-vs-caught-up contradiction),
  H2 (unbounded `learningEvents` log — now trimmed on every write, 90-day/
  2000-row cap), H3 (no way to stop a saved vocab word from being drilled —
  Profile's Saved-words list now has a "Stop reviewing" control separate
  from un-saving), H4 (no error boundary — top-level `ErrorBoundary` now
  wraps the app), L1/L3/L5 (dead `reducedMotion` setting now wired to a
  real toggle, "Items in progress" no longer counts un-started items,
  `getCurrentUnit()` returns `null` instead of a stale unit name once the
  curriculum is complete), M1 (Profile and Stats previously disagreed on
  the definition of "mastered" — unified into `lib/mastery.ts isMastered`),
  M2 (the SRS scheduler was invisible — every exercise runner now shows
  "Next review: ~3 days" after grading, via pre-fetched forecasts), M4
  (LessonPlayer now shows "Unit — lesson N of M · step X of Y" instead of
  a bare progress bar), M5 (ReviewSession gets an "End session" button and
  a "Load more reviews" continuation past the 30-item batch cap), M7
  (`generateLetterWordMatching` was dead code with a real bug — fixed and
  wired into lesson practice; `pickVocabExercise`, a fully-superseded dead
  export, removed).
- **Reading library (M3).** A new `/reading` route lists all passages for
  re-reading any time, with an optional re-take of the comprehension
  questions — reuses `PassageTeach` (now exported from `TeachCard.tsx`)
  as a pure browse surface.
- **New Practice tab.** A dedicated nav item (`/practice`) consolidating
  every way to drill material outside today's due queue: weak spots (moved
  here from being Stats-only), a new writing-practice mode
  (`buildWritingPractice` — forces the en→fa typing direction on
  already-introduced vocab/custom words, since that's the closest thing a
  browser app has to production/handwriting practice), reading practice,
  and — new — practicing any unit directly regardless of curriculum order
  or due dates (`buildFocusedSession({ filterBy: 'unit', unitId })`).
- **Alphabet cheat sheet.** A new `/alphabet/cheatsheet` route: every
  letter collapsed to its glyph/name by default (so the whole alphabet
  fits in one scroll), expandable per-letter or all-at-once to show forms,
  pronunciation, and — previously never surfaced anywhere in the UI —
  whether it's a non-joining ("break") letter.
- **Transliteration on MCQ answer options.** "Choose the correct Persian
  word" (and fill-in-the-blank sentence) questions showed only the raw
  Persian glyph on each option, ignoring the transliteration setting
  entirely (the prompt already respected it; the options never did, even
  though the data already carried `translit` per option). `McqRunner` now
  shows each option's transliteration under it when the setting is on;
  `generateSentenceFillBlank` now also sets a blanked `promptTranslit` so
  the sentence prompt itself gets one.
- **Dictionary default view.** Previously blank ("type at least 2
  characters to search"); now shows all ~390 words A–Z by English gloss
  before any query is typed, so there's something to browse immediately.

## What changed in the fourth pass (UX/UI polish + four new features)

Synthesized from two independent proposal reviews (a content/features
review and a hands-on live-Chrome UX/UI review). Executed in two phases.

**Phase A — UX/UI polish (all items done):**
- **A1 Desktop width cap**: `AppShell.tsx`'s `<main>` now wraps `<Outlet>`
  in a `mx-auto w-full max-w-2xl` container, so cards/buttons stop
  stretching full-bleed at wide viewports (was visibly broken at 1440px —
  e.g. an ~850px-wide single-letter teach button).
- **A2 Onboarding default**: `Onboarding.tsx`'s daily-goal preset now
  defaults to "Steady" (10/day) instead of "Focused" (15/day) — a
  brand-new learner shouldn't be pre-committed to the second-most-
  aggressive tier before finishing a single lesson.
- **A3 Locked-unit indicators**: `LessonMap.tsx` now dims (opacity-60) and
  shows a lock icon + "Locked" label on units that are neither done nor
  the current unit, reusing the same sequential-curriculum reachability
  rule `UnitDetail.tsx` already applied per-unit (`getCurrentUnit()` from
  `lib/session.ts`).
- **A4 Nav relabel**: the "Progress" bottom-nav/sidebar tab is now
  "Profile" (`components/layout/nav.ts`) — that screen holds stats, saved
  words, settings, data export, and cloud sync, which "Progress" alone
  undersold.
- **A5 Filled-in empty states**: `LessonPlayer.tsx`'s completion screen,
  `ReviewSession.tsx`'s empty/complete states, and `UnitDetail.tsx`'s
  locked state now surface streak + a "what's next" pointer (next unit
  name/lesson number, or reviews due) instead of ~450px of dead space —
  all built from data already computed elsewhere (`getTodaySummary()`,
  `getSettings()`), no new tracking added.
- **A6 Stats category sort/collapse**: `Stats.tsx`'s "Progress by
  category" list now shows started (nonzero) categories first and
  collapses untouched ones behind a "Show all categories (N not started)"
  toggle, so newer learners aren't scrolling past ~20 zero-progress rows.
- **A7 Dictionary tap targets**: the save-star button in `Dictionary.tsx`
  grew from `min-h-11/min-w-11` + `p-2` to `min-h-12/min-w-12` + `p-3`
  with explicit flex centering, comfortably past the 44px touch-target
  guideline in both search and browse views.
- **A8 Nav hidden during focused sessions**: `AppShell.tsx` now
  conditionally omits the mobile bottom nav entirely (not just
  CSS-hidden — verified via the accessibility tree that the `<nav>`
  element doesn't exist in the DOM at all) on `/lesson`, `/review`, and
  `/focused` routes, so it no longer competes with the in-session
  progress bar/exit control. The existing ✕ exit button in each of those
  screens remains the way out.
- **A9 Dictionary grid responsive**: the browse-by-category grid is now
  `grid-cols-2 sm:grid-cols-3`, using the extra room A1's cap still leaves
  at desktop widths.
- **Skipped**: a full Learn-screen level-jump/collapse redesign — flagged
  in the brief as lower-priority/higher-effort than the above; left for a
  future pass.

**Phase B — four new features:**
- **B1 Verb conjugation trainer.** New `src/lib/conjugation.ts` — a pure,
  fully rule-based present/simple-past conjugator built from `VocabItem.
  verbStems` (present stem + می‌/mi- prefix + person ending for present;
  past stem + person ending, bare 3rd-singular, for past). Handles
  compound/light verbs correctly (mi- inserts before the light verb, not
  the phrase front: کار می‌کنم not `*می‌کار کنم`), verbs that drop می‌ in
  the present (داشتن and compounds built on it, detected structurally),
  and بودن's irregular present copula (هستم/است/...، hardcoded from this
  repo's own already-verified `g-copula-present` grammar concept, and —
  out of caution — excluded from *generated exercises* even though it's
  still shown in the teach view). Rule set verified against this repo's
  own `g-present-tense-verbs`/`g-simple-past`/`g-copula-present` concepts
  plus dastur.info/UT Austin Persian Online, and unit-tested in
  `conjugation.test.ts` against known forms (میروم/رفتم/دارم/کار میکنم/
  هستم, etc.) for six verbs including a compound one. `TeachCard.tsx`'s
  `VocabTeach` now renders a full present+past paradigm table for any verb
  with `verbStems`. New `generateConjugationMcq`/`generateConjugationType
  Answer` in `lib/exercises/generator.ts` (distractors are the same verb's
  other five person-forms — the most pedagogically meaningful near-miss,
  and guaranteed-correct since they come from the same rule engine) wired
  into `session.ts`'s vocab branch (~35% chance, verbs only, outside
  brand-new "scaffolded" practice).
- **B2 Weak-spots focused study.** New `buildFocusedSession({ kind?,
  filterBy: 'weak' | 'category', category?, limit? })` in `lib/session.ts`
  — reads existing `reviewStates` only (no new Dexie tables), filters to
  items that have lapsed, are currently relearning, or have a below-
  default ease factor ("weak" — the same signal `getDueSummary` already
  uses to prioritize *within* the due queue, just applied here without the
  due-date gate), sorted worst-first. New `src/screens/FocusedSession.tsx`
  (mirrors `ReviewSession.tsx`) + `/focused` route, entry point on
  `Stats.tsx` ("Practice weak spots (N)", shown only when N > 0).
- **B3 Persian calendar.** New `src/lib/persianCalendar.ts` — a
  self-contained, dependency-free Gregorian↔Solar Hijri converter
  implementing the Borkowski (1996) astronomical algorithm (the same one
  `jalaali-js` uses). Verified against jalaali-js's own documented
  examples, independently against publicly-reported Nowruz dates
  (2024-03-20 → 1403/1/1, 2021-03-21 → 1400/1/1), and a round-trip
  property test across 1950–2060 in `persianCalendar.test.ts` (13 tests).
  Live-verified during the manual walkthrough: today (2026-09-01)
  converted to 10 Shahrivar 1405, matching an independent manual
  calculation. New `content/vocabulary/calendar.ts` (12 month names,
  `confidence: 'verified'`, sourced) wired into the existing `u2-time-
  dates` unit (lessonCount bumped 2→3) rather than left dictionary-only —
  same "don't orphan new content" discipline as the third pass's
  weather/body/work units. New `TodaysPersianDate` widget on
  `Dashboard.tsx`, reusing the app's existing verified Persian-digit
  glyphs from `content/alphabet.ts` rather than a second hardcoded set.
- **B4 Grammar-rule self-check quiz.** New `generateGrammarRuleMcq(concept,
  pool)` in `lib/exercises/generator.ts` — asks "which sentence
  demonstrates [rule]", correct answer is one of the concept's own linked
  example sentences, distractors are example sentences borrowed from
  *other* grammar concepts already in the corpus (excluding related
  concepts, so distractors aren't near-misses of the same rule) — zero new
  linguistic content, just a new combination of existing, already-vetted
  sentences, so effectively zero fabrication risk. Wired into `session.
  ts`'s grammar branch (~30% chance, outside scaffolded practice). Live-
  verified in the Chrome walkthrough with a real correct answer.
- **B5/B6 (reading library screen, inline notes callout)**: not attempted
  — explicitly optional/lower-priority, and Phase A + B1-B4 filled the
  available time budget with room to test everything properly rather than
  rushing two more items.
- **Not implemented (explicitly out of scope this pass, per the brief)**:
  a register-transform (formal↔colloquial) drill, and full-sentence typed
  production exercises with fuzzy grading — both flagged as good
  candidates for their own dedicated future pass.

## What changed in the third pass (content depth, learner features, product quality)

A full-scope pass across three fronts, in the order they were executed:

**A — Content depth + corpus verification.**
- Resolved all 11 pre-existing `needs-review` items via real lookups
  (vajehyab.com/Dehkhoda, Abadis, Moein, dastur.info, MSU OpenBooks, UT
  Austin Persian Online) — 9 flipped to `verified` with a source note; the
  remaining ambiguity (کی "who" vs "when") turned out to be cleanly
  resolved by Abadis, so it's `verified` too. Two *new* items added this
  pass were themselves flagged `needs-review` where a lookup genuinely
  didn't fully resolve a register/regional nuance (see the updated table
  below) — the discipline is "flag what's still uncertain," not "always
  clear the list."
- **Content model extension**: added `Passage` (`src/content/types.ts`) —
  a thin composition layer over already-glossed `ExampleSentence`s (title +
  ordered `sentenceIds` + `comprehensionQuestions`), not a parallel
  untyped-text content type. This was the minimal extension that kept
  every passage sentence individually word-glossed and individually
  SRS-tracked. New `src/content/passages/` + `sentences/passages.ts`;
  `TeachCard.tsx` gained a `PassageTeach` renderer; `session.ts` registers
  each passage sentence in the normal 'sentence' SRS queue and generates
  comprehension-check MCQs (`generatePassageComprehensionMcq` in
  `lib/exercises/generator.ts`) as extra in-lesson practice with no
  `reviewable` ref, same pattern as batch matching exercises.
- **Level 5 ("Upper Intermediate") built out**: discourse markers/idioms
  (`vocabulary/upperIntermediate.ts`, 16 items), a formal↔colloquial
  register-in-action unit, two full multi-turn dialogues (café ordering,
  catching up with a friend — 14 sentences with a new optional
  `ExampleSentence.speaker` field), and 4 new grammar concepts (habitual/
  continuous past, concessive `اگرچه`, causal `چون`, purpose `تا` +
  subjunctive), each checked against dastur.info/MSU OpenBooks/UT Austin
  Persian Online. Now 4 real units (`u5-natural-conversation` expanded +
  3 new) instead of 1 seed unit.
- **Level 6 ("Advanced") built out**: 4 original composed reading passages
  (23 sentences, full word-by-word glossing, 12 comprehension questions
  total) across 2 units. **Important honesty note**: these are
  author-composed practice passages built from already-verified vocabulary
  and checked grammar — like every other sentence in this corpus — *not*
  claimed excerpts from a real published/news source. An AI agent
  fabricating a false "this is from a real 2026 article" provenance would
  be a worse ethical failure than being upfront that it's original
  pedagogical text. `u6-reading-authentic` (title kept, content real now)
  + new `u6-reading-narrative`; the `validate.test.ts` empty-unit
  exemption for L6 was removed.
- **3 new small units for previously-untaught categories**: `u2-weather-
  nature` (L2), `u3-body` (L3, sibling to the existing health/emotions
  unit), `u4-work-school-tech` (L4) — each teaches previously-orphaned
  `weather`/`body`/`work`/`technology`/`school` vocabulary that was
  dictionary-searchable but in no unit, per PROGRESS.md's own prior
  "what's incomplete" list. ~17 brand-new words added to round these out
  (`weatherNature.ts`, `bodyHealth.ts`, `workTech.ts`), plus 5 new example
  sentences tying them to already-taught grammar/vocab (e.g. "سرم درد
  می‌کند" reusing `body-sar` + the existing `health-dard`).
- **Audio-source investigation**: no change from the second pass's
  position — there is still no ethical way for an AI agent to source or
  fabricate "authoritative" native-speaker recordings, so the `speech.ts`
  synthesized-TTS approach and its explicit "approximate, computer-
  generated" labeling stand unchanged. Nothing new was integrated here;
  see "What's incomplete" #2 below for what a real pipeline would need.
- Net new content: 33 vocab items, 48 sentences, 4 grammar concepts, 4
  passages (12 comprehension questions), 7 new/expanded units. Corpus
  total: 562 items (`npm run audit:content`), 513 high-confidence, 47
  verified, 2 needs-review (down from 11).
- **Scope decision on full re-verification**: the brief asked to
  re-check *every* item in the corpus. Doing ~470 individual live
  dictionary lookups for content already carrying a defensible
  `high-confidence` stamp (standard, well-established Persian, per the
  type's own definition) wasn't a good use of the session against
  everything else in scope, and mass-flipping them to `verified` without
  actually checking each one would itself violate the no-fabrication rule.
  What actually happened: 100% of the flagged `needs-review` items got a
  real lookup, 100% of new content got the same discipline as the second
  pass, and pre-existing `high-confidence` items were left as-is (a
  legitimate resting state, not a violation) rather than falsely stamped.
  Flagged here for transparency rather than silently narrowing scope.

**B — Learner-facing features.**
- **B1 Daily plan**: `src/lib/dailyPlan.ts` — a pure `recommendDailyPlan()`
  function (8 unit tests) that orders "lesson first" vs "reviews first"
  vs "both, flexible" from due-review count, the new-item cap, and lesson
  availability; replaces the old static "Today" card copy on the
  dashboard. Does *not* wire the cap into lesson pagination (an explicit
  standing decision — see "What's incomplete" below, unchanged).
- **B2 Mastery & statistics**: `src/lib/mastery.ts` (13 unit tests) +
  new `/stats` screen (linked from Progress, not a 6th bottom-nav item —
  5 was already a full mobile nav row): per-category vocab progress bars,
  a 32-letter mastery grid (not-started/introduced/review/mastered, from
  existing `reviewStates`), a current-month streak heat calendar (from
  existing `learningEvents` timestamps — no new tracking), and a "days to
  finish the curriculum" estimate (remaining teachable items ÷
  `newItemsPerDay`, clearly labeled an estimate).
- **B3 Dictionary upgrades**: browse-by-category tab (all 29 populated
  `VocabCategory` values, word counts, drill-down list) alongside the
  existing search; inline save-star was already present on search
  results and now also on browse rows; new "in your review queue" badge
  (distinct from "saved" — reflects any `reviewStates` entry, taught or
  saved) on both.
- **B4 Install & offline polish**: `useInstallPrompt` hook wraps
  `beforeinstallprompt`/`appinstalled` (Chromium) with an iOS-Safari
  manual-instructions fallback (that event never fires there); a
  conditionally-shown "Install Farsi Learn" card in Progress. The PWA
  manifest was already solid (name/description/theme/icons/standalone)
  from the first pass — left as-is. Verified via `npm run build`: the
  Workbox precache glob is build-output-based (not a hand-maintained
  route list), so it automatically picked up all new routes/chunks (21
  entries, ~780 KiB) without any change needed; the Firebase chunk
  exclusion (`globIgnores`) still holds.
- **B5 Manual theme toggle**: `settings.theme` (`'system' | 'light' |
  'dark'`, default `'system'`) applied via `data-theme` on `<html>`
  (`src/lib/theme.ts`) — `index.css`'s dark-mode block is now guarded
  with `:root:not([data-theme="light"])` and a matching `[data-theme=
  "dark"]` override block wins regardless of OS preference. Verified live
  in Chrome: Auto/Light/Dark all repaint instantly and correctly.

**C — Product quality.**
- **C1 Milestones**: `src/lib/milestones.ts` (7 unit tests) — alphabet
  mastered, first 50/100/250/500 words, first sentence, level-N-complete
  ×6, and streak milestones (7/30/100/365 days, using the best of
  current/longest so a milestone never un-achieves), all computed from
  existing `reviewStates`/`unitProgress`/`settings` data, no new tracking
  tables. Surfaced on the new Stats screen (achieved + "up next") and as a
  small dismissible celebration banner on the dashboard the first time one
  is reached (`useMilestoneBanner` — the "already celebrated" set lives in
  `localStorage`, a per-device UI flag, not a database table). No XP,
  points, or leaderboards.
- **C2 Conflict-aware cloud sync**: `storage/backup.ts` gained
  `mergePayloads()` (pure, 15 unit tests) — per-record last-write-wins by
  `updatedAt` for `reviewStates`/`savedItems`/`unitProgress`, a dedup'd
  append-only union for `learningEvents`, and settings merged by newer
  `updatedAt` except `longestStreak` (always the max of both sides, so a
  personal best can never regress from a merge). `SavedItem` and
  `SettingsRow` gained an `updatedAt` field (backup version bumped to 2;
  a v1 backup still imports/merges fine, missing `updatedAt` just treated
  as oldest). Both `uploadProgress`/`downloadProgress` in `auth/sync.ts`
  now merge instead of overwrite, converging both the device and the
  cloud to the same merged state either direction — the scenario in the
  old "what's incomplete" #4 (loser of two actively-used devices loses
  everything since the last sync) is fixed. `importBackup`/`resetAllProgress`
  (explicit file import / full reset) deliberately stayed one-way
  overwrites — importing a file you chose is an unambiguous "use this
  instead," not two devices that drifted apart.
- **C3 Accessibility & polish**: fixed 3 `jsx-a11y(prefer-tag-over-role)`
  lint warnings surfaced while touching these screens; found and fixed a
  real layout bug during the manual Chrome pass (dashboard "Recent
  mix-ups" overlapped its English gloss on top of long Persian text once
  full passage sentences — not just short vocab — could appear there;
  `min-w-0`/`flex-wrap` fix in `Dashboard.tsx`). `a11y.test.tsx` extended
  to the dictionary browse view and the Stats screen (now 6 axe-core
  checks, up from 4). Still not a substitute for a real screen-reader
  pass — see "What's incomplete" below, unchanged from the second pass.

Net: 124 automated tests (up from 71), all passing; `npm run lint`,
`typecheck`, `test`, and `build` all clean.

## What changed in the second pass (onboarding, keyboard, SRS, content depth, a11y)

A follow-up session focused on making the app meaningfully better for a
brand-new beginner, in four workstreams:

- **First-run experience.** A short onboarding flow (`src/components/
  onboarding/Onboarding.tsx`, gated by `App.tsx` on the `onboardingComplete`
  setting) now runs before the dashboard for new users: welcome → daily
  goal preset (wired to `newItemsPerDay`) → transliteration on/off (wired
  to `showTransliteration`) → first-lesson-or-dashboard. Typed-answer
  exercises with `answerLang: 'fa'` now show an on-screen Persian keyboard
  (`PersianKeyboard.tsx`, all 32 letters + ZWNJ) that inserts at the
  input's actual cursor position, not just the end. The dashboard's "new
  items today" line is now real (`getTodaySummary().newItemsToday`) — this
  also fixed a real bug where `getDueSummary()`'s daily new-item cap could
  never actually trigger (see `storage/progressRepo.ts`). Saved/starred
  words now get full SRS integration: words with a `vocabId` join the
  existing 'vocab' review queue (reusing its generators), and a new
  `ProgressSettings` form lets learners add fully custom entries, which
  get their own `'custom'` `ReviewableKind` and generators
  (`generateCustomMcq`/`generateCustomTypeAnswer` in
  `lib/exercises/generator.ts`) with vocabulary-pool distractors, clearly
  labeled "your own word" in the UI.
- **Exercise engine.** Matching exercises (`generateVocabMatching`) are now
  used as extra practice for freshly-taught vocab batches of 4–6 in
  `buildNextLesson` — review-session rotation deliberately stays as it
  was, since a multi-item matching exercise can't attribute a result to
  one item's SRS state. A new listening-comprehension exercise type
  (`ListeningExercise`/`ListeningRunner`) plays a word/sentence via
  `speakPersian()` and asks for the meaning; on a device with no Persian
  voice it gracefully falls back to showing the text + transliteration
  instead of a silent, broken control.
- **Content correctness tooling + depth.** `npm run audit:content`
  (`scripts/audit-content.ts`, via the new `tsx` devDependency) scans all
  linguistic content and prints a report grouped by confidence, with a
  full listing of every `needs-review` item — the working document for a
  Persian speaker to check. `validate.test.ts` now explicitly enforces
  that every item has a valid `confidence` and that every `needs-review`
  item has a `note`. Deepened Levels 1–4: 4 more example sentences for
  grammar concepts that had only one (or zero) linked examples, and 22
  new vocabulary words in the sparsest existing categories (weather,
  restaurant, transportation, travel, directions, work, technology, body)
  — see "Content verification workflow" below for how these were checked.
- **Accessibility.** An automated axe-core pass (`src/a11y.test.tsx`, via
  `vitest-axe`) now runs against the dashboard, onboarding, the Persian
  keyboard, and an MCQ exercise runner in CI. Not exhaustive — a manual
  screen-reader pass is still worth doing (see below).

## Content verification workflow (added in the second pass)

Every new vocab/sentence item added in the second pass was checked against
[vajehyab.com](https://vajehyab.com) (a Persian dictionary aggregator
pulling from Dehkhoda/Moein/Amid, the standard reference dictionaries)
before being committed — spelling, gloss, and usage all had to match
cleanly for the item to be marked `confidence: 'verified'` instead of
`'high-confidence'`. One phrase (`رمز عبور`) needed corroboration from a
second source (WordHippo/Glosbe/translate.com agreed) since the single-page
lookup was inconclusive for the two-word phrase as a unit. The four new
example sentences reuse only already-verified vocabulary in grammatical
patterns that were separately checked against university/reference Persian
grammar resources (UT Austin's Persian Online, MSU OpenBooks, dastur.info)
rather than a dictionary, since full sentences aren't dictionary entries.
**Nothing pre-existing before the second pass was touched or re-verified**
— the 11 `needs-review` items below are exactly the same 11 as before.

This is a good workflow to keep using for future content additions: look
the item up on a reputable Persian dictionary (vajehyab.com, FarsiDic, or
similar) before committing it, and only use `'verified'` when that lookup
actually confirmed cleanly — flag `needs-review` with a `note` otherwise.

## What's incomplete

1. **No real *native-speaker* recorded audio.** Fifth pass added
   pre-generated neural-TTS clips (`edge-tts`, see "Audio /
   pronunciation" in the README) covering every alphabet/vocab/sentence
   string, replacing the old browser-`speechSynthesis`-only approach and
   its inconsistent voice availability. This closes the "many learners
   got no audio at all" gap, but it's still computer-generated, not an
   authentic recording — there remains no ethical path for an AI agent to
   source real native-speaker audio itself.
2. **The accessibility pass is automated-only, not manual.** `src/
   a11y.test.tsx` now covers 6 screens/components (dashboard, onboarding,
   Persian keyboard, an MCQ runner, dictionary browse, Stats) with
   axe-core, but nothing has been checked with an actual screen reader
   (VoiceOver/NVDA/TalkBack) or a full keyboard-only pass across the app.
3. **The new-item daily cap isn't enforced by lesson teaching, only by the
   review queue.** `buildNextLesson()` always teaches a full lesson's worth
   of unit content regardless of `newItemsPerDay` — this is an explicit
   standing decision (confirmed again this pass, not an oversight): the
   setting genuinely affects `getDueSummary()`'s review-queue pacing, the
   dashboard's "X of Y new items today" display, and now the daily-plan
   recommendation's "is there new-item room today" check, but a learner
   who starts a lesson still gets that lesson's full content in one
   sitting. Wiring the cap into lesson pagination itself would be a bigger
   structural change and was explicitly ruled out of scope again.
4. **Full corpus re-verification was scoped down, not skipped.** See the
   "Scope decision on full re-verification" note under "What changed in
   the third pass" above — every `needs-review` item and every new item
   got a real check; pre-existing `high-confidence` items (the vast
   majority, ~470 of them) were left as-is rather than mass-flipped to
   `verified` without an actual lookup. A future pass could sample-check a
   batch of these if a native speaker's time is available (see "Native
   speaker checklist" below).
5. **Passage/reading-comprehension content is a first iteration.** Only
   4 passages exist (2 informational, 2 narrative); the `Passage` content
   model (`src/content/types.ts`) supports more without further schema
   work — just add sentences + a `Passage` entry + wire it into a unit's
   `passageIds`.
6. **`beforeinstallprompt` availability wasn't verified against a real
   production HTTPS deploy** — it fires under browser-specific engagement
   heuristics that don't reliably trigger in an automated local-dev
   session, so the install card's *conditional rendering* was verified by
   code/hook logic and a Chrome DevTools manifest check, not an actual
   "tap Install and see it appear" click on the deployed site. Worth a
   spot-check on the live GitHub Pages URL after this lands.
7. **Reading library screen (fourth-pass B5) — done in the fifth pass**,
   at `/reading` (see above). **Inline notes callout (B6) still not
   attempted** — `VocabItem`/`ExampleSentence.notes` are rendered but not
   visually distinguished from surrounding teach-card text. No data-model
   change needed.
8. **Register-transform drill and fuzzy-graded full-sentence production
   were explicitly out of scope this pass**, per the brief — both are
   good candidates for a dedicated future pass rather than being squeezed
   in alongside four other new features. A register-transform drill (take
   a formal sentence, produce/recognize the colloquial equivalent or vice
   versa) has real content to draw on already (`g-register`/`g-colloquial-
   contractions`, the register-tagged sentence pairs); fuzzy-graded typed
   production would need a real grading strategy (Levenshtein-ish
   tolerance, or accepting a *set* of paraphrases) beyond the current
   exact/normalized-match `persianTextsMatch`/`englishAnswerMatches`.
9. **The verb conjugation trainer (fourth-pass B1) covers only the
   present and simple past.** `VocabItem.verbStems` only records those two
   stems, so subjunctive/imperative/perfect/future conjugation (all
   already taught conceptually via grammar concepts + example sentences)
   isn't drillable through the new paradigm-table/exercise path. Extending
   this would mean either deriving those forms from the same two stems
   (subjunctive and imperative both are: بـ/نـ + present stem + ending, so
   this is plausible) or recording more stem data per verb.

## Content flagged `confidence: 'needs-review'`

2 items out of 574 total content items (vocabulary + sentences + grammar
concepts + alphabet + short vowels + passages) — 574 up from 562 in the
fourth pass, entirely from the 12 new Solar Hijri calendar-month vocab
items (all `confidence: 'verified'`, see "What changed in the fourth
pass" above), so still just the same 2 items flagged, down from 11 back
when the third pass resolved every previously-flagged item via real
dictionary/grammar-reference lookups. Both remaining items are idioms/
formulas where the core meaning is well-attested but a genuine register/
regional nuance remains open. Grep
`confidence: 'needs-review'` to find them in source with full context, or
run `npm run audit:content` for a generated report; summary:

| Type | id | Persian | Gloss | Why flagged |
|---|---|---|---|---|
| vocab | `exp-damet-garm` | دمت گرم | nice one! / well done! | Meaning confirmed (informal praise/thanks), but sources differ on regional origin (some tie it to southern/Khuzestani speech specifically) — worth confirming how universally it reads |
| sentence | `s-dlg-cafe-7` | قابلی نداره، نوش جان! | Don't worry about it — enjoy! | The taarof phrase itself is unambiguous; flagged for the cultural-practice nuance (whether a fixed price still gets paid despite the polite deflection), not the translation |

Neither of these is a guess presented as fact without a flag — both are
plausible-and-likely-correct content an AI author should not be fully
trusted on without a native speaker's confirmation, per the project's
content-quality policy (see `SourceNote` in `src/content/types.ts`). Both
carry an explicit `note` explaining why, enforced by `validate.test.ts`.

## Native speaker checklist (if you're picking this up)

Good next steps, roughly in priority order:
1. Check the 2 `needs-review` items above; flip `confidence` to
   `'verified'` once confirmed (or fix and re-flag). Run
   `npm run audit:content` for the working list.
2. Spot-check the new Level 5/6 content (idioms, dialogues, the 4 nuanced-
   grammar concepts, the 4 reading passages) — all individually checked
   against references during authoring, but nothing beats a native
   speaker's ear for whether the dialogues actually sound natural and the
   register choices land right.
3. A manual accessibility pass (screen reader + keyboard-only) beyond the
   automated axe-core coverage in `src/a11y.test.tsx`.
4. Consider a real audio pipeline (recorded, not synthesized) if/when
   available — the data model already has room for it, and the listening
   exercise type would immediately benefit from it.
5. More Level 6 passages, more Level 5 dialogues — the content models
   support it without further schema work.
