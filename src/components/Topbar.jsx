import { Search, Plus, Download, Bell, User, Shield, Eye, Menu } from 'lucide-react'
import { toast } from 'sonner'
import useStore from '../store/useStore'
import { exportToCSV } from '../utils/formatters'
import Button from './ui/Button'

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
    if (data.length === 0) {
      toast.error('No transactions to export', {
        description: 'Try adjusting your filters first.',
      })
      return
    }
    exportToCSV(data)
    toast.success('CSV exported successfully', {
      description: `${data.length} transaction${data.length !== 1 ? 's' : ''} exported.`,
    })
  }

  return (
    <header
      className="sticky top-0 z-20 h-16 flex items-center justify-between px-4 md:px-6 gap-3 border-b border-white/10 bg-bg-glass backdrop-blur-[10px]"
      role="banner"
    >
      {/* Left: Menu + Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        {/* Mobile hamburger */}
        {isMobile && (
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg text-text-secondary hover:text-white hover:bg-white/5 transition-all duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Toggle navigation menu"
          >
            <Menu size={20} />
          </button>
        )}

        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" aria-hidden="true" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={filters.search}
            onChange={(e) => updateFilters({ search: e.target.value })}
            className="w-full pl-9 pr-4 py-2 rounded-lg text-sm glass text-white placeholder:text-text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all duration-200 min-h-[44px]"
            aria-label="Search transactions"
          />
        </div>
      </div>

      {/* Center: Time Filter */}
      <div className="hidden md:flex items-center gap-1 p-1 rounded-lg bg-white/[0.05]" role="radiogroup" aria-label="Time period filter">
        {timeOptions.map(option => (
          <button
            key={option}
            onClick={() => setTimeFilter(option)}
            role="radio"
            aria-checked={timeFilter === option}
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
        {/* Add Transaction */}
        <Button
          variant="primary"
          size="md"
          onClick={onAddTransaction}
          disabled={role !== 'admin'}
          className="hidden sm:inline-flex"
          aria-label={role !== 'admin' ? 'Switch to Admin to add transactions' : 'Add transaction'}
        >
          <Plus size={16} />
          <span className="hidden lg:inline">Add Transaction</span>
        </Button>

        {/* Export */}
        <Button
          variant="ghost"
          size="md"
          onClick={handleExport}
          className="hidden sm:inline-flex"
          aria-label="Export transactions as CSV"
        >
          <Download size={16} />
          <span className="hidden lg:inline">Export</span>
        </Button>

        {/* Notification Bell */}
        <button
          className="relative p-2 rounded-lg text-text-secondary hover:text-white hover:bg-white/5 transition-all duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Notifications — no new notifications"
        >
          <Bell size={18} />
        </button>

        {/* Role Switch */}
        <div className="flex items-center gap-2 pl-2 md:pl-3 border-l border-white/10">
          <button
            onClick={() => setRole(role === 'admin' ? 'viewer' : 'admin')}
            className="flex items-center gap-2 px-2 md:px-3 py-2 rounded-lg hover:bg-white/5 transition-all duration-200 min-h-[44px]"
            aria-label={`Switch to ${role === 'admin' ? 'viewer' : 'admin'} role`}
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
