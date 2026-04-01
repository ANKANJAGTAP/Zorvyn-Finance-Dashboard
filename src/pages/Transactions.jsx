import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Plus, Pencil, Trash2, UtensilsCrossed, Car, ShoppingBag, Receipt, Gamepad2, Briefcase, Laptop, BarChart3 } from 'lucide-react'
import useStore from '../store/useStore'
import { formatAmount, formatDate } from '../utils/formatters'
import { ALL_CATEGORIES } from '../data/mockData'
import TransactionModal from '../components/TransactionModal'

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
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)

  const role = useStore(s => s.role)
  const filters = useStore(s => s.filters)
  const updateFilters = useStore(s => s.updateFilters)
  const getFilteredTransactions = useStore(s => s.getFilteredTransactions)
  const addTransaction = useStore(s => s.addTransaction)
  const editTransaction = useStore(s => s.editTransaction)
  const deleteTransaction = useStore(s => s.deleteTransaction)

  const transactions = getFilteredTransactions()
  const isAdmin = role === 'admin'

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400)
    return () => clearTimeout(timer)
  }, [])

  const handleAdd = (data) => {
    addTransaction({
      ...data,
      description: data.description || data.category,
    })
  }

  const handleEdit = (data) => {
    if (editingTransaction) {
      editTransaction(editingTransaction.id, {
        ...data,
        description: data.description || data.category,
      })
      setEditingTransaction(null)
    }
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      deleteTransaction(id)
    }
  }

  const openEditModal = (transaction) => {
    setEditingTransaction(transaction)
    setModalOpen(true)
  }

  const openAddModal = () => {
    setEditingTransaction(null)
    setModalOpen(true)
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
        <button
          onClick={openAddModal}
          disabled={!isAdmin}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 min-h-[44px] ${
            isAdmin
              ? 'text-white active:scale-95'
              : 'bg-white/5 text-text-muted cursor-not-allowed'
          }`}
          style={isAdmin ? {
            background: 'linear-gradient(135deg, #427CF0, #855CD6)',
            boxShadow: '0 2px 10px rgba(66, 124, 240, 0.3)',
          } : {}}
          onMouseEnter={(e) => { if (isAdmin) e.currentTarget.style.boxShadow = '0 4px 20px rgba(66, 124, 240, 0.45)' }}
          onMouseLeave={(e) => { if (isAdmin) e.currentTarget.style.boxShadow = '0 2px 10px rgba(66, 124, 240, 0.3)' }}
          title={!isAdmin ? 'Switch to Admin to add transactions' : undefined}
        >
          <Plus size={16} />
          Add Transaction
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={filters.search}
            onChange={(e) => updateFilters({ search: e.target.value })}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm glass text-white placeholder:text-text-muted focus:outline-none focus:border-primary/50 transition-all duration-200 min-h-[44px]"
          />
        </div>

        {/* Type Filter */}
        <select
          value={filters.type}
          onChange={(e) => updateFilters({ type: e.target.value })}
          className="px-3 py-2.5 rounded-lg text-sm glass text-white focus:outline-none focus:border-primary/50 transition-all duration-200 min-h-[44px] cursor-pointer"
          style={{ background: 'rgba(255,255,255,0.05)' }}
        >
          <option value="all" style={{ background: 'var(--bg-section)' }}>All Types</option>
          <option value="income" style={{ background: 'var(--bg-section)' }}>Income</option>
          <option value="expense" style={{ background: 'var(--bg-section)' }}>Expense</option>
        </select>

        {/* Category Filter */}
        <select
          value={filters.category}
          onChange={(e) => updateFilters({ category: e.target.value })}
          className="px-3 py-2.5 rounded-lg text-sm glass text-white focus:outline-none focus:border-primary/50 transition-all duration-200 min-h-[44px] cursor-pointer"
          style={{ background: 'rgba(255,255,255,0.05)' }}
        >
          <option value="all" style={{ background: 'var(--bg-section)' }}>All Categories</option>
          {ALL_CATEGORIES.map(cat => (
            <option key={cat} value={cat} style={{ background: 'var(--bg-section)' }}>
              {cat}
            </option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={filters.sortBy}
          onChange={(e) => updateFilters({ sortBy: e.target.value })}
          className="px-3 py-2.5 rounded-lg text-sm glass text-white focus:outline-none focus:border-primary/50 transition-all duration-200 min-h-[44px] cursor-pointer"
          style={{ background: 'rgba(255,255,255,0.05)' }}
        >
          <option value="date" style={{ background: 'var(--bg-section)' }}>Newest First</option>
          <option value="amount-high" style={{ background: 'var(--bg-section)' }}>Amount: High → Low</option>
          <option value="amount-low" style={{ background: 'var(--bg-section)' }}>Amount: Low → High</option>
        </select>
      </div>

      {/* Table */}
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
        /* Empty State */
        <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >
            <BarChart3 size={32} className="text-text-muted" />
          </div>
          <h3 className="text-white font-semibold text-lg mb-1">
            {filters.search || filters.type !== 'all' || filters.category !== 'all'
              ? 'No transactions match your filters'
              : 'No transactions yet'}
          </h3>
          <p className="text-text-muted text-sm mb-4">
            {filters.search || filters.type !== 'all' || filters.category !== 'all'
              ? 'Try adjusting your filters or search term'
              : 'Start tracking your finances by adding your first transaction'}
          </p>
          {filters.search || filters.type !== 'all' || filters.category !== 'all' ? (
            <button
              onClick={() => updateFilters({ search: '', type: 'all', category: 'all', sortBy: 'date' })}
              className="px-4 py-2 rounded-lg text-sm font-medium text-primary hover:bg-primary/10 transition-all duration-200"
            >
              Clear Filters
            </button>
          ) : isAdmin ? (
            <button
              onClick={openAddModal}
              className="px-4 py-2.5 rounded-lg bg-primary hover:bg-primary/80 text-white text-sm font-medium transition-all duration-200 active:scale-[0.98]"
            >
              Add your first transaction!
            </button>
          ) : null}
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3.5 border-b border-white/10 text-text-secondary text-[11px] font-bold uppercase tracking-[0.08em]">
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
                className="group relative grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 items-center px-6 py-6 border-b border-white/5 last:border-0 hover:bg-white/[0.05] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-all duration-200 cursor-pointer"
              >
                {/* Left accent on hover */}
                <div className="absolute left-0 top-[15%] bottom-[15%] w-[2px] rounded-full bg-primary scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-center" />
                {/* Status Dot */}
                <div className="hidden md:flex col-span-1 items-center justify-center min-w-[20px]">
                  <div className={`status-dot ${
                    transaction.status === 'completed' ? 'status-dot--completed' : 'status-dot--pending'
                  }`} />
                </div>

                {/* Description */}
                <div className="md:col-span-3 flex items-center gap-3">
                  <div className={`md:hidden status-dot ${
                    transaction.status === 'completed' ? 'status-dot--completed' : 'status-dot--pending'
                  }`} />
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(255,255,255,0.05)' }}
                  >
                    <Icon size={16} className="text-text-secondary" />
                  </div>
                  <p className="text-sm text-white font-medium truncate">{transaction.description}</p>
                </div>

                {/* Category */}
                <div className="md:col-span-2">
                  <span className="text-sm text-text-secondary">{transaction.category}</span>
                </div>

                {/* Date */}
                <div className="md:col-span-2">
                  <span className="text-sm text-text-muted">{formatDate(transaction.date)}</span>
                </div>

                {/* Type Badge */}
                <div className="md:col-span-1">
                  <span className={`badge ${isIncome ? 'badge--income' : 'badge--expense'}`}>
                    {transaction.type}
                  </span>
                </div>

                {/* Amount */}
                <div className="md:col-span-2 text-right">
                  <span className={`text-sm font-semibold ${isIncome ? 'amount--income' : 'amount--expense'}`}>
                    {isIncome ? '+' : '-'}{formatAmount(transaction.amount)}
                  </span>
                </div>

                {/* Actions — slightly visible, full on hover */}
                <div className="md:col-span-1 flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <button
                    onClick={(e) => { e.stopPropagation(); openEditModal(transaction) }}
                    disabled={!isAdmin}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      isAdmin
                        ? 'text-text-muted hover:text-primary hover:bg-primary/10'
                        : 'text-text-muted/30 cursor-not-allowed'
                    }`}
                    title={!isAdmin ? 'Switch to Admin to edit' : 'Edit'}
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
                    title={!isAdmin ? 'Switch to Admin to delete' : 'Delete'}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
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
