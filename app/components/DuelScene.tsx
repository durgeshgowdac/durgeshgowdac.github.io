'use client'

import { BubbleShape } from '@/app/components/scenery/bubbleKit'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useScenePlayback } from '@/app/components/useScenePlayback'
import { useReducedMotion } from '@/app/components/useReducedMotion'
import {
    BALL_RED, Luke, Vader, Grogu, Rock, Aurora, Nebula,
    type DuelAnim, type GroguAnim, type RotAnim, type SaberAnim,
} from '@/app/components/scenery/illustrations'

/**
 * "A Family Matter" — a Space-only parody duel that lives INSIDE the Contact section, on its own lunar ground: no strip, no ground or
 * sky of its own, and no height (it is an absolutely-positioned overlay, so the section keeps the size it had without it). It is
 * measured against the section at run time (see `layoutFor`): Luke, Vader and Grogu stand in the empty stretch of ground between
 * the rover/astronaut group on the left and the rocket on the right, small enough that a wound-up blade stays clear of the buttons'
 * labels. Bubbles sit beside the speaker on wide screens (there is no room above the heads) and above him on phones.
 *
 * ONE 38 s loop on ONE SMIL clock, two 19 s CYCLES that swap who goes first (the master clock repeats every cycle and Grogu's line
 * advances then, while every bubble is hidden). The two never move one at a time: every walk is shared, both fighters taking the
 * same footfalls on the same 0.3 s beat, sxo when one steps in the other gives ground and neither ever stands still while the other
 * attacks. In each cycle, one fighter ("X") attacks first, then the other ("Y"):
 *
 *   0.3  ignite      both blades light (0.3–0.9)
 *   1.0  step in     both walk toward each other, 4 footfalls (1.0–2.5), 52.5 units each (201 → 96 apart)
 *   2.75 X attacks   the blades cross and flash (2.75), part and cross again (3.65)
 *   3.9  X speaks    Luke "I’ll never join you." (2.3 s) / Vader "Luke, I am your father." (2.5 s) — the blades stay locked
 *   6.4  the swap    the blades part; X steps BACK as Y steps IN, 3 footfalls together (about 6.7–7.9), 45 units, the gap staying 96
 *   8.15 Y attacks   the same two clashes and flashes, then Y speaks (about 9.3); never at the same time as X
 *  12.15 Grogu       his line, one of five in order (3.6 s); the blades dim while everyone listens
 *  15.95 reset       the blades part and both step apart together, 3 footfalls (16.25–17.45), onto the next cycle's marks; the blades go out (17.5–18.1)
 *
 * THE CENTRE LINE: the fight is centred on the section's middle (the middle icon). Luke attacking first fights 22.5 units right of it,
 * Vader attacking first 22.5 left, so Luke always speaks from 25.5 units left of the middle and Vader from 25.5 right; Grogu stands just
 * beyond Vader's furthest mark and bubble, on the right, with his own bubble on his far side (above him where that would not fit).
 *
 * THE WALK is Ash's (About strip, "The Catch"): a footfall every 0.3 s, legs swinging about the hips (±24°, Vader's longer legs ±20°),
 * the empty arm swinging against the stride (0.55 ×), the body bobbing on every mid-step. A walk of n footfalls takes (n + 1) × 0.3 s.
 * Cycle 1 has Luke first, cycle 2 Vader first, and so on. Reduced motion: no clock at all — the first clash frozen (blades lit, a dim
 * flash), with Grogu's selected line showing.
 */
const CYC = 19, DUR = 2 * CYC
export const GROGU_LINES: string[][] = [
    ['A family reunion,', 'this is?'],
    ['Father of the year,', 'you are.'],
    ['Child support,', 'you owe.'],
    ['A lawyer,', 'we need.'],
    ['Bad father,', 'he is.'],
]
const LUKE_LINES = ['I’ll never', 'join you.']
const VADER_LINES = ['Luke, I am', 'your father.']

/* ── Ash's gait ── */
const C = 0.3                    // a footfall every 0.3 s
const AMP_L = 24, AMP_V = 20     // leg swing, degrees
const BOB = -1.4                 // body bob, in the figure's own units
const walkDur = (n: number) => (n + 1) * C
const N_STEP = 4                 // footfalls in the step-in (1.5 s)
const N_SWAP = 3                 // …in the swap (1.2 s)
const N_RESET = 3                // …and in the reset, when both step apart (1.2 s)
const GAP_U = 96                 // the body gap at which the two blades cross (solved from the poses below)
const A_U = 52.5                 // the step-in (201 → 96 units): each covers 52.5
const M_U = 45                   // the swap: one steps back as the other steps in, 45 units each, so the gap stays 96
const R_U = 52.5                 // the reset: each steps back 52.5 units (the gap goes 96 → 201); the two cycles start 45 units apart, so this lands each on the next cycle's mark
const LINE_D = { L: 2.3, V: 2.5 } as const
const GROGU_D = 3.6

