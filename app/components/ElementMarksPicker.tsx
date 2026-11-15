'use client'
import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import '@/app/styles/element-marks.css'

/**
 * The interactive row of marks at the foot of a hackathon card — touch-friendly labels.
 *
 * A mark is a real <button>: tap it (or click it, or Tab to it) and a small label with its name and a one-line hint opens above the row; tap it
 * again, tap anywhere else, press Esc, or wait a few seconds on touch and it closes. A mouse also opens it on hover. Hover alone is what the old
 * `title` tooltip gave, and a phone has no hover — this is what that was missing.
 *
 * Takes already-drawn marks, so it knows nothing about Avatar or Star Wars; CardElementMarks does the drawing.
 * Both sets stay in the DOM and crossfade (.scene-nature / .scene-space), and only the visible one can be tapped or tabbed to.
 */

type Mark = { name: string; hint: string; icon: ReactNode }
type MarkSet = { key: 'nature' | 'space'; marks: Mark[] }
type Active = { set: MarkSet['key']; i: number } | null

const TOUCH_LABEL_MS = 4500

export default function ElementMarksPicker({ sets }: { sets: MarkSet[] }) {
    const root = useRef<HTMLDivElement>(null)
    const lastPointer = useRef('mouse')
    const [active, setActive] = useState<Active>(null)
    const id = useId()

    // touch has no "pointer left", so close on a tap elsewhere / Esc, and let a touch label time out
    useEffect(() => {
        if (!active) return
        const away = (e: PointerEvent) => { if (!root.current?.contains(e.target as Node)) setActive(null) }
        const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setActive(null) }
        document.addEventListener('pointerdown', away)
        document.addEventListener('keydown', esc)
        const timer = lastPointer.current === 'mouse' ? undefined : window.setTimeout(() => setActive(null), TOUCH_LABEL_MS)
        return () => {
            document.removeEventListener('pointerdown', away)
            document.removeEventListener('keydown', esc)
            if (timer) window.clearTimeout(timer)
        }
    }, [active])

    const is = (set: string, i: number) => active?.set === set && active.i === i

    return (
        <div className="element-marks" ref={root} role="group" aria-label="Theme marks: tap one for its name">
            {sets.map(set => (
                <div key={set.key} className={`element-marks-set scene-${set.key}`}>
                    {set.marks.map((m, i) => (
                        <button
                            key={m.name}
                            type="button"
                            className="element-mark"
                            data-on={is(set.key, i) || undefined}
                            aria-label={`${m.name}: ${m.hint}`}
                            aria-describedby={is(set.key, i) ? `${id}-label` : undefined}
                            onPointerDown={e => { lastPointer.current = e.pointerType }}
                            onPointerEnter={e => { if (e.pointerType === 'mouse') setActive({ set: set.key, i }) }}
                            onPointerLeave={e => { if (e.pointerType === 'mouse') setActive(a => (a && a.set === set.key && a.i === i ? null : a)) }}
                            // keyboard focus only: a tap also focuses the button on some phones, and that must not fight the tap's own toggle
                            onFocus={e => { if (e.currentTarget.matches(':focus-visible')) setActive({ set: set.key, i }) }}
                            onBlur={() => setActive(a => (a && a.set === set.key && a.i === i ? null : a))}
                            onClick={e => {
                                const mouse = e.detail > 0 && lastPointer.current === 'mouse'   // hover already opened it: a click keeps it open
                                setActive(a => (mouse ? { set: set.key, i } : a && a.set === set.key && a.i === i ? null : { set: set.key, i }))
                            }}
                        >
                            {m.icon}
                        </button>
                    ))}
                    {active?.set === set.key && (
                        <span id={`${id}-label`} className="element-mark-label" style={{ '--i': active.i } as CSSProperties}>
                            <strong>{set.marks[active.i].name}</strong>
                            <span>{set.marks[active.i].hint}</span>
                        </span>
                    )}
                </div>
            ))}
        </div>
    )
}