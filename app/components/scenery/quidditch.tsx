/**
 * QUIDDITCH PARTS — the drawings behind the Space version of the Ch.01 strip (see QuidditchScene.tsx).
 *
 * Same hand as the rest of the library (scenery/illustrations/): ink outline in currentColor, round caps and joins, one flat tinted
 * fill per shape from the theme tokens, one soft shade facet (--sc-shade) per big shape. The only colours that are not
 * tokens are the shared team red (BALL_RED, already used by Ash's cap and the capture ball) — the scarf, robes and Quaffle.
 *
 * Every part is drawn facing right with its anchor at the origin (a rider: the middle of the broom; Hedwig: the middle of the
 * body; the Snitch: its centre) so a scene places it with one translate, rotates it to its heading and mirrors it to turn it
 * round. The big characters take their motion from the scene's clock (props below); everything else is a still drawing.
 *
 *   Harry     Seeker, ~80 × 40 long, flat and low on a Nimbus 2000 — scarf and robes streaming, wand in the rear hand, the
 *             front arm reaching out for the grab (`reach`, 0 = holding the broom, 1 = arm stretched out)
 *   Hedwig    snowy owl, ~40 across, wings that flap on their own short loop (or at `wing` degrees when still)
 *   Snitch    walnut-sized gold ball with two silver wings that flutter fast
 *   Hoops     three hoops on three poles
 *   Quaffle, Bludger, Tag, Bubble
 */
import type { ComponentProps, ReactNode } from 'react'
import { BubbleShape } from '@/app/components/scenery/bubbleKit'
import { P, L, F, DOT, GLOW, BALL_RED, BALL_RED_DK, BALL_RED_LT } from '@/app/components/scenery/illustrations'

type Place = Omit<ComponentProps<typeof P>, 'children'>

const GOLD = 'var(--scene-glow)'
const WOOD = 'var(--scene-warm)'
const SKIN = 'var(--sc-body)'
const DARK = 'var(--sc-door)'
const HAIR = 'var(--sc-trunk)'
const SNOW = 'var(--sc-snow)'
const SILVER = 'var(--sc-cloud)'
const SHADE = { fill: 'var(--sc-shade)', stroke: 'none' }

/** an outlined limb: thick ink stroke with a slimmer flat colour on top (the same trick as the astronaut's arms) */
function Tube({ d, w = 4.4, fill }: { d: string; w?: number; fill: string }) {
    return (
        <>
            <path d={d} fill="none" stroke="currentColor" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
            <path d={d} fill="none" stroke={fill} strokeWidth={Math.max(w - 2.4, 0.8)} strokeLinecap="round" strokeLinejoin="round" />
        </>
    )
}

/* ───────────────────────────── the players ───────────────────────────── */

/** what makes one rider different from another: house colours, hair, and whether he wears Harry's glasses and scar */
export type Look = { robe: string; robeDk: string; scarfA: string; scarfB: string; hair: string; glasses: boolean; scar: boolean }
export const HARRY_LOOK: Look = { robe: BALL_RED, robeDk: BALL_RED_DK, scarfA: BALL_RED, scarfB: GOLD, hair: HAIR, glasses: true, scar: true }
/** a Gryffindor team-mate */
export const RED_LOOK: Look = { robe: BALL_RED, robeDk: BALL_RED_DK, scarfA: BALL_RED, scarfB: GOLD, hair: DARK, glasses: false, scar: false }
/** the other house: green robes, a silver-and-green scarf, fair hair */
export const GREEN_LOOK: Look = { robe: 'var(--sc-alien)', robeDk: 'var(--sc-alien)', scarfA: 'var(--sc-alien)', scarfB: SNOW, hair: GOLD, glasses: false, scar: false }

/* ───────────────────────────── Harry (and every other rider: one drawing, so the whole match is the same size) ───────────────────────────── */

