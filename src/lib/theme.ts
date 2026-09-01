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