/* ── the timeline: two cycles, each with two attacks (X first, then Y) ── */
type Role = 'L' | 'V'
/** one attack: two clashes, then the attacker's line. `lp` = where Luke stands (units from his mark) while it is fought; Vader is GAP_U to his right. */
type Beat = { who: Role; c1: number; c2: number; l0: number; l1: number; part: number; lp: number }
type Cycle = { base: number; first: Role; ign: [number, number]; app: number; beats: [Beat, Beat]; pair: number; gr: [number, number]; rst: number; ret: [number, number] }
function makeCycle(first: Role, base: number): Cycle {
    const second: Role = first === 'L' ? 'V' : 'L'
    const beat = (who: Role, arrive: number, lp: number): Beat => {
        const c1 = arrive + 0.25, c2 = c1 + 0.9, l0 = c2 + 0.25   // arrive; clash; part and clash again; then speak
        return { who, c1, c2, l0, l1: l0 + LINE_D[who], part: 0, lp }
    }
    const m = first === 'L' ? 0 : -M_U          // Luke's resting mark, in units from LN: the two cycles start 45 units apart
    const app = base + 1.0
    const b1 = beat(first, app + walkDur(N_STEP), m + A_U)
    b1.part = b1.l1 + 0.2
    const pair = b1.part + 0.3
    const b2 = beat(second, pair + walkDur(N_SWAP), m + A_U + (first === 'L' ? -M_U : M_U))
    const gr: [number, number] = [b2.l1 + 0.35, b2.l1 + 0.35 + GROGU_D]
    b2.part = gr[1] + 0.2
    const rst = b2.part + 0.3, rend = rst + walkDur(N_RESET)
    return { base, first, ign: [base + 0.3, base + 0.9], app, beats: [b1, b2], pair, gr, rst, ret: [rend + 0.05, rend + 0.65] }
}
const CYCLES = [makeCycle('L', 0), makeCycle('V', CYC)]
const BEATS = CYCLES.flatMap(c => c.beats)

type Pts = [number, number][]
type Fn = (t: number) => number
const ease = (u: number) => u * u * (3 - 2 * u)
const at = (pts: Pts, t: number) => {
    if (t <= pts[0][0]) return pts[0][1]
    for (let i = 1; i < pts.length; i++) {
        if (t <= pts[i][0]) { const [t0, v0] = pts[i - 1], [t1, v1] = pts[i]; return v0 + (v1 - v0) * ease((t - t0) / (t1 - t0)) }
    }
    return pts[pts.length - 1][1]
}
const fn = (p: Pts | Fn): Fn => (typeof p === 'function' ? p : (t: number) => at(p, t))
const STEP = 0.0625
const TS = Array.from({ length: Math.round(DUR / STEP) + 1 }, (_, i) => +(i * STEP).toFixed(4))
/** sampled keyframes for one or more curves on a shared time base; flat runs are dropped so the SMIL lists stay short */
function trackN(ps: (Pts | Fn)[], d = 2) {
    const fs = ps.map(fn)
    const v = TS.map(t => fs.map(f => +f(t).toFixed(d)))
    const keep = TS.map((_, i) => i === 0 || i === TS.length - 1 || v[i].some((x, k) => x !== v[i - 1][k] || x !== v[i + 1][k]))
    return { times: TS.filter((_, i) => keep[i]).map(t => +(t / DUR).toFixed(5)), values: v.filter((_, i) => keep[i]) }
}
const track = (p: Pts | Fn, d = 2) => { const r = trackN([p], d); return { times: r.times, values: r.values.map(a => a[0]) } }
const rot = (p: Pts | Fn): RotAnim => ({ dur: DUR, ...track(p) })
const sway = (amp: number, period: number): Pts => Array.from({ length: Math.round(DUR / (period / 4)) + 1 }, (_, i) => [i * period / 4, [0, amp, 0, -amp][i % 4]] as [number, number])
/** merge several point lists into one ascending list (later duplicates at the same time win) */
const merge = (...ls: Pts[]): Pts => {
    const m = new Map<number, number>()
    ls.flat().forEach(([t, v]) => m.set(+t.toFixed(3), v))
    return Array.from(m.entries()).sort((a, b) => a[0] - b[0])
}
/** bubble opacity: each window fades in over 0.2 s at its start and out over 0.2 s ending at its end */
const speak = (ws: [number, number][]): Pts => merge([[0, 0]], ...ws.map(([a, b]) => [[a, 0], [a + 0.2, 1], [b - 0.2, 1], [b, 0]] as Pts), [[DUR, 0]])

