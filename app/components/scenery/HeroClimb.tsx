'use client'
import type { ReactNode } from 'react'
import { L, F, DOT, MistBand } from './illustrations'
import { SHADE } from './illustrations/core'

/**
 * The hero's climb (Nature), drawn in the focal art's 640 × 700 space.
 *
 *   SummitPeak     the main mountain, redrawn with a small level crown at the top (and the snow cap sitting on it) so there is somewhere
 *                  to stand and plant a flag; the trail (see ClimbingHiker) arrives on that crown.
 *   FramingRange   two low, faded ridges either side of it — shoulders that lead the eye in to the summit and never rise to its height.
 *   ClimbingHiker  carries a flag up the trail on one clock (`dur` s): waits at the foot, climbs (shrinking as he goes away from us),
 *                  reaches the crown, swings the pole upright, sets it down among a few stones, raises his free hand, holds, and fades.
 *                  The next loop he is back at the foot with the flag in hand. Reduced motion: the finished picture, flag planted.
 */

/* ───────────── terrain helpers ───────────── */
type Pt = [number, number]
const r1 = (n: number) => Math.round(n * 10) / 10
const fmt = (p: Pt) => `${r1(p[0])} ${r1(p[1])}`
const lerp = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
const clamp01 = (n: number) => Math.max(0, Math.min(1, n))

