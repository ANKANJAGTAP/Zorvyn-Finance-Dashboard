import { useState, useRef, useEffect, useId } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

export default function GlassHoverDropdown({ 
  value, 
  onChange, 
  options, 
  icon: Icon,
  placeholder,
  align = 'left'
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [hoveredRow, setHoveredRow] = useState(null)
  const timeoutRef = useRef(null)
  const compId = useId()

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      setIsOpen(true)
    }, 120)
  }

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false)
    }, 150)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const selectedOption = options.find(opt => opt.value === value)
  const displayLabel = selectedOption ? selectedOption.label : placeholder

  return (
    <div 
      className="relative z-[60]"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button 
        className="flex items-center gap-2 h-[42px] px-4 rounded-xl text-sm bg-white/[0.04] border border-white/[0.06] text-white hover:bg-white/[0.08] transition-all duration-200"
      >
        {Icon && <Icon size={14} className="text-text-muted" />}
        <span className="font-medium whitespace-nowrap">{displayLabel}</span>
        <ChevronDown size={14} className={`text-text-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1, pointerEvents: 'auto' }}
            exit={{ opacity: 0, y: 5, scale: 0.95, pointerEvents: 'none' }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            onMouseLeave={() => setHoveredRow(null)}
            className={`absolute top-full pt-2 min-w-[160px] z-50 ${align === 'right' ? 'right-0' : 'left-0'}`}
          >
            <div className="p-1.5 rounded-[20px] bg-bg-card/80 backdrop-blur-xl border border-white/[0.1] shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
              {options.map((option) => {
                const isActive = value === option.value
                const isHov = hoveredRow === option.value && !isActive

                return (
                  <button
                    key={option.value}
                    onMouseEnter={() => setHoveredRow(option.value)}
                    onClick={() => {
                      onChange(option.value)
                      setIsOpen(false)
                    }}
                    className={`relative w-full flex items-center px-3 py-2.5 rounded-lg text-sm transition-colors duration-150 text-left outline-none ${
                      isActive
                        ? 'text-primary'
                        : 'text-text-secondary hover:text-white'
                    }`}
                  >
                    {/* Sliding hover pill */}
                    {isHov && (
                      <motion.span
                        layoutId={`dropdown-hover-bg-${compId}`}
                        className="absolute inset-0 rounded-lg bg-white/[0.06]"
                        transition={{
                          type: 'spring',
                          stiffness: 350,
                          damping: 25,
                          mass: 0.8,
                        }}
                      />
                    )}

                    {/* Active background */}
                    {isActive && (
                      <motion.span
                        layoutId={`dropdown-active-bg-${compId}`}
                        className="absolute inset-0 rounded-lg bg-primary/10 border border-primary/20"
                        transition={{
                          type: 'spring',
                          stiffness: 350,
                          damping: 25,
                          mass: 0.8,
                        }}
                      />
                    )}

                    <span className="relative z-10 font-medium">
                      {option.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