/* ── a walk, as Ash's: n footfalls, gliding dx in total; legs, far arm, bob and lean all follow from the same list ── */
type Walk = { t0: number; n: number; dx: number }
const wEnd = (w: Walk) => w.t0 + walkDur(w.n)
const posFn = (start: number, ws: Walk[]): Fn => t => ws.reduce((x, w) => x + w.dx * ease(Math.min(1, Math.max(0, (t - w.t0) / walkDur(w.n)))), start)
/** the far leg: neutral → ±amp on each footfall (alternating) → neutral; the near leg is its mirror. Backing away swings a little less. */
const legPts = (ws: Walk[], face: number, amp: number): Pts =>
    merge([[0, 0]], ...ws.map(w => {
        const a = w.dx * face > 0 ? amp : amp * 0.75
        return [[w.t0, 0], ...Array.from({ length: w.n }, (_, k) => [+(w.t0 + C * (k + 1)).toFixed(3), k % 2 ? -a : a] as [number, number]), [wEnd(w), 0]] as Pts
    }), [[DUR, 0]])
/** up on every mid-step, down as the foot lands (Ash's bob), in units */
const bobPts = (ws: Walk[]): Pts =>
    merge([[0, 0]], ...ws.map(w => [[w.t0, 0], ...Array.from({ length: w.n }, (_, k) => { const te = w.t0 + C * (k + 1); return [[+(te - C / 2).toFixed(3), BOB], [+te.toFixed(3), 0]] as Pts }).flat(), [wEnd(w), 0]] as Pts), [[DUR, 0]])
const leanPts = (ws: Walk[], face: number): Pts =>
    merge([[0, 0]], ...ws.map(w => { const v = w.dx * face > 0 ? 4 : -3; return [[w.t0, 0], [w.t0 + 0.3, v], [wEnd(w) - 0.3, v], [wEnd(w), 0]] as Pts }), [[DUR, 0]])

/* ── the blades. The saber's angle follows the arm, so the poses were solved for where the two blades really cross:
      guard   — raised and leaning in, 18°            (Luke arm −100, forearm −32; Vader −98, −34)
      cocked  — drawn back over the shoulder, then a shorter draw-back for the second clash
      hit     — arms out, blades at 35° / 50° crossing about two thirds of the way up, at GAP_U = 96 ── */
type Poses = { guard: number; cock: number; cock2: number; hit: number }
const LUKE_P = { arm: { guard: -100, cock: -125, cock2: -113, hit: -95 }, fore: { guard: -32, cock: -52, cock2: -40, hit: -10 }, wrist: { guard: 0, cock: 0, cock2: -4, hit: -10 } }
const VADER_P = { arm: { guard: -98, cock: -118, cock2: -105, hit: -75 }, fore: { guard: -34, cock: -48, cock2: -38, hit: -15 }, wrist: { guard: 0, cock: 0, cock2: -4, hit: -10 } }
/** for each advance: wind up, CLASH, draw back, CLASH again, hold (through his line) until the blades part, then back to guard */
const clashTrack = ({ guard, cock, cock2, hit }: Poses): Pts =>
    merge([[0, guard]], ...BEATS.map(b => [[b.c1 - 0.6, guard], [b.c1 - 0.25, cock], [b.c1, hit], [b.c1 + 0.3, hit], [b.c2 - 0.25, cock2], [b.c2, hit], [b.part, hit], [b.part + 0.35, guard]] as Pts), [[DUR, guard]])
/** a little extra forward lean into each strike */
const strikeLean: Pts = merge(...BEATS.map(b => [[b.c1 - 0.3, 0], [b.c1, 5], [b.c1 + 0.4, 2], [b.c2, 5], [b.c2 + 0.5, 2], [b.part, 2], [b.part + 0.3, 0]] as Pts))

/* the blades: both light together each cycle, the halo flares at every clash, dims while Grogu talks, and goes out at the end */
const GLOW: Pts = merge(
    [[0, 0]],
    ...CYCLES.map(cy => merge(
        [[cy.ign[0], 0.2], [cy.ign[1], 0.7]],
        ...cy.beats.flatMap(b => [b.c1, b.c2]).map(tc => [[tc - 0.1, 0.7], [tc + 0.05, 1], [tc + 0.5, 0.75]] as Pts),
        [[cy.gr[0] - 0.2, 0.75], [cy.gr[0] + 0.4, 0.3], [cy.gr[1], 0.3], [cy.gr[1] + 0.3, 0.7], [cy.ret[0], 0.7], [cy.ret[1], 0]],
    )),
    [[DUR, 0]],
)
const GROW: Pts = merge([[0, 0]], ...CYCLES.map(cy => [[cy.ign[0], 0], [cy.ign[1], 1], [cy.ret[0], 1], [cy.ret[1], 0]] as Pts), [[DUR, 0]])
const SABER: SaberAnim = (() => {
    const grow = track(GROW, 3)
    const glow = track(GLOW, 3)
    const ts = Array.from(new Set([...grow.times, ...glow.times])).sort((a, b) => a - b)
    const sample = (tr: { times: number[]; values: number[] }) => ts.map(t => {
        const i = tr.times.findIndex(x => x >= t)
        if (i <= 0) return +tr.values[0].toFixed(3)
        const [t0, t1] = [tr.times[i - 1], tr.times[i]]
        return +(tr.values[i - 1] + (tr.values[i] - tr.values[i - 1]) * ((t - t0) / (t1 - t0))).toFixed(3)
    })
    return { dur: DUR, times: ts, grow: sample(grow), glow: sample(glow) }
})()

