import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

export function SectionTitle({ label, title, description, align = 'center', className }) {
  const alignClass = { center: 'text-center', left: 'text-left', right: 'text-right' }
  return (
    <div className={cn('max-w-3xl mx-auto mb-16', alignClass[align], className)}>
      {label && (
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-primary/10 text-primary-light border border-primary/20 mb-6"
        >
          {label}
        </motion.span>
      )}
      {title && (
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
          className="text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight text-gradient mb-6"
        >
          {title}
        </motion.h2>
      )}
      {description && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-lg text-text-secondary leading-relaxed"
        >
          {description}
        </motion.p>
      )}
    </div>
  )
}