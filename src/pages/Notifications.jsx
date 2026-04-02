// pages/Notifications.jsx
import { motion } from 'framer-motion'
import { Bell, CheckCircle2 } from 'lucide-react'

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

export default function Notifications() {
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
        <h1 className="text-2xl font-bold text-white">Notifications</h1>
        <p className="text-text-secondary text-sm mt-1">
          Stay updated with your financial activity
        </p>
      </div>

      {/* Coming Soon Card */}
      <div className="glass-card rounded-xl border border-white/[0.06] overflow-hidden">
        {/* Top accent */}
        <div
          className="h-[2px]"
          style={{ background: 'linear-gradient(90deg, #427CF0, #855CD6, #22C38E)' }}
        />

        <div className="flex flex-col items-center justify-center py-20 px-6">
          {/* Icon */}
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Bell size={32} className="text-primary" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-success/15 border border-success/20 flex items-center justify-center">
              <CheckCircle2 size={16} className="text-success" />
            </div>
          </div>

          {/* Text */}
          <h2 className="text-white text-lg font-bold mb-2">
            Notifications feature coming soon
          </h2>
          <p className="text-text-muted text-sm text-center max-w-sm leading-relaxed">
            You're all caught up! This section will show transaction alerts, budget warnings, and financial milestones.
          </p>

          {/* Decorative empty state indicators */}
          <div className="mt-10 w-full max-w-md space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]"
                style={{ opacity: 1 - i * 0.25 }}
              >
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 rounded-full bg-white/[0.04]" style={{ width: `${80 - i * 15}%` }} />
                  <div className="h-2 rounded-full bg-white/[0.03]" style={{ width: `${60 - i * 10}%` }} />
                </div>
                <div className="h-3 w-12 rounded-full bg-white/[0.03]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
