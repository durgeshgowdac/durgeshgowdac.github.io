'use client'
import { useEffect, useRef } from 'react'

/**
 * Reading-progress bar along the very top edge. Moves with a transform only and
 * eases toward the real scroll position each frame (no React re-render per
 * scroll event), so it glides in step with the journey rail on the right.
 *
 * Phones and tablets only: from 1100px up the journey rail shows progress instead, so the bar is hidden
 * (CSS) and, here, doesn't do any scroll work while it is.
 */
export default function ProgressBar() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const desktop = window.matchMedia('(min-width: 1100px)')   // keep in step with the .progress-bar rule in globals.css
    let raf = 0
    let shown = 0

    const target = () => {
      const el = document.documentElement
      const total = el.scrollHeight - el.clientHeight
      return total > 0 ? Math.min(1, Math.max(0, el.scrollTop / total)) : 0
    }
    const tick = () => {
      raf = 0
      const t = target()
      const d = t - shown
      shown = reduce || Math.abs(d) < 0.0004 ? t : shown + d * 0.2
      if (ref.current) ref.current.style.transform = `scaleX(${shown})`
      if (shown !== t) raf = requestAnimationFrame(tick)
    }
    const kick = () => { if (!raf && !desktop.matches) raf = requestAnimationFrame(tick) }

    shown = target()
    kick()
    window.addEventListener('scroll', kick, { passive: true })
    window.addEventListener('resize', kick)
    desktop.addEventListener('change', kick)
    return () => {
      desktop.removeEventListener('change', kick)
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', kick)
      window.removeEventListener('resize', kick)
    }
  }, [])

  return <div ref={ref} className="progress-bar" aria-hidden="true" />
}