/** the front arm: shoulder → elbow → hand, between holding the broom (0) and stretched out to grab (1) */
const ARM_REST: [number, number][] = [[12.5, -9.2], [16.5, -3.6], [15, -0.4]]
const ARM_REACH: [number, number][] = [[12.5, -9.2], [27, -14.5], [43, -12.5]]
const lerp = (a: number, b: number, k: number) => a + (b - a) * k
const armPts = (k: number) => ARM_REST.map(([x, y], i) => [lerp(x, ARM_REACH[i][0], k), lerp(y, ARM_REACH[i][1], k)] as [number, number])
const armD = (k: number) => {
    const p = armPts(k).map(([x, y]) => `${+x.toFixed(2)} ${+y.toFixed(2)}`)
    return `M${p[0]} L${p[1]} L${p[2]}`
}
/** where the reaching hand is, in Harry's own coordinates (the scene reads it to put the Snitch in his fist) */
export const HARRY_HAND = (k: number): [number, number] => { const p = armPts(k)[2]; return [p[0] + 1.2, p[1] - 0.2] }
export const HARRY_HEAD: [number, number] = [20.6, -17.6]

/** a striped scarf tail streaming back from the neck: alternating red and gold, narrowing as it goes */
function scarfTail() {
    const n = 8
    const cl = (u: number): [number, number] => [14 - 38 * u, -15 - 9 * u - 3.4 * Math.sin(u * Math.PI * 1.9)]
    const half = (u: number) => 2.9 - 1.2 * u
    const out: { d: string; a: boolean }[] = []
    for (let i = 0; i < n; i++) {
        const u0 = i / n, u1 = (i + 1) / n + 0.012
        const a = cl(u0), b = cl(u1)
        const f = (v: number) => +v.toFixed(2)
        out.push({
            d: `M${f(a[0])} ${f(a[1] - half(u0))} L${f(b[0])} ${f(b[1] - half(u1))} L${f(b[0])} ${f(b[1] + half(u1))} L${f(a[0])} ${f(a[1] + half(u0))} Z`,
            a: i % 2 === 0,
        })
    }
    return out
}
const SCARF = scarfTail()

