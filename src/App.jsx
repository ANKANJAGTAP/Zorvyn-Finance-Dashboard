// App.jsx
import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Insights from './pages/Insights'
import Notifications from './pages/Notifications'
import SettingsPage from './pages/SettingsPage'
import Help from './pages/Help'
import TransactionModal from './components/TransactionModal'
import useStore from './store/useStore'

export default function App() {
  const location = useLocation()
  const [modalOpen, setModalOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const addTransaction = useStore(s => s.addTransaction)

  useEffect(() => {
    const checkWidth = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) setSidebarCollapsed(true)
    }
    checkWidth()
    window.addEventListener('resize', checkWidth)
    return () => window.removeEventListener('resize', checkWidth)
  }, [])

  useEffect(() => {
    if (isMobile) setSidebarCollapsed(true)
  }, [location.pathname, isMobile])

  const handleAddTransaction = (data) => {
    addTransaction({
      ...data,
      description: data.description || data.category,
    })
    toast.success('Transaction added successfully', {
      description: `₹${Number(data.amount).toLocaleString('en-IN')} — ${data.category}`,
    })
  }

  const sidebarWidth = isMobile ? 0 : sidebarCollapsed ? 72 : 280

  return (
    <div className="flex min-h-screen bg-bg-main">
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        isMobile={isMobile}
      />

      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobile && !sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
            onClick={() => setSidebarCollapsed(true)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div
        className="flex-1 transition-all duration-300 min-h-screen flex flex-col"
        style={{ marginLeft: sidebarWidth }}
      >
        <Topbar
          onAddTransaction={() => setModalOpen(true)}
          onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          isMobile={isMobile}
        />

        <main className="flex-1 p-4 md:p-6 overflow-auto" role="main">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/insights" element={<Insights />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/help" element={<Help />} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>

      <TransactionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleAddTransaction}
        editData={null}
      />
    </div>
  )
}