// pages/Insights.jsx
import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Lightbulb,
  TrendingDown,
  TrendingUp,
  PiggyBank,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Wallet,
  AlertCircle,
  CheckCircle2,
  ArrowDownRight,
  ArrowUpRight,
  Info,
} from 'lucide-react'
import useStore from '../store/useStore'
import { formatAmount } from '../utils/formatters'
import EmptyState from '../components/EmptyState'

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

const stagger = {
  animate: {
    transition: { staggerChildren: 0.08 },
  },
}

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

function getHealthScore(insights) {
  let score = 50
  if (insights.savingsRate > 30) score += 25
  else if (insights.savingsRate > 15) score += 15
  else if (insights.savingsRate > 0) score += 5
  else score -= 15

  if (insights.monthlyChange !== null) {
    if (insights.monthlyChange < -5) score += 10
    else if (insights.monthlyChange > 15) score -= 10
  }

  if (insights.topCategory && Number(insights.topCategory.percentage) < 35) {
    score += 10
  }

  return Math.max(0, Math.min(100, score))
}

function getHealthLabel(score) {
  if (score >= 80)
    return { text: 'Excellent', color: '#22C38E', icon: CheckCircle2 }
  if (score >= 60)
    return { text: 'Good', color: '#427CF0', icon: CheckCircle2 }
  if (score >= 40)
    return { text: 'Fair', color: '#F59E0B', icon: AlertCircle }
  return { text: 'Needs Attention', color: '#EF4444', icon: AlertCircle }
}

function generateTips(insights) {
  const tips = []

  if (insights.topCategory && Number(insights.topCategory.percentage) > 40) {
    tips.push({
      text: `Your ${insights.topCategory.name} spending is ${insights.topCategory.percentage}% of total — consider setting a budget cap.`,
      type: 'warning',
    })
  }

  if (insights.savingsRate > 20) {
    tips.push({
      text: `Saving ${insights.savingsRate}% of income — you're on track for your goals.`,
      type: 'success',
    })
  } else if (insights.savingsRate >= 0) {
    tips.push({
      text: `Try to increase your savings rate above 20% for better financial security.`,
      type: 'info',
    })
  }

  if (insights.monthlyChange !== null && insights.monthlyChange > 10) {
    tips.push({
      text: `Expenses rose ${insights.monthlyChange}% this month — review discretionary spending.`,
      type: 'warning',
    })
  }

  if (insights.monthlyChange !== null && insights.monthlyChange < -5) {
    tips.push({
      text: `Expenses dropped ${Math.abs(insights.monthlyChange)}% — great job cutting costs.`,
      type: 'success',
    })
  }

  if (tips.length === 0) {
    tips.push({
      text: 'Keep tracking consistently to unlock deeper spending patterns.',
      type: 'info',
    })
  }

  return tips
}

