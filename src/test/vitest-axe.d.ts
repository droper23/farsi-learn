/**
 * vitest-axe@0.1.0 was built against an older Vitest type API (it augments
 * the legacy `Vi.Assertion` namespace) and doesn't line up with this
 * project's Vitest 4, so `expect(...).toHaveNoViolations()` isn't visible
 * to the type checker even though the matcher is registered and works at
 * runtime (see setupTests.ts). This re-declares the same augmentation
 * against the module Vitest 4 actually uses, following the same pattern
 * @testing-library/jest-dom/types/vitest.d.ts uses for its own matchers.
 */
import 'vitest'
import type { AxeResults, Result } from 'axe-core'

interface NoViolationsMatcherResult {
  message(): string
  pass: boolean
  actual: Result[]
}

declare module 'vitest' {
  interface Assertion<T = unknown> {
    toHaveNoViolations: T extends AxeResults ? () => NoViolationsMatcherResult : never
  }
}
