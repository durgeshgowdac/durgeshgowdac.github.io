'use client'
import { Luke, Vader, BALL_RED } from '@/app/components/scenery/illustrations'
import type { DuelAnim, RotAnim, SaberAnim } from '@/app/components/scenery/illustrations'
import { useReducedMotion } from '@/app/components/useReducedMotion'

/**
 * Luke (left) and Vader (right) fighting on the spot for the hero ground: the same poses, spacing (96 units between the bodies) and flash as the
 * Contacts duel (<DuelScene/>), but nobody walks — they stay put and clash again and again on one short loop:
 *   guard → wind up → CLASH (flash) → draw back → CLASH (flash) → hold → back to guard.
 * (x, y) is the middle of Luke's feet; `k` scales the pair (the Contacts duel uses ~0.62). With reduced motion it is the frozen first clash.
 */
const T = 3.4
/* [time s, Luke arm, fore, wrist, Vader arm, fore, wrist, lean] — the joint angles are the duel's own (LUKE_P / VADER_P): guard, cocked, cocked (shorter), hit */
const KF: [number, number, number, number, number, number, number, number][] = [
    [0.0, -100, -32, 0, -98, -34, 0, 0],       // guard
    [0.5, -125, -52, 0, -118, -48, 0, 0],      // wind up
    [0.78, -95, -10, -10, -75, -15, -10, 5],   // CLASH
    [1.1, -95, -10, -10, -75, -15, -10, 2],
    [1.35, -113, -40, -4, -105, -38, -4, 0],   // draw back
    [1.62, -95, -10, -10, -75, -15, -10, 5],   // CLASH again
    [2.1, -95, -10, -10, -75, -15, -10, 2],    // hold
    [2.5, -100, -32, 0, -98, -34, 0, 0],       // back to guard
    [T, -100, -32, 0, -98, -34, 0, 0],
]
const CLASH = [0.78, 1.62]
const times = KF.map(r => +(r[0] / T).toFixed(5))
const rot = (i: number): RotAnim => ({ dur: T, times, values: KF.map(r => r[i]) })
const pose = (o: number): Pick<DuelAnim, 'arm' | 'fore' | 'wrist' | 'lean'> => ({ arm: rot(o), fore: rot(o + 1), wrist: rot(o + 2), lean: rot(7) })
// the blades stay lit; their halo flares at each clash
const GT = [0, ...CLASH.flatMap(c => [c - 0.1, c + 0.05, c + 0.5]), T]
const saber: SaberAnim = {
    dur: T, times: GT.map(t => +(t / T).toFixed(5)),
    grow: GT.map(() => 1),
    glow: GT.map((_, i) => (i === 0 || i === GT.length - 1 ? 0.7 : [0.7, 1, 0.75][(i - 1) % 3])),
}
const LUKE: DuelAnim = { ...pose(1), saber }
const VADER: DuelAnim = { ...pose(4), saber }

/** the flash where the blades meet, popping at each clash on the same loop */
function Flash({ animated }: { animated: boolean }) {
    const art = (
        <>
            <circle r={17} fill="var(--sc-glass)" opacity={0.2} />
            <circle r={11} fill={BALL_RED} opacity={0.26} />
            <circle r={5.5} fill="var(--sc-snow)" opacity={0.95} />
            <path d="M0 -9 V-21 M0 9 V21 M-9 0 H-21 M9 0 H21 M-6.4 -6.4 L-14.8 -14.8 M6.4 -6.4 L14.8 -14.8 M-6.4 6.4 L-14.8 14.8 M6.4 6.4 L14.8 14.8"
                  stroke="var(--sc-snow)" strokeWidth={1.4} strokeLinecap="round" fill="none" opacity={0.85} />
        </>
    )
    if (!animated) return <g transform="translate(43.1 -93.7) scale(1.4)" opacity={0.85}>{art}</g>
    const ts = [0, ...CLASH.flatMap(c => [c - 0.02, c + 0.06, c + 0.45]), T]
    const kt = ts.map(t => +(t / T).toFixed(5)).join(';')
    const op = ts.map((_, i) => (i === 0 || i === ts.length - 1 ? 0 : [0, 1, 0][(i - 1) % 3])).join(';')
    const sc = ts.map((_, i) => (i === 0 || i === ts.length - 1 ? 0.5 : [0.5, 1, 1.5][(i - 1) % 3])).join(';')
    return (
        <g transform="translate(43.1 -93.7)">
            <g transform="scale(0.5)">
                <animateTransform attributeName="transform" type="scale" dur={`${T}s`} repeatCount="indefinite" keyTimes={kt} values={sc.split(';').map(v => `${(+v * 1.4).toFixed(3)}`).join(';')} />
                <g opacity={0}>
                    <animate attributeName="opacity" dur={`${T}s`} repeatCount="indefinite" keyTimes={kt} values={op} />
                    {art}
                </g>
            </g>
        </g>
    )
}

export default function HeroDuelStill({ x = 0, y = 0, k = 0.5 }: { x?: number; y?: number; k?: number }) {
    const reduce = useReducedMotion()
    return (
        <g transform={`translate(${x} ${y}) scale(${k})`}>
            {/* Vader first, so he is behind Luke at the clash */}
            <g transform="translate(96 0) scale(-1 1)">
                {reduce ? <Vader arm={-75} fore={-15} wrist={-10 + 42} /> : <Vader anim={VADER} />}
            </g>
            <g transform="scale(1.05)">
                {reduce ? <Luke arm={-95} fore={-10} wrist={-10 + 27} /> : <Luke anim={LUKE} />}
            </g>
            <Flash animated={!reduce} />
        </g>
    )
}