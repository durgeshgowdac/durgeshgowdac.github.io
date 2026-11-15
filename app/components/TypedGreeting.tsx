'use client'
import { useEffect, useState } from 'react'
import { HERO_SLOT, registerHeroStep } from '@/app/components/heroSequence'

/**
 * "> hello, world" — a tiny terminal greeting above the name. It types itself
 * out, then cycles through "hello, world" in the languages on the CV (Python,
 * C++, Java, Bash). The server (and reduced-motion users) just get the first
 * line, static, so it never flashes empty.
 */
const LINES = [
  'hello, world',
  'print("hello, world")',
  'std::cout << "hello, world\\n";',
  'System.out.println("hello, world");',
  'echo "hello, world"',
]

export default function TypedGreeting() {
  const [line, setLine] = useState(0)
  const [text, setText] = useState(LINES[0])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let cancelled = false
    const wait = (ms: number) => new Promise<void>(res => setTimeout(res, ms))
    let i = 0
    let first = true

    // One turn in the hero's sequence (see heroSequence): the first turn types the opening line out from nothing; each later turn
    // erases the line and types the next language. The turn ends when the typing has finished.
    const unregister = registerHeroStep(HERO_SLOT.greeting, async () => {
      if (cancelled) return
      if (first) {
        first = false
        setText('')
        await wait(500)
        for (let n = 1; n <= LINES[0].length && !cancelled; n++) { setText(LINES[0].slice(0, n)); await wait(70) }
        return
      }
      // erase…
      for (let n = LINES[i].length - 1; n >= 0 && !cancelled; n--) { setText(LINES[i].slice(0, n)); await wait(24) }
      i = (i + 1) % LINES.length
      setLine(i)
      await wait(260)
      // …and type the next language
      for (let n = 1; n <= LINES[i].length && !cancelled; n++) { setText(LINES[i].slice(0, n)); await wait(46) }
    })

    // (no clearTimeout: a wait that is cut short would leave the shared sequence waiting on it for ever)
    return () => { cancelled = true; unregister() }
  }, [])

  return (
      <p className="hello-line" data-line={line}>
        <span className="sr-only">hello, world</span>
        <span className="hello-prompt" aria-hidden="true">&gt;</span>
        <span className="hello-text" aria-hidden="true">{text}</span>
        <span className="hello-caret" aria-hidden="true" />
      </p>
  )
}