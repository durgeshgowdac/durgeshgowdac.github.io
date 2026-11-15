'use client'

import { BlastPlanet, Sparkle } from '@/app/components/scenery/illustrations'
import { L, DOT, GLOW } from '@/app/components/scenery/illustrations'

/**
 * The cricket shot on the Sports strip (one 18 s loop, shared by both worlds — every time below is in seconds of that loop):
 *
 *   17.2 – 18  a fresh ball fades in, hanging just above the strip a little to the right of the bat (it bobs gently, it never rests on the ground)
 *   0 – 1.0    it hangs there
 *   1.0 – 2.3  the pitch: it drops under gravity and lands on the strip (a quick squash and a shadow that tightens as it falls), moving in towards the bat
 *   2.3 – 3.0  the one short bounce: it comes up off the strip into the bat's path, still rising when the blade meets it
 *   3.0        the bat meets it: the ball is hit, up and out of the strip through its top edge (gone by 3.9)
 *   3.9 – 5.7  out of sight
 *   5.7 – 6.6  it comes back in from above, to the right, growing as it falls (it is coming at us), straight at the target — the ringed planet (Space) or the Sun (Nature), both at exactly the same spot and size
 *   6.6        impact: the target goes up in the hero planet's cartoon blast (<BlastPlanet/>: flash, starburst, shock ring, sparks, smoke, the disc in pieces)
 *   Nature     the Sun is gone without a trace: the strip drops into dusk, stars come out, ash drifts down… (see <SunAftermath/>)
 *   13 – 14.4  the target grows back (and, in Nature, dawn returns) ready for the next shot
 *
 * The target is not placed by hand: it sits on the ball's own arc. The shot leaves the bat at `ball0`, crosses the top edge at `exit0` and comes back in at `enter0`;
 * the parabola through those three points is the ball's flight, and the target is wherever that arc meets the height of the disc (see `arcX`).
 *
 * Coordinates are the strip's (the postcard group, y lifted by 50: the top edge of the visible strip is y = −50).
 */
type Pt = [number, number]
export const SHOT = {
    dur: 18, swing: 3.0, exit: 3.9, enter: 5.7, hit: 6.6, fresh: 17.2, gone: 12.4, back0: 13.0, back1: 14.4,
    ball0: [135.8, 75.4] as Pt,     // where the blade meets the ball (its right face at the instant of the hit: the pitch ends here, the shot starts here)
    exit0: [214, -62] as Pt,        // where it leaves the strip (above the top edge)
    enter0: [628, -58] as Pt,       // where it comes back in (on the arc that meets the raised Sun / Moon)
    target: { y: 14 },              // the height of the centre of the Sun / planet: high enough that the disc and its rays clear the far ridge (y ≈ 44 here), so it hangs in the sky; its x comes from the ball's arc (see arcX)
    scale: 0.55,                    // everything of the blast is drawn at this scale: dramatic next to the small disc, and still inside the strip
    // the pitch: the ball hangs at its start until `start`, falls and lands at `bounce`, rises (apex at `apex`, after the hit) and is struck at `swing`
    pitch: { start: 1.0, bounce: 2.3, apex: 3.25, vx: 22, ground: 86.4 },   // vx: px/s towards the bat; ground: the ball's centre height when it rests on the strip (90 − BALL_R)
}
const BALL_R = 3.6
const HIT_ANGLE = 215               // the ball strikes the upper-left of the disc (degrees, clockwise from +x), the side it arrives from

