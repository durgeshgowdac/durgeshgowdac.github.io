/** A rocket that comes apart in flight (Space): hero launch and the journey strip's cruise. */
import { useId, type ReactNode } from 'react'
import { DOT, GLOW, P, SHADE, WARM, type PlaceProps } from './core'
import { Rocket } from './space'
import { Cloud } from './nature'

/**
 * <BreakingRocket/> draws the same ~88-tall rocket as <Rocket/> (engine bell at the origin, nose up the −y axis) and, at `at`
 * (a fraction of the loop `dur`, in seconds), it breaks apart:
 *   a flash and a ring of sparks at the seam, smoke puffs, and five pieces — nose cone, upper body, tail with the engine still burning,
 *   and the two fins — each with its own slow tumble. They fade out over `span` (also a fraction of the loop).
 * Before `at` it is the whole rocket (plus `flame`, the caller's own exhaust, if given). Everything is SMIL on the caller's clock, so
 * it stays in step with whatever moves it (the hero launch, the cruise strip) and restarts with it.
 * The pieces are the real <Rocket/> clipped along torn (zig-zag) edges, so no part of the art is drawn twice or drawn differently.
 */
const EPS = 0.0004
const SEAM_A = -62     // nose / upper body
const SEAM_B = -34     // upper body / tail (and the fins' top)
const zig = (y: number) => [-30, -22, -14, -6, 2, 10, 18, 30].map((x, i) => `${x} ${y + (i % 2 ? 3 : -3)}`)   // a torn edge across the rocket's width
const band = (top: number, bottom: number) => `M${zig(top).join(' L')} L${zig(bottom).reverse().join(' L')} Z`

type Piece = { id: string; clip: string; c: [number, number]; to: [number, number]; rot: number; flame?: boolean }

