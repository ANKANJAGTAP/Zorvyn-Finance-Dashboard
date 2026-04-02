import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  Search, Plus, Pencil, Trash2,
  UtensilsCrossed, Car, ShoppingBag, Receipt, Gamepad2,
  Briefcase, Laptop, BarChart3, AlertCircle, RefreshCw
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

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}

export default function Transactions() {
  const [loading, setLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)

  const role = useStore(s => s.role)
  const filters = useStore(s => s.filters)
  const updateFilters = useStore(s => s.updateFilters)
  useStore(s => s.transactions) // Subscribe for reactivity
  const getFilteredTransactions = useStore(s => s.getFilteredTransactions)
  const addTransaction = useStore(s => s.addTransaction)
  const editTransaction = useStore(s => s.editTransaction)
  const deleteTransaction = useStore(s => s.deleteTransaction)

  const transactions = getFilteredTransactions()
  const isAdmin = role === 'admin'

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
      })
      setEditingTransaction(null)
      toast.success('Transaction updated', {
        description: `${data.category} — ₹${Number(data.amount).toLocaleString('en-IN')}`,
      })
    }
  }

  const handleDelete = (id) => {
    // Find the transaction before deleting (for undo)
    const allTransactions = useStore.getState().transactions
    const deletedTransaction = allTransactions.find(t => t.id === id)

    if (!deletedTransaction) return

    // Delete immediately
    deleteTransaction(id)

    // Show undo toast
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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Transactions</h1>
          <p className="text-text-secondary text-sm mt-1">
            {transactions.length} transaction{transactions.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <Button
          variant="primary"
          onClick={openAddModal}
          disabled={!isAdmin}
          aria-label={!isAdmin ? 'Switch to Admin to add transactions' : 'Add new transaction'}
        >
          <Plus size={16} />
          Add Transaction
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" aria-hidden="true" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={filters.search}
            onChange={(e) => updateFilters({ search: e.target.value })}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm glass text-white placeholder:text-text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all duration-200 min-h-[44px]"
            aria-label="Search transactions by description or category"
          />
        </div>

        {/* Type Filter */}
        <select
          value={filters.type}
          onChange={(e) => updateFilters({ type: e.target.value })}
          className="px-3 py-2.5 rounded-lg text-sm glass text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all duration-200 min-h-[44px] cursor-pointer bg-white/[0.05]"
          aria-label="Filter by transaction type"
        >
          <option value="all" className="bg-bg-section">All Types</option>
          <option value="income" className="bg-bg-section">Income</option>
          <option value="expense" className="bg-bg-section">Expense</option>
        </select>

        {/* Category Filter */}
        <select
          value={filters.category}
          onChange={(e) => updateFilters({ category: e.target.value })}
          className="px-3 py-2.5 rounded-lg text-sm glass text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all duration-200 min-h-[44px] cursor-pointer bg-white/[0.05]"
          aria-label="Filter by category"
        >
          <option value="all" className="bg-bg-section">All Categories</option>
          {ALL_CATEGORIES.map(cat => (
            <option key={cat} value={cat} className="bg-bg-section">{cat}</option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={filters.sortBy}
          onChange={(e) => updateFilters({ sortBy: e.target.value })}
          className="px-3 py-2.5 rounded-lg text-sm glass text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all duration-200 min-h-[44px] cursor-pointer bg-white/[0.05]"
          aria-label="Sort transactions"
        >
          <option value="date" className="bg-bg-section">Newest First</option>
          <option value="amount-high" className="bg-bg-section">Amount: High → Low</option>
          <option value="amount-low" className="bg-bg-section">Amount: Low → High</option>
        </select>
      </div>

      {/* Table / Empty State */}
      {loading ? (
        <div className="glass-card overflow-hidden">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-white/5 last:border-0">
              <div className="skeleton w-2 h-2 rounded-full" />
              <div className="skeleton w-9 h-9 rounded-lg" />
              <div className="flex-1">
                <div className="skeleton h-4 w-40 mb-1" />
                <div className="skeleton h-3 w-24" />
              </div>
              <div className="skeleton h-5 w-16 rounded-full" />
              <div className="skeleton h-4 w-20" />
            </div>
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div className="glass-card">
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
          <div className="glass-card overflow-hidden hidden md:block">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3.5 border-b border-white/10 text-text-secondary text-[11px] font-bold uppercase tracking-[0.08em]">
              <div className="col-span-1"></div>
              <div className="col-span-3">Description</div>
              <div className="col-span-2">Category</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-1">Type</div>
              <div className="col-span-2 text-right">Amount</div>
              <div className="col-span-1"></div>
            </div>

            {/* Table Rows */}
            {transactions.map(transaction => {
              const Icon = iconMap[transaction.category] || Receipt
              const isIncome = transaction.type === 'income'

              return (
                <div
                  key={transaction.id}
                  className="group relative grid grid-cols-12 gap-4 items-center px-6 py-5 border-b border-white/5 last:border-0 hover:bg-white/[0.04] transition-all duration-200 cursor-pointer"
                >
                  {/* Left accent on hover */}
                  <div className="absolute left-0 top-[15%] bottom-[15%] w-[2px] rounded-full bg-primary scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-center" />

                  {/* Status Dot */}
                  <div className="col-span-1 flex items-center justify-center min-w-[20px]">
                    <div className={`status-dot ${
                      transaction.status === 'completed' ? 'status-dot--completed' : 'status-dot--pending'
                    }`} />
                  </div>

                  {/* Description */}
                  <div className="col-span-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-white/[0.05]">
                      <Icon size={16} className="text-text-secondary" />
                    </div>
                    <p className="text-sm text-white font-medium truncate">{transaction.description}</p>
                  </div>

                  {/* Category */}
                  <div className="col-span-2">
                    <span className="text-sm text-text-secondary">{transaction.category}</span>
                  </div>

                  {/* Date */}
                  <div className="col-span-2">
                    <span className="text-sm text-text-muted">{formatDate(transaction.date)}</span>
                  </div>

                  {/* Type Badge */}
                  <div className="col-span-1">
                    <span className={`badge ${isIncome ? 'badge--income' : 'badge--expense'}`}>
                      {transaction.type}
                    </span>
                  </div>

                  {/* Amount */}
                  <div className="col-span-2 text-right">
                    <span className={`text-sm font-semibold ${isIncome ? 'amount--income' : 'amount--expense'}`}>
                      {isIncome ? '+' : '-'}{formatAmount(transaction.amount)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <button
                      onClick={(e) => { e.stopPropagation(); openEditModal(transaction) }}
                      disabled={!isAdmin}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        isAdmin
                          ? 'text-text-muted hover:text-primary hover:bg-primary/10'
                          : 'text-text-muted/30 cursor-not-allowed'
                      }`}
                      aria-label={`Edit transaction: ${transaction.description}`}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(transaction.id) }}
                      disabled={!isAdmin}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        isAdmin
                          ? 'text-text-muted hover:text-danger hover:bg-danger/10'
                          : 'text-text-muted/30 cursor-not-allowed'
                      }`}
                      aria-label={`Delete transaction: ${transaction.description}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* ─── Mobile Card Layout ─── */}
          <div className="md:hidden space-y-3">
            {transactions.map(transaction => {
              const Icon = iconMap[transaction.category] || Receipt
              const isIncome = transaction.type === 'income'

              return (
                <div
                  key={transaction.id}
                  className="mobile-transaction-card group"
                >
                  <div className="flex items-start gap-3">
                    {/* Status + Icon */}
                    <div className="flex items-center gap-2 pt-0.5">
                      <div className={`status-dot ${
                        transaction.status === 'completed' ? 'status-dot--completed' : 'status-dot--pending'
                      }`} />
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-white/[0.05]">
                        <Icon size={16} className="text-text-secondary" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm text-white font-medium truncate">{transaction.description}</p>
                          <p className="text-xs text-text-muted mt-0.5">
                            {transaction.category} · {formatDate(transaction.date)}
                          </p>
                        </div>
                        <span className={`text-sm font-semibold flex-shrink-0 ${isIncome ? 'amount--income' : 'amount--expense'}`}>
                          {isIncome ? '+' : '-'}{formatAmount(transaction.amount)}
                        </span>
                      </div>

                      {/* Bottom row: badge + actions */}
                      <div className="flex items-center justify-between mt-2">
                        <span className={`badge ${isIncome ? 'badge--income' : 'badge--expense'}`}>
                          {transaction.type}
                        </span>

                        {isAdmin && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => openEditModal(transaction)}
                              className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-primary/10 transition-all duration-200"
                              aria-label={`Edit: ${transaction.description}`}
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(transaction.id)}
                              className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-all duration-200"
                              aria-label={`Delete: ${transaction.description}`}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
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
