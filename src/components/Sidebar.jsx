// components/Sidebar.jsx
import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  ArrowRightLeft,
  BarChart3,
  Settings,
  HelpCircle,
  Wallet,
  ChevronLeft,
  LogOut,
  Bell,
} from 'lucide-react'

const mainNav = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { id: 'transactions', label: 'Transactions', icon: ArrowRightLeft, path: '/transactions' },
  { id: 'insights', label: 'Insights', icon: BarChart3, path: '/insights' },
]

const secondaryNav = [
  { id: 'notifications', label: 'Notifications', icon: Bell, path: '/notifications', badge: 3 },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
  { id: 'help', label: 'Help & Support', icon: HelpCircle, path: '/help' },
]

export default function Sidebar({ collapsed, onToggle, isMobile }) {
  const [hovered, setHovered] = useState(null)
  const location = useLocation()

  const showLabels = !collapsed || isMobile
  const sidebarWidth = isMobile ? 280 : collapsed ? 72 : 280

  const isActive = (path) => location.pathname === path

  const renderNavItem = (item) => {
    const Icon = item.icon
    const active = isActive(item.path)
    const isHov = hovered === item.id && !active

    return (
      <li key={item.id} className="relative group/item">
        <NavLink
          to={item.path}
          onMouseEnter={() => setHovered(item.id)}
          className={`
            relative flex items-center w-full rounded-xl h-[44px] px-3 gap-3
            text-sm font-medium outline-none
            transition-colors duration-150
            ${collapsed && !isMobile ? 'justify-center' : ''}
            ${active ? 'text-white' : 'text-text-secondary hover:text-white/80'}
          `}
        >
          {/* ─── Aceternity-style sliding hover bg ─── */}
          {isHov && (
            <motion.span
              layoutId="sidebar-hover-bg"
              className="absolute inset-0 rounded-xl bg-white/[0.05]"
              style={{ originX: 0.5, originY: 0.5 }}
              transition={{
                type: 'spring',
                stiffness: 350,
                damping: 25,
                mass: 0.8,
              }}
            />
          )}

          {/* ─── Active bg (separate layoutId so both can coexist) ─── */}
          {active && (
            <motion.span
              layoutId="sidebar-active-bg"
              className="absolute inset-0 rounded-xl bg-white/[0.08] border border-white/[0.06]"
              transition={{
                type: 'spring',
                stiffness: 350,
                damping: 25,
                mass: 0.8,
              }}
            />
          )}

          {/* ─── Active left accent bar ─── */}
          <AnimatePresence>
            {active && (
              <motion.span
                initial={{ scaleY: 0, opacity: 0 }}
                animate={{ scaleY: 1, opacity: 1 }}
                exit={{ scaleY: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute left-0 top-[22%] bottom-[22%] w-[3px] rounded-full bg-primary origin-center"
                style={{ boxShadow: '0 0 10px rgba(66,124,240,0.5)' }}
              />
            )}
          </AnimatePresence>

          {/* Icon */}
          <span className="relative z-10 flex-shrink-0 w-5 h-5 flex items-center justify-center">
            <Icon
              size={19}
              strokeWidth={active ? 2.2 : 1.8}
              className={`transition-colors duration-200 ${
                active ? 'text-primary' : ''
              }`}
            />
          </span>

          {/* Label */}
          <AnimatePresence mode="wait">
            {showLabels && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="relative z-10 whitespace-nowrap overflow-hidden flex-1 text-left"
              >
                {item.label}
              </motion.span>
            )}
          </AnimatePresence>

          {/* Badge */}
          {item.badge && showLabels && (
            <span className="relative z-10 min-w-[22px] h-[22px] flex items-center justify-center rounded-full bg-primary/15 text-primary text-[11px] font-bold px-1.5 tabular-nums">
              {item.badge}
            </span>
          )}
          {item.badge && !showLabels && (
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary shadow-sm shadow-primary/50 z-10" />
          )}
        </NavLink>

        {/* ─── Tooltip when collapsed (desktop only) ─── */}
        {collapsed && !isMobile && (
          <div className="
            absolute left-full top-1/2 -translate-y-1/2 ml-3
            px-3 py-1.5 rounded-lg
            bg-surface-card border border-white/[0.08]
            text-white text-xs font-medium whitespace-nowrap
            opacity-0 group-hover/item:opacity-100
            translate-x-1 group-hover/item:translate-x-0
            pointer-events-none
            transition-all duration-200 ease-out
            shadow-xl shadow-black/50
            z-[100]
          ">
            {item.label}
            <div className="absolute left-0 top-1/2 -translate-x-[3px] -translate-y-1/2 w-[6px] h-[6px] rotate-45 bg-surface-card border-l border-b border-white/[0.08]" />
          </div>
        )}
      </li>
    )
  }

  return (
    <aside
      className={`
        fixed top-0 left-0 h-screen flex flex-col z-40
        border-r border-white/[0.06]
        bg-bg-card
        transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
        ${isMobile
          ? collapsed
            ? '-translate-x-full'
            : 'translate-x-0'
          : 'translate-x-0'
        }
      `}
      style={{ width: sidebarWidth }}
    >
      {/* ═══════ Brand Header ═══════ */}
      <div className="flex items-center gap-3 h-16 flex-shrink-0 px-5 border-b border-white/[0.04]">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent-purple flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/20">
          <span className="text-white text-sm font-extrabold leading-none">Z</span>
        </div>
        <AnimatePresence mode="wait">
          {showLabels && (
            <motion.div
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col overflow-hidden"
            >
              <span className="text-[15px] font-bold text-white tracking-tight leading-tight">
                Zorvyn
              </span>
              <span className="text-[10px] text-text-muted font-semibold tracking-widest uppercase">
                Finance
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ═══════ Main Navigation ═══════ */}
      <nav
        className="flex-1 overflow-y-auto overflow-x-hidden px-3 pt-4 pb-2 scrollbar-none"
        onMouseLeave={() => setHovered(null)}
      >
        <ul className="flex flex-col gap-1">
          {mainNav.map(renderNavItem)}
        </ul>

        {/* Divider */}
        <div className="h-px bg-white/[0.04] mx-2 my-4" />

        <ul className="flex flex-col gap-1">
          {secondaryNav.map(renderNavItem)}
        </ul>
      </nav>

      {/* ═══════ User Profile ═══════ */}
      <div className="flex-shrink-0 border-t border-white/[0.04] p-3">
        <div
          className={`
            flex items-center gap-3 rounded-xl px-3 py-2.5
            hover:bg-white/[0.04] transition-colors duration-200 cursor-pointer
            ${collapsed && !isMobile ? 'justify-center' : ''}
          `}
        >
          <div className="relative flex-shrink-0">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent-purple flex items-center justify-center ring-2 ring-white/[0.08] ring-offset-2 ring-offset-bg-card">
              <span className="text-[11px] font-bold text-white">JD</span>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-success border-2 border-bg-card" />
          </div>

          <AnimatePresence mode="wait">
            {showLabels && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
                className="flex-1 min-w-0 text-left"
              >
                <p className="text-[13px] font-medium text-white truncate leading-tight">
                  John Doe
                </p>
                <p className="text-[11px] text-text-muted truncate leading-tight mt-0.5">
                  john@zorvyn.com
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {showLabels && (
            <div className="flex-shrink-0 p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors">
              <LogOut size={14} className="text-text-muted hover:text-text-secondary transition-colors" />
            </div>
          )}
        </div>
      </div>

      {/* ═══════ Collapse Toggle (desktop) ═══════ */}
      {!isMobile && (
        <button
          onClick={onToggle}
          className="
            absolute -right-3 top-[72px] z-50
            w-6 h-6 rounded-full
            border border-white/[0.08] bg-bg-card
            flex items-center justify-center
            hover:bg-white/[0.06] hover:border-white/[0.15]
            transition-all duration-200
            shadow-lg shadow-black/30
            group/toggle
          "
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <motion.span
            animate={{ rotate: collapsed ? 180 : 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="flex"
          >
            <ChevronLeft
              size={12}
              strokeWidth={2.5}
              className="text-text-muted group-hover/toggle:text-white transition-colors"
            />
          </motion.span>
        </button>
      )}
    </aside>
  )
}