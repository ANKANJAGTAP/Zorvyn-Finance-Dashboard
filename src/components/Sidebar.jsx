import { NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, ArrowLeftRight, Lightbulb, Settings, HelpCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import useStore from '../store/useStore'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { path: '/insights', label: 'Insights', icon: Lightbulb },
]

export default function Sidebar({ collapsed, onToggle, isMobile }) {
  const transactions = useStore(s => s.transactions)
  const location = useLocation()

  return (
    <aside
      className={`fixed left-0 top-0 h-screen z-30 flex flex-col transition-all duration-300 ease-in-out border-r border-white/10 bg-bg-section ${
        isMobile
          ? collapsed ? '-translate-x-full' : 'translate-x-0 w-[280px]'
          : collapsed ? 'w-[72px]' : 'w-[280px]'
      }`}
      aria-label="Main navigation sidebar"
    >
      {/* Logo / Brand */}
      <div className={`flex items-center h-16 px-5 border-b border-white/10 ${collapsed && !isMobile ? 'justify-center' : 'gap-3'}`}>
        <div className="w-8 h-8 rounded-lg bg-gradient-main flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm">Z</span>
        </div>
        {(!collapsed || isMobile) && (
          <span className="text-white font-semibold text-lg tracking-tight">Zorvyn</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 flex flex-col gap-1" aria-label="Main navigation">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          const isTransactions = item.path === '/transactions'
          const showLabel = !collapsed || isMobile

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="group relative"
              aria-label={!showLabel ? item.label : undefined}
              aria-current={isActive ? 'page' : undefined}
            >
              <div
                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 min-h-[44px] ${
                  isActive
                    ? 'bg-primary/15 text-white shadow-[0_0_15px_rgba(66,124,240,0.15)]'
                    : 'text-text-secondary hover:bg-white/5 hover:text-white'
                }`}
              >
                {/* Active indicator — gradient bar */}
                {isActive && (
                  <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 rounded-r-full"
                    style={{ background: 'linear-gradient(180deg, #427CF0, #22C38E)' }}
                  />
                )}

                <Icon size={20} className={`flex-shrink-0 ${isActive ? 'text-primary' : ''}`} />

                {showLabel && (
                  <span className="font-medium text-sm flex-1">{item.label}</span>
                )}

                {/* Transaction count badge */}
                {isTransactions && showLabel && (
                  <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium">
                    {transactions.length}
                  </span>
                )}
                {isTransactions && !showLabel && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                    {transactions.length > 99 ? '99+' : transactions.length}
                  </span>
                )}
              </div>

              {/* Tooltip when collapsed (desktop only) */}
              {!showLabel && (
                <div
                  className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 bg-bg-section border border-white/10"
                  role="tooltip"
                >
                  {item.label}
                </div>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Bottom Section */}
      <div className="py-4 px-3 border-t border-white/10 flex flex-col gap-1">
        <button
          className="flex items-center gap-3 px-3 py-3 rounded-lg text-text-secondary hover:bg-white/5 hover:text-white transition-all duration-200 min-h-[44px]"
          aria-label="Settings"
        >
          <Settings size={20} />
          {(!collapsed || isMobile) && <span className="text-sm">Settings</span>}
        </button>
        <button
          className="flex items-center gap-3 px-3 py-3 rounded-lg text-text-secondary hover:bg-white/5 hover:text-white transition-all duration-200 min-h-[44px]"
          aria-label="Help and support"
        >
          <HelpCircle size={20} />
          {(!collapsed || isMobile) && <span className="text-sm">Help</span>}
        </button>
      </div>

      {/* Collapse Toggle (desktop only) */}
      {!isMobile && (
        <button
          onClick={onToggle}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full border border-white/10 bg-bg-section flex items-center justify-center text-text-secondary hover:text-white hover:border-white/20 transition-all duration-200 z-40"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      )}
    </aside>
  )
}
