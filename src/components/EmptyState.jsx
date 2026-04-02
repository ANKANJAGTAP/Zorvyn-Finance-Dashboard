import { motion } from 'framer-motion'
import { Inbox, SearchX } from 'lucide-react'
import Button from './ui/Button'

const presets = {
  'no-data': {
    icon: Inbox,
    title: 'No data yet',
    description: 'Start tracking your finances by adding your first transaction.',
  },
  'no-results': {
    icon: SearchX,
    title: 'No results found',
    description: 'Try adjusting your filters or search term.',
  },
}

export default function EmptyState({
  variant = 'no-data',
  icon: CustomIcon,
  title: customTitle,
  description: customDescription,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
  className = '',
}) {
  const preset = presets[variant] || presets['no-data']
  const Icon = CustomIcon || preset.icon
  const title = customTitle || preset.title
  const description = customDescription || preset.description

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`flex flex-col items-center justify-center text-center py-12 px-6 ${className}`}
    >
      {/* Icon container */}
      <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-5">
        <Icon size={28} className="text-text-muted" />
      </div>

      {/* Title */}
      <h3 className="text-white font-semibold text-lg mb-1.5">
        {title}
      </h3>

      {/* Description */}
      <p className="text-text-muted text-sm max-w-[280px] leading-relaxed mb-5">
        {description}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {actionLabel && onAction && (
          <Button
            variant="primary"
            size="sm"
            onClick={onAction}
            aria-label={actionLabel}
          >
            {actionLabel}
          </Button>
        )}
        {secondaryLabel && onSecondary && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSecondary}
            aria-label={secondaryLabel}
          >
            {secondaryLabel}
          </Button>
        )}
      </div>
    </motion.div>
  )
}
