/**
 * THE QUIDDITCH TIMELINE — every position, heading, opacity and score in the Space catch strip as a plain function of ONE clock `t`
 * (seconds, 0 ≤ t < DUR). The scene samples these into SMIL keyframes (all `dur = DUR`, `repeatCount = indefinite`), and a
 * reduced-motion visitor gets the same functions evaluated once, at T.STILL. Nothing here knows about React.
 *
 * GRYFFINDOR (scarlet & gold, the lion)  vs  SLYTHERIN (emerald & silver, the snake) — a Chaser, a Beater, a Keeper and a Seeker each.
 *
 *    0 – 22   the match. Slytherin's Chaser scores first (3.2), Gryffindor answers (7.4), Slytherin scores again (11.6), Gryffindor's
 *             next shot goes wide (15.8): Slytherin leads 20 – 10. Both Seekers chase the Snitch; it jinks away from a Bludger.
 *   ~22.0     Harry dives and grabs the Snitch: +150 → Gryffindor 160, Slytherin 20. The game is over: the match behind him FREEZES.
 *   22 – 27.4 "I've got the snitch!", "+150", FINAL scores, "Gryffindor Wins!"
 *   27.4 – 29 the bubble and banner fade, the Snitch is let go, everyone is back on their start marks; the scores reset to 0 – 0.
 *
 * The rest of the match runs on its own phase `p` (see bgPhase): it follows `t` except that it holds still while the game is over,
 * so it is a BG_PERIOD-second cycle that lines up with the DUR-second clock exactly once.
 *
 * Space: SVG units of the 780 × 120 canvas (the strip's viewBox is shifted so y = 0 is the top of this canvas). y grows downward.
 * Gaps are enforced by a checker (kept outside the repo) that walks this file at 20 ms steps.
 */
import { HARRY_HAND, HARRY_HEAD } from '@/app/components/scenery/quidditch'

export const DUR = 29
export type Pt = [number, number]

/* ───────── the beats (seconds) ───────── */
export const T = {
    REACH0: 20.9,       // Harry's front arm starts to stretch
    REACH1: 21.7,
    CATCH: 22.0,        // the fist closes on the Snitch
    FREEZE0: 22.4,      // the game is over: the rest of the match holds still
    FREEZE1: 27.4,
    BUBBLE_IN: 22.2,
    TAG_IN: 22.5,
    SCORE150: 22.6,     // the 150 lands on Gryffindor's board
    BANNER_IN: 23.3,
    BUBBLE_OUT0: 27.4,  // bubble, tag and banner fade
    BUBBLE_OUT1: 28.1,
    RELEASE: 27.6,      // the Snitch is let go
    STILL: 25.0,        // the reduced-motion frame: the catch pose, bubble and banner showing, final scores up
}
export const BG_PERIOD = DUR - (T.FREEZE1 - T.FREEZE0)

/** the background match's own clock: runs with t, holds while the game is over */
export const bgPhase = (t: number) => (t <= T.FREEZE0 ? t : t <= T.FREEZE1 ? T.FREEZE0 : t - (T.FREEZE1 - T.FREEZE0))

/* ───────── small maths ───────── */
const mod = (a: number, n: number) => ((a % n) + n) % n
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))
const smooth = (u: number) => { const k = clamp(u, 0, 1); return k * k * (3 - 2 * k) }
const lerp = (a: number, b: number, k: number) => a + (b - a) * k
const lerpPt = (a: Pt, b: Pt, k: number): Pt => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)]
type Knot = [number, number, number]       // t, x, y

/** Catmull–Rom through timed knots; `period` makes it wrap (first knot follows the last), otherwise the ends are clamped */
export function spline(knots: Knot[], period?: number): (t: number) => Pt {
    const n = knots.length
    const at = (i: number): Knot => {
        if (period) { const w = Math.floor(i / n); const k = knots[mod(i, n)]; return [k[0] + w * period, k[1], k[2]] }
        return knots[clamp(i, 0, n - 1)]
    }
    const tan = (i: number): Pt => {
        const a = at(i - 1), b = at(i + 1)
        const dt = b[0] - a[0] || 1
        return [(b[1] - a[1]) / dt, (b[2] - a[2]) / dt]
    }
    return (tIn: number) => {
        const t = period ? mod(tIn, period) : tIn
        let i = 0
        if (period) { while (i < n && knots[i][0] <= t) i++; i -= 1 } else { while (i < n - 1 && knots[i + 1][0] <= t) i++ }
        if (!period && (t <= knots[0][0])) return [knots[0][1], knots[0][2]]
        if (!period && (t >= knots[n - 1][0])) return [knots[n - 1][1], knots[n - 1][2]]
        const a = at(i), b = at(i + 1)
        const h = b[0] - a[0] || 1
        const u = (t - a[0]) / h
        const m0 = tan(i), m1 = tan(i + 1)
        const u2 = u * u, u3 = u2 * u
        const h00 = 2 * u3 - 3 * u2 + 1, h10 = u3 - 2 * u2 + u, h01 = -2 * u3 + 3 * u2, h11 = u3 - u2
        return [
            h00 * a[1] + h10 * h * m0[0] + h01 * b[1] + h11 * h * m1[0],
            h00 * a[2] + h10 * h * m0[1] + h01 * b[2] + h11 * h * m1[1],
        ]
    }
}

