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
  // Labeled "Profile" rather than "Progress" — this one screen holds stats,
  // custom saved words, app settings, data export/import, and cloud sync,
  // which "Progress" alone undersells. See Pass 4 UX review.
  { to: '/progress', label: 'Profile', icon: 'progress' },
]
