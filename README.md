# Farsi Learn

A complete, mobile-first web app for learning Persian (Farsi) from the alphabet
through advanced reading — spaced-repetition review, a structured curriculum,
and real sentence-based practice. Runs entirely in the browser, works offline
as a PWA, and stores all progress locally (with optional cloud sync).

**Live app:** https://droper23.github.io/farsi-learn/

---

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
```

```bash
npm run build       # type-checks then builds to dist/
npm run preview     # serve the production build locally
npm run test         # run the test suite (vitest)
npm run lint         # oxlint
npm run typecheck    # tsc --noEmit
npm run audit:content # confidence-grouped content report (needs-review items etc.)
```

Requires Node 20+.

---

## How it's built

| Layer | Choice | Why |
|---|---|---|
| Framework | React 19 + TypeScript, Vite | fast, static-output, no server needed |
| Styling | Tailwind CSS v4 | utility CSS, theme tokens for light/dark |
| Routing | `react-router` **HashRouter** | GitHub Pages serves static files with no server rewrite rule — path routes 404 on refresh/direct link. Hash routes (`#/review`) never hit the server for anything but `index.html`, so they just work with zero Pages configuration. |
| Storage | IndexedDB via Dexie | structured, larger-than-localStorage, works offline |
| Font | `@fontsource-variable/vazirmatn` (self-hosted, OFL) | correct Persian/Arabic-script shaping, works fully offline, no Google Fonts dependency |
| PWA | `vite-plugin-pwa` | installable, offline-capable, auto-updating service worker |
| Optional cloud sync | Firebase Auth + Firestore, **dynamically imported** | free tier, zero server code to run yourself; code-split so it adds no bytes/network requests unless configured and used |

The app is 100% static output (`npm run build` → `dist/`) with no backend of
its own. `base: './'` in `vite.config.ts` makes the build subpath-agnostic —
it works unmodified whether hosted at a GitHub Pages project URL
(`user.github.io/repo/`), a custom domain, or `file://`.

---

## Deployment (GitHub Pages)

`.github/workflows/deploy.yml` lints, tests, builds, and deploys to Pages on
every push to `main`, using GitHub's official `actions/deploy-pages`. Pages is
configured for "GitHub Actions" as the build source (Settings → Pages →
Source), not a `gh-pages` branch — nothing to configure beyond that once the
workflow file exists and Pages is enabled once for the repo.

To deploy your own fork:
1. Push to your own GitHub repo.
2. Settings → Pages → Source → **GitHub Actions**.
3. Push to `main` (or run the workflow manually) — it deploys automatically.

To deploy elsewhere (Netlify, Vercel, any static host, or a custom domain):
just point it at `npm run build` → `dist/`. Nothing GitHub-Pages-specific is
required outside the one workflow file.

---

## Where the learning content lives

Nothing linguistic is hard-coded into a component. Everything lives in typed
data under `src/content/`:

```
src/content/
  types.ts            # the shape of every content type (see below)
  alphabet.ts          # all 32 letters, short vowels, digits
  vocabulary/*.ts       # ~400 words, grouped by topic file, aggregated in index.ts
  sentences/*.ts        # example sentences with word-by-word breakdowns
  grammar/concepts.ts    # grammar concepts (explanation + linked examples)
  passages/              # Level 6 reading passages (title + ordered sentence
                          # ids + comprehension questions — composed from
                          # already-glossed ExampleSentences, not raw text)
  curriculum/
    levels.ts            # the 6 CEFR-ish levels
    units.ts              # units within each level, referencing the above by id
  validate.test.ts        # cross-reference integrity tests (see below)
```

### Adding a new word / sentence / grammar concept / unit

1. Add an object to the relevant array (e.g. append a `VocabItem` to
   `src/content/vocabulary/food.ts`, or start a new file and add it to
   `vocabulary/index.ts`).
