/**
 * Format amount in Indian Rupee format: ₹1,250.00
 * Single formatter for the entire app — consistency is key.
 */
export function formatAmount(amount) {
  const absAmount = Math.abs(amount)
  return '₹' + absAmount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/**
 * Format date to readable string
 */
export function formatDate(dateStr) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Export filtered transactions to CSV
 */
export function exportToCSV(transactions) {
  const headers = ['Date', 'Description', 'Category', 'Amount', 'Type']
  const rows = transactions.map(t => [
    formatDate(t.date),
    t.description || t.category,
    t.category,
    formatAmount(t.amount),
    t.type,
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  const today = new Date().toISOString().slice(0, 10)
  link.href = url
  link.download = `transactions_${today}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

/**
 * Generate unique ID
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}
