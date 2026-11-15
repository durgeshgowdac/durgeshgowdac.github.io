'use client'
import type { ReactNode } from 'react'
import { SokkaForm, AangForm, TophForm, KataraForm } from './avatarCast'
import { Boomerang } from './illustrations'
import { GRIP_TIP, GRIP_AT, GRIP_R } from './illustrations/avatar'
import SpeechBubble from './SpeechBubble'
import { useReducedMotion } from '@/app/components/useReducedMotion'

/**
 * The summit gag, one loop (T below, ≈ 18 s; Nature, Contact):
 *
 *   0.6 – 3.6   Toph: "I am not Toph. I am Melon-Lord! …"
 *   1.2 – 2.1   Sokka raises his hand up beside his head; 2.1 – 2.55 a small wind-up, the hand tipping back just behind it
 *   2.55 – 3.2  …then ONE simple swing: the arm comes forward and out to the side (a ~90° arc, never past shoulder height), the wrist snapping through;
 *               the boomerang leaves his hand early in the swing, as the arm speeds up (REL below is *computed* from the swing's easing, so the two can't drift apart)
 *   REL – CATCH the boomerang flies one long loop: up and out to the left, passing just BENEATH the social-icon labels, a wide turn beyond the
 *               leftmost icon, back along a lower line — straight into Aang's staff — and up into Sokka's hand, spinning all the way
 *   HIT         the staff is knocked out of Aang's hand: it spins up and over to the right, lands and bounces once (a spark marks the hit)
 *   CATCH       Sokka's arm rises to meet it while it is still coming in, takes it at the release angle with the wrist cocked just as it
 *               was when it left, gives a little with it (arm and wrist carry on a touch, then bring it in) and settles
 *   HIT + 0.5   Aang: "Not cool, Sokka!"      CATCH + 0.7  Sokka: "Katara, get the glue!"      next  Katara: "You break it, you fix it!"
 *   after that  Toph: "Looks fine to me!"
 *   T − 0.7     the staff fades; it is back in Aang's hand (fading in) when the loop starts again
 *
 * Every time below that depends on the geometry (the release, the hit, the catch) is worked out from the path and the easing curves
 * in this file, so changing a position, the path or a duration keeps the whole thing in step.
 * With reduced motion everyone just stands there (Sokka holding the boomerang, Aang holding his staff) and only Toph's bubble shows.
 */

/* ── where everyone stands (the scene places them with these) ── */
export const GAG = {
    sokka: { x: 1058, y: 186, s: 0.9 },
    toph: { x: 1130, y: 186, s: 0.9 },     // dead centre of the summit, between Sokka and Katara
    katara: { x: 1202, y: 186, s: 0.9 },
    aang: { x: 436, y: 164, s: 0.9 },
}

/* ── cubic-bezier easing (the same curve SMIL's keySplines uses), and its inverse ── */
type Spline = [number, number, number, number]
const bz = (a: number, b: number, t: number) => 3 * (1 - t) * (1 - t) * t * a + 3 * (1 - t) * t * t * b + t * t * t
/** the fraction of time at which an eased motion has covered `progress` (0 … 1) of its distance */
function timeAt(progress: number, [x1, y1, x2, y2]: Spline) {
    let lo = 0, hi = 1
    for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (bz(y1, y2, m) < progress) lo = m; else hi = m }
    return bz(x1, x2, (lo + hi) / 2)
}
const sp = (s: Spline) => s.join(' ')

/* ── Sokka's arm ── */
const PIVOT = '8.6 -52.6'                              // his shoulder in the raised arm's own (pre-mirror) frame
const REL_ANGLE = -100                                 // the arm angle at which the boomerang is released: hand up by the head, already moving out
const CATCH_ANGLE = -40                                // …and the arm angle at which it is caught (hand out to the side, at shoulder height)
const SWING: Spline = [0.4, 0, 0.6, 1]
/* THE THROW: the hand goes UP beside the head (RAISE), tips back a touch (COCK), then the arm swings forward and out to the side (FOLLOW) in one
   smooth arc and stops there — roughly a quarter turn of the arm, never overhead-and-round. Angles are the arm's, in its own pre-mirror frame:
   0 hangs, −40 is level, −143 is straight up. */
