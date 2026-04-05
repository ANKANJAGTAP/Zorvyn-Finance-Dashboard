import { motion } from 'framer-motion'
import useStore from '../../store/useStore'

export default function DynamicBackground() {
  const theme = useStore(s => s.theme)

  // Using CSS vars for orb colors ensures they blend in both Light and Dark mode optimally.
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-bg-main transition-colors duration-500">
      
      {/* ─── Ambient Breathing Orbs ─── */}
      <div className="absolute inset-0 opacity-[0.6] dark:opacity-[0.8] mix-blend-screen dark:mix-blend-normal">
        {/* Primary Blue Orb */}
        <motion.div
          animate={{
            y: [0, -40, 0],
            x: [0, 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] md:w-[50vw] md:h-[50vw] rounded-full blur-[100px] md:blur-[140px]"
          style={{ background: 'radial-gradient(circle, rgba(66, 124, 240, 0.15) 0%, transparent 70%)' }}
        />

        {/* Accent Purple Orb */}
        <motion.div
          animate={{
            y: [0, 50, 0],
            x: [0, -40, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute top-[40%] right-[0%] w-[60vw] h-[60vw] md:w-[40vw] md:h-[40vw] rounded-full blur-[100px] md:blur-[140px]"
          style={{ background: 'radial-gradient(circle, rgba(133, 92, 214, 0.12) 0%, transparent 70%)' }}
        />
        
        {/* Accent Green Orb (Subtle bottom layer) */}
        <motion.div
          animate={{
            y: [0, -30, 0],
            x: [0, 50, 0],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 5
          }}
          className="absolute -bottom-[10%] left-[20%] w-[50vw] h-[50vw] md:w-[35vw] md:h-[35vw] rounded-full blur-[100px] md:blur-[120px]"
          style={{ background: 'radial-gradient(circle, rgba(34, 195, 142, 0.08) 0%, transparent 70%)' }}
        />
      </div>

      {/* ─── Structural Dot Grid ─── */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.25] dark:opacity-[0.15]"
        style={{
          backgroundImage: `radial-gradient(rgb(var(--text-muted)) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
          maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 20%, transparent 80%)'
        }}
      />
      
      {/* ─── Base Dimmer Overlay for readability ─── */}
      <div className="absolute inset-0 bg-bg-main/20 backdrop-blur-[1px]" />
    </div>
  )
}
