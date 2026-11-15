'use client'
import { useEffect, useRef, type ReactNode } from 'react'

/**
 * Scroll-reveal wrapper: fades/slides its children in the first time they scroll into view.
 * The same idea the Work and About pages use for their cards, as one reusable piece — the project pages
 * only had it on the numbered sections, so the results strip, demo, contact strip and prev/next cards
 * just appeared. CSS lives under `.reveal` in styles/project-detail.css (and is switched off for reduced-motion / no-JS).
 */
export default function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!('IntersectionObserver' in window)) { el.classList.add('is-in'); return }
    const io = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) { el.classList.add('is-in'); io.disconnect() }
    }, { threshold: 0.08 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={ref} className={`reveal ${className}`.trim()} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </div>
  )
}