/** velocity by central difference */
const velocity = (f: (t: number) => Pt, t: number, d = 0.04): Pt => {
    const a = f(t - d), b = f(t + d)
    return [(b[0] - a[0]) / (2 * d), (b[1] - a[1]) / (2 * d)]
}

/** Facing and pitch of a flier from its path. `dir` flips when it has been heading the other way for a moment (hysteresis);
 *  `sx` is dir smoothed over a short window, so a turn-round squashes through zero instead of snapping; `pitch` follows the
 *  climb or dive, with a floor on the horizontal speed so the hairpins at the ends don't stand the sprite on its nose. */
function heading(pos: (t: number) => Pt, period: number, o: { v0?: (t: number) => number; gain?: number; max?: number; flip?: number; win?: number; pwin?: number } = {}) {
    const step = 0.02, n = Math.round(period / step)
    const v0 = o.v0 ?? (() => 55), gain = o.gain ?? 0.8, max = o.max ?? 62, flip = o.flip ?? 12, win = o.win ?? 0.18, pwin = o.pwin ?? 0.16
    const dir: number[] = [], vel: Pt[] = []
    for (let i = 0; i < n; i++) vel.push(velocity(pos, i * step))
    let d = vel[0][0] < 0 ? -1 : 1
    for (let pass = 0; pass < 2; pass++) for (let i = 0; i < n; i++) {
        const vx = vel[i][0]
        if (d > 0 && vx < -flip) d = -1
        else if (d < 0 && vx > flip) d = 1
        if (pass === 1) dir.push(d)
    }
    const raw = vel.map(([vx, vy], i) => dir[i] * Math.atan2(vy, Math.max(Math.abs(vx), v0(i * step))) * (180 / Math.PI) * gain)
    const avg = (arr: number[], i: number, w: number) => {
        const k = Math.max(1, Math.round(w / step)); let s = 0, c = 0
        for (let j = -k; j <= k; j++) { s += arr[mod(i + j, n)]; c++ }
        return s / c
    }
    const sxArr = dir.map((_, i) => avg(dir, i, win))
    const pitchArr = raw.map((_, i) => clamp(avg(raw, i, pwin), -max, max))
    const at = (arr: number[], t: number) => {
        const x = mod(t, period) / step, i = Math.floor(x), k = x - i
        return lerp(arr[i % n], arr[(i + 1) % n], k)
    }
    return { sx: (t: number) => at(sxArr, t), rot: (t: number) => at(pitchArr, t), dir: (t: number) => dir[Math.round(mod(t, period) / step) % n] }
}

/* ═══════════════════════════ one scale for the whole match ═══════════════════════════ */

/** every rider — both Seekers, Chasers, Keepers and Beaters — is the same drawing at the same size, so the match is in proportion */
export const PLAYER_S = 0.4
export const HEDWIG_S = 0.54
export const SNITCH_S = 0.65
/** the balls are drawn at half size to stay in proportion with the riders */
export const BALL_S = 0.6
/** the arm is half out when a player carries or reaches for the Quaffle */
export const HOLD_REACH = 0.5

/** an oval flown at constant speed: fraction 0 = the right-hand end, increasing counter-clockwise (up and over the top first) */
function arcOval(cx: number, cy: number, rx: number, ry: number) {
    const N = 720
    const pts: Pt[] = [], cum: number[] = [0]
    for (let i = 0; i <= N; i++) { const a = (i / N) * Math.PI * 2; pts.push([cx + rx * Math.cos(a), cy - ry * Math.sin(a)]); if (i) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])) }
    const total = cum[N]
    return (frac: number): Pt => {
        const d = mod(frac, 1) * total
        let lo = 0, hi = N
        while (hi - lo > 1) { const m = (lo + hi) >> 1; if (cum[m] <= d) lo = m; else hi = m }
        const k = (d - cum[lo]) / (cum[hi] - cum[lo] || 1)
        return lerpPt(pts[lo], pts[hi], k)
    }
}
export type Pose = { x: number; y: number; sx: number; rot: number }

