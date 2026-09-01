import { useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { vocabulary } from '../content/vocabulary'
import { grammar } from '../content/grammar'
import { alphabet } from '../content/alphabet'
import { sentences } from '../content/sentences'
import { normalizeLatin, normalizePersian } from '../lib/persianText'
import { db } from '../storage/db'
import { useLiveQuery } from 'dexie-react-hooks'
import { PageHeader } from '../components/shared/PageHeader'
import { Card } from '../components/shared/Card'
import { PersianText } from '../components/shared/PersianText'

export function Dictionary() {
  const [query, setQuery] = useState('')
  const savedIds = useLiveQuery(() => db.savedItems.toArray().then((s) => new Set(s.map((x) => x.vocabId))), []) ?? new Set()

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

  async function toggleSave(vocabId: string, fa: string, translit: string, en: string) {
    if (savedIds.has(vocabId)) {
      const existing = await db.savedItems.where('vocabId').equals(vocabId).first()
      if (existing) await db.savedItems.delete(existing.id)
    } else {
      // Not a render path — this runs from a click handler.
      // oxlint-disable-next-line react/purity
      const now = Date.now()
      await db.savedItems.add({ id: `saved-${vocabId}-${now}`, vocabId, fa, translit, en, createdAt: now })
    }
  }

  return (
    <div>
      <PageHeader title="Dictionary" subtitle="Search Persian or English words, grammar topics, and letters" />
      <div className="flex flex-col gap-4 px-4 pb-8 md:px-0">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search... (سلام, hello, ezafe, ب)"
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
                {results.matchVocab.map((v) => (
                  <Card key={v.id} className="flex items-center justify-between gap-3">
                    <div>
                      <PersianText fa={v.fa} translit={v.translit} />
                      <p className="text-sm text-[var(--color-ink-muted)]">{v.en}</p>
                    </div>
                    <button
                      onClick={() => toggleSave(v.id, v.fa, v.translit, v.en)}
                      aria-label={savedIds.has(v.id) ? 'Remove from saved words' : 'Save word'}
                      className={`shrink-0 rounded-full p-2 ${savedIds.has(v.id) ? 'text-[var(--color-accent)]' : 'text-[var(--color-ink-muted)]'}`}
                    >
                      {savedIds.has(v.id) ? '★' : '☆'}
                    </button>
                  </Card>
                ))}
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