/** a brief burst of light: opacity + scale on the clock, at each clash time */
const BURST = (t: number): Pts => [[0, 0], [t - 0.02, 0], [t + 0.06, 1], [t + 0.45, 0], [DUR, 0]]
const BURST_S = (t: number): Pts => [[0, 0.5], [t - 0.02, 0.5], [t + 0.06, 1], [t + 0.45, 1.5], [DUR, 1.5]]

/* the speech windows, per speaker: each fighter speaks only in his own advance, never together */
const winOf = (who: Role): [number, number][] => BEATS.filter(b => b.who === who).map(b => [b.l0, b.l1])
const WIN_L = winOf('L'), WIN_V = winOf('V'), WIN_G = CYCLES.map(cy => cy.gr)

/* ── layout: measured against the section, in CSS pixels ── */
type Mode = 'side' | 'above1' | 'above2'   // bubbles beside the speaker | one line above him | two lines above him
type Layout = { W: number; Hov: number; k: number; feet: number; mode: Mode; gRight: boolean; LN: number; VN: number; GX: number }
const FS = 10.5
const bubbleW = (lines: string[]) => Math.round(Math.max(...lines.map(t => t.length)) * FS * 0.5 + 20)
const WL = bubbleW(LUKE_LINES), WG = bubbleW(GROGU_LINES.reduce((a, b) => (a.join().length > b.join().length ? a : b)))
const SIDE_MIN = 820             // from here up there is room beside the speakers; narrower, the bubbles go above them
const ABOVE2_MIN_FREE = 130      // …two lines if the strip under the buttons is tall enough (phones), else one line, under the button labels
/**
 * W = section width, Hsec = its height, freeV = the height of the empty strip under the buttons. Figures scale by `k` (px per unit),
 * limited by that strip (the wound-up blade, 139 units, must clear the button labels) and by the width between the existing ground
 * scenery (the astronaut group ends at about 30 % of the width, the rocket starts at about 77 %).
 * THE DUEL IS CENTRED ON THE SECTION'S MIDDLE (the axis of the heading and the middle icon): the two fighters fight 22.5 units to the right
 * of it when Luke attacks first and 22.5 to the left when Vader does, so Luke always speaks from 25.5 units left of the middle and Vader from
 * 25.5 units right of it. LN = Luke's first mark (C − 78 units, Vader 201 to his right); the second cycle starts 45 units further left.
 * Grogu stands just beyond the furthest Vader gets (and beyond his bubble), so he is as close as he can be without being covered.
 */
function layoutFor(W: number, Hsec: number, freeV: number, kCap = 0.62, shiftU = 0): Layout {
    const mode: Mode = W >= SIDE_MIN ? 'side' : freeV >= ABOVE2_MIN_FREE ? 'above2' : 'above1'
    const side = mode === 'side'
    const Hov = Math.round(Math.min(Hsec, 250))
    const fb = 16, feet = Hov - fb
    const C = W / 2 + shiftU, zl = 0.3 * W + 8, zr = 0.77 * W - 8   // shiftU nudges the whole fight along the ground (band only)
    // Luke's body reaches 135 units left of the middle (cycle 2's mark); his bubble, beside him on wide screens, a little further
    const kL = Math.min((C - zl - 12) / 135, side ? (C - zl - 13 - WL) / 31.5 : Infinity)
    // …and Vader and Grogu's rock reach 212 units right of it (the rock's far edge), which must stay left of the rocket
    const kR = (zr - C - 16) / 212
    // above: a one-line bubble (22 high) over the tallest head (116 units) must still clear the button labels; two lines have the room
    const kV = side ? (freeV - fb - 6) / 139 : mode === 'above1' ? (freeV - fb - 4 - 10 - 22) / 116 : 0.5
    const k = Math.max(0.3, Math.min(side ? kCap : 0.5, kV, kL, side ? Infinity : kR))
    const LN = C - 78 * k, VN = LN + 201 * k
    const vaderReach = C + 136 * k                                 // Vader's furthest right (his mark at the start of cycle 1) plus his cape
    const vaderBubble = side ? C + 35.5 * k + 96 : 0                // …and the right edge of his bubble when he speaks
    const GX = Math.max(vaderReach, vaderBubble) + (side ? 8 : 16) + 38 * k
    const gRight = side && GX + 38 * k + 13 + WG <= zr              // Grogu's bubble goes on his right if it fits, otherwise above him
    return { W, Hov, k, feet, mode, gRight, LN, VN, GX }
}
const DEFAULT_LAYOUT = layoutFor(1280, 432, 102)
/** the page-header band is a fixed 1440 × 190 drawing, so its layout never has to be measured */
/* Measured over the whole 24 s cycle (no bubbles), the tableau reaches 137 k left of C (Luke at his furthest mark) and 243 k right of it (Grogu's
   ears, the far edge of the rock), so its middle is C + 53 k. Pulling C back by that much puts the middle of the whole scene — both fighters AND
   Grogu — on the band's centre line (x = 720). */
