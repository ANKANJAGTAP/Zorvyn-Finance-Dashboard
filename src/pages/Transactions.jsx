// pages/Transactions.jsx
import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  Search, Plus, Pencil, Trash2,
  UtensilsCrossed, Car, ShoppingBag, Receipt, Gamepad2,
  Briefcase, Laptop, BarChart3, AlertCircle, RefreshCw, Filter,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight
} from 'lucide-react'
import useStore from '../store/useStore'
import { formatAmount, formatDate } from '../utils/formatters'
import { ALL_CATEGORIES } from '../data/mockData'
import TransactionModal from '../components/TransactionModal'
import DeleteConfirmModal from '../components/DeleteConfirmModal'
import MobileFilterDrawer from '../components/MobileFilterDrawer'
import GlassHoverDropdown from '../components/ui/GlassHoverDropdown'
import EmptyState from '../components/EmptyState'
import Button from '../components/ui/Button'

const iconMap = {
  Food: UtensilsCrossed,
  Transport: Car,
  Shopping: ShoppingBag,
  Bills: Receipt,
  Entertainment: Gamepad2,
  Salary: Briefcase,
  Freelance: Laptop,
}

const ITEMS_PER_PAGE = 25

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}

const rowVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.03, duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

/* ─── Hover card with Zorvyn glow ─── */
function ZCard({ children, glowColor = 'rgba(66, 124, 240, 0.25)', className = '' }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)

  return (
    <div
      className={`relative group ${className}`}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Glow border */}
      <div
        className="absolute -inset-px rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: isHovering
            ? `radial-gradient(300px circle at ${mousePos.x}px ${mousePos.y}px, ${glowColor}, transparent 60%)`
            : 'none',
        }}
      />
      {/* Inner */}
      <div className="absolute inset-px rounded-xl bg-bg-card pointer-events-none" />
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}

