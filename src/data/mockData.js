import { generateId } from '../utils/formatters'

const CATEGORIES = {
  expense: ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment'],
  income: ['Salary', 'Freelance'],
}

const DESCRIPTIONS = {
  Food: ['Grocery Store', 'Restaurant Dinner', 'Cafe Visit', 'Street Food', 'Online Food Order', 'Bakery Purchase'],
  Transport: ['Uber Ride', 'Metro Pass', 'Fuel Station', 'Bus Ticket', 'Auto Rickshaw', 'Train Ticket'],
  Shopping: ['Amazon Order', 'Clothing Store', 'Electronics Purchase', 'Home Decor', 'Book Store', 'Shoes'],
  Bills: ['Electricity Bill', 'Internet Bill', 'Phone Recharge', 'Water Bill', 'Gas Bill', 'Rent Payment'],
  Entertainment: ['Netflix Subscription', 'Movie Tickets', 'Concert Pass', 'Gaming Purchase', 'Spotify Premium', 'OTT Subscription'],
  Salary: ['Monthly Salary', 'Bonus Payment', 'Performance Incentive'],
  Freelance: ['Web Development Project', 'Design Consultation', 'Content Writing', 'Consulting Fee'],
}

const STATUSES = ['completed', 'completed', 'completed', 'completed', 'pending'] // 80% completed, 20% pending

let seed = 42
function random() {
  const x = Math.sin(seed++) * 10000
  return x - Math.floor(x)
}

function randomBetween(min, max) {
  return Math.floor(random() * (max - min + 1)) + min
}

function randomDate(startDate, endDate) {
  const start = new Date(startDate).getTime()
  const end = new Date(endDate).getTime()
  const randomTime = start + random() * (end - start)
  return new Date(randomTime).toISOString().slice(0, 10)
}

function generateTransactions() {
  const transactions = []
  const now = new Date()
  const threeMonthsAgo = new Date(now)
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)

  const startDate = threeMonthsAgo.toISOString().slice(0, 10)
  const endDate = now.toISOString().slice(0, 10)

  // Generate 70 transactions (70% expense, 30% income = ~49 expense, ~21 income)
  const totalCount = 70

  for (let i = 0; i < totalCount; i++) {
    const isIncome = i < Math.floor(totalCount * 0.3)
    const type = isIncome ? 'income' : 'expense'
    const categoryList = CATEGORIES[type]
    const category = categoryList[randomBetween(0, categoryList.length - 1)]
    const descList = DESCRIPTIONS[category]
    const description = descList[randomBetween(0, descList.length - 1)]

    let amount
    if (type === 'income') {
      if (category === 'Salary') {
        amount = randomBetween(45000, 85000)
      } else {
        amount = randomBetween(5000, 25000)
      }
    } else {
      switch (category) {
        case 'Food':
          amount = randomBetween(100, 3500)
          break
        case 'Transport':
          amount = randomBetween(50, 2000)
          break
        case 'Shopping':
          amount = randomBetween(500, 8000)
          break
        case 'Bills':
          amount = randomBetween(500, 15000)
          break
        case 'Entertainment':
          amount = randomBetween(100, 2500)
          break
        default:
          amount = randomBetween(100, 5000)
      }
    }

    transactions.push({
      id: generateId() + i,
      date: randomDate(startDate, endDate),
      description,
      category,
      amount,
      type,
      status: STATUSES[randomBetween(0, STATUSES.length - 1)],
    })
  }

  // Sort by date (newest first)
  transactions.sort((a, b) => new Date(b.date) - new Date(a.date))

  return transactions
}

export const mockTransactions = generateTransactions()

export const CATEGORY_ICONS = {
  Food: 'UtensilsCrossed',
  Transport: 'Car',
  Shopping: 'ShoppingBag',
  Bills: 'Receipt',
  Entertainment: 'Gamepad2',
  Salary: 'Briefcase',
  Freelance: 'Laptop',
}

export const CATEGORY_COLORS = {
  Food: '#427CF0',
  Transport: '#855CD6',
  Shopping: '#22C38E',
  Bills: '#EF4444',
  Entertainment: '#F59E0B',
  Salary: '#427CF0',
  Freelance: '#22C38E',
}

export const ALL_CATEGORIES = [...CATEGORIES.expense, ...CATEGORIES.income]