import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  X, ArrowDownLeft, ArrowUpRight,
  UtensilsCrossed, Car, ShoppingBag, Receipt, Gamepad2,
  Briefcase, Laptop, Calendar, FileText, IndianRupee,
  Check, Sparkles
} from 'lucide-react'
import { CATEGORY_COLORS } from '../data/mockData'
import Button from './ui/Button'

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

export default function TransactionModal({ isOpen, onClose, onSubmit, editData }) {
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    amount: '',
    category: 'Food',
    type: 'expense',
    description: '',
  })
  const [errors, setErrors] = useState({})
  const [submitAnim, setSubmitAnim] = useState(false)
  const amountRef = useRef(null)
  const [shouldRender, setShouldRender] = useState(false)

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
    } else {
      setForm({
        date: new Date().toISOString().slice(0, 10),
        amount: '',
        category: 'Food',
        type: 'expense',
        description: '',
      })
    }
    setErrors({})
    setSubmitAnim(false)
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

  const validate = () => {
    const newErrors = {}
    if (!form.date) {
      newErrors.date = 'Date is required'
    } else {
      const today = new Date().toISOString().slice(0, 10)
      if (form.date > today) {
        newErrors.date = 'Future dates not allowed'
      }
    }
    if (!form.amount || Number(form.amount) <= 0) {
      newErrors.amount = 'Enter a valid amount (> ₹0)'
    } else if (Number(form.amount) > 10000000) {
      newErrors.amount = 'Amount exceeds maximum (₹1,00,00,000)'
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
    if (!validate()) return

    setSubmitAnim(true)
    setTimeout(() => {
      onSubmit({
        ...form,
        amount: Number(form.amount),
      })
      setSubmitAnim(false)
      onClose()
    }, 400)
  }

  const handleTypeSwitch = (type) => {
    const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES
    setForm(f => ({ ...f, type, category: categories[0] }))
  }

  // Prevent negative input at HTML level
  const handleAmountChange = (e) => {
    const val = e.target.value
    // Only allow positive numbers
    if (val === '' || Number(val) >= 0) {
      setForm(f => ({ ...f, amount: val }))
    }
  }

  const activeCategories = form.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES

  if (!shouldRender) return null

  const accentColor = form.type === 'expense' ? '#EF4444' : '#22C38E'
  const accentSecondary = form.type === 'expense' ? '#F59E0B' : '#427CF0'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isOpen ? 1 : 0 }}
      transition={{ duration: 0.25 }}
      onAnimationComplete={handleAnimationComplete}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 sm:p-8"
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
          className="relative overflow-hidden rounded-2xl"
          style={{
            background: 'linear-gradient(145deg, rgba(20, 26, 42, 0.97), rgba(11, 17, 30, 0.98))',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5), 0 0 80px rgba(66, 124, 240, 0.08)',
          }}
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
                  <h2 className="text-lg font-semibold text-white">
                    {editData ? 'Edit Transaction' : 'New Transaction'}
                  </h2>
                  <p className="text-xs text-text-muted">
                    {editData ? 'Update the details below' : 'Fill in the details below'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-white hover:bg-white/10 transition-all duration-200"
                aria-label="Close modal"
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
                      type="number"
                      value={form.amount}
                      onChange={handleAmountChange}
                      placeholder="0.00"
                      min="1"
                      max="10000000"
                      step="0.01"
                      required
                      aria-invalid={!!errors.amount}
                      aria-describedby={errors.amount ? 'amount-error' : undefined}
                      className="flex-1 bg-transparent text-2xl font-bold text-white py-4 px-2 focus:outline-none placeholder:text-white/15 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
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
                        onClick={() => setForm(f => ({ ...f, category: cat }))}
                        className="relative flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl text-xs font-medium transition-all duration-200 group"
                        style={{
                          background: isSelected ? `${catColor}12` : 'rgba(255, 255, 255, 0.03)',
                          border: isSelected
                            ? `1px solid ${catColor}40`
                            : '1px solid rgba(255, 255, 255, 0.06)',
                          color: isSelected ? catColor : 'var(--text-secondary)',
                        }}
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
                          style={{
                            background: isSelected ? `${catColor}20` : 'rgba(255, 255, 255, 0.05)',
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
                        className="flex-1 bg-transparent text-sm text-white py-3 px-2 focus:outline-none [color-scheme:dark]"
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
                        className="flex-1 bg-transparent text-sm text-white py-3 px-2 focus:outline-none placeholder:text-white/20"
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
