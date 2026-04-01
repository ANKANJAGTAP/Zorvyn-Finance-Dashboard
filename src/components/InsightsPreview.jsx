import { TrendingUp, TrendingDown, PiggyBank } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'
import { formatAmount } from '../utils/formatters'

export default function InsightsPreview({ loading }) {
  const navigate = useNavigate()
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

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">Insights</h3>
        <button
          onClick={() => navigate('/insights')}
          className="text-primary text-sm font-medium hover:text-primary/80 transition-all duration-200"
        >
          View All
        </button>
      </div>

      <div className="space-y-3">
        {previewCards.map((card, i) => {
          const Icon = card.icon
          return (
            <div key={i} className="p-3 rounded-lg transition-all duration-200 hover:bg-white/[0.03]"
              style={{ background: 'rgba(255,255,255,0.02)' }}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.05)' }}
                >
                  <Icon size={16} className={card.color} />
                </div>
                <div>
                  <p className="text-text-secondary text-xs mb-0.5">{card.title}</p>
                  <p className={`text-sm font-semibold ${card.color}`}>{card.value}</p>
                  {card.subtitle && (
                    <p className="text-text-muted text-xs mt-0.5">{card.subtitle}</p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
