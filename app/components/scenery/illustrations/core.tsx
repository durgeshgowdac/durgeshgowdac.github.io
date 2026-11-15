/** Shared building blocks for every illustration: the ink/fill style objects, the placement wrapper <P> (x, y, s, r, flip, o …) and a few helpers. */
import type { CSSProperties, ReactNode } from 'react'

export const L = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.4,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
}

/** the fox's coat — a pale warm tint, so the fox reads as a fox (not a white blob) in both themes */
const FUR = 'color-mix(in srgb, var(--scene-warm) 24%, var(--scene-fill))'

/** soft facet used for the shaded side of trees, mountains, rocks */
export const SHADE = { fill: 'var(--sc-shade)', stroke: 'none' }

/** outlined shape that hides whatever is drawn behind it */
export const F = { ...L, fill: 'var(--scene-fill)' }

export const DOT = { fill: 'currentColor', stroke: 'none' }

export const WARM = { fill: 'var(--scene-warm)', stroke: 'none' }

export const GLOW = { fill: 'var(--scene-glow)', stroke: 'none' }

/** soft, edgeless halo built from stacked translucent discs (no gradient ids to collide) */
export function Halo({ r, a = 1 }: { r: number; a?: number }) {
    return (
        <>
            <circle r={r} {...GLOW} opacity={0.035 * a} />
            <circle r={r * 0.91} {...GLOW} opacity={0.04 * a} />
            <circle r={r * 0.82} {...GLOW} opacity={0.06 * a} />
            <circle r={r * 0.66} {...GLOW} opacity={0.08 * a} />
            <circle r={r * 0.5} {...GLOW} opacity={0.1 * a} />
        </>
    )
}

export type PlaceProps = {
    x?: number
    y?: number
    s?: number
    r?: number
    flip?: boolean
    o?: number
    className?: string
    style?: CSSProperties
    /** backdrop / atmosphere (haze, glow, mountains…): not a 'thing', so overlap checks ignore it */
    bg?: boolean
    children?: ReactNode
}

/** Positions a part: translate → rotate → scale (optionally mirrored). */
export function P({ x = 0, y = 0, s = 1, r = 0, flip, o = 1, className, style, bg, children }: PlaceProps) {
    return (
        <g
            data-part={bg ? undefined : ""}
            className={className}
            style={style}
            opacity={o}
            transform={`translate(${x} ${y})${r ? ` rotate(${r})` : ''} scale(${flip ? -s : s} ${s})`}
        >
            {children}
        </g>
    )
}

/** An outlined limb: a thick ink stroke with a slimmer paper stroke on top. */
export function Limb({ d, w = 5.4, fill = 'var(--scene-fill)' }: { d: string; w?: number; fill?: string }) {
    return (
        <>
            <path d={d} fill="none" stroke="currentColor" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
            <path d={d} fill="none" stroke={fill} strokeWidth={Math.max(w - 2.6, 1)} strokeLinecap="round" strokeLinejoin="round" />
        </>
    )
}
