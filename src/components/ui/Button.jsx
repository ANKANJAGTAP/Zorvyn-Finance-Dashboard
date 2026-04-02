import { forwardRef } from 'react'
import { motion } from 'framer-motion'

const variants = {
  primary:
    'bg-gradient-to-r from-primary to-accent-purple text-white shadow-[0_2px_10px_rgba(66,124,240,0.3)] hover:shadow-[0_4px_20px_rgba(66,124,240,0.45)]',
  secondary:
    'bg-white/[0.06] border border-white/10 text-white hover:bg-white/[0.1] hover:border-white/20',
  ghost:
    'text-text-secondary hover:text-white hover:bg-white/[0.06]',
  danger:
    'bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20 hover:border-danger/30',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs min-h-[32px] rounded-lg gap-1.5',
  md: 'px-4 py-2.5 text-sm min-h-[44px] rounded-lg gap-2',
  lg: 'px-6 py-3.5 text-sm min-h-[48px] rounded-xl gap-2',
}

const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    className = '',
    'aria-label': ariaLabel,
    ...props
  },
  ref
) {
  const baseClasses =
    'relative inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-main select-none'

  const disabledClasses = disabled || loading
    ? 'opacity-50 cursor-not-allowed pointer-events-none'
    : 'cursor-pointer'

  return (
    <motion.button
      ref={ref}
      whileTap={!disabled && !loading ? { scale: 0.97 } : undefined}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${disabledClasses} ${className}`}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-busy={loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4 flex-shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </motion.button>
  )
})

export default Button