const [R0, R1, R2, S1] = [1.2, 2.1, 2.55, 3.2]         // raise starts, hand is up / wind-up starts, hand is back / swing starts, swing ends (s)
const [RAISE, COCK, FOLLOW] = [-100, -126, -34]
const REL = R2 + (S1 - R2) * timeAt((REL_ANGLE - COCK) / (FOLLOW - COCK), SWING)   // seconds: the release, part-way through the sweep, as the arm is speeding up
const FLIGHT = 4.7
const CATCH = REL + FLIGHT
const FLIGHT_SPLINE: Spline = [0.2, 0.4, 0.35, 1]      // fast off the hand, then braking hard and hovering into the hand (a real boomerang spends its speed and lies over)

/* ── Sokka's wrist: the hand (and the boomerang in it) can rotate about the wrist, inside the arm's own swing ──
   cocked back as the hand goes up, snapping through at the release, a little give at the catch. */
const WRIST = '15.4 -43.4'                             // the wrist, in the raised arm's own (pre-mirror) frame
const WR = -14                                         // wrist angle at the CATCH (the throw's own angles are WCOCK / WREL below)
const [WRAISE, WCOCK, WREL, WFOLLOW] = [-10, -30, 18, 26]   // wrist: a little cock as the hand goes up, a flick through at the release, settling in the follow-through
/** how much of the arm's swing the hand takes back out of the boomerang: as Sokka raises his hand the boomerang stays (mostly) upright in it,
 instead of tipping over with the arm. 0 = it turns with the arm, 1 = it never turns. */
const HOLD_K = 1
const STAFF = { x: 15.6, y: -59.5 }                    // Aang's staff, held high in his raised hand: its centre, in his own units
const BOOM_S = 0.8     // smaller than the default 1.05, so it clears the labels with room to spare (held and flying copies match)
const turn = (px: number, py: number, cx: number, cy: number, deg: number): [number, number] => {
    const a = (deg * Math.PI) / 180, dx = px - cx, dy = py - cy
    return [cx + dx * Math.cos(a) - dy * Math.sin(a), cy + dx * Math.sin(a) + dy * Math.cos(a)]
}
/** where the held boomerang sits for a given arm angle and wrist angle, in Sokka's own units (his raised hand is our left), and its rotation then */
function heldAt(arm: number, wrist: number) {
    // Sokka holds the boomerang by its LOWER END TIP (and catches it on that same end): the tip is in his hand, the boomerang stands up from it.
    // Its centre is therefore the tip's place plus the (turned) offset from the tip to the centre.
    const hr = GRIP_R - HOLD_K * arm                            // the boomerang's angle in the hand at this arm angle
    const [ox, oy] = turn(-GRIP_TIP[0] * BOOM_S, -GRIP_TIP[1] * BOOM_S, 0, 0, hr)
    const [bx, by] = turn(GRIP_AT[0] + ox, GRIP_AT[1] + oy, 15.4, -43.4, wrist)   // …turn it about the wrist…
    const [px, py] = turn(bx, by, 8.6, -52.6, arm)              // …then swing the whole arm about the shoulder
    const [tx, ty] = turn(...turn(GRIP_AT[0], GRIP_AT[1], 15.4, -43.4, wrist), 8.6, -52.6, arm)   // the gripped tip itself
    return { x: -px, y: py, rot: -(hr + wrist + arm), tipX: -tx, tipY: ty }      // mirrored (he holds it in his right hand, our left)
}
const REL_AT = heldAt(REL_ANGLE, WREL), REL_ROT = REL_AT.rot
const CATCH_AT = heldAt(CATCH_ANGLE, WR), CATCH_ROT = CATCH_AT.rot
const SPINS = 9                                        // whole turns in the air, so it lands at the angle it left with

/* ── the flight, relative to the release point, in scene units ── */
/* The path below was laid out relative to the CATCH point (so it runs beneath the labels and into the staff exactly where it always did).
   The throw now starts from a different place (the hand up by his head), so it is shifted by the difference: it starts at the release
   point, its first bend is redrawn to leave outward and slightly up, and it still ends in the hand at the catch. */
