import { NavLink, Outlet } from 'react-router-dom'
import { navItems } from './nav'
import { NavIcon } from './NavIcon'

export function AppShell() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-6xl md:gap-6 md:px-6">
      <aside className="sticky top-0 hidden h-dvh w-56 shrink-0 flex-col gap-1 border-r border-[var(--color-border)] py-6 pe-3 md:flex">
        <div className="mb-6 flex items-center gap-2 px-2">
          <span className="fa-text text-2xl text-[var(--color-brand)]">ف</span>
          <span className="text-lg font-semibold">Farsi Learn</span>
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive ? 'bg-[var(--color-brand-soft)] text-[var(--color-brand-strong)]' : 'text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-raised)]'
              }`
            }
          >
            <NavIcon icon={item.icon} />
            {item.label}
          </NavLink>
        ))}
      </aside>

      <main className="min-h-dvh w-full flex-1 pb-24 md:pb-6">
        <div className="safe-top" />
        <Outlet />
      </main>

      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-20 flex border-t border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur md:hidden">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-medium ${
                isActive ? 'text-[var(--color-brand)]' : 'text-[var(--color-ink-muted)]'
              }`
            }
          >
            <NavIcon icon={item.icon} />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
