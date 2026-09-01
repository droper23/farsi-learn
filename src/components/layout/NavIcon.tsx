import type { NavItem } from './nav'

const paths: Record<NavItem['icon'], string> = {
  home: 'M4 11.5 12 4l8 7.5M6 10v9h12v-9',
  learn: 'M4 6.5c2.5-1.5 5.5-1.5 8 0c2.5-1.5 5.5-1.5 8 0v11c-2.5-1.5-5.5-1.5-8 0c-2.5-1.5-5.5-1.5-8 0Z',
  review: 'M4 4v6h6M20 20v-6h-6M5 14a8 8 0 0 0 14.9 3M19 10A8 8 0 0 0 4.1 7',
  practice: 'M4 20h4L18.5 9.5a2.121 2.121 0 0 0-3-3L5 17v3Zm10.5-13.5 3 3',
  dictionary: 'M11 19a8 8 0 1 0 0-16a8 8 0 0 0 0 16Zm9 2-4.35-4.35',
  progress: 'M5 20V10M12 20V4M19 20v-7',
}

export function NavIcon({ icon }: { icon: NavItem['icon'] }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d={paths[icon]} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
