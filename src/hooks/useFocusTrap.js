import { useEffect, useRef } from 'react'

export default function useFocusTrap(ref, isActive, onClose = null) {
  const previousFocusRef = useRef(null)

  useEffect(() => {
    if (!isActive || !ref.current) return

    // Cap the current active element before we trap focus
    previousFocusRef.current = document.activeElement

    const focusableElements = ref.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    const handleKeyDown = (e) => {
      // 1. ESC Key Support
      if (e.key === 'Escape' && onClose) {
        onClose()
        return
      }

      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus()
          e.preventDefault()
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus()
          e.preventDefault()
        }
      }
    }

    // 2. Initial Focus Handling
    // Delay slightly to ensure animations complete before forcing focus
    const focusTimeout = setTimeout(() => {
      if (focusableElements.length > 0 && !ref.current.contains(document.activeElement)) {
        firstElement.focus()
      }
    }, 100)

    document.addEventListener('keydown', handleKeyDown)
    
    return () => {
      clearTimeout(focusTimeout)
      document.removeEventListener('keydown', handleKeyDown)
      
      // 3. Return Focus on Close
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus()
      }
    }
  }, [isActive, ref, onClose])
}
