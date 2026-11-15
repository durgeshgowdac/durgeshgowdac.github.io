'use client'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Hiker, Rocket } from '@/app/components/scenery/illustrations'

/**
 * The story's spine — and, now that the native scrollbar is hidden, the page's
 * scroll indicator. A slim rail on the right edge of wide screens: a hiker
 * (Nature) / rocket (Space) travels down it as you scroll, and each
 * <ChapterBadge> (or any element with a data-rail attribute, e.g. the project-page sections) becomes a stop (hover for its name, click to jump).
 * Below 1100px the rail would crowd the content and is hidden; the site's
 * top reading-progress bar (<ProgressBar/>) covers those widths.
 *
 * In Space mode the rocket points the way you're scrolling (down → nose down, up → nose up).
 *
 * Smoothness: scrolling never touches React state. The traveller and fill are
 * moved with transforms only (compositor-driven, no layout) and eased toward
 * the real scroll position in a requestAnimationFrame loop, so they glide
 * instead of stepping with the wheel. React re-renders only when the active
 * chapter changes.
 */
type Stop = { top: number; n: string; nature: string; space: string }

/** Empty margin (px) around the track inside the rail's box — it only gives the chapter labels room.
 *  The visible line, the fill and the chapter dots all run from the first dot to the last dot; nothing
 *  is drawn above the first dot or below the last. */
const RAIL_INSET = 20

