import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Lightbulb, TrendingDown, TrendingUp, PiggyBank, Sparkles } from 'lucide-react'
import useStore from '../store/useStore'
import { formatAmount } from '../utils/formatters'
import EmptyState from '../components/EmptyState'

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: (i) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { delay: i * 0.12, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

function generateSummaryText(insights) {
  const parts = []

  if (insights.currentExpense > 0 && insights.currentIncome > 0) {
    const ratio = insights.currentExpense / insights.currentIncome
    if (ratio < 0.5) {
      parts.push('Your spending is well-controlled this month.')
    } else if (ratio < 0.8) {
      parts.push('Your spending remained stable this month.')
    } else {
      parts.push('Your spending is approaching your income level this month.')
    }
  }

  if (insights.topCategory) {
    parts.push(
      `${insights.topCategory.name} accounts for the largest share of your expenses (${insights.topCategory.percentage}%).`
    )
    // Smart insight — the WOW factor
    if (Number(insights.topCategory.percentage) > 40) {
      parts.push(`💡 Consider reviewing your ${insights.topCategory.name} spending — it's above 40% of your total expenses.`)
    }
  }

  if (insights.monthlyChange !== null) {
    if (insights.monthlyChange > 10) {
      parts.push('You may consider reviewing discretionary spending in high-growth categories.')
    } else if (insights.monthlyChange < -5) {
      parts.push('Great job reducing your expenses compared to last month!')
    } else {
      parts.push('Your spending pattern is consistent with previous months.')
    }
  }

  return parts.join(' ') || 'Start adding transactions to get personalized insights.'
}

export default function Insights() {
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  useStore(s => s.transactions) // Subscribe for reactivity
  const getInsights = useStore(s => s.getInsights)
  const insights = getInsights()
  const role = useStore(s => s.role)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const summaryText = generateSummaryText(insights)

  // Check if we have zero data
  const hasZeroData = !insights.topCategory && insights.currentIncome === 0 && insights.currentExpense === 0

  const insightCards = [
    {
      icon: TrendingDown,
      title: 'Highest Spending Category',
      value: insights.topCategory
        ? `${insights.topCategory.name}: ${formatAmount(insights.topCategory.amount)}`
        : null,
      subtitle: insights.topCategory
        ? `${insights.topCategory.percentage}% of total expenses`
        : null,
      fallback: 'No expense data recorded yet',
      fallbackMessage: 'Start tracking your expenses to see which category leads.',
      color: '#EF4444',
      bgClass: 'bg-danger/10',
      glowColor: 'rgba(239, 68, 68, 0.15)',
    },
    {
      icon: TrendingUp,
      title: 'Monthly Comparison',
      value: insights.hasEnoughData && insights.monthlyChange !== null
        ? `${insights.monthlyChange > 0 ? '↑' : '↓'} ${Math.abs(insights.monthlyChange)}% compared to last month`
        : null,
      subtitle: insights.hasEnoughData
        ? `Current: ${formatAmount(insights.currentExpense)} | Previous: ${formatAmount(insights.prevExpense)}`
        : null,
      fallback: '📊 Not enough data for monthly comparison yet. Keep tracking!',
      fallbackMessage: 'We need at least 2 months of data to show comparisons.',
      color: '#427CF0',
      bgClass: 'bg-primary/10',
      glowColor: 'rgba(66, 124, 240, 0.15)',
    },
    {
      icon: PiggyBank,
      title: 'Savings Rate',
      value: insights.currentIncome > 0
        ? insights.savingsRate < 0
          ? `Net Loss: ${formatAmount(Math.abs(insights.currentIncome - insights.currentExpense))}`
          : `Savings rate: ${insights.savingsRate}%`
        : null,
      subtitle: insights.currentIncome > 0
        ? insights.savingsRate < 0
          ? 'Expenses exceeded income this period'
          : `${formatAmount(insights.currentIncome - insights.currentExpense)} saved this month`
        : null,
      fallback: 'No income recorded yet',
      fallbackMessage: 'Add income transactions to calculate your savings rate.',
      color: insights.savingsRate < 0 ? '#F59E0B' : '#22C38E',
      bgClass: insights.savingsRate < 0 ? 'bg-warning/10' : 'bg-success/10',
      glowColor: insights.savingsRate < 0 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(34, 195, 142, 0.15)',
    },
  ]

  if (loading) {
    return (
      <motion.div variants={pageVariants} initial="initial" animate="animate" className="space-y-6">
        <div>
          <div className="skeleton h-7 w-32 mb-2" />
          <div className="skeleton h-4 w-48" />
        </div>
        <div className="skeleton h-24 w-full rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton h-40 w-full rounded-xl" />
          ))}
        </div>
      </motion.div>
    )
  }

  if (hasZeroData) {
    return (
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">Insights</h1>
          <p className="text-text-secondary text-sm mt-1">Based on last 30 days</p>
        </div>
        <div className="glass-card">
          <EmptyState
            variant="no-data"
            icon={Lightbulb}
            title="No insights available yet"
            description="Start adding transactions to unlock AI-powered financial insights and spending analysis."
            actionLabel={role === 'admin' ? '+ Add Transaction' : undefined}
            onAction={role === 'admin' ? () => navigate('/transactions') : undefined}
          />
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
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="space-y-6"
    >
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Insights</h1>
          <p className="text-text-secondary text-sm mt-1">Based on last 30 days</p>
        </div>
      </div>

      {/* AI Summary Block — Premium */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="relative p-6 rounded-2xl overflow-hidden border border-primary/20"
        style={{
          background: 'linear-gradient(135deg, rgba(66, 124, 240, 0.08), rgba(133, 92, 214, 0.06), rgba(34, 195, 142, 0.04))',
          boxShadow: '0 0 40px rgba(66, 124, 240, 0.08), 0 8px 32px rgba(0, 0, 0, 0.2)',
        }}
      >
        {/* Top accent gradient line */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background: 'linear-gradient(90deg, #427CF0, #855CD6, #22C38E)' }}
        />

        {/* Background glow orbs */}
        <div className="absolute -top-10 -left-10 w-32 h-32 rounded-full pointer-events-none bg-[radial-gradient(circle,rgba(66,124,240,0.12),transparent_70%)]" />
        <div className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full pointer-events-none bg-[radial-gradient(circle,rgba(133,92,214,0.08),transparent_70%)]" />

        <div className="relative flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-primary/20 to-accent-purple/15 border border-primary/25 shadow-[0_0_20px_rgba(66,124,240,0.2)]">
            <Sparkles size={20} className="text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-white text-sm font-bold">AI Financial Summary</h3>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-primary/20 to-accent-purple/15 text-primary border border-primary/20">
                Auto
              </span>
            </div>
            <p className="text-text-secondary text-sm leading-relaxed">
              {summaryText}
            </p>
          </div>
        </div>
      </motion.div>

      {/* 3 Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {insightCards.map((card, index) => {
          const Icon = card.icon
          const hasData = card.value !== null

          return (
            <motion.div
              key={index}
              custom={index}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ scale: 1.03, y: -4 }}
              className="relative overflow-hidden rounded-xl p-6 cursor-default group transition-all duration-300 glass-card"
            >
              {/* Subtle gradient overlay on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: `radial-gradient(circle at top right, ${card.glowColor}, transparent 60%)` }}
              />

              <div className="relative z-10">
                {/* Icon with glow */}
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 ${card.bgClass} border`}
                  style={{ borderColor: `${card.color}20`, boxShadow: `0 0 20px ${card.glowColor}` }}
                >
                  <Icon size={22} style={{ color: card.color }} className="group-hover:drop-shadow-lg transition-all duration-300" />
                </div>

                {/* Title */}
                <h3 className="text-text-secondary text-sm font-medium mb-2">{card.title}</h3>

                {hasData ? (
                  <>
                    <p className="text-white text-lg font-bold mb-1">{card.value}</p>
                    {card.subtitle && (
                      <p className="text-text-muted text-xs">{card.subtitle}</p>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-text-muted text-sm mb-1">{card.fallback}</p>
                    <p className="text-text-muted text-xs">{card.fallbackMessage}</p>
                    {role === 'admin' && (
                      <button
                        onClick={() => navigate('/transactions')}
                        className="mt-3 text-primary text-xs font-medium hover:text-primary/80 transition-all duration-200"
                        aria-label="Navigate to add a transaction"
                      >
                        Add Transaction →
                      </button>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
