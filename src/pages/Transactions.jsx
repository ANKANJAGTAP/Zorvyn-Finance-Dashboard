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
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [hoveredDesktopTransactionId, setHoveredDesktopTransactionId] = useState(null)
  const [hoveredMobileTransactionId, setHoveredMobileTransactionId] = useState(null)

  const role = useStore(s => s.role)
  const filters = useStore(s => s.filters)
  const updateFilters = useStore(s => s.updateFilters)
  useStore(s => s.transactions)
  const getFilteredTransactions = useStore(s => s.getFilteredTransactions)
  const addTransaction = useStore(s => s.addTransaction)
  const editTransaction = useStore(s => s.editTransaction)
  const deleteTransaction = useStore(s => s.deleteTransaction)
  const deleteAllTransactions = useStore(s => s.deleteAllTransactions)

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
  }, [filters.search, filters.type, filters.category, filters.sortBy])

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

  const handleAdd = (data) => {
    addTransaction({
      ...data,
      description: data.description || data.category,
    })
    toast.success('Transaction added successfully', {
      description: `₹${Number(data.amount).toLocaleString('en-IN')} — ${data.category}`,
    })
  }

  const handleEdit = (data) => {
    if (editingTransaction) {
      editTransaction(editingTransaction.id, {
        ...data,
        description: data.description || data.category,
        amount: Number(data.amount), // Explicit conversion to ensure numeric type
      })
      setEditingTransaction(null)
      toast.success('Transaction updated', {
        description: `${data.category} — ₹${Number(data.amount).toLocaleString('en-IN')}`,
      })
    }
  }

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
    setEditingTransaction(transaction)
    setModalOpen(true)
  }

  const openAddModal = () => {
    setEditingTransaction(null)
    setModalOpen(true)
  }

  const hasActiveFilters = filters.search || filters.type !== 'all' || filters.category !== 'all'
  const activeFilterCount = [filters.search, filters.type !== 'all', filters.category !== 'all'].filter(Boolean).length

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
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      {/* ─── Page Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Transactions</h1>
          <p className="text-text-secondary text-sm mt-1">
            {transactions.length} transaction{transactions.length !== 1 ? 's' : ''} found
            {activeFilterCount > 0 && (
              <span className="text-text-muted"> · {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active</span>
            )}
          </p>
        </div>
        <div className="flex gap-2 sm:gap-3">
          {transactions.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm("Are you sure you want to delete ALL transactions? This action cannot be undone.")) {
                  deleteAllTransactions()
                  toast.success('All transactions deleted')
                }
              }}
              disabled={!isAdmin}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border ${
                isAdmin
                  ? 'border-danger/30 bg-danger/10 text-danger hover:bg-danger/20'
                  : 'border-white/[0.06] bg-white/[0.04] text-text-muted/50 cursor-not-allowed'
              }`}
              aria-label={!isAdmin ? 'Switch to Admin to delete all transactions' : 'Delete all transactions'}
            >
              <Trash2 size={16} />
              <span className="hidden sm:inline">Delete All</span>
            </button>
          )}
          <Button
            variant="primary"
            onClick={openAddModal}
            disabled={!isAdmin}
            aria-label={!isAdmin ? 'Switch to Admin to add transactions' : 'Add new transaction'}
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Add Transaction</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      {/* ─── Filter Bar ─── */}
      <ZCard glowColor="rgba(66, 124, 240, 0.2)" className="border border-white/[0.06]">
        <div className="flex flex-wrap items-center gap-3 p-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={filters.search}
              onChange={(e) => updateFilters({ search: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-white/[0.04] border border-white/[0.06] text-white placeholder:text-text-muted focus:outline-none focus:bg-white/[0.06] focus:border-primary/30 focus:ring-1 focus:ring-primary/30 transition-all duration-200"
              aria-label="Search transactions by description or category"
            />
          </div>

          <div className="h-8 w-px bg-white/[0.06] hidden sm:block" />

          {/* Type Filter */}
          <div className="relative">
            <select
              value={filters.type}
              onChange={(e) => updateFilters({ type: e.target.value })}
              className="appearance-none pl-10 pr-8 py-2.5 rounded-xl text-sm bg-white/[0.04] border border-white/[0.06] text-white focus:outline-none focus:bg-white/[0.06] focus:border-primary/30 focus:ring-1 focus:ring-primary/30 transition-all duration-200 cursor-pointer min-w-[120px]"
              aria-label="Filter by transaction type"
            >
              <option value="all" className="bg-bg-section">All Types</option>
              <option value="income" className="bg-bg-section">Income</option>
              <option value="expense" className="bg-bg-section">Expense</option>
            </select>
            <Filter size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={filters.category}
              onChange={(e) => updateFilters({ category: e.target.value })}
              className="appearance-none px-3 pr-8 py-2.5 rounded-xl text-sm bg-white/[0.04] border border-white/[0.06] text-white focus:outline-none focus:bg-white/[0.06] focus:border-primary/30 focus:ring-1 focus:ring-primary/30 transition-all duration-200 cursor-pointer min-w-[140px]"
              aria-label="Filter by category"
            >
              <option value="all" className="bg-bg-section">All Categories</option>
              {ALL_CATEGORIES.map(cat => (
                <option key={cat} value={cat} className="bg-bg-section">{cat}</option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="relative ml-auto">
            <select
              value={filters.sortBy}
              onChange={(e) => updateFilters({ sortBy: e.target.value })}
              className="appearance-none px-3 pr-8 py-2.5 rounded-xl text-sm bg-white/[0.04] border border-white/[0.06] text-white focus:outline-none focus:bg-white/[0.06] focus:border-primary/30 focus:ring-1 focus:ring-primary/30 transition-all duration-200 cursor-pointer min-w-[140px]"
              aria-label="Sort transactions"
            >
              <option value="date" className="bg-bg-section">Newest First</option>
              <option value="amount-high" className="bg-bg-section">Amount: High → Low</option>
              <option value="amount-low" className="bg-bg-section">Amount: Low → High</option>
            </select>
          </div>

          {/* Clear filters */}
          <AnimatePresence>
            {hasActiveFilters && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={() => updateFilters({ search: '', type: 'all', category: 'all', sortBy: 'date' })}
                className="px-3 py-2.5 rounded-xl text-xs font-medium text-text-secondary hover:text-white bg-white/[0.04] hover:bg-white/[0.06] border border-white/[0.06] transition-all duration-200"
              >
                Clear all
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </ZCard>

      {/* ─── Table / Empty State ─── */}
      {loading ? (
        <div className="glass-card overflow-hidden rounded-xl border border-white/[0.06]">
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
                    className="group relative grid grid-cols-12 gap-4 items-center px-6 py-4 border-b border-white/[0.04] last:border-0 transition-colors duration-150"
                    onMouseEnter={() => setHoveredDesktopTransactionId(transaction.id)}
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
                    <div className="col-span-2">
                      <span className="text-xs px-2.5 py-1 rounded-lg font-medium bg-white/[0.04] text-text-secondary border border-white/[0.06]">
                        {transaction.category}
                      </span>
                    </div>

                    {/* Date */}
                    <div className="col-span-2">
                      <span className="text-xs text-text-muted font-medium">{formatDate(transaction.date)}</span>
                    </div>

                    {/* Type Badge */}
                    <div className="col-span-1">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider ${
                        isIncome ? 'bg-success/10 text-success border border-success/20' : 'bg-danger/10 text-danger border border-danger/20'
                      }`}>
                        {transaction.type}
                      </span>
                    </div>

                    {/* Amount */}
                    <div className="col-span-2 text-right">
                      <span className={`text-sm font-bold tabular-nums ${isIncome ? 'text-success' : 'text-danger'}`}>
                        {isIncome ? '+' : '-'}{formatAmount(transaction.amount)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="col-span-1 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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
                    <ZCard glowColor={glow} className="border border-white/[0.06]">
                      <div className="relative p-4">
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
                                <div className="flex gap-0.5">
                                  <button
                                    onClick={() => openEditModal(transaction)}
                                    className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-primary/10 active:scale-95 transition-all"
                                    aria-label={`Edit: ${transaction.description}`}
                                  >
                                    <Pencil size={14} strokeWidth={2} />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(transaction.id)}
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

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingTransaction(null) }}
        onSubmit={editingTransaction ? handleEdit : handleAdd}
        editData={editingTransaction}
      />
    </motion.div>
  )
}