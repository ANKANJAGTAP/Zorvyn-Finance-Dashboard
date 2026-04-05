import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  X, ArrowDownLeft, ArrowUpRight,
  UtensilsCrossed, Car, ShoppingBag, Receipt, Gamepad2,
  Briefcase, Laptop, Calendar, FileText, IndianRupee,
  Check, Sparkles, Plus, Repeat
} from 'lucide-react'
import { CATEGORY_COLORS } from '../data/mockData'
import Button from './ui/Button'
import useFocusTrap from '../hooks/useFocusTrap'

const CATEGORY_ICONS = {
  Food: UtensilsCrossed,
  Transport: Car,
  Shopping: ShoppingBag,
  Bills: Receipt,
  Entertainment: Gamepad2,
  Salary: Briefcase,
  Freelance: Laptop,
}

const EXPENSE_CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment']
const INCOME_CATEGORIES = ['Salary', 'Freelance']

const SMART_CATEGORIES = {
  expense: {
    'uber': 'Transport', 'ola': 'Transport', 'train': 'Transport', 'flight': 'Transport', 'fuel': 'Transport', 'taxi': 'Transport',
    'zomato': 'Food', 'swiggy': 'Food', 'mcdonalds': 'Food', 'restaurant': 'Food', 'grocery': 'Food', 'coffee': 'Food',
    'amazon': 'Shopping', 'myntra': 'Shopping', 'flipkart': 'Shopping', 'clothes': 'Shopping',
    'netflix': 'Entertainment', 'movie': 'Entertainment', 'game': 'Entertainment', 'spotify': 'Entertainment',
    'electricity': 'Bills', 'wifi': 'Bills', 'rent': 'Bills', 'phone': 'Bills'
  },
  income: {
    'salary': 'Salary', 'bonus': 'Salary',
    'freelance': 'Freelance', 'project': 'Freelance', 'upwork': 'Freelance'
  }
}

