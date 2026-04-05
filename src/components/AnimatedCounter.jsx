import { useState, useEffect, useRef, useCallback } from 'react'
import useMediaQuery from '../hooks/useMediaQuery'

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

/**
 * Compact format for mobile: ₹8.6L, ₹52.8K, ₹10L
 * No trailing .0 — clean values only
 */
function formatCompact(value) {
  const abs = Math.abs(value)
  if (abs >= 10000000) {
    const cr = abs / 10000000
    return `₹${cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(1).replace(/\.0$/, '')}Cr`
  }
  if (abs >= 100000) {
    const l = abs / 100000
    return `₹${l % 1 === 0 ? l.toFixed(0) : l.toFixed(1).replace(/\.0$/, '')}L`
  }
  if (abs >= 1000) {
    const k = abs / 1000
    return `₹${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1).replace(/\.0$/, '')}K`
  }
  return `₹${abs.toFixed(0)}`
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
  const isMobile = useMediaQuery('(max-width: 767px)')
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
    formatted = isMobile ? formatCompact(displayValue) : formatINR(displayValue)
  } else {
    formatted = displayValue.toFixed(0)
  }

  // Full value for tooltip on mobile
  const fullValue = isCurrency ? formatINR(value) : undefined

  return (
    <span className={className} aria-live="polite" title={isMobile ? fullValue : undefined}>
      {prefix}{formatted}{suffix}
    </span>
  )
}