const BAND_K = 0.64                                     // a little larger than in the Contact section: the band is the whole stage
const BAND_LAYOUT = layoutFor(1440, 190, 190, BAND_K, -53 * BAND_K)

/** everything that depends on the layout: positions on the clock, and each fighter's joints */
function build(L: Layout) {
    const { k, feet, LN, VN } = L
    // every walk is shared: both fighters start on the same beat and take the same footfalls (n, from the same t0); only the strides differ
    const walks = (who: Role): Walk[] => CYCLES.flatMap(cy => {
        const luke = who === 'L', lukeFirst = cy.first === 'L'
        const step = luke ? A_U : -A_U                                                  // the step-in: toward each other
        const swap = lukeFirst ? -M_U : M_U                                            // the swap: Luke back & Vader in, or Luke in & Vader back
        const back = luke ? -R_U : R_U                                                 // the reset: both step apart, on the same beat
        return [
            { t0: cy.app, n: N_STEP, dx: step * k },
            { t0: cy.pair, n: N_SWAP, dx: swap * k },
            { t0: cy.rst, n: N_RESET, dx: back * k },
        ]
    })
    const wL = walks('L'), wV = walks('V')
    const legL = legPts(wL, 1, AMP_L), legV = legPts(wV, -1, AMP_V)
    const bobL = bobPts(wL), bobV = bobPts(wV)
    const gait = (legs: Pts, rest: number): Pick<DuelAnim, 'legA' | 'legB' | 'armB'> => ({
        legA: rot(legs), legB: rot(legs.map(([t, v]) => [t, -v] as [number, number])),
        armB: rot(t => rest - 0.55 * at(legs, t)),
    })
    const lukeAnim: DuelAnim = {
        arm: rot(clashTrack(LUKE_P.arm)), fore: rot(clashTrack(LUKE_P.fore)), wrist: rot(clashTrack(LUKE_P.wrist)),
        lean: rot(merge(leanPts(wL, 1), strikeLean)), ...gait(legL, 12), saber: SABER,
    }
    const vaderAnim: DuelAnim = {
        arm: rot(clashTrack(VADER_P.arm)), fore: rot(clashTrack(VADER_P.fore)), wrist: rot(clashTrack(VADER_P.wrist)),
        lean: rot(merge(leanPts(wV, -1), strikeLean)),
        cape: rot(sway(1.6, 4.75)),   // eight 4.75 s sways per loop, so the cape always lines up with the reset
        ...gait(legV, 10), saber: SABER,
    }
    const cyc = (f: (cy: Cycle) => Pts) => merge([[0, 0]], ...CYCLES.map(f), [[DUR, 0]])
    const grogu: GroguAnim = {
        // watches: curious at the first clash, worried at the second advance's clashes, smug at the end
        mood: rot(cyc(cy => { const [b1, b2] = cy.beats; return [[b1.c1, 0], [b1.c1 + 0.4, 0.3], [b1.l1, 0.1], [b2.c1, 0.1], [b2.c1 + 0.3, -0.6], [b2.l1, -0.2], [cy.gr[0] - 0.2, -0.2], [cy.gr[0] + 0.3, 1], [cy.gr[1], 1], [cy.gr[1] + 1.0, 0], [cy.base + CYC, 0]] as Pts })),
        ears: rot(cyc(cy => { const [b1, b2] = cy.beats; return [[b1.c1 - 0.5, 6], [b1.c1, 0], [b1.c1 + 0.6, 12], [b2.c1, 8], [b2.c1 + 0.3, 22], [b2.l1, 14], [cy.gr[0] - 0.2, 4], [cy.gr[0], 0], [cy.gr[1], 0], [cy.gr[1] + 0.8, 6], [cy.base + CYC, 6]] as Pts })),
        arms: rot(cyc(cy => [[cy.gr[0], 8], [cy.gr[0] + 0.5, 52], [cy.gr[1] - 0.4, 52], [cy.gr[1], 8], [cy.base + CYC, 8]] as Pts)),
    }
    return {
        lukeX: posFn(LN, wL), vaderX: posFn(VN, wV),
        lukeY: ((t: number) => feet + k * at(bobL, t)) as Fn, vaderY: ((t: number) => feet + k * at(bobV, t)) as Fn,
        lukeAnim, vaderAnim, grogu,
    }
}

