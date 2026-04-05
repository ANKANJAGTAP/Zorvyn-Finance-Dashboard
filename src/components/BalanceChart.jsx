import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { BarChart3, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react'
import useStore from '../store/useStore'
import { formatAmount } from '../utils/formatters'
import EmptyState from './EmptyState'
import Button from './ui/Button'

/* ─── Animated Custom Tooltip ─── */
const AnimatedTooltip = ({ active, payload, label }) => {
  return (
    <AnimatePresence>
      {active && payload?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 6, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.95 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="chart-tooltip"
        >
          <p className="text-text-muted text-xs mb-2 font-medium">{label}</p>
          {payload.map((item, i) => (
            <div key={i} className="flex items-center justify-between gap-4 mb-1">
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: item.color, boxShadow: `0 0 6px ${item.color}` }}
                />
                <span className="text-xs text-text-secondary capitalize">{item.dataKey}</span>
              </div>
              <span className="text-xs font-semibold text-[rgb(var(--text-primary))]">{formatAmount(item.value)}</span>
            </div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ─── Custom Cursor (vertical crosshair) ─── */
const CustomCursor = ({ points, height }) => {
  if (!points || !points[0]) return null
  return (
    <line
      x1={points[0].x}
      y1={0}
      x2={points[0].x}
      y2={height}
      stroke="rgba(255, 255, 255, 0.12)"
      strokeDasharray="4 4"
      strokeWidth={1}
    />
  )
}

export default function BalanceChart({ loading }) {
  const [chartType, setChartType] = useState('area')
  const [hasError, setHasError] = useState(false)
  const selectedMetric = useStore(s => s.selectedMetric)
  const transactions = useStore(s => s.transactions)
  const timeFilter = useStore(s => s.timeFilter) // Subscribe to trigger re-render on 7d/30d/90d change
  const getChartData = useStore(s => s.getChartData)

  let chartData = []
  try {
    chartData = getChartData()
  } catch {
    setHasError(true)
  }

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

  if (hasError) {
    return (
      <div className="glass-card p-6">
        <div className="error-state p-8 flex flex-col items-center justify-center text-center">
          <AlertCircle size={32} className="text-danger mb-3" />
          <h3 className="text-[rgb(var(--text-primary))] font-semibold mb-1">Failed to load chart</h3>
          <p className="text-text-muted text-sm mb-4">Something went wrong while rendering the chart data.</p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setHasError(false)}
            aria-label="Retry loading chart"
          >
            <RefreshCw size={14} />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  if (formattedData.length === 0) {
    return (
      <div className="glass-card p-6">
        <h3 className="text-[rgb(var(--text-primary))] font-semibold mb-5">{config.label} Trend</h3>
        <EmptyState
          variant="no-data"
          title="No chart data"
          description="Add transactions to see your financial trends over time."
          className="py-8"
        />
      </div>
    )
  }

  const chartGlow = 'rgba(66, 124, 240, 0.2)'

  return (
    <motion.div
      whileHover={{ scale: 1.01, y: -2 }}
      className="glass-card p-6 group transition-shadow duration-300"
      style={{ boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 0 25px ${chartGlow}, 0 8px 25px rgba(0,0,0,0.08)`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.02)'
      }}
      transition={{ duration: 0.25 }}
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-[rgb(var(--text-primary))] font-semibold">
          {config.label} Trend
        </h3>

        {/* Chart Type Toggle */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-white/[0.05]">
          <button
            onClick={() => setChartType('area')}
            className={`p-1.5 rounded-md transition-all duration-200 ${
              chartType === 'area' ? 'bg-primary/20 text-primary' : 'text-text-muted hover:text-[rgb(var(--text-primary))]'
            }`}
            aria-label="Switch to area chart"
            aria-pressed={chartType === 'area'}
          >
            <TrendingUp size={16} />
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`p-1.5 rounded-md transition-all duration-200 ${
              chartType === 'bar' ? 'bg-primary/20 text-primary' : 'text-text-muted hover:text-[rgb(var(--text-primary))]'
            }`}
            aria-label="Switch to bar chart"
            aria-pressed={chartType === 'bar'}
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
              <Tooltip
                content={<AnimatedTooltip />}
                cursor={<CustomCursor />}
              />
              {activeMetric === 'balance' && (
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke={metricConfig.balance.color}
                  fill="url(#gradient-balance)"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6, stroke: metricConfig.balance.color, strokeWidth: 2, fill: 'var(--bg-main)' }}
                  animationDuration={800}
                  animationEasing="ease-out"
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
                  activeDot={{ r: 6, stroke: metricConfig.income.color, strokeWidth: 2, fill: 'var(--bg-main)' }}
                  animationDuration={800}
                  animationEasing="ease-out"
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
                  activeDot={{ r: 6, stroke: metricConfig.expense.color, strokeWidth: 2, fill: 'var(--bg-main)' }}
                  animationDuration={800}
                  animationEasing="ease-out"
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
              <Tooltip
                content={<AnimatedTooltip />}
                cursor={<CustomCursor />}
              />
              <Bar
                dataKey={activeMetric}
                fill="url(#bar-gradient)"
                radius={[6, 6, 0, 0]}
                animationDuration={800}
                animationEasing="ease-out"
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
