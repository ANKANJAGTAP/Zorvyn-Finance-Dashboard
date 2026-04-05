import { useState, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Percent, AlertTriangle, PieChart as PieIcon } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import useStore from '../store/useStore'
import { formatAmount } from '../utils/formatters'
import { CATEGORY_COLORS } from '../data/mockData'
import useMediaQuery from '../hooks/useMediaQuery'
import MobileBottomSheet from './ui/MobileBottomSheet'

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
          <span className="text-xs text-[rgb(var(--text-primary))] font-semibold">{formatAmount(value)}</span>
        </div>
        <span className="text-xs text-text-secondary">{percentage}%</span>
      </div>
    </motion.div>
  )
}

/* ─── Semi-Circular Gauge ─── */
function SemiCircularGauge({ rate, isNegative }) {
  const WIDTH = 320
  const HEIGHT = 165
  const CX = WIDTH / 2
  const CY = 145
  const OUTER_R = 110
  const STROKE = 16

  const startAngle = 180
  const sweepRange = 180
  const clampedRate = Math.min(Math.max(rate, 0), 100)
  const needleAngle = startAngle - (clampedRate / 100) * sweepRange

  function describeArc(cx, cy, r, startDeg, endDeg) {
    const startRad = (startDeg * Math.PI) / 180
    const endRad = (endDeg * Math.PI) / 180
    const x1 = cx + r * Math.cos(startRad)
    const y1 = cy - r * Math.sin(startRad)
    const x2 = cx + r * Math.cos(endRad)
    const y2 = cy - r * Math.sin(endRad)
    const largeArc = Math.abs(endDeg - startDeg) > 180 ? 1 : 0
    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`
  }

  const trackPath = describeArc(CX, CY, OUTER_R, startAngle, 0)
  const progressEndAngle = startAngle - (clampedRate / 100) * sweepRange
  const progressPath = clampedRate > 0 ? describeArc(CX, CY, OUTER_R, startAngle, progressEndAngle) : ''

  const needleLength = OUTER_R - 14
  const needleRad = (needleAngle * Math.PI) / 180
  const needleX = CX + needleLength * Math.cos(needleRad)
  const needleY = CY - needleLength * Math.sin(needleRad)

  const gradientId = isNegative ? 'gauge-gradient-warn' : 'gauge-gradient'
  const glowId = isNegative ? 'gauge-glow-warn' : 'gauge-glow'
  // Theme compliant needle color: Warning orange vs Accent purple
  const needleColor = isNegative ? '#F59E0B' : '#855CD6'

  // Zone colors for the segmented background (adapted to dashboard tailwind config)
  const zones = [
    { start: 0, end: 25, color: 'rgba(239, 68, 68, 0.15)' }, // danger
    { start: 25, end: 50, color: 'rgba(245, 158, 11, 0.12)' }, // warning
    { start: 50, end: 75, color: 'rgba(34, 195, 142, 0.12)' }, // success
    { start: 75, end: 100, color: 'rgba(133, 92, 214, 0.12)' }, // accent-purple
  ]

  return (
    <div className="relative flex flex-col items-center w-full max-w-[320px]">
      <div className="relative w-full flex flex-col justify-center items-center">
        {/* Responsive, scaling SVG canvas */}
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-auto">
          <defs>
            {/* Progress gradient */}
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              {isNegative ? (
                <>
                  <stop offset="0%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#EF4444" />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor="#A78BFA" />
                  <stop offset="50%" stopColor="#855CD6" />
                  <stop offset="100%" stopColor="#427CF0" />
                </>
              )}
            </linearGradient>
            {/* Glow filter */}
            <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            {/* Needle glow */}
            <filter id="needle-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Zone segments (subtle colored background arcs) */}
          {zones.map((zone) => {
            const zStart = startAngle - (zone.start / 100) * sweepRange
            const zEnd = startAngle - (zone.end / 100) * sweepRange
            return (
              <path
                key={zone.start}
                d={describeArc(CX, CY, OUTER_R, zStart, zEnd)}
                fill="none"
                stroke={zone.color}
                strokeWidth={STROKE + 6}
                strokeLinecap="butt"
              />
            )
          })}

          {/* Track */}
          <path
            d={trackPath}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={STROKE}
            strokeLinecap="round"
          />

          {/* Progress arc */}
          {clampedRate > 0 && (
            <motion.path
              d={progressPath}
              fill="none"
              stroke={`url(#${gradientId})`}
              strokeWidth={STROKE}
              strokeLinecap="round"
              filter={`url(#${glowId})`}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.2 }}
            />
          )}

          {/* Tick marks with labels */}
          {[0, 25, 50, 75, 100].map((tick) => {
            const angle = startAngle - (tick / 100) * sweepRange
            const rad = (angle * Math.PI) / 180
            const innerR = OUTER_R + 8
            const outerR = OUTER_R + 18
            const labelR = OUTER_R + 32
            
            // Absolutely mathematical symmetry, no hardcoded boundaries
            const labelX = CX + labelR * Math.cos(rad)
            const labelY = CY - labelR * Math.sin(rad) + 2
            const textAnchor = "middle"

            return (
              <g key={tick}>
                <line
                  x1={CX + innerR * Math.cos(rad)}
                  y1={CY - innerR * Math.sin(rad)}
                  x2={CX + outerR * Math.cos(rad)}
                  y2={CY - outerR * Math.sin(rad)}
                  stroke="currentColor"
                  className="text-text-muted opacity-50"
                  strokeWidth={2}
                  strokeLinecap="round"
                />
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor={textAnchor}
                  dominantBaseline="central"
                  fill="currentColor"
                  className="text-text-secondary"
                  fontSize="11"
                  fontWeight="600"
                  fontFamily="system-ui, sans-serif"
                >
                  {tick}
                </text>
              </g>
            )
          })}

          {/* Needle shadow */}
          <motion.line
            x1={CX}
            y1={CY}
            initial={{ x2: CX - needleLength, y2: CY }}
            animate={{ x2: needleX, y2: needleY }}
            transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.3 }}
            stroke="rgba(0,0,0,0.4)"
            strokeWidth={4}
            strokeLinecap="round"
          />
          {/* Needle */}
          <motion.line
            x1={CX}
            y1={CY}
            initial={{ x2: CX - needleLength, y2: CY }}
            animate={{ x2: needleX, y2: needleY }}
            transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.3 }}
            stroke={needleColor}
            strokeWidth={2.5}
            strokeLinecap="round"
            filter="url(#needle-glow)"
          />

          {/* Center pivot */}
          <circle cx={CX} cy={CY} r={6} fill="var(--bg-main)" stroke={needleColor} strokeWidth={2} />
          <circle cx={CX} cy={CY} r={2.5} fill={needleColor} />
        </svg>

        {/* Percentage display positioned strictly BELOW the SVG canvas structure */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5, ease: 'easeOut' }}
          className="flex flex-col items-center mt-2"
        >
          <span
            className="text-4xl font-extrabold tracking-tight tabular-nums leading-none"
            style={{ color: needleColor }}
          >
            {isNegative ? '-' : ''}{clampedRate.toFixed(0)}
            <span className="text-xl font-bold opacity-80" style={{ color: needleColor }}>%</span>
          </span>
          <span className="text-[10px] text-text-muted font-medium uppercase tracking-widest mt-1.5">
            Savings Rate
          </span>
        </motion.div>
      </div>

      {/* Status label below the gauge */}
      <div className="flex items-center gap-2 mt-4">
        <div
          className="w-1.5 h-1.5 rounded-full animate-pulse"
          style={{ backgroundColor: needleColor }}
        />
        <p className="text-text-muted text-[11px] font-medium tracking-wide">
          {isNegative
            ? 'Expenses exceed income'
            : clampedRate >= 50
              ? 'On track'
              : clampedRate >= 25
                ? 'Needs improvement'
                : 'Below target'}
        </p>
      </div>
      {!isNegative && (
        <p className="text-text-secondary opacity-50 text-[9px] mt-1 tracking-wider uppercase">
          Target: {TARGET_RATE}%
        </p>
      )}
    </div>
  )
}

