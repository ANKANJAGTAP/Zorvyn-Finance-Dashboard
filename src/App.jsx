import { useState, useEffect, lazy, Suspense } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import TransactionModal from './components/TransactionModal'
import DynamicBackground from './components/ui/DynamicBackground'

// Lazy load routes for Code Splitting
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Transactions = lazy(() => import('./pages/Transactions'))
const Insights = lazy(() => import('./pages/Insights'))
const Notifications = lazy(() => import('./pages/Notifications'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const Help = lazy(() => import('./pages/Help'))
import useStore from './store/useStore'

export default function App() {

  const location = useLocation()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  
  const role = useStore(s => s.role)
  const addTransaction = useStore(s => s.addTransaction)
  const editTransaction = useStore(s => s.editTransaction)
  const isModalOpen = useStore(s => s.isModalOpen)
  const editingTransaction = useStore(s => s.editingTransaction)
  const closeModal = useStore(s => s.closeModal)
  const openModal = useStore(s => s.openModal)

  const theme = useStore(s => s.theme)

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

  // ─── Native Theme Engine ───
  useEffect(() => {
    const root = window.document.documentElement
    
    // Remove both explicitly to ensure clean slate
    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      root.classList.add(systemTheme)
    } else {
      root.classList.add(theme)
    }
  }, [theme])

  // Optional: Listen for live system theme changes if set to 'system'
  useEffect(() => {
    if (theme !== 'system') return
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      const root = window.document.documentElement
      root.classList.remove('light', 'dark')
      root.classList.add(mediaQuery.matches ? 'dark' : 'light')
    }
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  useEffect(() => {
    if (isMobile) setSidebarCollapsed(true)
  }, [location.pathname, isMobile])

  const handleModalSubmit = (data) => {
    if (editingTransaction) {
      editTransaction(editingTransaction.id, {
        ...data,
        description: data.description || data.category,
      })
      toast.success('Transaction updated', {
        description: `${data.category} — ₹${Number(data.amount).toLocaleString('en-IN')}`,
      })
    } else {
      addTransaction({
        ...data,
        description: data.description || data.category,
      })
      toast.success('Transaction added successfully', {
        description: `₹${Number(data.amount).toLocaleString('en-IN')} — ${data.category}`,
      })
    }
  }

  const sidebarWidth = isMobile ? 0 : sidebarCollapsed ? 72 : 280

  return (
    <div className="flex min-h-screen relative z-0">
      <DynamicBackground />

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
        className="flex-1 transition-all duration-300 min-h-screen flex flex-col relative z-10"
        style={{ marginLeft: sidebarWidth }}
      >
        <Topbar
          onAddTransaction={() => openModal()}
          onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          isMobile={isMobile}
        />

        <main className="flex-1 p-4 md:p-6 overflow-auto" role="main">
          <Suspense fallback={
            <div className="w-full h-full flex flex-col gap-6 pt-2">
              <div className="skeleton h-8 w-48 mb-2" />
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="skeleton h-[200px] rounded-xl col-span-2 lg:col-span-1" />
                <div className="skeleton h-[200px] rounded-xl" />
                <div className="skeleton h-[200px] rounded-xl" />
              </div>
            </div>
          }>
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard onAddTransaction={() => openModal()} />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/insights" element={<Insights />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/help" element={<Help />} />
            </Routes>
          </Suspense>
        </main>

        {/* Global Mobile Floating Action Button (FAB) */}
        <AnimatePresence>
          {isMobile && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (role === 'admin') openModal()
              }}
              disabled={role !== 'admin'}
              className={`fixed bottom-6 right-6 z-40 flex items-center justify-center w-14 h-14 rounded-full shadow-xl sm:hidden
                ${role === 'admin' 
                  ? 'bg-primary text-white shadow-primary/30 hover:shadow-primary/50 cursor-pointer' 
                  : 'bg-surface-elevated text-gray-400 border border-border-dim cursor-not-allowed hidden'
                }
              `}
              aria-label={role !== 'admin' ? 'Switch to Admin to add transactions' : 'Add transaction'}
            >
              <Plus size={24} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleModalSubmit}
        editData={editingTransaction}
      />
    </div>
  )
}