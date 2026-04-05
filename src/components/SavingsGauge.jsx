import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Percent, AlertTriangle, PieChart as PieIcon } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import useStore from '../store/useStore'
import { formatAmount } from '../utils/formatters'
import { CATEGORY_COLORS } from '../data/mockData'

/* ─── Compact amount for donut center ─── */
function formatCompact(value) {
  const abs = Math.abs(value)
  if (abs >= 10000000) return `₹${(abs / 10000000).toFixed(1)}Cr`
  if (abs >= 100000) return `₹${(abs / 100000).toFixed(1)}L`
  if (abs >= 1000) return `₹${(abs / 1000).toFixed(1)}K`
  return `₹${abs.toFixed(0)}`
}

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay: 0.08, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

const RING_SIZE = 120
const STROKE_WIDTH = 10
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const TARGET_RATE = 50

/* ─── Custom Tooltip for Donut ─── */
function DonutTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const { name, value, percentage } = payload[0].payload
  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="chart-tooltip"
    >
      <p className="text-text-muted text-xs mb-1 font-medium">{name}</p>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: CATEGORY_COLORS[name] || '#427CF0' }}
          />
          <span className="text-xs text-white font-semibold">{formatAmount(value)}</span>
        </div>
        <span className="text-xs text-text-secondary">{percentage}%</span>
      </div>
    </motion.div>
  )
}

