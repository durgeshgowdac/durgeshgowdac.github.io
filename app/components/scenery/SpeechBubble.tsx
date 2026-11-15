import { BubbleShape, BUBBLE_R } from './bubbleKit'

/**
 * A multi-line version of the outlined speech bubble (the single-line one is `Bubble` in the illustrations). SVG text doesn't wrap, so the
 * line breaks are explicit: pass `lines`. The tail tip is the origin (point it at the speaker's head); the body sits above it and grows
 * into −y. `shift` slides the body sideways of the tail (positive = to the right), to keep it clear of a neighbour (capped so the tail stays on the straight bottom edge). The box is sized from the
 * longest line (an average bold glyph is ~0.6 em wide), so keep `fs` and the wording in step. Its look (paper in Nature, comm panel in Space) comes from the
 * shared bubble kit and the theme: see bubbleKit.tsx.
 */
export default function SpeechBubble({ lines, fs = 8.6, shift: wantShift = 0, x = 0, y = 0, timing }: {
    lines: string[]; fs?: number; shift?: number; x?: number; y?: number
    /** pop up for part of a repeating loop: `T` seconds long, visible from `on` to `off` (seconds). Omit for a bubble that is always there. */
    timing?: { T: number; on: number; off: number }
}) {
    const T = 5, r = BUBBLE_R
    const w = Math.ceil(Math.max(...lines.map(l => l.length)) * fs * 0.6) + 16
    const lh = fs * 1.3
    const h = Math.ceil(lines.length * lh) + 10
    // the tail (±3 wide, at the origin) must sit on the straight part of the bottom edge, clear of the rounded corners — a body slid too far
    // sideways would leave it hanging off a corner — so `shift` is held to the most the body can slide while that stays true
    const lim = Math.max(0, w / 2 - r - 6)
    const shift = Math.max(-lim, Math.min(lim, wantShift))
    const x0 = shift - w / 2, x1 = shift + w / 2, y1 = -T, y0 = y1 - h
    const top = y0 + (h - lines.length * lh) / 2
    const pop = timing && (() => {
        const { T, on, off } = timing
        const k = (t: number) => (t / T).toFixed(5)
        const keyT = `0;${k(on)};${k(on + 0.22)};${k(off)};${k(off + 0.3)};1`
        return (
            <>
                <animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes={keyT} dur={`${T}s`} repeatCount="indefinite" />
                {/* it pops out of the speaker's head: scaled about the tail tip, which is the origin */}
                <animateTransform attributeName="transform" type="scale" additive="sum" values="0.5;0.5;1.08;1;1;0.9;0.9" keyTimes={`0;${k(on)};${k(on + 0.22)};${k(on + 0.34)};${k(off)};${k(off + 0.3)};1`} dur={`${T}s`} repeatCount="indefinite" />
            </>
        )
    })()
    return (
        <g transform={`translate(${x} ${y})`}>
            <g opacity={timing ? 0 : undefined}>
                {pop}
                <BubbleShape x0={x0} x1={x1} y0={y0} y1={y1} tail={{ side: 'bottom', at: 0, tip: [0, 0], half: 3 }} />
                {lines.map((l, i) => (
                    <text key={i} x={shift} y={top + lh * i + lh / 2 + fs * 0.34} className="bub-text" textAnchor="middle" fontSize={fs} style={{ fontFamily: 'inherit' }}>{l}</text>
                ))}
            </g>
        </g>
    )
}