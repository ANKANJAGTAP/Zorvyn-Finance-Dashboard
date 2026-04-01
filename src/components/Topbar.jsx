import { Search, Plus, Download, Bell, User, Shield, Eye, Menu } from 'lucide-react'
import useStore from '../store/useStore'
import { exportToCSV } from '../utils/formatters'

export default function Topbar({ onAddTransaction, onMenuClick, isMobile }) {
  const role = useStore(s => s.role)
  const setRole = useStore(s => s.setRole)
  const timeFilter = useStore(s => s.timeFilter)
  const setTimeFilter = useStore(s => s.setTimeFilter)
  const filters = useStore(s => s.filters)
  const updateFilters = useStore(s => s.updateFilters)
  const getFilteredTransactions = useStore(s => s.getFilteredTransactions)

  const timeOptions = ['7d', '30d', '90d']

  const handleExport = () => {
    const data = getFilteredTransactions()
    exportToCSV(data)
  }

  return (
    <header
      className="sticky top-0 z-20 h-16 flex items-center justify-between px-4 md:px-6 gap-3 border-b border-white/10"
      style={{ background: 'var(--bg-glass)', backdropFilter: 'blur(10px)' }}
    >
      {/* Left: Menu + Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        {/* Mobile hamburger */}
        {isMobile && (
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg text-text-secondary hover:text-white hover:bg-white/5 transition-all duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <Menu size={20} />
          </button>
        )}

        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={filters.search}
            onChange={(e) => updateFilters({ search: e.target.value })}
            className="w-full pl-9 pr-4 py-2 rounded-lg text-sm glass text-white placeholder:text-text-muted focus:outline-none focus:border-primary/50 transition-all duration-200 min-h-[44px]"
          />
        </div>
      </div>

      {/* Center: Time Filter */}
      <div className="hidden md:flex items-center gap-1 p-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
        {timeOptions.map(option => (
          <button
            key={option}
            onClick={() => setTimeFilter(option)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all duration-200 min-h-[36px] ${
              timeFilter === option
                ? 'bg-primary text-white'
                : 'text-text-secondary hover:text-white'
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Add Transaction — Premium gradient button */}
        <button
          onClick={onAddTransaction}
          disabled={role !== 'admin'}
          className={`hidden sm:flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 min-h-[44px] ${
            role === 'admin'
              ? 'text-white active:scale-[0.98]'
              : 'bg-white/5 text-text-muted cursor-not-allowed'
          }`}
          style={role === 'admin' ? {
            background: 'linear-gradient(135deg, #427CF0, #855CD6)',
            boxShadow: '0 2px 10px rgba(66, 124, 240, 0.3)',
          } : {}}
          onMouseEnter={(e) => { if (role === 'admin') e.currentTarget.style.boxShadow = '0 4px 20px rgba(66, 124, 240, 0.45)' }}
          onMouseLeave={(e) => { if (role === 'admin') e.currentTarget.style.boxShadow = '0 2px 10px rgba(66, 124, 240, 0.3)' }}
          title={role !== 'admin' ? 'Switch to Admin to add transactions' : 'Add Transaction'}
        >
          <Plus size={16} />
          <span className="hidden lg:inline">Add Transaction</span>
        </button>

        {/* Export */}
        <button
          onClick={handleExport}
          className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-white hover:bg-white/5 transition-all duration-200 min-h-[44px]"
          title="Export CSV"
        >
          <Download size={16} />
          <span className="hidden lg:inline">Export</span>
        </button>

        {/* Notification Bell */}
        <button
          className="relative p-2 rounded-lg text-text-secondary hover:text-white hover:bg-white/5 transition-all duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
          title="No new notifications"
        >
          <Bell size={18} />
        </button>

        {/* Role Switch */}
        <div className="flex items-center gap-2 pl-2 md:pl-3 border-l border-white/10">
          <button
            onClick={() => setRole(role === 'admin' ? 'viewer' : 'admin')}
            className="flex items-center gap-2 px-2 md:px-3 py-2 rounded-lg hover:bg-white/5 transition-all duration-200 min-h-[44px]"
          >
            {role === 'admin' ? (
              <Shield size={16} className="text-primary" />
            ) : (
              <Eye size={16} className="text-text-secondary" />
            )}
            <span className="hidden md:block text-sm font-medium text-white">
              {role === 'admin' ? 'Admin' : 'Viewer'}
            </span>
          </button>

          {/* Avatar */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-main flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
            <div className="hidden lg:block">
              <p className="text-sm font-medium text-white leading-tight">John Doe</p>
              <span className={`text-[10px] font-semibold uppercase tracking-wider ${
                role === 'admin' ? 'text-primary' : 'text-text-muted'
              }`}>
                {role}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
