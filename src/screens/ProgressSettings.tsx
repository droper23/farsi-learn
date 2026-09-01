import { useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, getSettings, updateSettings, type SavedItem } from '../storage/db'
import { getOrCreateReviewState, suspendItem } from '../storage/progressRepo'
import { exportBackup, downloadBackup, importBackup, resetAllProgress, BackupImportError } from '../storage/backup'
import { isMastered } from '../lib/mastery'
import { useAuth } from '../auth/useAuth'
import { uploadProgress, downloadProgress } from '../auth/sync'
import { useInstallPrompt } from '../hooks/useInstallPrompt'
import { PageHeader } from '../components/shared/PageHeader'
import { Card } from '../components/shared/Card'
import { Button } from '../components/shared/Button'
import { PersianText } from '../components/shared/PersianText'

export function ProgressSettings() {
  const settings = useLiveQuery(() => getSettings(), [])
  const reviewCounts = useLiveQuery(async () => {
    // Suspended items (H3 — "remove from review") are deliberately opted
    // out by the learner; they shouldn't inflate any of these buckets.
    const all = (await db.reviewStates.toArray()).filter((s) => !s.suspended)
    return {
      total: all.length,
      new: all.filter((s) => s.state === 'new').length,
      learning: all.filter((s) => s.state === 'learning' || s.state === 'relearning').length,
      review: all.filter((s) => s.state === 'review').length,
      mastered: all.filter(isMastered).length,
    }
  }, [])
  const savedItems = useLiveQuery(() => db.savedItems.toArray(), []) ?? []
  // vocabId -> suspended, for the "stop reviewing" toggle on each saved
  // word below (H3: previously there was no way to suspend a 'vocab' item
  // at all — only 'custom' entries got suspended, and only on delete).
  const vocabSuspendedById = useLiveQuery(
    () => db.reviewStates.where('kind').equals('vocab').toArray()
      .then((states) => new Map(states.map((s) => [s.itemId, s.suspended ?? false]))),
    [],
  ) ?? new Map<string, boolean>()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [customFa, setCustomFa] = useState('')
  const [customTranslit, setCustomTranslit] = useState('')
  const [customEn, setCustomEn] = useState('')

  const auth = useAuth()
  const [syncing, setSyncing] = useState(false)
  const install = useInstallPrompt()

  async function handleInstall() {
    const outcome = await install.promptInstall()
    if (outcome === 'accepted') setMessage('Installed! Look for Farsi Learn on your home screen or app list.')
  }

  async function handleExport() {
    const payload = await exportBackup()
    downloadBackup(payload)
  }

  async function handleImportFile(file: File) {
    try {
      const text = await file.text()
      await importBackup(JSON.parse(text))
      setMessage('Progress restored from backup.')
    } catch (err) {
      setMessage(err instanceof BackupImportError ? err.message : 'Could not read that file.')
    }
  }

  async function handleAddCustom(e: FormEvent) {
    e.preventDefault()
    if (customFa.trim() === '' || customEn.trim() === '') return
    const now = Date.now()
    const id = `custom-${now}`
    await db.savedItems.add({ id, fa: customFa.trim(), translit: customTranslit.trim(), en: customEn.trim(), createdAt: now, updatedAt: now })
    // Custom entries have no vocabId (nothing in the vetted content model to
    // point at), so they get their own 'custom' SRS kind — see
    // exerciseForReviewable in lib/session.ts.
    await getOrCreateReviewState('custom', id, now)
    setCustomFa(''); setCustomTranslit(''); setCustomEn('')
    setMessage('Added to your saved words and review queue.')
  }

  async function handleDeleteSaved(item: SavedItem) {
    await db.savedItems.delete(item.id)
    if (!item.vocabId) {
      // Stop offering it for review, but keep its SRS history rather than
      // deleting it outright (nothing in this app hard-deletes review
      // states — suspend is the existing mechanism, see progressRepo.ts).
      await suspendItem('custom', item.id, true)
    }
    // A vocab-backed saved item is real curriculum vocabulary, not
    // learner-authored content — un-saving it (removing the bookmark)
    // deliberately does NOT touch its review queue membership. "Stop
    // reviewing" below is the separate, explicit control for that (H3).
  }

  async function handleToggleSuspendVocab(vocabId: string, suspended: boolean) {
    await suspendItem('vocab', vocabId, suspended)
  }

  async function handleReset() {
    if (!confirm('This permanently deletes all local progress on this device. This cannot be undone. Continue?')) return
    await resetAllProgress()
    setMessage('Progress reset.')
  }

  async function handleUpload() {
    if (!auth.user) return
    setSyncing(true)
    try {
      const summary = await uploadProgress(auth.user)
      setMessage(
        summary.reviewStates.fromRemote > 0 || summary.savedItems.fromRemote > 0 || summary.learningEvents.addedFromRemote > 0
          ? `Synced with the cloud — merged in ${summary.reviewStates.fromRemote + summary.savedItems.fromRemote} newer record(s) from another device.`
          : 'Synced your progress to the cloud.',
      )
    } finally {
      setSyncing(false)
    }
  }

  async function handleDownload() {
    if (!auth.user) return
    setSyncing(true)
    try {
      const result = await downloadProgress(auth.user)
      if (!result.found) {
        setMessage('No cloud backup found yet — try "Upload" first.')
      } else {
        const s = result.summary
        setMessage(
          s && (s.reviewStates.fromRemote > 0 || s.savedItems.fromRemote > 0 || s.learningEvents.addedFromRemote > 0)
            ? `Synced with the cloud — merged in ${s.reviewStates.fromRemote + s.savedItems.fromRemote} newer record(s), nothing local was lost.`
            : 'Synced with the cloud — already up to date.',
        )
      }
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div>
      <PageHeader title="Progress" />
      <div className="flex flex-col gap-4 px-4 pb-8 md:px-0">
        {message && (
          <div className="rounded-xl bg-[var(--color-brand-soft)] px-3 py-2 text-sm text-[var(--color-brand-strong)]">{message}</div>
        )}

        <Card>
          <p className="mb-3 text-sm font-medium">Learning stats</p>
          <div className="grid grid-cols-4 gap-2 text-center">
            <Stat label="New" value={reviewCounts?.new ?? 0} />
            <Stat label="Learning" value={reviewCounts?.learning ?? 0} />
            <Stat label="Review" value={reviewCounts?.review ?? 0} />
            <Stat label="Mastered" value={reviewCounts?.mastered ?? 0} />
          </div>
          <Link to="/stats" className="mt-3 block text-center text-sm font-medium text-[var(--color-brand)] underline">
            View detailed stats, letter mastery & milestones →
          </Link>
        </Card>

        {savedItems.length > 0 && (
          <Card>
            <p className="mb-3 text-sm font-medium">Saved words ({savedItems.length})</p>
            <p className="mb-3 text-xs text-[var(--color-ink-muted)]">
              Saved words join your review queue. "Un-save" just removes the bookmark here; "Stop reviewing"
              also takes it out of your review queue.
            </p>
            <ul className="flex flex-col gap-2">
              {savedItems.map((s) => {
                const suspended = s.vocabId ? (vocabSuspendedById.get(s.vocabId) ?? false) : false
                return (
                <li key={s.id} className="flex items-center justify-between gap-2 text-sm">
                  <div className="flex min-w-0 flex-1 items-baseline gap-2">
                    <bdi lang="fa" dir="rtl" className="fa-text shrink-0">{s.fa}</bdi>
                    <span className="truncate text-[var(--color-ink-muted)]">{s.en}</span>
                    {!s.vocabId && (
                      <span className="shrink-0 rounded-full bg-[var(--color-warn-soft)] px-2 py-0.5 text-[10px] font-medium">
                        your own word
                      </span>
                    )}
                    {suspended && (
                      <span className="shrink-0 rounded-full bg-[var(--color-surface-raised)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-ink-muted)]">
                        not being reviewed
                      </span>
                    )}
                  </div>
                  {s.vocabId && (
                    <button
                      type="button"
                      onClick={() => handleToggleSuspendVocab(s.vocabId!, !suspended)}
                      aria-label={suspended ? `Resume reviewing "${s.en}"` : `Stop reviewing "${s.en}"`}
                      className="shrink-0 rounded-full px-2 py-1 text-xs font-medium text-[var(--color-ink-muted)] hover:bg-[var(--color-brand-soft)] hover:text-[var(--color-brand)]"
                    >
                      {suspended ? 'Resume' : 'Stop reviewing'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeleteSaved(s)}
                    aria-label={`Remove "${s.en}" from saved words`}
                    className="shrink-0 rounded-full p-1.5 text-[var(--color-ink-muted)] hover:bg-[var(--color-bad-soft)] hover:text-[var(--color-bad)]"
                  >
                    ✕
                  </button>
                </li>
                )
              })}
            </ul>
          </Card>
        )}

        <Card>
          <p className="mb-1 text-sm font-medium">Add a word to remember</p>
          <p className="mb-3 text-xs text-[var(--color-ink-muted)]">
            For a word you've picked up elsewhere — not from this app's vetted vocabulary, so it's clearly
            labeled as your own. It joins your review queue just like saved dictionary words.
          </p>
          <form onSubmit={handleAddCustom} className="flex flex-col gap-2">
            <input
              type="text" value={customFa} onChange={(e) => setCustomFa(e.target.value)}
              placeholder="Persian (e.g. کتاب)" dir="rtl" lang="fa"
              aria-label="Persian text for the new word"
              className="fa-text min-h-12 rounded-xl border border-[var(--color-border)] bg-transparent px-3 py-2 text-right outline-none focus:border-[var(--color-brand)]"
            />
            <input
              type="text" value={customTranslit} onChange={(e) => setCustomTranslit(e.target.value)}
              placeholder="Transliteration (optional)"
              aria-label="Transliteration for the new word"
              className="min-h-12 rounded-xl border border-[var(--color-border)] bg-transparent px-3 py-2 outline-none focus:border-[var(--color-brand)]"
            />
            <input
              type="text" value={customEn} onChange={(e) => setCustomEn(e.target.value)}
              placeholder="English meaning"
              aria-label="English meaning for the new word"
              className="min-h-12 rounded-xl border border-[var(--color-border)] bg-transparent px-3 py-2 outline-none focus:border-[var(--color-brand)]"
            />
            <Button type="submit" variant="secondary" disabled={customFa.trim() === '' || customEn.trim() === ''}>
              Add to saved words
            </Button>
          </form>
        </Card>

        <Card>
          <p className="mb-3 text-sm font-medium">Settings</p>
          <div className="py-2">
            <span className="mb-2 block text-sm">Appearance</span>
            <div className="flex gap-2" aria-label="Theme">
              {(['system', 'light', 'dark'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  aria-pressed={(settings?.theme ?? 'system') === t}
                  onClick={() => updateSettings({ theme: t })}
                  className={`min-h-11 flex-1 rounded-xl border px-3 py-2 text-sm capitalize ${
                    (settings?.theme ?? 'system') === t
                      ? 'border-[var(--color-brand)] bg-[var(--color-brand-soft)] text-[var(--color-brand-strong)]'
                      : 'border-[var(--color-border)] text-[var(--color-ink-muted)]'
                  }`}
                >
                  {t === 'system' ? 'Auto' : t}
                </button>
              ))}
            </div>
          </div>
          <label className="flex items-center justify-between py-2">
            <span className="text-sm">Show transliteration</span>
            <input
              type="checkbox"
              checked={settings?.showTransliteration ?? true}
              onChange={(e) => updateSettings({ showTransliteration: e.target.checked })}
              className="h-5 w-5"
            />
          </label>
          <label className="flex items-center justify-between gap-3 py-2">
            <span className="text-sm">
              Show vowel marks
              <span className="block text-xs text-[var(--color-ink-muted)]">
                Short-vowel diacritics (اَ اِ اُ) that ordinary Persian writing normally leaves out
              </span>
            </span>
            <input
              type="checkbox"
              checked={settings?.showDiacritics ?? false}
              onChange={(e) => updateSettings({ showDiacritics: e.target.checked })}
              className="h-5 w-5 shrink-0"
            />
          </label>
          <label className="flex items-center justify-between py-2">
            <span className="text-sm">Reduce motion</span>
            <input
              type="checkbox"
              checked={settings?.reducedMotion ?? false}
              onChange={(e) => updateSettings({ reducedMotion: e.target.checked })}
              className="h-5 w-5"
            />
          </label>
          <label className="flex items-center justify-between py-2">
            <span className="text-sm">New items per day</span>
            <input
              type="number" min={1} max={100}
              value={settings?.newItemsPerDay ?? 15}
              onChange={(e) => updateSettings({ newItemsPerDay: Number(e.target.value) })}
              className="w-16 rounded-lg border border-[var(--color-border)] bg-transparent px-2 py-1 text-right"
            />
          </label>
          <label className="flex items-center justify-between py-2">
            <span className="text-sm">Max reviews per day</span>
            <input
              type="number" min={10} max={1000}
              value={settings?.maxReviewsPerDay ?? 150}
              onChange={(e) => updateSettings({ maxReviewsPerDay: Number(e.target.value) })}
              className="w-16 rounded-lg border border-[var(--color-border)] bg-transparent px-2 py-1 text-right"
            />
          </label>
        </Card>

        {(install.canInstall || install.isIOSSafariManual) && (
          <Card>
            <p className="mb-1 text-sm font-medium">Install Farsi Learn</p>
            {install.canInstall && (
              <>
                <p className="mb-3 text-xs text-[var(--color-ink-muted)]">
                  Install it like an app — works offline, opens in its own window, no browser chrome.
                </p>
                <Button onClick={handleInstall}>Install app</Button>
              </>
            )}
            {install.isIOSSafariManual && (
              <p className="text-xs text-[var(--color-ink-muted)]">
                On iPhone/iPad: tap the Share button in Safari, then "Add to Home Screen".
              </p>
            )}
          </Card>
        )}

        <Card>
          <p className="mb-3 text-sm font-medium">Your data</p>
          <p className="mb-3 text-xs text-[var(--color-ink-muted)]">
            All progress lives only in this browser (IndexedDB) unless you sync below. Back it up as a JSON file any time.
          </p>
          <div className="flex flex-col gap-2">
            <Button variant="secondary" onClick={handleExport}>Export backup (.json)</Button>
            <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>Import backup</Button>
            <input
              ref={fileInputRef} type="file" accept="application/json" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImportFile(f); e.target.value = '' }}
            />
            <Button variant="danger" onClick={handleReset}>Reset all progress</Button>
          </div>
        </Card>

        <Card>
          <p className="mb-1 text-sm font-medium">Cloud sync (optional)</p>
          {!auth.enabled && (
            <p className="text-xs text-[var(--color-ink-muted)]">
              Not configured. The app works fully offline; see the README "Optional cloud sync" section to enable
              signing in and syncing progress across devices with your own free Firebase project.
            </p>
          )}
          {auth.enabled && !auth.user && (
            <div className="flex flex-col gap-2">
              <p className="text-xs text-[var(--color-ink-muted)]">Sign in to back up and sync progress across your devices.</p>
              <Button onClick={auth.signIn}>Sign in with Google</Button>
            </div>
          )}
          {auth.enabled && auth.user && (
            <div className="flex flex-col gap-2">
              <p className="text-sm">Signed in as {auth.user.displayName ?? auth.user.email}</p>
              <p className="text-xs text-[var(--color-ink-muted)]">
                Both buttons merge — the newer version of each record wins on both sides. Nothing is silently
                overwritten, even if another device made changes since your last sync.
              </p>
              <div className="flex gap-2">
                <Button onClick={handleUpload} disabled={syncing} className="flex-1">Sync (push first)</Button>
                <Button onClick={handleDownload} disabled={syncing} variant="secondary" className="flex-1">Sync (pull first)</Button>
              </div>
              <Button onClick={auth.signOut} variant="ghost">Sign out</Button>
            </div>
          )}
        </Card>

        <p className="fa-text text-center text-xs text-[var(--color-ink-muted)]"><PersianText fa="موفق باشید!" translit="movaffagh bāshid! — good luck!" size="sm" /></p>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-xl font-semibold">{value}</p>
      <p className="text-[10px] text-[var(--color-ink-muted)]">{label}</p>
    </div>
  )
}