/** a point in a rider's own drawing, placed in the world (the same transform the scene applies) */
export function worldOf(pose: Pose, local: Pt, s = PLAYER_S): Pt {
    const a = (pose.rot * Math.PI) / 180
    const lx = local[0] * pose.sx * s, ly = local[1] * s
    return [pose.x + lx * Math.cos(a) - ly * Math.sin(a), pose.y + lx * Math.sin(a) + ly * Math.cos(a)]
}
/** the hand a rider holds the Quaffle in, in the world */
export const handOf = (pose: Pose, reach = HOLD_REACH): Pt => worldOf(pose, HARRY_HAND(reach))

/* ═══════════════════════════ the pitch ═══════════════════════════ */

/** one pitch: an oval lawn along the bottom, a goal of three hoops at each end, the scoreboards flanking it, everyone flying in
 *  the air above it, and the four stands far behind on a far ground line (y = FAR_GROUND) */
export const PITCH = { cx: 390, y: 123, rx: 300, ry: 3 }
export const FAR_GROUND = 76
export const GOAL_L = { x: 140, y: 123 }, GOAL_R = { x: 640, y: 123 }
export const HOOP_GAP = 7
export const HOOP_RING = { rx: 2.7, ry: 5.2 }
/** hoop heights in x order; the near outer hoop is the lowest, so a shot at it passes below the tall middle hoop */
export const HOOPS_L = [62, 72, 55], HOOPS_R = [55, 72, 62]
const ringY = (base: number, h: number) => base - h - HOOP_RING.ry + 0.8
export const RING_L: Pt = [GOAL_L.x + HOOP_GAP, ringY(GOAL_L.y, HOOPS_L[2])]
export const RING_R: Pt = [GOAL_R.x - HOOP_GAP, ringY(GOAL_R.y, HOOPS_R[0])]
/** where a shot that misses goes by: just under the near hoop */
export const MISS_R: Pt = [RING_R[0], RING_R[1] + 12]

/* ═══════════════════════════ the Seekers ═══════════════════════════ */

const LAP = 6                       // seconds for one lap of Harry's oval
const harryOvalF = arcOval(390, 102.5, 120, 7.5)
const dracoOvalF = arcOval(390, 101, 135, 10)
const snitchOvalF = arcOval(390, 100, 155, 12.5)
/** Draco swings past the left end of his oval at this time; Gryffindor's Beater bats a Bludger at him and he ducks under it */
export const DRACO_DUCK_T = 17.46
const DRACO_LAG = 0.41              // laps behind Harry
const SNITCH_LEAD = 0.30            // laps ahead of Harry, on a wider oval
const harryOval = (t: number): Pt => harryOvalF(t / LAP)
const dracoOval = (t: number): Pt => dracoOvalF(t / LAP - DRACO_LAG)

/* Harry: round the oval, then (from 19.5) a climb, a hairpin, and the dive to the grab at 22.0; hangs there; back on his mark by 29 */
const harryKnots: Knot[] = [
    ...Array.from({ length: 79 }, (_, i): Knot => { const t = i * 0.25; const [x, y] = harryOval(t); return [t, x, y] }),   // 0 → 19.5 on the oval
    [20.3, 372, 93.8],           // climbs along the top…
    [20.65, 357, 91.8],        // …a tight hairpin at the top of the dive…
    [21.0, 372, 94.5],
    [21.5, 405, 104],           // …the dive…
    [22.0, 432, 111.2],           // the grab
    [22.6, 433.5, 110.2],       // hangs there, a gentle bob
    [23.6, 433, 111.5],
    [25.0, 433, 110.4],
    [26.4, 433, 111.5],
    [27.4, 432, 111],
    [28.0, 449, 108.8],           // off again
    [28.6, 478, 105],
]
const harryPath = spline(harryKnots, DUR)
const harryH = heading(harryPath, DUR, { v0: t => (t >= 20.9 && t <= 22.1 ? 12 : 30), gain: 0.85, max: 60 })
/** the dive tips him a little further nose-down than his path alone would */
const diveBump = (t: number) => (t > 20.9 && t < 22.3 ? 18 * Math.sin((Math.PI * (t - 20.9)) / 1.4) : 0)
export const harry = (t: number): Pose => { const [x, y] = harryPath(t); return { x, y, sx: harryH.sx(t), rot: harryH.rot(t) + diveBump(t) } }
/** the stretch of the front arm, 0 – 1 */
export const harryReach = (t: number) => {
    if (t < T.REACH0) return 0
    if (t < T.REACH1) return smooth((t - T.REACH0) / (T.REACH1 - T.REACH0))
    if (t < 27.5) return 1
    if (t < 28.0) return 1 - smooth((t - 27.5) / 0.5)
    return 0
}
export const harryWorld = (t: number, local: Pt): Pt => worldOf(harry(t), local)
export const harryHand = (t: number): Pt => harryWorld(t, HARRY_HAND(harryReach(t)))

