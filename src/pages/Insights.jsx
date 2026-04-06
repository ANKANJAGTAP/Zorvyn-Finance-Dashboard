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
  UtensilsCrossed,
  Car,
  ShoppingBag,
  Receipt,
  Gamepad2,
  Briefcase,
  Laptop,
  Target
} from 'lucide-react'
import useStore from '../store/useStore'
import { formatAmount } from '../utils/formatters'
import EmptyState from '../components/EmptyState'
import Button from '../components/ui/Button'
import { AreaChart, Area, ResponsiveContainer } from 'recharts'

const iconMap = {
  Food: UtensilsCrossed,
  Transport: Car,
  Shopping: ShoppingBag,
  Bills: Receipt,
  Entertainment: Gamepad2,
  Salary: Briefcase,
  Freelance: Laptop,
}

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
  const savingsRate = Number(insights.savingsRate)
  const monthlyChange =
    insights.monthlyChange !== null
      ? Number(insights.monthlyChange)
      : null
  const topCategoryPercentage = insights.topCategory
    ? Number(insights.topCategory.percentage)
    : null

  let score = 50
  if (savingsRate > 30) score += 25
  else if (savingsRate > 15) score += 15
  else if (savingsRate > 0) score += 5
  else score -= 15

  if (monthlyChange !== null) {
    if (monthlyChange < -5) score += 10
    else if (monthlyChange > 15) score -= 10
  }

  if (topCategoryPercentage !== null && topCategoryPercentage < 35) {
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
  const savingsRate = Number(insights.savingsRate)
  const monthlyChange =
    insights.monthlyChange !== null
      ? Number(insights.monthlyChange)
      : null
  const topCategoryPercentage = insights.topCategory
    ? Number(insights.topCategory.percentage)
    : null

  const tips = []

  if (topCategoryPercentage !== null && topCategoryPercentage > 40) {
    tips.push({
      title: `Cap ${insights.topCategory.name} spend`,
      text: `Your ${insights.topCategory.name} spending is ${insights.topCategory.percentage}% of total — consider setting a budget cap.`,
      type: 'warning',
      impact: 'High impact',
      action: 'focus-top-category',
    })
  }

  if (savingsRate > 20) {
    tips.push({
      title: 'Savings momentum is strong',
      text: `Saving ${insights.savingsRate}% of income — you're on track for your goals.`,
      type: 'success',
      impact: 'Low effort',
      action: 'view-all-transactions',
    })
  } else if (savingsRate >= 0) {
    tips.push({
      title: 'Increase monthly savings',
      text: `Try to increase your savings rate above 20% for better financial security.`,
      type: 'info',
      impact: 'Medium impact',
      action: 'review-expenses',
    })
  }

  if (monthlyChange !== null && monthlyChange > 10) {
    tips.push({
      title: 'Expenses are accelerating',
      text: `Expenses rose ${insights.monthlyChange}% this month — review discretionary spending.`,
      type: 'warning',
      impact: 'High impact',
      action: 'review-expenses',
    })
  }

  if (monthlyChange !== null && monthlyChange < -5) {
    tips.push({
      title: 'Great cost control',
      text: `Expenses dropped ${Math.abs(insights.monthlyChange)}% — great job cutting costs.`,
      type: 'success',
      impact: 'Keep it up',
      action: 'view-all-transactions',
    })
  }

  if (tips.length === 0) {
    tips.push({
      title: 'Build your insight baseline',
      text: 'Keep tracking consistently to unlock deeper spending patterns.',
      type: 'info',
      impact: 'Starter step',
      action: 'view-all-transactions',
    })
  }

  return tips
}