export function Harry({ reach = 0, arm, wobble = true, look = HARRY_LOOK, farHand, ...p }: Place & {
    look?: Look
    /** what is held in the rear fist instead of Harry's wand (a Beater's bat) */
    farHand?: ReactNode
    reach?: number
    /** the reach on the scene's clock: `times` are 0–1 fractions of `dur`, `values` are reach amounts (0–1) */
    arm?: { dur: number; times: number[]; values: number[] }
    wobble?: boolean
}) {
    const k0 = arm ? arm.values[0] : reach
    const ds = arm ? arm.values.map(armD).join(';') : ''
    const hands = arm ? arm.values.map(v => HARRY_HAND(v)) : []
    const clock = arm ? { dur: `${arm.dur}s`, repeatCount: 'indefinite' as const, keyTimes: arm.times.join(';') } : null
    const [hx, hy] = HARRY_HAND(k0)
    return (
        <P {...p}>
            {/* scarf tail: a slow flutter about the neck */}
            <g>
                {wobble && <animateTransform attributeName="transform" type="rotate" dur="0.55s" repeatCount="indefinite" values="-3 14 -12.4;4 14 -12.4;-3 14 -12.4" calcMode="spline" keySplines="0.45 0 0.55 1;0.45 0 0.55 1" keyTimes="0;0.5;1" />}
                {SCARF.map((s, i) => <path key={i} d={s.d} fill={s.a ? look.scarfA : look.scarfB} stroke="currentColor" strokeWidth={0.9} strokeLinejoin="round" />)}
            </g>

            {/* Nimbus 2000: bristle tail, polished handle, gold lettering */}
            <path d="M-14 -3.2 L-37 -8 Q-43 -3.4 -40 1.2 Q-43.4 6.4 -36 8.4 L-14 3.4 Z" fill={GOLD} stroke="currentColor" strokeWidth={1.2} strokeLinejoin="round" />
            <path d="M-17 -1.6 L-37 -3.6 M-17 0.4 L-39 1 M-17 2.2 L-36 5" {...L} strokeWidth={0.8} opacity={0.55} />
            <Tube d="M-14 0.6 L29 -1.5" w={4.6} fill={WOOD} />
            <path d="M-15.2 -3.4 V3.6" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" />
            <path d="M14 -1 L21 -1.3" stroke={GOLD} strokeWidth={1.1} strokeLinecap="round" />

            {/* robes streaming behind the shoulders */}
            <path d="M9 -12.6 C2 -17.4 -12 -17 -28 -9.4 C-19 -8.2 -12.6 -6 -7 -1 L5 -6 Z" fill={look.robe} stroke="currentColor" strokeWidth={1.2} strokeLinejoin="round" />
            <path d="M-4 -9.6 C-11 -9.6 -18 -9.4 -26 -9.2 C-19 -7.8 -13 -6 -7.6 -1.6 Z" {...SHADE} />

            {/* far arm on the handle, wand in the fist */}
            <Tube d="M13 -8.6 L20 -5.4 L24 -1.4" w={4} fill={look.robeDk} />
            {farHand ?? (
                <>
                    <Tube d="M24 -1.6 L33.6 -6.8" w={2.2} fill={WOOD} />
                    <circle cx={34.4} cy={-7.2} r={3.4} {...GLOW} opacity={0.45} />
                    <circle cx={34.4} cy={-7.2} r={1.1} fill={GOLD} stroke="currentColor" strokeWidth={0.6} />
                </>
            )}
            <circle cx={24.4} cy={-1.2} r={2.1} fill={SKIN} stroke="currentColor" strokeWidth={1} />

            {/* legs: thigh along the handle, shin trailing, boot */}
            <Tube d="M-5 -3 L4 -1.4 L-7 6.4" w={5} fill="var(--sc-sign)" />
            <ellipse cx={-8.6} cy={7.2} rx={3.6} ry={2.1} transform="rotate(18 -8.6 7.2)" fill={DARK} stroke="currentColor" strokeWidth={1} />

            {/* torso, flat and low, with a gold belt and a shaded underside */}
            <Tube d="M-5 -3.6 L13 -9.2" w={10.6} fill={look.robe} />
            <path d="M-4 -0.6 L12 -5.6" stroke="var(--sc-shade)" strokeWidth={2.6} strokeLinecap="round" fill="none" />
            <path d="M-3.4 -8.2 L-2.4 -0.4" stroke={GOLD} strokeWidth={1.5} strokeLinecap="round" />

            {/* front arm (the reaching one) and its hand */}
            {arm && clock ? (
                <>
                    <path fill="none" stroke="currentColor" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" d={armD(k0)}><animate attributeName="d" {...clock} values={ds} /></path>
                    <path fill="none" stroke={look.robe} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" d={armD(k0)}><animate attributeName="d" {...clock} values={ds} /></path>
                    <circle r={2.3} cx={hx} cy={hy} fill={SKIN} stroke="currentColor" strokeWidth={1}>
                        <animate attributeName="cx" {...clock} values={hands.map(h => +h[0].toFixed(2)).join(';')} />
                        <animate attributeName="cy" {...clock} values={hands.map(h => +h[1].toFixed(2)).join(';')} />
                    </circle>
                </>
            ) : (
                <>
                    <Tube d={armD(k0)} w={5} fill={look.robe} />
                    <circle cx={hx} cy={hy} r={2.3} fill={SKIN} stroke="currentColor" strokeWidth={1} />
                </>
            )}

            {/* scarf wound round the neck */}
            <path d="M10.4 -13.8 Q15 -16.6 19.8 -13.4 L18.6 -8.8 Q14.6 -7.4 11 -9.4 Z" fill={look.scarfB} stroke="currentColor" strokeWidth={1} strokeLinejoin="round" />
            <path d="M12.6 -15.2 L12 -8.6 M16.6 -15.4 L16.4 -8.2" stroke={look.scarfA} strokeWidth={1.7} strokeLinecap="round" />

            <g transform="translate(15 -12) scale(1.12) translate(-15 12)">
                {/* head: windswept hair swept back, round glasses, the scar, a set jaw */}
                <path d="M15.4 -19.2 L7 -20.6 L11.6 -22.6 L8.2 -26.4 L15.8 -24.8 L17.6 -22.8 Z" fill={look.hair} stroke="currentColor" strokeWidth={1} strokeLinejoin="round" />
                <path d="M14.8 -15.2 L7.6 -14.8 L12.6 -18.2 Z" fill={look.hair} stroke="currentColor" strokeWidth={1} strokeLinejoin="round" />
                <circle cx={HARRY_HEAD[0]} cy={HARRY_HEAD[1]} r={6.4} fill={SKIN} stroke="currentColor" strokeWidth={1.2} />
                <path d="M14.6 -16.6 C13 -22.8 18.2 -27 24 -25.8 C27.4 -25.1 27.2 -22.6 26 -22.4 C24.4 -23.4 21.8 -23.2 19.8 -21.6 C18.6 -20.6 17.8 -18 17.2 -15 C16 -15.2 15.2 -15.6 14.6 -16.6 Z" fill={look.hair} stroke="currentColor" strokeWidth={1} strokeLinejoin="round" />
                {look.scar && <path d="M21.2 -22.3 L23.1 -22.1 L22.2 -20.9 L23.3 -20.9 L21.5 -19.3 L21.9 -20.6 L20.9 -20.6 Z" fill="var(--sc-accent)" stroke="currentColor" strokeWidth={0.5} strokeLinejoin="round" />}
                {look.glasses && <circle cx={23.8} cy={-17.5} r={2.8} fill="var(--sc-glass)" fillOpacity={0.55} stroke="currentColor" strokeWidth={1.1} />}
                {look.glasses && <path d="M21 -17.7 L17.8 -17.9" {...L} strokeWidth={0.8} />}
                <circle cx={24.4} cy={-17.4} r={0.8} {...DOT} />
                <path d="M22.4 -20.6 L25.6 -20.2" {...L} strokeWidth={0.8} />
                <path d="M26.6 -16.6 q1.5 1.3 0.1 2.1" {...L} strokeWidth={0.9} />
                <path d="M22.6 -13.6 q1.8 0.9 3.4 0.1" {...L} strokeWidth={0.9} />
            </g>
        </P>
    )
}

