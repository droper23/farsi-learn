/**
 * Dumps every unique Persian string that should have a pre-generated audio
 * clip (alphabet letter names, vocabulary, sentences) to a plain JSON array,
 * for scripts/generate_audio.py to synthesize.
 *
 * Run with: npx tsx scripts/collect-audio-text.ts > scripts/.audio-texts.json
 * (not part of the app build — a one-off/occasional content-audio pipeline
 * step, re-run whenever new content is authored; see README "Audio".)
 */
import { vocabulary } from '../src/content/vocabulary/index.ts'
import { sentences } from '../src/content/sentences/index.ts'
import { alphabet } from '../src/content/alphabet.ts'

const texts = new Set<string>()
for (const l of alphabet) {
  texts.add(l.nameFa)
  for (const w of l.exampleWords) texts.add(w.fa)
}
for (const v of vocabulary) texts.add(v.fa)
for (const s of sentences) texts.add(s.fa)

process.stdout.write(JSON.stringify([...texts], null, 0))