const BASE: number[][] = [
    [0, 0, 0, -28, -60, -46, -150, -47],               // up off the hand, then left
    [-150, -47, -290, -49, -430, -49, -545, -47],      // out along y ≈ 92: just BENEATH the labels of every social icon (they end at y ≈ 72)
    [-545, -47, -600, -46, -670, -44, -670, -37],      // the turn beyond the leftmost icon
    [-670, -37, -670, -30, -600, -26, -545, -26],      // …down onto the return line, y ≈ 112 (the top of Aang's staff)
    [-545, -26, -420, -26, -250, -24, -140, -20],
    [-140, -20, -80, -17, -30, -6, 0, 0],              // …and up into the hand
]
const SHIFT = { x: (CATCH_AT.x - REL_AT.x) * GAG.sokka.s, y: (CATCH_AT.y - REL_AT.y) * GAG.sokka.s }
const SEGS: number[][] = BASE.map(seg => seg.map((v, j) => v + (j % 2 === 0 ? SHIFT.x : SHIFT.y)))
SEGS[0][0] = 0; SEGS[0][1] = 0                         // the start is the release point…
SEGS[0][2] = -34; SEGS[0][3] = -9                      // …and it leaves outward and a little up, off the flick of the wrist
const PATH = 'M0 0 ' + SEGS.map(s => `C${s[2]} ${s[3]} ${s[4]} ${s[5]} ${s[6]} ${s[7]}`).join(' ')
const hand = { x: GAG.sokka.x + REL_AT.x * GAG.sokka.s, y: GAG.sokka.y + REL_AT.y * GAG.sokka.s }   // release point, scene units

/* arc length along the path, to turn "where is the boomerang" into "when" */
const pts: { x: number; y: number; len: number }[] = []
{
    let len = 0, prev: [number, number] | null = null
    for (const s of SEGS) {
        for (let i = 0; i <= 80; i++) {
            const t = i / 80
            const x = (1 - t) ** 3 * s[0] + 3 * (1 - t) ** 2 * t * s[2] + 3 * (1 - t) * t * t * s[4] + t ** 3 * s[6]
            const y = (1 - t) ** 3 * s[1] + 3 * (1 - t) ** 2 * t * s[3] + 3 * (1 - t) * t * t * s[5] + t ** 3 * s[7]
            if (prev) len += Math.hypot(x - prev[0], y - prev[1])
            prev = [x, y]
            pts.push({ x, y, len })
        }
    }
}
const TOTAL = pts[pts.length - 1].len
// the boomerang meets Aang's staff on the RETURN line: the first time after the turn it reaches the staff's x
const staffX = GAG.aang.x + STAFF.x * GAG.aang.s - hand.x           // relative to the release point
const turnIdx = pts.reduce((m, p, i) => (p.x < pts[m].x ? i : m), 0)
const hitPt = pts.slice(turnIdx).find(p => p.x >= staffX) ?? pts[turnIdx]
const HIT = REL + FLIGHT * timeAt(hitPt.len / TOTAL, FLIGHT_SPLINE)   // seconds
const hitWorld = { x: hand.x + hitPt.x, y: hand.y + hitPt.y }

/** the staff has landed (it is on the ground 0.9 s after the hit) and a beat later Aang lowers his arm: back to his ordinary standing pose, empty-handed */
const LOWER_AT = HIT + 0.9 + 0.4

/* ── the timeline of the dialogue ── */
const TALK = {
    toph: [0.6, 3.6],
    aang: [LOWER_AT + 0.15, LOWER_AT + 2.6],          // …and only then, arms down, "Not cool, Sokka!"
    sokka: [CATCH + 0.7, CATCH + 3.2],
    katara: [CATCH + 3.1, CATCH + 5.6],
    toph2: [CATCH + 6.0, CATCH + 8.2],               // after Katara's bubble has finished fading out
}
/** the loop: Toph's last line, then a beat of quiet before the staff is back in Aang's hand and she starts again */
const T = Math.ceil((TALK.toph2[1] + 1.6) * 2) / 2
const k = (t: number) => (t / T).toFixed(5)
const loop = { dur: `${T}s`, repeatCount: 'indefinite' } as const

