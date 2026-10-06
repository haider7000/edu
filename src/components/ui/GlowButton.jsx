import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

export function GlowButton({ children, variant = 'primary', size = 'md', className, icon: Icon, ...props }) {
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-light shadow-glow hover:shadow-glow-strong',
    secondary: 'bg-white/5 text-white hover:bg-white/10 border border-white/10 hover:border-white/20',
    accent: 'bg-accent/20 text-accent hover:bg-accent/30 border border-accent/30',
    outline: 'bg-transparent text-white border border-white/20 hover:border-white/40 hover:bg-white/5',
    ghost: 'bg-transparent text-text-secondary hover:text-white hover:bg-white/5',
  }
  const sizes = { sm: 'px-4 py-2 text-sm', md: 'px-6 py-3 text-sm', lg: 'px-8 py-4 text-base', xl: 'px-10 py-5 text-lg' }

  return (
    <motion.button
      className={cn(
        'relative inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-300 overflow-hidden group',
        variants[variant], sizes[size], className
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      <span className="relative z-10">{children}</span>
      {Icon && <Icon className="w-4 h-4 relative z-10" />}
      {variant === 'primary' && (
        <div className="absolute inset-0 bg-gradient-to-r from-primary-light to-accent opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
      )}
    </motion.button>
  )
}