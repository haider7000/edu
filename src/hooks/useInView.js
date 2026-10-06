import { useState, useEffect, useRef } from 'react'

export function useInView(options = {}) {
  const [isInView, setIsInView] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          if (options.once !== false) observer.disconnect()
        } else if (options.once === false) setIsInView(false)
      },
      { threshold: options.threshold || 0.1, rootMargin: options.rootMargin || '0px' }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [options.threshold, options.rootMargin, options.once])
  return [ref, isInView]
}