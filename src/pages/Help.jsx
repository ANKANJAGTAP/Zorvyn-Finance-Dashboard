// pages/Help.jsx
import { motion } from 'framer-motion'
import { HelpCircle, MessageCircle, BookOpen, Mail } from 'lucide-react'

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

const helpItems = [
  {
    icon: BookOpen,
    label: 'Documentation',
    description: 'Browse guides and tutorials',
    color: '#427CF0',
  },
  {
    icon: MessageCircle,
    label: 'Live Chat',
    description: 'Chat with our support team',
    color: '#22C38E',
  },
  {
    icon: Mail,
    label: 'Email Support',
    description: 'Get help via email within 24h',
    color: '#855CD6',
  },
]

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
}

export default function Help() {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Help & Support</h1>
        <p className="text-text-secondary text-sm mt-1">
          Get assistance and find answers
        </p>
      </div>

      {/* Under Development Banner */}
      <div className="glass-card rounded-xl border border-white/[0.06] overflow-hidden">
        <div
          className="h-[2px]"
          style={{ background: 'linear-gradient(90deg, #427CF0, #855CD6, #22C38E)' }}
        />

        <div className="flex flex-col items-center justify-center py-12 px-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
            <HelpCircle size={28} className="text-primary" />
          </div>
          <h2 className="text-white text-lg font-bold mb-2">
            Help center is under development
          </h2>
          <p className="text-text-muted text-sm text-center max-w-md leading-relaxed">
            We're building a comprehensive help center with documentation, FAQs, and live support channels.
          </p>
        </div>
      </div>

      {/* Support Channel Preview Cards */}
      <motion.div
        variants={stagger}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        {helpItems.map((item) => {
          const Icon = item.icon
          return (
            <motion.div
              key={item.label}
              variants={fadeUp}
              className="group relative overflow-hidden rounded-xl border border-white/[0.06] hover:border-white/[0.12] transition-all duration-200 cursor-default"
              style={{
                backgroundImage: `linear-gradient(to bottom right, ${item.color}08, ${item.color}02)`,
              }}
            >
              <div className="p-5 flex flex-col items-center text-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center border"
                  style={{
                    backgroundColor: `${item.color}15`,
                    borderColor: `${item.color}25`,
                  }}
                >
                  <Icon size={20} style={{ color: item.color }} />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold mb-1">{item.label}</p>
                  <p className="text-text-muted text-xs leading-relaxed">{item.description}</p>
                </div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-text-muted/50 bg-white/[0.04] px-2 py-1 rounded-md">
                  Coming soon
                </span>
              </div>
            </motion.div>
          )
        })}
      </motion.div>
    </motion.div>
  )
}
