import { useEffect, useRef, useState } from 'react'
import { useInView } from '../../hooks/useInView'

export function Counter({ end, suffix = '', prefix = '', duration = 2000, className }) {
  const [count, setCount] = useState(0)
  const [ref, isInView] = useInView({ threshold: 0.5 })
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (!isInView || hasAnimated.current) return
    hasAnimated.current = true
    const startTime = Date.now()
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * end))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [isInView, end, duration])

  return <span ref={ref} className={className}>{prefix}{count.toLocaleString()}{suffix}</span>
}