function MiniBar({ value, max, color }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0
  return (
    <div className="h-2 w-full rounded-full bg-white/[0.06] overflow-hidden shadow-inner">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{
          duration: 0.8,
          delay: 0.3,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
        className="h-full rounded-full"
        style={{ 
          background: `linear-gradient(90deg, ${color}99 0%, ${color} 100%)`,
          boxShadow: `inset 0 1px 1px rgba(255,255,255,0.2)`
        }}
      />
    </div>
  )
}

function ScoreRing({ score, color, size = 80, strokeWidth = 8 }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const gradientId = `ring-grad-${color.replace('#', '')}`

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={color} stopOpacity="0.4" />
          </linearGradient>
        </defs>
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
          stroke={`url(#${gradientId})`}
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
        backgroundImage: `linear-gradient(to bottom right, ${glowColor.replace(/[\d.]+\)$/, '0.04)')}, transparent)`,
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
      <div className="relative z-10 h-full">{children}</div>
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
  const updateFilters = useStore((s) => s.updateFilters)
  const getCategoryBreakdown = useStore((s) => s.getCategoryBreakdown)
  const insights = getInsights()
  const role = useStore((s) => s.role)
  const periodLabel = TIME_LABELS[timeFilter] || 'last 30 days'

  const topCategories = useMemo(() => {
    return getCategoryBreakdown()
      .sort((a, b) => b.value - a.value)
      .slice(0, 3)
  }, [getCategoryBreakdown, insights])

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const healthScore = useMemo(() => getHealthScore(insights), [insights])
  const healthLabel = getHealthLabel(healthScore)
  const tips = useMemo(() => generateTips(insights), [insights])
  const HealthIcon = healthLabel.icon
  const monthlyChangeValue =
    insights.monthlyChange !== null
      ? Number(insights.monthlyChange)
      : null
  const savingsRateValue = Number(insights.savingsRate)
  const topCategoryPercentage = insights.topCategory
    ? Number(insights.topCategory.percentage)
    : null
  const netBalance = insights.currentIncome - insights.currentExpense
  const incomeExpenseTotal = insights.currentIncome + insights.currentExpense

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

  const healthBreakdown = useMemo(() => {
    const trendScore =
      monthlyChangeValue === null
        ? 50
        : Math.max(0, Math.min(100, 50 - monthlyChangeValue * 2.5))

    const savingsScore = Math.max(
      0,
      Math.min(100, ((savingsRateValue + 20) / 50) * 100)
    )

    const concentrationScore =
      topCategoryPercentage === null
        ? 50
        : Math.max(0, Math.min(100, 100 - topCategoryPercentage))

    return [
      {
        key: 'savings',
        label: 'Savings strength',
        value: savingsScore,
        color: '#22C38E',
        helper:
          savingsRateValue >= 20
            ? `${savingsRateValue}% saved`
            : `${savingsRateValue}% saved`,
      },
      {
        key: 'trend',
        label: 'Expense trend',
        value: trendScore,
        color: monthlyChangeValue !== null && monthlyChangeValue > 0 ? '#EF4444' : '#427CF0',
        helper:
          monthlyChangeValue === null
            ? 'Not enough prior data'
            : `${monthlyChangeValue > 0 ? '+' : ''}${monthlyChangeValue}% vs previous`,
      },
      {
        key: 'focus',
        label: 'Spend concentration',
        value: concentrationScore,
        color: '#855CD6',
        helper:
          topCategoryPercentage === null
            ? 'No category concentration yet'
            : `${topCategoryPercentage}% in top category`,
      },
    ]
  }, [monthlyChangeValue, savingsRateValue, topCategoryPercentage])

  const primaryInsight = useMemo(() => {
    if (insights.currentIncome === 0) {
      return {
        eyebrow: 'Priority Action',
        title: 'Add at least one income transaction',
        description:
          'Income entries unlock accurate savings rate, health score stability, and better recommendations.',
        badge: 'Setup required',
        badgeClass: 'bg-warning/10 text-warning',
        actionLabel: 'Add income',
        action: 'focus-income',
      }
    }

    if (netBalance < 0) {
      return {
        eyebrow: 'Priority Action',
        title: `Reduce spending by ${formatAmount(Math.abs(netBalance))}`,
        description:
          'You are currently spending more than you earn in this period. Focus on the biggest expense category first.',
        badge: 'Critical',
        badgeClass: 'bg-danger/10 text-danger',
        actionLabel: 'Review expenses',
        action: 'review-expenses',
      }
    }

    if (topCategoryPercentage !== null && topCategoryPercentage > 40) {
      return {
        eyebrow: 'Priority Action',
        title: `Cap ${insights.topCategory.name} below 35%`,
        description:
          'One category is dominating your spend. Set a limit and monitor this category weekly.',
        badge: 'High impact',
        badgeClass: 'bg-warning/10 text-warning',
        actionLabel: `View ${insights.topCategory.name}`,
        action: 'focus-top-category',
      }
    }

    if (monthlyChangeValue !== null && monthlyChangeValue > 10) {
      return {
        eyebrow: 'Priority Action',
        title: `Bring expenses down by ${Math.abs(monthlyChangeValue)}%`,
        description:
          'Your expense trend is rising versus the previous period. Cutting discretionary spend now can protect savings.',
        badge: 'Watch trend',
        badgeClass: 'bg-danger/10 text-danger',
        actionLabel: 'Inspect transactions',
        action: 'review-expenses',
      }
    }

    if (savingsRateValue >= 20) {
      return {
        eyebrow: 'Priority Action',
        title: 'Your savings habit is strong',
        description:
          'You are saving above the 20% benchmark. Keep consistency and track your largest category each week.',
        badge: 'On track',
        badgeClass: 'bg-success/10 text-success',
        actionLabel: 'See all transactions',
        action: 'view-all-transactions',
      }
    }

    return {
      eyebrow: 'Priority Action',
      title: 'Push savings above 20%',
      description:
        'Small weekly cuts in top discretionary categories can improve your monthly savings rate quickly.',
      badge: 'Opportunity',
      badgeClass: 'bg-primary/10 text-primary',
      actionLabel: 'Find reduction areas',
      action: 'review-expenses',
    }
  }, [
    insights.currentIncome,
    insights.topCategory,
    monthlyChangeValue,
    netBalance,
    savingsRateValue,
    topCategoryPercentage,
  ])

  const runInsightAction = (action) => {
    const resetFilters = {
      type: 'all',
      category: 'all',
      search: '',
      sortBy: 'date',
      startDate: '',
      endDate: '',
    }

    if (action === 'focus-income') {
      updateFilters({ ...resetFilters, type: 'income' })
      navigate('/transactions')
      return
    }

    if (action === 'review-expenses') {
      updateFilters({ ...resetFilters, type: 'expense', sortBy: 'amount-high' })
      navigate('/transactions')
      return
    }

    if (action === 'focus-top-category' && insights.topCategory?.name) {
      updateFilters({
        ...resetFilters,
        type: 'expense',
        category: insights.topCategory.name,
        sortBy: 'amount-high',
      })
      navigate('/transactions')
      return
    }

    updateFilters(resetFilters)
    navigate('/transactions')
  }

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

      <motion.div variants={fadeUp} initial="initial" animate="animate">
        <HoverCard
          accentColor="#427CF0"
          glowColor="rgba(66, 124, 240, 0.2)"
          className="before:absolute before:inset-[0px] before:rounded-xl before:border before:border-white/[0.06]"
        >
          <div className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-[11px] uppercase tracking-wider text-text-muted font-semibold">
                  {primaryInsight.eyebrow}
                </span>
                <span
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg ${primaryInsight.badgeClass}`}
                >
                  {primaryInsight.badge}
                </span>
              </div>
              <h2 className="text-white text-lg font-semibold leading-snug mb-1.5">
                {primaryInsight.title}
              </h2>
              <p className="text-sm text-text-secondary max-w-2xl leading-relaxed">
                {primaryInsight.description}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 sm:items-center lg:justify-end">
              {role === 'admin' && (
                <Button
                  size="md"
                  onClick={() => runInsightAction(primaryInsight.action)}
                  className="whitespace-nowrap"
                >
                  <Target size={15} />
                  {primaryInsight.actionLabel}
                </Button>
              )}
            </div>
          </div>

          <div className="px-5 sm:px-6 pb-5 sm:pb-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <p className="text-[11px] uppercase tracking-wider text-text-muted">Income</p>
                  <span className="text-[11px] font-semibold text-success tabular-nums">
                    {incomeExpenseTotal > 0
                      ? `${((insights.currentIncome / incomeExpenseTotal) * 100).toFixed(1)}%`
                      : '0%'}
                  </span>
                </div>
                <p className="text-sm font-semibold text-white tabular-nums mb-2">
                  {formatAmount(insights.currentIncome)}
                </p>
                <MiniBar
                  value={insights.currentIncome}
                  max={incomeExpenseMax}
                  color="#22C38E"
                />
              </div>
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <p className="text-[11px] uppercase tracking-wider text-text-muted">Expenses</p>
                  <span className="text-[11px] font-semibold text-danger tabular-nums">
                    {incomeExpenseTotal > 0
                      ? `${((insights.currentExpense / incomeExpenseTotal) * 100).toFixed(1)}%`
                      : '0%'}
                  </span>
                </div>
                <p className="text-sm font-semibold text-white tabular-nums mb-2">
                  {formatAmount(insights.currentExpense)}
                </p>
                <MiniBar
                  value={insights.currentExpense}
                  max={incomeExpenseMax}
                  color="#EF4444"
                />
              </div>
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                <p className="text-[11px] uppercase tracking-wider text-text-muted mb-1">Net</p>
                <p className={`text-sm font-semibold tabular-nums ${netBalance >= 0 ? 'text-success' : 'text-danger'}`}>
                  {netBalance >= 0 ? '+' : ''}
                  {formatAmount(netBalance)}
                </p>
              </div>
            </div>
          </div>
        </HoverCard>
      </motion.div>

      {/* ─── Metric Cards Grid (Bento) ─── */}
      <motion.div
        variants={stagger}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 lg:grid-cols-3 gap-5"
      >
        {/* Health Score Card - Left Col spans 2 Rows */}
        <HoverCard
          variants={fadeUp}
          accentColor={healthLabel.color}
          glowColor={healthGlow}
          className="lg:row-span-2"
        >
          <div className="p-6">
            <div className="flex items-start justify-between gap-3 mb-4">
              <p className="text-text-muted text-xs font-medium uppercase tracking-wider">
                Financial Health
              </p>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08]">
                <HealthIcon size={14} style={{ color: healthLabel.color }} />
                <span className="text-xs font-semibold" style={{ color: healthLabel.color }}>
                  {healthLabel.text}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <ScoreRing
                score={healthScore}
                color={healthLabel.color}
                size={94}
                strokeWidth={7}
              />
              <div className="min-w-0">
                <p className="text-white text-base font-semibold leading-tight mb-1">
                  {healthScore >= 60
                    ? 'Financial position is stable'
                    : 'Financial position needs attention'}
                </p>
                <p className="text-text-secondary text-xs leading-relaxed">
                  Score combines your savings rate, expense trend, and how concentrated spending is in one category.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {healthBreakdown.map((item) => (
                <div key={item.key} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[11px] text-text-secondary font-medium">{item.label}</span>
                    <span className="text-[11px] text-text-muted tabular-nums">{item.helper}</span>
                  </div>
                  <MiniBar value={item.value} max={100} color={item.color} />
                </div>
              ))}
            </div>
          </div>
        </HoverCard>

        {/* Top Spending Category */}
        <HoverCard
          variants={fadeUp}
          accentColor="#EF4444"
          glowColor="rgba(239, 68, 68, 0.18)"
          className="flex flex-col h-full lg:col-span-2"
        >
          <div className="p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <p className="text-text-muted text-xs font-medium uppercase tracking-wider">
                Top Areas of Spending
              </p>
              <div className="w-10 h-10 rounded-xl bg-danger/10 border border-danger/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <TrendingDown size={18} className="text-danger" />
              </div>
            </div>
            
            {topCategories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-auto">
                {topCategories.map((cat, idx) => (
                  <div key={idx} className="flex flex-col">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center">
                        {(() => {
                          const Icon = iconMap[cat.name] || Receipt
                          return <Icon size={14} className="text-white" />
                        })()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white text-sm font-bold truncate">
                          {cat.name}
                        </p>
                        <p className="text-text-muted text-xs tabular-nums">
                          {formatAmount(cat.value)}
                        </p>
                      </div>
                    </div>
                    <div>
                      <MiniBar
                        value={Number(cat.percentage)}
                        max={100}
                        color={idx === 0 ? "#EF4444" : idx === 1 ? "#F59E0B" : "#855CD6"}
                      />
                      <p className="text-[10px] text-text-muted mt-1.5 text-right">
                        {cat.percentage}% of expenses
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-2 mt-auto">
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

        {/* Expense Trend */}
        <HoverCard
          variants={fadeUp}
          accentColor={monthlyChangeValue > 0 ? '#EF4444' : '#22C38E'}
          glowColor={monthlyChangeValue > 0 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 195, 142, 0.2)'}
          className="flex flex-col h-full lg:col-span-1"
        >
          <div className="p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ${
                monthlyChangeValue !== null
                  ? monthlyChangeValue > 0 
                    ? 'bg-danger/10 border border-danger/20' 
                    : 'bg-success/10 border border-success/20'
                  : 'bg-primary/10 border border-primary/20'
              }`}>
                {monthlyChangeValue !== null && monthlyChangeValue > 0 ? (
                  <TrendingUp size={18} className="text-danger" />
                ) : (
                  <TrendingDown size={18} className={monthlyChangeValue !== null ? "text-success" : "text-primary"} />
                )}
              </div>
              {insights.hasEnoughData && monthlyChangeValue !== null && (
                <span
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-lg tabular-nums flex items-center gap-1 ${
                    monthlyChangeValue <= 0
                      ? 'bg-success/10 text-success'
                      : 'bg-danger/10 text-danger'
                  }`}
                >
                  {monthlyChangeValue > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {Math.abs(monthlyChangeValue)}%
                </span>
              )}
            </div>
            <p className="text-text-muted text-xs font-medium uppercase tracking-wider mb-2">
              Expense Trend
            </p>
            {insights.hasEnoughData && monthlyChangeValue !== null ? (
              <>
                <p className="text-white text-lg font-bold mb-1">
                  Expenses {monthlyChangeValue > 0 ? 'increased' : 'decreased'} by {Math.abs(monthlyChangeValue)}%
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
                <div className="mt-4 h-10 w-full overflow-hidden relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[
                      { v: insights.prevExpense },
                      { v: insights.prevExpense + (insights.currentExpense - insights.prevExpense) * 0.3 },
                      { v: insights.prevExpense + (insights.currentExpense - insights.prevExpense) * 0.7 },
                      { v: insights.currentExpense }
                    ]}>
                      <defs>
                        <linearGradient id="spark-color" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={monthlyChangeValue <= 0 ? '#22C38E' : '#EF4444'} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={monthlyChangeValue <= 0 ? '#22C38E' : '#EF4444'} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="v" stroke={monthlyChangeValue <= 0 ? '#22C38E' : '#EF4444'} strokeWidth={2} fillOpacity={1} fill="url(#spark-color)" animationDuration={1000} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-[11px] text-text-muted mt-2">
                  Compared to your expenses from the previous {periodLabel.replace('last ', '')}.
                </p>
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
          className="flex flex-col h-full lg:col-span-1"
        >
          <div className="p-6 flex flex-col h-full">
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
                {insights.savingsRate < 0 ? (
                  <div className="mt-4 p-3 rounded-lg border border-warning/20 bg-warning/5 flex flex-col items-center justify-center relative overflow-hidden">
                    <motion.div 
                      className="absolute inset-0 bg-warning/10" 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: [0, 0.4, 0] }} 
                      transition={{ duration: 2, repeat: Infinity }} 
                    />
                    <AlertCircle size={18} className="text-warning mb-1 relative z-10" />
                    <span className="text-xs text-warning font-semibold relative z-10">Deficit State</span>
                  </div>
                ) : (
                  <div className="mt-4">
                    <MiniBar
                      value={insights.savingsRate}
                      max={100}
                      color="#22C38E"
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
                )}
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
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles size={16} className="text-primary" />
          </motion.div>
          <h2 className="text-white text-sm font-semibold">
            Recommendations
          </h2>
          <span className="text-[11px] text-text-muted hidden sm:inline-flex items-center gap-1">
            <Info size={12} />
            Prioritized by impact
          </span>
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
                  className="before:absolute before:inset-[0px] before:rounded-xl before:border-[1.5px] before:border-transparent before:bg-gradient-to-r before:from-transparent before:via-white/[0.08] before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500 overflow-hidden"
                >
                  <div className="p-4 flex gap-3 relative z-10">
                    <div className="flex-shrink-0 mt-0.5">
                      <TipIcon
                        size={15}
                        className={cfg.iconColor}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <p className="text-white text-[13px] font-semibold leading-snug">
                          {tip.title}
                        </p>
                        <span className="text-[10px] text-text-muted px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06] whitespace-nowrap">
                          {tip.impact}
                        </span>
                      </div>
                      <p className="text-text-secondary text-[13px] leading-relaxed">
                        {tip.text}
                      </p>
                      {role === 'admin' && (
                        <button
                          onClick={() => runInsightAction(tip.action)}
                          className="mt-2 text-xs font-medium text-primary hover:text-primary/85 transition-colors inline-flex items-center gap-1"
                        >
                          Take action <ArrowRight size={12} />
                        </button>
                      )}
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