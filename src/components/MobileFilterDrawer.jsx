import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Filter, X } from 'lucide-react'
import useFocusTrap from '../hooks/useFocusTrap'

export default function MobileFilterDrawer({ 
  isOpen, 
  onClose, 
  filters, 
  updateFilters, 
  ALL_CATEGORIES, 
  hasActiveFilters 
}) {
  const drawerRef = useRef(null)
  
  // Trap focus when open, pass onClose for ESC support
  useFocusTrap(drawerRef, isOpen, onClose)

  // Prevent body scroll when open
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
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] md:hidden"
            aria-hidden="true"
          />

          {/* Bottom Sheet Modal */}
          <motion.div
            ref={drawerRef}
            aria-modal="true"
            role="dialog"
            aria-labelledby="drawer-title"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-[210] bg-bg-glass backdrop-blur-[14px] border-t border-white/[0.08] rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] md:hidden flex flex-col max-h-[85vh]"
          >
            {/* Minimalist Drag Handle Indicator */}
            <div className="flex justify-center p-3 pb-0" onClick={onClose}>
              <div className="w-12 h-1.5 rounded-full bg-white/[0.15]" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.04]">
              <div className="flex items-center gap-2 text-white font-bold text-lg" id="drawer-title">
                <Filter size={18} className="text-primary" />
                Filters & Sort
              </div>
              <button 
                onClick={onClose}
                aria-label="Close filters"
                className="p-2 text-text-muted hover:text-white bg-white/[0.04] hover:bg-white/[0.08] rounded-xl transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Form Content */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              
              {/* Type Filter */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Transaction Type</label>
                <div className="relative">
                  <select
                    value={filters.type}
                    onChange={(e) => updateFilters({ type: e.target.value })}
                    className="w-full appearance-none px-4 pr-10 py-3 rounded-xl text-sm font-medium bg-bg-main border border-white/[0.12] text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                  >
                    <option value="all" className="bg-bg-section">All Types</option>
                    <option value="income" className="bg-bg-section">Income</option>
                    <option value="expense" className="bg-bg-section">Expense</option>
                  </select>
                  <Filter size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                </div>
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Category</label>
                <div className="relative">
                  <select
                    value={filters.category}
                    onChange={(e) => updateFilters({ category: e.target.value })}
                    className="w-full appearance-none px-4 pr-10 py-3 rounded-xl text-sm font-medium bg-bg-main border border-white/[0.12] text-white focus:outline-none focus:border-primary/50 transition-all"
                  >
                    <option value="all" className="bg-bg-section">All Categories</option>
                    {ALL_CATEGORIES.map(cat => (
                      <option key={cat} value={cat} className="bg-bg-section">{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date Pickers */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Date Range</label>
                <div className="flex gap-3">
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => updateFilters({ startDate: e.target.value })}
                    className="flex-1 w-full bg-bg-main border border-white/[0.12] rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:border-primary/50 block"
                    aria-label="Start Date"
                  />
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => updateFilters({ endDate: e.target.value })}
                    className="flex-1 w-full bg-bg-main border border-white/[0.12] rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:border-primary/50 block"
                    aria-label="End Date"
                  />
                </div>
              </div>

              {/* Sort By */}
              <div className="space-y-2 pb-4">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Sort By</label>
                <div className="relative">
                  <select
                    value={filters.sortBy}
                    onChange={(e) => updateFilters({ sortBy: e.target.value })}
                    className="w-full appearance-none px-4 pr-10 py-3 rounded-xl text-sm font-medium bg-bg-main border border-white/[0.12] text-white focus:outline-none focus:border-primary/50 transition-all"
                  >
                    <option value="date" className="bg-bg-section">Newest First</option>
                    <option value="amount-high" className="bg-bg-section">Amount: High → Low</option>
                    <option value="amount-low" className="bg-bg-section">Amount: Low → High</option>
                  </select>
                </div>
              </div>

            </div>

            {/* Sticky Bottom Actions */}
            <div className="p-4 border-t border-white/[0.04] bg-bg-glass backdrop-blur flex gap-3">
              <button
                onClick={() => {
                  updateFilters({ search: '', type: 'all', category: 'all', sortBy: 'date', startDate: '', endDate: '' })
                  onClose()
                }}
                disabled={!hasActiveFilters}
                className={`flex-1 py-3.5 rounded-xl font-bold text-sm transition-all duration-200 ${
                  hasActiveFilters 
                    ? 'bg-white/[0.04] text-text-secondary hover:text-white hover:bg-white/[0.08] border border-white/[0.08]' 
                    : 'bg-white/[0.02] text-text-muted/70 border border-white/[0.02] cursor-not-allowed'
                }`}
              >
                Clear
              </button>
              <button
                onClick={onClose}
                className="flex-[2] bg-primary hover:bg-primary/90 text-white font-bold text-sm py-3.5 rounded-xl transition-all duration-200 shadow-[0_4px_15px_rgba(66,124,240,0.3)]"
              >
                Show Results
              </button>
            </div>
            {/* Safe area spacer for modern iphones */}
            <div className="h-6" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
