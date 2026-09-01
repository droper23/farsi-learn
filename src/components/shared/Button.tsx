import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  fullWidth?: boolean
}

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-[var(--color-brand)] text-white hover:brightness-110 active:brightness-95',
  secondary: 'bg-[var(--color-surface)] text-[var(--color-ink)] border border-[var(--color-border)] hover:bg-[var(--color-brand-soft)]',
  ghost: 'bg-transparent text-[var(--color-ink)] hover:bg-[var(--color-brand-soft)]',
  danger: 'bg-[var(--color-bad)] text-white hover:brightness-110',
}

/** Large, thumb-friendly button (min 48px tall) per the mobile-first touch
 *  target requirement. */
export function Button({ variant = 'primary', fullWidth, className, children, ...rest }: ButtonProps) {
  return (
    <button
      className={`min-h-12 rounded-2xl px-5 py-3 text-base font-medium transition-colors disabled:opacity-40 disabled:pointer-events-none ${variantClasses[variant]} ${fullWidth ? 'w-full' : ''} ${className ?? ''}`}
      {...rest}
    >
      {children}
    </button>
  )
}
