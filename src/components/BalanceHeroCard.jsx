import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Wallet, TrendingUp, TrendingDown, Plus } from 'lucide-react'
import { AreaChart, Area, ResponsiveContainer } from 'recharts'
import useStore from '../store/useStore'
import { formatAmount } from '../utils/formatters'
import AnimatedCounter from './AnimatedCounter'
import Button from './ui/Button'

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay: 0, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

export default function BalanceHeroCard({ loading, onAddTransaction }) {
  const timeFilter = useStore(s => s.timeFilter)
  const transactions = useStore(s => s.transactions)
  const role = useStore(s => s.role)
  const selectedMetric = useStore(s => s.selectedMetric)
  const setSelectedMetric = useStore(s => s.setSelectedMetric)
  const getTimeFilteredTransactions = useStore(s => s.getTimeFilteredTransactions)
  const getChartData = useStore(s => s.getChartData)
  const getInsights = useStore(s => s.getInsights)

  const isSelected = selectedMetric === 'balance'

  const balance = useMemo(() => {
    const filtered = getTimeFilteredTransactions()
    const income = filtered
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    const expense = filtered
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
    return income - expense
  }, [timeFilter, transactions, getTimeFilteredTransactions])

  const sparklineData = useMemo(() => {
    try {
      return getChartData()
    } catch {
      return []
    }
  }, [timeFilter, transactions, getChartData])

  const periodChange = useMemo(() => {
    const ins = getInsights()
    const currentBal = ins.currentIncome - ins.currentExpense
    const prevBal = (ins.prevIncome || 0) - (ins.prevExpense || 0)
    if (prevBal === 0) return currentBal > 0 ? 100 : 0
    return ((currentBal - prevBal) / Math.abs(prevBal)) * 100
  }, [timeFilter, transactions, getInsights])

  const changeValue = Math.abs(periodChange).toFixed(1)
  const isPositive = periodChange >= 0

  const glowColor = 'rgba(66, 124, 240, 0.2)'
  const accentColor = '#427CF0'

  if (loading) {
    return (
      <div className="glass-card p-6 h-[180px] lg:h-[200px]">
        <div className="skeleton h-4 w-24 mb-3" />
        <div className="skeleton h-8 w-40 mb-2" />
        <div className="skeleton h-3 w-20 mb-4" />
        <div className="skeleton h-[60px] w-full rounded-lg" />
      </div>
    )
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => setSelectedMetric('balance')}
      className={`relative overflow-hidden rounded-xl p-6 text-left cursor-pointer group border bg-gradient-to-br from-primary/[0.08] to-primary/[0.02] ${
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
          <span className="text-text-secondary text-sm font-medium">Total Balance</span>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 border bg-primary/[0.06] border-primary/[0.15]">
            <Wallet size={18} className="text-primary" />
          </div>
        </div>

        {/* Amount */}
        <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
          <AnimatedCounter value={balance} isCurrency className="tabular-nums" />
        </p>

        {/* Change badge */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-1">
            {isPositive ? (
              <TrendingUp size={14} className="text-success" />
            ) : (
              <TrendingDown size={14} className="text-danger" />
            )}
            <span className={`text-xs font-semibold ${isPositive ? 'text-success' : 'text-danger'}`}>
              {isPositive ? '+' : '-'}{changeValue}%
            </span>
          </div>
          <span className="text-text-muted text-xs">vs last period</span>
        </div>

        {/* Sparkline + CTA Row */}
        <div className="flex items-end justify-between gap-4">
          {/* Sparkline */}
          <div className="flex-1 h-[50px] opacity-60 group-hover:opacity-90 transition-opacity duration-300">
            {sparklineData.length > 1 && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparklineData}>
                  <defs>
                    <linearGradient id="sparkline-gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={accentColor} stopOpacity={0.4} />
                      <stop offset="100%" stopColor={accentColor} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="balance"
                    stroke={accentColor}
                    fill="url(#sparkline-gradient)"
                    strokeWidth={1.5}
                    dot={false}
                    animationDuration={800}
                    animationEasing="ease-out"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Quick Add — compact icon */}
          {role === 'admin' && (
            <button
              onClick={onAddTransaction}
              className="flex-shrink-0 w-9 h-9 rounded-xl bg-primary/20 hover:bg-primary/30 text-primary flex items-center justify-center transition-all duration-200 hover:scale-110"
              aria-label="Quick add transaction"
            >
              <Plus size={18} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