export default function SavingsGauge({ loading }) {
  const [activeTab, setActiveTab] = useState('savings')
  const timeFilter = useStore(s => s.timeFilter)
  const transactions = useStore(s => s.transactions)
  const getInsights = useStore(s => s.getInsights)
  const getCategoryBreakdown = useStore(s => s.getCategoryBreakdown)

  // Mobile check
  const isMobile = useMediaQuery('(max-width: 767px)')
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false)

  // Legend Tooltip state
  const [isLegendTooltipOpen, setIsLegendTooltipOpen] = useState(false)
  const [hoveredCatRow, setHoveredCatRow] = useState(null)
  const legendTimeoutRef = useRef(null)

  useEffect(() => {
    return () => {
      if (legendTimeoutRef.current) clearTimeout(legendTimeoutRef.current)
    }
  }, [])

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

  const glowColor = activeTab === 'spending'
    ? 'rgba(66, 124, 240, 0.2)'
    : isNegative
      ? 'rgba(245, 158, 11, 0.2)'
      : 'rgba(133, 92, 214, 0.2)'

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
              <SemiCircularGauge rate={displayRate} isNegative={isNegative} />
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
                        <span className="text-sm font-bold text-[rgb(var(--text-primary))] tabular-nums leading-none">
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
                          <span className="text-text-muted text-xs truncate">{cat.name}</span>
                        </div>
                        <span className="text-text-secondary text-xs font-medium tabular-nums flex-shrink-0">
                          {cat.percentage}%
                        </span>
                      </div>
                    ))}
                    {categoryData.length > 4 && (
                      <div 
                        className="relative flex justify-center pt-1"
                        onMouseEnter={() => {
                          if (isMobile) return
                          if (legendTimeoutRef.current) clearTimeout(legendTimeoutRef.current)
                          legendTimeoutRef.current = setTimeout(() => {
                            setIsLegendTooltipOpen(true)
                          }, 120)
                        }}
                        onMouseLeave={() => {
                          if (isMobile) return
                          if (legendTimeoutRef.current) clearTimeout(legendTimeoutRef.current)
                          legendTimeoutRef.current = setTimeout(() => setIsLegendTooltipOpen(false), 150)
                        }}
                      >
                        <button 
                          onClick={() => { if (isMobile) setMobileSheetOpen(true) }}
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] text-text-muted hover:text-white bg-white/[0.04] hover:bg-white/[0.08] transition-colors ${isMobile ? 'cursor-pointer' : 'cursor-default'}`}
                        >
                          +{categoryData.length - 4} more
                        </button>

                        <AnimatePresence>
                          {isLegendTooltipOpen && !isMobile && (
                            <motion.div
                              initial={{ opacity: 0, y: 10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1, pointerEvents: 'auto' }}
                              exit={{ opacity: 0, y: 5, scale: 0.95, pointerEvents: 'none' }}
                              transition={{ duration: 0.15 }}
                              onMouseLeave={() => setHoveredCatRow(null)}
                              className="absolute bottom-full pb-3 w-[190px] z-50 flex flex-col text-left cursor-default"
                            >
                              <div className="p-1.5 rounded-[20px] bg-bg-card border border-white/[0.1] shadow-[0_10px_40px_rgba(0,0,0,0.2)]">
                                <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider px-2 pb-1.5 mb-1 border-b border-white/[0.04]">
                                  Additional Categories
                                </div>
                                {categoryData.slice(4).map(cat => {
                                const isHov = hoveredCatRow === cat.name
                                return (
                                  <div
                                    key={cat.name}
                                    onMouseEnter={() => setHoveredCatRow(cat.name)}
                                    className="relative flex items-center justify-between py-2 px-2 rounded-lg"
                                  >
                                    {isHov && (
                                      <motion.span
                                        layoutId="savings-tooltip-hover"
                                        className="absolute inset-0 rounded-lg bg-white/[0.06]"
                                        transition={{
                                          type: 'spring',
                                          stiffness: 350,
                                          damping: 25,
                                          mass: 0.8,
                                        }}
                                      />
                                    )}
                                    <div className="relative z-10 flex items-center gap-2 min-w-0">
                                      <div
                                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: CATEGORY_COLORS[cat.name] || '#427CF0' }}
                                      />
                                      <span className={`text-xs truncate transition-colors duration-200 ${isHov ? 'text-[rgb(var(--text-primary))] font-medium' : 'text-text-secondary'}`}>
                                        {cat.name}
                                      </span>
                                    </div>
                                    <span className={`relative z-10 text-xs tabular-nums flex-shrink-0 transition-colors duration-200 ${isHov ? 'text-[rgb(var(--text-primary))] font-semibold' : 'text-text-muted font-medium'}`}>
                                      {cat.percentage}%
                                    </span>
                                  </div>
                                )
                              })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <MobileBottomSheet
        isOpen={mobileSheetOpen}
        onClose={() => setMobileSheetOpen(false)}
        title="More Categories"
      >
        <div className="space-y-2">
          {categoryData.slice(4).map(cat => (
            <div key={cat.name} className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: CATEGORY_COLORS[cat.name] || '#427CF0', boxShadow: `0 0 6px ${CATEGORY_COLORS[cat.name] || '#427CF0'}50` }}
                />
                <span className="text-sm font-medium text-white">{cat.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-text-secondary min-w-[32px] text-right">{cat.percentage}%</span>
                <span className="text-sm font-bold text-white tabular-nums tracking-wide text-right">{formatAmount(cat.value)}</span>
              </div>
            </div>
          ))}
        </div>
      </MobileBottomSheet>
    </motion.div>
  )
}
