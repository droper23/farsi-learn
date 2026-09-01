import { Link } from 'react-router-dom'
import { alphabet, shortVowels, persianDigits } from '../../content/alphabet'
import { PageHeader } from '../../components/shared/PageHeader'
import { Card } from '../../components/shared/Card'

export function AlphabetOverview() {
  return (
    <div>
      <PageHeader title="The Alphabet" subtitle="Tap a letter to see its forms, sound, and example words" />
      <div className="flex flex-col gap-6 px-4 pb-8 md:px-0">
        <Card>
          <p className="mb-3 text-sm font-medium">32 letters</p>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
            {alphabet.map((l) => (
              <Link
                key={l.id}
                to={`/alphabet/${l.id}`}
                className="flex flex-col items-center gap-1 rounded-xl border border-[var(--color-border)] p-3 hover:border-[var(--color-brand)] hover:bg-[var(--color-brand-soft)]"
              >
                <bdi lang="fa" dir="rtl" className="fa-text text-2xl">{l.forms.isolated}</bdi>
                <span className="text-[10px] text-[var(--color-ink-muted)]">{l.name}</span>
              </Link>
            ))}
          </div>
        </Card>

        <Card>
          <p className="mb-3 text-sm font-medium">Short vowels (usually unwritten)</p>
          <div className="flex flex-wrap gap-3">
            {shortVowels.map((v) => (
              <div key={v.id} className="text-center">
                <bdi lang="fa" dir="rtl" className="fa-text text-3xl">{`ا${v.diacritic}`}</bdi>
                <p className="text-xs text-[var(--color-ink-muted)]">{v.name} — {v.transliteration}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <p className="mb-3 text-sm font-medium">Persian numerals</p>
          <div className="grid grid-cols-5 gap-2 text-center">
            {persianDigits.map((d) => (
              <div key={d.digit}>
                <bdi lang="fa" dir="ltr" className="fa-text text-2xl">{d.arabicIndicDigit}</bdi>
                <p className="text-xs text-[var(--color-ink-muted)]">{d.name}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
