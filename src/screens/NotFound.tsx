import { Link } from 'react-router-dom'
import { PageHeader } from '../components/shared/PageHeader'

export function NotFound() {
  return (
    <div>
      <PageHeader title="Page not found" />
      <div className="px-4 md:px-0"><Link to="/" className="text-[var(--color-brand)] underline">Back to home</Link></div>
    </div>
  )
}