/* ───────────────────────────── Hedwig ───────────────────────────── */

/** one wing, pointing back from the shoulder (local origin), with a scalloped trailing edge */
const WING = 'M1 -1 C-5 -8 -14 -10 -22 -7 C-20.5 -5.4 -22.5 -3.8 -21 -2 C-19.6 -0.8 -21 0.8 -19 2.4 C-15 4.4 -7 4.6 1 2 Z'
/** the flap: up-back (+) to down-back (−) about the shoulder, degrees */
export const WING_UP = 52, WING_DOWN = -40

export function Hedwig({ wing = 14, flap = true, ...p }: Place & { wing?: number; flap?: boolean }) {
    const wings = (fill: string, o = 1) => (
        <g opacity={o}>
            {flap && <animateTransform attributeName="transform" type="rotate" dur="0.62s" repeatCount="indefinite" values={`${WING_UP};${WING_DOWN};${WING_UP}`} calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1" keyTimes="0;0.5;1" additive="replace" />}
            <path d={WING} fill={fill} stroke="currentColor" strokeWidth={1.2} strokeLinejoin="round" />
            <path d="M-4 -3 L-18 -4 M-3 0 L-17 0.5" {...L} strokeWidth={0.8} opacity={0.5} />
        </g>
    )
    return (
        <P {...p}>
            {/* far wing, a touch darker, hinged a little behind the near one */}
            <g transform={`translate(-1 -3.6) rotate(${flap ? 0 : wing - 10})`}>{wings(SILVER, 0.95)}</g>
            {/* tail fan */}
            <path d="M-8 0.6 L-20.4 -2.6 L-22 2.4 L-19.6 6 L-8 4 Z" fill={SNOW} stroke="currentColor" strokeWidth={1.1} strokeLinejoin="round" />
            <path d="M-11 1.6 L-20 0.8 M-11 3 L-19 4" {...L} strokeWidth={0.7} opacity={0.5} />
            {/* body, barred with a few flecks, talons tucked */}
            <ellipse cx={0} cy={0.6} rx={9.6} ry={5.8} transform="rotate(-6)" fill={SNOW} stroke="currentColor" strokeWidth={1.2} />
            <path d="M-2.4 3.2 Q-0.6 5 1.4 3.4 M2.2 0.4 q1.2 1.4 2.4 0 M-5.2 0.6 q1.2 1.4 2.4 0" {...L} strokeWidth={0.8} opacity={0.45} />
            <path d="M3 6 l2 1.7 M5.8 5.4 l2.2 1.4" {...L} strokeWidth={1} />
            {/* head: round face, big gold eyes with a stern brow, small hooked beak */}
            <circle cx={10} cy={-3.2} r={5.4} fill={SNOW} stroke="currentColor" strokeWidth={1.2} />
            <circle cx={12.4} cy={-4.2} r={2} fill={GOLD} stroke="currentColor" strokeWidth={0.8} />
            <circle cx={12.9} cy={-4.2} r={0.9} {...DOT} />
            <path d="M10.6 -6.7 L14.4 -5.6" {...L} strokeWidth={0.9} />
            <path d="M14.8 -3 Q17.6 -2 16.2 0.6 Q15.2 -0.6 14.4 -1 Z" fill={WOOD} stroke="currentColor" strokeWidth={0.8} strokeLinejoin="round" />
            <path d="M7 -7.6 L6.2 -10.4 L9.4 -8.6" {...L} strokeWidth={0.9} />
            {/* near wing, over the body */}
            <g transform={`translate(1 -3.2) rotate(${flap ? 0 : wing})`}>{wings(SNOW)}</g>
        </P>
    )
}

/* ───────────────────────────── Snitch ───────────────────────────── */

export function Snitch({ flutter = true, glow = true, ...p }: Place & { flutter?: boolean; glow?: boolean }) {
    const wing = (flip: boolean) => (
        <g transform={`rotate(${flip ? -18 : -34})`}>
            {flutter && <animateTransform attributeName="transform" type="scale" dur="0.13s" repeatCount="indefinite" values="1 1;1 -0.35;1 1" additive="sum" />}
            <path d="M0 0 C-2.4 -2.6 -7 -4 -11 -2.8 C-8.6 -1.2 -5 -0.4 0 0.6 Z" fill={flip ? SILVER : SNOW} stroke="currentColor" strokeWidth={0.9} strokeLinejoin="round" />
        </g>
    )
    return (
        <P {...p}>
            {glow && (
                <>
                    <circle r={8} {...GLOW} opacity={0.1} />
                    <circle r={5.4} {...GLOW} opacity={0.16} />
                </>
            )}
            {wing(true)}
            {wing(false)}
            <circle r={3.1} fill={GOLD} stroke="currentColor" strokeWidth={1.1} />
            <path d="M-1.8 -1.4 Q-0.6 -2.4 0.8 -2.1" stroke="var(--sc-snow)" strokeWidth={0.8} strokeLinecap="round" fill="none" opacity={0.9} />
        </P>
    )
}

/* ───────────────────────────── the far-off match ───────────────────────────── */

/** a rider's rear fist (where Harry holds his wand — or a Beater holds a bat), in the rider's own coordinates */
export const FAR_HAND: [number, number] = [24.4, -1.2]

/** a Beater's bat, hinged at the grip (origin), pointing along +x */
export function Bat(p: Place) {
    return (
        <P {...p}>
            <Tube d="M-1 0 L7 0" w={2.6} fill={WOOD} />
            <path d="M7 -2.4 L16 -3.2 Q18.6 0 16 3.2 L7 2.4 Z" fill={WOOD} stroke="currentColor" strokeWidth={1.3} strokeLinejoin="round" />
        </P>
    )
}

export const Quaffle = (p: Place) => (
    <P {...p}>
        <circle r={2.7} fill={BALL_RED} stroke="currentColor" strokeWidth={1.1} />
        <path d="M-1.5 -1.2 Q-0.5 -2.1 0.8 -1.9" stroke={BALL_RED_LT} strokeWidth={0.8} strokeLinecap="round" fill="none" />
    </P>
)

/** a silver Bludger: a bright metal ball with a dark outline, a glint, and a couple of dents */
export const Bludger = (p: Place) => (
    <P {...p}>
        <circle r={3.2} fill={SILVER} stroke="currentColor" strokeWidth={1.2} />
        <path d="M-2 -1 Q-1 -2.4 0.6 -2.3" stroke="var(--sc-snow)" strokeWidth={0.9} strokeLinecap="round" fill="none" opacity={0.9} />
        <path d="M1.2 1.3 L2.1 2.2" stroke="currentColor" strokeWidth={0.8} strokeLinecap="round" opacity={0.55} />
    </P>
)

/** three hoops on three poles (the middle one tallest); the base of the poles is the origin; width ≈ 22 */
export const HOOP_R = { rx: 3.4, ry: 6.4 }
export function Hoops({ heights = [27, 37, 27], gap = 10, rx = HOOP_R.rx, ry = HOOP_R.ry, pw = 2.6, ...p }: Place & { heights?: number[]; gap?: number; rx?: number; ry?: number; pw?: number }) {
    return (
        <P {...p}>
            {heights.map((h, i) => {
                const x = (i - 1) * gap
                return (
                    <g key={i}>
                        <Tube d={`M${x} 0 V${-h}`} w={pw} fill={SNOW} />
                        <ellipse cx={x} cy={-h - ry + 0.8} rx={rx} ry={ry} fill="none" stroke="currentColor" strokeWidth={pw} />
                        <ellipse cx={x} cy={-h - ry + 0.8} rx={rx} ry={ry} fill="none" stroke={GOLD} strokeWidth={Math.max(pw * 0.42, 0.6)} />
                    </g>
                )
            })}
        </P>
    )
}

/** a tiny outline tag ("+10"), centred on the origin */
export function Tag({ text, w, h = 9, size = 6.4, ...p }: Place & { text: string; w: number; h?: number; size?: number }) {
    return (
        <P {...p}>
            <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2} {...F} strokeWidth={1} />
            <text x={0} y={size * 0.36} textAnchor="middle" fontSize={size} fontWeight={700} fill="currentColor" stroke="none" fontFamily="inherit">{text}</text>
        </P>
    )
}