/* ───────────────────────────── Sokka ───────────────────────────── */
export function SokkaThrow() {
    const reduce = useReducedMotion()
    const { x, y, s } = GAG.sokka
    if (reduce) return <SokkaForm x={x} y={y} s={s} boomerangS={BOOM_S} gripTip />
    const EASE: Spline = [0.4, 0, 0.6, 1], LIN: Spline = [0, 0, 1, 1]
    // the arm. THROW: wind back, swing (the release is mid-swing, at REL), follow through, lower it. CATCH: it starts to rise while the
    // boomerang is still on its way in, is still moving up as it reaches the hand (so hand and boomerang meet instead of the hand
    // waiting), carries on a touch with it, then brings it in and lowers it.
    const LIFT = CATCH - 1.6
    const times = [0, R0, R1, R2, S1, S1 + 0.4, 5.0, LIFT, CATCH, CATCH + 0.15, CATCH + 0.55, CATCH + 1.2, T]
    const angles = [0, 0, RAISE, COCK, FOLLOW, FOLLOW, 0, 0, CATCH_ANGLE, CATCH_ANGLE - 7, -24, 0, 0]
    const splines: Spline[] = [LIN, EASE, EASE, SWING, LIN, EASE, LIN, [0.35, 0, 0.75, 0.75], [0.1, 0.5, 0.4, 1], EASE, EASE, LIN]
    // the wrist (a rotation of the hand and boomerang about the wrist, inside the arm's swing): cocked back as the hand goes up, whipping
    // through to WREL at the release, flicking on through the follow-through; at the catch it is at WR, gives a little, and relaxes.
    const wTimes = [0, R0, R1, R2, REL, S1, S1 + 0.4, 5.0, LIFT, CATCH, CATCH + 0.15, CATCH + 0.55, CATCH + 1.2, T]
    const wAngles = [0, 0, WRAISE, WCOCK, WREL, WFOLLOW, WFOLLOW, 0, 0, WR, 12, 4, 0, 0]
    const wSplines: Spline[] = [LIN, EASE, EASE, [0.5, 0, 0.85, 0.6], [0.2, 0.6, 0.5, 1], LIN, EASE, LIN, [0.35, 0, 0.75, 0.75], [0.1, 0.5, 0.4, 1], EASE, EASE, LIN]
    const keyT = `0;${k(REL)};${k(CATCH)}`
    return (
        <g>
            <SokkaForm
                x={x}
                y={y}
                s={s}
                boomerangS={BOOM_S}
                gripTip
                boomerangRot={
                    <animateTransform
                        attributeName="transform"
                        type="rotate"
                        values={angles.map(a => `${-HOLD_K * a} ${GRIP_AT[0]} ${GRIP_AT[1]}`).join(';')}
                        keyTimes={times.map(k).join(';')}
                        calcMode="spline"
                        keySplines={splines.map(sp).join(';')}
                        {...loop}
                    />
                }
                wristFx={
                    <animateTransform
                        attributeName="transform"
                        type="rotate"
                        values={wAngles.map(a => `${a} ${WRIST}`).join(';')}
                        keyTimes={wTimes.map(k).join(';')}
                        calcMode="spline"
                        keySplines={wSplines.map(sp).join(';')}
                        {...loop}
                    />
                }
                armFx={
                    <animateTransform
                        attributeName="transform"
                        type="rotate"
                        values={angles.map(a => `${a} ${PIVOT}`).join(';')}
                        keyTimes={times.map(k).join(';')}
                        calcMode="spline"
                        keySplines={splines.map(sp).join(';')}
                        {...loop}
                    />
                }
                boomerangFx={<animate attributeName="opacity" values="1;0;1" keyTimes={keyT} calcMode="discrete" {...loop} />}
            />
            {/* the flying copy: leaves the hand at REL, follows the path, spins, is gone again once caught */}
            <g transform={`translate(${hand.x} ${hand.y})`} opacity={0}>
                <animate attributeName="opacity" values="0;1;0" keyTimes={keyT} calcMode="discrete" {...loop} />
                <animateMotion path={PATH} keyPoints="0;0;1;1" keyTimes={`0;${k(REL)};${k(CATCH)};1`} calcMode="spline" keySplines={`0 0 1 1;${sp(FLIGHT_SPLINE)};0 0 1 1`} {...loop} />
                {/* it lays over as it slows: seen from the side its spinning plane tips from upright toward flat (a squash across the picture), and
                    comes back up as it settles into the hand; the spin brakes hard, so it hovers into the hand rather than arriving mid-turn */}
                <g>
                    <animateTransform
                        attributeName="transform"
                        type="scale"
                        values="1 1;1 1;1 0.5;1 0.5;1 1;1 1"
                        keyTimes={`0;${k(REL + 0.25)};${k(REL + FLIGHT * 0.42)};${k(REL + FLIGHT * 0.74)};${k(CATCH)};1`}
                        calcMode="spline"
                        keySplines="0 0 1 1;0.4 0 0.6 1;0 0 1 1;0.4 0 0.6 1;0 0 1 1"
                        {...loop}
                    />
                    <g>
                        <animateTransform
                            attributeName="transform"
                            type="rotate"
                            values={`${REL_ROT};${REL_ROT};${CATCH_ROT - 360 * SPINS};${CATCH_ROT - 360 * SPINS}`}
                            keyTimes={`0;${k(REL)};${k(CATCH)};1`}
                            calcMode="spline"
                            keySplines="0 0 1 1;0.12 0.55 0.3 1;0 0 1 1"
                            {...loop}
                        />
                        <Boomerang x={0} y={0} r={0} s={BOOM_S * s} />
                    </g>
                </g>
            </g>
            {/* the pinch: a few short ticks where the lower tip meets the hand, for a beat */}
            <g transform={`translate(${x + CATCH_AT.tipX * s} ${y + CATCH_AT.tipY * s})`} opacity={0}>
                <animate attributeName="opacity" values="0;1;0" keyTimes={`0;${k(CATCH)};${k(CATCH + 0.22)}`} calcMode="discrete" {...loop} />
                <path d="M-7 -5 L-10.5 -8 M7 -5 L10.5 -8 M0 -8 V-12.5" stroke="var(--scene-warm)" strokeWidth={1.5} strokeLinecap="round" fill="none" />
            </g>
        </g>
    )
}

