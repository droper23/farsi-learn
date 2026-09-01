import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ensureSettingsRow } from './storage/db.ts'
import { ErrorBoundary } from './components/shared/ErrorBoundary.tsx'

ensureSettingsRow()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
