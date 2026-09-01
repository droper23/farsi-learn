export interface NavItem {
  to: string
  label: string
  icon: 'home' | 'learn' | 'review' | 'dictionary' | 'progress'
}

export const navItems: NavItem[] = [
  { to: '/', label: 'Home', icon: 'home' },
  { to: '/learn', label: 'Learn', icon: 'learn' },
  { to: '/review', label: 'Review', icon: 'review' },
  { to: '/dictionary', label: 'Dictionary', icon: 'dictionary' },
  { to: '/progress', label: 'Progress', icon: 'progress' },
]
