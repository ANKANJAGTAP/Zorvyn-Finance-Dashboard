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
  const [loading, setLoading] = useState(true)

  // Simulate 500ms load delay for skeleton effect
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-text-secondary text-sm mt-1">Your financial overview at a glance</p>
      </div>

      {/* Row 1: Summary Cards */}
      <SummaryCards loading={loading} />

      {/* Row 2: Charts (50/50) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BalanceChart loading={loading} />
        <SpendingDonut loading={loading} />
      </div>

      {/* Row 3: Split Row (60/40) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <RecentTransactions loading={loading} />
        </div>
        <div className="lg:col-span-2">
          <InsightsPreview loading={loading} />
        </div>
      </div>
    </motion.div>
  )
}
