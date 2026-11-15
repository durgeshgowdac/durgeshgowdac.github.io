/** Hiker, lander, starfield and the volleyball set, drawn in the house style. */
import { DOT, F, L, P, type PlaceProps, WARM } from './core'
import { Sparkle } from './space'

/** Hiker, facing right, boots at the origin (~46 tall): wide-brim hat, jacket, rolled-up pack, trekking pole.
 *  `walk` swings the legs (alternating pairs, .scene-step) — leave it off for a hiker standing in camp. */
export function Hiker({ walk = false, ...p }: PlaceProps & { walk?: boolean }) {
    const legA = <path d="M-1.4 -15 L-5.6 -7.5 L-6.4 -0.8 M-6.4 -0.8 H-1.6" {...L} strokeWidth={2.2} />
    const legB = <path d="M1.4 -15 L5.2 -8 L6.6 -0.8 M6.6 -0.8 H11" {...L} strokeWidth={2.2} />
    return (
        <P {...p}>
            {/* pole planted ahead of the hand */}
            <path d="M8.6 -21 L14.6 -0.6" {...L} strokeWidth={1.2} />
            {walk ? <g className="scene-step2">{legA}</g> : legA}
            {walk ? <g className="scene-step">{legB}</g> : legB}
            {/* pack with a bedroll on top */}
            <rect x={-14} y={-31} width={9.5} height={17} rx={3.4} fill="var(--sc-accent)" stroke="currentColor" strokeWidth={1.2} />
            <rect x={-14.6} y={-35.2} width={10.8} height={5} rx={2.4} fill="var(--sc-sign)" stroke="currentColor" strokeWidth={1.1} />
            <path d="M-12.2 -24.4 H-6.6" {...L} strokeWidth={1} opacity={0.55} />
            {/* jacket */}
            <path d="M-5.6 -29.6 Q1 -33.4 6.4 -29.4 L5.6 -14.2 Q0 -12.4 -5 -14.2 Z" {...F} />
            <path d="M-5 -17 Q0 -15.4 5.2 -17" {...L} strokeWidth={1} opacity={0.5} />
            {/* arms */}
            <path d="M3.4 -27.6 L8.6 -21" {...L} strokeWidth={2} />
            <path d="M-2.6 -27.4 L-4.4 -20.6" {...L} strokeWidth={2} />
            {/* head + hat */}
            <circle cx={1} cy={-36.6} r={4.3} fill="var(--sc-body)" stroke="currentColor" strokeWidth={1.1} />
            <path d="M-5.4 -38.8 H8" {...L} strokeWidth={1.6} />
            <path d="M-3 -38.8 Q1 -46.4 5.4 -38.8 Z" fill="var(--sc-accent)" stroke="currentColor" strokeWidth={1.1} strokeLinejoin="round" />
            <circle cx={2.6} cy={-36.4} r={0.7} {...DOT} />
        </P>
    )
}

/** Moon lander on four legs, feet at the origin. */
export function Lander(p: PlaceProps) {
    return (
        <P {...p}>
            <path d="M-9 -9 L-18 0 M9 -9 L18 0 M-22 0 H-14 M14 0 H22" {...L} strokeWidth={1.3} />
            <path d="M-14 -14 L-8 -26 H8 L14 -14 Z" {...F} strokeWidth={1.2} />
            <rect x={-9.5} y={-14.5} width={19} height={6.5} {...F} fill="var(--sc-panel)" strokeWidth={1.1} />
            <circle cx={0} cy={-19.5} r={3.4} {...F} fill="var(--sc-glass)" strokeWidth={1} />
            <path d="M0 -26 V-33" {...L} strokeWidth={1.1} />
            <circle cx={0} cy={-34} r={1.5} {...WARM} />
        </P>
    )
}

/* ─────────── Deterministic starfield (SSR-safe, no Math.random) ─────────── */
function mulberry32(seed: number) {
    return () => {
        seed |= 0; seed = (seed + 0x6d2b79f5) | 0
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

export function Stars({ w, h, n, seed = 7 }: { w: number; h: number; n: number; seed?: number }) {
    const rnd = mulberry32(seed)
    const items = Array.from({ length: n }).map((_, i) => {
        const x = +(rnd() * w).toFixed(1)
        const y = +(rnd() * h).toFixed(1)
        const big = rnd() > 0.9
        const r = +(big ? 1.6 + rnd() * 0.8 : 0.6 + rnd() * 0.9).toFixed(2)
        const o = +(0.35 + rnd() * 0.65).toFixed(2)
        const tw = rnd() > 0.7
        return { i, x, y, r, o, tw, d: +(rnd() * 5).toFixed(1), big }
    })
    return (
        <g fill="currentColor" stroke="none">
            {items.map(s =>
                s.big && s.i % 2 === 0 ? (
                    <Sparkle key={s.i} x={s.x} y={s.y} s={0.9} o={s.o} delay={s.d} />
                ) : (
                    <circle key={s.i} cx={s.x} cy={s.y} r={s.r} opacity={s.o} className={s.tw ? 'scene-twinkle' : undefined} style={s.tw ? { animationDelay: `${s.d}s` } : undefined} />
                )
            )}
        </g>
    )
}

/** Volleyball (the strip uses it for the rally). */
export function Volleyball(p: PlaceProps) {
    return (
        <P {...p}>
            <circle r={12} {...F} />
            <path d="M-12 0 Q0 -8 12 0 M-8 -9 Q-2 2 -9 9 M8 -9 Q2 2 9 9" {...L} strokeWidth={1} />
        </P>
    )
}

/** Volleyball net: two posts, a taped top edge, a mesh between. Centre-anchored on the ground. */
export function Net(p: PlaceProps) {
    return (
        <P {...p}>
            {[-39, -26, -13, 0, 13, 26, 39].map(vx => <path key={vx} d={`M${vx * 1.5} -39 V-15`} {...L} strokeWidth={0.9} opacity={0.5} />)}
            {[-33, -26, -19].map(hy => <path key={hy} d={`M-62 ${hy} H62`} {...L} strokeWidth={0.9} opacity={0.5} />)}
            <path d="M-62 -41 Q0 -37 62 -41" {...L} strokeWidth={2.4} />
            <path d="M-62 -14 Q0 -11 62 -14" {...L} strokeWidth={1.2} opacity={0.8} />
            <path d="M-62 0 V-43 M62 0 V-43" {...L} strokeWidth={1.9} />
        </P>
    )
}
