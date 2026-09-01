export type ThemePreference = 'system' | 'light' | 'dark'

/** Applies a theme preference to the document root as `data-theme`, which
 *  index.css reads to override the `prefers-color-scheme` media query (see
 *  its top comment). 'system' means "no explicit choice" — clearing the
 *  attribute lets the OS-level media query decide, same as before this
 *  feature existed. */
export function applyTheme(theme: ThemePreference, root: HTMLElement = document.documentElement): void {
  if (theme === 'system') {
    root.removeAttribute('data-theme')
  } else {
    root.setAttribute('data-theme', theme)
  }
}

/** Applies the in-app "reduce motion" override as `data-reduced-motion`,
 *  which index.css's `prefers-reduced-motion` block also matches — an
 *  explicit in-app choice that works the same as the OS-level setting,
 *  for learners whose OS/browser doesn't expose or reliably report that
 *  preference (see review L1: this setting existed in storage but nothing
 *  read it). `false` clears the attribute so the OS-level media query
 *  alone decides, same as before this existed. */
export function applyReducedMotion(reducedMotion: boolean, root: HTMLElement = document.documentElement): void {
  if (reducedMotion) {
    root.setAttribute('data-reduced-motion', 'true')
  } else {
    root.removeAttribute('data-reduced-motion')
  }
}