/** the speech bubble (the theme's style: see bubbleKit): a tail that points down at the speaker. Centred on the tail tip (origin), the box sits
 *  above it; `tailFrac` is how far along the box the tail is (0.32 = Harry's, 0.5 = centred over a crowd). The text is pinned (`textLength`) to
 *  the box less 8 units of padding each side, so it can never spill out whatever monospace the visitor's system resolves; size `w` as
 *  chars × size × 0.6 + 16. */
export const BUBBLE_W = 118, BUBBLE_H = 25, BUBBLE_TAIL = 8
export function Bubble({ text, w = BUBBLE_W, h = BUBBLE_H, tail = BUBBLE_TAIL, tailFrac = 0.32, size = 9.6, ...p }: Place & { text: string; w?: number; h?: number; tail?: number; tailFrac?: number; size?: number }) {
    const x0 = -w * tailFrac, cx = x0 + w / 2
    return (
        <P {...p}>
            <BubbleShape x0={x0} x1={x0 + w} y0={-tail - h} y1={-tail} tail={{ side: 'bottom', at: 8, tip: [0, 0], half: 4 }} />
            <text className="bub-text" x={cx} y={-tail - h / 2 + size * 0.36} textAnchor="middle" fontSize={size} fontFamily="inherit" textLength={w - 16} lengthAdjust="spacingAndGlyphs">{text}</text>
        </P>
    )
}