/** a speech bubble in the theme's style (see scenery/bubbleKit), `tip` being the point it speaks from; it sits left of / right of / above the tip, with a short tail to it */
function Speech({ tip, side, lines, shift = 0 }: { tip: [number, number]; side: 'left' | 'right' | 'above'; lines: string[]; shift?: number }) {
    const w = bubbleW(lines), h = Math.round(lines.length * FS * 1.2 + 14), g = 10
    const x0 = side === 'left' ? tip[0] - g - w : side === 'right' ? tip[0] + g : tip[0] - w / 2 + shift
    const y0 = side === 'above' ? tip[1] - g - h : tip[1] - h / 2
    const x1 = x0 + w, y1 = y0 + h
    // a bubble to the left of the tip speaks from its right edge, one to the right from its left edge, one above from its bottom edge
    const tail = side === 'above' ? { side: 'bottom' as const, at: tip[0], tip, half: 5 } : { side: side === 'left' ? 'right' as const : 'left' as const, at: tip[1], tip, half: 5 }
    const lh = FS * 1.2, yt = y0 + h / 2 - ((lines.length - 1) * lh) / 2 + FS * 0.35
    return (
        <g className="duel-bubble">
            <BubbleShape x0={x0} y0={y0} x1={x1} y1={y1} tail={tail} />
            {lines.map((t, i) => (
                <text className="bub-text" key={i} x={+(x0 + w / 2).toFixed(1)} y={+(yt + i * lh).toFixed(1)} textAnchor="middle" fontSize={FS} fontFamily="inherit"
                      textLength={+(t.length * FS * 0.5).toFixed(1)} lengthAdjust="spacingAndGlyphs">{t}</text>
            ))}
        </g>
    )
}

/** opacity on the shared clock */
function Show({ pts, children }: { pts: Pts; children: ReactNode }) {
    const tr = track(pts)
    return (
        <g opacity={tr.values[0]}>
            <animate attributeName="opacity" dur={`${DUR}s`} repeatCount="indefinite" keyTimes={tr.times.join(';')} values={tr.values.join(';')} />
            {children}
        </g>
    )
}

/** puts a figure on the stage: position (x, y), facing (sx = −1 turns it round), size (sc); all curves of the one clock.
 *  Without a clock (`still`) it stands at the curves' value at t = 0. */
function Mover({ x, y, sx = () => 1, sc = () => 1, still, children }: { x: Fn; y: Fn; sx?: Fn; sc?: Fn; still: boolean; children: ReactNode }) {
    const k = (f: Fn) => +f(0).toFixed(2)
    if (still) return <g transform={`translate(${k(x)} ${k(y)}) scale(${(k(sx) * k(sc)).toFixed(3)} ${k(sc)})`}>{children}</g>
    const pos = trackN([x, y])
    const scl = trackN([t => sx(t) * sc(t), sc], 3)
    const kt = (ts: number[]) => ts.join(';')
    return (
        <g transform={`translate(${pos.values[0].join(' ')})`}>
            <animateTransform attributeName="transform" type="translate" dur={`${DUR}s`} repeatCount="indefinite" keyTimes={kt(pos.times)} values={pos.values.map(v => v.join(' ')).join(';')} />
            <g transform={`scale(${scl.values[0].join(' ')})`}>
                <animateTransform attributeName="transform" type="scale" dur={`${DUR}s`} repeatCount="indefinite" keyTimes={kt(scl.times)} values={scl.values.map(v => v.join(' ')).join(';')} />
                {children}
            </g>
        </g>
    )
}

/** a group that keeps pace with a figure: drawn in the figure's own coordinates (feet at 0), it slides with the figure's x along the ground line y */
function Follow({ x, y, children }: { x: Fn; y: number; children: ReactNode }) {
    const tr = track(x)
    return (
        <g transform={`translate(${tr.values[0]} ${y})`}>
            <animateTransform attributeName="transform" type="translate" dur={`${DUR}s`} repeatCount="indefinite"
                              keyTimes={tr.times.join(';')} values={tr.values.map(v => `${v} ${y}`).join(';')} />
            {children}
        </g>
    )
}