export default function SavingsGauge({ loading }) {
  const [activeTab, setActiveTab] = useState('spending')
  const timeFilter = useStore(s => s.timeFilter)
  const transactions = useStore(s => s.transactions)
  const getInsights = useStore(s => s.getInsights)
  const getCategoryBreakdown = useStore(s => s.getCategoryBreakdown)

  const insights = useMemo(() => {
    return getInsights()
  }, [timeFilter, transactions, getInsights])

  const categoryData = useMemo(() => {
    return getCategoryBreakdown()
  }, [timeFilter, transactions, getCategoryBreakdown])

  const totalExpense = useMemo(() => {
    return categoryData.reduce((sum, c) => sum + c.value, 0)
  }, [categoryData])

  const savingsRate = parseFloat(insights.savingsRate) || 0
  const isNegative = savingsRate < 0
  const displayRate = Math.min(Math.abs(savingsRate), 100)
  const strokeDashoffset = CIRCUMFERENCE - (displayRate / 100) * CIRCUMFERENCE
  const targetDashoffset = CIRCUMFERENCE - (TARGET_RATE / 100) * CIRCUMFERENCE

  const glowColor = activeTab === 'spending'
    ? 'rgba(66, 124, 240, 0.2)'
    : isNegative
      ? 'rgba(245, 158, 11, 0.2)'
      : 'rgba(133, 92, 214, 0.2)'

  const ringColor = isNegative ? '#F59E0B' : '#855CD6'

  if (loading) {
    return (
      <div className="glass-card p-6 flex flex-col items-center justify-center">
        <div className="skeleton h-4 w-28 mb-4" />
        <div className="skeleton w-[120px] h-[120px] rounded-full mb-4" />
        <div className="skeleton h-3 w-24" />
      </div>
    )
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.02, y: -2 }}
      className="relative overflow-hidden rounded-xl p-6 text-center group border bg-gradient-to-br from-accent-purple/[0.08] to-accent-purple/[0.02] border-white/[0.06] hover:border-white/15 flex flex-col items-center justify-center"
      style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 0 35px ${glowColor}, 0 8px 32px rgba(0,0,0,0.35)`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)'
      }}
    >
      {/* Gradient overlay */}
      <div
        className="absolute inset-0 opacity-40 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-xl"
        style={{ background: `radial-gradient(circle at top right, ${glowColor}, transparent 60%)` }}
      />

      <div className="relative z-10 flex flex-col items-center w-full">
        {/* ─── Tab Toggle ─── */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-white/[0.05] mb-4 self-center">
          <button
            onClick={() => setActiveTab('savings')}
            className={`p-1.5 px-2.5 rounded-md text-[11px] font-semibold uppercase tracking-wider transition-all duration-200 ${
              activeTab === 'savings'
                ? 'bg-accent-purple/20 text-accent-purple'
                : 'text-text-muted hover:text-white'
            }`}
            aria-label="Show savings rate"
            aria-pressed={activeTab === 'savings'}
          >
            <span className="flex items-center gap-1.5">
              <Percent size={12} />
              Savings
            </span>
          </button>
          <button
            onClick={() => setActiveTab('spending')}
            className={`p-1.5 px-2.5 rounded-md text-[11px] font-semibold uppercase tracking-wider transition-all duration-200 ${
              activeTab === 'spending'
                ? 'bg-primary/20 text-primary'
                : 'text-text-muted hover:text-white'
            }`}
            aria-label="Show spending breakdown"
            aria-pressed={activeTab === 'spending'}
          >
            <span className="flex items-center gap-1.5">
              <PieIcon size={12} />
              Spending
            </span>
          </button>
        </div>

        {/* ─── Content Area ─── */}
        <AnimatePresence mode="wait">
          {activeTab === 'savings' ? (
            <motion.div
              key="savings"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="flex flex-col items-center"
            >
              {/* Ring Gauge */}
              <div className="relative mb-4">
                <svg
                  width={RING_SIZE}
                  height={RING_SIZE}
                  className="transform -rotate-90"
                >
                  {/* Background track */}
                  <circle
                    cx={RING_SIZE / 2}
                    cy={RING_SIZE / 2}
                    r={RADIUS}
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.06)"
                    strokeWidth={STROKE_WIDTH}
                  />
                  {/* Target reference */}
                  <circle
                    cx={RING_SIZE / 2}
                    cy={RING_SIZE / 2}
                    r={RADIUS}
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth={1}
                    strokeDasharray="4 4"
                    strokeDashoffset={targetDashoffset}
                    className="opacity-40"
                  />
                  {/* Progress arc */}
                  <motion.circle
                    cx={RING_SIZE / 2}
                    cy={RING_SIZE / 2}
                    r={RADIUS}
                    fill="none"
                    stroke={ringColor}
                    strokeWidth={STROKE_WIDTH}
                    strokeLinecap="round"
                    strokeDasharray={CIRCUMFERENCE}
                    initial={{ strokeDashoffset: CIRCUMFERENCE }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.3 }}
                    style={{ filter: `drop-shadow(0 0 6px ${ringColor}60)` }}
                  />
                </svg>
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-xl font-bold ${isNegative ? 'text-warning' : 'text-white'}`}>
                    {isNegative ? '-' : ''}{displayRate.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Subtitle */}
              <p className={`text-xs font-medium ${isNegative ? 'text-warning' : 'text-text-secondary'}`}>
                {isNegative ? 'Expenses exceed income' : 'of income saved'}
              </p>
              {!isNegative && (
                <p className="text-text-muted text-[10px] mt-1">
                  Target: {TARGET_RATE}%
                </p>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="spending"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="flex flex-col items-center w-full"
            >
              {categoryData.length === 0 ? (
                <div className="py-6 text-center">
                  <p className="text-text-muted text-sm">No expense data yet</p>
                  <p className="text-text-muted text-xs mt-1">Add transactions to see breakdown</p>
                </div>
              ) : (
                <>
                  {/* Donut Chart */}
                  <div className="relative w-full flex justify-center mb-1">
                    <div className="relative w-[160px] h-[160px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            innerRadius={42}
                            outerRadius={68}
                            paddingAngle={3}
                            dataKey="value"
                            animationBegin={200}
                            animationDuration={800}
                            animationEasing="ease-out"
                            stroke="none"
                          >
                            {categoryData.map((entry) => (
                              <Cell
                                key={entry.name}
                                fill={CATEGORY_COLORS[entry.name] || '#427CF0'}
                                style={{
                                  filter: `drop-shadow(0 0 4px ${CATEGORY_COLORS[entry.name] || '#427CF0'}50)`,
                                }}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            content={<DonutTooltip />}
                            wrapperStyle={{ zIndex: 20, pointerEvents: 'none' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>

                      {/* Center label — compact format */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-[9px] text-text-muted uppercase tracking-wider leading-none mb-0.5">Spent</span>
                        <span className="text-sm font-bold text-white tabular-nums leading-none">
                          {formatCompact(totalExpense)}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Legend */}
                  <div className="w-full space-y-1.5 px-1">
                    {categoryData.slice(0, 4).map((cat) => (
                      <div key={cat.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{
                              backgroundColor: CATEGORY_COLORS[cat.name] || '#427CF0',
                              boxShadow: `0 0 4px ${CATEGORY_COLORS[cat.name] || '#427CF0'}50`,
                            }}
                          />
                          <span className="text-text-muted text-[11px] truncate">{cat.name}</span>
                        </div>
                        <span className="text-text-secondary text-[11px] font-medium tabular-nums flex-shrink-0">
                          {cat.percentage}%
                        </span>
                      </div>
                    ))}
                    {categoryData.length > 4 && (
                      <p className="text-text-muted text-[10px] text-center pt-0.5">
                        +{categoryData.length - 4} more
                      </p>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