2. Give it a unique `id` — never reused/recycled elsewhere.
3. If it should be *taught* in a lesson (not just searchable), add its id to
   a `Unit` in `curriculum/units.ts`.
4. Run `npm run test` — `validate.test.ts` fails loudly if you reference an
   id that doesn't exist anywhere, or if two items share an id.

No UI code needs to change to add the 1000th word — exercises are **generated
at runtime** from content (`src/lib/exercises/generator.ts`), not
hand-authored per word.

### The content-quality system

Every piece of linguistic content carries a `confidence` field:
- `'high-confidence'` — standard, well-established Persian, low error risk.
- `'needs-review'` — correct to the author's knowledge, but a colloquial
  contraction, idiom, or register judgment call worth a native-speaker
  spot-check (each one also carries a `note` explaining *why* it's flagged;
  `validate.test.ts` enforces that every `needs-review` item has one).
- `'verified'` — explicitly confirmed correct, either by a human or by an
  AI assistant that actually cross-checked it against a reputable Persian
  dictionary (e.g. vajehyab.com, FarsiDic) and noted the source — not
  claimed speculatively.

This was populated by an AI assistant (see the project's `PROGRESS.md` for
exactly what still needs review) — **treat `needs-review` items as flagged
for a Persian speaker to check before fully trusting them**, and search the
codebase for `confidence: 'needs-review'` to find all of them at once, or
run `npm run audit:content` for a generated report grouped by status with
every `needs-review` item's id, Persian text, gloss, and note.

---

## How spaced repetition works

`src/srs/scheduler.ts` is a from-scratch TypeScript port of an SM-2-style
algorithm (adapted from the same author's Danki iOS flashcard app), with the
usual card states — **new → learning → review → relearning** — ease factor,
lapses, and configurable learning steps. It's a pure function
(`applyRating(state, rating, config, now)` → new state), fully unit-tested in
`scheduler.test.ts`, with no dependency on storage or React.

Every reviewable thing (a letter, a word, a grammar concept, a sentence, or
a learner-saved word) gets its own SRS record, keyed as
`` `${kind}:${itemId}` `` (`src/content/types.ts` → `reviewableKey`) — so
alphabet, vocabulary, grammar, sentences, and saved words all share one
unified review queue instead of separate disconnected ones. Struggling
items (lapses) come back sooner automatically; mastered items (long,
successful intervals) come back less often — this falls out of the
algorithm itself rather than needing separate logic. Saved words that
point at real vocabulary reuse the `'vocab'` kind; fully custom,
learner-typed entries (no matching vocabulary item) get their own
`'custom'` kind with its own exercise generators
(`generateCustomMcq`/`generateCustomTypeAnswer`).

`src/lib/session.ts` ties this to the curriculum: `buildNextLesson()` teaches
the next unfinished lesson's new content (registering each item in the SRS
store as `new`) and generates scaffolded practice for it;
`buildReviewExercises()` pulls whatever's due across *all* content types and
generates appropriately-difficulty exercises for it (`difficultyFor()` biases
struggling/new items toward multiple-choice and well-established items toward
typing/word-order — the "gradually move from recognition to production"
requirement).

---

## How your data is stored

Everything lives in **IndexedDB, in your browser, on your device** — there is
no server storing your progress by default. See `src/storage/db.ts` for the
schema (review states, saved words, a lightweight learning-event log for the
"recent mistakes" widget, unit progress, settings).

- **Backup/restore**: Profile → "Export backup (.json)" / "Import backup".
  A plain JSON file you can keep anywhere.
- **Reset**: Profile → "Reset all progress" (asks for confirmation first —
  this is permanent for this browser).
- Progress does **not** sync across devices/browsers unless you set up cloud
  sync below — a phone and a laptop are two separate local databases.

### Optional cloud sync

Sign-in + cross-device sync is built in, off by default, using Firebase Auth
(Google sign-in) + Firestore — both free-tier, no server code of your own to
run. It only activates if you create your own free Firebase project:

