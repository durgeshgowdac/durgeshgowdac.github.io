/** Aang meditating, and the rock he sits on (Nature hero). */
import type { ReactNode } from 'react'
import { AV_ARROW, AV_ORANGE, AV_SKIN, AV_YELLOW } from './avatarPalette'
import { DOT, F, L, Limb, P, SHADE, type PlaceProps } from './core'

const ROCK = 'color-mix(in srgb, var(--sc-line) 14%, var(--sc-cloud))'
/** the colour the arrows take when they light up: the pale sky-blue of the glass token, pushed towards white */
const LIT = 'color-mix(in srgb, var(--sc-glass) 55%, var(--sc-snow))'
/** the aura and the halos around the arrows: the same blue, a little deeper so it reads on the pale meadow */
const AURA = 'color-mix(in srgb, var(--sc-panel) 80%, var(--sc-glass))'

/**
 * Aang, meditating: cross-legged, facing front, eyes closed, fists pressed together at his chest (the arrows on the backs of the fists
 * point at each other, as in the show). The origin is the middle of the seat — put him on top of a rock. About 46 tall.
 *
 * His arrows (forehead, both fists, both feet) light up and fade back to normal on one loop, and while they are lit a soft aura breathes
 * out from his body: `dur` seconds per loop, `delay` shifts the start. Everything is one SMIL clock (opacity only, so it needs no colour
 * interpolation). `animate={false}` is the still frame (arrows at rest, no aura).
 */
