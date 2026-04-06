import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, UtensilsCrossed, Car, ShoppingBag, Receipt, Gamepad2, Briefcase, Laptop } from 'lucide-react'
import useStore from '../store/useStore'
import { formatAmount, formatDate } from '../utils/formatters'
import EmptyState from './EmptyState'

const iconMap = {
  Food: UtensilsCrossed,
  Transport: Car,
  Shopping: ShoppingBag,
  Bills: Receipt,
  Entertainment: Gamepad2,
  Salary: Briefcase,
  Freelance: Laptop,
}

export default function RecentTransactions({ loading }) {
  const [hoveredId, setHoveredId] = useState(null)
  const navigate = useNavigate()
  const transactions = useStore(s => s.transactions)
  const recent = transactions.slice(0, 6)

  if (loading) {
    return (
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="skeleton h-5 w-40" />
          <div className="skeleton h-4 w-16" />
        </div>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0">
            <div className="skeleton w-9 h-9 rounded-lg" />
            <div className="flex-1">
              <div className="skeleton h-4 w-32 mb-1" />
              <div className="skeleton h-3 w-20" />
            </div>
            <div className="skeleton h-4 w-20" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">Recent Transactions</h3>
        <button
          onClick={() => navigate('/transactions')}
          className="flex items-center gap-1 text-primary text-sm font-medium hover:text-primary/80 transition-all duration-200"
          aria-label="View all transactions"
        >
          View All
          <ArrowRight size={14} />
        </button>
      </div>

      {recent.length === 0 ? (
        <EmptyState
          variant="no-data"
          title="No transactions yet"
          description="Start tracking your finances by adding your first transaction."
          actionLabel="+ Add Transaction"
          onAction={() => navigate('/transactions')}
          className="py-8"
        />
      ) : (
        <div 
          className="space-y-0"
          onMouseLeave={() => setHoveredId(null)}
        >
          {recent.map(transaction => {
            const Icon = iconMap[transaction.category] || Receipt
            const isIncome = transaction.type === 'income'
            const isHov = hoveredId === transaction.id

            return (
              <div
                key={transaction.id}
                onMouseEnter={() => setHoveredId(transaction.id)}
                className="relative flex items-center gap-3 py-3 border-b border-white/5 last:border-0 transition-all duration-200 -mx-2 px-2 rounded-lg"
              >
                {/* ─── Aceternity-style sliding hover bg ─── */}
                {isHov && (
                  <motion.span
                    layoutId="transactions-hover-bg"
                    className="absolute inset-0 rounded-lg bg-white/[0.05]"
                    style={{ originX: 0.5, originY: 0.5 }}
                    transition={{
                      type: 'spring',
                      stiffness: 350,
                      damping: 25,
                      mass: 0.8,
                    }}
                  />
                )}

                {/* Status Dot */}
                <div className={`relative z-10 status-dot ${transaction.status === 'completed' ? 'status-dot--completed' : 'status-dot--pending'}`} />

                {/* Category Icon */}
                <div className="relative z-10 w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-white/[0.05]">
                  <Icon size={16} className="text-text-secondary" />
                </div>

                {/* Description + Category */}
                <div className="relative z-10 flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">{transaction.description}</p>
                  <p className="text-xs text-text-muted">{transaction.category} · {formatDate(transaction.date)}</p>
                </div>

                {/* Amount */}
                <span className={`relative z-10 text-sm font-semibold ${isIncome ? 'amount--income' : 'amount--expense'}`}>
                  {isIncome ? '+' : '-'}{formatAmount(transaction.amount)}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
