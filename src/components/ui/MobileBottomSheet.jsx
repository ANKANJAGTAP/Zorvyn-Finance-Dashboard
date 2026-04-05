import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import useFocusTrap from '../../hooks/useFocusTrap'

export default function MobileBottomSheet({ isOpen, onClose, title, children }) {
  const sheetRef = useRef(null)
  
  // Trap focus when open, pass onClose for ESC support
  useFocusTrap(sheetRef, isOpen, onClose)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] md:hidden"
          aria-hidden="true"
        />
      )}
      {isOpen && (
        <motion.div
          key="sheet"
          ref={sheetRef}
          aria-modal="true"
          role="dialog"
          aria-labelledby={title ? 'sheet-title' : undefined}
          aria-label={!title ? 'Menu expanded' : undefined}
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-0 left-0 right-0 z-[210] bg-bg-glass backdrop-blur-[14px] border-t border-white/[0.08] rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] md:hidden flex flex-col max-h-[85vh]"
        >
          <div className="flex justify-center p-3 pb-0" onClick={onClose}>
            <div className="w-12 h-1.5 rounded-full bg-white/[0.15]" />
          </div>
          {title && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.04]">
              <div className="text-white font-bold text-lg" id="sheet-title">{title}</div>
              <button 
                onClick={onClose}
                className="p-2 text-text-muted hover:text-white bg-white/[0.04] hover:bg-white/[0.08] rounded-xl transition-colors"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>
          )}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {children}
          </div>
          {/* Safe area spacer for modern iphones */}
          <div className="h-6" />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