/** the duck: down a few units as the Bludger passes over, then back */
const duck = (t: number) => (t > DRACO_DUCK_T - 0.45 && t < DRACO_DUCK_T + 1.4 ? 6 * smooth((t - (DRACO_DUCK_T - 0.45)) / 0.25) * (1 - smooth((t - (DRACO_DUCK_T + 0.6)) / 0.7)) : 0)

/* Draco: close behind Harry on a slightly wider oval all match; when Harry dives he is a length late and hangs back, arm out */
const dracoKnots: Knot[] = [
    ...Array.from({ length: 89 }, (_, i): Knot => { const t = i * 0.25; const [x, y] = dracoOval(t); return [t, x, y + duck(t)] }),   // 0 → 22 on the oval
    [23.2, 318, 107.5],
    [24.4, 326, 111.2],
    [25.6, 330, 112.5],
    [26.8, 326, 111.2],
    [27.8, 304, 107.5],
    [28.5, 284, 106.2],
]
const dracoPath = spline(dracoKnots, DUR)
const dracoH = heading(dracoPath, DUR, { v0: () => 30, gain: 0.8, max: 45 })
export const draco = (t: number): Pose => { const [x, y] = dracoPath(t); return { x, y, sx: dracoH.sx(t), rot: dracoH.rot(t) } }
export const dracoReach = (t: number) => {
    if (t < 22.6) return 0
    if (t < 23.4) return 0.9 * smooth((t - 22.6) / 0.8)
    if (t < 26.0) return 0.9
    if (t < 27.0) return lerp(0.9, 0.3, smooth((t - 26.0) / 1.0))
    if (t < 28.0) return 0.3 * (1 - smooth((t - 27.0) / 1.0))
    return 0
}

/* ═══════════════════════════ the Snitch ═══════════════════════════ */

const snOval = (t: number): Pt => snitchOvalF(t / LAP + SNITCH_LEAD)
const tri = (u: number) => 1 - 4 * Math.abs(mod(u, 1) - 0.5)          // triangle wave, −1 … 1
/** a loop-the-loop of radius r between t0 and t0 + d, as an offset from the path */
const loop = (t: number, t0: number, d: number, r: number): Pt => {
    if (t < t0 || t > t0 + d) return [0, 0]
    const u = (t - t0) / d, a = u * Math.PI * 2, w = Math.sin(u * Math.PI)
    return [r * Math.sin(a) * w, r * (Math.cos(a) - 1) * w]
}
/** the Bludger dives at the Snitch at DODGE_T; the Snitch jinks down out of its way */
export const DODGE_T = 14.6
/** the zig-zag: a steep triangle wave across the heading, the jink at DODGE_T, and a few loops */
function zig(t: number): Pt {
    const jitter = 3 * tri(t / 0.9)
    const dodge = t > DODGE_T - 0.45 && t < DODGE_T + 1.4 ? 6.5 * smooth((t - (DODGE_T - 0.45)) / 0.25) * (1 - smooth((t - (DODGE_T + 0.6)) / 0.7)) : 0
    const l1 = loop(t, 2.3, 0.55, 3), l2 = loop(t, 6.0, 0.5, 2.8), l3 = loop(t, 15.4, 0.55, 3)
    return [l1[0] + l2[0] + l3[0], jitter + dodge + l1[1] + l2[1] + l3[1]]
}
const SNITCH_LEAD_END = 20.4
const snitchBase = (t: number): Pt => { const [x, y] = snOval(t); const z = zig(t); return [x + z[0], y + z[1]] }
/** after Harry's hairpin the Snitch lures him down and across, then hovers by the spot where his hand will be */
const snitchAuthored = spline([
    [20.4, ...snitchBase(20.4)],
    [20.9, 452, 110],
    [21.3, 480, 103.8],
    [21.6, 490, 95],
    [21.9, 462, 106.2],
    [22.0, 450, 108.8],
])
/** after the release: out and over Harry's head to the lead position at the top of the next lap */
const snitchReturn = spline([
    [27.6, 450, 108.8],
    [28.0, 470, 106.2],
    [28.3, 492, 92.5],
    [28.6, 466, 86.2],
    [29.0, ...snitchBase(0)],
])
export function snitch(t: number): Pt {
    if (t < SNITCH_LEAD_END) return snitchBase(t)
    if (t < 21.5) return snitchAuthored(t)
    if (t < T.CATCH) {
        // being pulled into the hand: ease from the lure onto the fist
        const k = smooth((t - 21.5) / (T.CATCH - 21.5))
        return lerpPt(snitchAuthored(t), harryHand(t), k * k)
    }
    if (t < T.RELEASE) return harryHand(t)
    if (t < T.RELEASE + 0.3) return lerpPt(harryHand(t), snitchReturn(t), smooth((t - T.RELEASE) / 0.3))
    return snitchReturn(t)
}
/** only used to lean the Snitch's wings a little into its turns */
export const snitchTilt = (t: number) => {
    const [vx, vy] = velocity(snitch, mod(t, DUR), 0.05)
    return clamp(Math.atan2(vy, Math.max(Math.abs(vx), 40)) * (180 / Math.PI) * 0.5, -35, 35) * (vx < 0 ? -1 : 1)
}
export const snitchFacing = (t: number) => (velocity(snitch, mod(t, DUR), 0.08)[0] < -6 ? -1 : 1)

