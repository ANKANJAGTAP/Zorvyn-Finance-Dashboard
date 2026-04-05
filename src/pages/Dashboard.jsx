import { useState, useEffect, lazy, Suspense } from 'react'
import { motion } from 'framer-motion'
import BalanceHeroCard from '../components/BalanceHeroCard'
import IncomeCard from '../components/IncomeCard'
import ExpenseCard from '../components/ExpenseCard'
import RecentTransactions from '../components/RecentTransactions'
import InsightsPreview from '../components/InsightsPreview'

// Lazy load heavy graphical (Recharts) components
const BalanceChart = lazy(() => import('../components/BalanceChart'))
const SavingsGauge = lazy(() => import('../components/SavingsGauge'))

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

export default function Dashboard({ onAddTransaction }) {
  // Progressive loading: cards → charts → bottom row
  const [cardsLoading, setCardsLoading] = useState(true)
  const [chartsLoading, setChartsLoading] = useState(true)
  const [bottomLoading, setBottomLoading] = useState(true)

  useEffect(() => {
    const t1 = setTimeout(() => setCardsLoading(false), 300)
    const t2 = setTimeout(() => setChartsLoading(false), 550)
    const t3 = setTimeout(() => setBottomLoading(false), 750)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="space-y-6"
    >
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-text-secondary text-sm mt-1">Your financial overview at a glance</p>
      </div>

      {/* Row 1: Hero Balance (40%) + Income (30%) + Expense (30%) */}
      <div className="grid grid-cols-2 lg:grid-cols-[2fr_1.5fr_1.5fr] gap-6">
        <div className="col-span-2 lg:col-span-1">
          <BalanceHeroCard loading={cardsLoading} onAddTransaction={onAddTransaction} />
        </div>
        <IncomeCard loading={cardsLoading} />
        <ExpenseCard loading={cardsLoading} />
      </div>

      {/* Row 2: Spending/Savings + Balance Chart + Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1.5fr_1.4fr] gap-6">
        <Suspense fallback={<div className="glass-card p-6 min-h-[300px] flex items-center justify-center"><div className="skeleton w-32 h-32 rounded-full" /></div>}>
          <SavingsGauge loading={chartsLoading} />
        </Suspense>
        
        <Suspense fallback={<div className="glass-card p-6 min-h-[300px]"><div className="skeleton h-full w-full" /></div>}>
          <BalanceChart loading={chartsLoading} />
        </Suspense>
        
        <InsightsPreview loading={chartsLoading} />
      </div>

      {/* Row 3: Transactions (100%) */}
      <RecentTransactions loading={bottomLoading} />
    </motion.div>
  )
}
