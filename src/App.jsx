import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Insights from './pages/Insights'
import TransactionModal from './components/TransactionModal'
import useStore from './store/useStore'

export default function App() {
  const location = useLocation()
  const [modalOpen, setModalOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const addTransaction = useStore(s => s.addTransaction)

  // Responsive sidebar
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

  // Close mobile sidebar on route change
  useEffect(() => {
    if (isMobile) setSidebarCollapsed(true)
  }, [location.pathname, isMobile])

  const handleAddTransaction = (data) => {
    addTransaction({
      ...data,
      description: data.description || data.category,
    })
  }

  const sidebarWidth = isMobile ? 0 : sidebarCollapsed ? 72 : 280

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-main)' }}>
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        isMobile={isMobile}
      />

      {/* Mobile overlay */}
      {isMobile && !sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-20"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      {/* Main Content Area */}
      <div
        className="flex-1 transition-all duration-300 min-h-screen flex flex-col"
        style={{ marginLeft: sidebarWidth }}
      >
        {/* Topbar */}
        <Topbar
          onAddTransaction={() => setModalOpen(true)}
          onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          isMobile={isMobile}
        />

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/insights" element={<Insights />} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>

      {/* Global Add Transaction Modal (from Topbar) */}
      <TransactionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleAddTransaction}
        editData={null}
      />
    </div>
  )
}
