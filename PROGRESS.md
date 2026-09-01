# Farsi Learn — Handoff / Progress Notes

Written for continuity — a future session (human or AI) picking this up
cold should be able to read this and know exactly where things stand.
Last updated: 2026-08-31, end of the "beginner-experience deepening" pass
(onboarding, Persian keyboard, saved-word SRS, matching/listening rotation,
content audit tooling, content depth, a11y pass) — see "What changed in the
second pass" below for the full rundown.

## Status: functional, deployed, tested

- Live at https://droper23.github.io/farsi-learn/, auto-deploys on push to
  `main` via `.github/workflows/deploy.yml`.
- `npm run lint && npm run typecheck && npm run test && npm run build` all
  pass clean.
- Manually verified in Chrome (initial build session): dashboard → lesson
  flow (teach cards → MCQ exercise → grading/feedback → lesson completion)
  → dictionary search → saved words → progress/settings, in both the
  desktop sidebar layout and mobile bottom-nav layout. Clean console, no
  runtime errors. The second pass (onboarding, keyboard, saved-word SRS,
  matching/listening) was verified via the automated test suite below
  rather than a repeat manual walkthrough — worth a manual spot-check.
- 71 automated tests (up from 46), including a full end-to-end smoke test
  (`src/App.test.tsx`) that renders the real app against a real (fake-
  indexeddb) database and drives an entire lesson through actual UI clicks,
  plus a dedicated test that walks a brand-new user through onboarding.

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

1. **Curriculum depth is uneven across levels.** Levels 1–4 (`u1-*`
   through `u4-*` in `src/content/curriculum/units.ts`) have real,
   substantial content — full alphabet, ~363 vocab items across all the
   requested categories, 26 grammar concepts with explanations, and 44
   example sentences with word-by-word breakdowns, all cross-referenced
   and validated. **Levels 5 and 6 are seeded, not built out** — one small
   unit each (`u5-natural-conversation`, `u6-reading-authentic`), and
   `u6-reading-authentic` has literally no content yet (it's exempted from
   the "no empty units" validation test on purpose — see
   `validate.test.ts`). Building these out means: more idioms and
   discourse markers, longer/authentic dialogues, real reading passages
   with full glossing, more nuanced register content, and the grammar
   concepts a genuinely advanced learner needs (nuanced aspect, more
   subordination, literary constructions). This was explicitly out of
   scope for the second pass too, per the brief.
2. **No real recorded audio.** The 🔊 button uses browser `speechSynthesis`
   as a clearly-labeled approximate aid; see README "Audio /
   pronunciation" for why, and how to add real audio files later without
   touching UI code. The new listening-comprehension exercise type is
   built on the same synthesized voice, with the same disclosure and the
   same no-voice fallback — still not a substitute for real audio.
3. **Some existing vocabulary categories still have zero curriculum
   coverage.** `weather`, `body`, `work`, and `technology` words (both
   pre-existing and newly added in the second pass) are dictionary-
   searchable but not taught in any unit yet — this predates the second
   pass and wasn't restructured, since adding brand-new units is a
   bigger scope than "deepen existing units." Worth a dedicated small
   unit each if/when Levels 1–4 get another pass.
4. **Cloud sync is upload/download, not real merge.** This was a
   deliberate simplicity trade-off (see README), but if two devices are
   both used actively without syncing between sessions, the loser's
   progress since the last sync is fully overwritten, not merged. Fine for
   "I have one phone and sometimes a laptop"; not fine for "I actively use
   two devices every day without syncing."
5. **The accessibility pass is automated-only, not manual.** `src/
   a11y.test.tsx` catches obvious axe-core-detectable regressions on a
   handful of screens/components, but nothing has been checked with an
   actual screen reader (VoiceOver/NVDA/TalkBack) or a keyboard-only pass
   across the whole app.
6. **The new-item daily cap isn't enforced by lesson teaching, only by the
   review queue.** `buildNextLesson()` always teaches a full lesson's worth
   of unit content regardless of `newItemsPerDay` — the setting genuinely
   affects `getDueSummary()`'s review-queue pacing (and, since the second
   pass, the dashboard's "X of Y new items today" display), but a learner
   who sets a low daily goal and then starts a lesson still gets that
   lesson's full content in one sitting. Wiring the cap into lesson
   pagination itself would be a bigger structural change.

## Content flagged `confidence: 'needs-review'`

11 items out of 468 total content items (vocabulary + sentences + grammar
concepts + alphabet + short vowels) — unchanged from the initial build
session; the second pass didn't touch any of these (see "Content
verification workflow" above for what it did add/verify). Grep
`confidence: 'needs-review'` to find them in source with full context, or
run `npm run audit:content` for a generated report; summary:

| Type | id | Persian | Gloss | Why flagged |
|---|---|---|---|---|
| vocab | `q-ki-who` | کی | who | Also means "when" — ambiguity note may need a native check on how real speakers actually disambiguate |
| vocab | `food-goshnam` | گشنمه | I'm hungry | Colloquial Tehrani contraction — spot-check spelling/register |
| vocab | `food-tashnamme` | تشنمه | I'm thirsty | Colloquial Tehrani contraction — spot-check spelling/register |
| vocab | `shop-gerooneh` | گرونه | it's expensive | Colloquial contraction — spot-check register |
| vocab | `exp-salamati` | سلامتی | "to your health" / casual reply | Idiomatic usage claim worth confirming |
| vocab | `exp-ghorboonat` | قربونت برم | affectionate filler | Idiom, non-literal — confirm tone/context |
| sentence | `s-future-colloquial` | فردا میام پیشت. | Tomorrow I'll come over to your place. | Colloquial construction |
| sentence | `s-reported-speech` | او گفت که فردا می‌آید. | He/she said that he/she is coming tomorrow. | Tense-keeping claim in reported speech worth confirming across contexts |
| grammar | `g-reported-speech` | — | — | Same tense-keeping claim as above, at the rule level |
| grammar | `g-colloquial-contractions` | — | — | General colloquial-register claims |
| alphabet | `eyn` (ع) | ع | Eyn | Glottal-stop description is a beginner-level simplification; real realization varies by position/dialect |

None of these are guesses presented as fact without a flag — they're all
plausible-and-likely-correct content an AI author should not be fully
trusted on without a native speaker's confirmation, per the project's
content-quality policy (see `SourceNote` in `src/content/types.ts`). Every
one of the 11 now carries an explicit `note` explaining why (the second
pass backfilled `note` on 7 of them that had a reason documented only in
this file's table, not in the content itself — content and docs had
drifted apart; they shouldn't need to again, since `validate.test.ts` now
requires a `note` on every `needs-review` item).

## If you're picking this up to keep going

Good next steps, roughly in priority order:
1. Get the 11 `needs-review` items checked by a Persian speaker; flip
   `confidence` to `'verified'` once confirmed (or fix and re-flag). Run
   `npm run audit:content` for the working list.
2. A manual accessibility pass (screen reader + keyboard-only) beyond the
   automated axe-core coverage in `src/a11y.test.tsx`.
3. Build out Levels 5–6 content (see #1 in "What's incomplete").
4. Small dedicated units for the still-untaught weather/body/work/
   technology vocabulary (see #3 in "What's incomplete").
5. Consider a real audio pipeline (recorded, not synthesized) if/when
   available — the data model already has room for it, and the new
   listening exercise type would immediately benefit from it.
