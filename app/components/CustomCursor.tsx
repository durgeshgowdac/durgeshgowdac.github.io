'use client'
import { useEffect, useRef } from 'react'

// Scoped to just project cards and the contact icons (LinkedIn/GitHub/mail) —
// not every link/button/input on the site.
const INTERACTIVE_SELECTOR = '.project-card, .social-links a'
const SNAP_PADDING = 6

export default function CustomCursor() {
  const dotRef   = useRef<HTMLDivElement>(null)
  const ringRef  = useRef<HTMLDivElement>(null)
  const mouse    = useRef({ x: 0, y: 0 })
  const ring     = useRef({ x: 0, y: 0 })
  const raf      = useRef<number>(0)
  const target   = useRef<HTMLElement | null>(null)

  useEffect(() => {
    // Touch / no-hover devices hide the cursor in CSS, so don't run the animation loop at all.
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Everything moves with `transform` (compositor-only) instead of left/top. The base CSS parks both
    // elements at left:0/top:0, so a position is just translate(x, y); in follow mode the extra
    // `- 50%` centres the element on that point whatever its current size is.
    const centre = (x: number, y: number) => `translate3d(calc(${x}px - 50%), calc(${y}px - 50%), 0)`
    let lastRing = { x: -1e4, y: -1e4 }
    let lastBox = { l: NaN, t: NaN, w: NaN, h: NaN }

    const root = document.documentElement
    const move = (e: MouseEvent) => {
      // Hide the system cursor only now that the custom one is about to be positioned.
      if (!root.classList.contains('has-custom-cursor')) root.classList.add('has-custom-cursor')
      mouse.current = { x: e.clientX, y: e.clientY }
      if (dotRef.current) dotRef.current.style.transform = centre(e.clientX, e.clientY)
      if (reduceMotion && ringRef.current && !target.current) {
        ringRef.current.style.transform = centre(e.clientX, e.clientY)
      }
    }

    // While snapped, the target's own rect is re-measured every animation frame (not just once on
    // hover-start) so the ring tracks it even while the card is mid-way through its own hover
    // transform (e.g. the lift on .project-card:hover). Styles are only written when something
    // actually changed, and the loop does no work at all while the ring is at rest.
    const tick = () => {
      const ringEl = ringRef.current
      if (ringEl && target.current) {
        const rect = target.current.getBoundingClientRect()
        const l = rect.left - SNAP_PADDING, t = rect.top - SNAP_PADDING
        const w = rect.width + SNAP_PADDING * 2, h = rect.height + SNAP_PADDING * 2
        if (l !== lastBox.l || t !== lastBox.t) ringEl.style.transform = `translate3d(${l}px, ${t}px, 0)`
        if (w !== lastBox.w || h !== lastBox.h) { ringEl.style.width = w + 'px'; ringEl.style.height = h + 'px' }
        lastBox = { l, t, w, h }
        lastRing = { x: -1e4, y: -1e4 }          // force a write when we leave snapped mode
      } else if (ringEl && !reduceMotion) {
        lastBox = { l: NaN, t: NaN, w: NaN, h: NaN }
        ring.current.x += (mouse.current.x - ring.current.x) * 0.11
        ring.current.y += (mouse.current.y - ring.current.y) * 0.11
        if (Math.abs(ring.current.x - lastRing.x) > 0.05 || Math.abs(ring.current.y - lastRing.y) > 0.05) {
          ringEl.style.transform = centre(ring.current.x, ring.current.y)
          lastRing = { x: ring.current.x, y: ring.current.y }
        }
      }
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)

    const onOver = (e: MouseEvent) => {
      const el = (e.target as HTMLElement)?.closest?.(INTERACTIVE_SELECTOR) as HTMLElement | null
      if (el && ringRef.current) {
        target.current = el
        const radius = getComputedStyle(el).borderRadius
        ringRef.current.style.borderRadius = radius === '0px' ? '10px' : radius
        ringRef.current.classList.add('is-snapped')
        document.body.classList.add('cursor-hover')
      }
    }
    const onOut = (e: MouseEvent) => {
      const related = e.relatedTarget as HTMLElement | null
      if (!related?.closest?.(INTERACTIVE_SELECTOR)) {
        target.current = null
        document.body.classList.remove('cursor-hover')
        if (ringRef.current) {
          ringRef.current.classList.remove('is-snapped')
          ringRef.current.style.width = ''
          ringRef.current.style.height = ''
          ringRef.current.style.borderRadius = ''
          lastBox = { l: NaN, t: NaN, w: NaN, h: NaN }
          // Hand off from wherever the ring currently sits, not the raw
          // mouse point, so it doesn't jump on release.
          const rect = ringRef.current.getBoundingClientRect()
          ring.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
        }
      }
    }

    window.addEventListener('mousemove', move)
    document.addEventListener('mouseover', onOver)
    document.addEventListener('mouseout', onOut)

    return () => {
      window.removeEventListener('mousemove', move)
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseout', onOut)
      cancelAnimationFrame(raf.current)
      root.classList.remove('has-custom-cursor')
    }
  }, [])

  return (
    <>
      <div className="cursor-dot"  ref={dotRef}  />
      <div className="cursor-ring" ref={ringRef} />
    </>
  )
}