export default function TransactionModal({ isOpen, onClose, onSubmit, editData }) {
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    amount: '',
    category: 'Food',
    type: 'expense',
    description: '',
  })
  const [displayAmount, setDisplayAmount] = useState('')
  const [userSelectedCategory, setUserSelectedCategory] = useState(false)
  const [customCategories, setCustomCategories] = useState({ expense: [], income: [] })
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [isRecurring, setIsRecurring] = useState(false)

  const [errors, setErrors] = useState({})
  const [submitAnim, setSubmitAnim] = useState(false)
  const amountRef = useRef(null)
  const modalRef = useRef(null)
  const [shouldRender, setShouldRender] = useState(false)

  // Trap focus when open
  useFocusTrap(modalRef, isOpen)

  useEffect(() => {
    if (isOpen) setShouldRender(true)
  }, [isOpen])

  const handleAnimationComplete = () => {
    if (!isOpen) setShouldRender(false)
  }

  useEffect(() => {
    if (editData) {
      setForm({
        date: editData.date,
        amount: editData.amount.toString(),
        category: editData.category,
        type: editData.type,
        description: editData.description || '',
      })
      setDisplayAmount(Number(editData.amount).toLocaleString('en-IN'))
      setIsRecurring(editData.isRecurring || false)
      setUserSelectedCategory(true)
    } else {
      setForm({
        date: new Date().toISOString().slice(0, 10),
        amount: '',
        category: 'Food',
        type: 'expense',
        description: '',
      })
      setDisplayAmount('')
      setIsRecurring(false)
      setUserSelectedCategory(false)
    }
    setErrors({})
    setSubmitAnim(false)
    setIsAddingCategory(false)
    setNewCategoryName('')
  }, [editData, isOpen])

  useEffect(() => {
    if (isOpen && amountRef.current) {
      setTimeout(() => amountRef.current?.focus(), 300)
    }
  }, [isOpen])

  // Keyboard: Escape to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Smart Default Categories
  useEffect(() => {
    if (!form.description || userSelectedCategory || editData) return
    const lowerDesc = form.description.toLowerCase()
    
    const rules = SMART_CATEGORIES[form.type]
    for (const [keyword, cat] of Object.entries(rules)) {
      if (lowerDesc.includes(keyword)) {
        setForm(f => ({ ...f, category: cat }))
        break
      }
    }
  }, [form.description, form.type, userSelectedCategory, editData])

  const validate = (amountToValidate = form.amount) => {
    const newErrors = {}
    if (!form.date) {
      newErrors.date = 'Date is required'
    } else {
      const today = new Date().toISOString().slice(0, 10)
      if (form.date > today) {
        newErrors.date = 'Future dates not allowed'
      }
    }
    const numAmount = Number(amountToValidate)
    if (!amountToValidate || isNaN(numAmount) || numAmount <= 0) {
      newErrors.amount = 'Enter a valid amount (> ₹0)'
    } else if (numAmount > 10000000) {
      newErrors.amount = 'Exceeds maximum (₹1,00,00,000)'
    }
    if (!form.category) newErrors.category = 'Pick a category'

    if (Object.keys(newErrors).length > 0) {
      toast.error('Please fix the errors below')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    let currentAmount = form.amount
    if (displayAmount) {
      let rawStr = displayAmount.toString().replace(/,/g, '')
      if (/[+\-*/]/.test(rawStr)) {
        const calculated = evaluateMath(rawStr)
        if (calculated) {
          currentAmount = calculated.toString()
          setForm(f => ({ ...f, amount: currentAmount }))
          setDisplayAmount(Number(calculated).toLocaleString('en-IN'))
        }
      } else {
        const num = Number(rawStr)
        if (!isNaN(num) && num > 0) {
          currentAmount = num.toString()
          setForm(f => ({ ...f, amount: currentAmount }))
          setDisplayAmount(num.toLocaleString('en-IN'))
        }
      }
    }

    if (!validate(currentAmount)) return

    setSubmitAnim(true)
    setTimeout(() => {
      onSubmit({
        ...form,
        amount: Number(currentAmount),
        isRecurring
      })
      setSubmitAnim(false)
      onClose()
    }, 400)
  }

  const handleTypeSwitch = (type) => {
    const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES
    setForm(f => ({ ...f, type, category: categories[0] }))
    setUserSelectedCategory(false)
  }

  const evaluateMath = (expr) => {
    try {
      if (!/^[0-9+\-*/. ]+$/.test(expr)) return null
      // eslint-disable-next-line no-new-func
      const result = new Function('return ' + expr)()
      if (isNaN(result) || result <= 0) return null
      return result
    } catch {
      return null
    }
  }

  const handleAmountBlur = () => {
    if (!displayAmount) return
    
    let rawStr = displayAmount.replace(/,/g, '')
    if (/[+\-*/]/.test(rawStr)) {
      const calculated = evaluateMath(rawStr)
      if (calculated) {
        setForm(f => ({ ...f, amount: calculated.toString() }))
        setDisplayAmount(Number(calculated).toLocaleString('en-IN'))
      } else {
        setDisplayAmount(form.amount ? Number(form.amount).toLocaleString('en-IN') : '')
      }
    } else {
      const num = Number(rawStr)
      if (!isNaN(num) && num > 0) {
        setForm(f => ({ ...f, amount: num.toString() }))
        setDisplayAmount(num.toLocaleString('en-IN'))
      }
    }
  }

  const handleAmountChange = (e) => {
    const val = e.target.value
    setDisplayAmount(val)
    
    const stripped = val.replace(/,/g, '')
    if (!/[+\-*/]/.test(stripped) && !isNaN(Number(stripped))) {
      setForm(f => ({ ...f, amount: stripped }))
    }
  }

  const handleAddCustomCategory = (e) => {
    if (e.key === 'Enter' || e.type === 'blur') {
      e.preventDefault()
      if (newCategoryName.trim()) {
        const catName = newCategoryName.trim()
        setCustomCategories(prev => ({
          ...prev,
          [form.type]: [...new Set([...prev[form.type], catName])]
        }))
        setForm(f => ({ ...f, category: catName }))
        setUserSelectedCategory(true)
      }
      setIsAddingCategory(false)
      setNewCategoryName('')
    }
  }

  const activeCategories = form.type === 'expense' 
    ? [...EXPENSE_CATEGORIES, ...customCategories.expense]
    : [...INCOME_CATEGORIES, ...customCategories.income]

  if (!shouldRender) return null

  const accentColor = form.type === 'expense' ? '#EF4444' : '#22C38E'
  const accentSecondary = form.type === 'expense' ? '#F59E0B' : '#427CF0'

  return (
    <motion.div
      ref={modalRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: isOpen ? 1 : 0 }}
      transition={{ duration: 0.25 }}
      onAnimationComplete={handleAnimationComplete}
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-4 sm:p-8"
      style={{
        background: 'radial-gradient(ellipse at center, rgba(66, 124, 240, 0.08), rgba(0,0,0,0.7))',
        backdropFilter: 'blur(8px)',
        pointerEvents: isOpen ? 'auto' : 'none',
      }}
      role="dialog"
      aria-modal="true"
      aria-label={editData ? 'Edit transaction' : 'Add new transaction'}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 30 }}
        animate={isOpen
          ? { opacity: 1, scale: 1, y: 0 }
          : { opacity: 0, scale: 0.92, y: 30 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="w-full max-w-[480px] my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="relative overflow-hidden rounded-2xl bg-bg-card border border-white/[0.08] shadow-[0_25px_60px_rgba(0,0,0,0.5),0_0_80px_rgba(66,124,240,0.08)]"
        >
          {/* Top accent line */}
          <div
            className="absolute top-0 left-0 right-0 h-[2px]"
            style={{
              background: `linear-gradient(90deg, ${accentColor}, ${accentSecondary}, ${accentColor})`,
            }}
          />

          {/* Background glow */}
          <div
            className="absolute -top-20 -right-20 w-40 h-40 rounded-full pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${accentColor}1A, transparent 70%)`,
            }}
          />

          <div className="relative p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: `${accentColor}1A`,
                    border: `1px solid ${accentColor}33`,
                  }}
                >
                  {form.type === 'expense'
                    ? <ArrowDownLeft size={18} className="text-danger" />
                    : <ArrowUpRight size={18} className="text-success" />
                  }
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[rgb(var(--text-primary))]">
                    {editData ? 'Edit Transaction' : 'New Transaction'}
                  </h2>
                  <p className="text-xs text-text-muted">
                    {editData ? 'Update the details below' : 'Fill in the details below'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close transaction modal"
                className="p-2 -mr-2 text-text-muted hover:text-white bg-white/[0.04] hover:bg-white/[0.08] rounded-xl transition-all"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Type Toggle */}
              <div className="flex gap-1.5 p-1.5 rounded-xl bg-white/[0.04]" role="radiogroup" aria-label="Transaction type">
                {[
                  { key: 'expense', label: 'Expense', icon: ArrowDownLeft, color: '#EF4444' },
                  { key: 'income', label: 'Income', icon: ArrowUpRight, color: '#22C38E' },
                ].map(({ key, label, icon: Icon, color }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleTypeSwitch(key)}
                    role="radio"
                    aria-checked={form.type === key}
                    className={`relative flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                      form.type === key ? '' : 'text-text-muted'
                    }`}
                    style={form.type === key ? {
                      background: `${color}15`,
                      color: color,
                      boxShadow: `0 0 20px ${color}15`,
                    } : {}}
                  >
                    <Icon size={15} />
                    {label}
                    {form.type === key && (
                      <motion.div
                        layoutId="type-indicator"
                        className="absolute inset-0 rounded-lg pointer-events-none"
                        style={{ border: `1px solid ${color}30` }}
                        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* Amount */}
              <div>
                <label htmlFor="amount-input" className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2 block">
                  Amount <span className="text-danger">*</span>
                </label>
                <div
                  className={`relative rounded-xl overflow-hidden transition-all duration-300 bg-white/[0.03] border ${
                    errors.amount ? 'border-danger/40' : 'border-white/[0.08]'
                  }`}
                >
                  <div className="flex items-center">
                    <div className="flex items-center justify-center pl-4 pr-1">
                      <IndianRupee size={20} className="text-text-muted" />
                    </div>
                    <input
                      id="amount-input"
                      ref={amountRef}
                      type="text"
                      inputMode="decimal"
                      value={displayAmount}
                      onChange={handleAmountChange}
                      onBlur={handleAmountBlur}
                      placeholder="e.g. 500 or 50*10"
                      required
                      aria-invalid={!!errors.amount}
                      aria-describedby={errors.amount ? 'amount-error' : undefined}
                      className="flex-1 bg-transparent text-2xl font-bold text-[rgb(var(--text-primary))] py-4 px-2 focus:outline-none placeholder:text-[rgba(var(--text-primary),0.15)] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                  </div>
                  <div
                    className="absolute bottom-0 left-0 right-0 h-[1px] transition-opacity duration-300"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
                      opacity: form.amount ? 1 : 0,
                    }}
                  />
                </div>
                {errors.amount && (
                  <motion.p
                    id="amount-error"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-danger text-xs mt-1.5 flex items-center gap-1"
                    role="alert"
                  >
                    <span className="w-1 h-1 rounded-full bg-danger" />
                    {errors.amount}
                  </motion.p>
                )}
              </div>

              {/* Category Grid */}
              <div>
                <label className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2 block">
                  Category <span className="text-danger">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Transaction category">
                  {activeCategories.map(cat => {
                    const Icon = CATEGORY_ICONS[cat] || Receipt
                    const isSelected = form.category === cat
                    const catColor = CATEGORY_COLORS[cat] || '#427CF0'

                    return (
                      <button
                        key={cat}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => { setForm(f => ({ ...f, category: cat })); setUserSelectedCategory(true); }}
                        className="relative flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl text-xs font-medium transition-all duration-200 group"
                        style={{
                          background: isSelected ? `${catColor}12` : 'rgb(var(--core-white) / 0.03)',
                          border: isSelected
                            ? `1px solid ${catColor}40`
                            : '1px solid rgb(var(--core-white) / 0.06)',
                          color: isSelected ? catColor : 'var(--text-secondary)',
                        }}
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
                          style={{
                            background: isSelected ? `${catColor}20` : 'rgb(var(--core-white) / 0.05)',
                          }}
                        >
                          <Icon size={15} />
                        </div>
                        {cat}
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                            style={{ background: catColor }}
                          >
                            <Check size={10} className="text-white" />
                          </motion.div>
                        )}
                      </button>
                    )
                  })}

                  {/* Add Custom Category Button */}
                  {isAddingCategory ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative flex items-center py-3 px-2 rounded-xl"
                      style={{ background: 'rgb(var(--core-white) / 0.05)', border: '1px solid rgb(var(--core-white) / 0.1)' }}
                    >
                      <input
                        autoFocus
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        onBlur={handleAddCustomCategory}
                        onKeyDown={handleAddCustomCategory}
                        placeholder="Name..."
                        className="w-full bg-transparent text-xs text-[rgb(var(--text-primary))] text-center focus:outline-none"
                      />
                    </motion.div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsAddingCategory(true)}
                      className="relative flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl text-xs font-medium transition-all duration-200 hover:bg-white/[0.05]"
                      style={{
                        border: '1px dashed rgb(var(--core-white) / 0.15)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/[0.02]">
                        <Plus size={15} />
                      </div>
                      Custom
                    </button>
                  )}
                </div>
              </div>

              {/* Date & Note Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="date-input" className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2 block">
                    Date <span className="text-danger">*</span>
                  </label>
                  <div
                    className={`relative rounded-xl overflow-hidden bg-white/[0.03] border ${
                      errors.date ? 'border-danger/40' : 'border-white/[0.08]'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="pl-3 pr-1">
                        <Calendar size={14} className="text-text-muted" />
                      </div>
                      <input
                        id="date-input"
                        type="date"
                        value={form.date}
                        max={new Date().toISOString().slice(0, 10)}
                        onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))}
                        required
                        aria-invalid={!!errors.date}
                        aria-describedby={errors.date ? 'date-error' : undefined}
                        className="flex-1 bg-transparent text-sm text-[rgb(var(--text-primary))] py-3 px-2 focus:outline-none [color-scheme:dark]"
                      />
                    </div>
                  </div>
                  {errors.date && (
                    <motion.p
                      id="date-error"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-danger text-xs mt-1"
                      role="alert"
                    >
                      {errors.date}
                    </motion.p>
                  )}
                </div>

                <div>
                  <label htmlFor="note-input" className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2 block">
                    Note <span className="text-text-muted/50">(optional)</span>
                  </label>
                  <div className="relative rounded-xl overflow-hidden bg-white/[0.03] border border-white/[0.08]">
                    <div className="flex items-center">
                      <div className="pl-3 pr-1">
                        <FileText size={14} className="text-text-muted" />
                      </div>
                      <input
                        id="note-input"
                        type="text"
                        value={form.description}
                        onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                        placeholder="Add note..."
                        maxLength={50}
                        className="flex-1 bg-transparent text-sm text-[rgb(var(--text-primary))] py-3 px-2 focus:outline-none placeholder:text-[rgba(var(--text-primary),0.2)]"
                      />
                    </div>
                  </div>
                  {form.description.length > 40 && (
                    <p className="text-text-muted text-xs mt-1 text-right">
                      {form.description.length}/50
                    </p>
                  )}
                </div>
              </div>

              {/* Recurring Toggle */}
              <div 
                className="flex items-center justify-between p-3 rounded-xl border border-white/[0.04] bg-white/[0.02] cursor-pointer hover:bg-white/[0.04] transition-colors"
                onClick={() => setIsRecurring(!isRecurring)}
                role="checkbox"
                aria-checked={isRecurring}
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsRecurring(!isRecurring); } }}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isRecurring ? 'bg-primary/20 text-primary' : 'bg-white/[0.05] text-text-muted'}`}>
                    <Repeat size={15} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[rgb(var(--text-primary))]">Recurring Transaction</p>
                    <p className="text-[10px] text-text-muted">Automatically repeat next month</p>
                  </div>
                </div>
                <div className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${isRecurring ? 'bg-primary' : 'bg-[rgba(var(--core-white),0.1)]'}`}>
                  <motion.div 
                    className="w-4 h-4 bg-white rounded-full shadow-sm"
                    layout
                    animate={{ x: isRecurring ? 16 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                whileTap={{ scale: 0.97 }}
                className={`relative w-full py-3.5 rounded-xl text-white font-semibold text-sm overflow-hidden transition-all duration-300 group ${
                  form.type === 'expense' ? 'btn-glow-red' : 'btn-glow-green'
                }`}
                style={{
                  background: form.type === 'expense'
                    ? 'linear-gradient(135deg, #EF4444, #DC2626)'
                    : 'linear-gradient(135deg, #22C38E, #16A172)',
                }}
                aria-label={editData ? 'Save changes' : `Add ${form.type}`}
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: form.type === 'expense'
                      ? 'linear-gradient(135deg, #F87171, #EF4444)'
                      : 'linear-gradient(135deg, #34D399, #22C38E)',
                  }}
                />
                <span className="relative flex items-center justify-center gap-2">
                  {submitAnim ? (
                    <motion.div
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', damping: 15 }}
                    >
                      <Check size={18} />
                    </motion.div>
                  ) : (
                    <>
                      <Sparkles size={15} />
                      {editData ? 'Save Changes' : form.type === 'expense' ? 'Add Expense' : 'Add Income'}
                    </>
                  )}
                </span>
              </motion.button>
            </form>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}