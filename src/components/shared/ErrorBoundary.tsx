import { Component, type ErrorInfo, type ReactNode } from 'react'
import { resetAllProgress } from '../../storage/backup'
import { Card } from './Card'
import { Button } from './Button'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  error: Error | null
}

/** Top-level crash guard (H4). Without this, any uncaught render error
 *  (a bad id lookup, an IndexedDB race, a malformed imported backup)
 *  unmounts the whole tree and leaves a blank white page with no recovery
 *  path — a trust-destroying failure for an app that owns the learner's
 *  progress data. The fallback is calm and explicit that progress is safe
 *  (it lives in IndexedDB, untouched by a render crash) and offers reload
 *  as the first, non-destructive option. */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary] caught render error', error, info.componentStack)
  }

  handleReload = () => {
    window.location.reload()
  }

  handleReset = async () => {
    if (!confirm('This permanently deletes all local progress on this device. This cannot be undone. Continue?')) return
    await resetAllProgress()
    window.location.reload()
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 p-6">
        <Card className="flex flex-col gap-3 text-center">
          <span className="text-3xl" aria-hidden="true">⚠️</span>
          <p className="text-lg font-semibold text-[var(--color-ink)]">Something went wrong</p>
          <p className="text-sm text-[var(--color-ink-muted)]">
            Your progress is safe — it's stored on this device and this error didn't touch it. Reloading usually fixes it.
          </p>
          <div className="flex flex-col gap-2 pt-2">
            <Button onClick={this.handleReload} fullWidth>Reload</Button>
            <Button onClick={this.handleReset} variant="danger" fullWidth>Reset progress and reload</Button>
          </div>
        </Card>
      </div>
    )
  }
}
