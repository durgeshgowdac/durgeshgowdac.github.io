'use client'
import { Harry, Hedwig } from '@/app/components/scenery/quidditch'
import SpeechBubble from '@/app/components/scenery/SpeechBubble'
import { useReducedMotion } from '@/app/components/useReducedMotion'

/**
 * Space counterpart of <AppaFlight/>, for use inside an <svg>: Harry on his Nimbus 2000 with Hedwig flying out ahead of him.
 * They cross a frame `w` units wide, left → right, on one 14 s loop (each bobbing on its own beat, Hedwig's wings flapping on their
 * own loop), then the sky is empty for a moment before they come back in from the left. (x, y) is the middle of Harry's broom at
 * the start of the crossing; `s` scales the pair. With reduced motion it is a still frame, mid-frame.
 *
 * `say` gives Harry a speech bubble that rides along with the pair for most of the crossing (it opens once the pair is well inside the frame
 * and closes before it leaves). `rotate` tilts the whole flight about (x, y) — a negative angle climbs to the right, so the crossing runs
 * up a diagonal; the bubble is turned back upright and kept at readable size however the flight is scaled.
 *
 * Like the rest of the Space art it lives inside a `.scene-space` group, so the shared playback hook pauses it off-screen and
 * ends / restarts it when the theme swaps.
 */
const T = 14
const loop = { dur: `${T}s`, repeatCount: 'indefinite' } as const
const bob = (amp: number, phase = 0) =>
    Array.from({ length: 9 }, (_, i) => `0 ${(amp * Math.sin((i / 8) * Math.PI * 2 + phase)).toFixed(2)}`).join(';')

/** Where Hedwig rides relative to Harry, in the pair's own (unscaled) units: out ahead and a little above. */
const HEDWIG_AT: [number, number] = [98, -36]

/** Harry low on the broom, gently pitching with the bob. */
function HarryRider({ reduce }: { reduce: boolean }) {
    return (
        <g>
            {!reduce && <animateTransform attributeName="transform" type="translate" values={bob(4)} dur="3.4s" repeatCount="indefinite" />}
            <g>
                {!reduce && <animateTransform attributeName="transform" type="rotate" values="-2 0 0;3 0 0;-2 0 0" dur="3.4s" repeatCount="indefinite" calcMode="spline" keySplines="0.45 0 0.55 1;0.45 0 0.55 1" keyTimes="0;0.5;1" />}
                <Harry x={0} y={0} s={1.35} wobble={!reduce} />
            </g>
        </g>
    )
}

/** Hedwig on her own, quicker bob. Placed at the origin; the caller positions her. */
function HedwigFlier({ reduce, bobbing = true }: { reduce: boolean; bobbing?: boolean }) {
    return (
        <g>
            {!reduce && bobbing && <animateTransform attributeName="transform" type="translate" values={bob(5, 1.6)} dur="2.3s" repeatCount="indefinite" />}
            <Hedwig x={0} y={0} s={1.2} flap={!reduce} wing={-20} />
        </g>
    )
}

/** Harry on his Nimbus 2000 with Hedwig out ahead, each bobbing on its own beat (Harry at the origin, Hedwig 98 units ahead and a little above). */
function Pair({ reduce }: { reduce: boolean }) {
    return (
        <>
            <HarryRider reduce={reduce} />
            <g transform={`translate(${HEDWIG_AT[0]} ${HEDWIG_AT[1]})`}>
                <HedwigFlier reduce={reduce} />
            </g>
        </>
    )
}

/**
 * Harry and Hedwig flying straight into something (the Contacts rocket): they fly from `from` to `hit` in a straight line and meet it at second `tHit` of a
 * `T`-second loop — give it the rocket's own loop length and the second it breaks apart, and the two are on one clock (same <svg>), so he arrives exactly as it
 * goes. After the impact the pair tumbles away (spinning and dropping by `fall`), fading out by `tGone`, and is gone until the loop restarts. No dialogue.
 * Harry (the origin of the pair) stops 14 units short of `hit`, so it is he who ploughs into it, with Hedwig already past. Reduced motion: a still frame on the way in.
 */
