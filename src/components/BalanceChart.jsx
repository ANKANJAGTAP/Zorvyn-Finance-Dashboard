import { useState } from 'react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { BarChart3, TrendingUp } from 'lucide-react'
import useStore from '../store/useStore'
import { formatAmount } from '../utils/formatters'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null

  return (
    <div
      className="rounded-xl p-3 min-w-[160px]"
      style={{
        background: 'rgba(20, 26, 42, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <p className="text-text-muted text-xs mb-2 font-medium">{label}</p>
      {payload.map((item, i) => (
        <div key={i} className="flex items-center justify-between gap-4 mb-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color, boxShadow: `0 0 6px ${item.color}` }} />
            <span className="text-xs text-text-secondary capitalize">{item.dataKey}</span>
          </div>
          <span className="text-xs font-semibold text-white">{formatAmount(item.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function BalanceChart({ loading }) {
  const [chartType, setChartType] = useState('area')
  const selectedMetric = useStore(s => s.selectedMetric)
  const timeFilter = useStore(s => s.timeFilter)
  const transactions = useStore(s => s.transactions)
  const getChartData = useStore(s => s.getChartData)
  const chartData = getChartData()

  const formattedData = chartData.map(d => ({
    ...d,
    date: new Date(d.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
  }))

  const metricConfig = {
    balance: { color: '#427CF0', label: 'Balance' },
    income: { color: '#22C38E', label: 'Income' },
    expense: { color: '#EF4444', label: 'Expenses' },
    savingsRate: { color: '#855CD6', label: 'Balance' },
  }

  const activeMetric = selectedMetric === 'savingsRate' ? 'balance' : selectedMetric
  const config = metricConfig[activeMetric]

  if (loading) {
    return (
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="skeleton h-5 w-32" />
          <div className="skeleton h-8 w-20 rounded-lg" />
        </div>
        <div className="skeleton h-[250px] w-full" />
      </div>
    )
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-white font-semibold">
          {config.label} Trend
        </h3>

        {/* Chart Type Toggle */}
        <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <button
            onClick={() => setChartType('area')}
            className={`p-1.5 rounded-md transition-all duration-200 ${
              chartType === 'area' ? 'bg-primary/20 text-primary' : 'text-text-muted hover:text-white'
            }`}
            title="Area Chart"
          >
            <TrendingUp size={16} />
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`p-1.5 rounded-md transition-all duration-200 ${
              chartType === 'bar' ? 'bg-primary/20 text-primary' : 'text-text-muted hover:text-white'
            }`}
            title="Bar Chart"
          >
            <BarChart3 size={16} />
          </button>
        </div>
      </div>

      <div className="min-h-[280px]">
        <ResponsiveContainer width="100%" height={280}>
          {chartType === 'area' ? (
            <AreaChart data={formattedData}>
              <defs>
                <linearGradient id="gradient-balance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#427CF0" stopOpacity={0.5} />
                  <stop offset="40%" stopColor="#427CF0" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#427CF0" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="gradient-income" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22C38E" stopOpacity={0.5} />
                  <stop offset="40%" stopColor="#22C38E" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#22C38E" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="gradient-expense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#EF4444" stopOpacity={0.5} />
                  <stop offset="40%" stopColor="#EF4444" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#EF4444" stopOpacity={0.02} />
                </linearGradient>
                {/* Glow filter for the stroke */}
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: '#9DA3AF', fontSize: 11 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#9DA3AF', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              {activeMetric === 'balance' && (
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke={metricConfig.balance.color}
                  fill="url(#gradient-balance)"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6, stroke: metricConfig.balance.color, strokeWidth: 2, fill: 'var(--bg-main)', filter: 'drop-shadow(0 0 6px rgba(66, 124, 240, 0.5))' }}
                />
              )}
              {activeMetric === 'income' && (
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke={metricConfig.income.color}
                  fill="url(#gradient-income)"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6, stroke: metricConfig.income.color, strokeWidth: 2, fill: 'var(--bg-main)', filter: 'drop-shadow(0 0 6px rgba(34, 195, 142, 0.5))' }}
                />
              )}
              {activeMetric === 'expense' && (
                <Area
                  type="monotone"
                  dataKey="expense"
                  stroke={metricConfig.expense.color}
                  fill="url(#gradient-expense)"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6, stroke: metricConfig.expense.color, strokeWidth: 2, fill: 'var(--bg-main)', filter: 'drop-shadow(0 0 6px rgba(239, 68, 68, 0.5))' }}
                />
              )}
            </AreaChart>
          ) : (
            <BarChart data={formattedData}>
              <defs>
                <linearGradient id="bar-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={config.color} stopOpacity={0.9} />
                  <stop offset="100%" stopColor={config.color} stopOpacity={0.4} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: '#9DA3AF', fontSize: 11 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#9DA3AF', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey={activeMetric}
                fill="url(#bar-gradient)"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  )
}