export function BreakingRocket({
                                   at, span = 0.12, dur, flame, tailFlame = true, smoke, soft = false, ...p
                               }: PlaceProps & { at: number; span?: number; dur: number; flame?: ReactNode; tailFlame?: boolean; smoke?: string; soft?: boolean }) {
    const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
    const d = `${dur}s`
    const end = Math.min(1, at + span)
    const loop = { dur: d, repeatCount: 'indefinite' as const }
    const k = (...a: number[]) => a.map(v => Math.max(0, Math.min(1, v)).toFixed(5)).join(';')
    const ease = '0 0 1 1;0.15 0.65 0.35 1;0 0 1 1'
    const F = soft ? 0.3 : 1          // `soft`: a jolt, not a break — the pieces shove out a little, then settle back into the rocket
    const pieces: Piece[] = [
        { id: 'nose', clip: band(-100, SEAM_A), c: [0, -76], to: [12, -46], rot: 55 },
        { id: 'body', clip: band(SEAM_A, SEAM_B), c: [0, -48], to: [-20, -12], rot: -38 },
        { id: 'tail', clip: band(SEAM_B, 44), c: [0, -17], to: [6, 34], rot: 16, flame: tailFlame },
        { id: 'finL', clip: 'M-40 -40 H-9.2 V2 H-40 Z', c: [-15, -18], to: [-34, 14], rot: -130 },
        { id: 'finR', clip: 'M9.2 -40 H40 V2 H9.2 Z', c: [15, -18], to: [32, 4], rot: 150 },
    ]
    return (
        <P {...p}>
            <defs>
                {pieces.map(pc => <clipPath key={pc.id} id={`rb${uid}${pc.id}`}><path d={pc.clip} /></clipPath>)}
                {/* the tail is only as wide as the body: the fins are their own pieces */}
                <clipPath id={`rb${uid}strip`}><path d="M-9.2 -50 H9.2 V44 H-9.2 Z" /></clipPath>
            </defs>

            {/* the whole rocket, until it goes */}
            <g>
                {soft
                    ? <animate attributeName="opacity" values="1;1;0;0;1;1" keyTimes={k(0, at - EPS, at, end - EPS, end, 1)} {...loop} />
                    : <animate attributeName="opacity" values="1;1;0;0" keyTimes={k(0, at - EPS, at, 1)} {...loop} />}
                <Rocket flame={false} />
                {flame}
            </g>

            {/* the break: a flash and ring at the seam, sparks, smoke */}
            <g opacity={0}>
                <animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes={k(0, at - EPS, at, at + span * 0.5, at + span, 1)} {...loop} />
                <g transform="translate(0 -48)">
                    <circle r={5} {...GLOW} opacity={soft ? 0.4 : 0.6}>
                        <animate attributeName="r" values={soft ? "3;3;13;13" : "4;4;24;24"} keyTimes={k(0, at, at + span * 0.28, 1)} calcMode="spline" keySplines="0 0 1 1;0.1 0.7 0.3 1;0 0 1 1" {...loop} />
                        <animate attributeName="opacity" values={soft ? "0.4;0.4;0;0" : "0.6;0.6;0;0"} keyTimes={k(0, at, at + span * 0.3, 1)} {...loop} />
                    </circle>
                    <circle r={5} fill="none" stroke="var(--scene-warm)" strokeWidth={soft ? 1.4 : 2.4} opacity={soft ? 0.7 : 1}>
                        <animate attributeName="r" values={soft ? "4;4;21;21" : "5;5;38;38"} keyTimes={k(0, at, at + span * 0.4, 1)} calcMode="spline" keySplines="0 0 1 1;0.1 0.7 0.3 1;0 0 1 1" {...loop} />
                        <animate attributeName="opacity" values="1;1;0;0" keyTimes={k(0, at, at + span * 0.42, 1)} {...loop} />
                    </circle>
                    {Array.from({ length: 9 }, (_, i) => {
                        const a = (i / 9) * Math.PI * 2 + 0.3
                        const r = (30 + (i % 3) * 12) * (soft ? 0.5 : 1)
                        return (
                            <circle key={i} r={i % 2 ? 1.6 : 2.4} {...(i % 2 ? WARM : DOT)}>
                                <animate attributeName="cx" values={`0;0;${(Math.cos(a) * r).toFixed(1)};${(Math.cos(a) * r * 1.15).toFixed(1)}`} keyTimes={k(0, at, at + span * 0.6, 1)} {...loop} />
                                <animate attributeName="cy" values={`0;0;${(Math.sin(a) * r).toFixed(1)};${(Math.sin(a) * r * 1.15).toFixed(1)}`} keyTimes={k(0, at, at + span * 0.6, 1)} {...loop} />
                                <animate attributeName="opacity" values="1;1;0;0" keyTimes={k(0, at, at + span * 0.6, 1)} {...loop} />
                            </circle>
                        )
                    })}
                </g>
                {/* a few puffs of smoke left hanging where it happened */}
                {!soft && [[-8, -54, 0.22], [9, -42, 0.26], [-2, -30, 0.2]].map(([x, y, sc], i) => (
                    <g key={i} transform={`translate(${x} ${y})`}>
                        <g>
                            <animateTransform attributeName="transform" type="scale" values="0.2;0.2;1;1.5;1.5" keyTimes={k(0, at, at + span * 0.4, end, 1)} {...loop} />
                            <Cloud s={sc as number} tint={smoke ?? 'color-mix(in srgb, var(--sc-rocket) 30%, var(--scene-fill))'} />
                        </g>
                    </g>
                ))}
            </g>

            {/* the pieces */}
            {pieces.map(pc => {
                const [cx, cy] = pc.c
                const dx = +(pc.to[0] * F).toFixed(2), dy = +(pc.to[1] * F).toFixed(2), rot = +(pc.rot * F).toFixed(2)
                const last = pc.id === 'tail'
                return (
                    <g key={pc.id} opacity={0}>
                        {soft
                            ? <animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes={k(0, at - EPS, at, end - EPS, end, 1)} {...loop} />
                            : <animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes={k(0, at - EPS, at, at + span * 0.62, end, 1)} {...loop} />}
                        <g>
                            <animateTransform attributeName="transform" type="translate" values={soft ? `0 0;0 0;${dx} ${dy};0 0;0 0` : `0 0;0 0;${dx} ${dy};${dx} ${dy}`} keyTimes={soft ? k(0, at, at + span * 0.4, end, 1) : k(0, at, end, 1)} calcMode="spline" keySplines={soft ? '0 0 1 1;0.2 0.7 0.4 1;0.4 0 0.6 1;0 0 1 1' : ease} {...loop} />
                            <g>
                                <animateTransform attributeName="transform" type="rotate" values={soft ? `0 ${cx} ${cy};0 ${cx} ${cy};${rot} ${cx} ${cy};0 ${cx} ${cy};0 ${cx} ${cy}` : `0 ${cx} ${cy};0 ${cx} ${cy};${rot} ${cx} ${cy};${rot} ${cx} ${cy}`} keyTimes={soft ? k(0, at, at + span * 0.4, end, 1) : k(0, at, end, 1)} calcMode="spline" keySplines={soft ? '0 0 1 1;0.2 0.7 0.4 1;0.4 0 0.6 1;0 0 1 1' : ease} {...loop} />
                                <g clipPath={`url(#rb${uid}${pc.id})`}>
                                    {last ? <g clipPath={`url(#rb${uid}strip)`}><Rocket flame={false} /></g> : <Rocket flame={false} />}
                                </g>
                                {pc.flame && !soft && (
                                    <g className="scene-flicker">
                                        <path d="M-5.5 0 Q0 32 5.5 0 Z" {...WARM} opacity={0.92} />
                                        <path d="M-2.8 0 Q0 16 2.8 0 Z" {...GLOW} />
                                    </g>
                                )}
                            </g>
                        </g>
                    </g>
                )
            })}
        </P>
    )
}


/* ───────────────────────────── the multistage rocket ───────────────────────────── */

