'use client'
import { useEffect, type RefObject } from 'react'

type Smil = SVGElement & { beginElement?: () => void; endElement?: () => void }

/**
 * Keeps a decorative scene cheap:
 *  - off-screen  → CSS animations paused (.is-offscreen) and SMIL timelines paused (svg.pauseAnimations)
 *  - theme       → the SMIL animations (hiker, rocket…) that live in the *hidden* world are ended, and
 *                  restarted when that world becomes the visible one. (CSS animations in the hidden
 *                  world are already paused by globals.css.)
 * Works on a wrapper element that contains <svg>s, or on an <svg> itself.
 */
export function useScenePlayback(ref: RefObject<Element | null>) {
  useEffect(() => {
    const root = ref.current
    if (!root) return
    const html = document.documentElement
    const stopped = new Set<Smil>()
    let onScreen = true

    const svgs = (): SVGSVGElement[] => {
      const nested = Array.from(root.querySelectorAll('svg')) as SVGSVGElement[]
      return root instanceof SVGSVGElement ? [root, ...nested] : nested
    }
    const smil = () => Array.from(root.querySelectorAll('animate, animateMotion, animateTransform')) as Smil[]
    const isDark = () => html.getAttribute('data-theme') === 'dark'

    const apply = () => {
      root.classList.toggle('is-offscreen', !onScreen)
      svgs().forEach(svg => {
        try { onScreen ? svg.unpauseAnimations() : svg.pauseAnimations() } catch { /* unsupported: CSS pause still applies */ }
      })
      const dark = isDark()
      smil().forEach(el => {
        const hiddenWorld = el.closest(dark ? '.scene-nature' : '.scene-space')
        const activeWorld = el.closest(dark ? '.scene-space' : '.scene-nature')
        try {
          if (hiddenWorld) { el.endElement?.(); stopped.add(el) }          // idempotent: safe to repeat
          else if (activeWorld && stopped.has(el)) { el.beginElement?.(); stopped.delete(el) }
        } catch { /* not yet active: nothing to end/begin */ }
      })
    }

    const io = new IntersectionObserver(
      ([entry]) => { onScreen = entry.isIntersecting; apply() },
      { rootMargin: '120px 0px' },
    )
    io.observe(root)
    const mo = new MutationObserver(apply)
    mo.observe(html, { attributes: true, attributeFilter: ['data-theme'] })
    apply()
    // the SMIL timeline may not have started on the very first call, so repeat once shortly after mount
    const late = setTimeout(apply, 400)

    return () => { io.disconnect(); mo.disconnect(); clearTimeout(late) }
  }, [ref])
}
