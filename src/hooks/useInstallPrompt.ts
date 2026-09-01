import { useEffect, useState } from 'react'

/** Minimal typing for the non-standard `beforeinstallprompt` event —
 *  Chromium-based browsers only; not in lib.dom.d.ts. */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia?.('(display-mode: standalone)').matches === true
    // iOS Safari's non-standard flag for "launched from home screen".
    || (window.navigator as unknown as { standalone?: boolean }).standalone === true
  )
}

function isIOSSafari(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  return /iPad|iPhone|iPod/.test(ua) && !/CriOS|FxiOS/.test(ua)
}

export interface InstallPromptState {
  /** Chromium install prompt is available right now (`beforeinstallprompt`
   *  fired and hasn't been used/dismissed yet). */
  canInstall: boolean
  /** Already running as an installed/home-screen app — nothing to offer. */
  isInstalled: boolean
  /** iOS Safari never fires `beforeinstallprompt` — "Add to Home Screen"
   *  has to be done manually via the share sheet, so show instructions
   *  instead of a button when this is true (and not already installed). */
  isIOSSafariManual: boolean
  promptInstall: () => Promise<'accepted' | 'dismissed' | 'unavailable'>
}

/** Wraps the `beforeinstallprompt` flow (Chromium/Android/desktop) plus an
 *  "instructions" fallback flag for iOS Safari, which never fires that
 *  event. No polling, no nagging — the event only fires when the browser
 *  itself decides the page is installable. */
export function useInstallPrompt(): InstallPromptState {
  const [deferredEvent, setDeferredEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(isStandalone())

  useEffect(() => {
    function onBeforeInstallPrompt(e: Event) {
      e.preventDefault()
      setDeferredEvent(e as BeforeInstallPromptEvent)
    }
    function onAppInstalled() {
      setInstalled(true)
      setDeferredEvent(null)
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onAppInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('appinstalled', onAppInstalled)
    }
  }, [])

  return {
    canInstall: deferredEvent !== null && !installed,
    isInstalled: installed,
    isIOSSafariManual: !installed && deferredEvent === null && isIOSSafari(),
    async promptInstall() {
      if (!deferredEvent) return 'unavailable'
      await deferredEvent.prompt()
      const { outcome } = await deferredEvent.userChoice
      setDeferredEvent(null)
      return outcome
    },
  }
}
