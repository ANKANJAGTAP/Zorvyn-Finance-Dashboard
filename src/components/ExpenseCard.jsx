import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { TrendingDown, TrendingUp } from 'lucide-react'
import useStore from '../store/useStore'
import { formatAmount } from '../utils/formatters'
import useMediaQuery from '../hooks/useMediaQuery'
import AnimatedCounter from './AnimatedCounter'

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay: 0.16, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

export default function ExpenseCard({ loading }) {
  const timeFilter = useStore(s => s.timeFilter)
  const transactions = useStore(s => s.transactions)
  const selectedMetric = useStore(s => s.selectedMetric)
  const setSelectedMetric = useStore(s => s.setSelectedMetric)
  const getTimeFilteredTransactions = useStore(s => s.getTimeFilteredTransactions)
  const getCategoryBreakdown = useStore(s => s.getCategoryBreakdown)
  const getInsights = useStore(s => s.getInsights)

  const isSelected = selectedMetric === 'expense'
  const accentColor = '#EF4444'
  const isMobile = useMediaQuery('(max-width: 767px)')

  const totalExpense = useMemo(() => {
    const filtered = getTimeFilteredTransactions()
    return filtered
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
  }, [timeFilter, transactions, getTimeFilteredTransactions])

  const topCategories = useMemo(() => {
    const breakdown = getCategoryBreakdown()
    return breakdown
      .sort((a, b) => b.value - a.value)
      .slice(0, 2)
  }, [timeFilter, transactions, getCategoryBreakdown])

  const periodChange = useMemo(() => {
    const ins = getInsights()
    if (!ins.prevExpense) return ins.currentExpense > 0 ? 100 : 0
    return ((ins.currentExpense - ins.prevExpense) / ins.prevExpense) * 100
  }, [timeFilter, transactions, getInsights])

  const changeValue = Math.abs(periodChange).toFixed(1)
  const isIncreased = periodChange > 0

  const glowColor = 'rgba(239, 68, 68, 0.18)'

  if (loading) {
    return (
      <div className="glass-card p-6 h-[180px] lg:h-[200px]">
        <div className="skeleton h-4 w-20 mb-3" />
        <div className="skeleton h-7 w-32 mb-2" />
        <div className="skeleton h-3 w-20 mb-4" />
        <div className="skeleton h-3 w-full mb-2" />
        <div className="skeleton h-3 w-3/4" />
      </div>
    )
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => setSelectedMetric('expense')}
      className={`relative overflow-hidden rounded-xl p-6 text-left cursor-pointer group border bg-gradient-to-br from-danger/[0.08] to-danger/[0.02] ${
        isSelected ? 'border-white/20' : 'border-white/[0.06] hover:border-white/15'
      }`}
      style={{
        boxShadow: isSelected
          ? `0 0 30px ${glowColor}, 0 8px 32px rgba(0,0,0,0.4)`
          : '0 4px 20px rgba(0,0,0,0.2)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 0 35px ${glowColor}, 0 8px 32px rgba(0,0,0,0.35)`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = isSelected
          ? `0 0 30px ${glowColor}, 0 8px 32px rgba(0,0,0,0.4)`
          : '0 4px 20px rgba(0,0,0,0.2)'
      }}
    >
      {/* Gradient overlay */}
      <div
        className="absolute inset-0 opacity-40 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-xl"
        style={{ background: `radial-gradient(circle at top right, ${glowColor}, transparent 60%)` }}
      />

      {/* Bottom edge glow when selected */}
      {isSelected && (
        <div
          className="absolute bottom-0 left-[10%] right-[10%] h-[1px] pointer-events-none"
          style={{
            background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
            boxShadow: `0 0 10px ${accentColor}60`,
          }}
        />
      )}

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-text-secondary text-sm font-medium">Expenses</span>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 border bg-danger/[0.06] border-danger/[0.15]">
            <TrendingDown size={18} className="text-danger" />
          </div>
        </div>

        {/* Amount */}
        <p className="text-lg sm:text-2xl font-bold text-white mb-2">
          <AnimatedCounter value={totalExpense} isCurrency className="tabular-nums" />
        </p>

        {/* Change badge */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-1">
            {isIncreased ? (
              <TrendingUp size={14} className="text-danger" />
            ) : (
              <TrendingDown size={14} className="text-success" />
            )}
            <span className={`text-xs font-semibold ${isIncreased ? 'text-danger' : 'text-success'}`}>
              {isIncreased ? '+' : '-'}{changeValue}%
            </span>
          </div>
          <span className="text-text-muted text-xs">vs last period</span>
        </div>

        {/* Mini Breakdown — Top 2 categories */}
        {topCategories.length > 0 && (
          <div className="border-t border-white/[0.06] pt-3 space-y-1.5">
            {topCategories.map(cat => (
              <div key={cat.name} className="flex items-center justify-between">
                <span className="text-text-muted text-xs">{cat.name}</span>
                <span className="text-text-secondary text-xs font-medium tabular-nums">
                  {isMobile ? `₹${(cat.value / 1000).toFixed(cat.value >= 100000 ? 0 : 1).replace(/\.0$/, '')}K` : formatAmount(cat.value)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
