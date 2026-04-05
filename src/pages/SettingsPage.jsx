// pages/SettingsPage.jsx
import { motion } from 'framer-motion'
import { Settings, Palette, User, Shield, Monitor, Sun, Moon } from 'lucide-react'
import useStore from '../store/useStore'

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

const settingsSections = [
  {
    icon: User,
    label: 'Account',
    description: 'Profile, email, and personal info',
    color: '#427CF0',
  },
  {
    icon: Palette,
    label: 'Appearance',
    description: 'Theme, colors, and display preferences',
    color: '#855CD6',
  },
  {
    icon: Shield,
    label: 'Privacy & Security',
    description: 'Password, two-factor, and data settings',
    color: '#22C38E',
  },
  {
    icon: Monitor,
    label: 'Preferences',
    description: 'Currency, language, and notification preferences',
    color: '#F59E0B',
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

export default function SettingsPage() {
  const theme = useStore(s => s.theme)
  const setTheme = useStore(s => s.setTheme)

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
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-text-secondary text-sm mt-1">
          Manage your preferences and account
        </p>
      </div>

      {/* Under Development Banner */}
      <div className="glass-card rounded-xl border border-white/[0.06] overflow-hidden">
        <div
          className="h-[2px]"
          style={{ background: 'linear-gradient(90deg, #427CF0, #855CD6, #22C38E)' }}
        />

        <div className="flex flex-col items-center justify-center py-12 px-6">
          <div className="w-16 h-16 rounded-2xl bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center mb-5">
            <Settings size={28} className="text-accent-purple" />
          </div>
          <h2 className="text-white text-lg font-bold mb-2">
            Settings panel is under development
          </h2>
          <p className="text-text-muted text-sm text-center max-w-md leading-relaxed">
            This would include preferences, theme, and account settings. We're building a comprehensive settings experience.
          </p>
        </div>
      </div>

      {/* Preview Cards */}
      <motion.div
        variants={stagger}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        {settingsSections.map((section) => {
          const Icon = section.icon
          const isAppearance = section.label === 'Appearance'
          return (
            <motion.div
              key={section.label}
              variants={fadeUp}
              className={`relative overflow-hidden rounded-xl border border-white/[0.06] transition-all duration-200 ${
                !isAppearance ? 'group hover:border-white/[0.12] cursor-default' : ''
              }`}
              style={{
                backgroundImage: `linear-gradient(to bottom right, ${section.color}08, ${section.color}02)`,
              }}
            >
              <div className="p-5 flex flex-col gap-4">
                <div className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border"
                    style={{
                      backgroundColor: `${section.color}15`,
                      borderColor: `${section.color}25`,
                    }}
                  >
                    <Icon size={18} style={{ color: section.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold mb-1">{section.label}</p>
                    <p className="text-text-muted text-xs leading-relaxed">{section.description}</p>
                  </div>
                  {!isAppearance && (
                    <span className="text-[10px] uppercase tracking-wider font-bold text-text-muted/50 bg-white/[0.04] px-2 py-1 rounded-md flex-shrink-0">
                      Soon
                    </span>
                  )}
                </div>

                {isAppearance && (
                  <div className="mt-2 flex bg-white/[0.04] border border-white/[0.06] p-1 rounded-lg relative">
                    {/* Theme options */}
                    {['light', 'system', 'dark'].map((t) => {
                      const isActive = theme === t
                      return (
                        <button
                          key={t}
                          onClick={() => setTheme(t)}
                          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md transition-all duration-200 relative z-10 ${
                            isActive ? 'text-white' : 'text-text-muted hover:text-white/70'
                          }`}
                        >
                          {t === 'light' && <Sun size={14} />}
                          {t === 'system' && <Monitor size={14} />}
                          {t === 'dark' && <Moon size={14} />}
                          <span className="capitalize">{t}</span>
                          {isActive && (
                            <motion.div
                              layoutId="theme-active-pill"
                              className="absolute inset-0 bg-white/[0.08] shadow-sm rounded-md border border-white/[0.04] -z-10"
                              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            />
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </motion.div>
    </motion.div>
  )
}
