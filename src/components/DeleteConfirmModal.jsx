import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X, Trash2 } from 'lucide-react'
import Button from './ui/Button'

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, title, description, requireTyping = true }) {
  const [inputValue, setInputValue] = useState('')
  const [shouldRender, setShouldRender] = useState(false)

  // Manage internal render state for framer-motion exit animations
  useEffect(() => {
    if (isOpen) setShouldRender(true)
  }, [isOpen])

  // Reset input when opened
  useEffect(() => {
    if (isOpen) setInputValue('')
  }, [isOpen])

  const handleAnimationComplete = () => {
    if (!isOpen) setShouldRender(false)
  }

  const isConfirmed = !requireTyping || inputValue === 'DELETE'

  if (!shouldRender) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={isOpen ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onAnimationComplete={handleAnimationComplete}
        className="relative w-full max-w-md bg-bg-card border border-white/[0.08] p-6 lg:p-8 rounded-2xl shadow-[0_0_40px_rgba(239,68,68,0.15)] flex flex-col z-10"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-text-muted hover:text-white bg-white/[0.04] hover:bg-white/[0.08] rounded-xl transition-colors"
        >
          <X size={18} />
        </button>

        <div className="flex items-center justify-center w-14 h-14 bg-danger/10 border border-danger/20 rounded-full mb-6 text-danger">
          <AlertTriangle size={28} />
        </div>

        <h2 className="text-xl font-bold text-white mb-2">{title || 'Confirm Deletion'}</h2>
        <p className="text-sm text-text-muted mb-6 leading-relaxed">
          {description || 'This action cannot be undone. All selected data will be permanently removed from your dashboard.'}
        </p>

        {requireTyping && (
          <div className="mb-6">
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
              Type <span className="text-danger font-bold">DELETE</span> to confirm
            </label>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="DELETE"
              className="w-full bg-bg-main border border-danger/30 focus:border-danger rounded-xl px-4 py-3 text-sm text-white placeholder:text-text-muted/50 focus:outline-none focus:ring-1 focus:ring-danger transition-all duration-200 uppercase"
              autoFocus
            />
          </div>
        )}

        <div className="flex gap-3 mt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-text-secondary border border-white/[0.08] hover:bg-white/[0.04] transition-all"
          >
            Cancel
          </button>
          
          <button
            onClick={() => {
              if (isConfirmed) {
                onConfirm()
                onClose()
              }
            }}
            disabled={!isConfirmed}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-300 ${
              isConfirmed
                ? 'bg-danger text-white hover:bg-danger/90 shadow-[0_4px_12px_rgba(239,68,68,0.25)]'
                : 'bg-white/[0.04] text-text-muted border border-white/[0.06] cursor-not-allowed'
            }`}
          >
            <Trash2 size={16} />
            Delete Instantly
          </button>
        </div>
      </motion.div>
    </div>
  )
}