/** Hedwig perches on the top-right corner of the Gryffindor scoreboard and the white ferret on the top-left corner of Slytherin's — both
 *  the same size and both facing the pitch (the scene draws the boards) */
export const FERRET_S = 0.5
export const HEDWIG_AT: Pt = [72, 53.4]
export const FERRET_AT: Pt = [717, 57.5]

/* ═══════════════════════════ the rest of the match ═══════════════════════════
 * Gryffindor: Chaser (Gc), Beater (Gb), Keeper (Gk, behind the left goal), Seeker (Harry).
 * Slytherin:  Chaser (Sc), Beater (Sb), Keeper (Sk, behind the right goal), Seeker (Draco).
 * One Quaffle, two Bludgers, the Snitch — every ball is on screen for the whole loop: after a goal (or a miss) the Keeper behind
 * the hoops catches the Quaffle and throws it back to his own Chaser, as the rules say, so nothing ever fades in or out.
 *
 *   p  0 – 2.4   Sc carries the Quaffle left;   3.2  Sc scores at the left hoop (+10 Slytherin) → Gk catches → throws to Gc (5.1)
 *      6.6 – 7.4 Gc carries it right and scores (+10 Gryffindor) → Sk catches → throws to Sc (9.3)
 *      10.8–11.6 Sc scores again (+10 Slytherin) → Gk → Gc (13.5)
 *      15.0–15.8 Gc shoots… and misses → Sk → Sc (17.7), who holds it while the game is frozen
 *   Gb bats Bludger 1 (it laps a short oval beside him); Sb bats Bludger 2 at the Snitch (DODGE_T), it climbs away and comes home.
 */
const chaserS = spline([
    [0, 410, 72], [1.4, 320, 72], [2.4, 238, 71], [3.2, 224, 72], [4.8, 250, 74], [7.0, 300, 72.5], [9.3, 340, 72],
    [10.8, 238, 71], [11.6, 224, 72], [13.5, 290, 74], [15.5, 330, 72.5], [17.7, 366, 72.5], [19.5, 364, 71.5], [22.4, 358, 71.5], [24, 410, 72],
], BG_PERIOD)
const chaserG = spline([
    [0, 500, 52], [2.4, 470, 53], [4.0, 448, 53], [5.1, 440, 53], [6.6, 542, 51], [7.4, 552, 52], [9.0, 520, 53],
    [11.0, 480, 53], [13.5, 440, 53], [15.0, 542, 51], [15.8, 552, 52], [17.5, 540, 52], [19.5, 525, 52], [22.4, 512, 52], [24, 500, 52],
], BG_PERIOD)
const hS = heading(chaserS, BG_PERIOD, { v0: () => 25, gain: 0.5, max: 20, flip: 4, win: 0.25 })
const hG = heading(chaserG, BG_PERIOD, { v0: () => 25, gain: 0.5, max: 20, flip: 4, win: 0.25 })
const bob = (p: number, phase = 0, amp = 0.75): number => amp * Math.sin((2 * Math.PI * (p - phase)) / 4)
/** poses by background phase p (the Quaffle needs these: its hand-offs are timed on p, not on t) */
const chaserSAt = (p: number): Pose => { const [x, y] = chaserS(p); return { x, y, sx: hS.sx(p), rot: hS.rot(p) } }
const chaserGAt = (p: number): Pose => { const [x, y] = chaserG(p); return { x, y, sx: hG.sx(p), rot: hG.rot(p) } }
const keeperGAt = (p: number): Pose => ({ x: 112, y: 65 + bob(p, 0.4), sx: 1, rot: 0 })
const keeperSAt = (p: number): Pose => ({ x: 668, y: 65 + bob(p, 1.9), sx: -1, rot: 0 })
const beaterGAt = (p: number): Pose => ({ x: 205, y: 33 + bob(p, 1.1, 0.6), sx: 1, rot: 0 })
const beaterSAt = (p: number): Pose => ({ x: 575, y: 33 + bob(p, 2.6, 0.6), sx: -1, rot: 0 })
const atPhase = (f: (p: number) => Pose) => (t: number) => f(bgPhase(t))
export const chaserSPose = atPhase(chaserSAt), chaserGPose = atPhase(chaserGAt)
export const keeperGPose = atPhase(keeperGAt), keeperSPose = atPhase(keeperSAt)
export const beaterGPose = atPhase(beaterGAt), beaterSPose = atPhase(beaterSAt)

