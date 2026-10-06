import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

export function GlassCard({ children, className, hover = true, glow = false }) {
  return (
    <motion.div
      className={cn(
        'glass rounded-2xl p-6 transition-all duration-500',
        hover && 'hover:bg-white/[0.06] hover:border-white/15',
        glow && 'glow-border',
        className
      )}
      whileHover={hover ? { y: -4, scale: 1.01 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {children}
    </motion.div>
  )
}