const f2 = (n: number) => (Math.round(n * 100) / 100).toString()
const heading = (a: Pt, b: Pt) => (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI
const loop = { dur: `${SHOT.dur}s`, repeatCount: 'indefinite' as const }
const k = (...a: number[]) => a.map(v => Math.max(0, Math.min(1, v / SHOT.dur)).toFixed(5)).join(';')

/** the ball's flight after the hit: the parabola y = A·x² + B·x + K through where it leaves the bat, the top edge going out, and the top edge coming back in */
const ARC = (() => {
    const [[x1, y1], [x2, y2], [x3, y3]] = [SHOT.ball0, SHOT.exit0, SHOT.enter0]
    const d1 = (x1 - x2) * (x1 - x3), d2 = (x2 - x1) * (x2 - x3), d3 = (x3 - x1) * (x3 - x2)
    return {
        A: y1 / d1 + y2 / d2 + y3 / d3,
        B: -(y1 * (x2 + x3) / d1 + y2 * (x1 + x3) / d2 + y3 * (x1 + x2) / d3),
        K: (y1 * x2 * x3) / d1 + (y2 * x1 * x3) / d2 + (y3 * x1 * x2) / d3,
    }
})()
/** where the falling branch of the arc is at height `y` (the ball is heading right, so it is the larger root) */
const arcX = (y: number) => (-ARC.B + Math.sqrt(ARC.B * ARC.B - 4 * ARC.A * (ARC.K - y))) / (2 * ARC.A)

/**
 * The pitch, sampled from a real bounce so the motion needs no hand-tuned easing. The ball falls from rest through `h0`, lands at `bounce`, and rebounds to a
 * lower height `H` (the rebound takes `apex − bounce`, which fixes the restitution), all the while sliding towards the bat at a steady `vx`; the blade meets it at `swing`.
 * Heights are above the strip: 0 is the ball resting on it.
 */
const PITCH = (() => {
    const { swing, dur, ball0, pitch } = SHOT
    const { start, bounce, apex, vx, ground } = pitch
    const tau = apex - bounce, fall = bounce - start
    const u = (swing - bounce) / tau
    const H = (ground - ball0[1]) / (1 - (1 - u) ** 2)       // the rebound's apex, so that at `swing` the ball is exactly at the contact height
    const h0 = H * (fall / tau) ** 2                         // the drop height that gives that rebound (same gravity both ways)
    const xs = ball0[0] + (swing - start) * vx               // where it hangs
    const BOB = 0.9
    const height = (t: number) => t <= start ? h0 : t < bounce ? h0 * (1 - ((t - start) / fall) ** 2) : H * (1 - (1 - (t - bounce) / tau) ** 2)
    // times to sample: every 0.05 s through the pitch, and every 0.1 s of the hang before the next one (it bobs, period 1 s, so it is level at both ends of the loop)
    const r2 = (n: number) => Math.round(n * 100) / 100
    const hang0 = SHOT.fresh
    const ts = [...Array.from({ length: Math.round(swing / 0.05) + 1 }, (_, i) => r2(i * 0.05)), ...Array.from({ length: Math.round((dur - hang0) / 0.1) + 1 }, (_, i) => r2(hang0 + i * 0.1))]
    const y = (t: number) => (t <= swing ? ground - height(t) : ground - h0) - (t <= start || t >= hang0 ? BOB * Math.sin(2 * Math.PI * t) : 0)
    const hs = ts.map(t => (t <= swing ? height(t) : t >= hang0 ? h0 : 0))
    return { H, h0, xs, ts, ys: ts.map(y), shadow: hs.map(h => Math.min(1, h / h0)) }
})()

/** a cricket ball, centred on its origin: the same red ball with its seam as before */
function BallArt() {
    return (
        <g>
            <circle r={BALL_R} className="sc-accent" stroke="currentColor" strokeWidth={1} />
            <path d="M-2.6 -1.2 Q0 1.2 2.6 -1.2" {...L} strokeWidth={0.8} />
        </g>
    )
}

/** speed lines behind a ball flying along `deg` */
function Trail({ deg }: { deg: number }) {
    return (
        <g transform={`rotate(${f2(deg)})`} opacity={0.55}>
            <line x1={-6} y1={0} x2={-30} y2={0} {...L} strokeWidth={1} strokeLinecap="round" />
            <line x1={-7} y1={-2.4} x2={-20} y2={-2.4} {...L} strokeWidth={0.7} strokeLinecap="round" />
            <line x1={-7} y1={2.4} x2={-20} y2={2.4} {...L} strokeWidth={0.7} strokeLinecap="round" />
        </g>
    )
}

export default function CricketShot({ world, reduce }: { world: 'nature' | 'space'; reduce: boolean }) {
    const { dur, swing, exit, enter, hit, fresh, gone, back0, back1, ball0, exit0, enter0, target, scale, pitch } = SHOT
    const sun = world === 'nature'
    // the target, drawn at `scale` so the blast has room; its disc radius on screen is 17.2 in both worlds, so the planet sits exactly where the Sun does
    const R = 17.2 / scale
    const a = (HIT_ANGLE * Math.PI) / 180
    const at: Pt = [R * Math.cos(a), R * Math.sin(a)]
    // the target sits on the ball's arc: the ball meets the disc at HIT_ANGLE, so the centre is that point's offset back from where the arc is at that height
    const hpY = target.y + scale * at[1]
    const hp: Pt = [arcX(hpY), hpY]                                          // where the ball meets the disc
    const tx = hp[0] - scale * at[0]                                         // the centre of the Sun / planet

    if (reduce) {
        return (
            <g>
                <BlastPlanet x={tx} y={target.y} s={scale} r={R} tilt={sun ? 0 : -16} look={sun ? 'sun' : 'planet'} at={at} dur={dur} hit={hit} gone={gone} back0={back0} back1={back1} still />
                <ellipse cx={f2(PITCH.xs)} cy={pitch.ground + BALL_R} rx={2.6} ry={0.9} fill="var(--sc-shade)" opacity={0.18} />
                <g transform={`translate(${f2(PITCH.xs)} ${f2(pitch.ground - PITCH.h0)})`}><BallArt /></g>
            </g>
        )
    }

    const fly = (from: Pt, to: Pt, t0: number, t1: number, spline: string) => (
        <animateTransform attributeName="transform" type="translate" values={`${from.join(' ')};${from.join(' ')};${to.join(' ')};${to.join(' ')}`} keyTimes={k(0, t0, t1, dur)} calcMode="spline" keySplines={`0 0 1 1;${spline};0 0 1 1`} {...loop} />
    )
    const spin = (period: number) => <animateTransform attributeName="transform" type="rotate" values="0;360" dur={`${period}s`} repeatCount="indefinite" />

    return (
        <g>
            {sun && <SunAftermath />}
            <BlastPlanet x={tx} y={target.y} s={scale} r={R} tilt={sun ? 0 : -16} look={sun ? 'sun' : 'planet'} at={at} dur={dur} hit={hit} gone={gone} back0={back0} back1={back1} />

            {/* the pitch: a fresh ball hangs just above the strip, drops, lands once and comes up into the bat's path; the blade meets it at `swing` */}
            <g>
                <animate attributeName="opacity" values="1;1;0;0;1;1" keyTimes={k(0, swing, swing + 0.02, fresh, fresh + 0.5, dur)} {...loop} />
                {/* x: hangs, then slides in towards the bat at a steady pace */}
                <g>
                    <animateTransform attributeName="transform" type="translate" values={[PITCH.xs, PITCH.xs, ball0[0], PITCH.xs, PITCH.xs].map(v => `${f2(v)} 0`).join(';')} keyTimes={k(0, pitch.start, swing, fresh, dur)} {...loop} />
                    {/* its shadow on the strip: wide and dark when it is down, small and faint when it is high */}
                    <ellipse cx={0} cy={pitch.ground + BALL_R} ry={1} fill="var(--sc-shade)" opacity={0.4}>
                        <animate attributeName="rx" values={PITCH.shadow.map(h => f2(4.8 - 2.4 * h)).join(';')} keyTimes={k(...PITCH.ts)} {...loop} />
                        <animate attributeName="opacity" values={PITCH.shadow.map(h => f2(0.42 - 0.26 * h)).join(';')} keyTimes={k(...PITCH.ts)} {...loop} />
                    </ellipse>
                    {/* y: the fall, the bounce and the rise, sampled from the physics (plus the gentle bob while it hangs) */}
                    <g>
                        <animateTransform attributeName="transform" type="translate" values={PITCH.ys.map(v => `0 ${f2(v)}`).join(';')} keyTimes={k(...PITCH.ts)} {...loop} />
                        {/* squash on landing, about the ball's underside */}
                        <g transform={`translate(0 ${BALL_R})`}>
                            <g>
                                <animateTransform attributeName="transform" type="scale" values="1 1;1 1;1.3 0.7;1 1;1 1" keyTimes={k(0, pitch.bounce - 0.06, pitch.bounce, pitch.bounce + 0.1, dur)} {...loop} />
                                <g transform={`translate(0 ${-BALL_R})`}>
                                    <g>
                                        <animateTransform attributeName="transform" type="rotate" values="0;0;-540;-540" keyTimes={k(0, pitch.start, swing, dur)} {...loop} />
                                        <BallArt />
                                    </g>
                                </g>
                            </g>
                        </g>
                    </g>
                </g>
            </g>

            {/* the shot: up and out of the top of the strip */}
            <g opacity={0}>
                <animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes={k(0, swing, swing + 0.02, exit, exit + 0.02, dur)} {...loop} />
                <g>
                    {fly(ball0, exit0, swing, exit, '0.3 0.25 0.7 0.85')}
                    <Trail deg={heading(ball0, exit0)} />
                    <g>{spin(0.45)}<BallArt /></g>
                </g>
            </g>

            {/* the return: in from above, falling at the target, bigger as it comes */}
            <g opacity={0}>
                <animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes={k(0, enter, enter + 0.02, hit - 0.01, hit, dur)} {...loop} />
                <g>
                    {fly(enter0, hp, enter, hit, '0.4 0 0.8 0.7')}
                    <Trail deg={heading(enter0, hp)} />
                    <g>
                        <animateTransform attributeName="transform" type="scale" values="0.5;0.5;1.35;1.35" keyTimes={k(0, enter, hit, dur)} calcMode="spline" keySplines="0 0 1 1;0.4 0 0.8 0.7;0 0 1 1" {...loop} />
                        <g>{spin(0.35)}<BallArt /></g>
                    </g>
                </g>
            </g>
        </g>
    )
}

/**
 * Nature only: what the strip looks like with no sun. A white flash at the instant of the blast; the whole strip sinks into dusk (nothing is left behind where the
 * Sun was); stars come out in the sky it left; ash drifts down over everything; then, as the Sun grows back, dawn returns. Colours are the scene's own tokens.
 */
function SunAftermath() {
    const { dur, hit, back0, back1 } = SHOT
    const X0 = 0, Y0 = -50, W = 780, H = 160          // the whole visible strip
    const stars: Pt[] = [[60, -30], [112, 6], [204, -18], [292, -36], [352, 14], [432, -24], [474, 26], [562, -34], [664, -8], [752, -30], [30, 18]]
    const ash = Array.from({ length: 18 }, (_, i): [number, number, number, number] => [
        20 + ((i * 47) % 740),                          // x
        0.8 + (i % 3) * 0.25,                           // radius
        hit + 0.7 + (i % 6) * 0.55,                     // starts falling
        (i % 5) * 7 - 12,                               // sideways drift
    ])
    return (
        <g>
            {/* the flash */}
            <rect x={X0} y={Y0} width={W} height={H} {...GLOW} opacity={0}>
                <animate attributeName="opacity" values="0;0;0.6;0;0" keyTimes={k(0, hit, hit + 0.05, hit + 0.45, dur)} {...loop} />
            </rect>
            {/* dusk */}
            <rect x={X0} y={Y0} width={W} height={H} fill="color-mix(in srgb, var(--sc-line) 35%, #4b4fa8)" opacity={0} style={{ mixBlendMode: 'multiply' }}>
                <animate attributeName="opacity" values="0;0;0.85;0.85;0;0" keyTimes={k(0, hit, hit + 1.6, back0, back1 + 0.6, dur)} {...loop} />
            </rect>
            {/* stars in the sky it left */}
            <g opacity={0}>
                <animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes={k(0, hit + 1.0, hit + 2.6, back0, back1, dur)} {...loop} />
                {stars.map(([x, y], i) => <Sparkle key={i} x={x} y={y} s={0.7 + (i % 3) * 0.15} delay={i * 0.37} />)}
            </g>
            {/* ash falling */}
            {ash.map(([x, r, t0, dx], i) => (
                <circle key={i} cx={x} cy={Y0} r={r} {...DOT} opacity={0}>
                    <animate attributeName="opacity" values="0;0;0.8;0.8;0;0" keyTimes={k(0, t0, t0 + 0.2, t0 + 3.6, t0 + 4.0, dur)} {...loop} />
                    <animate attributeName="cy" values={`${Y0};${Y0};${Y0 + 150};${Y0 + 150}`} keyTimes={k(0, t0, t0 + 4.0, dur)} {...loop} />
                    <animate attributeName="cx" values={`${x};${x};${x + dx};${x + dx}`} keyTimes={k(0, t0, t0 + 4.0, dur)} {...loop} />
                </circle>
            ))}
        </g>
    )
}