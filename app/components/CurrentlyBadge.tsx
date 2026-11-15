'use client'
import { useEffect, useRef, useState } from 'react'
import { HERO_SLOT, registerHeroStep } from '@/app/components/heroSequence'

// A small personality moment — what the day-to-day of an ML engineer actually looks like, told with a straight face.
const CURRENTLY = [
  'convincing a loss curve to behave',
  'negotiating with a GPU over VRAM',
  'teaching a retriever to cite its sources',
  'debugging a pipeline that worked perfectly yesterday',
  'watching sports with a glass of chocolate milk',
  'reading a 40-page paper for the one equation that matters',
  'waiting on a FAISS index to rebuild (character-building)',
  'arguing with a threshold, and losing',
  'skimming papers, results table first',
]
export default function CurrentlyBadge() {
  const [idx, setIdx] = useState(0)
  const [cls, setCls] = useState('')
  const alive = useRef(true)

  useEffect(() => {
    alive.current = true
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const wait = (ms: number) => new Promise<void>(res => setTimeout(res, ms))
    // one change, on this line's turn (see heroSequence)
    const unregister = registerHeroStep(HERO_SLOT.badge, async () => {
      if (!alive.current) return
      setCls('word-out')
      await wait(340)
      if (!alive.current) return
      setIdx(i => (i + 1) % CURRENTLY.length)
      setCls('word-in')
      await wait(400)
      if (alive.current) setCls('')
    })
    return () => { alive.current = false; unregister() }
  }, [])

  return (
      <div className="currently-badge">
        <span className="status-dot" aria-hidden="true" />
        <span>
        currently:{' '}
          {/* every phrase sits in the same grid cell and only the current one is shown, so the badge is always as wide and as tall as the longest phrase:
            the shape never changes when the text does */}
          <span className="currently-slot">
          {CURRENTLY.map((t, i) => (
              <span key={t} className={`rotating-word currently-item${i === idx ? ` is-active ${cls}` : ''}`} aria-hidden={i !== idx}>{t}</span>
          ))}
        </span>
      </span>
      </div>
  )
}