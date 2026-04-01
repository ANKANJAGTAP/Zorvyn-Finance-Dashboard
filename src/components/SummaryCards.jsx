import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Wallet, TrendingUp, TrendingDown, Percent, AlertTriangle } from 'lucide-react'
import useStore from '../store/useStore'
import { formatAmount } from '../utils/formatters'

const cards = [
  {
    key: 'balance',
    label: 'Total Balance',
    icon: Wallet,
    tintBg: 'rgba(66, 124, 240, 0.06)',
    tintBorder: 'rgba(66, 124, 240, 0.15)',
    glowColor: 'rgba(66, 124, 240, 0.2)',
    gradientBg: 'linear-gradient(135deg, rgba(66, 124, 240, 0.08), rgba(66, 124, 240, 0.02))',
    iconColor: 'text-primary',
    accentColor: '#427CF0',
  },
  {
    key: 'income',
    label: 'Income',
    icon: TrendingUp,
    tintBg: 'rgba(34, 195, 142, 0.06)',
    tintBorder: 'rgba(34, 195, 142, 0.15)',
    glowColor: 'rgba(34, 195, 142, 0.2)',
    gradientBg: 'linear-gradient(135deg, rgba(34, 195, 142, 0.08), rgba(34, 195, 142, 0.02))',
    iconColor: 'text-success',
    accentColor: '#22C38E',
  },
  {
    key: 'expense',
    label: 'Expenses',
    icon: TrendingDown,
    tintBg: 'rgba(239, 68, 68, 0.06)',
    tintBorder: 'rgba(239, 68, 68, 0.15)',
    glowColor: 'rgba(239, 68, 68, 0.18)',
    gradientBg: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(239, 68, 68, 0.02))',
    iconColor: 'text-danger',
    accentColor: '#EF4444',
  },
  {
    key: 'savingsRate',
    label: 'Savings Rate',
    icon: Percent,
    tintBg: 'rgba(133, 92, 214, 0.06)',
    tintBorder: 'rgba(133, 92, 214, 0.15)',
    glowColor: 'rgba(133, 92, 214, 0.2)',
    gradientBg: 'linear-gradient(135deg, rgba(133, 92, 214, 0.08), rgba(133, 92, 214, 0.02))',
    iconColor: 'text-accent-purple',
    accentColor: '#855CD6',
  },
]

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

export default function SummaryCards({ loading }) {
  const selectedMetric = useStore(s => s.selectedMetric)
  const setSelectedMetric = useStore(s => s.setSelectedMetric)
  const timeFilter = useStore(s => s.timeFilter)
  const getTimeFilteredTransactions = useStore(s => s.getTimeFilteredTransactions)

  const totals = useMemo(() => {
    const filtered = getTimeFilteredTransactions()
    const income = filtered
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    const expense = filtered
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
    const balance = income - expense
    const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0
    return { income, expense, balance, savingsRate }
  }, [timeFilter, getTimeFilteredTransactions])

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="glass-card p-6 h-[130px]">
            <div className="skeleton h-4 w-24 mb-3" />
            <div className="skeleton h-7 w-32 mb-2" />
            <div className="skeleton h-3 w-20" />
          </div>
        ))}
      </div>
    )
  }

  const values = {
    balance: totals.balance,
    income: totals.income,
    expense: totals.expense,
    savingsRate: totals.savingsRate,
  }

  // Format savings rate: if negative, show "Net Loss" instead of negative %
  const formatSavingsDisplay = (rate) => {
    if (rate < 0) {
      const netLoss = Math.abs(totals.balance)
      return `Net Loss ${formatAmount(netLoss)}`
    }
    return `${rate.toFixed(1)}%`
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon
        const isSelected = selectedMetric === card.key
        const value = values[card.key]
        const isPercentage = card.key === 'savingsRate'
        const isNegativeSavings = card.key === 'savingsRate' && value < 0

        return (
          <motion.button
            key={card.key}
            custom={index}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setSelectedMetric(card.key)}
            className={`relative overflow-hidden rounded-xl p-6 text-left cursor-pointer group border ${
              isSelected
                ? 'border-white/20'
                : 'border-white/[0.06] hover:border-white/15'
            }`}
            style={{
              background: card.gradientBg,
              boxShadow: isSelected
                ? `0 0 30px ${card.glowColor}, 0 8px 32px rgba(0,0,0,0.4)`
                : '0 4px 20px rgba(0,0,0,0.2)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = `0 0 35px ${card.glowColor}, 0 8px 32px rgba(0,0,0,0.35)`
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = isSelected
                ? `0 0 30px ${card.glowColor}, 0 8px 32px rgba(0,0,0,0.4)`
                : '0 4px 20px rgba(0,0,0,0.2)'
            }}
          >
            {/* Gradient overlay — always subtle, stronger on hover */}
            <div
              className="absolute inset-0 opacity-40 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{
                background: `radial-gradient(circle at top right, ${card.glowColor}, transparent 60%)`,
              }}
            />

            {/* Bottom edge glow when selected */}
            {isSelected && (
              <div
                className="absolute bottom-0 left-[10%] right-[10%] h-[1px] pointer-events-none"
                style={{
                  background: `linear-gradient(90deg, transparent, ${card.accentColor}, transparent)`,
                  boxShadow: `0 0 10px ${card.accentColor}60`,
                }}
              />
            )}

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-text-secondary text-sm font-medium">{card.label}</span>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                  style={{
                    background: card.tintBg,
                    border: `1px solid ${card.tintBorder}`,
                    boxShadow: isSelected ? `0 0 15px ${card.glowColor}` : 'none',
                  }}
                >
                  {isNegativeSavings
                    ? <AlertTriangle size={18} className="text-warning" />
                    : <Icon size={18} className={card.iconColor} />
                  }
                </div>
              </div>

              <p className={`text-2xl font-bold mb-2 ${isNegativeSavings ? 'text-warning' : 'text-white'}`}>
                {isPercentage ? formatSavingsDisplay(value) : formatAmount(value)}
              </p>

              <div className="flex items-center gap-2">
                {isNegativeSavings ? (
                  <span className="text-warning text-xs font-medium">Expenses exceed income</span>
                ) : (
                  <>
                    <div className="flex items-center gap-1">
                      <TrendingUp size={14} className="text-success" />
                      <span className="text-success text-xs font-semibold">
                        +{(Math.random() * 10 + 2).toFixed(1)}%
                      </span>
                    </div>
                    <span className="text-text-muted text-xs">vs last period</span>
                  </>
                )}
              </div>
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}