/* the Quaffle: always held, thrown or caught by someone */
type Ev = { by: 'S' | 'G'; shot0: number; ring: number; keep: number; throw0: number; catch: number; goal: boolean }
const EVENTS: Ev[] = [
    { by: 'S', shot0: 2.4, ring: 3.2, keep: 3.6, throw0: 4.0, catch: 5.1, goal: true },
    { by: 'G', shot0: 6.6, ring: 7.4, keep: 7.8, throw0: 8.2, catch: 9.3, goal: true },
    { by: 'S', shot0: 10.8, ring: 11.6, keep: 12.0, throw0: 12.4, catch: 13.5, goal: true },
    { by: 'G', shot0: 15.0, ring: 15.8, keep: 16.2, throw0: 16.6, catch: 17.7, goal: false },
]
const arc = (a: Pt, b: Pt, k: number, lift: number): Pt => [lerp(a[0], b[0], k), lerp(a[1], b[1], k) - lift * Math.sin(k * Math.PI)]
export function quaffle(t: number): Pt {
    const p = bgPhase(t)
    const hs = (q: number) => handOf(chaserSAt(q)), hg = (q: number) => handOf(chaserGAt(q))
    const kg = (q: number) => handOf(keeperGAt(q)), ks = (q: number) => handOf(keeperSAt(q))
    if (p < EVENTS[0].shot0) return hs(p)                                   // the loop starts with Sc carrying it
    for (let i = 0; i < EVENTS.length; i++) {
        const e = EVENTS[i], s = e.by === 'S'
        const shooter = s ? hs : hg, keeper = s ? kg : ks, receiver = s ? hg : hs
        const target: Pt = s ? RING_L : e.goal ? RING_R : MISS_R
        const seg = (a: number, b: number) => (p - a) / (b - a)
        if (p < e.shot0) return shooter(p)
        if (p < e.ring) return lerpPt(shooter(e.shot0), target, seg(e.shot0, e.ring))
        if (p < e.keep) return lerpPt(target, keeper(e.keep), seg(e.ring, e.keep))
        if (p < e.throw0) return keeper(p)
        if (p < e.catch) return arc(keeper(e.throw0), receiver(e.catch), seg(e.throw0, e.catch), s ? 6 : -5)
        const next = EVENTS[i + 1]
        if (!next || p < next.shot0) return receiver(p)
    }
    return hs(p)
}

/* the scoreboards: 10 for each goal, 150 for the Snitch */
export const SCORE_STEPS: { t: number; g: number; s: number }[] = [
    { t: 0, g: 0, s: 0 },
    ...(() => { let g = 0, s = 0; const out: { t: number; g: number; s: number }[] = []; for (const e of EVENTS) { if (!e.goal) continue; if (e.by === 'S') s += 10; else g += 10; out.push({ t: e.ring, g, s }) } return out })(),
]
export const FINAL_G = SCORE_STEPS[SCORE_STEPS.length - 1].g + 150, FINAL_S = SCORE_STEPS[SCORE_STEPS.length - 1].s
SCORE_STEPS.push({ t: T.SCORE150, g: FINAL_G, s: FINAL_S })
export const scoreAt = (t: number) => { let cur = SCORE_STEPS[0]; for (const st of SCORE_STEPS) if (t >= st.t) cur = st; return cur }

/** the "+10" tags: pop beside the hoop the Quaffle goes through, stay a moment, fade (a score tag, not a ball) */
function tagAt(t: number, p0: number): { o: number; s: number } {
    const p = bgPhase(t), p1 = p0 + 1.7
    if (p < p0 || p > p1 + 0.4) return { o: 0, s: 0.6 }
    const inK = smooth((p - p0) / 0.18), outK = 1 - smooth((p - p1) / 0.4)
    return { o: inK * outK, s: lerp(0.6, 1, inK) + 0.12 * Math.sin(clamp((p - p0) / 0.3, 0, 1) * Math.PI) }
}
const goalsL = EVENTS.filter(e => e.by === 'S' && e.goal).map(e => e.ring), goalsR = EVENTS.filter(e => e.by === 'G' && e.goal).map(e => e.ring)
const tagOf = (ts: number[]) => (t: number) => ts.map(p0 => tagAt(t, p0)).reduce((a, b) => (b.o > a.o ? b : a))
export const tagL = tagOf(goalsL), tagR = tagOf(goalsR)
export const TAG_L_AT: Pt = [GOAL_L.x + 28, 92], TAG_R_AT: Pt = [GOAL_R.x - 28, 92]

/* Bludger 1 laps a short oval beside Beater G, is batted at Draco at G_HIT, passes just over him as he ducks (DRACO_DUCK_T) and swings
   back up to the Beater — the mirror of Beater S's Bludger 2. */