export function HarryCrash({ from, hit, s = 0.42, T = 11.6, tHit = 8, tGone = 9.6, fall = [46, 70] }: { from: [number, number]; hit: [number, number]; s?: number; T?: number; tHit?: number; tGone?: number; fall?: [number, number] }) {
    const reduce = useReducedMotion()
    const dx = hit[0] - from[0], dy = hit[1] - from[1], len = Math.hypot(dx, dy)
    const ux = dx / len, uy = dy / len
    const ang = (Math.atan2(dy, dx) * 180) / Math.PI
    const E: [number, number] = [hit[0] - 14 * ux, hit[1] - 14 * uy]
    if (reduce) {
        return (
            <g transform={`translate(${from[0] + (E[0] - from[0]) * 0.7} ${from[1] + (E[1] - from[1]) * 0.7}) rotate(${ang}) scale(${s})`}>
                <Pair reduce />
            </g>
        )
    }
    const leg = Math.hypot(E[0] - from[0], E[1] - from[1]), drop = Math.hypot(fall[0], fall[1])
    const a = (leg / (leg + drop)).toFixed(4)
    const th = (tHit / T).toFixed(5), tg = (tGone / T).toFixed(5)
    const path = `M${from[0]} ${from[1]} L${E[0].toFixed(1)} ${E[1].toFixed(1)} L${(E[0] + fall[0]).toFixed(1)} ${(E[1] + fall[1]).toFixed(1)}`
    const dur = `${T}s`
    const fade = { values: '0;1;1;0;0', keyTimes: `0;${(0.6 / T).toFixed(5)};${((tHit + 0.25) / T).toFixed(5)};${tg};1` }

    // Hedwig is a separate track: she keeps Harry's lead and flies on at the same pace, wings still beating, straight past the blast
    // (it is only Harry who ploughs into the rocket), and fades out well beyond it instead of falling.
    const rad = (ang * Math.PI) / 180, cs = Math.cos(rad), sn = Math.sin(rad)
    const hx = s * (HEDWIG_AT[0] * cs - HEDWIG_AT[1] * sn), hy = s * (HEDWIG_AT[0] * sn + HEDWIG_AT[1] * cs)
    const H0 = [from[0] + hx, from[1] + hy], H1 = [E[0] + hx, E[1] + hy]
    const hLeg = Math.hypot(H1[0] - H0[0], H1[1] - H0[1])
    const beyond = (hLeg / tHit) * (tGone - tHit)             // same speed for the rest of the loop
    const H2 = [H1[0] + ux * beyond, H1[1] + uy * beyond]
    const hPath = `M${H0[0].toFixed(1)} ${H0[1].toFixed(1)} L${H2[0].toFixed(1)} ${H2[1].toFixed(1)}`
    const hFade = { values: '0;1;1;0;0', keyTimes: `0;${(0.6 / T).toFixed(5)};${((tGone - 0.9) / T).toFixed(5)};${tg};1` }
    return (
        <g>
            <g>
                <animateMotion path={path} dur={dur} repeatCount="indefinite" calcMode="linear" keyPoints={`0;${a};1;1`} keyTimes={`0;${th};${tg};1`} />
                <animate attributeName="opacity" {...fade} dur={dur} repeatCount="indefinite" />
                <g>
                    {/* level flight at the line's angle, then a tumble after the hit */}
                    <animateTransform attributeName="transform" type="rotate" values={`${ang.toFixed(1)};${ang.toFixed(1)};${(ang + 160).toFixed(1)};${(ang + 160).toFixed(1)}`} keyTimes={`0;${th};${tg};1`} dur={dur} repeatCount="indefinite" />
                    <g transform={`scale(${s})`}>
                        <HarryRider reduce={false} />
                    </g>
                </g>
            </g>
            <g>
                {/* straight on at the same pace, past the rocket, until the loop ends */}
                <animateMotion path={hPath} dur={dur} repeatCount="indefinite" calcMode="linear" keyPoints={`0;1;1`} keyTimes={`0;${tg};1`} />
                <animate attributeName="opacity" {...hFade} dur={dur} repeatCount="indefinite" />
                <g transform={`rotate(${ang.toFixed(1)}) scale(${s})`}>
                    <HedwigFlier reduce={false} />
                </g>
            </g>
        </g>
    )
}

export default function HarryFlight({ x = 0, y = 0, s = 1, w = 640, reduce = false, rotate = 0, say, reach, sayFrom, layer = 'all' }: {
    x?: number; y?: number; s?: number; w?: number; reduce?: boolean; rotate?: number
    /** draw only the pair, only the speech bubble, or both. Two copies on the same clock (one of each) let the bubble sit in a layer above the page text while the pair stays behind it. */
    layer?: 'all' | 'pair' | 'bubble'
    /** one bubble (an array of lines) or several, one after another (an array of arrays) — each pops out of Harry's head in turn */
    say?: string[] | string[][]
    /** how far along the flight line (units, before `s`) the pair travels before the loop ends. Defaults to just past `w`; raise it where the
     frame is crossed on a diagonal so the pair leaves the frame instead of stopping inside it. The bubbles still follow `w`. */
    reach?: number
    /** the pair's position along the flight (units from the frame's left edge, before `s`) at which the first bubble may open. Raise it where page text sits under the left of the frame, so the dialogue only starts once the pair has crossed it. */
    sayFrom?: number
}) {
    const showPair = layer !== 'bubble', showBubble = layer !== 'pair'
    const pair = <Pair reduce={reduce} />
    // the bubbles: tail on Harry's head, turned back upright (undoing the flight's tilt and scale); together they fill the stretch where the pair is
    // well inside the frame, one after the other
    const from = -90, to = reach ?? w + 130
    const run = (T * 0.82) / (to - from)           // seconds per unit of travel
    const on = (sayFrom === undefined ? 150 : sayFrom - from) * run + 0.3, off = (w - 60 - from) * run - 0.3
    const groups: string[][] = !say || !say.length ? [] : Array.isArray(say[0]) ? (say as string[][]) : [say as string[]]
    const slot = (off - on) / Math.max(1, groups.length)
    const bubble = groups.length > 0 && (
        <g transform={`translate(8 -64) rotate(${-rotate}) scale(${1 / s})`}>
            {groups.map((lines, i) => (
                <SpeechBubble key={i} lines={lines} timing={reduce ? undefined : { T, on: on + slot * i, off: on + slot * (i + 1) - (groups.length > 1 ? 0.45 : 0) }} />
            ))}
        </g>
    )
    // the pair is ~190 units long (tail to Hedwig's beak): start fully off the left edge, finish fully off the right
    return (
        <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${s})`}>
            {reduce ? (
                <g transform={`translate(${w * 0.42} 0)`}>{showPair && pair}{showBubble && groups.length > 0 && <g transform={`translate(8 -64) rotate(${-rotate}) scale(${1 / s})`}><SpeechBubble lines={groups[0]} /></g>}</g>
            ) : (
                <g>
                    <animateTransform attributeName="transform" type="translate" values={`${from} 0;${to} 0;${to} 0`} keyTimes="0;0.82;1" {...loop} />
                    {showPair && pair}
                    {showBubble && bubble}
                </g>
            )}
        </g>
    )
}