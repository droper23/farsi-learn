/**
 * Content confidence audit.
 *
 * Scans every piece of linguistic content under src/content/, groups it by
 * `confidence` status, and prints a human-readable report — in particular a
 * full listing of every 'needs-review' item (id, Persian text, gloss, and
 * the note explaining why it's flagged). This is the working document a
 * Persian speaker uses to go check the flagged items; it does not change
 * anything itself.
 *
 * Run with: npm run audit:content
 *
 * Not part of the app build or `tsc -b` project graph — it's a standalone
 * dev-time tool, run with tsx (a plain ts-node-style runner) rather than
 * bundled through Vite.
 */

import type { ConfidenceStatus } from '../src/content/types.ts'
import { vocabulary } from '../src/content/vocabulary/index.ts'
import { sentences } from '../src/content/sentences/index.ts'
import { grammarConcepts } from '../src/content/grammar/concepts.ts'
import { alphabet, shortVowels } from '../src/content/alphabet.ts'
import { passages } from '../src/content/passages/index.ts'

interface AuditRow {
  type: string
  id: string
  fa: string
  gloss: string
  confidence: ConfidenceStatus
  note?: string
}

const rows: AuditRow[] = [
  ...vocabulary.map((v): AuditRow => ({
    type: 'vocab', id: v.id, fa: v.fa, gloss: v.en, confidence: v.confidence, note: v.note,
  })),
  ...sentences.map((s): AuditRow => ({
    type: 'sentence', id: s.id, fa: s.fa, gloss: s.en, confidence: s.confidence, note: s.note,
  })),
  ...grammarConcepts.map((g): AuditRow => ({
    type: 'grammar', id: g.id, fa: g.titleFa ?? '—', gloss: g.title, confidence: g.confidence, note: g.note,
  })),
  ...alphabet.map((l): AuditRow => ({
    type: 'alphabet', id: l.id, fa: l.forms.isolated, gloss: l.name, confidence: l.confidence, note: l.note,
  })),
  ...shortVowels.map((v): AuditRow => ({
    type: 'short-vowel', id: v.id, fa: v.diacritic, gloss: v.name, confidence: v.confidence, note: v.note,
  })),
  ...passages.map((p): AuditRow => ({
    type: 'passage', id: p.id, fa: p.titleFa ?? '—', gloss: p.title, confidence: p.confidence, note: p.note,
  })),
]

const byStatus = new Map<ConfidenceStatus, AuditRow[]>()
for (const row of rows) {
  const list = byStatus.get(row.confidence) ?? []
  list.push(row)
  byStatus.set(row.confidence, list)
}

const statuses: ConfidenceStatus[] = ['high-confidence', 'verified', 'needs-review']

console.log('Farsi Learn — content confidence audit')
console.log('='.repeat(60))
console.log(`Total content items scanned: ${rows.length}`)
console.log()

for (const status of statuses) {
  const list = byStatus.get(status) ?? []
  console.log(`${status}: ${list.length}`)
}
console.log()

const needsReview = (byStatus.get('needs-review') ?? []).sort((a, b) => a.type.localeCompare(b.type) || a.id.localeCompare(b.id))

if (needsReview.length === 0) {
  console.log('Nothing flagged — no needs-review items found.')
} else {
  console.log('-'.repeat(60))
  console.log(`needs-review items (${needsReview.length}) — verify with a Persian speaker:`)
  console.log('-'.repeat(60))
  for (const row of needsReview) {
    console.log()
    console.log(`[${row.type}] ${row.id}`)
    console.log(`  fa:    ${row.fa}`)
    console.log(`  gloss: ${row.gloss}`)
    console.log(`  note:  ${row.note ?? '(no note — add one explaining why this is flagged)'}`)
  }
}

console.log()
console.log('='.repeat(60))
console.log(
  `Done. ${needsReview.length} item(s) need a Persian speaker's review; ` +
  `${(byStatus.get('verified') ?? []).length} already verified; ` +
  `${(byStatus.get('high-confidence') ?? []).length} standard/high-confidence.`,
)

// Non-zero exit when something is flagged is deliberately NOT done here —
// needs-review is an expected, tracked steady state (see PROGRESS.md), not
// a build failure. This script is a report, not a gate.