const B1 = { cx: 240, cy: 33, rx: 20, ry: 2.5, per: 6 }
export const G_HIT = DRACO_DUCK_T - 1.3
const b1Orbit = (p: number): Pt => { const a = (2 * Math.PI * (p - G_HIT)) / B1.per + Math.PI; return [B1.cx + B1.rx * Math.cos(a), B1.cy - B1.ry * Math.sin(a)] }
const nearMissG: Pt = (() => { const [x, y] = dracoOval(DRACO_DUCK_T); return [x + 2, y - 12] })()
const b1Dive: Knot[] = [
    [G_HIT, ...b1Orbit(G_HIT)],
    [G_HIT + 0.55, ...lerpPt(b1Orbit(G_HIT), nearMissG, 0.4)],
    [DRACO_DUCK_T, ...nearMissG],
    [DRACO_DUCK_T + 0.6, nearMissG[0] + 16, nearMissG[1] - 17],
    [DRACO_DUCK_T + 1.2, ...lerpPt(nearMissG, b1Orbit(G_HIT + 3), 0.7)],
    [G_HIT + 3, ...b1Orbit(G_HIT + 3)],
]
const b1Knots: Knot[] = [...b1Dive.map(k => [mod(k[0], BG_PERIOD), k[1], k[2]] as Knot)]
for (let q = 3.5; q < BG_PERIOD; q += 0.5) b1Knots.push([mod(G_HIT + q, BG_PERIOD), ...b1Orbit(G_HIT + q)])
b1Knots.sort((x, y) => x[0] - y[0])
const b1Path = spline(b1Knots, BG_PERIOD)
export const bludger1 = (t: number): Pt => b1Path(bgPhase(t))
/** bat angle (deg, about the grip): held up and back, then a hard swing at each pass; `hits` are the p-times of the hits */
function swing(p: number, hits: number[]): number {
    const rest = -55
    for (const h of hits) {
        const q = mod(p - h + 0.35, BG_PERIOD)                         // 0 at the start of the wind-up before a hit
        if (q < 0.25) return lerp(rest, -115, smooth(q / 0.25))
        if (q < 0.5) return lerp(-115, 35, smooth((q - 0.25) / 0.25))
        if (q < 1.1) return lerp(35, rest, smooth((q - 0.5) / 0.6))
    }
    return rest
}
const HITS_G = [G_HIT]
export const B2_HIT = DODGE_T - 1.3
const HITS_S = [B2_HIT]
export const batGAngle = (t: number) => swing(bgPhase(t), HITS_G)
export const batSAngle = (t: number) => swing(bgPhase(t), HITS_S)
/** a tiny three-line burst at a hit: 0 → 1 → 0 over 0.3 s */
function hitBurst(t: number, hits: number[]): number {
    const p = bgPhase(t)
    for (const h of hits) { const q = mod(p - h, BG_PERIOD); if (q < 0.3) return Math.sin((q / 0.3) * Math.PI) }
    return 0
}
export const BURST_G: Pt = [B1.cx - B1.rx, B1.cy], BURST_S: Pt = [558, 33]
export const hitBurstG = (t: number) => hitBurst(t, HITS_G), hitBurstS = (t: number) => hitBurst(t, HITS_S)

/** Bludger 2 laps beside Beater S, is batted at the Snitch at B2_HIT, grazes it at DODGE_T, and swings back up to the Beater.
 *  The near miss is built from the Snitch's own path so the two always agree. */
const B2 = { cx: 540, cy: 33, rx: 20, ry: 2.5, per: 6 }
const b2Orbit = (p: number): Pt => { const a = (2 * Math.PI * (p - B2_HIT)) / B2.per; return [B2.cx + B2.rx * Math.cos(a), B2.cy - B2.ry * Math.sin(a)] }
const nearMiss: Pt = (() => { const s = snitchBase(DODGE_T); return [s[0] - 2, s[1] - 10] })()
const b2Dive: Knot[] = [
    [B2_HIT, ...b2Orbit(B2_HIT)],
    [B2_HIT + 0.55, ...lerpPt(b2Orbit(B2_HIT), nearMiss, 0.4)],
    [DODGE_T, ...nearMiss],
    [DODGE_T + 0.6, nearMiss[0] + 20, nearMiss[1] - 17],
    [DODGE_T + 1.2, ...lerpPt(nearMiss, b2Orbit(B2_HIT + 3), 0.7)],
    [B2_HIT + 3, ...b2Orbit(B2_HIT + 3)],
]
const b2Knots: Knot[] = [...b2Dive.map(k => [mod(k[0], BG_PERIOD), k[1], k[2]] as Knot)]
for (let q = 3.5; q < BG_PERIOD; q += 0.5) b2Knots.push([mod(B2_HIT + q, BG_PERIOD), ...b2Orbit(B2_HIT + q)])
b2Knots.sort((a, b) => a[0] - b[0])
const b2Path = spline(b2Knots, BG_PERIOD)
export const bludger2 = (t: number): Pt => b2Path(bgPhase(t))

