import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * Easing function — ease-out cubic for a decelerating feel
 */
function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3)
}

/**
 * Format number in Indian Rupee style: ₹1,24,500.00
 */
function formatINR(value) {
  const abs = Math.abs(value)
  return '₹' + abs.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export default function AnimatedCounter({
  value,
  duration = 1200,
  prefix = '',
  suffix = '',
  isPercentage = false,
  isCurrency = true,
  className = '',
  formatFn,
}) {
  const [displayValue, setDisplayValue] = useState(0)
  const previousValue = useRef(0)
  const animationRef = useRef(null)
  const startTimeRef = useRef(null)

  const animate = useCallback(
    (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp

      const elapsed = timestamp - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = easeOutCubic(progress)

      const from = previousValue.current
      const to = value
      const current = from + (to - from) * easedProgress

      setDisplayValue(current)

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        setDisplayValue(to)
        previousValue.current = to
      }
    },
    [value, duration]
  )

  useEffect(() => {
    // Cancel any running animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    startTimeRef.current = null
    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [animate])

  // Determine display string
  let formatted
  if (formatFn) {
    formatted = formatFn(displayValue)
  } else if (isPercentage) {
    formatted = `${displayValue.toFixed(1)}%`
  } else if (isCurrency) {
    formatted = formatINR(displayValue)
  } else {
    formatted = displayValue.toFixed(0)
  }

  return (
    <span className={className} aria-live="polite">
      {prefix}{formatted}{suffix}
    </span>
  )
}