1. Create a project at https://console.firebase.google.com (free Spark plan).
2. Add a **Web App** to it; copy the config values it gives you.
3. Authentication → Sign-in method → enable **Google**.
4. Authentication → Settings → **Authorized domains** → add the domain(s)
   the app is actually served from (e.g. `droper23.github.io` for the
   GitHub Pages deployment). Without this, sign-in fails with an
   `unauthorized-domain` error on the deployed site even though it works on
   `localhost`.
5. Firestore Database → create one (production mode), then set a rule so
   each signed-in user can only touch their own document:
   ```
   match /farsiLearnBackups/{uid} {
     allow read, write: if request.auth != null && request.auth.uid == uid;
   }
   ```
6. Copy `.env.local.example` to `.env.local` and fill in the six
   `VITE_FIREBASE_*` values, then rebuild — Profile → "Cloud sync" now
   shows a **Sign in with Google** button locally.
7. To enable it on the deployed GitHub Pages site too: `.env.local` is
   gitignored and never reaches CI, so add the same six values as
   **repository secrets** (Settings → Secrets and variables → Actions →
   New repository secret, named exactly `VITE_FIREBASE_API_KEY`,
   `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`,
   `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`,
   `VITE_FIREBASE_APP_ID`). `.github/workflows/deploy.yml` already reads
   them into the build step — the next push to `main` (or a manual
   `workflow_dispatch` run) picks them up. None of these values are secret
   in the security sense (they end up in the public JS bundle regardless of
   how they're stored); real protection comes from the Firestore rule
   above, not from hiding the config.

Sync is deliberately manual and explicit (two buttons, no automatic
background sync) but **merges per-record** rather than overwriting one side
wholesale: `reviewStates`/`savedItems`/`unitProgress` use last-write-wins by
an `updatedAt` timestamp, `learningEvents` is a dedup'd append-only union,
and `settings` merges by newer `updatedAt` except `longestStreak`, which
always takes the max of both sides so a personal best can never regress.
Both buttons converge the device and the cloud to the same merged state
either direction — see `src/storage/backup.ts` (`mergePayloads`, unit
tested) and `src/auth/sync.ts`. The Firebase SDK is loaded via dynamic
`import()`, so none of this costs bytes or a network request for anyone who
doesn't configure it.

---

## Audio / pronunciation

There is no bundled recorded audio (an AI agent cannot ethically fabricate
"authoritative" native-speaker recordings). Where a 🔊 button appears, it uses
the browser's built-in `speechSynthesis` API if a Persian voice is available
on the device — always labeled as **approximate, computer-generated
pronunciation**, never presented as authoritative. The architecture
(`src/lib/speech.ts`) is isolated specifically so real recorded audio files
could be swapped in later (e.g. `AlphabetLetter.exampleWords[].audioUrl`)
without touching any UI component.

The listening-comprehension exercise type (hear a word/sentence, pick its
meaning) is built on this same synthesized voice and carries the same
disclosure. On a device with no Persian voice at all, it falls back to
showing the Persian text and transliteration directly instead of a silent,
broken "play" button — see `ListeningRunner.tsx` and `hasPersianVoice()`.

---

## Testing

`npm run test` runs:
- `src/srs/scheduler.test.ts` — SRS algorithm correctness (progression
  through learning steps, ease-factor floors, lapse handling, interval
  formatting).
- `src/content/validate.test.ts` — every cross-reference between vocabulary,
  sentences, grammar, curriculum units, and the alphabet resolves to a real
  item; no duplicate ids; every Persian field actually contains Persian
  script; every letter has all four joined forms; every item has a valid
  `confidence` and every `needs-review` item has a `note`.
- `src/lib/exercises/generator.test.ts` — exercise generation and grading
  (MCQ distractor uniqueness, typed-answer grading incl. Arabic/Persian
  keyboard letter variants, word-order shuffling, adaptive-difficulty rating,
  listening-exercise generation/grading, custom-saved-entry generation,
  conjugation MCQ/typed-answer exercises, and the grammar-rule self-check
  MCQ including its "never picks a distractor from a related concept" rule).
- `src/lib/session.test.ts` — matching exercises appear in new-vocab lesson
  batches of 4-6 (and don't for small/alphabet-only lessons); custom saved
  entries resolve to a gradable exercise through `exerciseForReviewable`;
  `buildFocusedSession` ("practice weak spots") ignores due dates and
  returns only lapsed/relearning/low-ease items, worst-first, excluding
  suspended and brand-new items.
- `src/lib/conjugation.test.ts` — the rule-based verb conjugation engine
  against known forms across six verbs (a plain verb, a داشتن-family verb
  that drops می‌, a compound verb, and بودن's irregular present copula).
- `src/lib/persianCalendar.test.ts` — the Solar Hijri calendar converter
  against jalaali-js's documented examples, publicly-reported Nowruz dates,
  and a Gregorian→Hijri→Gregorian round trip across 1950-2060.
- `src/components/exercises/TypeAnswerRunner.test.tsx` — the on-screen
  Persian keyboard composes an answer correctly (append, mid-string insert
  at the cursor, backspace, clear) and grades end-to-end.
- `src/components/exercises/ListeningRunner.test.tsx` — the listening
  exercise's no-Persian-voice text fallback vs. normal play/replay flow.
- `src/a11y.test.tsx` — an automated axe-core accessibility pass over the
  dashboard, onboarding, the Persian keyboard, an MCQ exercise runner, the
  dictionary browse-by-category view, and the Stats screen.
- `src/lib/dailyPlan.test.ts`, `src/lib/mastery.test.ts`,
  `src/lib/milestones.test.ts` — pure-function unit tests for the daily-plan
  recommendation, per-category/letter/streak mastery stats, and milestone
  computation (all derived from existing SRS/progress data, no new tracking).
- `src/storage/backup.test.ts` — the conflict-aware sync merge logic
  (`mergePayloads`): per-record last-write-wins, never dropping a record
  that exists on only one side, plus legacy-backup import compatibility.
- `src/App.test.tsx` — renders the real app against a real (fake-indexeddb)
  database and drives the dashboard, unit map, alphabet detail, dictionary
  search **and browse-by-category**, onboarding, the goal-aware daily-plan
  card, the dashboard's Solar Hijri date widget, a full "practice weak
  spots" flow from the Stats screen through a graded exercise, and
  **a complete lesson start-to-finish** (including a Level 6
  reading-passage lesson) through actual UI interactions and real exercise
  grading. This is the project's substitute for a scripted manual QA pass.

`npm run audit:content` (not part of `npm run test`) prints a
confidence-grouped content report — see "The content-quality system" above.

---

## Project structure

```
src/
  content/        content model + all data (see above)
  srs/             the scheduling algorithm (pure, no I/O)
  storage/         Dexie schema + repositories + JSON backup/restore
  auth/            optional Firebase sign-in + cloud sync (dynamically imported)
  lib/              exercise generation, session/lesson building, text
                     normalization, speech
  components/       shared UI, exercise runners, lesson teach cards, layout,
                     onboarding
  screens/          one file per route
  hooks/            small reusable hooks (settings, async data loading)
```

## What's incomplete / needs follow-up

See `PROGRESS.md` for a detailed, current handoff — in short: all six levels
now have real, substantial content (Levels 5–6 were built out in the third
pass, including a `Passage` content type for glossed reading passages with
comprehension questions). A couple of colloquial expressions/idioms are
marked `confidence: 'needs-review'` and should be spot-checked by a Persian
speaker before being fully trusted (`npm run audit:content` for the full
list). The accessibility pass is automated-only (axe-core) so far, not
manually screen-reader-tested. There's still no real recorded audio (see
"Audio / pronunciation" above).