/**
 * <StagedRocket/>: the hero's launch vehicle, built the way a real stack is — three stages, ~88 tall, engine bells at the origin, nose up −y:
 *   stage 1  the wide booster: a cluster of THREE engines (centre one longest), its own flames, swept fins, and the interstage adapter on top,
 *   stage 2  a narrower middle stage with ONE big vacuum-optimised bell that sits hidden inside stage 1's interstage until the booster is gone,
 *   stage 3  the small upper stage with its own little bell, nested the same way inside stage 2's top ring,
 *   payload  a capsule under a two-piece nose fairing.
 * Sequence, paced like a real flight (Falcon 9 / Saturn V): stage 1 burns → the outer engines cut, then the centre one (MECO) → a coast of about a second →
 * separation (gas jets and two small retro-rockets shove the booster back) → a pause of ~1.6 s, long enough for the booster to clear → stage 2 lights (its
 * plume blooms over ~1.3 s) → the fairing splits, a little later → stage 2 cuts, coasts, is let go → pause → stage 3 lights and carries the capsule on.
 *   `ign` / `lift`: engine start and lift-off. `sep1` / `sep2` / `fair`: when stage 1, stage 2 and the fairing are let go (fractions of `dur`).
 *   `debris`: the dropped parts are drawn by <StagedDebris/> in the scene's own space (they stay behind as debris), so here they simply leave
 *   the rocket at that instant; without it they slide away and fade on their own. `still`: draw it standing, no motion.
 * Everything is SMIL on the caller's clock, so it stays in step with the motion that carries it.
 */
const OUT = { stroke: 'currentColor', strokeWidth: 1.4, strokeLinejoin: 'round' as const }
const bodyD = (w: number, top: number, bottom: number) => `M${-w} ${top} V${bottom} H${w} V${top} Z`
const shadeD = (w: number, top: number, bottom: number) => `M${w * 0.38} ${top} H${w} V${bottom} H${w * 0.38} Z`
const bellD = (w0: number, w1: number, top: number, bottom: number, x = 0) => `M${x - w0} ${top} L${x - w1} ${bottom} H${x + w1} L${x + w0} ${top} Z`
const HALF_L = 'M0 -62 H-6.2 V-72 Q-6.2 -81 0 -88 Z'
const HALF_R = 'M0 -62 H6.2 V-72 Q6.2 -81 0 -88 Z'
const SPAN_H = 88

/* ───────────────────────────── the exhaust plume ───────────────────────────── */

/**
 * <Plume/>: one engine's exhaust, hanging from the origin down +y: a soft glow round the nozzle, a long translucent outer plume, a bright body, a pale
 * core, a few shock diamonds along the axis (they pulse, one after another) and a trickle of embers streaming away. The three plume outlines
 * are the SAME shape in three flicker frames that SMIL morphs between, each with its own phase, so the layers lick and sway independently.
 * `vac`: a vacuum bell — the plume bulges wide and soft instead of staying a tight teardrop. `still` is handled by the caller (no flame at all).
 */
const f1 = (n: number) => (Math.round(n * 100) / 100).toString()
const plumeD = (l: number, w: number, sway: number, flare: number) =>
    `M${f1(-w)} 0 C${f1(-w * flare)} ${f1(l * 0.3)} ${f1(-w * flare * 0.5 + sway)} ${f1(l * 0.72)} ${f1(sway)} ${f1(l)} C${f1(w * flare * 0.5 + sway)} ${f1(l * 0.72)} ${f1(w * flare)} ${f1(l * 0.3)} ${f1(w)} 0 Z`