/* ───────────────────────────── Aang and his staff ───────────────────────────── */
// the staff's centre (STAFF, above). Knocked up and to the right, it tumbles over, lands flat and bounces once.
const LAND = 0.895                                     // seconds of flight
// Aang holds the staff HIGH (his raised-hand pose): its centre is (15.6, −59.5), well above where it stood. It is knocked up and out, tumbles, and comes
// down 56.5 to lie flat on the ground.
const FALL = { a: -132.1, b: 218.1 }                   // y(τ) = aτ + bτ²: rises 20, comes down 56.5 to the ground
const RUN = 75                                         // how far right it lands (Aang's units)
function staffWrap(staff: ReactNode) {
    const N = 14
    const kt: number[] = [0, HIT]
    const dv: string[] = ['0 0', '0 0']
    const rv: string[] = [`0 ${STAFF.x} ${STAFF.y}`, `0 ${STAFF.x} ${STAFF.y}`]
    for (let i = 1; i <= N; i++) {
        const tau = (LAND * i) / N
        kt.push(HIT + tau)
        dv.push(`${((RUN * tau) / LAND).toFixed(2)} ${(FALL.a * tau + FALL.b * tau * tau).toFixed(2)}`)
        rv.push(`${((450 * tau) / LAND).toFixed(1)} ${STAFF.x} ${STAFF.y}`)
    }
    // one small bounce
    for (const [dt, dx, dy, ang] of [[0.1, 77, 51, 456], [0.2, 79, 56.5, 462]] as const) {
        kt.push(HIT + LAND + dt); dv.push(`${dx} ${dy}`); rv.push(`${ang} ${STAFF.x} ${STAFF.y}`)
    }
    kt.push(T); dv.push(dv[dv.length - 1]); rv.push(rv[rv.length - 1])
    const keyT = kt.map(k).join(';')
    return (
        <g>
            {/* back in his hand (fading in) at the start of the loop, gone (fading out) a moment before it ends */}
            <animate attributeName="opacity" values="0;1;1;0;0" keyTimes={`0;${k(0.35)};${k(T - 0.7)};${k(T - 0.4)};1`} {...loop} />
            <animateTransform attributeName="transform" type="translate" values={dv.join(';')} keyTimes={keyT} {...loop} />
            <g>
                <animateTransform attributeName="transform" type="rotate" values={rv.join(';')} keyTimes={keyT} {...loop} />
                {staff}
            </g>
        </g>
    )
}
export function AangKnock() {
    const reduce = useReducedMotion()
    const { x, y, s } = GAG.aang
    if (reduce) return <AangForm x={x} y={y} s={s} raise />
    // two poses swapped on the clock: staff held high until it has been knocked out and has landed, then the previous standing pose (arms down)
    return (
        <g>
            <g>
                <animate attributeName="opacity" values="1;1;0;0" keyTimes={`0;${k(LOWER_AT - 0.001)};${k(LOWER_AT)};1`} calcMode="discrete" {...loop} />
                <AangForm x={x} y={y} s={s} raise staffWrap={staffWrap} />
            </g>
            <g opacity={0}>
                <animate attributeName="opacity" values="0;0;1;1" keyTimes={`0;${k(LOWER_AT - 0.001)};${k(LOWER_AT)};1`} calcMode="discrete" {...loop} />
                {/* the same falling staff, carried on from the raised pose's frame (standing frame → raised frame: +2.8, −28) so it does not vanish when the pose swaps:
                    it lies on the ground until the end of the loop, after every line has been said, and only then fades out and resets into his hand */}
                <AangForm x={x} y={y} s={s} staffWrap={st => staffWrap(<g transform="translate(2.8 -28)">{st}</g>)} />
            </g>
        </g>
    )
}

