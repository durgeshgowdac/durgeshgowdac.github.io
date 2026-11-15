'use client'
import { useEffect, useRef, useState } from 'react'
import { HERO_SLOT, registerHeroStep } from '@/app/components/heroSequence'

// Read after "AI/ML Engineer —". One idea each: vision, language, retrieval, re-ID, GenAI, data, embeddings, shipping, on-device speech.
const WORDS = [
  'Turning noisy data into decisions',
  'Re-identifying people, politely',
  'Teaching models to read the fine print',
  'Latency budgets, honored',
  'Narrating screen recordings, locally',
  'Fewer hallucinations, more citations',
  'Embeddings with good manners',
  'Making pipelines boring, on purpose',
  'Shipping models, not slideware',
]

export default function RotatingWord() {
  const [idx, setIdx] = useState(0)
  const [cls, setCls] = useState('')
  const alive = useRef(true)

  useEffect(() => {
    alive.current = true
    // Auto-changing text is skipped for visitors who asked for reduced motion.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const wait = (ms: number) => new Promise<void>(res => setTimeout(res, ms))
    // one change, on this line's turn (see heroSequence): out, swap, in
    const unregister = registerHeroStep(HERO_SLOT.word, async () => {
      if (!alive.current) return
      setCls('word-out')
      await wait(340)
      if (!alive.current) return
      setIdx(i => (i + 1) % WORDS.length)
      setCls('word-in')
      await wait(400)
      if (alive.current) setCls('')
    })
    return () => { alive.current = false; unregister() }
  }, [])

  return <span className={`rotating-word ${cls}`}>{WORDS[idx]}</span>
}