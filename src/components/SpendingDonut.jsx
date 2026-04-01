import { useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import useStore from '../store/useStore'
import { formatAmount } from '../utils/formatters'
import { CATEGORY_COLORS } from '../data/mockData'

const COLORS = ['#427CF0', '#855CD6', '#22C38E', '#EF4444', '#F59E0B']

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const data = payload[0]

  return (
    <div className="glass-card p-3" style={{ background: 'var(--bg-section)' }}>
      <p className="text-white text-sm font-medium">{data.name}</p>
      <p className="text-text-secondary text-xs">{formatAmount(data.value)} ({data.payload.percentage}%)</p>
    </div>
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
  const timeFilter = useStore(s => s.timeFilter)
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
        <div className="skeleton h-[250px] w-full rounded-full mx-auto" style={{ maxWidth: 250 }} />
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
            >
              {data.map((entry, i) => (
                <Cell
                  key={entry.name}
                  fill={CATEGORY_COLORS[entry.name] || COLORS[i % COLORS.length]}
                  stroke="transparent"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
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
