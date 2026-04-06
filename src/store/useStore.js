import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { mockTransactions } from '../data/mockData'
import { generateId } from '../utils/formatters'

const useStore = create(
  persist(
    (set, get) => ({
      // ─── Core State ───────────────────────────────
      transactions: mockTransactions,
      filters: {
        type: 'all',
        category: 'all',
        search: '',
        sortBy: 'date',
        startDate: '',
        endDate: '',
      },
      role: 'admin',
      selectedMetric: 'balance',
      timeFilter: '30d',
      theme: 'system',

      // ─── Modal State ──────────────────────────────
      isModalOpen: false,
      editingTransaction: null,

      // ─── Derived Data (computed via getters) ──────
      getFilteredTransactions: () => {
        const { transactions, filters, timeFilter } = get()
        let filtered = [...transactions]

        // Global time filter (only if no custom date range is set)
        if (!filters.startDate && !filters.endDate) {
          const now = new Date()
          const daysMap = { '7d': 7, '30d': 30, '90d': 90 }
          if (daysMap[timeFilter]) {
            const days = daysMap[timeFilter]
            const cutoff = new Date(now)
            cutoff.setDate(cutoff.getDate() - days)
            filtered = filtered.filter(t => new Date(t.date) >= cutoff)
          }
        }

        // Search filter
        if (filters.search) {
          const search = filters.search.toLowerCase()
          filtered = filtered.filter(t =>
            t.description.toLowerCase().includes(search) ||
            t.category.toLowerCase().includes(search)
          )
        }

        // Type filter
        if (filters.type !== 'all') {
          filtered = filtered.filter(t => t.type === filters.type)
        }

        // Custom Date Range Filter
        if (filters.startDate) {
          if (new Date(t.date) < new Date(filters.startDate)) return false
        }
        if (filters.endDate) {
          if (new Date(t.date) > new Date(filters.endDate)) return false
        }

        // Category filter
        if (filters.category !== 'all') {
          filtered = filtered.filter(catT => catT.category === filters.category)
        }

        // Sort
        switch (filters.sortBy) {
          case 'date':
            filtered.sort((a, b) => new Date(b.date) - new Date(a.date))
            break
          case 'amount-high':
            filtered.sort((a, b) => b.amount - a.amount)
            break
          case 'amount-low':
            filtered.sort((a, b) => a.amount - b.amount)
            break
          default:
            filtered.sort((a, b) => new Date(b.date) - new Date(a.date))
        }

        return filtered
      },

      getTotals: () => {
        const { transactions } = get()
        const income = transactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + (Number(t.amount) || 0), 0)
        const expense = transactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + (Number(t.amount) || 0), 0)
        const balance = income - expense
        const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0

        return { income, expense, balance, savingsRate }
      },

      getTimeFilteredTransactions: () => {
        const { transactions, timeFilter } = get()
        const now = new Date()
        const daysMap = { '7d': 7, '30d': 30, '90d': 90 }
        const days = daysMap[timeFilter] || 30
        const cutoff = new Date(now)
        cutoff.setDate(cutoff.getDate() - days)

        return transactions.filter(t => new Date(t.date) >= cutoff)
      },

      getChartData: () => {
        const { getTimeFilteredTransactions } = get()
        const filtered = getTimeFilteredTransactions()

        // Group by date for area chart
        const dailyMap = {}
        filtered.forEach(t => {
          if (!dailyMap[t.date]) {
            dailyMap[t.date] = { date: t.date, income: 0, expense: 0, balance: 0 }
          }
          const amt = Number(t.amount) || 0;
          if (t.type === 'income') {
            dailyMap[t.date].income += amt
          } else {
            dailyMap[t.date].expense += amt
          }
        })

        // Calculate running balance — use Math.abs on expense so chart always trends upward
        const chartData = Object.values(dailyMap).sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        )
        let runningBalance = 0
        let runningExpense = 0
        chartData.forEach(day => {
          runningBalance += day.income - day.expense
          runningExpense += Math.abs(day.expense)
          day.balance = Math.abs(runningBalance)
          day.expense = runningExpense
        })

        return chartData
      },

      getCategoryBreakdown: () => {
        const { getTimeFilteredTransactions } = get()
        const filtered = getTimeFilteredTransactions()
        const expenses = filtered.filter(t => t.type === 'expense')

        const categoryMap = {}
        expenses.forEach(t => {
          if (!categoryMap[t.category]) {
            categoryMap[t.category] = 0
          }
          categoryMap[t.category] += (Number(t.amount) || 0)
        })

        const total = Object.values(categoryMap).reduce((sum, v) => sum + v, 0)

        return Object.entries(categoryMap).map(([name, value]) => ({
          name,
          value,
          percentage: total > 0 ? ((value / total) * 100).toFixed(1) : 0,
        }))
      },

      getIncomeBreakdown: () => {
        const { getTimeFilteredTransactions } = get()
        const filtered = getTimeFilteredTransactions()
        const incomes = filtered.filter(t => t.type === 'income')

        const categoryMap = {}
        incomes.forEach(t => {
          if (!categoryMap[t.category]) {
            categoryMap[t.category] = 0
          }
          categoryMap[t.category] += (Number(t.amount) || 0)
        })

        const total = Object.values(categoryMap).reduce((sum, v) => sum + v, 0)

        return Object.entries(categoryMap)
          .map(([name, value]) => ({
            name,
            value,
            percentage: total > 0 ? ((value / total) * 100).toFixed(1) : 0,
          }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 2)
      },

      getInsights: () => {
        const { transactions, timeFilter } = get()
        const now = new Date()
        const daysMap = { '7d': 7, '30d': 30, '90d': 90 }
        const days = daysMap[timeFilter] || 30

        const periodStart = new Date(now)
        periodStart.setDate(periodStart.getDate() - days)
        const prevPeriodStart = new Date(periodStart)
        prevPeriodStart.setDate(prevPeriodStart.getDate() - days)

        const currentPeriod = transactions.filter(t => new Date(t.date) >= periodStart)
        const prevPeriod = transactions.filter(
          t => new Date(t.date) >= prevPeriodStart && new Date(t.date) < periodStart
        )

        // Current period totals
        const currentIncome = currentPeriod.filter(t => t.type === 'income').reduce((s, t) => s + (Number(t.amount) || 0), 0)
        const currentExpense = currentPeriod.filter(t => t.type === 'expense').reduce((s, t) => s + (Number(t.amount) || 0), 0)
        const prevExpense = prevPeriod.filter(t => t.type === 'expense').reduce((s, t) => s + (Number(t.amount) || 0), 0)
        const prevIncome = prevPeriod.filter(t => t.type === 'income').reduce((s, t) => s + (Number(t.amount) || 0), 0)

        // Highest spending category
        const categoryTotals = {}
        currentPeriod.filter(t => t.type === 'expense').forEach(t => {
          categoryTotals[t.category] = (categoryTotals[t.category] || 0) + (Number(t.amount) || 0)
        })
        const totalExpense = Object.values(categoryTotals).reduce((s, v) => s + v, 0)
        const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]

        // Period-over-period comparison
        const monthlyChange = prevExpense > 0
          ? (((currentExpense - prevExpense) / prevExpense) * 100).toFixed(1)
          : null

        // Savings rate
        const savingsRate = currentIncome > 0
          ? (((currentIncome - currentExpense) / currentIncome) * 100).toFixed(1)
          : 0

        return {
          topCategory: topCategory
            ? { name: topCategory[0], amount: topCategory[1], percentage: ((topCategory[1] / totalExpense) * 100).toFixed(1) }
            : null,
          monthlyChange,
          savingsRate,
          currentExpense,
          currentIncome,
          prevExpense,
          prevIncome,
          hasEnoughData: prevPeriod.length > 0,
        }
      },

      // ─── Actions ──────────────────────────────────
      addTransaction: (transaction) =>
        set(state => ({
          transactions: [
            { ...transaction, id: generateId(), status: 'completed' },
            ...state.transactions,
          ],
        })),

      editTransaction: (id, updates) =>
        set(state => ({
          transactions: state.transactions.map(t =>
            t.id === id ? { ...t, ...updates } : t
          ),
        })),

      deleteTransaction: (id) =>
        set(state => ({
          transactions: state.transactions.filter(t => t.id !== id),
        })),

      deleteAllTransactions: () => set({ transactions: [] }),

      bulkDeleteTransactions: (ids) =>
        set(state => ({
          transactions: state.transactions.filter(t => !ids.includes(t.id)),
        })),

      bulkUpdateCategory: (ids, category) =>
        set(state => ({
          transactions: state.transactions.map(t =>
            ids.includes(t.id) ? { ...t, category } : t
          ),
        })),

      updateFilters: (newFilters) =>
        set(state => ({
          filters: { ...state.filters, ...newFilters },
        })),

      setRole: (role) => set({ role }),

      setSelectedMetric: (metric) => set({ selectedMetric: metric }),

      setTimeFilter: (timeFilter) => set({ timeFilter }),

      setTheme: (theme) => set({ theme }),

      openModal: (transaction = null) => set({ isModalOpen: true, editingTransaction: transaction }),
      
      closeModal: () => set({ isModalOpen: false, editingTransaction: null }),
    }),
    {
      name: 'finance-dashboard',
      partialize: (state) => ({
        transactions: state.transactions,
        role: state.role,
        theme: state.theme,
      }),
    }
  )
)

export default useStore