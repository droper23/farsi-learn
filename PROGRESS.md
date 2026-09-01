# Farsi Learn — Handoff / Progress Notes

Written for continuity — a future session (human or AI) picking this up
cold should be able to read this and know exactly where things stand.
Last updated: 2026-08-31, end of the initial build session.

## Status: functional, deployed, tested

- Live at https://droper23.github.io/farsi-learn/, auto-deploys on push to
  `main` via `.github/workflows/deploy.yml`.
- `npm run lint && npm run typecheck && npm run test && npm run build` all
  pass clean.
- Manually verified in Chrome: dashboard → lesson flow (teach cards → MCQ
  exercise → grading/feedback → lesson completion) → dictionary search →
  saved words → progress/settings, in both the desktop sidebar layout and
  mobile bottom-nav layout. Clean console, no runtime errors.
- 46 automated tests, including a full end-to-end smoke test
  (`src/App.test.tsx`) that renders the real app against a real (fake-
  indexeddb) database and drives an entire lesson through actual UI clicks.

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

## What's incomplete

1. **Curriculum depth is uneven across levels.** Levels 1–4 (`u1-*`
   through `u4-*` in `src/content/curriculum/units.ts`) have real,
   substantial content — full alphabet, ~340 vocab items across all the
   requested categories, 26 grammar concepts with explanations, and ~35
   example sentences with word-by-word breakdowns, all cross-referenced
   and validated. **Levels 5 and 6 are seeded, not built out** — one small
   unit each (`u5-natural-conversation`, `u6-reading-authentic`), and
   `u6-reading-authentic` has literally no content yet (it's exempted from
   the "no empty units" validation test on purpose — see
   `validate.test.ts`). Building these out means: more idioms and
   discourse markers, longer/authentic dialogues, real reading passages
   with full glossing, more nuanced register content, and the grammar
   concepts a genuinely advanced learner needs (nuanced aspect, more
   subordination, literary constructions).
2. **No real recorded audio.** The 🔊 button uses browser `speechSynthesis`
   as a clearly-labeled approximate aid; see README "Audio /
   pronunciation" for why, and how to add real audio files later without
   touching UI code.
3. **No listening-comprehension exercise type.** Deliberately not built,
   for the same reason as #2 — a listening exercise needs audio worth
   trusting, which doesn't exist yet.
4. **Matching exercises aren't wired into the SRS queue** — they're
   generated (`generateVocabMatching`, `generateLetterWordMatching`) but
   nothing currently calls them from the lesson/review session builders in
   `src/lib/session.ts`. MCQ/typed-answer/word-order are the three types
   actually in rotation. Wiring matching in would mean deciding when it's
   pedagogically appropriate (probably: batches of 4-6 new vocab, not
   review) rather than just adding it to the random rotation.
5. **Cloud sync is upload/download, not real merge.** This was a
   deliberate simplicity trade-off (see README), but if two devices are
   both used actively without syncing between sessions, the loser's
   progress since the last sync is fully overwritten, not merged. Fine for
   "I have one phone and sometimes a laptop"; not fine for "I actively use
   two devices every day without syncing."
6. **No automated accessibility audit tool run** (e.g. axe-core) — the app
   was built with semantic HTML, ARIA labels on icon-only buttons,
   `prefers-reduced-motion` handling, and large touch targets throughout,
   and oxlint's jsx-a11y plugin is enabled and clean, but nothing has
   verified this with a dedicated a11y testing tool or a screen reader.

## Content flagged `confidence: 'needs-review'`

11 items out of 442 total content items (vocabulary + sentences + grammar
concepts + alphabet + short vowels). Grep `confidence: 'needs-review'` to
find them in source with full context; summary:

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
content-quality policy (see `SourceNote` in `src/content/types.ts`).

## If you're picking this up to keep going

Good next steps, roughly in priority order:
1. Get the 11 `needs-review` items checked by a Persian speaker; flip
   `confidence` to `'verified'` once confirmed (or fix and re-flag).
2. Build out Levels 5–6 content (see #1 in "What's incomplete").
3. Wire matching exercises into the session builder for new-vocab batches.
4. Consider a real audio pipeline (recorded, not synthesized) if/when
   available — the data model already has room for it.
