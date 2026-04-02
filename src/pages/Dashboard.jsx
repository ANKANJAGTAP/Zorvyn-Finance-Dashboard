import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import SummaryCards from '../components/SummaryCards'
import BalanceChart from '../components/BalanceChart'
import SpendingDonut from '../components/SpendingDonut'
import RecentTransactions from '../components/RecentTransactions'
import InsightsPreview from '../components/InsightsPreview'

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

export default function Dashboard() {
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

      {/* Row 1: Summary Cards — loads first (300ms) */}
      <SummaryCards loading={cardsLoading} />

      {/* Row 2: Charts (50/50) — loads second (550ms) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BalanceChart loading={chartsLoading} />
        <SpendingDonut loading={chartsLoading} />
      </div>

      {/* Row 3: Split Row (60/40) — loads last (750ms) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <RecentTransactions loading={bottomLoading} />
        </div>
        <div className="lg:col-span-2">
          <InsightsPreview loading={bottomLoading} />
        </div>
      </div>
    </motion.div>
  )
}