/** the flash where two blades meet: a pale core, a blue and a red halo and a few short rays. It pops (0.5 → 1.5 ×) and fades
 *  in under half a second, at each time in `times`; with `still` it is simply there, for the reduced-motion frame. */
function Burst({ times, x, y, s0, still }: { times: number[]; x: number; y: number; s0: number; still: boolean }) {
    const art = (
        <>
            <circle r={17} fill="var(--sc-glass)" opacity={0.16} />
            <circle r={11} fill={BALL_RED} opacity={0.22} />
            <circle r={5.5} fill="var(--sc-snow)" opacity={0.9} />
            <path d="M0 -9 V-21 M0 9 V21 M-9 0 H-21 M9 0 H21 M-6.4 -6.4 L-14.8 -14.8 M6.4 -6.4 L14.8 -14.8 M-6.4 6.4 L-14.8 14.8 M6.4 6.4 L14.8 14.8"
                  stroke="var(--sc-snow)" strokeWidth={1.4} strokeLinecap="round" fill="none" opacity={0.85} />
        </>
    )
    if (still) return <g transform={`translate(${x} ${y}) scale(${s0})`} opacity={0.7}>{art}</g>
    const o = track(merge(...times.map(BURST)), 3)
    const s = track(merge(...times.map(BURST_S)), 3)
    return (
        <g opacity={o.values[0]}>
            <animate attributeName="opacity" dur={`${DUR}s`} repeatCount="indefinite" keyTimes={o.times.join(';')} values={o.values.join(';')} />
            <g transform={`translate(${x} ${y})`}>
                <g transform={`scale(${(s.values[0] * s0).toFixed(3)})`}>
                    <animateTransform attributeName="transform" type="scale" dur={`${DUR}s`} repeatCount="indefinite"
                                      keyTimes={s.times.join(';')} values={s.values.map(v => `${(v * s0).toFixed(3)} ${(v * s0).toFixed(3)}`).join(';')} />
                    {art}
                </g>
            </g>
        </g>
    )
}

/**
 * `band`: the duel stands on a page header's horizon band (PageScene) instead of in the Contact section. It fills the band's own
 * 1440 × 190 box (same aspect ratio, so one unit here is one unit there) and uses a fixed layout, with no measuring. The fight sits
 * on the band's centre line. On phones the bubbles are hidden by CSS (they would be too small to read); the duel itself keeps going.
 */