/** the spark where the boomerang strikes the staff */
export function HitSpark() {
    const reduce = useReducedMotion()
    if (reduce) return null
    const rays = [0, 60, 120, 180, 240, 300].map(a => {
        const r = (a * Math.PI) / 180
        return `M${(Math.cos(r) * 5).toFixed(1)} ${(Math.sin(r) * 5).toFixed(1)} L${(Math.cos(r) * 12).toFixed(1)} ${(Math.sin(r) * 12).toFixed(1)}`
    }).join(' ')
    return (
        <g transform={`translate(${hitWorld.x.toFixed(1)} ${hitWorld.y.toFixed(1)})`} opacity={0}>
            <animate attributeName="opacity" values="0;1;0" keyTimes={`0;${k(HIT)};${k(HIT + 0.28)}`} calcMode="discrete" {...loop} />
            <path d={rays} stroke="var(--scene-warm)" strokeWidth={1.6} strokeLinecap="round" fill="none" />
            <circle r={3.2} fill="#fff6d6" opacity={0.9} />
        </g>
    )
}

/* ───────────────────────────── Toph, Katara and the talk ───────────────────────────── */
export function Cheerers() {
    return (
        <>
            <TophForm x={GAG.toph.x} y={GAG.toph.y} s={GAG.toph.s} cheer />
            <KataraForm x={GAG.katara.x} y={GAG.katara.y} s={GAG.katara.s} />
        </>
    )
}

export function GagBubbles() {
    const reduce = useReducedMotion()
    const at = (who: 'toph' | 'aang' | 'sokka' | 'katara', dy: number) => ({ x: GAG[who].x, y: GAG[who].y - dy })
    const tm = (who: keyof typeof TALK) => (reduce ? undefined : { T, on: TALK[who][0], off: TALK[who][1] })
    return (
        <>
            {/* each tail tip sits just above the speaker's head (or raised hands) */}
            <SpeechBubble {...at('toph', 64)} shift={22} lines={['I am not Toph.', 'I am Melon-Lord!', 'Muah-ha-ha-ha-ha!']} timing={reduce ? undefined : tm('toph')} />
            {!reduce && (
                <>
                    <SpeechBubble {...at('aang', 56)} shift={-14} lines={['Not cool,', 'Sokka!']} timing={tm('aang')} />
                    <SpeechBubble {...at('sokka', 76)} lines={['Katara,', 'get the glue!']} timing={tm('sokka')} />
                    <SpeechBubble {...at('katara', 68)} shift={6} lines={['You break it,', 'you fix it!']} timing={tm('katara')} />
                    {/* …and Toph has the last word */}
                    <SpeechBubble {...at('toph', 64)} shift={14} lines={['Looks fine', 'to me!']} timing={tm('toph2')} />
                </>
            )}
        </>
    )
}