function Plume({ len, wid, vac = false, embers = true }: { len: number; wid: number; vac?: boolean; embers?: boolean }) {
    const flare = vac ? 1.75 : 1.08
    const L2 = vac ? len * 1.15 : len
    // one layer: three flicker frames (long & straight, short & leaning, long & leaning the other way)
    const Layer = ({ l, w, fill, op, dur, phase }: { l: number; w: number; fill: typeof WARM; op: number; dur: number; phase: number }) => {
        const A = plumeD(l, w, 0, flare), B = plumeD(l * 0.88, w * 1.07, w * 0.22, flare), C = plumeD(l * 1.08, w * 0.94, -w * 0.2, flare)
        return (
            <path d={A} {...fill} opacity={op}>
                <animate attributeName="d" values={`${A};${B};${A};${C};${A}`} keyTimes="0;0.25;0.5;0.75;1" calcMode="spline"
                         keySplines="0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1" dur={`${dur}s`} begin={`-${phase}s`} repeatCount="indefinite" />
            </path>
        )
    }
    const diamonds = [0.3, 0.5, 0.68]
    return (
        <>
            {/* the glow round the nozzle */}
            <ellipse cx={0} cy={L2 * 0.16} rx={wid * 2.6} ry={L2 * 0.38} {...GLOW} opacity={0.14}>
                <animate attributeName="opacity" values="0.1;0.18;0.12;0.17;0.1" dur="0.7s" repeatCount="indefinite" />
            </ellipse>
            <Layer l={L2} w={wid * 1.5} fill={WARM} op={0.5} dur={0.46} phase={0.1} />
            <Layer l={L2 * 0.8} w={wid} fill={WARM} op={0.95} dur={0.34} phase={0.22} />
            <Layer l={L2 * 0.52} w={wid * 0.55} fill={GLOW} op={1} dur={0.27} phase={0.05} />
            {/* shock diamonds: tiny bright beads along the axis, lit one after another */}
            {!vac && diamonds.map((t, i) => (
                <path key={i} d={`M0 ${f1(L2 * t - wid * 0.9)} L${f1(wid * 0.42 * (1 - i * 0.2))} ${f1(L2 * t)} L0 ${f1(L2 * t + wid * 0.9)} L${f1(-wid * 0.42 * (1 - i * 0.2))} ${f1(L2 * t)} Z`} {...GLOW} opacity={0.9}>
                    <animate attributeName="opacity" values="0.95;0.35;0.95" dur="0.3s" begin={`-${i * 0.1}s`} repeatCount="indefinite" />
                </path>
            ))}
            {/* embers streaming off the end of the plume */}
            {embers && [[-0.35, 0.0], [0.4, 0.33], [0.05, 0.62]].map(([dx, ph], i) => (
                <circle key={i} cx={dx * wid * 1.6} r={Math.max(0.7, wid * 0.22)} {...(i % 2 ? WARM : GLOW)}>
                    <animate attributeName="cy" values={`${f1(L2 * 0.7)};${f1(L2 * 1.45)}`} dur="0.95s" begin={`-${ph}s`} repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.95;0" dur="0.95s" begin={`-${ph}s`} repeatCount="indefinite" />
                </circle>
            ))}
        </>
    )
}

/** stage 1 without its flames: engine bells, fins, skirt, tank bands, the interstage on top */
function Stage1Art() {
    return (
        <>
            <path d={bellD(2.2, 2.4, -4, 0, -5.2)} fill="var(--sc-door)" {...OUT} strokeWidth={0.9} />
            <path d={bellD(2.2, 2.4, -4, 0, 5.2)} fill="var(--sc-door)" {...OUT} strokeWidth={0.9} />
            <path d={bellD(2.4, 2.6, -4, 0, 0)} fill="var(--sc-door)" {...OUT} strokeWidth={0.9} />
            <path d="M-9 -29 L-20.5 -3 L-9 -8 Z M9 -29 L20.5 -3 L9 -8 Z" fill="var(--sc-accent)" {...OUT} strokeWidth={1.3} />
            <path d="M-8.4 -10 L-9 -4 H9 L8.4 -10 Z" fill="var(--sc-panel)" {...OUT} strokeWidth={1} />
            <path d={bodyD(9, -34, -10)} fill="var(--sc-rocket)" {...OUT} />
            <path d={shadeD(9, -34, -10)} {...SHADE} />
            <path d="M-9 -22 H9 V-17 H-9 Z" fill="var(--scene-glow)" {...OUT} strokeWidth={1} />
            <path d="M-9 -27 H9" {...OUT} strokeWidth={0.8} opacity={0.55} />
            <path d="M-8.2 -34 V-38.4 H8.2 V-34 Z" fill="var(--sc-panel)" {...OUT} strokeWidth={1.1} />
            <path d="M-4.6 -35 V-37.6 M0 -35 V-37.6 M4.6 -35 V-37.6" {...OUT} strokeWidth={0.8} opacity={0.7} />
        </>
    )
}

/** stage 2 without its flame: the big bell, tank, band, porthole and the ring on top */
function Stage2Art() {
    return (
        <>
            <path d={bellD(2.6, 5.4, -38, -32)} fill="var(--sc-door)" {...OUT} strokeWidth={1.1} />
            <path d={bodyD(7.6, -58, -38)} fill="var(--sc-rocket)" {...OUT} />
            <path d={shadeD(7.6, -58, -38)} {...SHADE} />
            <path d="M-7.6 -52.5 H7.6 V-48.5 H-7.6 Z" fill="var(--sc-accent)" {...OUT} strokeWidth={1} />
            <path d="M-7.6 -43.6 H7.6" {...OUT} strokeWidth={0.8} opacity={0.6} />
            <circle cx={0} cy={-46} r={2.2} fill="var(--sc-glass)" {...OUT} strokeWidth={1} />
            <path d="M-7.6 -58 L-6 -61.4 H6 L7.6 -58 Z" fill="var(--sc-panel)" {...OUT} strokeWidth={1} />
        </>
    )
}