export default function DuelScene({ band = false }: { band?: boolean } = {}) {
    const reduce = useReducedMotion()
    const rootRef = useRef<HTMLDivElement>(null)
    const masterRef = useRef<SVGAnimateElement>(null)
    const [line, setLine] = useState(0)
    const [layout, setLayout] = useState<Layout>(band ? BAND_LAYOUT : DEFAULT_LAYOUT)
    useScenePlayback(rootRef)   // pauses the clock off-screen; ends/restarts it when the theme flips

    // measure the Contact section this overlay lives in, and keep the layout in step with it
    useEffect(() => {
        if (band) return
        const sec = rootRef.current?.parentElement
        if (!sec) return
        const cont = sec.querySelector(':scope > .container') as HTMLElement | null
        let raf = 0
        const apply = () => {
            const sr = sec.getBoundingClientRect()
            const cb = cont ? cont.getBoundingClientRect().bottom - sr.top : sr.height * 0.7
            const next = layoutFor(Math.round(sec.clientWidth), Math.round(sec.clientHeight), Math.round(sr.height - cb))
            setLayout(prev => (prev.W === next.W && prev.Hov === next.Hov && Math.abs(prev.k - next.k) < 0.004 ? prev : next))
        }
        const measure = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(apply) }
        apply()   // straight away (so a section that is off-screen is laid out too), then on every resize
        const ro = new ResizeObserver(measure)
        ro.observe(sec)
        if (cont) ro.observe(cont)
        document.fonts?.ready.then(measure)
        return () => { cancelAnimationFrame(raf); ro.disconnect() }
    }, [band])

    // Grogu's next line is chosen at every cycle boundary (the master clock repeats every 24 s, when every bubble is hidden)
    useEffect(() => {
        const el = masterRef.current
        if (!el || reduce) return
        const onRepeat = () => setLine(i => (i + 1) % GROGU_LINES.length)
        el.addEventListener('repeatEvent', onRepeat)
        return () => el.removeEventListener('repeatEvent', onRepeat)
    }, [reduce])

    const still = reduce
    const { W, Hov, k, feet, mode, gRight, LN, VN, GX } = layout
    const side = mode === 'side'
    const lines = (ls: string[]) => (mode === 'above1' ? [ls.join(' ')] : ls)   // one line when there is only room for one
    const S = useMemo(() => build(layout), [layout])
    const lukeAt = (u: number) => LN + u * k                       // Luke's x when he stands u units past his mark
    const first = BEATS[0]                                           // the reduced-motion frame is the first clash
    const lukeX0 = still ? lukeAt(first.lp) : LN, vaderX0 = still ? lukeAt(first.lp + GAP_U) : VN

    /* where each bubble points, in the speaker's own coordinates (feet at 0): his head's near edge on wide screens, the top of his head on phones */
    const clampShift = (absX: number, w: number) => Math.min(Math.max(absX - w / 2, 6), W - 6 - w) - (absX - w / 2)
    const tipL: [number, number] = side ? [-6 * k - 3, -75 * k] : [1.6 * k, -95 * k]
    const tipV: [number, number] = side ? [10 * k + 3, -96 * k] : [-2 * k, -116 * k]
    const tipG: [number, number] = gRight ? [GX + 38 * k + 3, feet - 60 * k] : [GX, feet - 82 * k]
    const shL = side ? 0 : clampShift(lukeAt(A_U) + tipL[0], bubbleW(lines(LUKE_LINES)))
    const shV = side ? 0 : clampShift(lukeAt(A_U - M_U + GAP_U) + tipV[0], bubbleW(lines(VADER_LINES)))
    const gLines = gRight || mode === 'above2' ? GROGU_LINES[line] : [GROGU_LINES[line].join(' ')]   // two lines beside him or on a phone, one above him otherwise
    const shG = gRight ? 0 : clampShift(tipG[0], bubbleW(gLines))
    const grogu = <Speech tip={tipG} side={gRight ? 'right' : 'above'} lines={gLines} shift={shG} />
    const burst = (x: number) => ({ x: x + 43.1 * k, y: feet - 93.7 * k, s0: 1.4 * k })
    return (
        <div ref={rootRef} className={`card-art card-art--duel${band ? ' card-art--duel-band' : ''}`} aria-hidden="true" style={band ? undefined : { height: Hov }}>
            <svg viewBox={`0 0 ${W} ${Hov}`} preserveAspectRatio="xMidYMax meet" style={{ color: 'var(--sc-line)' }}>
                <g className="scene-space">
                    {!still && <animate ref={masterRef} attributeName="opacity" from="1" to="1" dur={`${CYC}s`} repeatCount="indefinite" />}

                    {/* the footer-sky haze + aurora behind the fight (the page-header band gets its own from PageScene) */}
                    {!band && (
                        <>
                            <Aurora x={0} y={Hov * 0.04} w={W} h={Hov * 0.5} />
                            <Nebula x={W * 0.5} y={Hov * 0.5} w={W * 0.9} h={Hov * 0.55} />
                        </>
                    )}

                    {/* Grogu's safe spot: a rock at the right of the fight, well clear of every blade */}
                    <g transform={`translate(${GX} ${feet}) scale(${k})`}>
                        <Rock x={0} y={2} s={2.1} />
                        <Grogu x={0} y={-27} s={0.95} {...(still ? { ears: 0, arms: 40, mood: 0.8 } : { anim: S.grogu })} />
                    </g>

                    {/* the duellists, on Ash's walk; Vader is drawn first so he is behind Luke at a clash */}
                    <Mover x={still ? () => vaderX0 : S.vaderX} y={still ? () => feet : S.vaderY} sx={() => -1} sc={() => k} still={still}>
                        {still ? <Vader arm={-75} fore={-15} wrist={-10 + 42} /> : <Vader anim={S.vaderAnim} />}
                    </Mover>
                    <Mover x={still ? () => lukeX0 : S.lukeX} y={still ? () => feet : S.lukeY} sc={() => 1.05 * k} still={still}>
                        {still ? <Luke arm={-95} fore={-10} wrist={-10 + 27} /> : <Luke anim={S.lukeAnim} />}
                    </Mover>

                    {/* the flash where the blades meet, at the spot where each attack is fought */}
                    {still ? <Burst times={[]} {...burst(lukeX0)} still /> : BEATS.map((b, i) => <Burst key={i} times={[b.c1, b.c2]} {...burst(lukeAt(b.lp))} still={false} />)}

                    {/* speech, one speaker at a time: each bubble rides with its speaker and is up only for his own line */}
                    {still ? grogu : (
                        <>
                            <Follow x={S.lukeX} y={feet}><Show pts={speak(WIN_L)}><Speech tip={tipL} side={side ? 'left' : 'above'} lines={lines(LUKE_LINES)} shift={shL} /></Show></Follow>
                            <Follow x={S.vaderX} y={feet}><Show pts={speak(WIN_V)}><Speech tip={tipV} side={side ? 'right' : 'above'} lines={lines(VADER_LINES)} shift={shV} /></Show></Follow>
                            <Show pts={speak(WIN_G)}>{grogu}</Show>
                        </>
                    )}
                </g>
            </svg>
        </div>
    )
}