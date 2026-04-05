import { useState, useEffect } from 'react'

/**
 * Reactive media-query hook — re-renders when breakpoint changes.
 * Usage: const isMobile = useMediaQuery('(max-width: 767px)')
 */
export default function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    const mql = window.matchMedia(query)
    const handler = (e) => setMatches(e.matches)

    // Modern API
    if (mql.addEventListener) {
      mql.addEventListener('change', handler)
      return () => mql.removeEventListener('change', handler)
    }
    // Fallback for older browsers
    mql.addListener(handler)
    return () => mql.removeListener(handler)
  }, [query])

  return matches
}