/** one half of the fairing (`clipId` names a clipPath holding the accent band: <FairClip/>) */
function HalfArt({ side, clipId }: { side: -1 | 1; clipId: string }) {
    const d = side < 0 ? HALF_L : HALF_R
    return (
        <>
            <path d={d} fill="var(--sc-rocket)" {...OUT} />
            {side > 0 && <path d="M2.6 -62 H6.2 V-72 Q6.2 -81 3.2 -85.6 Q2.6 -80 2.6 -72 Z" {...SHADE} />}
            <g clipPath={`url(#${clipId})`}><path d={d} fill="var(--sc-accent)" {...OUT} strokeWidth={1.2} /></g>
        </>
    )
}
const FairClip = ({ id }: { id: string }) => <clipPath id={id}><path d="M-8 -100 H8 V-81 H-8 Z" /></clipPath>

export function StagedRocket({ dur, ign, lift, sep1, sep2, fair, span = 0.11, still = false, debris = false, burnOut, meco = 1, gap = 1.6, ...p }: PlaceProps & {
    dur: number; ign: number; lift: number; sep1: number; sep2: number; fair?: number; span?: number; still?: boolean; debris?: boolean
    /** when the last stage's engine is shut down (fraction of `dur`); default: it burns to the end of the loop */
    burnOut?: number
    /** seconds between an engine's cut-off (MECO / SECO) and the separation of its stage: a coast, as on a real flight */
    meco?: number
    /** seconds between a separation and the next stage's ignition: long enough for the spent stage to drop clear of the new plume */
    gap?: number
}) {
    const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
    const d = `${dur}s`
    const loop = { dur: d, repeatCount: 'indefinite' as const }
    const k = (...a: number[]) => a.map(v => Math.max(0, Math.min(1, v)).toFixed(5)).join(';')
    const sec = (n: number) => n / dur
    const cut = sec(meco)          // the (last) engine of a stage is shut down this long before the stage is let go: a coast, like a real MECO → separation
    const cutOuter = sec(meco + 0.3)   // a cluster shuts down from the outside in: the two outer engines go first, the centre one a moment later
    const relight = sec(gap)       // the next engine lights this long after the stage below has gone
    const slide = '0 0 1 1;0.35 0 0.55 1;0 0 1 1'
    const fairAt = fair ?? (sep1 + sep2) / 2 + sec(0.4)

    // one engine's flame, hanging from (x, y): lights at `on` (the plume blooms over `grow` s), shuts down at `off` (it shrinks back into the nozzle over `taper` s)
    const Flame = ({ x = 0, y = 0, on, off, len, wid, scaleUp, vac, grow = 0.6, taper = 0.35 }: { x?: number; y?: number; on: number; off: number; len: number; wid: number; scaleUp?: boolean; vac?: boolean; grow?: number; taper?: number }) => {
        if (still) return null
        return (
            <g transform={`translate(${x} ${y})`}>
                <g opacity={0}>
                    <animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes={k(0, on, on + sec(0.25), off - sec(taper * 0.6), off, 1)} {...loop} />
                    {/* shut-down: the plume contracts towards the nozzle as it dies */}
                    <g>
                        <animateTransform attributeName="transform" type="scale" values="1 1;1 1;1 0.15;1 0.15" keyTimes={k(0, off - sec(taper), off, 1)} {...loop} />
                        <g>
                            {scaleUp
                                ? <animateTransform attributeName="transform" type="scale" values="1 0.3;1 0.3;1 0.8;1 1.15;1 1.15" keyTimes={k(0, on, lift, lift + 0.05, 1)} {...loop} />
                                : <animateTransform attributeName="transform" type="scale" values="1 0.2;1 0.2;1 1;1 1" keyTimes={k(0, on, on + sec(grow), 1)} {...loop} />}
                            <Plume len={len} wid={wid} vac={vac} embers={len > 15} />
                        </g>
                    </g>
                </g>
            </g>
        )
    }
    // a stage that is let go. With `debris` it simply leaves the rocket at that instant (its copy in <StagedDebris/> takes over where it was);
    // without, it slides back (+y), turns a little and fades out.
    const Away = ({ at, to, rot, c, children }: { at: number; to: [number, number]; rot: number; c: [number, number]; children: ReactNode }) => {
        if (still) return <g>{children}</g>
        if (debris) {
            return (
                <g>
                    <animate attributeName="opacity" values="1;1;0;0" keyTimes={k(0, at - EPS, at, 1)} {...loop} />
                    {children}
                </g>
            )
        }
        return (
            <g>
                <animate attributeName="opacity" values="1;1;1;0;0" keyTimes={k(0, at, at + span * 0.45, at + span, 1)} {...loop} />
                <g>
                    <animateTransform attributeName="transform" type="translate" values={`0 0;0 0;${to[0]} ${to[1]};${to[0]} ${to[1]}`} keyTimes={k(0, at, at + span, 1)} calcMode="spline" keySplines={slide} {...loop} />
                    <g>
                        <animateTransform attributeName="transform" type="rotate" values={`0 ${c[0]} ${c[1]};0 ${c[0]} ${c[1]};${rot} ${c[0]} ${c[1]};${rot} ${c[0]} ${c[1]}`} keyTimes={k(0, at, at + span, 1)} calcMode="spline" keySplines={slide} {...loop} />
                        {children}
                    </g>
                </g>
            </g>
        )
    }
    // the small separation puffs: two jets either side of the seam, a moment of gas that thins out at once
    const Puffs = ({ at, y }: { at: number; y: number }) => {
        if (still) return null
        return (
            <g transform={`translate(0 ${y})`} opacity={0}>
                <animate attributeName="opacity" values="0;0;1;0;0" keyTimes={k(0, at, at + span * 0.08, at + span * 0.5, 1)} {...loop} />
                {[-1, 1].map(sd => (
                    <g key={sd}>
                        {/* a small retro-rocket on the spent stage, canted outward, firing forward for a fraction of a second (Saturn V's S-IC had eight) */}
                        <g transform={`translate(${sd * 6.5} 1.5) rotate(${sd * -28}) scale(1 -1)`} opacity={0}>
                            <animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes={k(0, at, at + sec(0.06), at + sec(0.4), at + sec(0.55), 1)} {...loop} />
                            <Plume len={11} wid={1.3} embers={false} />
                        </g>
                        <circle r={1.8} {...DOT} opacity={0.9}>
                            <animate attributeName="cx" values={`${sd * 8};${sd * 8};${sd * 17};${sd * 17}`} keyTimes={k(0, at, at + span * 0.5, 1)} {...loop} />
                            <animate attributeName="r" values="1.2;1.2;3.4;3.4" keyTimes={k(0, at, at + span * 0.5, 1)} {...loop} />
                        </circle>
                    </g>
                ))}
            </g>
        )
    }
    // the fairing halves: swing apart at the base and turn outward (and fade, or leave to become debris)
    const Half = ({ side }: { side: -1 | 1 }) => {
        const art = <HalfArt side={side} clipId={`sf${uid}`} />
        if (still) return <g>{art}</g>
        if (debris) {
            return (
                <g>
                    <animate attributeName="opacity" values="1;1;0;0" keyTimes={k(0, fairAt - EPS, fairAt, 1)} {...loop} />
                    {art}
                </g>
            )
        }
        const to: [number, number] = [side * 17, 5]
        return (
            <g>
                <animate attributeName="opacity" values="1;1;1;0;0" keyTimes={k(0, fairAt, fairAt + span * 0.35, fairAt + span * 0.9, 1)} {...loop} />
                <g>
                    <animateTransform attributeName="transform" type="translate" values={`0 0;0 0;${to[0]} ${to[1]};${to[0]} ${to[1]}`} keyTimes={k(0, fairAt, fairAt + span * 0.9, 1)} calcMode="spline" keySplines={slide} {...loop} />
                    <g>
                        <animateTransform attributeName="transform" type="rotate" values={`0 0 -62;0 0 -62;${side * 38} 0 -62;${side * 38} 0 -62`} keyTimes={k(0, fairAt, fairAt + span * 0.9, 1)} calcMode="spline" keySplines={slide} {...loop} />
                        {art}
                    </g>
                </g>
            </g>
        )
    }

    return (
        <P {...p}>
            <defs><FairClip id={`sf${uid}`} /></defs>

            {/* ── stage 3 + payload: the small upper stage, its own little bell (hidden in stage 2's top ring until it is let go), never dropped ── */}
            <g>
                <Flame y={-55.5} on={sep2 + relight} off={burnOut ?? 1.5} len={15} wid={2.4} vac grow={1.3} />
                <path d={bellD(1.6, 3.6, -61, -55.5)} fill="var(--sc-door)" {...OUT} strokeWidth={1} />
                <path d={bodyD(5.6, -71, -61)} fill="var(--sc-rocket)" {...OUT} />
                <path d={shadeD(5.6, -71, -61)} {...SHADE} />
                <path d="M-5.6 -66.4 H5.6 V-64.2 H-5.6 Z" fill="var(--sc-accent)" {...OUT} strokeWidth={0.9} />
                {/* the payload capsule under the fairing */}
                <path d="M-4.4 -71 L-2.2 -79 Q0 -81 2.2 -79 L4.4 -71 Z" fill="var(--sc-panel)" {...OUT} strokeWidth={1.1} />
                <circle cx={0} cy={-75.4} r={1.7} fill="var(--sc-glass)" {...OUT} strokeWidth={0.9} />
            </g>
            {/* ── the fairing, over the capsule, splits in two ── */}
            <Half side={-1} />
            <Half side={1} />

            {/* ── stage 2: its own flame; let go once it has done its burn ── */}
            <Away at={sep2} to={[-4, 38]} rot={-7} c={[0, -48]}>
                <Flame y={-32} on={sep1 + relight} off={sep2 - cut} len={26} wid={4.2} vac grow={1.3} />
                <Stage2Art />
            </Away>
            <Puffs at={sep1} y={-36} />
            <Puffs at={sep2} y={-59} />

            {/* ── stage 1: THREE engines with a flame each ── */}
            <Away at={sep1} to={[3, 46]} rot={6} c={[0, -18]}>
                <Flame x={-5.2} on={ign} off={sep1 - cutOuter} len={28} wid={2.3} scaleUp />
                <Flame x={0} on={ign} off={sep1 - cut} len={40} wid={2.6} scaleUp />
                <Flame x={5.2} on={ign} off={sep1 - cutOuter} len={28} wid={2.3} scaleUp />
                <Stage1Art />
            </Away>
        </P>
    )
}

