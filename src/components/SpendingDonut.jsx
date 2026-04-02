import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import useStore from '../store/useStore'
import { formatAmount } from '../utils/formatters'
import { CATEGORY_COLORS } from '../data/mockData'
import EmptyState from './EmptyState'

const COLORS = ['#427CF0', '#855CD6', '#22C38E', '#EF4444', '#F59E0B']

/* ─── Animated Tooltip ─── */
const AnimatedTooltip = ({ active, payload }) => {
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
          <p className="text-white text-sm font-medium">{payload[0].name}</p>
          <p className="text-text-secondary text-xs">
            {formatAmount(payload[0].value)} ({payload[0].payload.percentage}%)
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const CustomLegend = ({ payload, hiddenCategories, onToggle }) => {
  return (
    <div className="flex flex-wrap gap-3 mt-4 justify-center">
      {payload?.map((entry, i) => {
        const isHidden = hiddenCategories.includes(entry.value)
        return (
          <button
            key={i}
            onClick={() => onToggle(entry.value)}
            aria-label={`${isHidden ? 'Show' : 'Hide'} ${entry.value} category`}
            aria-pressed={!isHidden}
            className={`flex items-center gap-2 text-xs px-2 py-1 rounded-md transition-all duration-200 hover:bg-white/5 ${
              isHidden ? 'opacity-40' : ''
            }`}
          >
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-text-secondary">{entry.value}</span>
          </button>
        )
      })}
    </div>
  )
}

export default function SpendingDonut({ loading }) {
  const [hiddenCategories, setHiddenCategories] = useState([])
  const transactions = useStore(s => s.transactions)
  const timeFilter = useStore(s => s.timeFilter) // Subscribe to trigger re-render on 7d/30d/90d change
  const getCategoryBreakdown = useStore(s => s.getCategoryBreakdown)
  const rawData = getCategoryBreakdown()

  const data = rawData.filter(d => !hiddenCategories.includes(d.name))

  const handleToggle = (category) => {
    setHiddenCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  if (loading) {
    return (
      <div className="glass-card p-5">
        <div className="skeleton h-5 w-40 mb-4" />
        <div className="skeleton h-[250px] w-[250px] rounded-full mx-auto" />
      </div>
    )
  }

  if (rawData.length === 0) {
    return (
      <div className="glass-card p-6">
        <h3 className="text-white font-semibold mb-5">Spending Breakdown</h3>
        <EmptyState
          variant="no-data"
          title="No expense data"
          description="Add expense transactions to see your spending breakdown by category."
          className="py-8"
        />
      </div>
    )
  }

  return (
    <div className="glass-card p-6">
      <h3 className="text-white font-semibold mb-5">Spending Breakdown</h3>

      <div className="min-h-[280px]">
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={95}
              paddingAngle={3}
              dataKey="value"
              animationDuration={800}
              animationEasing="ease-out"
            >
              {data.map((entry, i) => (
                <Cell
                  key={entry.name}
                  fill={CATEGORY_COLORS[entry.name] || COLORS[i % COLORS.length]}
                  stroke="transparent"
                />
              ))}
            </Pie>
            <Tooltip content={<AnimatedTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Interactive Legend */}
      <CustomLegend
        payload={rawData.map((d, i) => ({
          value: d.name,
          color: CATEGORY_COLORS[d.name] || COLORS[i % COLORS.length],
        }))}
        hiddenCategories={hiddenCategories}
        onToggle={handleToggle}
      />
    </div>
  )
}