/* ═══════════════════════════ the crowd, the bubble, the banner ═══════════════════════════ */

/** the stands chant in turns: red for Gryffindor ("Go, Go, Gryffindor!"), green for Slytherin ("Slytherin for the win!") */
const CHANT_RED: [number, number][] = [[0.6, 4.2], [8.4, 12.0], [16.2, 19.8], [23.0, 27.4]]
const CHANT_GREEN: [number, number][] = [[4.4, 8.0], [12.2, 15.8], [20.0, 22.4]]
function chantOf(wins: [number, number][]) {
    return (t: number): { o: number; s: number } => {
        for (const [a, b] of wins) if (t >= a && t <= b) { const inK = smooth((t - a) / 0.25), outK = 1 - smooth((t - (b - 0.3)) / 0.3); return { o: inK * outK, s: lerp(0.85, 1, inK) } }
        return { o: 0, s: 0.85 }
    }
}
export const chantRed = chantOf(CHANT_RED), chantGreen = chantOf(CHANT_GREEN)

/** the speech bubble's tail tip sits just above Harry's hair at the catch, fixed for the whole beat */
export const BUBBLE_AT: Pt = (() => { const p = harryWorld(T.STILL, [HARRY_HEAD[0] + 1, HARRY_HEAD[1] - 11]); return [Math.round(p[0] * 10) / 10, Math.round(p[1] * 10) / 10] })()
export const TAG150_AT: Pt = (() => { const h = harryWorld(T.STILL, HARRY_HAND(1)); return [Math.round(h[0] + 32), Math.round(h[1] + 3)] })()
const fadeOut = (t: number) => 1 - smooth((t - T.BUBBLE_OUT0) / (T.BUBBLE_OUT1 - T.BUBBLE_OUT0))
export function bubble(t: number): { o: number; s: number } {
    if (t < T.BUBBLE_IN || t > T.BUBBLE_OUT1) return { o: 0, s: 0.85 }
    const inK = smooth((t - T.BUBBLE_IN) / 0.2)
    return { o: inK * fadeOut(t), s: lerp(0.85, 1, inK) }
}
export function tag150(t: number): { o: number; s: number } {
    if (t < T.TAG_IN || t > T.BUBBLE_OUT1) return { o: 0, s: 0.4 }
    const u = clamp((t - T.TAG_IN) / 0.35, 0, 1)
    return { o: smooth(u * 2) * fadeOut(t), s: lerp(0.4, 1, smooth(u)) + 0.18 * Math.sin(u * Math.PI) }
}
/** "Gryffindor Wins!" and the FINAL labels on the boards */
export function banner(t: number): { o: number; s: number } {
    if (t < T.BANNER_IN || t > T.BUBBLE_OUT1) return { o: 0, s: 0.8 }
    const u = clamp((t - T.BANNER_IN) / 0.45, 0, 1)
    return { o: smooth(u) * fadeOut(t), s: lerp(0.8, 1, smooth(u)) + 0.1 * Math.sin(u * Math.PI) }
}

/* ═══════════════════════════ sampling for SMIL ═══════════════════════════ */

/** Sample f over [0, DUR] and keep only the keyframes that matter (Ramer–Douglas–Peucker on each channel, within `tol`),
 *  so piecewise-linear tracks like fades stay a few numbers long while a looping path keeps its curve. Linear interpolation
 *  between keyframes is what SMIL does, so the result is exactly what the checker walked, to within `tol`. */
export function keyframes(f: (t: number) => number[], step: number, tol: number): { times: number[]; values: number[][] } {
    const n = Math.round(DUR / step)
    const ts = Array.from({ length: n + 1 }, (_, i) => +(i * step).toFixed(4))
    const vs = ts.map(t => f(t === DUR ? DUR - 1e-6 : t))
    const keep = new Array(ts.length).fill(false)
    keep[0] = keep[n] = true
    const rdp = (a: number, b: number) => {
        let worst = -1, wi = -1
        for (let i = a + 1; i < b; i++) {
            const k = (ts[i] - ts[a]) / (ts[b] - ts[a])
            let e = 0
            for (let c = 0; c < vs[i].length; c++) e = Math.max(e, Math.abs(vs[i][c] - lerp(vs[a][c], vs[b][c], k)))
            if (e > worst) { worst = e; wi = i }
        }
        if (worst > tol) { keep[wi] = true; rdp(a, wi); rdp(wi, b) }
    }
    rdp(0, n)
    const times: number[] = [], values: number[][] = []
    ts.forEach((t, i) => { if (keep[i]) { times.push(t); values.push(vs[i].map(v => +v.toFixed(2))) } })
    return { times, values }
}