export function AangMeditate({ animate = true, dur = 10, delay = 0, ...p }: PlaceProps & { animate?: boolean; dur?: number; delay?: number }) {
    // rest · light up · hold · fade · rest: opacity 0 → 1 → 0 on an eased curve
    const env = {
        values: '0;0;1;1;0;0',
        keyTimes: '0;0.14;0.34;0.58;0.8;1',
        calcMode: 'spline' as const,
        keySplines: '0 0 1 1;0.4 0 0.6 1;0 0 1 1;0.4 0 0.6 1;0 0 1 1',
        dur: `${dur}s`,
        begin: `${-delay}s`,
        repeatCount: 'indefinite' as const,
    }
    const lit = (el: ReactNode, key: string) => animate && (
        <g key={key} opacity={0}>
            <animate attributeName="opacity" {...env} />
            {el}
        </g>
    )
    // the arrows, drawn once for the resting colour and once (in `lit`) for the glow
    const foreheadArrow = 'M-1 -48.2 V-45.6 L-2.9 -45.6 L0 -42 L2.9 -45.6 L1 -45.6 V-48.2 Z'
    const footArrow = (sx: 1 | -1) => `M${sx * 6.5} -0.3 l-1.1 -2.3 h2.2 Z`

    return (
        <P {...p}>
            {/* aura: breathes out from the body while the arrows are lit (behind him) */}
            {animate && (
                <g opacity={0}>
                    <animate attributeName="opacity" {...env} />
                    <g transform="translate(0 -23)" fill={AURA} stroke="none">
                        <ellipse rx={44} ry={42} opacity={0.07} />
                        <ellipse rx={38} ry={36} opacity={0.09} />
                        <ellipse rx={32} ry={31} opacity={0.12} />
                        <ellipse rx={26} ry={26} opacity={0.15} />
                        <ellipse rx={20} ry={21} opacity={0.18} />
                    </g>
                    <g transform="translate(0 -23)">
                        <ellipse rx={30} ry={31} fill="none" stroke={AURA} strokeWidth={1.4} strokeDasharray="2 5" strokeLinecap="round" opacity={0.85}>
                            <animate attributeName="rx" values="29;33;29" dur="3.2s" repeatCount="indefinite" />
                            <animate attributeName="ry" values="30;34;30" dur="3.2s" repeatCount="indefinite" />
                        </ellipse>
                    </g>
                    {/* a few motes of light drifting up off his shoulders */}
                    {[[-14, -34, 0], [15, -30, 1.1], [-5, -46, 2.2], [8, -50, 0.6]].map(([x, y, d], i) => (
                        <circle key={i} cx={x} cy={y} r={1.3} fill={LIT} stroke={AURA} strokeWidth={0.5}>
                            <animate attributeName="cy" values={`${y};${y - 12}`} dur="3.2s" begin={`${-d}s`} repeatCount="indefinite" />
                            <animate attributeName="opacity" values="0;0.95;0" dur="3.2s" begin={`${-d}s`} repeatCount="indefinite" />
                        </circle>
                    ))}
                </g>
            )}

            {/* crossed legs: baggy orange trousers, the shins crossing in front, bare feet with their arrows */}
            <path d="M-21 -3.5 C-22.4 -10 -14 -13.4 -6 -12.4 L6 -12.4 C14 -13.4 22.4 -10 21 -3.5 C14 1.4 -14 1.4 -21 -3.5 Z" {...F} fill={AV_ORANGE} />
            <path d="M6 -12.4 C14 -13.4 22.4 -10 21 -3.5 C17 -1.4 11 -0.4 5 0 C8 -4 8 -8 6 -12.4 Z" {...SHADE} />
            <Limb d="M-17 -6 L5.2 -2.4" w={6.2} fill={AV_ORANGE} />
            <Limb d="M17 -6 L-5.2 -3" w={6.2} fill={AV_ORANGE} />
            <ellipse cx={-6.5} cy={-1.8} rx={3.8} ry={1.9} {...F} fill={AV_SKIN} strokeWidth={1.1} />
            <ellipse cx={6.5} cy={-1.8} rx={3.8} ry={1.9} {...F} fill={AV_SKIN} strokeWidth={1.1} />
            <path d={`${footArrow(-1)} ${footArrow(1)}`} fill={AV_ARROW} stroke="none" />

            {/* yellow tunic, orange sash and the shawl across the chest */}
            <path d="M-7 -29 Q0 -32.4 7 -29 L8.2 -10 Q0 -6.6 -8.2 -10 Z" {...F} fill={AV_YELLOW} />
            <path d="M3 -30.6 Q5.4 -30.2 7 -29 L8.2 -10 Q5 -8.6 3.4 -8.6 Z" {...SHADE} />
            <path d="M-8.4 -13.4 Q0 -10 8.4 -13.4 L8 -9.6 Q0 -6.2 -8 -9.6 Z" {...F} fill={AV_ORANGE} strokeWidth={1.1} />
            <Limb d="M-5.6 -28.2 L5.6 -14.4" w={4.6} fill={AV_ORANGE} />

            {/* arms: upper arms out and down, forearms folding in so the fists meet at the chest */}
            {([-1, 1] as const).map(sx => (
                <g key={sx}>
                    <Limb d={`M${sx * 6.6} -27 L${sx * 12.6} -17.4`} w={5} fill={AV_YELLOW} />
                    <Limb d={`M${sx * 12.6} -17.4 L${sx * 4.6} -21.2`} w={4.8} fill={AV_YELLOW} />
                </g>
            ))}
            <circle cx={-2.4} cy={-21.6} r={2.4} {...F} fill={AV_SKIN} strokeWidth={1.1} />
            <circle cx={2.4} cy={-21.6} r={2.4} {...F} fill={AV_SKIN} strokeWidth={1.1} />
            <path d="M-3.8 -23.2 V-20 L-1.2 -21.6 Z M3.8 -23.2 V-20 L1.2 -21.6 Z" fill={AV_ARROW} stroke="none" />

            {/* head: ears, face, the arrow from the crown to the brow; eyes shut, brows level, a calm mouth */}
            <ellipse cx={-9} cy={-39} rx={1.8} ry={2.6} {...F} fill={AV_SKIN} strokeWidth={1.1} />
            <ellipse cx={9} cy={-39} rx={1.8} ry={2.6} {...F} fill={AV_SKIN} strokeWidth={1.1} />
            <circle cx={0} cy={-39.5} r={9} {...F} fill={AV_SKIN} />
            <path d="M3.6 -48 A9 9 0 0 1 8.9 -37 Q5.6 -36.6 4.4 -40 Q4 -44 3.6 -48 Z" {...SHADE} />
            <path d={foreheadArrow} fill={AV_ARROW} stroke="currentColor" strokeWidth={0.5} strokeLinejoin="round" />
            <path d="M-5.6 -41.6 Q-3.6 -42.8 -1.4 -41.8 M5.6 -41.6 Q3.6 -42.8 1.4 -41.8" {...L} strokeWidth={1} />
            <path d="M-5.2 -38.8 Q-3.4 -37 -1.6 -38.8 M5.2 -38.8 Q3.4 -37 1.6 -38.8" {...L} strokeWidth={0.95} />
            <path d="M-1.6 -34 H1.6" {...L} strokeWidth={0.9} />
            <circle cx={0} cy={-36.1} r={0.45} {...DOT} />

            {/* the glow: the same arrows again, lit, each in a little halo of its own */}
            {lit(
                <g>
                    {[[0, -45], [-2.4, -21.6], [2.4, -21.6], [-6.5, -1.8], [6.5, -1.8]].map(([x, y], i) => (
                        <g key={i} transform={`translate(${x} ${y})`} fill={AURA} stroke="none">
                            <circle r={i === 0 ? 7 : 5.4} opacity={0.18} />
                            <circle r={i === 0 ? 4.6 : 3.6} opacity={0.3} />
                        </g>
                    ))}
                    <path d={foreheadArrow} fill={LIT} stroke="var(--sc-snow)" strokeWidth={0.6} strokeLinejoin="round" />
                    <path d="M-3.8 -23.2 V-20 L-1.2 -21.6 Z M3.8 -23.2 V-20 L1.2 -21.6 Z" fill={LIT} stroke="var(--sc-snow)" strokeWidth={0.5} strokeLinejoin="round" />
                    <path d={`${footArrow(-1)} ${footArrow(1)}`} fill={LIT} stroke="var(--sc-snow)" strokeWidth={0.5} />
                </g>,
                'lit',
            )}
        </P>
    )
}

/** A flat-topped boulder to sit on: ~74 wide and 25 tall at s = 1, with its level seat at y = −24 (a little proud of the grass). */
export function MeditationRock(p: PlaceProps) {
    return (
        <P {...p}>
            <path d="M-38 0 L-41 -8 L-34 -17 L-25 -22.6 L-8 -24.4 L12 -24.2 L27 -22 L36 -15 L41 -6 L40 0 Z" {...F} fill={ROCK} strokeWidth={1.3} strokeLinejoin="round" />
            {/* lit top, shaded right flank, a crack or two */}
            <path d="M-25 -22.6 L-8 -24.4 L12 -24.2 L27 -22 L18 -19.4 L-12 -19.6 Z" fill="var(--scene-fill)" opacity={0.5} stroke="none" />
            <path d="M27 -22 L36 -15 L41 -6 L40 0 L28 0 L31 -9 L26 -17 Z" {...SHADE} />
            <path d="M-28 -12 L-18 -10 L-14 -4 M8 -18 L12 -11 L6 -5" {...L} strokeWidth={0.9} opacity={0.45} />
        </P>
    )
}
