import { useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, PiggyBank } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'
import { formatAmount } from '../utils/formatters'
import EmptyState from './EmptyState'

export default function InsightsPreview({ loading }) {
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const navigate = useNavigate()
  useStore(s => s.transactions) // Subscribe for reactivity
  useStore(s => s.timeFilter) // Subscribe to time filter for reactivity
  const getInsights = useStore(s => s.getInsights)
  const insights = getInsights()

  if (loading) {
    return (
      <div className="glass-card p-5">
        <div className="skeleton h-5 w-32 mb-4" />
        {[1, 2, 3].map(i => (
          <div key={i} className="skeleton h-16 w-full mb-3 rounded-lg" />
        ))}
      </div>
    )
  }

  // Check if we have ANY meaningful data
  const hasAnyData = insights.topCategory || insights.currentIncome > 0 || insights.currentExpense > 0

  const previewCards = [
    {
      icon: TrendingDown,
      title: 'Top Spending',
      value: insights.topCategory
        ? `${insights.topCategory.name}: ${formatAmount(insights.topCategory.amount)}`
        : 'No data yet',
      subtitle: insights.topCategory ? `${insights.topCategory.percentage}% of expenses` : '',
      color: 'text-danger',
    },
    {
      icon: TrendingUp,
      title: 'Monthly Change',
      value: insights.monthlyChange !== null
        ? `${insights.monthlyChange > 0 ? '↑' : '↓'} ${Math.abs(insights.monthlyChange)}%`
        : 'Not enough data',
      subtitle: insights.hasEnoughData ? 'vs last month' : 'Keep tracking!',
      color: insights.monthlyChange > 0 ? 'text-danger' : 'text-success',
    },
    {
      icon: PiggyBank,
      title: 'Savings Rate',
      value: insights.savingsRate < 0
        ? `Net Loss ${formatAmount(Math.abs(insights.currentIncome - insights.currentExpense))}`
        : `${insights.savingsRate}%`,
      subtitle: insights.savingsRate < 0 ? 'Expenses exceed income' : 'of income saved',
      color: insights.savingsRate < 0 ? 'text-warning' : 'text-accent-green',
    },
  ]

  const insightsGlow = 'rgba(66, 124, 240, 0.2)'

  return (
    <motion.div
      whileHover={{ scale: 1.01, y: -2 }}
      className="glass-card p-5 group"
      style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 0 35px ${insightsGlow}, 0 8px 32px rgba(0,0,0,0.35)`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)'
      }}
      transition={{ duration: 0.25 }}
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-white font-semibold text-base">Insights</h3>
        <button
          onClick={() => navigate('/insights')}
          className="text-primary text-xs font-semibold uppercase tracking-wider hover:text-primary/80 transition-all duration-200"
          aria-label="View all insights"
        >
          View All →
        </button>
      </div>

      {!hasAnyData ? (
        <EmptyState
          variant="no-data"
          title="No insights available"
          description="Add some transactions to unlock AI-powered financial insights."
          actionLabel="+ Add Transaction"
          onAction={() => navigate('/transactions')}
          className="py-6"
        />
      ) : (
        <div 
          className="space-y-0"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {previewCards.map((card, i) => {
            const Icon = card.icon
            const isHov = hoveredIndex === i

            return (
              <div 
                key={i} 
                onMouseEnter={() => setHoveredIndex(i)}
                className="relative py-3 flex items-start gap-3 border-b border-white/[0.06] last:border-0 px-2 -mx-2 transition-all duration-200 rounded-lg"
              >
                {/* ─── Aceternity-style sliding hover bg ─── */}
                {isHov && (
                  <motion.span
                    layoutId="insights-hover-bg"
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
                
                <div className="relative z-10 w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-white/[0.05] border border-white/[0.06]">
                  <Icon size={16} className={card.color} />
                </div>
                <div className="relative z-10 flex-1 min-w-0">
                  <p className="text-text-secondary text-xs font-medium mb-0.5">{card.title}</p>
                  <p className={`text-sm font-bold ${card.color}`}>{card.value}</p>
                  {card.subtitle && (
                    <p className="text-text-muted text-[11px] mt-0.5">{card.subtitle}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
