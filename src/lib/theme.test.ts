import { describe, expect, it } from 'vitest'
import { applyTheme, applyReducedMotion } from './theme'

describe('applyTheme', () => {
  it('sets data-theme for an explicit choice and clears it for system', () => {
    const root = document.createElement('html')
    applyTheme('dark', root)
    expect(root.getAttribute('data-theme')).toBe('dark')
    applyTheme('system', root)
    expect(root.hasAttribute('data-theme')).toBe(false)
  })
})

describe('applyReducedMotion (L1)', () => {
  it('sets data-reduced-motion when enabled and clears it when disabled', () => {
    const root = document.createElement('html')
    applyReducedMotion(true, root)
    expect(root.getAttribute('data-reduced-motion')).toBe('true')
    applyReducedMotion(false, root)
    expect(root.hasAttribute('data-reduced-motion')).toBe(false)
  })
})