/** a tiny seeded generator, so the server and the browser draw the very same rock */
function rng(seed: number) {
    let a = seed >>> 0
    return () => {
        a = (a + 0x6d2b79f5) >>> 0
        let t = a
        t = Math.imul(t ^ (t >>> 15), t | 1)
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

/**
 * A natural-looking line through `anchors`: every span is split in two again and again, each new middle point pushed sideways (across the
 * span) by a random amount that halves at every level — the way real ridges are rough at every scale. `damp` can calm it where a shape must
 * stay exact (the crown, the foot).
 */
function rugged(anchors: Pt[], seed: number, { rough = 0.14, depth = 3, decay = 0.56, damp }: { rough?: number; depth?: number; decay?: number; damp?: (p: Pt) => number } = {}): Pt[] {
    const rnd = rng(seed)
    const split = (a: Pt, b: Pt, k: number): Pt[] => {
        if (k >= depth) return [b]
        const dx = b[0] - a[0], dy = b[1] - a[1]
        const len = Math.hypot(dx, dy) || 1
        const m = lerp(a, b, 0.42 + rnd() * 0.16)
        const amp = len * rough * Math.pow(decay, k) * (damp ? damp(m) : 1)
        const off = (rnd() - 0.5) * 2 * amp
        const mm: Pt = [m[0] + (-dy / len) * off, m[1] + (dx / len) * off]
        return [...split(a, mm, k + 1), ...split(mm, b, k + 1)]
    }
    const out: Pt[] = [anchors[0]]
    for (let i = 1; i < anchors.length; i++) out.push(...split(anchors[i - 1], anchors[i], 0))
    return out
}

/** the ridge's height at x (the line runs left → right, so a plain scan finds the span) */
function yAt(pts: Pt[], x: number): number {
    for (let i = 1; i < pts.length; i++) {
        if (x <= pts[i][0] && pts[i][0] > pts[i - 1][0]) {
            const t = (x - pts[i - 1][0]) / (pts[i][0] - pts[i - 1][0])
            return pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * clamp01(t)
        }
    }
    return pts[pts.length - 1][1]
}

const poly = (pts: Pt[]) => `M${pts.map(fmt).join(' L')}`
const closed = (pts: Pt[], bottom = 702) => `${poly(pts)} L${r1(pts[pts.length - 1][0])} ${bottom} L${r1(pts[0][0])} ${bottom} Z`

/* ───────────── the mountain ───────────── */
/** the crown: where the trail ends and the flag goes (the hiker's feet land on this point) */
export const CROWN = { x: 409, y: 295 }
/** the summit's second, lower pad — a small level ledge a short way along the ridge from the crown, where Toph stands (her feet land on this point) */
export const SUMMIT_PAD = { x: 468, y: 325.6 }

/* The main mountain: a sharp summit pyramid with a level crown for the flag, a saddle, and a second small pad on the ridge beside it; steep, slightly
   concave flanks that flare out to a wide base; a rocky shoulder on each side. The flanks are hand-placed anchors, roughened only a little (so the line
   still reads as rock, never as a saw-tooth), and the roughness is calmed near the top and at the foot. Both flanks run all the way down to y = 700, so
   the base is hidden by the ground layers in front: the mountain grows out of the ground instead of being cut off above it. The crown and the pad are
   exact (not roughened), so the trail and the flag still land on the crown and Toph stands level on the pad. */
const calm = ([, y]: Pt) => clamp01((y - 318) / 90)
const LEFT_FLANK = rugged([[132, 702], [186, 664], [214, 634], [228, 610], [246, 592], [262, 566], [284, 528], [302, 494], [318, 460], [334, 426], [350, 392], [364, 360], [376, 334], [388, 312], [397, 297]], 11, { rough: 0.05, depth: 2, damp: calm })
const RIGHT_FLANK = rugged([[494, 330], [502, 348], [512, 370], [524, 396], [536, 420], [544, 440], [556, 452], [560, 474], [570, 504], [584, 542], [598, 578], [610, 608], [622, 638], [636, 668], [652, 702]], 23, { rough: 0.05, depth: 2, damp: calm })
const SPINE = rugged([[431, 299], [437, 330], [447, 372], [460, 414], [480, 466], [498, 514], [516, 562], [536, 610], [554, 656], [568, 702]], 37, { rough: 0.07, depth: 3, damp: calm })
const CROWN_PAD = 'Q412 291 428 297 L434 303 L440 314 Q446 322 454 324.5 Q468 327 482 324.5 Q490 322 494 330'
const OUTLINE = `${poly(LEFT_FLANK)} ${CROWN_PAD} ${RIGHT_FLANK.slice(1).map(p => `L${fmt(p)}`).join(' ')} Z`
const EAST_FACE = `M428 297 L434 303 L440 314 Q446 322 454 324.5 Q468 327 482 324.5 Q490 322 494 330 ${RIGHT_FLANK.slice(1).map(p => `L${fmt(p)}`).join(' ')} L${[...SPINE].reverse().map(fmt).join(' L')} Z`
/** a lit rib running down the sunny face from the summit, and the broken line of rock where it meets the lower slope */
const RIB = rugged([[391, 318], [372, 372], [350, 424], [326, 480], [300, 540], [266, 604], [238, 664]], 43, { rough: 0.05, depth: 3, damp: calm })

/* snow: soft drifts on the crown and the pad — the skyline is the mountain's own line; the underside is one smooth, rolling edge with rounded tongues */
const SNOW_TOP = `M385 316 L390 308 L397 297 ${CROWN_PAD} L500 340`
const SNOW_UNDER: Pt[] = [[500, 340], [494, 353], [487, 345], [481, 358], [473, 349], [465, 362], [457, 351], [449, 365], [443, 353], [437, 372], [429, 354], [421, 366], [415, 342], [407, 358], [400, 342], [393, 350], [385, 316]]
const SNOW = `${SNOW_TOP} ${smooth(SNOW_UNDER)} Z`
const SNOW_SHADE = `M428 297 L434 303 L440 314 Q446 322 454 324.5 Q468 327 482 324.5 Q490 322 494 330 L500 340 ${smooth(SNOW_UNDER.filter(p => p[0] >= 432))} L431 299 Z`

/** gullies: thin broken lines wandering down the sunny face (clear of the trail) and the shaded face */
const GULLIES: Pt[][] = [
    rugged([[384, 338], [374, 392], [350, 444], [326, 506]], 51, { rough: 0.06, depth: 3, damp: calm }),
    rugged([[352, 540], [334, 590], [318, 640]], 53, { rough: 0.06, depth: 3 }),
    rugged([[452, 340], [462, 396], [480, 442], [496, 492]], 54, { rough: 0.06, depth: 3 }),
    rugged([[512, 420], [524, 480], [546, 534], [562, 600]], 55, { rough: 0.06, depth: 3 }),
]
/** short rock ticks, in pairs, scattered over both faces: texture, not pattern */
const TICKS = 'M354 484 l9 3 M360 490 l7 2 M300 566 l9 3 M307 572 l6 2 M520 508 l-9 -3 M514 514 l-6 -2 M560 586 l-10 -3 M554 592 l-6 -2 M344 430 l8 3 M398 452 l7 2 M366 612 l9 2 M424 540 l-8 -3 M540 458 l-8 -2 M478 372 l-7 -2'

export function SummitPeak() {
    return (
        <g>
            <path d={OUTLINE} fill="var(--sc-mid)" stroke="currentColor" strokeWidth={1.3} strokeLinejoin="round" />
            <path d={EAST_FACE} {...SHADE} />
            <path d={poly(SPINE)} {...L} strokeWidth={0.9} opacity={0.34} strokeLinejoin="round" />
            <path d={poly(RIB)} {...L} strokeWidth={0.9} opacity={0.26} strokeLinejoin="round" />
            {/* gullies and a few ticks on the rock: enough to read as a mountain, never enough to compete with the trail */}
            {GULLIES.map((g, i) => <path key={i} d={poly(g)} {...L} strokeWidth={0.9} opacity={0.26} strokeLinejoin="round" />)}
            <path d={TICKS} {...L} strokeWidth={0.9} opacity={0.3} strokeLinecap="round" />
            {/* the snow on the crown and the pad: soft fill, the shaded wedge on the east side, the skyline kept as the mountain's own outline, a lighter underside */}
            <g strokeLinejoin="round" strokeLinecap="round">
                <path d={SNOW} fill="var(--sc-snow)" stroke="none" />
                <path d={SNOW_SHADE} {...SHADE} />
                <path d={SNOW_TOP} {...L} strokeWidth={1.1} />
                <path d={`M${fmt(SNOW_UNDER[0])}${smooth(SNOW_UNDER)}`} {...L} strokeWidth={0.8} opacity={0.45} />
            </g>
            {/* the veil of haze round the upper mountain — held inside its silhouette, so it clings to the slopes instead of hanging in the sky beside them */}
            <clipPath id="sc-summit-clip"><path d={OUTLINE} /></clipPath>
            <g stroke="none" fill="var(--scene-fill)" clipPath="url(#sc-summit-clip)">
                <ellipse cx={402} cy={452} rx={132} ry={15} opacity={0.5} />
                <ellipse cx={432} cy={490} rx={158} ry={17} opacity={0.34} />
                <ellipse cx={376} cy={530} rx={132} ry={13} opacity={0.24} />
            </g>
        </g>
    )
}

/* ───────────── the backdrop: ranges behind the summit ───────────── */
/** a peak's shaded east face: from the summit down its right-hand ridge, back up a ragged spine */
function eastFace(ridge: Pt[], i: number, seed: number, bottom = 704): string {
    const P = ridge[i]
    let j = i + 1
    while (j < ridge.length - 1 && ridge[j + 1][1] >= ridge[j][1]) j++     // follow the ridge down until it levels out / turns up
    const R = ridge[j]
    if (R[0] - P[0] < 14) return ''
    const rnd = rng(seed)
    const foot: Pt = [lerp(P, R, 0.18)[0], Math.min(bottom + 2, R[1] + (R[1] - P[1]) * 0.9 + 26)]
    const spine = rugged([P, [P[0] + (foot[0] - P[0]) * 0.35 + (rnd() - 0.5) * 4, P[1] + (foot[1] - P[1]) * 0.45], foot], seed + 1, { rough: 0.12, depth: 3 })
    const down = ridge.slice(i, j + 1)
    return `${poly(down)} L${fmt([R[0] - 3, foot[1]])} L${spine.slice().reverse().map(fmt).join(' L')} Z`
}

/** a smooth line through `pts` (Catmull-Rom turned into cubic Béziers) — continues from the current point, which must be pts[0]. No corners anywhere, so snow reads as drifted snow, not a cut-out. */
function smooth(pts: Pt[]): string {
    let d = ''
    for (let k = 0; k < pts.length - 1; k++) {
        const p0 = pts[Math.max(0, k - 1)], p1 = pts[k], p2 = pts[k + 1], p3 = pts[Math.min(pts.length - 1, k + 2)]
        const c1: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
        const c2: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
        d += ` C${fmt(c1)} ${fmt(c2)} ${fmt(p2)}`
    }
    return d
}

/**
 * The snow on the peak at ridge[i]. Its top is the mountain's own skyline (so the cap always fits the silhouette exactly); its underside is a
 * soft, gently rolling snowline — two slow waves plus a few rounded tongues of snow reaching down the gullies — drawn as one smooth curve,
 * never closer than a hair to the skyline, and meeting the ridge at both ends. `shade` is the sun-less (right-hand) side of the cap.
 */
function snowCap(ridge: Pt[], i: number, depth: number, seed: number): { fill: string; top: string; edge: string; shade: string } | null {
    const P = ridge[i]
    const line = P[1] + depth
    let a = i, b = i
    while (a > 0 && ridge[a - 1][1] < line) a--
    while (b < ridge.length - 1 && ridge[b + 1][1] < line) b++
    if (b - a < 2) return null
    const rnd = rng(seed)
    const xa = ridge[a][0], xb = ridge[b][0], span = xb - xa
    if (span < 8) return null
    const ph1 = rnd() * 6.28, ph2 = rnd() * 6.28
    const tongues = Array.from({ length: Math.max(1, Math.round(span / 40)) }, () => ({ c: xa + span * (0.14 + rnd() * 0.72), w: 4 + rnd() * 5, h: depth * (0.16 + rnd() * 0.24) }))
    const under = (x: number) => {
        let y = line + depth * 0.16 * Math.sin(x * 0.11 + ph1) + depth * 0.08 * Math.sin(x * 0.27 + ph2)
        for (const t of tongues) y += t.h * Math.exp(-(((x - t.c) / t.w) ** 2))
        return Math.max(yAt(ridge, x) + 2.2, y)
    }
    // knots along the underside, left → right; the two ends sit exactly on the skyline
    const n = Math.max(4, Math.ceil(span / 5))
    const knots: Pt[] = Array.from({ length: n + 1 }, (_, k) => {
        const x = xa + (span * k) / n
        return [x, k === 0 ? ridge[a][1] : k === n ? ridge[b][1] : under(x)] as Pt
    })
    const back = knots.slice().reverse()
    const top = poly(ridge.slice(a, b + 1))
    const edge = `M${fmt(back[0])}${smooth(back)}`
    // the shaded side: only a narrow wedge on the summit's right — down the skyline for ≤ 28 units, back along the underside, up a short spine to the summit
    let e = i
    const reach = Math.min(28, depth * 0.55)
    while (e < b && ridge[e + 1][0] <= P[0] + reach) e++
    const spine: Pt = [P[0] + 3, under(P[0] + 3)]
    const wedge: Pt[] = [[ridge[e][0], under(ridge[e][0])], ...back.filter(k => k[0] > P[0] + 3 && k[0] < ridge[e][0]), spine]
    const shade = e > i + 1 ? `${poly(ridge.slice(i, e + 1))} L${fmt(wedge[0])}${smooth(wedge)} Z` : ''
    return { fill: `${top}${smooth(back)} Z`, top, edge, shade }
}

/** a snow cap as drawn: soft fill, the narrow shaded wedge, the skyline kept as the mountain's own outline, a lighter underside line */
function Snow({ c }: { c: NonNullable<ReturnType<typeof snowCap>> }) {
    return (
        <g strokeLinejoin="round" strokeLinecap="round">
            <path d={c.fill} fill="var(--sc-snow)" stroke="none" opacity={0.97} />
            {c.shade && <path d={c.shade} {...SHADE} />}
            <path d={c.top} {...L} strokeWidth={1} />
            <path d={c.edge} {...L} strokeWidth={0.8} opacity={0.45} />
        </g>
    )
}

/** one range: its ridge, snow on the high peaks, shaded faces on the biggest, a few wandering gullies */
function Range({ pts, seed, fill, snowAbove, snowDepth, shade, o = 1, bottom = 702 }: { pts: Pt[]; seed: number; fill: string; snowAbove: number; snowDepth: number; shade: boolean; o?: number; bottom?: number }) {
    const peaks: number[] = []
    for (let i = 3; i < pts.length - 3; i++) {
        let top = true
        for (let k = -3; k <= 3; k++) if (pts[i + k][1] < pts[i][1]) top = false
        if (top) peaks.push(i)
    }
    return (
        <g opacity={o}>
            <path d={closed(pts, bottom)} fill={fill} stroke="currentColor" strokeWidth={1} strokeLinejoin="round" />
            {shade && peaks.map(i => <path key={`s${i}`} d={eastFace(pts, i, seed + i, bottom)} {...SHADE} />)}
            {peaks.map(i => {
                if (pts[i][1] >= snowAbove) return null
                const c = snowCap(pts, i, snowDepth, seed + i * 3)
                return c ? <Snow key={`c${i}`} c={c} /> : null
            })}
            {peaks.filter(i => pts[i][1] < snowAbove + 40).map(i => {
                const P = pts[i]
                const g = rugged([[P[0] - 2, P[1] + snowDepth + 6], [P[0] - 8, P[1] + snowDepth + 40], [P[0] - 12, P[1] + snowDepth + 78]], seed + i * 7, { rough: 0.1, depth: 3 })
                return <path key={`g${i}`} d={poly(g)} {...L} strokeWidth={0.8} opacity={0.22} strokeLinejoin="round" />
            })}
        </g>
    )
}

// Each range is a few clear massifs — a sharp main summit, a lower neighbour, a saddle between — drawn from anchors, never a saw-tooth. Far ranges are pale and tall, the near
// ones green and lower, and none ever reaches the main summit's height. EVERY RANGE STARTS ON THE GROUND AT ITS OWN END: the left ones begin at the focal's left edge below the
// far ridge (so no vertical cut shows), and the right ones come back down to the ground before the right edge, so each mountain grows out of the land (the ground layers drawn in
// front hide the feet).
const FAR_L = rugged([[0, 634], [26, 596], [58, 548], [90, 500], [108, 468], [118, 454], [134, 484], [150, 512], [168, 504], [190, 470], [210, 440], [224, 428], [244, 466], [266, 510], [298, 556], [330, 598], [364, 640]], 101, { rough: 0.06, depth: 2 })
const FAR_R = rugged([[470, 650], [500, 604], [526, 560], [550, 516], [572, 476], [590, 446], [602, 438], [614, 462], [624, 488], [632, 512], [640, 566]], 102, { rough: 0.06, depth: 2 })
const MID_L = rugged([[0, 660], [24, 630], [56, 600], [84, 578], [102, 568], [124, 588], [148, 608], [174, 596], [198, 578], [212, 572], [236, 602], [272, 634], [316, 662], [372, 700]], 103, { rough: 0.05, depth: 2 })
const MID_R = rugged([[484, 700], [514, 654], [542, 618], [568, 590], [584, 576], [604, 596], [620, 614], [640, 640]], 104, { rough: 0.05, depth: 2 })

export function FramingRange() {
    const far = 'color-mix(in srgb, var(--sc-far) 70%, var(--scene-fill))'
    return (
        <g>
            {/* far range: a band of pale, snow-topped peaks right across the back, so the sky has a horizon to sit on */}
            <Range pts={FAR_L} seed={201} fill={far} snowAbove={540} snowDepth={21} shade o={0.82} />
            <Range pts={FAR_R} seed={202} fill={far} snowAbove={540} snowDepth={21} shade o={0.82} />
            {/* mist drifting between the ranges */}
            <MistBand x={10} y={612} w={330} h={18} o={0.36} />
            <MistBand x={470} y={612} w={260} h={18} o={0.4} />
            {/* near range: green, lit from the left, a dusting of snow on the highest */}
            <Range pts={MID_L} seed={301} fill="var(--sc-mid)" snowAbove={575} snowDepth={11} shade />
            <Range pts={MID_R} seed={302} fill="var(--sc-mid)" snowAbove={575} snowDepth={11} shade />
        </g>
    )
}

/* ───────────── the hiker ───────────── */
/* the pole, in the hiker's own units: it runs from the ground ahead of him (BOT), through his hand (8.6, −21), to a pennant on top (TOP) */
const BOT: [number, number] = [14.6, -0.6]
const TOP: [number, number] = [-4, -63.8]
const LEAN = (Math.atan2(BOT[0] - TOP[0], BOT[1] - TOP[1]) * 180) / Math.PI   // how far the carried pole leans (≈ 16°): rotating by this stands it upright
/**
 * A flag that flows. The hoist (the edge on the pole) is fixed; the rest of the cloth is one path whose top and bottom edges ripple along its length, the ripple
 * growing from nothing at the pole to its full height at the free end, and travelling downwind (to the right) — the way cloth really moves, instead of a
 * rigid shape rocking about a corner. Eight frames of the same path (same commands, only the numbers differ) are morphed by SMIL, so the loop is seamless and
 * every flag on the page shares one clock. The free end has a small swallow-tail. `animate={false}` (reduced motion) draws one still, gently rippled frame.
 */
const FLAG_FRAMES = 8
function clothFrame(x0: number, y0: number, w: number, h: number, amp: number, phase: number) {
    const N = 7
    const ripple = (u: number, shift: number) => amp * u * Math.sin(2 * Math.PI * 1.05 * u - phase + shift)
    const top: Pt[] = [], bot: Pt[] = []
    for (let k = 0; k <= N; k++) {
        const u = k / N, x = x0 + w * u
        top.push([x, y0 + ripple(u, 0)])
        bot.push([x, y0 + h + ripple(u, 0.4)])         // the lower edge is a touch behind the upper one: depth
    }
    const tail: Pt = [x0 + w * 0.8, (top[N][1] + bot[N][1]) / 2]
    const bback = bot.slice().reverse()
    const d = `M${fmt(top[0])}${smooth(top)} L${fmt(tail)} L${fmt(bback[0])}${smooth(bback)} Z`
    const fold = (u: number) => { const k = Math.round(u * N); return `M${fmt([top[k][0], top[k][1] + 0.8])} L${fmt([bot[k][0], bot[k][1] - 0.8])}` }
    return { d, folds: `${fold(0.43)} ${fold(0.72)}` }
}
export function FlowFlag({ x0, y0, w = 22, h = 12, amp = 2.8, animate = true, dur = 1.5 }: { x0: number; y0: number; w?: number; h?: number; amp?: number; animate?: boolean; dur?: number }) {
    const frames = Array.from({ length: FLAG_FRAMES }, (_, j) => clothFrame(x0, y0, w, h, amp, (2 * Math.PI * j) / FLAG_FRAMES))
    const still = clothFrame(x0, y0, w, h, amp * 0.8, 0.9)
    const morph = (key: 'd' | 'folds') => [...frames, frames[0]].map(f => f[key]).join(';')
    return (
        <g strokeLinejoin="round" strokeLinecap="round">
            <path d={animate ? frames[0].d : still.d} fill="var(--sc-accent)" stroke="currentColor" strokeWidth={1.1}>
                {animate && <animate attributeName="d" values={morph('d')} dur={`${dur}s`} repeatCount="indefinite" />}
            </path>
            <path d={animate ? frames[0].folds : still.folds} {...L} strokeWidth={0.7} opacity={0.32}>
                {animate && <animate attributeName="d" values={morph('folds')} dur={`${dur}s`} repeatCount="indefinite" />}
            </path>
        </g>
    )
}

function Pole({ x0, y0, x1, y1, wave = true, children }: { x0: number; y0: number; x1: number; y1: number; wave?: boolean; children?: ReactNode }) {
    // The flag hangs from the pole's own axis: its hoist edge is turned to lie along the pole (so a leaning, carried pole keeps its flag
    // attached, and once the pole is swung upright the cloth is level), and the pole is drawn OVER the hoist with a small finial on top.
    const len = Math.hypot(x1 - x0, y1 - y0), ux = (x1 - x0) / len, uy = (y1 - y0) / len
    const lean = (Math.atan2(x0 - x1, y0 - y1) * 180) / Math.PI
    const tipX = x1 + ux * 2.2, tipY = y1 + uy * 2.2
    return (
        <>
            <g transform={`rotate(${(-lean).toFixed(2)} ${x1} ${y1})`}>
                <FlowFlag x0={x1} y0={y1} animate={wave} />
            </g>
            <path d={`M${x0} ${y0} L${tipX.toFixed(2)} ${tipY.toFixed(2)}`} {...L} strokeWidth={1.6} />
            <circle cx={tipX.toFixed(2)} cy={tipY.toFixed(2)} r={1.3} fill="var(--sc-sign)" stroke="currentColor" strokeWidth={0.9} />
            {children}
        </>
    )
}

/** the hiker's body, as in the library's Hiker (minus the walking stick), with the arms left to the caller */
function Body({ walk, arms }: { walk: boolean; arms: ReactNode }) {
    const legA = <path d="M-1.4 -15 L-5.6 -7.5 L-6.4 -0.8 M-6.4 -0.8 H-1.6" {...L} strokeWidth={2.2} />
    const legB = <path d="M1.4 -15 L5.2 -8 L6.6 -0.8 M6.6 -0.8 H11" {...L} strokeWidth={2.2} />
    return (
        <>
            {walk ? <g className="scene-step2">{legA}</g> : legA}
            {walk ? <g className="scene-step">{legB}</g> : legB}
            <rect x={-14} y={-31} width={9.5} height={17} rx={3.4} fill="var(--sc-accent)" stroke="currentColor" strokeWidth={1.2} />
            <rect x={-14.6} y={-35.2} width={10.8} height={5} rx={2.4} fill="var(--sc-sign)" stroke="currentColor" strokeWidth={1.1} />
            <path d="M-12.2 -24.4 H-6.6" {...L} strokeWidth={1} opacity={0.55} />
            <path d="M-5.6 -29.6 Q1 -33.4 6.4 -29.4 L5.6 -14.2 Q0 -12.4 -5 -14.2 Z" {...F} />
            <path d="M-5 -17 Q0 -15.4 5.2 -17" {...L} strokeWidth={1} opacity={0.5} />
            {arms}
            <circle cx={1} cy={-36.6} r={4.3} fill="var(--sc-body)" stroke="currentColor" strokeWidth={1.1} />
            <path d="M-5.4 -38.8 H8" {...L} strokeWidth={1.6} />
            <path d="M-3 -38.8 Q1 -46.4 5.4 -38.8 Z" fill="var(--sc-accent)" stroke="currentColor" strokeWidth={1.1} strokeLinejoin="round" />
            <circle cx={2.6} cy={-36.4} r={0.7} {...DOT} />
        </>
    )
}

/** on the way up: the flag carried like a staff, the pennant held high over his head */
function CarryingHiker({ walk }: { walk: boolean }) {
    return (
        <g className={walk ? 'scene-bob' : undefined}>
            <Pole x0={BOT[0]} y0={BOT[1]} x1={TOP[0]} y1={TOP[1]} />
            <Body walk={walk} arms={<><path d="M3.4 -27.6 L8.6 -21" {...L} strokeWidth={2} /><path d="M-2.6 -27.4 L-4.4 -20.6" {...L} strokeWidth={2} /></>} />
        </g>
    )
}

/* the cheer: once the flag is in he throws his free hand up and waves it, hops with
   joy, and a few sparks pop round his raised hand. It lasts from `wave1` to `cheerEnd` (fractions of the loop). */
const BACK_UP_L = 'M-2.6 -27.4 L-12.2 -37.6'   // the raised hand swung out…
const BACK_UP_R = 'M-2.6 -27.4 L-5.6 -40.6'    // …and back over his head
const HOPS = 4                                  // hops (and wave cycles) over the cheer
const SPARKS: [number, number, number, number][] = [[-14.5, -46, 1, 0], [-4, -50, 0.8, 0.35], [-19.5, -36, 0.7, 0.18], [3, -45.5, 0.75, 0.5]]   // x, y, size, phase (0 … 1 over one cycle)
const STAR = 'M0 -3.4 L0.95 -0.95 L3.4 0 L0.95 0.95 L0 3.4 L-0.95 0.95 L-3.4 0 L-0.95 -0.95 Z'

const ARM_HOLD = 'M3.4 -27.6 L8.6 -21'
const ARM_ON_POLE = 'M3.4 -27.6 L13 -25.4'
const BACK_DOWN = 'M-2.6 -27.4 L-4.4 -20.6'
const BACK_UP = 'M-2.6 -27.4 L-9 -39'

/** at the top: swings the pole upright, then MOUNTS it — lifts it and drives it into the snow twice (his body dips into each thrust, a puff of snow kicks up
 *  each time, a heap packs round the foot) — then throws his free hand up and cheers (waves it, hops, sparks pop), and finally lowers his hand and just stands
 *  there a while, breathing the quiet. `t` are fractions of the loop. */
type PlantT = { turn0: number; turn1: number; lift1: number; thrust1: number; lift2: number; thrust2: number; wave1: number; cheerEnd: number; calm1: number; calmEnd: number }
function PlantingHiker({ animate, dur, t }: { animate: boolean; dur: string; t: PlantT }) {
    const loop = { dur, repeatCount: 'indefinite' as const }
    const ease = '0.4 0 0.6 1'
    const kt = (a: number[]) => a.map(v => v.toFixed(4)).join(';')
    const { turn0, turn1, lift1, thrust1, lift2, thrust2, wave1, cheerEnd, calm1, calmEnd } = t
    const upright = animate ? undefined : { transform: `rotate(${LEAN.toFixed(2)} ${BOT[0]} ${BOT[1]})` }
    // the pole's depth: stands, is lifted (−7), thrust (+1.2), lifted again (−3.5), thrust home (+2.4)
    const poleT = [0, turn1, lift1, thrust1, lift2, thrust2, 1], poleV = ['0 0', '0 0', '0 -7', '0 1.2', '0 -3.5', '0 2.4', '0 2.4']
    // his body dips into each thrust
    const dipT = [0, thrust1 - 0.006, thrust1, thrust1 + 0.008, thrust2 - 0.006, thrust2, thrust2 + 0.008, 1], dipV = ['0 0', '0 0', '0 1.7', '0 0', '0 0', '0 2', '0 0', '0 0']
    // the raised hand: up with an ease, waves back and forth until the cheer is over, then comes down
    const waveT: number[] = [0, thrust2, wave1], waveV: string[] = [BACK_DOWN, BACK_DOWN, BACK_UP], waveS: string[] = ['0 0 1 1', ease]
    for (let i = 0; i < HOPS * 2; i++) {
        waveT.push(wave1 + ((cheerEnd - wave1) * (i + 1)) / (HOPS * 2)); waveV.push(i % 2 === 0 ? BACK_UP_L : BACK_UP_R); waveS.push(ease)
    }
    waveT.push(calm1, 1); waveV.push(BACK_DOWN, BACK_DOWN); waveS.push(ease, '0 0 1 1')
    // the hops (the pole and the flag stay where they are)
    const hopT: number[] = [0, wave1], hopV: string[] = ['0 0', '0 0'], hopS: string[] = ['0 0 1 1']
    for (let i = 0; i < HOPS; i++) {
        hopT.push(wave1 + ((cheerEnd - wave1) * (i + 0.5)) / HOPS, wave1 + ((cheerEnd - wave1) * (i + 1)) / HOPS)
        hopV.push('0 -3.4', '0 0'); hopS.push('0.2 0.6 0.4 1', '0.6 0 0.8 0.4')
    }
    hopT.push(1); hopV.push('0 0'); hopS.push('0 0 1 1')
    // the quiet: two slow breaths while he looks out over the world
    const brT: number[] = [0, calm1], brV: string[] = ['0 0', '0 0'], brS: string[] = ['0 0 1 1']
    for (let i = 0; i < 2; i++) {
        brT.push(calm1 + ((calmEnd - calm1) * (i + 0.5)) / 2, calm1 + ((calmEnd - calm1) * (i + 1)) / 2)
        brV.push('0 -0.9', '0 0'); brS.push(ease, ease)
    }
    brT.push(1); brV.push('0 0'); brS.push('0 0 1 1')
    const hold = animate ? undefined : 'translate(0 2.4)'
    return (
        <g>
            <g transform={hold}>
                {animate && <animateTransform attributeName="transform" type="translate" values={poleV.join(';')} keyTimes={kt(poleT)} calcMode="spline" keySplines={poleT.slice(1).map((_, i) => (i === 0 || i === poleT.length - 2 ? '0 0 1 1' : ease)).join(';')} {...loop} />}
                <g transform={upright?.transform}>
                    {animate && <animateTransform attributeName="transform" type="rotate" values={`0 ${BOT[0]} ${BOT[1]};0 ${BOT[0]} ${BOT[1]};${LEAN} ${BOT[0]} ${BOT[1]};${LEAN} ${BOT[0]} ${BOT[1]}`} keyTimes={kt([0, turn0, turn1, 1])} calcMode="spline" keySplines={`0 0 1 1;${ease};0 0 1 1`} {...loop} />}
                    <Pole x0={BOT[0]} y0={BOT[1]} x1={TOP[0]} y1={TOP[1]} wave={animate} />
                </g>
            </g>
            {/* the pole goes into the snow: a heap packs round its foot at the first thrust, and a puff of snow kicks up at each */}
            <g opacity={animate ? 0 : 1}>
                {animate && <animate attributeName="opacity" values="0;0;1;1" keyTimes={kt([0, thrust1 - 0.001, thrust1, 1])} {...loop} />}
                <path d="M6.4 0.8 Q8.4 -3.4 14.6 -4.2 Q20.8 -3.4 22.8 0.8 Z" fill="var(--sc-snow)" stroke="currentColor" strokeWidth={1} strokeLinejoin="round" />
                <path d="M9.4 -1 Q12 -2.4 14.2 -2.2" {...L} strokeWidth={0.7} opacity={0.4} />
            </g>
            {animate && [thrust1, thrust2].map((at, n) => [[-5, -9, 0], [0, -12, 0.1], [5, -8, 0.05], [-2, -14, 0.15]].map(([dx, dy, dl], i) => (
                <circle key={`${n}-${i}`} cx={14.6} cy={-3} r={1.5 - i * 0.12} fill="var(--sc-snow)" stroke="currentColor" strokeWidth={0.6} opacity={0}>
                    <animate attributeName="opacity" values="0;0;1;0;0" keyTimes={kt([0, at - 0.0005, at + 0.003, at + 0.03 + dl * 0.1, 1])} {...loop} />
                    <animate attributeName="cx" values={`14.6;14.6;${14.6 + dx};${14.6 + dx * 1.4};${14.6 + dx * 1.4}`} keyTimes={kt([0, at - 0.0005, at + 0.003, at + 0.03 + dl * 0.1, 1])} {...loop} />
                    <animate attributeName="cy" values={`-3;-3;${-3 + dy * 0.5};${-3 + dy};${-3 + dy}`} keyTimes={kt([0, at - 0.0005, at + 0.003, at + 0.03 + dl * 0.1, 1])} {...loop} />
                </circle>
            )))}
            <g>
                {animate && <animateTransform attributeName="transform" type="translate" values={dipV.join(';')} keyTimes={kt(dipT)} {...loop} />}
                <g>
                    {animate && <animateTransform attributeName="transform" type="translate" values={brV.join(';')} keyTimes={kt(brT)} calcMode="spline" keySplines={brS.join(';')} {...loop} />}
                    <g>
                        {animate && <animateTransform attributeName="transform" type="translate" values={hopV.join(';')} keyTimes={kt(hopT)} calcMode="spline" keySplines={hopS.join(';')} {...loop} />}
                        <Body
                            walk={false}
                            arms={
                                <>
                                    <path d={animate ? ARM_HOLD : ARM_ON_POLE} {...L} strokeWidth={2}>
                                        {animate && <animate attributeName="d" values={`${ARM_HOLD};${ARM_HOLD};${ARM_ON_POLE};${ARM_ON_POLE}`} keyTimes={kt([0, turn0, turn1, 1])} calcMode="spline" keySplines={`0 0 1 1;${ease};0 0 1 1`} {...loop} />}
                                    </path>
                                    <path d={animate ? BACK_DOWN : BACK_UP} {...L} strokeWidth={2}>
                                        {animate && <animate attributeName="d" values={waveV.join(';')} keyTimes={kt(waveT)} calcMode="spline" keySplines={waveS.join(';')} {...loop} />}
                                    </path>
                                    {/* the fist at the end of the raised arm follows it, and goes when the hand comes down */}
                                    <circle r={1.7} fill="var(--sc-body)" stroke="currentColor" strokeWidth={1} cx={-9} cy={-39.8} opacity={animate ? 0 : 1}>
                                        {animate && <>
                                            <animate attributeName="opacity" values="0;0;1;0;0" keyTimes={kt([0, wave1 - 0.001, wave1, calm1, 1])} calcMode="discrete" {...loop} />
                                            <animate attributeName="cx" values={waveV.map(v => v.split(' L')[1].split(' ')[0]).join(';')} keyTimes={kt(waveT)} calcMode="spline" keySplines={waveS.join(';')} {...loop} />
                                            <animate attributeName="cy" values={waveV.map(v => v.split(' L')[1].split(' ')[1]).join(';')} keyTimes={kt(waveT)} calcMode="spline" keySplines={waveS.join(';')} {...loop} />
                                        </>}
                                    </circle>
                                </>
                            }
                        />
                    </g>
                </g>
            </g>
            {/* sparks round the raised hand, popping in turn through the cheer (they do not hop); static ones in the finished picture */}
            {SPARKS.map(([sx, sy, sz, ph], i) => (
                <g key={i} transform={`translate(${sx} ${sy})`} opacity={animate ? 0 : 0.9}>
                    {animate && (() => {
                        const T0 = wave1 + (cheerEnd - wave1) * (ph / HOPS), CY = (cheerEnd - wave1) / HOPS
                        const times: number[] = [0], vals: string[] = ['0']
                        for (let c = 0; c < HOPS; c++) {
                            const t0 = T0 + CY * c
                            if (t0 + CY * 0.9 >= cheerEnd) break
                            times.push(t0, t0 + CY * 0.25, t0 + CY * 0.7); vals.push('0', '1', '0')
                        }
                        times.push(1); vals.push('0')
                        return <animate attributeName="opacity" values={vals.join(';')} keyTimes={kt(times)} {...loop} />
                    })()}
                    <path d={STAR} transform={`scale(${sz})`} fill="var(--scene-glow)" stroke="currentColor" strokeWidth={0.7} strokeLinejoin="round" />
                </g>
            ))}
        </g>
    )
}

/**
 * Climbs `trail` once per loop. `scaleStart` → `scaleEnd` shrinks him as the trail climbs away from us (the mountain is far above).
 * Timing (seconds of the 36 s loop): waits at the foot to 1.5; walks to 24; turns the pole upright 24.4 – 25.5; lifts and drives it in 26.0 – 27.3 (two thrusts);
 * cheers 27.7 – 29.5 (hand up and waving, hopping, sparks); lowers his hand and stands quietly, breathing, 30.0 – 33.6; holds to 34.6; fades out by 35.6.
 */
export function ClimbingHiker({ trail, reduce, dur = 36, scaleStart = 1.25, scaleEnd = 0.8 }: { trail: string; reduce: boolean; dur?: number; scaleStart?: number; scaleEnd?: number }) {
    const d = `${dur}s`
    const f = (sec: number) => sec / dur
    const ARRIVE = 24
    if (reduce) {
        // the finished picture: planted, his hand raised
        return (
            <g transform={`translate(${CROWN.x} ${CROWN.y}) scale(${scaleEnd})`}>
                <PlantingHiker animate={false} dur={d} t={{ turn0: 0, turn1: 0, lift1: 0, thrust1: 0, lift2: 0, thrust2: 0, wave1: 0, cheerEnd: 0, calm1: 0, calmEnd: 0 }} />
            </g>
        )
    }
    const arrive = f(ARRIVE)
    return (
        <g>
            <animateMotion dur={d} repeatCount="indefinite" path={trail} calcMode="linear" keyPoints="0;0;1;1" keyTimes={`0;${f(1.5)};${arrive};1`} />
            <g>
                <animate attributeName="opacity" values="0;1;1;0;0" keyTimes={`0;${f(1.2)};${f(34.6)};${f(35.6)};1`} dur={d} repeatCount="indefinite" />
                <g>
                    <animateTransform attributeName="transform" type="scale" values={`${scaleStart};${scaleStart};${scaleEnd};${scaleEnd}`} keyTimes={`0;${f(1.5)};${arrive};1`} dur={d} repeatCount="indefinite" />
                    {/* three poses, swapped on the clock: STANDING at the foot until he sets off (no stepping, no bobbing — his feet only move while he does),
                        WALKING from the moment he moves until he arrives, then PLANTING */}
                    <g>
                        <animate attributeName="opacity" values="1;0;0" keyTimes={`0;${f(1.5)};1`} calcMode="discrete" dur={d} repeatCount="indefinite" />
                        <CarryingHiker walk={false} />
                    </g>
                    <g opacity={0}>
                        <animate attributeName="opacity" values="0;1;0;0" keyTimes={`0;${f(1.5)};${arrive};1`} calcMode="discrete" dur={d} repeatCount="indefinite" />
                        <CarryingHiker walk />
                    </g>
                    <g opacity={0}>
                        <animate attributeName="opacity" values="0;1;1" keyTimes={`0;${arrive};1`} calcMode="discrete" dur={d} repeatCount="indefinite" />
                        <PlantingHiker animate dur={d} t={{ turn0: f(24.4), turn1: f(25.5), lift1: f(26.0), thrust1: f(26.4), lift2: f(26.9), thrust2: f(27.3), wave1: f(27.7), cheerEnd: f(29.5), calm1: f(30.0), calmEnd: f(33.6) }} />
                    </g>
                </g>
            </g>
        </g>
    )
}

/* ───────────── the About header's ranges (band space: 1440 × 190, ground ridges at y ≈ 40 – 190) ───────────── */
/** Nature: the hero's mountains, in the header band — a pale snow-capped range right across the back with ONE tall summit on the right (clear of the
 *  text column, which ends at x ≈ 1030), green flanks in front of it, and a few low blue-green foothills on the left. Drawn BEFORE the far ridge, so
 *  the ridge hides every foot. Nothing left of x = 1040 rises above y = 0 (the last line of text sits just above the band). Space: the same
 *  silhouettes as bare, snowless lunar crags, in the far-ridge colour. */
const BF = rugged([[-20, 132], [40, 106], [100, 90], [150, 104], [210, 92], [270, 110], [340, 84], [400, 56], [440, 36], [480, 58], [530, 50], [580, 74], [640, 66], [700, 50], [760, 30], [810, 8], [850, 26], [900, 6], [950, 20], [1000, 6], [1050, -18], [1100, -52], [1140, -96], [1176, -128], [1212, -100], [1250, -76], [1290, -90], [1330, -58], [1370, -40], [1410, -52], [1460, -26]], 411, { rough: 0.13, depth: 3 })
const BM_L = rugged([[-20, 150], [30, 116], [76, 88], [108, 72], [142, 92], [184, 86], [226, 110], [280, 126], [340, 138]], 413, { rough: 0.12, depth: 3 })
const BM_C = rugged([[520, 150], [570, 112], [616, 84], [652, 66], [688, 86], [730, 80], [780, 112], [830, 140]], 414, { rough: 0.12, depth: 3 })
const BM_R = rugged([[900, 150], [950, 98], [996, 62], [1030, 34], [1064, 30], [1096, 8], [1130, 26], [1176, 18], [1224, 38], [1270, 18], [1312, 2], [1350, 24], [1396, 12], [1460, 34]], 412, { rough: 0.12, depth: 3 })
const BAND_FOOT = 192
export function BandMountains({ lunar = false }: { lunar?: boolean }) {
    const far = 'color-mix(in srgb, var(--sc-far) 70%, var(--scene-fill))'
    const none = -9999
    return (
        <g>
            <Range pts={BF} seed={401} fill={far} snowAbove={lunar ? none : 12} snowDepth={22} shade o={lunar ? 0.85 : 0.85} bottom={BAND_FOOT} />
            {!lunar && <MistBand x={900} y={96} w={540} h={14} o={0.32} />}
            {!lunar && <MistBand x={0} y={100} w={420} h={14} o={0.3} />}
            <Range pts={BM_L} seed={501} fill={lunar ? far : 'var(--sc-mid)'} snowAbove={lunar ? none : 20} snowDepth={9} shade o={lunar ? 0.8 : 1} bottom={BAND_FOOT} />
            <Range pts={BM_C} seed={502} fill={lunar ? far : 'var(--sc-mid)'} snowAbove={lunar ? none : 20} snowDepth={9} shade o={lunar ? 0.8 : 1} bottom={BAND_FOOT} />
            <Range pts={BM_R} seed={503} fill={lunar ? far : 'var(--sc-mid)'} snowAbove={lunar ? none : 20} snowDepth={9} shade o={lunar ? 0.8 : 1} bottom={BAND_FOOT} />
        </g>
    )
}

/* ───────────── the Contacts summit (band space; apex at x = 1130, foot at y = 190) ───────────── */
/* The same mountain language as the hero's: rugged flanks from a few anchors (a shoulder on the left, a notch on the right), a small level crown, a cap of
   snow with a soft underside, a shaded east face, a few gullies — and on the crown the flag, driven into the snow: a heap packed round its foot, a dent,
   lumps thrown out onto the slope and a few crumbs still in the air. It stays inside the footprint of a triangle (x 980 – 1280 at the foot, apex at
   y ≈ 8), because the gag's cast stands along its foot and Momo orbits its top. */
const CS_L = rugged([[978, 192], [1006, 156], [1030, 126], [1048, 102], [1070, 104], [1084, 78], [1096, 50], [1106, 26]], 71, { rough: 0.07, depth: 3, damp: ([, y]) => clamp01((y - 34) / 60) })
const CS_R = rugged([[1154, 26], [1164, 48], [1180, 68], [1192, 92], [1212, 108], [1238, 146], [1264, 176], [1284, 192]], 72, { rough: 0.07, depth: 3, damp: ([, y]) => clamp01((y - 34) / 60) })
const CS_RIDGE: Pt[] = [...CS_L, [1112, 16], [1124, 11], [1138, 11], [1150, 16], ...CS_R]   // a small level crown, ~38 wide, between the flanks
const CS_TOP = CS_L.length + 1      // index of the crown's left summit point (the "peak" for the snow and the east face)
const CS_GULLIES: Pt[][] = [
    rugged([[1096, 70], [1088, 108], [1070, 146], [1060, 184]], 81, { rough: 0.07, depth: 3 }),
    rugged([[1160, 66], [1170, 110], [1196, 150], [1204, 186]], 82, { rough: 0.07, depth: 3 }),
    rugged([[1030, 150], [1022, 170]], 83, { rough: 0.06, depth: 2 }),
]

export function ContactSummit() {
    const snow = snowCap(CS_RIDGE, CS_TOP, 32, 91)
    return (
        <g>
            <path d={closed(CS_RIDGE, 192)} fill="var(--sc-mid)" stroke="currentColor" strokeWidth={1.3} strokeLinejoin="round" />
            <path d={eastFace(CS_RIDGE, CS_TOP, 92, 192)} {...SHADE} />
            {CS_GULLIES.map((g, i) => <path key={i} d={poly(g)} {...L} strokeWidth={0.9} opacity={0.26} strokeLinejoin="round" />)}
            {snow && <Snow c={snow} />}
            <g stroke="none" fill="var(--scene-fill)">
                <ellipse cx={1126} cy={82} rx={58} ry={5} opacity={0.5} />
                <ellipse cx={1138} cy={110} rx={74} ry={6} opacity={0.34} />
                <ellipse cx={1120} cy={140} rx={78} ry={5} opacity={0.24} />
            </g>
            {/* the flag, in the snow of the crown */}
            <g strokeLinejoin="round" strokeLinecap="round">
                <FlowFlag x0={1130} y0={-36} w={28} h={15} amp={4.2} />
                <path d="M1130 9 V-38.2" {...L} strokeWidth={1.6} />
                <circle cx={1130} cy={-39.4} r={1.3} fill="var(--sc-sign)" stroke="currentColor" strokeWidth={0.9} />
                {/* the heap packed round the pole's foot (drawn over it, so the pole goes INTO the snow): filled into the crown, outlined along its top only, with
                    a shaded flank and a dent where the pole bit */}
                <path d="M1112 16 C1114 9.5 1120.5 6 1125.5 5.2 C1128 3.6 1132.5 3.6 1135 5 C1140 5.8 1146 9.4 1148 16 Z" fill="var(--sc-snow)" stroke="none" />
                <path d="M1135 5 C1140 5.8 1146 9.4 1148 16 H1137 Z" {...SHADE} />
                <path d="M1112 16 C1114 9.5 1120.5 6 1125.5 5.2 C1128 3.6 1132.5 3.6 1135 5 C1140 5.8 1146 9.4 1148 16" {...L} strokeWidth={1} />
                <path d="M1123.6 9.4 Q1130 12 1136.4 9.4" {...L} strokeWidth={0.7} opacity={0.4} />
                {/* snow thrown out when it went in: lumps resting on the slope to either side… */}
                {[[1104, 2.4, 1.5, 0], [1097.5, 1.7, 1.1, 1], [1157, 2.8, 1.7, 0], [1164, 1.9, 1.2, 1]].map(([x, rx, ry, k], i) => (
                    <ellipse key={i} cx={x} cy={r1(yAt(CS_RIDGE, x) + 1.2 + k * 0.6)} rx={rx} ry={ry} fill="var(--sc-snow)" stroke="currentColor" strokeWidth={0.8} />
                ))}
                {/* …and a few crumbs still in the air */}
                <circle cx={1121} cy={0.6} r={1.3} fill="var(--sc-snow)" stroke="currentColor" strokeWidth={0.7} />
                <circle cx={1143} cy={0.4} r={1.5} fill="var(--sc-snow)" stroke="currentColor" strokeWidth={0.7} />
                <circle cx={1148.6} cy={-4.4} r={1} fill="var(--sc-snow)" stroke="currentColor" strokeWidth={0.6} />
                <circle cx={1114} cy={-2.6} r={0.9} fill="var(--sc-snow)" stroke="currentColor" strokeWidth={0.6} />
            </g>
        </g>
    )
}