export default function ScrollRail() {
  const pathname = usePathname()
  const [stops, setStops] = useState<Stop[]>([])
  const [active, setActive] = useState(0)
  // The rail is display:none below 1100px, so don't run the scroll/rAF/measure machinery there.
  const [wide, setWide] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1100px)')
    const on = () => setWide(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])

  const railRef = useRef<HTMLElement>(null)
  const fillRef = useRef<HTMLDivElement>(null)
  const travRef = useRef<HTMLDivElement>(null)
  const remeasure = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (!wide) { setStops(prev => (prev.length ? [] : prev)); return }
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0
    let target = 0          // where the page really is (0..1)
    let shown = 0           // where the indicator currently is (eased)
    let railH = 0
    let halfH = 15          // half the height of the traveller (rocket 15, hiker 17), measured below
    let list: Stop[] = []
    let activeIdx = -1

    const progress = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      return Math.min(1, Math.max(0, window.scrollY / max))
    }

    const paint = (p: number) => {
      // The line runs first dot → last dot. The traveller's CENTRE only travels the part of that line that
      // leaves room for half its own height at each end, so the whole figure always sits on the line:
      // no nose / tail / head ever pokes out past either end.
      const track = Math.max(0, railH - 2 * RAIL_INSET)
      const pos = RAIL_INSET + halfH + p * Math.max(0, track - 2 * halfH)   // px from the top of the rail box
      if (fillRef.current) fillRef.current.style.transform = `translateX(-50%) scaleY(${track ? Math.min(1, Math.max(0, (pos - RAIL_INSET) / track)) : 0})`
      if (travRef.current) travRef.current.style.transform = `translate3d(-50%, ${pos}px, 0) translateY(-50%)`
    }

    const pickActive = (p: number) => {
      let a = 0
      list.forEach((s, i) => { if (p >= s.top - 0.001) a = i })
      if (a !== activeIdx) { activeIdx = a; setActive(a) }
    }

    const tick = () => {
      raf = 0
      target = progress()
      const d = target - shown
      shown = reduce || Math.abs(d) < 0.0004 ? target : shown + d * 0.16   // ease toward the page
      paint(shown)
      pickActive(target)
      if (shown !== target) raf = requestAnimationFrame(tick)
    }
    const kick = () => { if (!raf) raf = requestAnimationFrame(tick) }

    // Space mode: the rocket noses the way you're scrolling — down while scrolling down, up while scrolling up —
    // and TURNS AROUND at each end of the page, because the only way left to go is back:
    //   top of the page    → it turns to point DOWN (the way you'll go next)
    //   bottom of the page → it turns to point UP   (the way back)
    // (A class toggle, not React state — the CSS does the turning. The hiker ignores it.)
    let lastY = window.scrollY
    const maxY = () => document.documentElement.scrollHeight - window.innerHeight
    const aim = (y: number, movedUp: boolean | null) => {
      const el = travRef.current
      if (!el) return
      if (y <= 4) el.classList.remove('is-up')
      else if (y >= maxY() - 4) el.classList.add('is-up')
      else if (movedUp !== null) el.classList.toggle('is-up', movedUp)
    }
    const onScroll = () => {
      const y = window.scrollY
      aim(y, Math.abs(y - lastY) > 1 ? y < lastY : null)
      lastY = y
      kick()
    }

    const measure = () => {
      railH = railRef.current?.clientHeight ?? 0
      halfH = (travRef.current?.offsetHeight ?? 30) / 2
      aim(window.scrollY, null)   // (re)apply the end-of-page rules, e.g. after a route change or a reload at the bottom
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      list = Array.from(document.querySelectorAll<HTMLElement>('.chapter-mark, [data-rail]')).map(m => ({
        top: Math.min(1, Math.max(0, (m.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.35) / max)),
        n: m.dataset.n || '',
        nature: m.dataset.nature || '',
        space: m.dataset.space || '',
      }))
      setStops(prev => (JSON.stringify(prev) === JSON.stringify(list) ? prev : list))   // no re-render if nothing moved
      activeIdx = -1
      shown = progress()
      paint(shown)
      pickActive(shown)
    }

    // Chapters mount with the route (and images/fonts shift layout): measure after paint, again shortly after, and on resize.
    const t1 = setTimeout(measure, 120)
    const t2 = setTimeout(measure, 900)
    const onResize = () => { measure(); kick() }
    // late layout shifts (video embeds, fonts, sections fading in) change the page height → re-measure
    let moT: ReturnType<typeof setTimeout>
    const ro = new ResizeObserver(() => { clearTimeout(moT); moT = setTimeout(() => { measure(); kick() }, 150) })
    ro.observe(document.body)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    remeasure.current = () => { measure(); kick() }
    measure()
    return () => {
      remeasure.current = null
      clearTimeout(t1); clearTimeout(t2); clearTimeout(moT); ro.disconnect(); cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [pathname, wide])

  // The traveller only exists once the rail has its stops. Place + aim it the moment it mounts — otherwise it sits at the
  // very top of the rail (above the first dot, nose up) until the next timed measure.
  const railReady = stops.length >= 2
  useLayoutEffect(() => { if (railReady) remeasure.current?.() }, [railReady])

  const jump = (top: number) => {
    const max = document.documentElement.scrollHeight - window.innerHeight
    window.scrollTo({ top: top * max, behavior: 'smooth' })
  }

  return (
    <>
      {stops.length >= 2 && (
        <nav ref={railRef} className="journey-rail" aria-label="Story progress" style={{ ['--rail-inset' as string]: `${RAIL_INSET}px` }}>
          <div className="journey-line" />
          <div ref={fillRef} className="journey-fill" />
          {stops.map((s, i) => (
            <button
              key={i}
              className={`journey-stop${i <= active ? ' is-reached' : ''}${i === active ? ' is-active' : ''}`}
              style={{ top: `calc(${RAIL_INSET}px + ${s.top} * (100% - ${2 * RAIL_INSET}px))` }}
              onClick={() => jump(s.top)}
              aria-label={`Chapter ${s.n}: ${s.nature} / ${s.space}`}
            >
              <span className="journey-dot" />
              <span className="journey-label">
                <span className="t-nature">{s.nature}</span>
                <span className="t-space">{s.space}</span>
              </span>
            </button>
          ))}
          <div ref={travRef} className="journey-traveler" aria-hidden="true" style={{ transform: `translate3d(-50%, ${RAIL_INSET + 19}px, 0) translateY(-50%)` }}>
            {/* the same hiker and rocket the scenes use (one illustration library) */}
            <svg className="t-nature" viewBox="-18 -50 38 54" width="28" height="40" style={{ color: 'var(--sc-line)' }}>
              <Hiker />
            </svg>
            <svg className="t-space" viewBox="-26 -92 52 128" width="15" height="37" style={{ color: 'var(--sc-line)' }}>
              <Rocket />
            </svg>
          </div>
        </nav>
      )}
    </>
  )
}
