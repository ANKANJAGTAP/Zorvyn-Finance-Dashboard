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
      },
      role: 'admin',
      selectedMetric: 'balance',
      timeFilter: '30d',

      // ─── Derived Data (computed via getters) ──────
      getFilteredTransactions: () => {
        const { transactions, filters } = get()
        let filtered = [...transactions]

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

        // Category filter
        if (filters.category !== 'all') {
          filtered = filtered.filter(t => t.category === filters.category)
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
          .reduce((sum, t) => sum + t.amount, 0)
        const expense = transactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0)
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
          if (t.type === 'income') {
            dailyMap[t.date].income += t.amount
          } else {
            dailyMap[t.date].expense += t.amount
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
          categoryMap[t.category] += t.amount
        })

        const total = Object.values(categoryMap).reduce((sum, v) => sum + v, 0)

        return Object.entries(categoryMap).map(([name, value]) => ({
          name,
          value,
          percentage: total > 0 ? ((value / total) * 100).toFixed(1) : 0,
        }))
      },

      getInsights: () => {
        const { transactions } = get()
        const now = new Date()
        const thirtyDaysAgo = new Date(now)
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        const sixtyDaysAgo = new Date(now)
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)

        const currentMonth = transactions.filter(t => new Date(t.date) >= thirtyDaysAgo)
        const prevMonth = transactions.filter(
          t => new Date(t.date) >= sixtyDaysAgo && new Date(t.date) < thirtyDaysAgo
        )

        // Current month totals
        const currentIncome = currentMonth.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
        const currentExpense = currentMonth.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
        const prevExpense = prevMonth.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

        // Highest spending category
        const categoryTotals = {}
        currentMonth.filter(t => t.type === 'expense').forEach(t => {
          categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount
        })
        const totalExpense = Object.values(categoryTotals).reduce((s, v) => s + v, 0)
        const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]

        // Monthly comparison
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
          hasEnoughData: prevMonth.length > 0,
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

      updateFilters: (newFilters) =>
        set(state => ({
          filters: { ...state.filters, ...newFilters },
        })),

      setRole: (role) => set({ role }),

      setSelectedMetric: (metric) => set({ selectedMetric: metric }),

      setTimeFilter: (timeFilter) => set({ timeFilter }),
    }),
    {
      name: 'finance-dashboard',
      partialize: (state) => ({
        transactions: state.transactions,
        role: state.role,
      }),
    }
  )
)

export default useStore