function MiniBar({ value, max, color }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0
  return (
    <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{
          duration: 0.8,
          delay: 0.3,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
      />
    </div>
  )
}

function ScoreRing({ score, color, size = 80, strokeWidth = 6 }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{
            duration: 1.2,
            delay: 0.2,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          style={{ filter: `drop-shadow(0 0 6px ${color}40)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className="text-lg font-bold text-white leading-none"
        >
          {score}
        </motion.span>
        <span className="text-[9px] text-text-muted uppercase tracking-wider mt-0.5">
          / 100
        </span>
      </div>
    </div>
  )
}

/* ─── Reusable hover card wrapper (same pattern as SummaryCards) ─── */
function HoverCard({ children, accentColor, glowColor, className = '', variants, ...motionProps }) {
  return (
    <motion.div
      variants={variants}
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.97 }}
      className={`relative overflow-hidden rounded-xl border border-white/[0.06] hover:border-white/15 cursor-default group bg-gradient-to-br ${className}`}
      style={{
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        backgroundImage: `linear-gradient(to bottom right, ${glowColor.replace(/[\d.]+\)$/, '0.08)')}, ${glowColor.replace(/[\d.]+\)$/, '0.02)')})`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 0 35px ${glowColor}, 0 8px 32px rgba(0,0,0,0.35)`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)'
      }}
      {...motionProps}
    >
      {/* Gradient overlay — same as SummaryCards */}
      <div
        className="absolute inset-0 opacity-40 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-xl"
        style={{
          background: `radial-gradient(circle at top right, ${glowColor}, transparent 60%)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}

const TIME_LABELS = { '7d': 'last 7 days', '30d': 'last 30 days', '90d': 'last 90 days' }

export default function Insights() {
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  useStore((s) => s.transactions)
  const timeFilter = useStore((s) => s.timeFilter)
  const getInsights = useStore((s) => s.getInsights)
  const insights = getInsights()
  const role = useStore((s) => s.role)
  const periodLabel = TIME_LABELS[timeFilter] || 'last 30 days'

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const healthScore = useMemo(() => getHealthScore(insights), [insights])
  const healthLabel = getHealthLabel(healthScore)
  const tips = useMemo(() => generateTips(insights), [insights])
  const HealthIcon = healthLabel.icon

  const hasZeroData =
    !insights.topCategory &&
    insights.currentIncome === 0 &&
    insights.currentExpense === 0

  // Glow color for health card based on score
  const healthGlow = useMemo(() => {
    const c = healthLabel.color
    // Convert hex to rgba glow
    const r = parseInt(c.slice(1, 3), 16)
    const g = parseInt(c.slice(3, 5), 16)
    const b = parseInt(c.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, 0.2)`
  }, [healthLabel.color])

  const savingsGlow = insights.savingsRate < 0
    ? 'rgba(245, 158, 11, 0.2)'
    : 'rgba(34, 195, 142, 0.2)'

  const savingsAccent = insights.savingsRate < 0 ? '#F59E0B' : '#22C38E'

  if (loading) {
    return (
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        className="space-y-6"
      >
        <div>
          <div className="skeleton h-7 w-32 mb-2" />
          <div className="skeleton h-4 w-48" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="skeleton h-44 rounded-xl" />
          <div className="lg:col-span-2 skeleton h-44 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-48 rounded-xl" />
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
          <p className="text-text-secondary text-sm mt-1">
            Based on {periodLabel}
          </p>
        </div>
        <div className="glass-card">
          <EmptyState
            variant="no-data"
            icon={Lightbulb}
            title="No insights available yet"
            description="Start adding transactions to unlock financial insights and spending analysis."
            actionLabel={role === 'admin' ? '+ Add Transaction' : undefined}
            onAction={
              role === 'admin'
                ? () => navigate('/transactions')
                : undefined
            }
          />
        </div>
      </motion.div>
    )
  }

  const incomeExpenseMax = Math.max(
    insights.currentIncome,
    insights.currentExpense,
    1
  )

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="space-y-6"
    >
      {/* ─── Header ─── */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Insights</h1>
          <p className="text-text-secondary text-sm mt-1">
            Financial overview · {periodLabel}
          </p>
        </div>
        <div className="flex items-center gap-2 text-text-muted text-xs">
          <Info size={13} />
          <span className="hidden sm:inline">Updated in real-time</span>
        </div>
      </div>

      {/* ─── Top Row: Health Score + Income vs Expense ─── */}
      <motion.div
        variants={stagger}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 lg:grid-cols-3 gap-5"
      >
        {/* Health Score Card */}
        <HoverCard
          variants={fadeUp}
          accentColor={healthLabel.color}
          glowColor={healthGlow}
        >
          <div className="p-6 flex items-center gap-6">
            <ScoreRing
              score={healthScore}
              color={healthLabel.color}
              size={88}
              strokeWidth={7}
            />
            <div className="flex-1 min-w-0">
              <p className="text-text-muted text-xs font-medium uppercase tracking-wider mb-1">
                Financial Health
              </p>
              <div className="flex items-center gap-2 mb-2">
                <HealthIcon
                  size={16}
                  style={{ color: healthLabel.color }}
                />
                <span
                  className="text-sm font-bold"
                  style={{ color: healthLabel.color }}
                >
                  {healthLabel.text}
                </span>
              </div>
              <p className="text-text-muted text-xs leading-relaxed line-clamp-2">
                {healthScore >= 60
                  ? 'Your finances are in a healthy state. Keep it up.'
                  : "There's room for improvement. Check the tips below."}
              </p>
            </div>
          </div>
        </HoverCard>

        {/* Income vs Expense Breakdown */}
        <HoverCard
          variants={fadeUp}
          accentColor="#427CF0"
          glowColor="rgba(66, 124, 240, 0.2)"
          className="lg:col-span-2"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-5">
              <p className="text-text-muted text-xs font-medium uppercase tracking-wider">
                Income vs Expenses
              </p>
              {insights.monthlyChange !== null && (
                <div
                  className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg ${
                    insights.monthlyChange <= 0
                      ? 'bg-success/10 text-success'
                      : 'bg-danger/10 text-danger'
                  }`}
                >
                  {insights.monthlyChange <= 0 ? (
                    <ArrowDownRight size={13} />
                  ) : (
                    <ArrowUpRight size={13} />
                  )}
                  {Math.abs(insights.monthlyChange)}% vs last month
                </div>
              )}
            </div>

            <div className="space-y-4">
              {/* Income Row */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-success/10 border border-success/20 flex items-center justify-center">
                      <ArrowUpRight size={14} className="text-success" />
                    </div>
                    <span className="text-sm text-text-secondary font-medium">
                      Income
                    </span>
                  </div>
                  <span className="text-white font-semibold text-sm tabular-nums">
                    {formatAmount(insights.currentIncome)}
                  </span>
                </div>
                <MiniBar
                  value={insights.currentIncome}
                  max={incomeExpenseMax}
                  color="#22C38E"
                />
              </div>

              {/* Expense Row */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-danger/10 border border-danger/20 flex items-center justify-center">
                      <ArrowDownRight size={14} className="text-danger" />
                    </div>
                    <span className="text-sm text-text-secondary font-medium">
                      Expenses
                    </span>
                  </div>
                  <span className="text-white font-semibold text-sm tabular-nums">
                    {formatAmount(insights.currentExpense)}
                  </span>
                </div>
                <MiniBar
                  value={insights.currentExpense}
                  max={incomeExpenseMax}
                  color="#EF4444"
                />
              </div>

              {/* Net */}
              <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between">
                <span className="text-text-muted text-xs font-medium">
                  Net Balance
                </span>
                <span
                  className={`text-sm font-bold tabular-nums ${
                    insights.currentIncome - insights.currentExpense >= 0
                      ? 'text-success'
                      : 'text-danger'
                  }`}
                >
                  {insights.currentIncome - insights.currentExpense >= 0
                    ? '+'
                    : ''}
                  {formatAmount(
                    insights.currentIncome - insights.currentExpense
                  )}
                </span>
              </div>
            </div>
          </div>
        </HoverCard>
      </motion.div>

      {/* ─── Metric Cards Row ─── */}
      <motion.div
        variants={stagger}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 md:grid-cols-3 gap-5"
      >
        {/* Top Spending Category */}
        <HoverCard
          variants={fadeUp}
          accentColor="#EF4444"
          glowColor="rgba(239, 68, 68, 0.18)"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-danger/10 border border-danger/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <TrendingDown size={18} className="text-danger" />
              </div>
              {insights.topCategory && (
                <span
                  className="text-[11px] font-bold px-2.5 py-1 rounded-lg tabular-nums"
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#EF4444',
                  }}
                >
                  {insights.topCategory.percentage}%
                </span>
              )}
            </div>
            <p className="text-text-muted text-xs font-medium uppercase tracking-wider mb-2">
              Top Spending
            </p>
            {insights.topCategory ? (
              <>
                <p className="text-white text-lg font-bold mb-1">
                  {insights.topCategory.name}
                </p>
                <p className="text-text-muted text-sm tabular-nums">
                  {formatAmount(insights.topCategory.amount)}
                </p>
                <div className="mt-4">
                  <MiniBar
                    value={Number(insights.topCategory.percentage)}
                    max={100}
                    color="#EF4444"
                  />
                </div>
              </>
            ) : (
              <div className="py-2">
                <p className="text-text-muted text-sm">
                  No expense data recorded yet.
                </p>
                {role === 'admin' && (
                  <button
                    onClick={() => navigate('/transactions')}
                    className="mt-2 text-primary text-xs font-medium hover:text-primary/80 transition-colors inline-flex items-center gap-1"
                  >
                    Add transaction <ChevronRight size={12} />
                  </button>
                )}
              </div>
            )}
          </div>
        </HoverCard>

        {/* Monthly Comparison */}
        <HoverCard
          variants={fadeUp}
          accentColor="#427CF0"
          glowColor="rgba(66, 124, 240, 0.2)"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <TrendingUp size={18} className="text-primary" />
              </div>
              {insights.hasEnoughData &&
                insights.monthlyChange !== null && (
                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-lg tabular-nums ${
                      insights.monthlyChange <= 0
                        ? 'bg-success/10 text-success'
                        : 'bg-danger/10 text-danger'
                    }`}
                  >
                    {insights.monthlyChange > 0 ? '+' : ''}
                    {insights.monthlyChange}%
                  </span>
                )}
            </div>
            <p className="text-text-muted text-xs font-medium uppercase tracking-wider mb-2">
              Monthly Change
            </p>
            {insights.hasEnoughData && insights.monthlyChange !== null ? (
              <>
                <p className="text-white text-lg font-bold mb-1">
                  {insights.monthlyChange > 0 ? 'Increased' : 'Decreased'}{' '}
                  {Math.abs(insights.monthlyChange)}%
                </p>
                <div className="flex items-center gap-3 text-xs text-text-muted mt-1">
                  <span className="tabular-nums">
                    Now {formatAmount(insights.currentExpense)}
                  </span>
                  <ArrowRight size={10} className="text-text-muted/50" />
                  <span className="tabular-nums">
                    Was {formatAmount(insights.prevExpense)}
                  </span>
                </div>
                <div className="mt-4 flex gap-1.5">
                  {[...Array(12)].map((_, i) => {
                    const isActive =
                      i <
                      Math.min(
                        Math.abs(insights.monthlyChange) / 3,
                        12
                      )
                    return (
                      <motion.div
                        key={i}
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{
                          delay: 0.4 + i * 0.04,
                          duration: 0.3,
                        }}
                        className="flex-1 h-6 rounded-sm origin-bottom"
                        style={{
                          backgroundColor: isActive
                            ? insights.monthlyChange <= 0
                              ? `rgba(34, 195, 142, ${0.2 + i * 0.06})`
                              : `rgba(239, 68, 68, ${0.2 + i * 0.06})`
                            : 'rgba(255,255,255,0.03)',
                        }}
                      />
                    )
                  })}
                </div>
              </>
            ) : (
              <div className="py-2">
                <p className="text-text-muted text-sm">
                  Need 2+ months of data for comparison.
                </p>
                <p className="text-text-muted text-xs mt-1">
                  Keep tracking consistently.
                </p>
              </div>
            )}
          </div>
        </HoverCard>

        {/* Savings Rate */}
        <HoverCard
          variants={fadeUp}
          accentColor={savingsAccent}
          glowColor={savingsGlow}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center border group-hover:scale-110 transition-transform duration-300 ${
                  insights.savingsRate < 0
                    ? 'bg-warning/10 border-warning/20'
                    : 'bg-success/10 border-success/20'
                }`}
              >
                <PiggyBank
                  size={18}
                  className={
                    insights.savingsRate < 0
                      ? 'text-warning'
                      : 'text-success'
                  }
                />
              </div>
              {insights.currentIncome > 0 && (
                <span
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-lg tabular-nums ${
                    insights.savingsRate < 0
                      ? 'bg-warning/10 text-warning'
                      : 'bg-success/10 text-success'
                  }`}
                >
                  {insights.savingsRate < 0 ? '' : '+'}
                  {insights.savingsRate}%
                </span>
              )}
            </div>
            <p className="text-text-muted text-xs font-medium uppercase tracking-wider mb-2">
              Savings Rate
            </p>
            {insights.currentIncome > 0 ? (
              <>
                <p className="text-white text-lg font-bold mb-1">
                  {insights.savingsRate < 0
                    ? 'Net Loss'
                    : `${insights.savingsRate}% Saved`}
                </p>
                <p className="text-text-muted text-sm tabular-nums">
                  {insights.savingsRate < 0
                    ? `Overspent by ${formatAmount(
                        Math.abs(
                          insights.currentIncome -
                            insights.currentExpense
                        )
                      )}`
                    : `${formatAmount(
                        insights.currentIncome -
                          insights.currentExpense
                      )} saved`}
                </p>
                <div className="mt-4">
                  <MiniBar
                    value={Math.max(insights.savingsRate, 0)}
                    max={100}
                    color={
                      insights.savingsRate < 0 ? '#F59E0B' : '#22C38E'
                    }
                  />
                  <div className="flex justify-between mt-1.5">
                    <span className="text-[10px] text-text-muted">0%</span>
                    <span className="text-[10px] text-text-muted">
                      Target 20%
                    </span>
                    <span className="text-[10px] text-text-muted">
                      100%
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-2">
                <p className="text-text-muted text-sm">
                  No income recorded yet.
                </p>
                {role === 'admin' && (
                  <button
                    onClick={() => navigate('/transactions')}
                    className="mt-2 text-primary text-xs font-medium hover:text-primary/80 transition-colors inline-flex items-center gap-1"
                  >
                    Add income <ChevronRight size={12} />
                  </button>
                )}
              </div>
            )}
          </div>
        </HoverCard>
      </motion.div>

      {/* ─── Smart Tips Section ─── */}
      <motion.div variants={fadeUp} initial="initial" animate="animate">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={16} className="text-primary" />
          <h2 className="text-white text-sm font-semibold">
            Recommendations
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {tips.map((tip, i) => {
            const tipConfig = {
              success: {
                icon: CheckCircle2,
                iconColor: 'text-success',
                accentColor: '#22C38E',
                glowColor: 'rgba(34, 195, 142, 0.15)',
              },
              warning: {
                icon: AlertCircle,
                iconColor: 'text-warning',
                accentColor: '#F59E0B',
                glowColor: 'rgba(245, 158, 11, 0.15)',
              },
              info: {
                icon: Lightbulb,
                iconColor: 'text-primary',
                accentColor: '#427CF0',
                glowColor: 'rgba(66, 124, 240, 0.15)',
              },
            }

            const cfg = tipConfig[tip.type]
            const TipIcon = cfg.icon

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.5 + i * 0.1,
                  duration: 0.35,
                }}
              >
                <HoverCard
                  accentColor={cfg.accentColor}
                  glowColor={cfg.glowColor}
                >
                  <div className="p-4">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <TipIcon
                          size={15}
                          className={cfg.iconColor}
                        />
                      </div>
                      <p className="text-text-secondary text-[13px] leading-relaxed">
                        {tip.text}
                      </p>
                    </div>
                  </div>
                </HoverCard>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* ─── Bottom CTA ─── */}
      {role === 'admin' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex justify-center pt-2 pb-4"
        >
          <button
            onClick={() => navigate('/transactions')}
            className="
              inline-flex items-center gap-2 px-5 py-2.5
              rounded-xl text-sm font-medium
              text-text-secondary hover:text-white
              bg-white/[0.03] hover:bg-white/[0.06]
              border border-white/[0.06] hover:border-white/[0.1]
              transition-all duration-200
            "
          >
            <Wallet size={15} />
            View all transactions
            <ArrowRight size={14} />
          </button>
        </motion.div>
      )}
    </motion.div>
  )
}