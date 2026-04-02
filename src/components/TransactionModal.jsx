import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  X, ArrowDownLeft, ArrowUpRight,
  UtensilsCrossed, Car, ShoppingBag, Receipt, Gamepad2,
  Briefcase, Laptop, Calendar, FileText, IndianRupee,
  Check, Sparkles
} from 'lucide-react'
import { CATEGORY_COLORS } from '../data/mockData'

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

  const validate = () => {
    const newErrors = {}
    if (!form.date) newErrors.date = 'Date is required'
    if (!form.amount || Number(form.amount) <= 0) newErrors.amount = 'Enter a valid amount'
    if (!form.category) newErrors.category = 'Pick a category'
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

  const activeCategories = form.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES

  if (!shouldRender) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isOpen ? 1 : 0 }}
      transition={{ duration: 0.25 }}
      onAnimationComplete={handleAnimationComplete}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto"
      style={{
        background: 'radial-gradient(ellipse at center, rgba(66, 124, 240, 0.08), rgba(0,0,0,0.7))',
        backdropFilter: 'blur(8px)',
        padding: '2rem 1rem',
        pointerEvents: isOpen ? 'auto' : 'none',
      }}
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
                  background: form.type === 'expense'
                    ? 'linear-gradient(90deg, #EF4444, #F59E0B, #EF4444)'
                    : 'linear-gradient(90deg, #22C38E, #427CF0, #22C38E)',
                }}
              />

              {/* Background glow */}
              <div
                className="absolute -top-20 -right-20 w-40 h-40 rounded-full pointer-events-none"
                style={{
                  background: form.type === 'expense'
                    ? 'radial-gradient(circle, rgba(239, 68, 68, 0.1), transparent 70%)'
                    : 'radial-gradient(circle, rgba(34, 195, 142, 0.1), transparent 70%)',
                }}
              />

              <div className="relative p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{
                        background: form.type === 'expense'
                          ? 'rgba(239, 68, 68, 0.1)'
                          : 'rgba(34, 195, 142, 0.1)',
                        border: `1px solid ${form.type === 'expense'
                          ? 'rgba(239, 68, 68, 0.2)'
                          : 'rgba(34, 195, 142, 0.2)'}`,
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
                  >
                    <X size={16} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Type Toggle */}
                  <div
                    className="flex gap-1.5 p-1.5 rounded-xl"
                    style={{ background: 'rgba(255, 255, 255, 0.04)' }}
                  >
                    {[
                      { key: 'expense', label: 'Expense', icon: ArrowDownLeft, color: '#EF4444' },
                      { key: 'income', label: 'Income', icon: ArrowUpRight, color: '#22C38E' },
                    ].map(({ key, label, icon: Icon, color }) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleTypeSwitch(key)}
                        className="relative flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-300"
                        style={form.type === key ? {
                          background: `${color}15`,
                          color: color,
                          boxShadow: `0 0 20px ${color}15`,
                        } : {
                          color: 'var(--text-muted)',
                        }}
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
                    <label className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2 block">
                      Amount
                    </label>
                    <div
                      className="relative rounded-xl overflow-hidden transition-all duration-300"
                      style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: errors.amount
                          ? '1px solid rgba(239, 68, 68, 0.4)'
                          : '1px solid rgba(255, 255, 255, 0.08)',
                      }}
                    >
                      <div className="flex items-center">
                        <div className="flex items-center justify-center pl-4 pr-1">
                          <IndianRupee size={20} className="text-text-muted" />
                        </div>
                        <input
                          ref={amountRef}
                          type="number"
                          value={form.amount}
                          onChange={(e) => setForm(f => ({ ...f, amount: e.target.value }))}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          className="flex-1 bg-transparent text-2xl font-bold text-white py-4 px-2 focus:outline-none placeholder:text-white/15"
                          style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }}
                        />
                      </div>
                      <div
                        className="absolute bottom-0 left-0 right-0 h-[1px] transition-opacity duration-300"
                        style={{
                          background: form.type === 'expense'
                            ? 'linear-gradient(90deg, transparent, #EF4444, transparent)'
                            : 'linear-gradient(90deg, transparent, #22C38E, transparent)',
                          opacity: form.amount ? 1 : 0,
                        }}
                      />
                    </div>
                    {errors.amount && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-danger text-xs mt-1.5 flex items-center gap-1"
                      >
                        <span className="w-1 h-1 rounded-full bg-danger" />
                        {errors.amount}
                      </motion.p>
                    )}
                  </div>

                  {/* Category Grid */}
                  <div>
                    <label className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2 block">
                      Category
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {activeCategories.map(cat => {
                        const Icon = CATEGORY_ICONS[cat] || Receipt
                        const isSelected = form.category === cat
                        const catColor = CATEGORY_COLORS[cat] || '#427CF0'

                        return (
                          <button
                            key={cat}
                            type="button"
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
                      <label className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2 block">
                        Date
                      </label>
                      <div
                        className="relative rounded-xl overflow-hidden"
                        style={{
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: errors.date
                            ? '1px solid rgba(239, 68, 68, 0.4)'
                            : '1px solid rgba(255, 255, 255, 0.08)',
                        }}
                      >
                        <div className="flex items-center">
                          <div className="pl-3 pr-1">
                            <Calendar size={14} className="text-text-muted" />
                          </div>
                          <input
                            type="date"
                            value={form.date}
                            onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))}
                            className="flex-1 bg-transparent text-sm text-white py-3 px-2 focus:outline-none"
                            style={{ colorScheme: 'dark' }}
                          />
                        </div>
                      </div>
                      {errors.date && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-danger text-xs mt-1"
                        >
                          {errors.date}
                        </motion.p>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2 block">
                        Note <span className="opacity-50">(optional)</span>
                      </label>
                      <div
                        className="relative rounded-xl overflow-hidden"
                        style={{
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                        }}
                      >
                        <div className="flex items-center">
                          <div className="pl-3 pr-1">
                            <FileText size={14} className="text-text-muted" />
                          </div>
                          <input
                            type="text"
                            value={form.description}
                            onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                            placeholder="Add note..."
                            className="flex-1 bg-transparent text-sm text-white py-3 px-2 focus:outline-none placeholder:text-white/20"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    whileTap={{ scale: 0.97 }}
                    className="relative w-full py-3.5 rounded-xl text-white font-semibold text-sm overflow-hidden transition-all duration-300 group"
                    style={{
                      background: form.type === 'expense'
                        ? 'linear-gradient(135deg, #EF4444, #DC2626)'
                        : 'linear-gradient(135deg, #22C38E, #16A172)',
                      boxShadow: form.type === 'expense'
                        ? '0 4px 20px rgba(239, 68, 68, 0.25)'
                        : '0 4px 20px rgba(34, 195, 142, 0.25)',
                    }}
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
