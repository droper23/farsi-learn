import { useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { vocabulary } from '../content/vocabulary'
import { grammar } from '../content/grammar'
import { alphabet } from '../content/alphabet'
import { sentences } from '../content/sentences'
import type { VocabCategory, VocabItem } from '../content/types'
import { normalizeLatin, normalizePersian } from '../lib/persianText'
import { db } from '../storage/db'
import { getOrCreateReviewState } from '../storage/progressRepo'
import { useLiveQuery } from 'dexie-react-hooks'
import { PageHeader } from '../components/shared/PageHeader'
import { Card } from '../components/shared/Card'
import { PersianText } from '../components/shared/PersianText'

/** All vocab categories that actually have at least one word, in a stable,
 *  reader-friendly order (not alphabetical — groups related topics). */
const CATEGORY_ORDER: VocabCategory[] = [
  'greetings', 'introductions', 'pronouns', 'question-words', 'connectors', 'prepositions',
  'family', 'numbers', 'time', 'dates', 'colors', 'adjectives', 'verbs-core', 'daily-activities',
  'food', 'restaurant', 'shopping', 'housing', 'travel', 'transportation', 'directions',
  'school', 'work', 'technology', 'weather', 'nature', 'body', 'health', 'emotions', 'expressions',
]

const CATEGORY_LABELS: Record<VocabCategory, string> = {
  greetings: 'Greetings', introductions: 'Introductions', pronouns: 'Pronouns',
  'question-words': 'Question words', connectors: 'Connectors', prepositions: 'Prepositions',
  family: 'Family', numbers: 'Numbers', time: 'Time', dates: 'Dates', colors: 'Colors',
  adjectives: 'Adjectives', 'verbs-core': 'Core verbs', 'daily-activities': 'Daily activities',
  food: 'Food & drink', restaurant: 'Restaurant', shopping: 'Shopping', housing: 'Housing',
  travel: 'Travel', transportation: 'Transportation', directions: 'Directions', school: 'School',
  work: 'Work', technology: 'Technology', weather: 'Weather', nature: 'Nature', body: 'Body',
  health: 'Health', emotions: 'Emotions', expressions: 'Expressions',
}

function categoryCounts(): Array<{ category: VocabCategory; count: number }> {
  const counts = new Map<VocabCategory, number>()
  for (const v of vocabulary) counts.set(v.category, (counts.get(v.category) ?? 0) + 1)
  return CATEGORY_ORDER.filter((c) => counts.has(c)).map((c) => ({ category: c, count: counts.get(c)! }))
}

export function Dictionary() {
  const [mode, setMode] = useState<'search' | 'browse'>('search')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<VocabCategory | null>(null)

  const savedIds = useLiveQuery(() => db.savedItems.toArray().then((s) => new Set(s.map((x) => x.vocabId))), []) ?? new Set()
  // "In your review queue" — distinct from "saved": a word is in the queue
  // once it has any SRS state at all (taught in a lesson, OR saved from
  // here), not just because it's starred.
  const queuedIds = useLiveQuery(
    () => db.reviewStates.where('kind').equals('vocab').toArray().then((s) => new Set(s.map((x) => x.itemId))),
    [],
  ) ?? new Set()

  const results = useMemo(() => {
    const q = query.trim()
    if (q.length < 2) return null
    const qFa = normalizePersian(q)
    const qEn = normalizeLatin(q)
    const matchVocab = vocabulary.filter((v) =>
      normalizePersian(v.fa).includes(qFa) || normalizeLatin(v.en).includes(qEn) || normalizeLatin(v.translit).includes(qEn),
    ).slice(0, 20)
    const matchGrammar = grammar.filter((g) => normalizeLatin(g.title).includes(qEn)).slice(0, 10)
    const matchLetters = alphabet.filter((l) => normalizeLatin(l.name).includes(qEn) || normalizePersian(l.forms.isolated).includes(qFa)).slice(0, 5)
    const matchSentences = q.length >= 3 ? sentences.filter((s) =>
      normalizePersian(s.fa).includes(qFa) || normalizeLatin(s.en).includes(qEn),
    ).slice(0, 10) : []
    return { matchVocab, matchGrammar, matchLetters, matchSentences }
  }, [query])

  const categories = useMemo(() => categoryCounts(), [])
  const browseItems = useMemo(() => (category ? vocabulary.filter((v) => v.category === category) : []), [category])

  async function toggleSave(vocabId: string, fa: string, translit: string, en: string) {
    if (savedIds.has(vocabId)) {
      const existing = await db.savedItems.where('vocabId').equals(vocabId).first()
      if (existing) await db.savedItems.delete(existing.id)
    } else {
      // Not a render path — this runs from a click handler.
      // oxlint-disable-next-line react/purity
      const now = Date.now()
      await db.savedItems.add({ id: `saved-${vocabId}-${now}`, vocabId, fa, translit, en, createdAt: now, updatedAt: now })
      // Saved words with a vocabId point at real, already-vetted vocabulary,
      // so they join the exact same 'vocab' SRS queue as curriculum-taught
      // words — starring a dictionary word makes it reviewable/exercisable
      // immediately, not just bookmarked.
      await getOrCreateReviewState('vocab', vocabId, now)
    }
  }

  function VocabRow({ v }: { v: VocabItem }) {
    return (
      <Card className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <PersianText fa={v.fa} translit={v.translit} />
          <p className="truncate text-sm text-[var(--color-ink-muted)]">{v.en}</p>
          {queuedIds.has(v.id) && (
            <span className="mt-1 inline-block rounded-full bg-[var(--color-good-soft)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-good)]">
              in your review queue
            </span>
          )}
        </div>
        <button
          onClick={() => toggleSave(v.id, v.fa, v.translit, v.en)}
          aria-label={savedIds.has(v.id) ? `Remove "${v.en}" from saved words` : `Save "${v.en}"`}
          className={`shrink-0 min-h-11 min-w-11 rounded-full p-2 text-xl ${savedIds.has(v.id) ? 'text-[var(--color-accent)]' : 'text-[var(--color-ink-muted)]'}`}
        >
          {savedIds.has(v.id) ? '★' : '☆'}
        </button>
      </Card>
    )
  }

  return (
    <div>
      <PageHeader title="Dictionary" subtitle="Search Persian or English words, grammar topics, and letters — or browse by topic" />
      <div className="flex flex-col gap-4 px-4 pb-8 md:px-0">
        <div className="flex gap-2 rounded-full bg-[var(--color-surface-raised)] p-1" role="tablist" aria-label="Dictionary mode">
          <button
            role="tab" aria-selected={mode === 'search'}
            onClick={() => setMode('search')}
            className={`min-h-11 flex-1 rounded-full text-sm font-medium ${mode === 'search' ? 'bg-[var(--color-brand)] text-white' : 'text-[var(--color-ink-muted)]'}`}
          >
            Search
          </button>
          <button
            role="tab" aria-selected={mode === 'browse'}
            onClick={() => setMode('browse')}
            className={`min-h-11 flex-1 rounded-full text-sm font-medium ${mode === 'browse' ? 'bg-[var(--color-brand)] text-white' : 'text-[var(--color-ink-muted)]'}`}
          >
            Browse by category
          </button>
        </div>

        {mode === 'search' && (
          <>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search... (سلام, hello, ezafe, ب)"
              aria-label="Search the dictionary"
              className="min-h-14 rounded-2xl border-2 border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-lg outline-none focus:border-[var(--color-brand)]"
            />

            {!results && (
              <p className="text-sm text-[var(--color-ink-muted)]">Type at least 2 characters to search {vocabulary.length}+ words, grammar topics, and the alphabet.</p>
            )}

            {results && (
              <div className="flex flex-col gap-6">
                {results.matchLetters.length > 0 && (
                  <ResultSection title="Letters">
                    {results.matchLetters.map((l) => (
                      <Link key={l.id} to={`/alphabet/${l.id}`}>
                        <Card className="flex items-center gap-3"><PersianText fa={l.forms.isolated} translit={l.name} /></Card>
                      </Link>
                    ))}
                  </ResultSection>
                )}
                {results.matchVocab.length > 0 && (
                  <ResultSection title="Words">
                    {results.matchVocab.map((v) => <VocabRow key={v.id} v={v} />)}
                  </ResultSection>
                )}
                {results.matchSentences.length > 0 && (
                  <ResultSection title="Example sentences">
                    {results.matchSentences.map((s) => (
                      <Card key={s.id}>
                        <PersianText fa={s.fa} translit={s.translit} size="sm" />
                        <p className="text-sm text-[var(--color-ink-muted)]">{s.en}</p>
                      </Card>
                    ))}
                  </ResultSection>
                )}
                {results.matchGrammar.length > 0 && (
                  <ResultSection title="Grammar">
                    {results.matchGrammar.map((g) => (
                      <Card key={g.id}>
                        <p className="font-medium">{g.title}</p>
                        <p className="text-sm text-[var(--color-ink-muted)]">{g.explanation[0]}</p>
                      </Card>
                    ))}
                  </ResultSection>
                )}
                {results.matchVocab.length === 0 && results.matchGrammar.length === 0 && results.matchLetters.length === 0 && results.matchSentences.length === 0 && (
                  <p className="text-sm text-[var(--color-ink-muted)]">No results for "{query}".</p>
                )}
              </div>
            )}
          </>
        )}

        {mode === 'browse' && (
          <>
            {!category && (
              <div className="grid grid-cols-2 gap-2">
                {categories.map(({ category: c, count }) => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className="min-h-14 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-left"
                  >
                    <span className="block text-sm font-medium">{CATEGORY_LABELS[c]}</span>
                    <span className="block text-xs text-[var(--color-ink-muted)]">{count} word{count === 1 ? '' : 's'}</span>
                  </button>
                ))}
              </div>
            )}
            {category && (
              <div className="flex flex-col gap-3">
                <button onClick={() => setCategory(null)} className="self-start text-sm text-[var(--color-brand)]">
                  ← All categories
                </button>
                <p className="text-sm font-medium">{CATEGORY_LABELS[category]} ({browseItems.length})</p>
                <div className="flex flex-col gap-2">
                  {browseItems.map((v) => <VocabRow key={v.id} v={v} />)}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function ResultSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <p className="mb-2 text-sm font-medium text-[var(--color-ink-muted)]">{title}</p>
      <div className="flex flex-col gap-2">{children}</div>
    </section>
  )
}