/* ───────────────────────────── what the staging leaves behind ───────────────────────────── */

/**
 * <StagedDebris/>: the parts <StagedRocket debris/> lets go, drawn in the SCENE's space (not carried by the rocket), so they stay where they were
 * dropped: each appears at the instant it leaves the rocket, exactly on top of where the stage was (`f1` / `f2` / `ff`: the rocket's frame — position,
 * heading, speed, scale — at stage 1's, stage 2's and the fairing's release, see useFlightFrames), coasts on with a good part of the rocket's speed
 * (the rocket, still burning, pulls away), turns, and then hangs there tumbling lazily with a few loose shards, until `off0`…`off1` (fractions of
 * `dur`) fade it out just before the next cycle. Mount it as a sibling of the rocket's moving group, in the same coordinate space as its path.
 */
export type DebrisFrame = { x: number; y: number; rot: number; v: number; k: number }
const TAU = 2             // seconds a dropped part takes to shed the speed it had at release
const PUSH = 6               // seconds the separation push takes to die away; the drift below carries on at a steady pace after it

export function StagedDebris({ dur, sep1, sep2, fair, f1, f2, ff, off0, off1, part = 'all' }: {
    dur: number; sep1: number; sep2: number; fair: number; f1: DebrisFrame; f2: DebrisFrame; ff: DebrisFrame; off0: number; off1: number
    /** `stages`: the spent stages and their shards (mount BEHIND the rocket, so its new plume paints over them); `fairing`: the two halves (mount IN FRONT,
     *  so they still cover the capsule for the first instant, as they leave); `all`: both */
    part?: 'all' | 'stages' | 'fairing'
}) {
    const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
    const loop = { dur: `${dur}s`, repeatCount: 'indefinite' as const }
    const k = (...a: number[]) => a.map(v => Math.max(0, Math.min(1, v)).toFixed(5)).join(';')
    const out = '0 0 1 1;0.08 0.7 0.25 1;0 0 1 1'      // quick push, then a soft settle
    const lin = '0 0 1 1;0 0 1 1;0 0 1 1'

    /** one drifting thing: `at` its release; art-space offsets (x across, y along the nose; −y is "ahead").
     `vel` (art units / s) and `rate` (deg / s) are its steady drift and tumble, which go on the whole time it is visible — it never comes to rest. */
    const Drift = ({ at, f, back, side, spin, rate, vel, c, fwd = 0.8, children }: {
        at: number; f: DebrisFrame; back: number; side: number; spin: number; rate: number; vel: [number, number]; c: [number, number]; fwd?: number; children: ReactNode
    }) => {
        const push = Math.min(off0 - at, PUSH / dur)       // the first spin takes this long
        const run = (off1 - at) * dur                       // seconds it stays in view
        const Tp = k(0, at, at + push, 1)                   // the first spin
        const Td = k(0, at, off1, 1)                        // the slow drift and tumble: from release to the end of the fade
        // Ballistic release: the part keeps the rocket's heading speed `v0` but sheds it with a time constant TAU (drag, the separation push, gravity), while the
        // separation push (`back`, retro-rockets / pushers) moves it astern at once and `side` is the sideways kick. The rocket, still burning, pulls away, so
        // the gap only ever opens: the part never rides through the upper stage's engine or its new plume. Sampled densely at the start (where it all happens).
        const v0 = (f.v * fwd) / f.k                        // art units / s
        const Tc = Math.max(0.5, Math.min(4 * TAU, (off0 - at) * dur))
        const N = 14
        const ts = Array.from({ length: N + 1 }, (_, i) => Tc * Math.pow(i / N, 1.7))
        const at_ = (s: number): [number, number] => [side * (1 - Math.exp(-s / 0.8)), -v0 * TAU * (1 - Math.exp(-s / TAU)) + back * (1 - Math.exp(-s / 0.5))]
        const last = at_(Tc)
        const f2s = (v: [number, number]) => `${v[0].toFixed(2)} ${v[1].toFixed(2)}`
        const Tb = k(0, ...ts.map(s => at + s / dur), 1)
        const bal = `0 0;${ts.map(s => f2s(at_(s))).join(';')};${f2s(last)}`
        const tr = (vals: string, spline: string, T: string) => <animateTransform attributeName="transform" type="translate" values={vals} keyTimes={T} calcMode="spline" keySplines={spline} {...loop} />
        const ro = (deg: number, spline: string, T: string) => <animateTransform attributeName="transform" type="rotate" values={`0 ${c[0]} ${c[1]};0 ${c[0]} ${c[1]};${deg} ${c[0]} ${c[1]};${deg} ${c[0]} ${c[1]}`} keyTimes={T} calcMode="spline" keySplines={spline} {...loop} />
        const lx = vel[0] * run * 0.5, ly = vel[1] * run * 0.3   // after the first coast only a lazy drift is left
        const wob = 5 + (Math.abs(spin) % 4)                // a slow sway of its own, so nothing moves in a straight line
        const sway = 1.6
        return (
            <g opacity={0}>
                <animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes={k(0, at - EPS, at, off0, off1, 1)} {...loop} />
                <g transform={`translate(${f.x.toFixed(2)} ${f.y.toFixed(2)}) rotate(${f.rot.toFixed(2)}) scale(${f.k.toFixed(3)}) rotate(90) translate(0 ${SPAN_H / 2})`}>
                    <g>
                        <animateTransform attributeName="transform" type="translate" values={bal} keyTimes={Tb} calcMode="linear" {...loop} />
                        <g>
                            {tr(`0 0;0 0;${lx.toFixed(1)} ${ly.toFixed(1)};${lx.toFixed(1)} ${ly.toFixed(1)}`, lin, Td)}
                            <g>
                                <animateTransform attributeName="transform" type="translate" values={`0 0;${sway} ${-sway * 1.2};0 0;${-sway} ${sway * 1.2};0 0`} keyTimes="0;0.25;0.5;0.75;1"
                                                  calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1" dur={`${wob}s`} repeatCount="indefinite" />
                                <g>
                                    {ro(spin, out, Tp)}
                                    <g>
                                        {ro(rate * run, lin, Td)}
                                        {children}
                                    </g>
                                </g>
                            </g>
                        </g>
                    </g>
                </g>
            </g>
        )
    }
    const Shard = ({ at, f, x, y, ax, ay, spin, i }: { at: number; f: DebrisFrame; x: number; y: number; ax: number; ay: number; spin: number; i: number }) => (
        <Drift at={at} f={f} back={ay} side={ax} spin={spin} rate={spin * 0.06} vel={[ax * 0.09, -1.8 - (i % 3) * 0.5 + ay * 0.02]} c={[x, y]} fwd={0.85}>
            <path transform={`translate(${x} ${y})`} d={i % 2 ? 'M-2.4 -1.2 L2.6 -1.9 L1.8 1.7 L-2.1 1.2 Z' : 'M-1.8 -2 L2 -0.8 L0.6 2.2 L-2.2 0.6 Z'}
                  fill={i % 3 === 0 ? 'var(--sc-accent)' : i % 3 === 1 ? 'var(--sc-rocket)' : 'var(--sc-panel)'} {...OUT} strokeWidth={0.9} />
        </Drift>
    )

    const shards1 = [[-7, -36, -30, 12, 160], [7, -36, 28, 20, -210], [0, -37, 6, 34, 130], [-3, -35, -14, 30, -95]]
    const shards2 = [[-6, -58, -26, 10, -170], [6, -58, 24, 18, 200], [0, -59, 2, 30, 110]]
    const shardsF = [[-4, -62, -34, 4, -140], [4, -62, 34, 6, 150]]

    return (
        <g>
            <defs><FairClip id={`df${uid}`} /></defs>
            {part !== 'fairing' && <>
            {/* the booster, with its interstage */}
            <Drift at={sep1} f={f1} back={16} side={3} spin={26} rate={7} vel={[1.2, -2.2]} c={[0, -18]}><Stage1Art /></Drift>
            {shards1.map(([x, y, ax, ay, sp], i) => <Shard key={`a${i}`} at={sep1} f={f1} x={x} y={y} ax={ax} ay={ay} spin={sp} i={i} />)}
            </>}
            {part !== 'stages' && <>
            {/* the fairing halves: swing wide and turn */}
            <Drift at={fair} f={ff} back={6} side={-32} spin={-70} rate={-10} vel={[-2.4, -1.6]} c={[-3, -75]}><HalfArt side={-1} clipId={`df${uid}`} /></Drift>
            <Drift at={fair} f={ff} back={8} side={32} spin={70} rate={11} vel={[2.4, -1.3]} c={[3, -75]}><HalfArt side={1} clipId={`df${uid}`} /></Drift>
            {shardsF.map(([x, y, ax, ay, sp], i) => <Shard key={`f${i}`} at={fair} f={ff} x={x} y={y} ax={ax} ay={ay} spin={sp} i={i + 1} />)}
            </>}
            {part !== 'fairing' && <>
            {/* the middle stage */}
            <Drift at={sep2} f={f2} back={14} side={-5} spin={-32} rate={-8} vel={[-1.4, -2.0]} c={[0, -48]}><Stage2Art /></Drift>
            {shards2.map(([x, y, ax, ay, sp], i) => <Shard key={`b${i}`} at={sep2} f={f2} x={x} y={y} ax={ax} ay={ay} spin={sp} i={i + 2} />)}
            </>}
        </g>
    )
}