export default function Transactions() {
  const [loading, setLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [hoveredDesktopTransactionId, setHoveredDesktopTransactionId] = useState(null)
  const [hoveredMobileTransactionId, setHoveredMobileTransactionId] = useState(null)
  
  // ─── Bulk & Inline State ───
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteModalAction, setDeleteModalAction] = useState(null) // 'all' or 'selected'
  const [editingRowId, setEditingRowId] = useState(null)
  const [inlineEditForm, setInlineEditForm] = useState({ amount: '', category: '' })
  
  // Mobile Filter Drawer
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)

  const role = useStore(s => s.role)
  const filters = useStore(s => s.filters)
  const updateFilters = useStore(s => s.updateFilters)
  useStore(s => s.transactions)
  const timeFilter = useStore(s => s.timeFilter) // Added timeFilter subscription
  const getFilteredTransactions = useStore(s => s.getFilteredTransactions)
  const deleteTransaction = useStore(s => s.deleteTransaction)
  const deleteAllTransactions = useStore(s => s.deleteAllTransactions)
  const bulkDeleteTransactions = useStore(s => s.bulkDeleteTransactions)
  const bulkUpdateCategory = useStore(s => s.bulkUpdateCategory)
  const openModal = useStore(s => s.openModal)

  const transactions = getFilteredTransactions()
  const isAdmin = role === 'admin'

  // ─── Pagination logic ───
  const totalPages = Math.max(1, Math.ceil(transactions.length / ITEMS_PER_PAGE))
  const safeCurrentPage = Math.min(currentPage, totalPages)

  const paginatedTransactions = useMemo(() => {
    const start = (safeCurrentPage - 1) * ITEMS_PER_PAGE
    const end = start + ITEMS_PER_PAGE
    return transactions.slice(start, end)
  }, [transactions, safeCurrentPage])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters.search, filters.type, filters.category, filters.sortBy, filters.startDate, filters.endDate, timeFilter])

  // Keep currentPage in bounds when transactions change
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [totalPages, currentPage])

  const goToPage = (page) => {
    const target = Math.max(1, Math.min(page, totalPages))
    setCurrentPage(target)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      if (safeCurrentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      } else if (safeCurrentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i)
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = safeCurrentPage - 1; i <= safeCurrentPage + 1; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      }
    }

    return pages
  }

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])



  const handleDelete = (id) => {
    const allTransactions = useStore.getState().transactions
    const deletedTransaction = allTransactions.find(t => t.id === id)

    if (!deletedTransaction) return

    deleteTransaction(id)

    toast.success('Transaction deleted', {
      description: `${deletedTransaction.description} — ${formatAmount(deletedTransaction.amount)}`,
      action: {
        label: 'Undo',
        onClick: () => {
          addTransaction(deletedTransaction)
          toast.success('Transaction restored')
        },
      },
      duration: 5000,
    })
  }

  const openEditModal = (transaction) => {
    openModal(transaction)
  }

  const openAddModal = () => {
    openModal(null)
  }

  const hasActiveFilters = filters.search || filters.type !== 'all' || filters.category !== 'all' || filters.startDate || filters.endDate
  const activeFilterCount = [filters.search, filters.type !== 'all', filters.category !== 'all', filters.startDate, filters.endDate].filter(Boolean).length

  // Bulk Selection Logic
  const toggleSelection = (id) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const toggleAll = () => {
    if (selectedIds.size === paginatedTransactions.length && paginatedTransactions.length > 0) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(paginatedTransactions.map(t => t.id)))
    }
  }

  const handleBulkDelete = () => {
    setDeleteModalAction('selected')
    setIsDeleteModalOpen(true)
  }

  const handleBulkCategoryChange = (e) => {
    const cat = e.target.value
    if (cat && cat !== 'Category') {
      bulkUpdateCategory(Array.from(selectedIds), cat)
      setSelectedIds(new Set())
      toast.success(`${selectedIds.size} transaction${selectedIds.size > 1 ? 's' : ''} updated to ${cat}`)
    }
    e.target.value = 'Category' // reset
  }

  const executeDelete = () => {
    if (deleteModalAction === 'all') {
      deleteAllTransactions()
      toast.success('All transactions permanently deleted')
    } else if (deleteModalAction === 'selected') {
      bulkDeleteTransactions(Array.from(selectedIds))
      toast.success(`${selectedIds.size} transaction${selectedIds.size > 1 ? 's' : ''} deleted`)
      setSelectedIds(new Set())
    }
  }

  // Inline Editing Logic
  const handleInlineEditStart = (transaction) => {
    if (!isAdmin) return
    setEditingRowId(transaction.id)
    setInlineEditForm({ amount: Math.abs(transaction.amount).toString(), category: transaction.category })
  }

  const handleInlineEditSave = (transaction) => {
    if (!inlineEditForm.amount || isNaN(Number(inlineEditForm.amount))) {
      setEditingRowId(null)
      return
    }
    useStore.getState().editTransaction(transaction.id, {
      amount: Number(inlineEditForm.amount),
      category: inlineEditForm.category
    })
    setEditingRowId(null)
  }

  const handleInlineEditKeyDown = (e, transaction) => {
    if (e.key === 'Enter') handleInlineEditSave(transaction)
    if (e.key === 'Escape') setEditingRowId(null)
  }

  // ─── Pagination Component ───
  const PaginationControls = () => {
    if (transactions.length <= ITEMS_PER_PAGE) return null

    const startItem = (safeCurrentPage - 1) * ITEMS_PER_PAGE + 1
    const endItem = Math.min(safeCurrentPage * ITEMS_PER_PAGE, transactions.length)
    const pageNumbers = getPageNumbers()

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
        {/* Info text */}
        <p className="text-xs text-text-muted tabular-nums">
          Showing <span className="text-text-secondary font-medium">{startItem}–{endItem}</span> of{' '}
          <span className="text-text-secondary font-medium">{transactions.length}</span> transactions
        </p>

        {/* Page controls */}
        <div className="flex items-center gap-1">
          {/* First page */}
          <button
            onClick={() => goToPage(1)}
            disabled={safeCurrentPage === 1}
            className={`p-2 rounded-lg transition-all duration-200 ${
              safeCurrentPage === 1
                ? 'text-text-muted/30 cursor-not-allowed'
                : 'text-text-muted hover:text-white hover:bg-white/[0.06]'
            }`}
            aria-label="Go to first page"
          >
            <ChevronsLeft size={16} />
          </button>

          {/* Previous page */}
          <button
            onClick={() => goToPage(safeCurrentPage - 1)}
            disabled={safeCurrentPage === 1}
            className={`p-2 rounded-lg transition-all duration-200 ${
              safeCurrentPage === 1
                ? 'text-text-muted/30 cursor-not-allowed'
                : 'text-text-muted hover:text-white hover:bg-white/[0.06]'
            }`}
            aria-label="Go to previous page"
          >
            <ChevronLeft size={16} />
          </button>

          {/* Page numbers */}
          <div className="flex items-center gap-0.5 mx-1">
            {pageNumbers.map((page, idx) =>
              page === '...' ? (
                <span key={`ellipsis-${idx}`} className="px-2 py-1.5 text-xs text-text-muted select-none">
                  ···
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`min-w-[36px] h-9 rounded-lg text-xs font-medium transition-all duration-200 ${
                    page === safeCurrentPage
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'text-text-muted hover:text-white hover:bg-white/[0.06]'
                  }`}
                  aria-label={`Go to page ${page}`}
                  aria-current={page === safeCurrentPage ? 'page' : undefined}
                >
                  {page}
                </button>
              )
            )}
          </div>

          {/* Next page */}
          <button
            onClick={() => goToPage(safeCurrentPage + 1)}
            disabled={safeCurrentPage === totalPages}
            className={`p-2 rounded-lg transition-all duration-200 ${
              safeCurrentPage === totalPages
                ? 'text-text-muted/30 cursor-not-allowed'
                : 'text-text-muted hover:text-white hover:bg-white/[0.06]'
            }`}
            aria-label="Go to next page"
          >
            <ChevronRight size={16} />
          </button>

          {/* Last page */}
          <button
            onClick={() => goToPage(totalPages)}
            disabled={safeCurrentPage === totalPages}
            className={`p-2 rounded-lg transition-all duration-200 ${
              safeCurrentPage === totalPages
                ? 'text-text-muted/30 cursor-not-allowed'
                : 'text-text-muted hover:text-white hover:bg-white/[0.06]'
            }`}
            aria-label="Go to last page"
          >
            <ChevronsRight size={16} />
          </button>
        </div>
      </div>
    )
  }

  if (hasError) {
    return (
      <motion.div variants={pageVariants} initial="initial" animate="animate" className="space-y-6">
        <div className="glass-card p-12">
          <div className="error-state p-8 flex flex-col items-center justify-center text-center">
            <AlertCircle size={40} className="text-danger mb-4" />
            <h3 className="text-white text-lg font-semibold mb-2">Failed to load transactions</h3>
            <p className="text-text-muted text-sm mb-6 max-w-sm">
              Something went wrong while fetching your transaction data. Please try again.
            </p>
            <Button
              variant="secondary"
              onClick={() => { setHasError(false); setLoading(true); setTimeout(() => setLoading(false), 500) }}
              aria-label="Retry loading transactions"
            >
              <RefreshCw size={16} />
              Retry
            </Button>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <>
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.2 }}
        className="space-y-6"
      >
      {/* ─── Page Header ─── */}
      <div className="flex flex-row items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Transactions
            <span className="md:hidden text-lg text-text-muted ml-2 font-medium">({transactions.length})</span>
          </h1>
          <p className="text-text-secondary text-sm mt-1 hidden md:block">
            {transactions.length} transaction{transactions.length !== 1 ? 's' : ''} found
            {activeFilterCount > 0 && (
              <span className="text-text-muted"> · {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active</span>
            )}
          </p>
        </div>

        {/* Desktop Header Actions */}
        <div className="hidden md:flex gap-3">
          {transactions.length > 0 && (
            <button
              onClick={() => {
                setDeleteModalAction('all')
                setIsDeleteModalOpen(true)
              }}
              disabled={!isAdmin}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border ${
                isAdmin
                  ? 'border-danger/30 bg-danger/10 text-danger hover:bg-danger/20'
                  : 'border-white/[0.06] bg-white/[0.04] text-text-muted/50 cursor-not-allowed'
              }`}
              aria-label={!isAdmin ? 'Switch to Admin to delete all transactions' : 'Delete all transactions'}
            >
              <Trash2 size={16} />
              <span>Delete All</span>
            </button>
          )}
          <Button
            variant="primary"
            onClick={openAddModal}
            disabled={!isAdmin}
            aria-label={!isAdmin ? 'Switch to Admin to add transactions' : 'Add new transaction'}
          >
            <Plus size={16} />
            <span>Add Transaction</span>
          </Button>
        </div>
      </div>

      {/* ─── Filter Bar ─── */}
      <ZCard glowColor="rgba(66, 124, 240, 0.2)" className="border border-white/[0.06] relative z-[15]">
        <div className="flex flex-col md:flex-row md:flex-wrap items-stretch md:items-center p-3 sm:p-4 gap-3">
          
          {/* Mobile Layout Row (Always visible, but flex-1 on desktop) */}
          <div className="flex w-full md:w-auto md:flex-1 items-center gap-2 sm:gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-0">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" aria-hidden="true" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={filters.search}
                onChange={(e) => updateFilters({ search: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-white/[0.04] border border-white/[0.06] text-white placeholder:text-text-muted focus:outline-none focus:bg-white/[0.06] focus:border-primary/30 focus:ring-1 focus:ring-primary/30 transition-all duration-200"
              />
            </div>

            {/* Mobile Control Cluster: Filter + Add */}
            <div className="flex items-center gap-2 md:hidden">
              {/* Mobile Filter Trigger Button */}
              <button 
                onClick={() => setIsMobileFilterOpen(true)}
                className="flex items-center justify-center w-[42px] h-[42px] rounded-xl bg-white/[0.04] border border-white/[0.06] text-white hover:bg-white/[0.08] transition-all relative"
                aria-label="Open Filters"
              >
                <Filter size={16} />
                {[filters.type !== 'all', filters.category !== 'all', filters.startDate, filters.endDate].filter(Boolean).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center pointer-events-none shadow-[0_0_8px_rgba(66,124,240,0.5)]">
                    {[filters.type !== 'all', filters.category !== 'all', filters.startDate, filters.endDate].filter(Boolean).length}
                  </span>
                )}
              </button>

              {/* Mobile Add Button */}
              <button
                onClick={openAddModal}
                disabled={!isAdmin}
                className={`flex items-center justify-center w-[42px] h-[42px] rounded-xl transition-all shadow-lg ${
                  isAdmin 
                    ? 'bg-primary text-white hover:bg-primary/90 shadow-primary/30' 
                    : 'bg-white/[0.04] text-text-muted/50 border border-white/[0.06] cursor-not-allowed shadow-none'
                }`}
                aria-label="Add transaction"
              >
                <Plus size={18} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          <div className="h-8 w-px bg-white/[0.06] hidden md:block" />

          {/* Desktop Filters Array (Hidden on Mobile) */}
          <div className="hidden md:flex items-center gap-3 flex-wrap">
            {/* Type Filter */}
            <GlassHoverDropdown
              value={filters.type}
              onChange={(val) => updateFilters({ type: val })}
              icon={Filter}
              placeholder="All Types"
              options={[
                { value: 'all', label: 'All Types' },
                { value: 'income', label: 'Income' },
                { value: 'expense', label: 'Expense' }
              ]}
            />

            {/* Category Filter */}
            <GlassHoverDropdown
              value={filters.category}
              onChange={(val) => updateFilters({ category: val })}
              placeholder="All Categories"
              options={[
                { value: 'all', label: 'All Categories' },
                ...ALL_CATEGORIES.map(cat => ({ value: cat, label: cat }))
              ]}
            />

            {/* Date Pickers */}
            <div className="flex gap-2 border border-white/[0.06] bg-white/[0.02] rounded-xl p-1">
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => updateFilters({ startDate: e.target.value })}
                className="w-[125px] bg-transparent text-sm text-white px-2 py-1.5 focus:outline-none placeholder:text-text-muted/50 rounded-lg focus:bg-white/[0.04] transition-colors"
                aria-label="Start Date"
              />
              <span className="text-text-muted flex items-center">-</span>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => updateFilters({ endDate: e.target.value })}
                className="w-[125px] bg-transparent text-sm text-white px-2 py-1.5 focus:outline-none placeholder:text-text-muted/50 rounded-lg focus:bg-white/[0.04] transition-colors"
                aria-label="End Date"
              />
            </div>

            {/* Sort */}
            <div className="ml-auto">
              <GlassHoverDropdown
                value={filters.sortBy}
                onChange={(val) => updateFilters({ sortBy: val })}
                placeholder="Sort By"
                align="right"
                options={[
                  { value: 'date', label: 'Newest First' },
                  { value: 'amount-high', label: 'Amount: High → Low' },
                  { value: 'amount-low', label: 'Amount: Low → High' }
                ]}
              />
            </div>

            {/* Clear filters */}
            <AnimatePresence>
              {hasActiveFilters && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => updateFilters({ search: '', type: 'all', category: 'all', sortBy: 'date', startDate: '', endDate: '' })}
                  className="px-4 py-2.5 rounded-xl text-xs font-medium text-text-secondary hover:text-white bg-white/[0.04] hover:bg-white/[0.06] border border-white/[0.06] transition-all duration-200"
                >
                  Clear all
                </motion.button>
              )}
            </AnimatePresence>
          </div>

        </div>
      </ZCard>

      {/* ─── Table / Empty State ─── */}
      {loading ? (
        <>
          {/* Desktop Skeleton */}
          <div className="glass-card hidden md:block overflow-hidden rounded-xl border border-white/[0.06]">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-white/5 last:border-0">
                <div className="skeleton w-2 h-2 rounded-full" />
                <div className="skeleton w-10 h-10 rounded-xl" />
                <div className="flex-1 space-y-1.5">
                  <div className="skeleton h-4 w-40" />
                  <div className="skeleton h-3 w-24" />
                </div>
                <div className="skeleton h-6 w-20 rounded-full" />
                <div className="skeleton h-4 w-24" />
              </div>
            ))}
          </div>

          {/* Mobile Skeleton */}
          <div className="md:hidden space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <ZCard key={i} className="border border-white/[0.06] opacity-70">
                <div className="p-4 flex items-center gap-3">
                  <div className="skeleton w-10 h-10 rounded-xl flex-shrink-0" />
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <div className="skeleton h-4 w-32" />
                      <div className="skeleton h-4 w-16" />
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="skeleton h-3 w-20" />
                      <div className="skeleton h-5 w-14 rounded-md" />
                    </div>
                  </div>
                </div>
              </ZCard>
            ))}
          </div>
        </>
      ) : transactions.length === 0 ? (
        <div className="glass-card rounded-xl border border-white/[0.06]">
          <EmptyState
            variant={hasActiveFilters ? 'no-results' : 'no-data'}
            icon={BarChart3}
            title={hasActiveFilters ? 'No transactions match your filters' : 'No transactions yet'}
            description={hasActiveFilters
              ? 'Try adjusting your filters or search term to find what you\'re looking for.'
              : 'Start tracking your finances by adding your first transaction.'}
            actionLabel={hasActiveFilters ? 'Clear Filters' : isAdmin ? '+ Add your first transaction' : undefined}
            onAction={hasActiveFilters
              ? () => updateFilters({ search: '', type: 'all', category: 'all', sortBy: 'date' })
              : isAdmin ? openAddModal : undefined}
          />
        </div>
      ) : (
        <>
          {/* ─── Desktop Table ─── */}
          <div
            className="glass-card hidden md:block rounded-xl border border-white/[0.06]"
            onMouseLeave={() => setHoveredDesktopTransactionId(null)}
          >
            {/* Table Header */}
            <div className="sticky top-0 z-10 grid grid-cols-12 gap-4 px-6 py-3.5 border-b border-white/[0.08] bg-bg-section/80 backdrop-blur-md text-text-muted text-[11px] font-semibold uppercase tracking-[0.08em]">
              <div className="col-span-1"></div>
              <div className="col-span-3">Description</div>
              <div className="col-span-2">Category</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-1">Type</div>
              <div className="col-span-2 text-right">Amount</div>
              <div className="col-span-1"></div>
            </div>

            {/* Table Rows */}
            <AnimatePresence mode="popLayout">
              {paginatedTransactions.map((transaction, i) => {
                const Icon = iconMap[transaction.category] || Receipt
                const isIncome = transaction.type === 'income'
                const glow = isIncome ? 'rgba(34, 195, 142, 0.2)' : 'rgba(239, 68, 68, 0.2)'

                return (
                  <motion.div
                    key={transaction.id}
                    custom={i}
                    variants={rowVariants}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, x: -20 }}
                    layout
                    className={`group relative grid grid-cols-12 gap-4 items-center px-6 py-4 border-b border-white/[0.04] last:border-0 transition-colors duration-150 cursor-default ${
                      selectedIds.has(transaction.id) ? 'bg-primary/[0.05]' : ''
                    }`}
                    onMouseEnter={() => setHoveredDesktopTransactionId(transaction.id)}
                    onDoubleClick={(e) => {
                      e.stopPropagation()
                      handleInlineEditStart(transaction)
                    }}
                  >
                    {/* Sidebar-style sliding hover bg */}
                    {hoveredDesktopTransactionId === transaction.id && (
                      <motion.span
                        layoutId="transactions-hover-bg-desktop"
                        className="absolute inset-0 rounded-xl bg-white/[0.05] pointer-events-none"
                        style={{ originX: 0.5, originY: 0.5 }}
                        transition={{
                          type: 'spring',
                          stiffness: 350,
                          damping: 25,
                          mass: 0.8,
                        }}
                      />
                    )}

                    {/* Left accent line on hover */}
                    <motion.div 
                      className="absolute left-0 top-[20%] bottom-[20%] w-[3px] rounded-full origin-center"
                      style={{ backgroundColor: isIncome ? '#22C38E' : '#EF4444' }}
                      initial={{ scaleY: 0 }}
                      whileHover={{ scaleY: 1 }}
                      transition={{ duration: 0.2 }}
                    />

                    {/* Status Dot */}
                    <div className="col-span-1 flex items-center justify-center">
                      <div className={`w-2 h-2 rounded-full ${
                        transaction.status === 'completed' ? 'bg-success shadow-[0_0_8px_rgba(34,195,142,0.5)]' : 'bg-warning shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                      }`} />
                    </div>

                    {/* Description + Icon */}
                    <div className="col-span-3 flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border transition-all duration-200 ${
                        isIncome ? 'bg-success/10 border-success/20 group-hover:bg-success/15' : 'bg-danger/10 border-danger/20 group-hover:bg-danger/15'
                      }`}>
                        <Icon size={17} className={isIncome ? 'text-success' : 'text-danger'} />
                      </div>
                      <p className="text-sm text-white font-medium truncate">{transaction.description}</p>
                    </div>

                    {/* Category */}
                    <div className="col-span-2 relative z-10" onClick={(e) => e.stopPropagation()}>
                      {editingRowId === transaction.id ? (
                        <select
                          value={inlineEditForm.category}
                          onChange={(e) => setInlineEditForm(s => ({ ...s, category: e.target.value }))}
                          onBlur={() => handleInlineEditSave(transaction)}
                          onKeyDown={(e) => handleInlineEditKeyDown(e, transaction)}
                          autoFocus
                          className="w-full bg-white/[0.08] border border-primary/50 rounded flex-1 px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary/50"
                        >
                          {ALL_CATEGORIES.map(cat => <option key={cat} value={cat} className="bg-bg-section">{cat}</option>)}
                        </select>
                      ) : (
                        <span className="text-xs px-2.5 py-1 rounded-lg font-medium bg-white/[0.04] text-text-secondary border border-white/[0.06] select-none">
                          {transaction.category}
                        </span>
                      )}
                    </div>

                    {/* Date */}
                    <div className="col-span-2">
                      <span className="text-xs text-text-muted font-medium select-none">{formatDate(transaction.date)}</span>
                    </div>

                    {/* Type Badge */}
                    <div className="col-span-1">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider select-none ${
                        isIncome ? 'bg-success/10 text-success border border-success/20' : 'bg-danger/10 text-danger border border-danger/20'
                      }`}>
                        {transaction.type}
                      </span>
                    </div>

                    {/* Amount */}
                    <div className="col-span-2 text-right relative z-10" onClick={(e) => e.stopPropagation()}>
                    {editingRowId === transaction.id ? (
                        <input
                          type="number"
                          value={inlineEditForm.amount}
                          onChange={(e) => setInlineEditForm(s => ({ ...s, amount: e.target.value }))}
                          onBlur={() => handleInlineEditSave(transaction)}
                          onKeyDown={(e) => handleInlineEditKeyDown(e, transaction)}
                          className="w-[100px] text-right bg-white/[0.08] border border-primary/50 rounded px-2 py-1 flex-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50"
                        />
                      ) : (
                        <span className={`text-sm font-bold tabular-nums select-none ${isIncome ? 'text-success' : 'text-danger'}`}>
                          {isIncome ? '+' : '-'}{formatAmount(transaction.amount)}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="col-span-1 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 relative z-10">
                      <button
                        onClick={(e) => { e.stopPropagation(); openEditModal(transaction) }}
                        disabled={!isAdmin}
                        className={`p-2 rounded-lg transition-all duration-200 ${
                          isAdmin
                            ? 'text-text-muted hover:text-primary hover:bg-primary/10 hover:scale-110'
                            : 'text-text-muted/30 cursor-not-allowed'
                        }`}
                        aria-label={`Edit transaction: ${transaction.description}`}
                      >
                        <Pencil size={15} strokeWidth={2} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(transaction.id) }}
                        disabled={!isAdmin}
                        className={`p-2 rounded-lg transition-all duration-200 ${
                          isAdmin
                            ? 'text-text-muted hover:text-danger hover:bg-danger/10 hover:scale-110'
                            : 'text-text-muted/30 cursor-not-allowed'
                        }`}
                        aria-label={`Delete transaction: ${transaction.description}`}
                      >
                        <Trash2 size={15} strokeWidth={2} />
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>

            {/* Pagination inside table card */}
            {transactions.length > ITEMS_PER_PAGE && (
              <div className="px-6 py-4 border-t border-white/[0.06] bg-white/[0.01]">
                <PaginationControls />
              </div>
            )}
          </div>

          {/* ─── Mobile Card Layout ─── */}
          <div className="md:hidden space-y-3" onMouseLeave={() => setHoveredMobileTransactionId(null)}>
            <AnimatePresence mode="popLayout">
              {paginatedTransactions.map((transaction, i) => {
                const Icon = iconMap[transaction.category] || Receipt
                const isIncome = transaction.type === 'income'
                const glow = isIncome ? 'rgba(34, 195, 142, 0.2)' : 'rgba(239, 68, 68, 0.2)'

                return (
                  <motion.div
                    key={transaction.id}
                    custom={i}
                    variants={rowVariants}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, y: -20 }}
                    layout
                    onMouseEnter={() => setHoveredMobileTransactionId(transaction.id)}
                  >
                    <ZCard glowColor={glow} className={`border transition-colors ${selectedIds.has(transaction.id) ? 'border-primary bg-primary/[0.05]' : 'border-white/[0.06]'}`}>
                      <div 
                        className="relative p-4 cursor-pointer"
                        onClick={() => toggleSelection(transaction.id)}
                      >
                        {/* Mobile Selection Indicator */}
                        {selectedIds.has(transaction.id) && (
                          <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-[0_0_10px_rgba(66,124,240,0.5)]">
                            <span className="text-white text-[10px] font-bold">✓</span>
                          </div>
                        )}
                        {hoveredMobileTransactionId === transaction.id && (
                          <motion.span
                            layoutId="transactions-hover-bg-mobile"
                            className="absolute inset-0 rounded-xl bg-white/[0.05] pointer-events-none"
                            style={{ originX: 0.5, originY: 0.5 }}
                            transition={{
                              type: 'spring',
                              stiffness: 350,
                              damping: 25,
                              mass: 0.8,
                            }}
                          />
                        )}

                        <div className="flex items-start gap-3">
                          {/* Icon + Status */}
                          <div className="relative flex-shrink-0">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                              isIncome ? 'bg-success/10 border-success/20' : 'bg-danger/10 border-danger/20'
                            }`}>
                              <Icon size={17} className={isIncome ? 'text-success' : 'text-danger'} />
                            </div>
                            <div className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-bg-card ${
                              transaction.status === 'completed' ? 'bg-success' : 'bg-warning'
                            }`} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0 space-y-1.5">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <p className="text-sm text-white font-semibold truncate">{transaction.description}</p>
                                <p className="text-[11px] text-text-muted mt-0.5">
                                  {transaction.category} · {formatDate(transaction.date)}
                                </p>
                              </div>
                              <span className={`text-sm font-bold flex-shrink-0 tabular-nums ${isIncome ? 'text-success' : 'text-danger'}`}>
                                {isIncome ? '+' : '-'}{formatAmount(transaction.amount)}
                              </span>
                            </div>

                            {/* Bottom row */}
                            <div className="flex items-center justify-between pt-1">
                              <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                isIncome ? 'bg-success/10 text-success border border-success/20' : 'bg-danger/10 text-danger border border-danger/20'
                              }`}>
                                {transaction.type}
                              </span>

                              {isAdmin && (
                                <div className="flex gap-0.5 relative z-10" onClick={(e) => e.stopPropagation()}>
                                  <button
                                    onClick={() => openEditModal(transaction)}
                                    className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-primary/10 active:scale-95 transition-all"
                                    aria-label={`Edit: ${transaction.description}`}
                                  >
                                    <Pencil size={14} strokeWidth={2} />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedIds(new Set([transaction.id]))
                                      handleBulkDelete()
                                    }}
                                    className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 active:scale-95 transition-all"
                                    aria-label={`Delete: ${transaction.description}`}
                                  >
                                    <Trash2 size={14} strokeWidth={2} />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </ZCard>
                  </motion.div>
                )
              })}
            </AnimatePresence>

            {/* Mobile Pagination */}
            {transactions.length > ITEMS_PER_PAGE && (
              <div className="pt-2">
                <PaginationControls />
              </div>
            )}
          </div>
        </>
      )}
      </motion.div>

      {/* Floating Action Bar */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-lg bg-bg-card border border-white/[0.1] shadow-[0_20px_40px_rgba(0,0,0,0.4)] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="bg-primary/20 text-primary px-3 py-1.5 rounded-lg text-sm font-bold tabular-nums">
                {selectedIds.size} selected
              </span>
              <button
                onClick={() => setSelectedIds(new Set())}
                className="text-xs font-semibold text-text-muted hover:text-white transition-colors ml-auto sm:ml-0"
              >
                Clear
              </button>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select
                onChange={handleBulkCategoryChange}
                className="flex-1 sm:flex-none appearance-none px-4 py-2 rounded-xl text-sm font-semibold bg-white/[0.04] border border-white/[0.06] text-white focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all cursor-pointer text-center"
              >
                <option value="Category" className="bg-bg-section">Assign Category...</option>
                {ALL_CATEGORIES.map(cat => (
                  <option key={cat} value={cat} className="bg-bg-section">{cat}</option>
                ))}
              </select>

              <button
                onClick={handleBulkDelete}
                className="flex items-center justify-center p-2.5 rounded-xl bg-danger/10 text-danger border border-danger/30 hover:bg-danger hover:text-white transition-all shadow-[0_0_15px_rgba(239,68,68,0.15)]"
                aria-label="Bulk delete"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={executeDelete}
        title={deleteModalAction === 'all' ? "Delete All Transactions" : `Delete ${selectedIds.size} Transaction${selectedIds.size > 1 ? 's' : ''}`}
        description={deleteModalAction === 'all' ? "Are you sure you want to permanently erase your entire transaction history?" : "These transactions will be permanently erased. This action cannot be undone."}
      />

      <MobileFilterDrawer
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        filters={filters}
        updateFilters={updateFilters}
        ALL_CATEGORIES={ALL_CATEGORIES}
        hasActiveFilters={hasActiveFilters}
      />
    </>
  )
}