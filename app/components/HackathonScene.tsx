'use client'

import { createContext, useContext, useId, type ReactNode } from 'react'
import { BubbleShape } from '@/app/components/scenery/bubbleKit'
import {
    AangMeditate, MeditationRock, AangAvatarState, Appa, Sokka, Toph, Katara, Zuko, Iroh, Momo, Glider, Cloud, Bird, Sun, Stars, Nebula, Sparkle, Crater, Firefly, Dipper, Mabel, Stan, Soos, Ford, BillCipher, UniversePortal, Console, MysteryShack, GfGnome, GfMushroom, GfEye, gfScale, GfForest, GfLamp, GfBoulder, GfGrass, GfMist, PORTAL_CY, PORTAL_GLYPHS,
    L, F, GLOW, WARM,
} from '@/app/components/scenery/illustrations'
import { SHADE } from '@/app/components/scenery/illustrations/core'
import { AV_YELLOW, AV_BOOT, AV_TRIM } from '@/app/components/scenery/illustrations/avatarPalette'

/**
 * Ch.02 "Building Under Pressure" — the two strips (780 × 150, drawn in the full frame, ground at y = 134).
 *
 *   Nature  "Four Elements, One Deadline" (30 s): Sokka pencils a blueprint (Momo perched on the board), Katara and Zuko keep practising water against
 *           fire, each in the style of its art (see the practice block below; a burst of steam at every clash) while Iroh breathes a little fire over his tea, Toph lifts a boulder out of the ground (a beetle was under it),
 *           and Aang rises into the Avatar State: the boulder splits and its stones fly into orbit round him, and the very water and fire Katara and Zuko were
 *           bending are drawn out of their hands in one unbroken stream each and wound into rings inside a sphere of air; then it lets go and he settles:
 *           "a small commit". Appa sleeps on the side. Every speech bubble stays up for its reading time and never overlaps another.
 *   Space   "Portal Under Pressure" (Gravity Falls, 28 s): the Universe Portal charges in a night clearing while Bill Cipher, the deadline, floats closer.
 *           Dipper reads Journal 3, Stan whacks the console, Soos hammers a junction box, Mabel throws glitter in; the ring closes and Ford steps out.
 *           A watching eye-moon and Bill's own eye follow whoever is speaking. Every speech bubble stays up for at least (characters ÷ 14) + 1 seconds.
 *           A garden gnome peeks out from behind a giant toadstool at the clearing (its eyes follow the speakers too), ducks behind the stem while Bill looms
 *           and pops back out when Ford steps through. The Mystery Shack stands at the right edge, drawn after the title-card art.
 *
 * Each world loops on ONE SMIL clock (every <animate*> uses its world's loop length, repeatCount = indefinite, keyed in seconds below), so the
 * scenes survive the theme switch (useScenePlayback restarts the visible world's clock). Reduced motion freezes both on a finale
 * frame (FREEZE seconds in): the same keyframes, sampled once.
 */
const DUR = 14
const G = 134                                   // the ground line
const FREEZE_SPACE = 21.8                       // Ford has stepped out of the open portal, waving; the vortex is spinning; Bill looms; the gnome is back out

const r2 = (n: number) => Math.round(n * 100) / 100

type Pts = number[][]                           // [seconds, value…]
/** keyframes sorted, first at 0 and last at the loop length, so every SMIL track starts at 0 and ends at 1 */
function norm(pts: Pts, dur: number = DUR): Pts {
    const a = pts.map(p => [...p])
    for (let i = 1; i < a.length; i++) if (a[i][0] < a[i - 1][0]) a[i][0] = a[i - 1][0]     // SMIL ignores a track whose keyTimes run backwards
    if (a[0][0] > 0) a.unshift([0, ...a[0].slice(1)])
    const l = a[a.length - 1]
    if (l[0] < dur) a.push([dur, ...l.slice(1)])
    return a
}
const kt = (a: Pts, dur: number = DUR) => a.map(p => r2(p[0] / dur)).join(';')
const splines = (n: number) => Array(Math.max(n - 1, 0)).fill('0.45 0 0.55 1').join(';')
/** the value(s) of a track at time t (linear between keyframes) */
function sample(pts: Pts, t: number, dur: number = DUR): number[] {
    const a = norm(pts, dur)
    for (let i = 1; i < a.length; i++) {
        if (t <= a[i][0]) {
            const f = a[i][0] === a[i - 1][0] ? 1 : (t - a[i - 1][0]) / (a[i][0] - a[i - 1][0])
            return a[i].slice(1).map((v, j) => r2(a[i - 1][j + 1] + (v - a[i - 1][j + 1]) * f))
        }
    }
    return a[a.length - 1].slice(1)
}

/** null = play; a number = the reduced-motion frame to hold (seconds into the loop) */
const Frozen = createContext<number | null>(null)
/** the loop length of the world being drawn (Space: 28 s, Nature: 30 s) — every SMIL track below runs on it */
const DurCtx = createContext<number>(DUR)
const useClock = () => ({ dur: `${useContext(DurCtx)}s`, repeatCount: 'indefinite' as const })

function Fade({ pts, children }: { pts: Pts; children: ReactNode }) {
    const fz = useContext(Frozen)
    const dur = useContext(DurCtx)
    const clock = useClock()
    if (fz !== null) return <g opacity={sample(pts, fz, dur)[0]}>{children}</g>
    const a = norm(pts, dur)
    return (
        <g opacity={a[0][1]}>
            <animate attributeName="opacity" {...clock} keyTimes={kt(a, dur)} values={a.map(p => p[1]).join(';')} />
            {children}
        </g>
    )
}
/** a track of numbers fed to one transform: translate [t, x, y] · rotate [t, deg(, cx, cy)] · scale [t, sx, sy] */
function Tr({ type, pts, smooth = false, children }: { type: 'translate' | 'rotate' | 'scale'; pts: Pts; smooth?: boolean; children: ReactNode }) {
    const fz = useContext(Frozen)
    const dur = useContext(DurCtx)
    const clock = useClock()
    if (fz !== null) return <g transform={`${type}(${sample(pts, fz, dur).join(' ')})`}>{children}</g>
    const a = norm(pts, dur)
    return (
        <g>
            <animateTransform attributeName="transform" type={type} {...clock} keyTimes={kt(a, dur)} values={a.map(p => p.slice(1).join(' ')).join(';')}
                              {...(smooth ? { calcMode: 'spline' as const, keySplines: splines(a.length) } : {})} />
            {children}
        </g>
    )
}
/** a presentation attribute on the element it sits in (stroke-dashoffset …) */
function Attr({ name, pts }: { name: string; pts: Pts }) {
    const fz = useContext(Frozen)
    const dur = useContext(DurCtx)
    const clock = useClock()
    if (fz !== null) return null
    const a = norm(pts, dur)
    return <animate attributeName={name} {...clock} keyTimes={kt(a, dur)} values={a.map(p => p[1]).join(';')} />
}
const Live = ({ children }: { children: ReactNode }) => (useContext(Frozen) === null ? <>{children}</> : null)

/* ───────── speech bubbles (the shared bubble kit), sized from their lines ───────── */
function Say({ cx, y0, lines, tip, fs = 8.4, pts, tailAt, side = 'bottom' }: { cx: number; y0: number; lines: string[]; tip: [number, number]; fs?: number; pts: Pts; tailAt?: number; side?: 'bottom' | 'top' | 'left' | 'right' }) {
    const cw = fs * 0.54
    const w = Math.max(...lines.map(l => l.length)) * cw + 15
    const h = 9 + fs + (lines.length - 1) * fs * 1.32 + 3
    const x0 = Math.min(Math.max(cx - w / 2, 4), 776 - w)
    return (
        <Fade pts={pts}>
            <BubbleShape x0={r2(x0)} y0={y0} x1={r2(x0 + w)} y1={r2(y0 + h)} tail={{ side, at: tailAt ?? tip[0], tip, half: 6 }} />
            {lines.map((l, i) => (
                <text key={i} className="bub-text" x={r2(x0 + w / 2)} y={r2(y0 + 4.5 + fs + i * fs * 1.32)} textAnchor="middle" fontSize={fs} fontFamily="inherit"
                      textLength={r2(l.length * cw)} lengthAdjust="spacingAndGlyphs">{l}</text>
            ))}
        </Fade>
    )
}
/** a window of visibility: in at a, full from a + 0.25, out from b − 0.25 */
const win = (a: number, b: number, end: number = DUR): Pts => [[0, 0], [a, 0], [a + 0.25, 1], [b - 0.25, 1], [b, 0], [end, 0]]

/* ───────── ground, shared by both worlds (the same two ridges the other strips use, lowered into the 150-tall frame) ───────── */
const RIDGE_FAR = 'M0 100 V64 C60 50 120 68 180 58 S300 44 360 54 V100 Z'
const RIDGE_MID = 'M0 100 V80 C80 68 160 84 240 76 S330 70 360 72 V100 Z'
/** an edgeless warm band along the horizon: stacked translucent ellipses (the group's opacity is animated by the caller) */
function HorizonGlow({ cx, rx = 330 }: { cx: number; rx?: number }) {
    return (
        <g fill="var(--scene-glow)" stroke="none">
            {[1, 0.82, 0.64, 0.46].map((k, i) => <ellipse key={i} cx={cx} cy={130 - i * 3} rx={rx * k} ry={46 * k} opacity={0.2} />)}
        </g>
    )
}
function Land() {
    return (
        <>
            <g transform={`translate(0 50) scale(${780 / 360} 1)`}>
                <path d={RIDGE_FAR} className="sc-far" />
                <path d={RIDGE_MID} className="sc-mid" />
                <path d={RIDGE_MID} {...L} strokeWidth={1} opacity={0.4} vectorEffect="non-scaling-stroke" />
            </g>
            <rect x={0} y={G - 1} width={780} height={150 - G + 1} className="sc-mid" />
            <path d={`M0 ${G - 1} H780`} {...L} strokeWidth={1} opacity={0.45} />
        </>
    )
}

/* ═════════════════════════════ NATURE ═════════════════════════════ */
/*  "Four Elements, One Deadline" — a 30 s loop, one beat after another, left to right. Every speech bubble gets its reading time (see `dwell`)
    and never overlaps another bubble; the action around it is timed to that.
      0–5      Sokka pencils the plan on his blueprint board (Momo, perched on top, does not move a muscle)
      4.8–8.4  Katara swirls a ribbon of water, then aims it
      8.6–21   Katara and Zuko practise, seven exchanges: she draws water from her waterskin and moves it the way tai chi does (steps back as she pulls, rolls forward as she
                thrusts, then the water goes back into the skin); he coils, lunges and strikes the way Northern Shaolin does (the fire is made by the strike and burns out within a few strides)
      14–15    Iroh breathes a short jet of fire over his cup to warm the tea (no table: it is only him, his cup and his tea)
      17–21.5  Toph stomps; a boulder rises out of the ground (a beetle was under it), she hoists it overhead
      20.4–26.4 Aang glows, lifts off his rock; Toph's boulder splits and its stones fly into orbit round him; Katara and Zuko raise their hands and the water
                and fire they were bending flow out of them, in one stream each, into rings round him, all inside a sphere of air (the Sozin's Comet finale);
                then it all lets go
      26.2–30  he settles back down: "That was supposed to be a small commit."                                                           */
const ND = 30
const FREEZE_NATURE = 24.8                      // the peak of the Avatar State: Aang aloft, ringed by air, water, fire and stone
const winN = (a: number, b: number): Pts => win(a, b, ND)
const WATER = 'color-mix(in srgb, var(--sc-panel) 80%, var(--sc-glass))'
const LIT = 'color-mix(in srgb, var(--sc-glass) 55%, var(--sc-snow))'
const BLUEPRINT = 'color-mix(in srgb, var(--sc-panel) 52%, var(--scene-fill))'
const STONE = 'color-mix(in srgb, var(--sc-line) 14%, var(--sc-cloud))'
const SOIL = 'color-mix(in srgb, var(--sc-trunk) 78%, var(--sc-mid))'
const FLAME = 'var(--sc-flame)'
const FOREHEAD = 'M-1 -48.2 V-45.6 L-2.9 -45.6 L0 -42 L2.9 -45.6 L1 -45.6 V-48.2 Z'

/** Where everyone stands. Three depth rows give the strip its depth: the back row is higher up the ground and smaller, the front row lower and bigger (a 1 % size change
 *  per pixel of ground). Every size follows the characters' real relative heights — fan estimates, the show gives no official figures: Aang 137 cm (4'6") · Katara 150 ·
 *  Sokka 160 · Zuko 162 · Toph 113 (3'8½") · Iroh 173 (5'8", seated, in proportion to Aang seated) · Momo ≈ 30 — at one scale for all, 0.42 px per cm (each sprite's
 *  native height was measured, so Aang stays at 1:1 and the Avatar State rings still fit him). Appa, a giant, is shown at 0.72 so he still fits the strip. */
const PX_CM = 0.42
const ROW = { back: G - 7, mid: G, front: G + 7 }
const depth = (y: number) => r2(1 + (y - G) * 0.01)
const fit = (cm: number, native: number, y: number) => r2(((cm * PX_CM) / native) * depth(y))
const SOK_S = fit(160, 77.6, ROW.back), BRD_S = r2(0.85 * depth(ROW.back)), IRO_S = r2(((173 * 48.7) / 137 / 62.2) * depth(ROW.back))
const CAST = {
    sokka: { x: 40, y: ROW.back, s: SOK_S, h: 77.6 },
    // the board stands so Sokka's pencil tip (at 23.6, −52 in his frame) lands on its first line of writing (at −19, −54 in the board's)
    board: { x: r2(40 + SOK_S * 23.6 + BRD_S * 19), y: ROW.back, s: BRD_S, h: 76 },
    momo: { x: r2(40 + SOK_S * 23.6 + BRD_S * 19), y: r2(ROW.back - 76 * BRD_S), s: r2(0.5 * depth(ROW.back)), h: 29.6 },
    katara: { x: 150, y: ROW.mid, s: fit(150, 67.7, ROW.mid), h: 67.7 },
    zuko: { x: 258, y: ROW.mid, s: fit(162, 73.1, ROW.mid), h: 73.1 },
    iroh: { x: 352, y: ROW.back, s: IRO_S, h: 62.2 },
    aang: { x: 462, y: ROW.mid, s: 1, h: 48.7 },
    toph: { x: 572, y: ROW.front, s: fit(113, 60.7, ROW.front), h: 60.7 },
    boulder: { x: 614, y: ROW.front, s: r2(1.25 * depth(ROW.front)), h: 23 },
    appa: { x: 704, y: G - 12, s: r2(0.72 * depth(G - 12)), h: 88 },
}
const X = { sokka: CAST.sokka.x, board: CAST.board.x, katara: CAST.katara.x, zuko: CAST.zuko.x, iroh: CAST.iroh.x, aang: CAST.aang.x, toph: CAST.toph.x, boulder: CAST.boulder.x, appa: CAST.appa.x }
/** a point in a character's own frame (lx, ly), in the strip */
const at = (c: { x: number; y: number; s: number }, lx: number, ly: number): [number, number] => [r2(c.x + c.s * lx), r2(c.y + c.s * ly)]
/** where hands are: Katara's and Zuko's while they aim at each other (arms level), and when they raise them for Aang (arms up); Iroh's cup */
const KAT_AIM = at(CAST.katara, 24.9, -47.2), ZUK_AIM = at(CAST.zuko, -30, -50.2)
const KAT_UP = at(CAST.katara, 14.7, -64.4), ZUK_UP = at(CAST.zuko, -13.6, -76.1)
const CUP = at(CAST.iroh, -24.7, -40.4)
/** where the water meets the flame: halfway between their hands (the flame is drawn long enough to reach it) */
const CLASH: [number, number] = [r2((KAT_AIM[0] + ZUK_AIM[0]) / 2), r2((KAT_AIM[1] + ZUK_AIM[1]) / 2)]
const FLAME_K = r2(Math.max(0.85, (ZUK_AIM[0] - CLASH[0]) / 25))
/** the tail of each speech bubble points a little above its speaker's head, and the bubble sits above that */
const TIP = {
    sokka: r2(CAST.sokka.y - CAST.sokka.s * 74 - 7), katara: r2(CAST.katara.y - CAST.katara.s * CAST.katara.h - 7), zuko: r2(CAST.zuko.y - CAST.zuko.s * CAST.zuko.h - 7),
    iroh: r2(CAST.iroh.y - CAST.iroh.s * CAST.iroh.h - 7), toph: r2(CAST.toph.y - CAST.toph.s * CAST.toph.h - 7),
}
const bubY = (lines: string[], tip: number) => Math.round(tip - (9 + 8.4 + (lines.length - 1) * 8.4 * 1.32 + 3) - 10)
/** Toph's arms, as angles for her LEFT arm (the right mirrors it): the stomp drops them, the lift raises them from the shoulder and the elbow, a strain-tremble, the throw snaps them forward */
const TOPH_UPPER: [number, number][] = [[0, 0], [16.5, 0], [17.0, -18], [17.6, -8], [18.3, 38], [19.6, 108], [19.9, 104], [20.4, 110], [20.9, 105], [21.4, 108], [21.55, 108], [21.8, 62], [22.4, 50], [23.3, 0]]
const TOPH_FORE: [number, number][] = [[0, 0], [16.5, 0], [17.0, -10], [17.6, -4], [18.3, 16], [19.6, 122], [20.4, 125], [21.4, 121], [21.55, 121], [21.8, 30], [22.4, 22], [23.3, 0]]

/** what each bubble says, when it opens, and how long it stays: a second to notice it plus ~3 words a second, never under 2.6 s.
 *  Each opens after the one before has closed (the actions below are keyed to these). */
const LINES = {
    sokka: ['The plan is flawless.', 'I just haven’t found', 'the flaw yet.'],
    katara: ['Breathe.', 'Then commit.'],
    zuko: ['I’m not angry. This is', 'my debugging face.'],
    iroh: ['Pressure is just heat', 'with a deadline.', 'Have some tea.'],
    toph: ['Found your bug, Snoozles.', 'It was under this rock.'],
    aang: ['That was supposed to be', 'a small commit.'],
}
const SAY_AT = { sokka: 0.5, katara: 5.4, zuko: 8.8, iroh: 12.8, toph: 17.4, aang: 26.2 }
const dwell = (lines: string[]) => Math.max(2.6, 1 + lines.join(' ').split(/\s+/).length * 0.32)
const sayWin = (k: keyof typeof LINES): Pts => winN(SAY_AT[k], SAY_AT[k] + dwell(LINES[k]))

/** the sun: sinks from high to behind the ridge by ~21 s; the sky behind it warms as it goes */
const SUN_X = 520        // a lane of open sky: no cloud, bird or bubble crosses it, and it sets in the gap between Aang and Toph
const SUN_Y: Pts = [[0, 0, 22], [21.0, 0, 124], [22.0, 0, 150]]
const NATURE_SKY: Pts = [[0, 0.1], [21.0, 1], [26.8, 1], [ND, 0.1]]

/** Sokka's blueprint board: a plan in three boxes, four tick-boxes (the third pulses; the fourth ticks at the peak) and a deadline bar. Momo sits on top (a separate figure). */
function Board({ x, y, s }: { x: number; y: number; s: number }) {
    const ticks: [number, number][] = [[-14, 1.2], [-4.7, 2.8], [4.7, 4.2], [14, 24.4]]
    return (
        <g transform={`translate(${x} ${y}) scale(${s})`}>
            <path d="M-20 0 L-15 -36 M20 0 L15 -36 M0 0 V-34" {...L} strokeWidth={1.3} />
            <rect x={-28} y={-76} width={56} height={42} rx={2} {...F} fill={BLUEPRINT} />
            <path d="M-28 -62 H28 M-28 -48 H28 M-14 -76 V-34 M0 -76 V-34 M14 -76 V-34" {...L} strokeWidth={0.4} opacity={0.22} />
            {/* the plan: three boxes and a trailing arrow down to the "bug" */}
            {[-23, -6.5, 10].map((x, i) => <rect key={i} x={x} y={-72} width={13} height={8} rx={1} fill="var(--sc-snow)" stroke="currentColor" strokeWidth={0.8} opacity={0.92} />)}
            <path d="M-10 -68 H-6.5 M6.5 -68 H10 M16.5 -64 V-58" {...L} strokeWidth={0.8} />
            <path d="M14.8 -59.6 L16.5 -57.6 L18.2 -59.6" {...L} strokeWidth={0.8} />
            <circle cx={16.5} cy={-55.6} r={2} fill="var(--sc-accent)" stroke="currentColor" strokeWidth={0.7} />
            <path d="M-22 -58 H5 M-22 -54.6 H-6" {...L} strokeWidth={0.6} opacity={0.45} />
            {/* four tick-boxes */}
            {ticks.map(([x], i) => <rect key={i} x={x - 2.6} y={-50.6} width={5.2} height={5.2} rx={0.8} fill="var(--sc-snow)" stroke="currentColor" strokeWidth={0.8} />)}
            {ticks.map(([x, t], i) => (
                <Fade key={i} pts={[[0, 0], [t, 0], [t + 0.3, 1], [28.4, 1], [28.9, 0], [ND, 0]]}>
                    <path d={`M${x - 1.9} -48 L${x - 0.5} -46.2 L${x + 2.2} -50`} {...L} strokeWidth={1.4} />
                </Fade>
            ))}
            <Fade pts={[[0, 0], [4.0, 0], [4.3, 0.9], [4.8, 0.2], [5.3, 0.9], [5.8, 0.2], [6.3, 0.9], [6.8, 0], [ND, 0]]}>
                <circle cx={4.7} cy={-48} r={5.6} {...GLOW} opacity={0.5} />
            </Fade>
            {/* the deadline bar: fills all the way to the Avatar State */}
            <rect x={-22} y={-42} width={44} height={3.2} rx={1.6} {...F} fill="var(--scene-fill)" strokeWidth={0.8} />
            <g transform="translate(-22 -42)">
                <Fade pts={[[0, 1], [28.4, 1], [28.9, 0], [ND, 0]]}>
                    <Tr type="scale" pts={[[0, 0.02, 1], [24.4, 1, 1]]}>
                        <rect width={44} height={3.2} rx={1.6} {...WARM} />
                    </Tr>
                </Fade>
            </g>
        </g>
    )
}

/** Sokka's pencil, in his writing hand */
const PENCIL = (
    <>
        <path d="M14.4 -41.4 L23.6 -52" {...L} strokeWidth={2.4} />
        <path d="M14.4 -41.4 L23.6 -52" stroke="var(--sc-sign)" strokeWidth={1} strokeLinecap="round" fill="none" />
        <path d="M13.2 -40 L14.6 -41.6" stroke="var(--sc-accent)" strokeWidth={1.6} strokeLinecap="round" fill="none" />
    </>
)

/** Katara's looping ribbon of water, in the air around her: it draws itself on from her hand, flows smoothly round its loop, then is drawn back in */
function Ribbon({ d, a, b }: { d: string; a: number; b: number }) {
    const dash = { pathLength: 100, strokeDasharray: 100, strokeDashoffset: 100 }
    const go = <Attr name="stroke-dashoffset" pts={[[0, 100], [a, 100], [a + 0.9, 0], [b - 0.5, 0], [b + 0.4, -100], [ND, -100]]} />
    return (
        <>
            <Fade pts={[[0, 0], [a - 0.03, 0], [a, 1], [b + 0.35, 1], [b + 0.4, 0], [ND, 0]]}>
                <path d={d} fill="none" stroke="currentColor" strokeWidth={6.6} strokeLinecap="round" opacity={0.5} {...dash}>{go}</path>
                <path d={d} fill="none" stroke={WATER} strokeWidth={5} strokeLinecap="round" {...dash}>{go}</path>
            </Fade>
            <Fade pts={[[0, 0], [a + 0.8, 0], [a + 1.0, 0.85], [b - 0.5, 0.85], [b - 0.2, 0], [ND, 0]]}>
                <path d={d} fill="none" stroke="var(--sc-glass)" strokeWidth={1.6} strokeLinecap="round" strokeDasharray="9 7">
                    <Live><animate attributeName="stroke-dashoffset" values="0;-32" dur="1.6s" repeatCount="indefinite" /></Live>
                </path>
            </Fade>
        </>
    )
}
const SWIRL = 'M240 92 C240 70 188 68 184 90 C181 108 232 114 244 96'
/** her water, from her hand to the flame */
const WHIP_D = `M${KAT_AIM[0]} ${KAT_AIM[1]} C${r2(KAT_AIM[0] + 9)} ${r2(KAT_AIM[1] - 7)} ${r2(CLASH[0] - 12)} ${r2(CLASH[1] + 6)} ${CLASH[0]} ${CLASH[1]}`

/** a tongue of flame pointing LEFT, base at the origin (turned a quarter for a rising flame) */
function Flame({ s = 1 }: { s?: number }) {
    const d = 'M0 0 C-3 -5 -8 -7 -12 -4 C-13 -7 -17 -8 -21 -5 C-19 -3 -22 -1 -25 0 C-22 2 -19 3 -21 5 C-17 8 -13 7 -12 4 C-8 7 -3 5 0 0 Z'
    return (
        <g transform={`scale(${s})`}>
            <g>
                <Live><animateTransform attributeName="transform" type="scale" values="1 1;1.08 0.9;0.96 1.1;1 1" dur="0.55s" repeatCount="indefinite" /></Live>
                <circle cx={-10} cy={0} r={12} {...GLOW} opacity={0.3} />
                <path d={d} fill={FLAME} stroke="currentColor" strokeWidth={1} strokeLinejoin="round" />
                <path d={d} transform="translate(-3 0) scale(0.56)" {...GLOW} />
            </g>
        </g>
    )
}

/** Aang's arrows, lit, in the moment before he lifts off (over the meditating pose) */
function AangLit() {
    const spots: [number, number][] = [[0, -45], [-2.4, -21.6], [2.4, -21.6], [-6.5, -1.8], [6.5, -1.8]]
    return (
        <Fade pts={winN(20.4, 21.8)}>
            <g transform="translate(0 -23)" fill={WATER} stroke="none">
                <ellipse rx={40} ry={39} opacity={0.08} /><ellipse rx={32} ry={31} opacity={0.12} /><ellipse rx={24} ry={24} opacity={0.16} />
            </g>
            {spots.map(([x, y], i) => (
                <g key={i} transform={`translate(${x} ${y})`} fill={WATER} stroke="none">
                    <circle r={i === 0 ? 7 : 5.4} opacity={0.2} /><circle r={i === 0 ? 4.6 : 3.6} opacity={0.32} />
                </g>
            ))}
            <path d={FOREHEAD} fill={LIT} stroke="var(--sc-snow)" strokeWidth={0.6} strokeLinejoin="round" />
            <path d="M-3.8 -23.2 V-20 L-1.2 -21.6 Z M3.8 -23.2 V-20 L1.2 -21.6 Z" fill={LIT} stroke="var(--sc-snow)" strokeWidth={0.5} strokeLinejoin="round" />
            <path d="M-6.5 -0.3 l-1.1 -2.3 h2.2 Z M6.5 -0.3 l-1.1 -2.3 h2.2 Z" fill={LIT} stroke="var(--sc-snow)" strokeWidth={0.5} />
        </Fade>
    )
}

/* ───── Toph's boulder lift ───── */
/** a rough, faceted boulder (~32 × 23, base at the origin): a lit top-left facet, a shaded right flank, cracks, and the soil and grass still clinging to its underside */
const BOULDER_D = 'M-15 0 L-16.4 -8 L-11 -17.4 L-3 -23 L7 -22 L14.4 -15 L16.4 -6 L13.4 0 Z'
function BoulderArt({ cracked }: { cracked?: ReactNode }) {
    return (
        <g transform="scale(1.25)">
            <path d={BOULDER_D} {...F} fill={STONE} strokeWidth={1.3} />
            <path d="M-11 -17.4 L-3 -23 L3 -21.4 L-3.6 -13 L-12 -9 Z" fill="var(--sc-snow)" opacity={0.55} stroke="none" />
            <path d="M7 -22 L14.4 -15 L16.4 -6 L13.4 0 L5 0 L8.4 -10 Z" {...SHADE} />
            <path d="M-2 -22.6 L-5 -14.6 L-1 -9.6 L-4.4 -3 M9 -17 L5.6 -12 L8.4 -8" {...L} strokeWidth={0.8} opacity={0.55} />
            <path d="M-15 0 L-14.2 -3.4 L-9.6 -1.2 L-6.4 -4.4 L-0.4 -1.4 L5 -3.6 L10 -1.2 L14.4 -3.2 L13.4 0 Z" fill={SOIL} stroke="currentColor" strokeWidth={0.8} strokeLinejoin="round" />
            <path d="M-9 -2.6 L-10 -6.4 M-6.6 -3.2 L-6.4 -7 M9.6 -2.6 L10.8 -6.2" stroke="var(--sc-tree)" strokeWidth={1.1} strokeLinecap="round" fill="none" />
            {cracked}
        </g>
    )
}

/** a small beetle (the "bug"), ~9 wide, facing left: red shell with a seam and two spots, six legs, two feelers */
function Beetle() {
    return (
        <g>
            <path d="M-2 -1.6 L-5 0.4 M0 -1.4 L-1 1.4 M2 -1.6 L4 0.4 M-2.6 -3 L-6 -2.4 M0.4 -3 L-0.4 -5.6 M2.6 -3.2 L5 -5" {...L} strokeWidth={0.8} />
            <ellipse cx={0.6} cy={-3.2} rx={4.6} ry={3} {...F} fill="var(--sc-accent)" strokeWidth={0.9} />
            <path d="M0.8 -6 V-0.6" {...L} strokeWidth={0.6} opacity={0.6} />
            <circle cx={-1.2} cy={-4} r={0.7} fill="var(--sc-snow)" stroke="none" /><circle cx={2.6} cy={-2.6} r={0.7} fill="var(--sc-snow)" stroke="none" />
            <circle cx={-5} cy={-3.4} r={1.7} {...F} fill="var(--scene-fill)" strokeWidth={0.9} />
            <path d="M-6 -4.8 L-8.4 -7.4 M-4.6 -5 L-5.4 -8.2" {...L} strokeWidth={0.7} />
        </g>
    )
}

/** keep one half of a ring: the "back" (above its centre line, behind Aang) or the "front" (below it, in front of him) */
function Half({ id, layer, cx, cy, rx, ry, children }: { id: string; layer: 'back' | 'front'; cx: number; cy: number; rx: number; ry: number; children: ReactNode }) {
    const y = layer === 'back' ? cy - ry - 40 : cy
    return (
        <g clipPath={`url(#${id}${layer})`}>
            <clipPath id={`${id}${layer}`}><rect x={cx - rx - 40} y={y} width={2 * rx + 80} height={ry + 40} /></clipPath>
            {children}
        </g>
    )
}
const ellipsePath = (cx: number, cy: number, rx: number, ry: number, dir: 1 | -1) =>
    `M${cx + rx} ${cy} A${rx} ${ry} 0 1 ${dir > 0 ? 1 : 0} ${cx - rx} ${cy} A${rx} ${ry} 0 1 ${dir > 0 ? 1 : 0} ${cx + rx} ${cy} Z`
/** a ring that starts at its LEFT end and runs round through the front, so a stream arriving from the left feeds straight into it */
const ringFromRight = (cx: number, cy: number, rx: number, ry: number) =>
    `M${r2(cx + rx)} ${cy} A${rx} ${ry} 0 1 0 ${r2(cx - rx)} ${cy} A${rx} ${ry} 0 1 0 ${r2(cx + rx)} ${cy} Z`
const ringFromLeft = (cx: number, cy: number, rx: number, ry: number) =>
    `M${r2(cx - rx)} ${cy} A${rx} ${ry} 0 1 0 ${r2(cx + rx)} ${cy} A${rx} ${ry} 0 1 0 ${r2(cx - rx)} ${cy} Z`

/** n copies of `item` circling an ellipse (animateMotion), or sitting at even angles for the reduced-motion frame */
function Orbit({ id, layer, cx, cy, rx, ry, n, dur, dir, item }: { id: string; layer: 'back' | 'front'; cx: number; cy: number; rx: number; ry: number; n: number; dur: number; dir: 1 | -1; item: (i: number) => ReactNode }) {
    const fz = useContext(Frozen)
    return (
        <Half id={id} layer={layer} cx={cx} cy={cy} rx={rx} ry={ry}>
            {Array.from({ length: n }, (_, i) => {
                if (fz !== null) {
                    const a = dir * ((i / n) * Math.PI * 2 + 0.35)
                    return <g key={i} transform={`translate(${r2(cx + rx * Math.cos(a))} ${r2(cy + ry * Math.sin(a))})`}>{item(i)}</g>
                }
                return (
                    <g key={i}>
                        <animateMotion path={ellipsePath(cx, cy, rx, ry, dir)} dur={`${dur}s`} begin={`${-(dur * i) / n}s`} repeatCount="indefinite" rotate="0" />
                        {item(i)}
                    </g>
                )
            })}
        </Half>
    )
}

const ROCKS = ['M-3.2 -1 L-1 -3.6 L2.8 -2.2 L3.4 1.6 L-0.4 3.2 Z', 'M-2.6 -2.6 L1.6 -3.2 L3.2 0.4 L0.6 3 L-3 1.2 Z', 'M-3 0 L-0.6 -3.2 L3 -1.4 L2 2.8 L-2 2.4 Z']
const rock = (i: number) => <path d={ROCKS[i % 3]} transform={`scale(${[1, 0.8, 1.15, 0.9][i % 4]})`} {...F} fill={STONE} strokeWidth={1} />

/* ───── the Avatar State ───── */
/* When the Avatar State takes Aang (21.6 s) his friends feed him their elements, and the air he gathers holds them all (the order in the show: air, fire, earth, water):
     air    a sphere of wind grows round him (22 → 23.2 s) and keeps turning
     fire   Zuko raises his fist and the flame he was throwing streams out of it and winds into a flat band round his waist (22.3 s → ring closed ≈ 24.3 s)
     earth  Toph's boulder splits in the air at 21.55 s; its stones arc across and each lands exactly where an orbiting stone is at that moment (23.3 s)
     water  Katara raises her arm and the water she was whipping streams out of it, over the strip and round him as a tilted hoop (22.45 s → ≈ 24.5 s)
   Each stream is a single stroke from the hand into its ring (see `Stream`), so the element visibly flows into its orbit without a break.
   The rings are tilted as in the finale (water steep, fire nearly flat, stones loose) so his face and hands stay clear. */
const T_STONE = 23.3, T_OFF = 26.3
/** how far the Avatar State lifts Aang and his rings off the ground (the translate on the ring group, below) */
const RAISE = -34
const AANG_Y = G - 24, CY_A = AANG_Y - 28
type Ring = { cx: number; cy: number; rx: number; ry: number; rot: number }
/** The rings, tilted as in the show (the rings' angles are read off the finale frame): water is a tall, thin hoop leaning about 53° from the horizontal, upper-left to
 *  lower-right, its right-hand band passing in front of him; fire is a wide, almost flat band round his waist (a hair lower on the right), wider than the sphere. */
const WATER_R: Ring = { cx: X.aang, cy: CY_A - 4, rx: 38, ry: 11, rot: -127 }
const FIRE_R: Ring = { cx: X.aang, cy: CY_A + 14, rx: 54, ry: 9.5, rot: 2 }
const STONE_1 = { cx: X.aang, cy: CY_A - 1, rx: 40, ry: 27, rot: -28, n: 6, dur: 6 }

const rad = (d: number) => (d * Math.PI) / 180
/** a point on a ring (θ in the ring's own frame), where it sits in the strip once he has lifted */
function ringPt(R: Ring, th: number): [number, number] {
    const a = rad(R.rot), x = R.rx * Math.cos(th), y = R.ry * Math.sin(th)
    return [r2(R.cx + x * Math.cos(a) - y * Math.sin(a)), r2(R.cy + RAISE + x * Math.sin(a) + y * Math.cos(a))]
}
/** the direction of travel at θ for the way every ring turns (θ decreasing: its front half sweeps from its left end to its right end) */
function ringTan(R: Ring, th: number): [number, number] {
    const a = rad(R.rot), x = R.rx * Math.sin(th), y = -R.ry * Math.cos(th)
    const dx = x * Math.cos(a) - y * Math.sin(a), dy = x * Math.sin(a) + y * Math.cos(a), n = Math.hypot(dx, dy)
    return [dx / n, dy / n]
}
const perimeter = (R: Ring) => {
    const a = R.rx, b = R.ry, h = ((a - b) / (a + b)) ** 2
    return Math.PI * (a + b) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)))
}
function bezierLength(P: [number, number][], n = 80) {
    let L = 0, px = P[0][0], py = P[0][1]
    for (let i = 1; i <= n; i++) {
        const t = i / n, u = 1 - t
        const x = u * u * u * P[0][0] + 3 * u * u * t * P[1][0] + 3 * u * t * t * P[2][0] + t * t * t * P[3][0]
        const y = u * u * u * P[0][1] + 3 * u * u * t * P[1][1] + 3 * u * t * t * P[2][1] + t * t * t * P[3][1]
        L += Math.hypot(x - px, y - py); px = x; py = y
    }
    return L
}
/** the angle θ that something orbiting on an ellipse (animateMotion moves at constant speed along the PATH, not constant angle) has reached after a fraction f of a turn */
function angleAt(R: Ring, f: number): number {
    const N = 720, cum: number[] = [0]
    for (let k = 1; k <= N; k++) {
        const th = (-2 * Math.PI * (k - 0.5)) / N
        cum.push(cum[k - 1] + Math.hypot(R.rx * Math.sin(th), R.ry * Math.cos(th)) * ((2 * Math.PI) / N))
    }
    const goal = f * cum[N]
    let k = 1
    while (k < N && cum[k] < goal) k++
    const g = (goal - cum[k - 1]) / (cum[k] - cum[k - 1] || 1)
    return (-2 * Math.PI * (k - 1 + g)) / N
}
/** where the i-th big stone of the first stone orbit is at time T (its orbit period divides the 30 s loop, so this is the same every loop) */
function stoneAt(i: number, T: number): [number, number] {
    const R = STONE_1
    const f = (((T / R.dur + i / R.n) % 1) + 1) % 1
    return ringPt(R, angleAt(R, f))
}

/** One stream of an element, from a bender's hand into its ring, as ONE stroke: a rope that leaves the hand and arrives at the ring's entry point already moving
 *  the way the ring turns, then goes on round the ring once. It is drawn on at a constant speed, so the head runs out of the hand, along the rope and round the ring with no
 *  gap and no change of speed; the tail stays in the hand the whole time (they keep feeding it). When the ring has closed, the rope is drawn back into it. */
type Plan = { d: string; lr: number; ll: number; t0: number; headEnd: number; tailEnd: number; ring: Ring }
function plan(R: Ring, th0: number, H: [number, number], c1: [number, number], k: number, t0: number): Plan {
    const E = ringPt(R, th0), T = ringTan(R, th0)
    const c2: [number, number] = [r2(E[0] - T[0] * k), r2(E[1] - T[1] * k)]
    const E2: [number, number] = [r2(2 * R.cx - E[0]), r2(2 * (R.cy + RAISE) - E[1])]
    const arc = (to: [number, number]) => `A${R.rx} ${R.ry} ${R.rot} 0 0 ${to[0]} ${to[1]}`
    const d = `M${H[0]} ${H[1]} C${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${E[0]} ${E[1]} ${arc(E2)} ${arc(E)}`
    const lr = bezierLength([H, c1, c2, E]), ll = perimeter(R)
    const headEnd = t0 + (lr + ll) / STREAM_V
    return { d, lr, ll, t0, headEnd, tailEnd: headEnd + lr / (STREAM_V * TAIL_X), ring: R }
}
const STREAM_V = 250, TAIL_X = 2.4       // px a second along the stream; how much faster the rope is drawn back than it ran out
/** fire first, then water (as in the show, where the fire ring comes before the water ring); each enters its ring where the ring's two halves meet or just behind him */
const FIRE_S = plan(FIRE_R, Math.PI, ZUK_UP, [r2(ZUK_UP[0] + 20), r2(ZUK_UP[1] - 46)], 58, 22.3)
const WATER_S = plan(WATER_R, -Math.PI / 2, KAT_UP, [r2(KAT_UP[0] + 26), r2(KAT_UP[1] - 78)], 70, 22.45)

const OUT_W = 'color-mix(in srgb, var(--sc-line) 60%, var(--sc-glass))'
const OUT_F = 'color-mix(in srgb, var(--sc-line) 35%, var(--sc-flame))'
const WATER_STROKES: [string, number][] = [[OUT_W, 7.4], [WATER, 5.4]]
const FIRE_STROKES: [string, number][] = [[OUT_F, 10], [FLAME, 7.8], ['var(--scene-glow)', 3.2]]

/** `layer` back: the whole stream, behind Aang. front: the part of it that is on the near side of the ring (the clip is the ring's front half-plane), over him. */
function Stream({ id, plan: P, kind, layer }: { id: string; plan: Plan; kind: 'water' | 'fire'; layer: 'back' | 'front' }) {
    const fz = useContext(Frozen)
    const clock = useClock()
    if (fz !== null) return null
    const R = P.ring, fr = r2((P.lr / (P.lr + P.ll)) * 100)
    /** [seconds, tail, head] in % of the stream: the head runs out; once it is home the tail runs up to the ring's entry */
    const keys: Pts = [[0, 0, 0], [P.t0, 0, 0], [P.headEnd, 0, 100], [P.tailEnd, fr, 100], [ND, fr, 100]]
    const body = (
        <Fade pts={[[0, 0], [P.t0 - 0.03, 0], [P.t0, 1], [P.tailEnd, 1], [P.tailEnd + 0.05, 0], [ND, 0]]}>
            {(kind === 'water' ? WATER_STROKES : FIRE_STROKES).map(([c, w], i) => (
                <path key={i} d={P.d} fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" pathLength={100} strokeDasharray="0 400" strokeDashoffset={0}>
                    <animate attributeName="stroke-dasharray" {...clock} keyTimes={kt(keys, ND)} values={keys.map(k => `${r2(k[2] - k[1])} 400`).join(';')} />
                    <animate attributeName="stroke-dashoffset" {...clock} keyTimes={kt(keys, ND)} values={keys.map(k => r2(-k[1])).join(';')} />
                </path>
            ))}
            {kind === 'water' && (
                <path d={P.d} fill="none" stroke="var(--sc-glass)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" pathLength={100} strokeDasharray="0 400" strokeDashoffset={0} opacity={0.9}>
                    <animate attributeName="stroke-dasharray" {...clock} keyTimes={kt(keys, ND)} values={keys.map(k => `${r2(k[2] - k[1])} 400`).join(';')} />
                    <animate attributeName="stroke-dashoffset" {...clock} keyTimes={kt(keys, ND)} values={keys.map(k => r2(-k[1])).join(';')} />
                </path>
            )}
        </Fade>
    )
    if (layer === 'back') return body
    const cy = R.cy + RAISE
    return (
        <g clipPath={`url(#${id})`}>
            <clipPath id={id}><rect transform={`rotate(${R.rot} ${R.cx} ${cy})`} x={R.cx - R.rx - 60} y={cy} width={2 * R.rx + 120} height={R.ry + 60} /></clipPath>
            {body}
        </g>
    )
}
/** a ring's fade: it appears the instant its stream has closed it, and lets go with the state */
const ringFade = (t: number): Pts => [[0, 0], [t - 0.04, 0], [t, 1], [T_OFF - 0.9, 1], [T_OFF, 0], [ND, 0]]

/* One continuous revolution. Every ring turns the same way (counter-clockwise in its own frame: its front half sweeps left to right) and everything on it moves at
   the same speed, so the band, its light and the things riding it turn as one:
     · each ring is drawn twice — WHOLE behind Aang, and its front half again over him — so the halves never meet at a join
     · the stream that feeds a ring (above) is drawn on in the ring's own turning direction and with the ring's own stroke, so at the instant the ring is complete it is
       swapped for the identical solid, closed stroke (round joins): no notch, no jump, nothing moves
     · every flowing pattern is a dash whose period divides the path exactly (pathLength 100: 8 repeats of 12.5, or 5 of 20) and runs at the orbit speed of the things riding it
       (water 3.4 s a turn, fire 2.8 s), so highlights and riders never slip against each other. */
function RingSide({ id, layer, cx, cy, rx, ry, children }: { id: string; layer: 'back' | 'front'; cx: number; cy: number; rx: number; ry: number; children: ReactNode }) {
    return layer === 'back' ? <>{children}</> : <Half id={id} layer="front" cx={cx} cy={cy} rx={rx} ry={ry}>{children}</Half>
}
/** a pattern that runs round a closed ring: `period` path-units (of 100) every `sec` seconds */
const flow = (period: number, sec: number) => <Live><animate attributeName="stroke-dashoffset" values={`0;${-period}`} dur={`${sec}s`} repeatCount="indefinite" /></Live>

/** water: a tall, thin hoop leaning back to the upper-left (as in the show), cutting across his body; its right-hand band passes in front of him, the left behind; droplets ride it */
function WaterRing({ id, cx, cy, layer }: { id: string; cx: number; cy: number; layer: 'back' | 'front' }) {
    const { rx, ry, rot } = WATER_R
    const d = ringFromRight(cx, cy, rx, ry)
    const turn = 3.4, t = WATER_S.headEnd
    return (
        <Fade pts={ringFade(t)}>
            <g transform={`rotate(${rot} ${cx} ${cy})`}>
                <RingSide id={id} layer={layer} cx={cx} cy={cy} rx={rx} ry={ry}>
                    {WATER_STROKES.map(([c, w], i) => <path key={i} d={d} fill="none" stroke={c} strokeWidth={w} strokeLinejoin="round" />)}
                    <Fade pts={[[0, 0], [t + 0.2, 0], [t + 0.5, 1], [ND, 1]]}>
                        <path d={d} pathLength={100} fill="none" stroke="var(--sc-snow)" strokeWidth={1.7} strokeDasharray="7.5 5" opacity={0.95}>{flow(12.5, turn / 8)}</path>
                        <path d={d} pathLength={100} fill="none" stroke={LIT} strokeWidth={3.4} strokeDasharray="2 10.5" opacity={0.7}>{flow(12.5, turn / 8)}</path>
                        <Orbit id={`${id}d`} layer={layer} cx={cx} cy={cy} rx={rx} ry={ry} n={6} dur={turn} dir={-1}
                               item={() => <path d="M0 -2.6 C2 -0.6 2.2 1.4 0 2.2 C-2.2 1.4 -2 -0.6 0 -2.6 Z" fill={WATER} stroke="currentColor" strokeWidth={0.7} strokeLinejoin="round" />} />
                    </Fade>
                </RingSide>
            </g>
        </Fade>
    )
}

/** fire: a wide, flat, thick band of flame round his waist, wider than the sphere, with a ragged edge and tongues riding it as it spins */
function FireRing({ id, cx, cy, layer }: { id: string; cx: number; cy: number; layer: 'back' | 'front' }) {
    const { rx, ry, rot } = FIRE_R
    const d = ringFromLeft(cx, cy, rx, ry)
    const d2 = ringFromLeft(cx, cy, rx + 1.6, ry + 1.4)
    const turn = 2.8, t = FIRE_S.headEnd
    return (
        <Fade pts={ringFade(t)}>
            <g transform={`rotate(${rot} ${cx} ${cy})`}>
                <RingSide id={id} layer={layer} cx={cx} cy={cy} rx={rx} ry={ry}>
                    {FIRE_STROKES.map(([c, w], i) => <path key={i} d={d} fill="none" stroke={c} strokeWidth={w} strokeLinejoin="round" />)}
                    <Fade pts={[[0, 0], [t + 0.2, 0], [t + 0.5, 1], [ND, 1]]}>
                        <path d={d2} pathLength={100} fill="none" stroke={FLAME} strokeWidth={3.8} strokeDasharray="4 3 9 4">{flow(20, turn / 5)}</path>
                        <path d={d} pathLength={100} fill="none" stroke="var(--sc-snow)" strokeWidth={1.2} strokeDasharray="6 2.5 3 1" opacity={0.7}>{flow(12.5, turn / 8)}</path>
                        <Orbit id={`${id}t`} layer={layer} cx={cx} cy={cy} rx={rx} ry={ry} n={10} dur={turn} dir={-1}
                               item={() => <g transform="translate(1 3) rotate(90) scale(0.42)"><Flame /></g>} />
                    </Fade>
                </RingSide>
            </g>
        </Fade>
    )
}

/** stone: not a tidy ring but a loose scatter — big chunks and grit tumbling round him on crossing, tilted orbits (as in the show), all turning the same way as the rings.
 *  Every period divides the 30 s loop, so where each stone is at any moment is the same every loop (the flying chunks land exactly on them). */
function StoneRing({ id, cx, cy, layer }: { id: string; cx: number; cy: number; layer: 'back' | 'front' }) {
    const big = (i: number) => <g transform="scale(1.35)">{rock(i)}</g>
    return (
        <Fade pts={ringFade(T_STONE)}>
            <g transform={`rotate(-28 ${cx} ${cy})`}>
                <Orbit id={`${id}r1`} layer={layer} cx={cx} cy={cy} rx={40} ry={27} n={6} dur={6} dir={-1} item={big} />
                <Orbit id={`${id}r3`} layer={layer} cx={cx} cy={cy} rx={44} ry={31} n={12} dur={7.5} dir={-1} item={i => <circle r={i % 2 ? 0.7 : 1.1} fill="currentColor" opacity={0.7} />} />
            </g>
            <g transform={`rotate(32 ${cx} ${cy})`}>
                <Orbit id={`${id}r2`} layer={layer} cx={cx} cy={cy} rx={36} ry={22} n={5} dur={5.0} dir={-1} item={i => big(i + 2)} />
                <Orbit id={`${id}r4`} layer={layer} cx={cx} cy={cy} rx={42} ry={26} n={10} dur={6} dir={-1} item={i => <circle r={i % 2 ? 0.8 : 1.2} fill="currentColor" opacity={0.7} />} />
            </g>
        </Fade>
    )
}

/** the sphere of air: it grows round him from a point, a clear bubble with a bright double rim, a streak of light and two wisps of wind that keep turning; fill behind him, rim in front */
function AirSphere({ cx, cy, front }: { cx: number; cy: number; front?: boolean }) {
    const r = 42
    const arc = (R: number, a: number, span: number) => {
        const p = (t: number) => `${r2(R * Math.cos(t))} ${r2(R * Math.sin(t))}`
        return `M${p(a)} A${R} ${R} 0 0 1 ${p(a + span)}`
    }
    return (
        <Fade pts={winN(22.0, 26.4)}>
            <g transform={`translate(${cx} ${cy})`}>
                <Tr type="scale" pts={[[0, 0.3, 0.3], [22.0, 0.3, 0.3], [23.2, 1, 1], [ND, 1, 1]]} smooth>
                    {front ? (
                        <>
                            <circle r={r} fill="none" stroke="var(--sc-snow)" strokeWidth={1.8} opacity={0.95} />
                            <circle r={r - 3} fill="none" stroke={LIT} strokeWidth={1} opacity={0.7} />
                            <path d={`M-30 -22 A${r} ${r} 0 0 1 -6 -41`} fill="none" stroke="var(--sc-snow)" strokeWidth={2.2} strokeLinecap="round" />
                            <path d={`M22 33 A${r} ${r} 0 0 0 38 14`} fill="none" stroke={LIT} strokeWidth={1.4} strokeLinecap="round" opacity={0.85} />
                            <g fill="none" strokeLinecap="round">
                                <Live><animateTransform attributeName="transform" type="rotate" values="0;360" dur="3.4s" repeatCount="indefinite" /></Live>
                                {[0, 2.1, 4.2].map(a => <path key={a} d={arc(35, a, 0.9)} stroke="var(--sc-snow)" strokeWidth={1.5} opacity={0.8} />)}
                                {[1.05, 3.15, 5.25].map(a => <path key={a} d={arc(28, a, 0.7)} stroke={LIT} strokeWidth={1.1} opacity={0.6} />)}
                            </g>
                        </>
                    ) : (
                        <>
                            <circle r={r} fill={LIT} stroke="none" opacity={0.2} />
                            <circle r={r - 9} fill={LIT} stroke="none" opacity={0.12} />
                        </>
                    )}
                </Tr>
            </g>
        </Fade>
    )
}

/** Toph's boulder splits at 21.55 s: its stones arc over and land exactly on the first five stones of the first orbit (same place, same size, same tilt) as it fades in */
const CHUNKS: { s: [number, number]; to: [number, number]; sc: number }[] = [[-9, -6], [8, -9], [-3, -16], [6, -19], [-6, -22]].map(([sx, sy], i) => ({
    s: [sx, sy] as [number, number], to: stoneAt(i, T_STONE), sc: r2(1.35 * [1, 0.8, 1.15, 0.9][i % 4]),
}))
const LIFT_H = 46                               // how high she hoists it (in the strip's pixels)

/** Toph's lift, start to finish (at (bx, by) on the ground, `k` times the drawing's size): a crack opens, the boulder pushes up out of the ground (a beetle was under it), she
 *  hoists it overhead and it shakes with the strain, then it splits — and its stones fly off to Aang. What it leaves behind (the beetle, three bits of rubble) floats too in
 *  the Avatar State, each on its own; the hollow and the crack in the ground stay. */
function BoulderLift({ clipId, glow, bx, by, k }: { clipId: string; glow: string; bx: number; by: number; k: number }) {
    const lift = LIFT_H / k
    const clods: [number, number][] = [[-9, 0], [3, 0.25], [11, 0.5]]
    const rubble: [number, number, number, number, number][] = [[-24, 0, 1.1, 11, 0.1], [27, -1, 0.9, 16, 0.3], [33, 0, 0.7, 13, 0.5]]     // dx, dy, size, float height, delay
    const up: Pts = [[0, 0, 24], [17.35, 0, 24], [18.3, 0, 0], [19.6, 0, -lift], [21.0, 0, -lift], [21.55, 0, -lift - 4 / k]]
    return (
        <>
            {/* the hollow it leaves, and what was under it */}
            <Fade pts={[[0, 0], [17.35, 0], [17.7, 0.6], [28.2, 0.6], [28.8, 0], [ND, 0]]}>
                <ellipse cx={bx} cy={by + 1} rx={17 * k / 1.25} ry={2.8} fill="var(--sc-line)" stroke="none" />
            </Fade>
            <Fade pts={[[0, 0], [18.4, 0], [18.8, 1], [28.2, 1], [28.8, 0], [ND, 0]]}>
                <Float glow={glow} h={14} d={0.15}><g transform={`translate(${bx + 3 * k} ${by + 1}) scale(${r2(k / 1.25)})`}><Beetle /></g></Float>
            </Fade>
            {/* the boulder, clipped at the ground while it comes up through it */}
            <g clipPath={`url(#${clipId})`}>
                <clipPath id={clipId}><rect x={bx - 80} y={0} width={160} height={by + 1} /></clipPath>
                <Fade pts={[[0, 0], [17.3, 0], [17.36, 1], [21.5, 1], [21.6, 0], [ND, 0]]}>
                    <g transform={`translate(${bx} ${by}) scale(${k})`}>
                        <Tr type="translate" pts={up} smooth>
                            <Tr type="rotate" pts={[[0, 0, 0, -11], [19.6, 0, 0, -11], [20.0, -3, 0, -11], [20.5, 3, 0, -11], [21.0, -2.5, 0, -11], [21.4, 2, 0, -11], [21.55, 0, 0, -11]]}>
                                <BoulderArt cracked={
                                                 <Fade pts={[[0, 0], [20.9, 0], [21.3, 1], [ND, 1]]}>
                                                    <path d="M0 -23 L-2.6 -15 L2 -10 L-1.6 -4 L0.4 0 M-2.6 -15 L-9 -12 M2 -10 L9 -8" {...L} strokeWidth={1.5} />
                                                </Fade>
                                            } />
                            </Tr>
                        </Tr>
                    </g>
                </Fade>
            </g>
            {/* dust where it comes up */}
            <Fade pts={[[0, 0], [17.35, 0], [17.7, 0.9], [18.7, 0], [ND, 0]]}>
                <g transform={`translate(${bx} ${by - 6}) scale(${r2(k / 1.25)})`}>
                    <Tr type="scale" pts={[[0, 0.5, 0.5], [17.35, 0.5, 0.5], [18.7, 1.7, 1.4]]}>
                        <circle cx={-14} cy={0} r={5.6} fill="var(--sc-cloud)" stroke="currentColor" strokeWidth={1} />
                        <circle cx={14} cy={-1} r={6.4} fill="var(--sc-cloud)" stroke="currentColor" strokeWidth={1} />
                        <circle cx={0} cy={3} r={5.6} fill="var(--sc-cloud)" stroke="currentColor" strokeWidth={1} />
                    </Tr>
                </g>
            </Fade>
            {/* clods of soil shaken off the underside as it rises */}
            {clods.map(([dx, d], i) => (
                <Fade key={i} pts={[[0, 0], [18.5 + d, 0], [18.55 + d, 1], [19.15 + d, 1], [19.4 + d, 0], [ND, 0]]}>
                    <Tr type="translate" pts={[[0, bx + dx * k, by - 14], [18.5 + d, bx + dx * k, by - 14], [19.15 + d, bx + dx * 1.5 * k, by - 2]]}>
                        <path d={ROCKS[i]} transform="scale(0.7)" {...F} fill={SOIL} strokeWidth={0.9} />
                    </Tr>
                </Fade>
            ))}
            {/* the split: a burst of dust, then the stones, each spinning */}
            <Fade pts={[[0, 0], [21.5, 0], [21.65, 0.9], [22.5, 0], [ND, 0]]}>
                <g transform={`translate(${bx} ${by - LIFT_H - 14})`}>
                    <Tr type="scale" pts={[[0, 0.5, 0.5], [21.5, 0.5, 0.5], [22.5, 1.6, 1.6]]}>
                        <circle cx={-6} cy={0} r={6} fill="var(--sc-cloud)" stroke="currentColor" strokeWidth={1} />
                        <circle cx={6} cy={-3} r={7} fill="var(--sc-cloud)" stroke="currentColor" strokeWidth={1} />
                        <circle cx={0} cy={5} r={6} fill="var(--sc-cloud)" stroke="currentColor" strokeWidth={1} />
                    </Tr>
                </g>
            </Fade>
            {CHUNKS.map(({ s: [sx, sy], to: [tx, ty], sc }, i) => {
                const x0 = bx + sx * k, y0 = by - LIFT_H - 4 + sy * k
                return (
                    <Fade key={i} pts={[[0, 0], [21.5, 0], [21.55, 1], [T_STONE, 1], [T_STONE + 0.1, 0], [ND, 0]]}>
                        <Tr type="translate" pts={[[0, x0, y0], [21.55, x0, y0], [22.2, (x0 + tx) / 2, Math.min(y0, ty) - 22 - i * 3], [T_STONE, tx, ty]]} smooth>
                            <Tr type="rotate" pts={[[0, 0], [21.55, 0], [T_STONE, -28 + 360 * (1 + (i % 2))]]}>
                                <Tr type="scale" pts={[[0, r2((1.7 - i * 0.12) * k / 1.25), r2((1.7 - i * 0.12) * k / 1.25)], [21.55, r2((1.7 - i * 0.12) * k / 1.25), r2((1.7 - i * 0.12) * k / 1.25)], [T_STONE, sc, sc]]}>
                                    <path d={ROCKS[i % 3]} {...F} fill={STONE} strokeWidth={1} />
                                </Tr>
                            </Tr>
                        </Tr>
                    </Fade>
                )
            })}
            {/* what stays behind: a crack in the ground (it stays), and the rubble (it floats) */}
            <Fade pts={[[0, 0], [17.3, 0], [17.8, 1], [28.2, 1], [28.8, 0], [ND, 0]]}>
                <path d={`M${bx - 30 * k / 1.25} ${by + 2} l9 2.6 l8 -2.2 l9 2.8 l11 -1.8 l8 2 l9 -1.6 M${bx + 18 * k / 1.25} ${by + 3.4} l4 3 l-3 2.6`} {...L} strokeWidth={1.2} />
            </Fade>
            {rubble.map(([dx, dy, sz, h, d], i) => (
                <Fade key={i} pts={[[0, 0], [17.3, 0], [17.8, 1], [28.2, 1], [28.8, 0], [ND, 0]]}>
                    <Float glow={glow} h={h} d={d}>
                        <path d={ROCKS[i]} transform={`translate(${r2(bx + dx * k / 1.25)} ${by - 1 + dy}) scale(${r2(sz * k / 1.25)})`} {...F} fill={STONE} strokeWidth={1} />
                    </Float>
                </Fade>
            ))}
        </>
    )
}

/** wind-borne grit: little stones and pebbles lifted off the ground round Aang's rock as the Avatar State takes him */
function Debris() {
    const dots: [number, number, number][] = [[-26, 14, 56], [-14, -8, 70], [-5, 10, 48], [8, -12, 64], [17, 9, 76], [27, -10, 58], [34, 12, 50]]
    return (
        <>
            {dots.map(([dx, drift, h], i) => {
                const s = 21.8 + i * 0.22
                return (
                    <Fade key={i} pts={[[0, 0], [s, 0], [s + 0.3, 1], [s + 1.9, 1], [s + 2.6, 0], [ND, 0]]}>
                        <Tr type="translate" pts={[[0, X.aang + dx, G - 4], [s, X.aang + dx, G - 4], [s + 2.6, X.aang + dx + drift, G - 4 - h]]}>
                            <path d={ROCKS[i % 3]} transform={`scale(${0.5 + (i % 3) * 0.12})`} {...F} fill={STONE} strokeWidth={1.1} />
                        </Tr>
                    </Fade>
                )
            })}
        </>
    )
}

/* ───── Katara and Zuko practise, each in the style of their art ─────
   WATER is tai chi (the show's waterbending forms): slow, continuous and circular, the whole body moving with the arms; the bender draws the water out of a source
   (Katara's waterskin, which she always carries), takes it round, steps BACK as she pulls it and rolls FORWARD as she thrusts, like a wave, with a snap at the end of
   the whip; and the water is not lost: it goes home. Water can't be made, so it never exceeds what she carries.
   FIRE is Northern Shaolin: a rooted stance, a coiled chamber, then a short, sharp strike with the whole body behind it. Fire is made BY the strike (no source, no tether):
   it leaves the fist as a fireball or a jet and burns out within a few strides; a rising sweep throws a crescent of flame. Breath and stance first, then speed.
   Three kinds of exchange, so it never looks like one move on repeat; each ends where water meets fire, in a flash, a burst of steam and a spray of droplets:
     ball   a fireball from a straight punch  ·  a water whip that snaps out to meet it
     wave   a held jet of flame from a punch  ·  a wave of water, pulled back and pushed forward, that rolls over it
     arc    a crescent of flame from a rising sweep  ·  a shield of water swung up in front of Katara to stop it                                                          */
type Kind = 'ball' | 'wave' | 'arc'
/** when each exchange starts (the strike / the thrust), 1.8 s apart: room for the wind-up, the strike, the clash, the recovery and the water going home */
const EXCH: { v: number; kind: Kind }[] = [
    { v: 9.4, kind: 'ball' }, { v: 11.2, kind: 'wave' }, { v: 13.0, kind: 'arc' }, { v: 14.8, kind: 'ball' }, { v: 16.6, kind: 'wave' }, { v: 18.4, kind: 'arc' }, { v: 20.2, kind: 'ball' },
]
/** arm angles by move, [seconds from v, degrees]; keyframe times only ever increase, and each move's first and last keys sit inside its 1.8 s slot */
const KAT_ARM: Record<Kind, [number, number][]> = {
    ball: [[-0.8, -8], [-0.45, -24], [-0.18, -20], [-0.04, -14], [0, 0], [0.12, 3], [0.45, -3], [0.85, -10]],
    wave: [[-0.8, -8], [-0.5, -34], [-0.12, -34], [0, -12], [0.2, 4], [0.5, 0], [0.85, -8]],
    arc: [[-0.8, -8], [-0.4, -46], [-0.1, -40], [0.1, -10], [0.3, 0], [0.55, -4], [0.85, -10]],
}
const ZUK_ARM: Record<Kind, [number, number][]> = {
    ball: [[-0.45, -84], [-0.1, -88], [0, 8], [0.1, 0], [0.35, -4], [0.6, -30], [0.85, -65]],
    wave: [[-0.45, -84], [-0.1, -72], [0, 6], [0.65, 2], [0.8, -30], [0.85, -65]],
    arc: [[-0.45, -84], [-0.1, -94], [0, -40], [0.12, 20], [0.3, 14], [0.6, -30], [0.85, -65]],
}
type Moves = { mv: [number, number, number][]; lean: [number, number][] }
/** Katara's weight: back as she pulls (the lean is about her feet; negative = away from Zuko), forward into the thrust, then settling */
const KAT_BODY: Record<Kind, Moves> = {
    ball: { mv: [[-0.8, 0, 0], [-0.3, -1.5, 0], [0, 1.2, 0], [0.5, 0.6, 0], [0.85, 0, 0]], lean: [[-0.8, 0], [-0.3, -3], [0, 3.5], [0.5, 1], [0.85, 0]] },
    wave: { mv: [[-0.8, 0, 0], [-0.35, -3, 0], [0, 2.4, 0], [0.6, 1, 0], [0.85, 0, 0]], lean: [[-0.8, 0], [-0.35, -5], [0, 5], [0.6, 1.5], [0.85, 0]] },
    arc: { mv: [[-0.8, 0, 0], [-0.3, -1, 0], [0.1, 1, 0], [0.85, 0, 0]], lean: [[-0.8, 0], [-0.3, -2], [0.1, 2.5], [0.85, 0]] },
}
/** Zuko's: sinks and coils away from the target, then drives forward into the strike (negative lean = toward Katara) */
const ZUK_BODY: Record<Kind, Moves> = {
    ball: { mv: [[-0.45, 0, 0], [-0.1, 1.2, 1.2], [0, -2.8, 0.4], [0.25, -2, 0], [0.7, 0, 0], [0.85, 0, 0]], lean: [[-0.45, 0], [-0.1, 3], [0, -5], [0.3, -3], [0.7, 0], [0.85, 0]] },
    wave: { mv: [[-0.45, 0, 0], [-0.1, 1.5, 1.2], [0, -2.6, 0.4], [0.65, -2.6, 0.4], [0.85, 0, 0]], lean: [[-0.45, 0], [-0.1, 3], [0, -4], [0.65, -4], [0.85, 0]] },
    arc: { mv: [[-0.45, 0, 0], [-0.1, 1, 2], [0.05, -2, 0.6], [0.4, -1, 0], [0.85, 0, 0]], lean: [[-0.45, 0], [-0.1, 4], [0.1, -6], [0.45, -2], [0.85, 0]] },
}

/** visible from a to b (a snap in at a, out just after b) */
const span = (a: number, b: number): Pts => [[0, 0], [a - 0.02, 0], [a, 1], [b, 1], [b + 0.04, 0], [ND, 0]]
/** a stroke drawn out along its path and drawn back along it, as one dash [tail, head] in % of the path (pathLength 100): keys are [seconds, tail, head] */
function Draw({ d, keys, strokes, fade }: { d: string; keys: Pts; strokes: [string, number, number?][]; fade: Pts }) {
    const fz = useContext(Frozen)
    const clock = useClock()
    if (fz !== null) return null
    const a = norm(keys, ND)
    return (
        <Fade pts={fade}>
            {strokes.map(([c, w, o], i) => (
                <path key={i} d={d} fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" pathLength={100} strokeDasharray="0 400" strokeDashoffset={0} opacity={o ?? 1}>
                    <animate attributeName="stroke-dasharray" {...clock} keyTimes={kt(a, ND)} values={a.map(k => `${r2(k[2] - k[1])} 400`).join(';')} />
                    <animate attributeName="stroke-dashoffset" {...clock} keyTimes={kt(a, ND)} values={a.map(k => r2(-k[1])).join(';')} />
                </path>
            ))}
        </Fade>
    )
}
const WHIP_STR: [string, number, number?][] = [['currentColor', 6.4, 0.5], [WATER, 5], ['var(--sc-glass)', 1.4, 0.85]]
const WAVE_STR: [string, number, number?][] = [['currentColor', 9, 0.5], [WATER, 7.2], ['var(--sc-glass)', 1.8, 0.85]]
const SKIN_STR: [string, number, number?][] = [['currentColor', 3.4, 0.5], [WATER, 2.4], ['var(--sc-glass)', 0.8, 0.85]]
/** the wave: a longer, wider, more rolling stroke than the whip */
const WAVE_D = `M${KAT_AIM[0]} ${KAT_AIM[1]} C${r2(KAT_AIM[0] + 6)} ${r2(KAT_AIM[1] - 13)} ${r2(KAT_AIM[0] + 16)} ${r2(KAT_AIM[1] + 11)} ${CLASH[0]} ${CLASH[1]}`
/** the shield: a ring of water standing in front of her, a little this side of the clash */
const SHIELD: [number, number] = [r2(CLASH[0] - 3), r2(CLASH[1] - 1)]
const SHIELD_D = `M${SHIELD[0]} ${SHIELD[1] - 12} A5 12 0 1 1 ${SHIELD[0]} ${SHIELD[1] + 12} A5 12 0 1 1 ${SHIELD[0]} ${SHIELD[1] - 12}`
/** from the mouth of her waterskin up to her raised hand (in her own frame), and back */
const SKIN_FWD = 'M16.5 -29.8 C20.4 -34 16.4 -40.8 21.2 -44.9 C23 -46.6 24.4 -49 24.7 -50.7'
const SKIN_BACK = 'M24.7 -50.7 C24.4 -49 23 -46.6 21.2 -44.9 C16.4 -40.8 20.4 -34 16.5 -29.8'
/** the water rises out of the skin to her hand as she draws it, and runs home into the skin once it has been used */
function WaterSupply({ v, kind }: { v: number; kind: Kind }) {
    const home = kind === 'wave' ? v + 0.7 : v + 0.58
    return (
        <>
            <Draw d={SKIN_FWD} strokes={SKIN_STR} fade={span(v - 0.8, v + 0.12)} keys={[[0, 0, 0], [v - 0.8, 0, 0], [v - 0.48, 0, 100], [v - 0.04, 0, 100], [v + 0.1, 100, 100], [ND, 100, 100]]} />
            <Draw d={SKIN_BACK} strokes={SKIN_STR} fade={span(home, home + 0.34)} keys={[[0, 0, 0], [home, 0, 0], [home + 0.16, 0, 100], [home + 0.32, 100, 100], [ND, 100, 100]]} />
        </>
    )
}

const FIRE_DX = r2(CLASH[0] - ZUK_AIM[0]), FIRE_DY = r2(CLASH[1] - ZUK_AIM[1])
/** a fireball: it leaves the fist at the punch, flies to the clash in a few strides and flares as it meets the water */
function FireBall({ v, tI }: { v: number; tI: number }) {
    return (
        <>
            <Fade pts={[[0, 0], [v - 0.01, 0], [v, 1], [tI + 0.06, 1], [tI + 0.14, 0], [ND, 0]]}>
                <g transform={`translate(${ZUK_AIM[0]} ${ZUK_AIM[1]})`}>
                    <Tr type="translate" pts={[[0, 0, 0], [v, 0, 0], [tI, FIRE_DX, FIRE_DY], [ND, FIRE_DX, FIRE_DY]]}>
                        <Tr type="scale" pts={[[0, 0.4, 0.4], [v, 0.4, 0.4], [v + 0.08, 0.75, 0.75], [tI, 0.95, 0.95], [tI + 0.1, 1.4, 1.4], [ND, 1.4, 1.4]]}><Flame /></Tr>
                    </Tr>
                </g>
            </Fade>
            {[0, 1, 2].map(j => (
                <Fade key={j} pts={[[0, 0], [v + 0.03 * (j + 1), 0], [v + 0.03 * (j + 1) + 0.02, 0.9], [tI, 0.9], [tI + 0.06, 0], [ND, 0]]}>
                    <g transform={`translate(${ZUK_AIM[0]} ${ZUK_AIM[1]})`}>
                        <Tr type="translate" pts={[[0, 0, 0], [v + 0.03 * (j + 1), 0, 0], [tI, r2(FIRE_DX * 0.55), r2(FIRE_DY * 0.55 + (j - 1) * 3)]]}><circle r={1.1} fill={FLAME} stroke="none" /></Tr>
                    </g>
                </Fade>
            ))}
        </>
    )
}
/** a held jet: the flame stays at the fist while the strike is held and reaches out to the clash, and is pushed back when the wave rolls over it */
function FireJet({ v, tI }: { v: number; tI: number }) {
    return (
        <Fade pts={[[0, 0], [v - 0.01, 0], [v, 1], [tI + 0.2, 1], [tI + 0.3, 0], [ND, 0]]}>
            <g transform={`translate(${ZUK_AIM[0]} ${ZUK_AIM[1]})`}>
                <Tr type="scale" pts={[[0, 0.3, 0.3], [v, 0.3, 0.3], [v + 0.14, FLAME_K, FLAME_K], [tI, FLAME_K, FLAME_K], [tI + 0.2, 0.4, 0.4], [ND, 0.4, 0.4]]}><Flame /></Tr>
            </g>
        </Fade>
    )
}
/** a crescent of flame, thrown by a rising sweep: it flies out in a shallow arc */
function FireCrescent({ v, tI }: { v: number; tI: number }) {
    return (
        <Fade pts={[[0, 0], [v + 0.01, 0], [v + 0.04, 1], [tI + 0.02, 1], [tI + 0.1, 0], [ND, 0]]}>
            <g transform={`translate(${ZUK_AIM[0]} ${ZUK_AIM[1]})`}>
                <Tr type="translate" pts={[[0, 0, 0], [v + 0.03, 0, 0], [v + 0.19, r2(FIRE_DX * 0.55), r2(FIRE_DY - 7)], [tI, FIRE_DX, FIRE_DY], [ND, FIRE_DX, FIRE_DY]]} smooth>
                    <Tr type="scale" pts={[[0, 0.6, 0.6], [v + 0.03, 0.6, 0.6], [tI, 1.15, 1.15], [ND, 1.15, 1.15]]}>
                        <circle cx={-3} r={10} {...GLOW} opacity={0.3} />
                        <path d="M0 -10 C-9 -6 -9 6 0 10 C-4 5 -4 -5 0 -10 Z" fill={FLAME} stroke="currentColor" strokeWidth={1} strokeLinejoin="round" />
                        <path d="M0 -6 C-5 -3 -5 3 0 6 C-2 3 -2 -3 0 -6 Z" {...GLOW} />
                    </Tr>
                </Tr>
            </g>
        </Fade>
    )
}
/** the flash where fire meets water */
function Flare({ t }: { t: number }) {
    return (
        <Fade pts={[[0, 0], [t - 0.03, 0], [t, 0.9], [t + 0.22, 0], [ND, 0]]}>
            <g transform={`translate(${CLASH[0]} ${CLASH[1]})`}>
                <Tr type="scale" pts={[[0, 0.5, 0.5], [t, 0.5, 0.5], [t + 0.22, 1.6, 1.6]]}><circle r={8} {...GLOW} /></Tr>
            </g>
        </Fade>
    )
}
/** droplets thrown up and out where the water is hit, each on its own little arc */
const DROPS: [number, number, number][] = [[-9, 9, 0], [-4, 14, 0.03], [2, 16, 0.06], [7, 12, 0.02], [11, 7, 0.05], [-13, 4, 0.08]]
function Spray({ t }: { t: number }) {
    return (
        <>
            {DROPS.map(([dx, h, dl], i) => (
                <Fade key={i} pts={[[0, 0], [t + dl, 0], [t + dl + 0.02, 1], [t + dl + 0.42, 1], [t + dl + 0.5, 0], [ND, 0]]}>
                    <g transform={`translate(${CLASH[0]} ${CLASH[1]})`}>
                        <Tr type="translate" pts={[[0, 0, 0], [t + dl, 0, 0], [t + dl + 0.2, r2(dx * 0.7), -h], [t + dl + 0.46, r2(dx * 1.1), 4 + ((i * 5) % 11)]]} smooth>
                            <path d="M0 -2.4 C1.8 -0.6 2 1.2 0 1.9 C-2 1.2 -1.8 -0.6 0 -2.4 Z" fill={WATER} stroke="currentColor" strokeWidth={0.7} strokeLinejoin="round" />
                        </Tr>
                    </g>
                </Fade>
            ))}
        </>
    )
}
/** one exchange: her water and his fire meet at the clash at tI */
function Exchange({ v, kind }: { v: number; kind: Kind }) {
    const tI = r2(v + (kind === 'ball' ? 0.3 : kind === 'wave' ? 0.42 : 0.34))
    return (
        <>
            {kind === 'ball' && <Draw d={WHIP_D} strokes={WHIP_STR} fade={span(v + 0.02, tI + 0.5)} keys={[[0, 0, 0], [v + 0.02, 0, 0], [tI, 0, 100], [tI + 0.25, 0, 100], [tI + 0.5, 0, 0], [ND, 0, 0]]} />}
            {kind === 'wave' && <Draw d={WAVE_D} strokes={WAVE_STR} fade={span(v, tI + 0.46)} keys={[[0, 0, 0], [v, 0, 0], [tI, 0, 100], [tI + 0.2, 0, 100], [tI + 0.45, 0, 0], [ND, 0, 0]]} />}
            {kind === 'arc' && (
                <>
                    <Draw d={SHIELD_D} strokes={WHIP_STR} fade={span(v + 0.05, tI + 0.34)} keys={[[0, 0, 0], [v + 0.05, 0, 0], [v + 0.26, 0, 100], [tI + 0.1, 0, 100], [tI + 0.32, 100, 100], [ND, 100, 100]]} />
                    <Fade pts={[[0, 0], [v + 0.2, 0], [v + 0.3, 0.32], [tI + 0.1, 0.32], [tI + 0.3, 0], [ND, 0]]}><ellipse cx={SHIELD[0]} cy={SHIELD[1]} rx={5} ry={12} fill={WATER} stroke="none" /></Fade>
                </>
            )}
            {kind === 'ball' && <FireBall v={v} tI={tI} />}
            {kind === 'wave' && <FireJet v={v} tI={tI} />}
            {kind === 'arc' && <FireCrescent v={v} tI={tI} />}
            {/* the strike's own flash at his fist */}
            <Fade pts={[[0, 0], [v - 0.02, 0], [v, 0.9], [v + 0.14, 0], [ND, 0]]}><circle cx={ZUK_AIM[0]} cy={ZUK_AIM[1]} r={5} {...GLOW} /></Fade>
            <Flare t={tI} />
            <SteamPuff t={tI} k={kind === 'wave' ? 1.35 : 1} />
            {kind !== 'ball' && <SteamPuff t={r2(tI + 0.18)} k={0.85} dx={kind === 'wave' ? 6 : -5} />}
            <Spray t={tI} />
        </>
    )
}
/** a burst of steam where flame meets water, at time t (k = how much of it) */
function SteamPuff({ t, k = 1, dx = 0 }: { t: number; k?: number; dx?: number }) {
    return (
        <Fade pts={[[0, 0], [t, 0], [t + 0.2, 0.95], [t + 0.8, 0.7], [t + 1.4, 0], [ND, 0]]}>
            <g transform={`translate(${r2(CLASH[0] + dx)} ${CLASH[1] + 2})`}>
                <Tr type="translate" pts={[[0, 0, 0], [t, 0, 4], [t + 1.4, 0, -14 * k]]}>
                    <Tr type="scale" pts={[[0, 0.5 * k, 0.5 * k], [t, 0.5 * k, 0.5 * k], [t + 1.4, 1.3 * k, 1.3 * k]]}>
                        <circle cx={-6} cy={0} r={6.4} fill="var(--sc-cloud)" stroke="currentColor" strokeWidth={1} />
                        <circle cx={5} cy={-2} r={7.4} fill="var(--sc-cloud)" stroke="currentColor" strokeWidth={1} />
                        <circle cx={0} cy={-8} r={6} fill="var(--sc-cloud)" stroke="currentColor" strokeWidth={1} />
                        <circle cx={-1} cy={-1} r={6.6} fill="var(--sc-cloud)" stroke="none" />
                    </Tr>
                </Tr>
            </g>
        </Fade>
    )
}

/* ───── the Avatar State lifts everything ───── */
/** While the state lasts (22 → 26.4 s) every character and every prop rises off the ground, bobbing a little and at their own pace, with a small glowing outline.
 *  The glow is one filter (a dilated, blurred copy of the shape's silhouette in a warm white, merged under the shape) whose opacity is keyed to the loop;
 *  it is only switched on for the groups while the state lasts, so the rest of the loop pays nothing for it. */
const FLOAT_ON = 21.9, FLOAT_OFF = 26.5
const GLOW_PTS: Pts = [[0, 0], [21.9, 0], [22.8, 0.95], [25.4, 0.95], [26.4, 0], [ND, 0]]
function GlowFilter({ id }: { id: string }) {
    const fz = useContext(Frozen)
    const a = norm(GLOW_PTS, ND)
    return (
        <defs>
            <filter id={id} x="-25%" y="-15%" width="150%" height="130%" colorInterpolationFilters="sRGB">
                <feMorphology in="SourceAlpha" operator="dilate" radius={0.7} result="fat" />
                <feGaussianBlur in="fat" stdDeviation={1.5} result="soft" />
                <feFlood style={{ floodColor: 'color-mix(in srgb, var(--scene-glow) 45%, #ffffff)' }} floodOpacity={fz !== null ? sample(GLOW_PTS, fz, ND)[0] : 0} result="tint">
                    {fz === null && <animate attributeName="flood-opacity" dur={`${ND}s`} repeatCount="indefinite" keyTimes={kt(a, ND)} values={a.map(q => q[1]).join(';')} />}
                </feFlood>
                <feComposite in="tint" in2="soft" operator="in" result="halo" />
                <feMerge><feMergeNode in="halo" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
        </defs>
    )
}
const floatPts = (h: number, d: number): Pts => [[0, 0, 0], [FLOAT_ON + d, 0, 0], [22.9 + d, 0, -h], [23.7 + d, 0, -h * 0.72], [24.6 + d, 0, -h], [25.4 + d, 0, -h * 0.78], [26.4, 0, 0]]
function Float({ glow, h, d = 0, children }: { glow: string; h: number; d?: number; children: ReactNode }) {
    const fz = useContext(Frozen)
    const on = `url(#${glow})`
    return (
        <g filter={fz !== null ? on : undefined}>
            {fz === null && (
                <animate attributeName="filter" dur={`${ND}s`} repeatCount="indefinite" calcMode="discrete" keyTimes={`0;${r2(FLOAT_ON / ND)};${r2(FLOAT_OFF / ND)}`} values={`none;${on};none`} />
            )}
            <Tr type="translate" pts={floatPts(h, d)} smooth>{children}</Tr>
        </g>
    )
}

/** a soft ground shadow: the depth cue under every figure and prop; it shrinks and fades while the Avatar State lifts them off the ground */
function Shadow({ x, y, w, d = 0, still }: { x: number; y: number; w: number; d?: number; still?: boolean }) {
    if (still) return <ellipse cx={x} cy={r2(y + 0.5)} rx={r2(w)} ry={r2(w * 0.2)} fill="var(--sc-line)" stroke="none" opacity={0.16} />
    const up: Pts = [[0, 1, 1], [FLOAT_ON + d, 1, 1], [22.9 + d, 0.72, 0.72], [25.4 + d, 0.72, 0.72], [26.4, 1, 1]]
    return (
        <Fade pts={up.map(([t, v]) => [t, v === 1 ? 1 : 0.5])}>
            <g transform={`translate(${x} ${r2(y + 0.5)})`}>
                <Tr type="scale" pts={up} smooth>
                    <ellipse rx={r2(w)} ry={r2(w * 0.2)} fill="var(--sc-line)" stroke="none" opacity={0.16} />
                </Tr>
            </g>
        </Fade>
    )
}

export function HackathonNature({ reduce }: { reduce: boolean }) {
    const aangY = AANG_Y
    const ringId = useId().replace(/[^a-zA-Z0-9]/g, '')
    const cyA = CY_A                            // the centre of the Avatar State, before he lifts
    const glow = ringId + 'glow'
    const { sokka, board, momo, katara, zuko, iroh, toph, boulder, appa } = CAST
    const kat = (t: number, deg: number): number[] => [t, deg, 7.8, -48.6]
    const zuk = (t: number, deg: number): number[] => [t, deg, -8.6, -52.6]
    /** Katara: a smooth swirl (the arm rides a sine wave, two and a bit turns, sampled every 0.17 s and eased between samples), then, for each exchange, the arm of its move */
    const swirlArm = Array.from({ length: 21 }, (_, i) => kat(r2(4.8 + i * 0.17), r2(-8 + 26 * Math.sin((i * 0.17 * Math.PI * 2) / 1.7))))
    const katPts: number[][] = [kat(0, 0), kat(4.8, -8), ...swirlArm.slice(1), kat(8.3, -10), ...EXCH.flatMap(({ v, kind }) => KAT_ARM[kind].map(([t, d]) => kat(r2(v + t), d))), kat(21.2, -6), kat(21.7, -12), kat(22.2, -80), kat(22.5, -75), kat(25.4, -75), kat(26.2, 0)]
    /** Zuko: a chambered fist and a strike for each exchange (quick, sharp), resting guarded between, then the arm comes up for Aang */
    const zukPts: number[][] = [zuk(0, -65), zuk(8.2, -65), ...EXCH.flatMap(({ v, kind }) => ZUK_ARM[kind].map(([t, d]) => zuk(r2(v + t), d))), zuk(21.3, -65), zuk(21.7, -86), zuk(22.05, 86), zuk(22.35, 78), zuk(25.4, 78), zuk(26.2, -65)]
    /** the bodies: Katara's weight travels (back as she pulls, forward as she thrusts); Zuko coils, then drives forward into the strike */
    const bodyTrack = (who: 'kat' | 'zuk', f: (m: Moves) => [number, number, number][], g: (m: Moves) => [number, number][], cx: number, cy: number) => ({
        mv: [[0, 0, 0], ...EXCH.flatMap(({ v, kind }) => f((who === 'kat' ? KAT_BODY : ZUK_BODY)[kind]).map(([t, x, y]) => [r2(v + t), x, y])), [21.2, 0, 0]] as Pts,
        lean: [[0, 0, cx, cy], ...EXCH.flatMap(({ v, kind }) => g((who === 'kat' ? KAT_BODY : ZUK_BODY)[kind]).map(([t, d]) => [r2(v + t), d, cx, cy])), [21.2, 0, cx, cy]] as Pts,
    })
    const katBody = bodyTrack('kat', m => m.mv, m => m.lean, katara.x, katara.y)
    const zukBody = bodyTrack('zuk', m => m.mv, m => m.lean, zuko.x, zuko.y)
    /** Toph's arms: angles for her LEFT arm (positive = swinging up and out, clockwise); the right arm mirrors them. [seconds, degrees] */
    const upper = (sx: 1 | -1): Pts => TOPH_UPPER.map(([t, a]) => [t, -sx * a, sx * 7.6, -41])
    const fore = (sx: 1 | -1): Pts => TOPH_FORE.map(([t, a]) => [t, -sx * a, sx * 13.4, -33.6])
    const writing = (a: number, b: number) => [0, a, b, a, b, a, b, 0, 0].map(v => `${v} 15.4 -43.4`).join(';')
    return (
        <DurCtx.Provider value={ND}>
            <Frozen.Provider value={reduce ? FREEZE_NATURE : null}>
                <GlowFilter id={glow} />
                {/* sky: a warm band that deepens as the sun goes, a few clouds and birds */}
                <Fade pts={NATURE_SKY}>
                    <HorizonGlow cx={396} rx={340} />
                </Fade>
                {/* the sun's lane (x ≈ 499–541) stays clear: clouds sit well to either side of it and their slow drift never reaches it, and the birds fly off to the right */}
                <Cloud x={90} y={30} s={0.5} o={0.9} drift />
                <Cloud x={296} y={20} s={0.3} o={0.8} drift driftClass="scene-cloud--b" />
                <Cloud x={644} y={24} s={0.42} o={0.86} drift driftClass="scene-cloud--b" />
                <Cloud x={742} y={44} s={0.3} o={0.8} drift />
                <Bird x={676} y={12} s={0.5} className="scene-fly" />
                <Bird x={696} y={20} s={0.36} className="scene-fly" />
                <Fade pts={[[0, 0], [0.8, 1], [21.0, 1], [22.0, 0], [ND, 0]]}>
                    <Tr type="translate" pts={SUN_Y.map(([t, x, y]) => [t, SUN_X + x, y])}>
                        <Sun s={0.2} bg />
                    </Tr>
                </Fade>
                {/* the Avatar State turns the sky red-gold, as in the show */}
                <Fade pts={winN(21.8, 26.4)}>
                    {[230, 200, 170, 140, 110].map(r => <ellipse key={r} cx={X.aang} cy={52} rx={r} ry={r * 0.56} fill="var(--sc-accent)" opacity={0.055} />)}
                    {[110, 85, 62].map(r => <ellipse key={r} cx={X.aang} cy={52} rx={r} ry={r * 0.6} fill={FLAME} opacity={0.07} />)}
                    {[[20, 150, 6], [44, 190, 8], [72, 170, 7], [98, 210, 9]].map(([y, rx, ry], i) => <ellipse key={i} cx={X.aang + (i % 2 ? 24 : -20)} cy={y} rx={rx} ry={ry} fill="var(--scene-glow)" opacity={0.1} />)}
                </Fade>
                {/* rays of light turning slowly behind him */}
                <Fade pts={winN(22.2, 26.2)}>
                    <g transform={`translate(${X.aang} 48)`} stroke="var(--scene-glow)" strokeLinecap="round" fill="none">
                        <Live><animateTransform attributeName="transform" type="rotate" values="0;360" dur="36s" repeatCount="indefinite" additive="sum" /></Live>
                        {Array.from({ length: 14 }, (_, i) => <path key={i} d="M0 -58 L0 -118" transform={`rotate(${i * (360 / 14)})`} strokeWidth={i % 2 ? 1.2 : 2.4} opacity={i % 2 ? 0.14 : 0.2} />)}
                    </g>
                </Fade>
                {/* dusk: fireflies come out as the sun goes */}
                <Fade pts={[[0, 0], [20.0, 0], [22.5, 1], [27.5, 1], [ND, 0]]}>
                    <Firefly x={28} y={92} delay={0.4} /><Firefly x={176} y={60} delay={1.1} /><Firefly x={470} y={58} delay={0.2} /><Firefly x={668} y={72} delay={1.7} />
                </Fade>
                <Land />

                {/* soft ground shadows: the depth cue under every figure and prop; they shrink and fade as the Avatar State lifts them */}
                <Shadow x={appa.x} y={appa.y} w={62 * appa.s / 0.72} />
                <Shadow x={board.x} y={board.y} w={20 * board.s} d={0.1} /><Shadow x={sokka.x} y={sokka.y} w={12 * sokka.s / 0.8} d={0.1} />
                <Shadow x={iroh.x} y={iroh.y} w={26 * iroh.s / 0.92} d={0.15} />
                {/* Katara and Zuko stay planted: they are holding their elements out to Aang, so their shadows do not shrink */}
                <Shadow x={katara.x} y={katara.y} w={11 * katara.s / 0.93} still /><Shadow x={zuko.x} y={zuko.y} w={12 * zuko.s / 0.93} still />
                <Shadow x={X.aang} y={G} w={42} d={0.2} />
                <Shadow x={toph.x} y={toph.y} w={12 * toph.s / 0.84} d={0.3} />

                {/* ── 0 · Appa, on the side in the back row: asleep (no snoring) until the light jolts him awake (a small startled hop), then he floats too ── */}
                <Float glow={glow} h={9} d={0.35}>
                    <Tr type="translate" pts={[[0, 0, 0], [21.8, 0, 0], [21.95, 0, -5], [22.1, 0, 0], [22.25, 0, -3], [22.4, 0, 0]]} smooth>
                        <Appa x={appa.x} y={appa.y} s={appa.s} swish />
                    </Tr>
                </Float>

                {/* ── 1 · Sokka at his blueprint board (back row). The pencil really touches the board, and the board and Momo float on their own in the Avatar State ── */}
                <Float glow={glow} h={6} d={0.1}><Board x={board.x} y={board.y} s={board.s} /></Float>
                <Float glow={glow} h={17} d={0.45}>
                    <Fade pts={[[0, 1], [21.9, 1], [22.1, 0], [26.5, 0], [26.7, 1], [ND, 1]]}><Momo x={momo.x} y={momo.y} s={momo.s} /></Fade>
                    <Fade pts={[[0, 0], [21.9, 0], [22.1, 1], [26.5, 1], [26.7, 0], [ND, 0]]}><Momo x={momo.x} y={momo.y} s={momo.s} flap /></Fade>
                </Float>
                <Float glow={glow} h={8} d={0.1}>
                    <Sokka x={sokka.x} y={sokka.y} s={sokka.s} boomerang={false} hand="left"
                           wristFx={<>{PENCIL}<Live><animateTransform attributeName="transform" type="rotate" values={writing(-9, 7)} keyTimes="0;0.08;0.22;0.36;0.5;0.64;0.76;0.86;1" dur="2.4s" repeatCount="indefinite" /></Live></>}
                           armFx={<Live><animateTransform attributeName="transform" type="rotate" values="0 8.6 -52.6;-2.4 8.6 -52.6;1.2 8.6 -52.6;-1.6 8.6 -52.6;2.2 8.6 -52.6;0 8.6 -52.6" dur="2.4s" repeatCount="indefinite" /></Live>} />
                </Float>

                {/* ── 2 · Katara's ribbon: she swirls it, then aims it at Zuko ── */}
                <g transform={`translate(${katara.x} ${katara.y}) scale(${r2(katara.s / 0.85)}) translate(-214 -134)`}>
                    <Ribbon d={SWIRL} a={4.8} b={8.4} />
                </g>
                <Tr type="translate" pts={katBody.mv} smooth>
                    <Tr type="rotate" pts={katBody.lean} smooth>
                        <Katara x={katara.x} y={katara.y} s={katara.s}
                                armWrap={arm => (
                                    <Tr type="rotate" pts={katPts} smooth>
                                        {arm}
                                        {EXCH.map(({ v }) => <Fade key={v} pts={span(v - 0.55, v + 0.03)}><circle cx={26.4} cy={-46.8} r={3.1} fill={WATER} stroke="currentColor" strokeWidth={0.9} /></Fade>)}
                                    </Tr>
                                )} />
                        {/* her waterskin, on her hip: the water comes out of it and goes back into it */}
                        <g transform={`translate(${katara.x} ${katara.y}) scale(${katara.s})`}>
                            <g transform="translate(1.4 0)">
                                <path d="M13 -27.4 Q17.8 -26.6 18.2 -20.8 Q18.4 -14.4 15.2 -13.2 Q11.6 -14.4 11.8 -20.8 Q11.9 -25.4 13 -27.4 Z" {...F} fill={AV_BOOT} strokeWidth={1} />
                                <rect x={13.6} y={-29.6} width={3} height={2.6} rx={0.6} {...F} fill={AV_TRIM} strokeWidth={0.8} />
                                <path d="M12.6 -24.4 Q15 -22.4 17.4 -24.4" {...L} strokeWidth={0.7} />
                            </g>
                            {EXCH.map(({ v, kind }) => <WaterSupply key={v} v={v} kind={kind} />)}
                        </g>
                    </Tr>
                </Tr>

                {/* ── 3 · Katara and Zuko practise, seven exchanges: water in tai chi's flowing way, fire in Northern Shaolin's sharp one ── */}
                {EXCH.map(({ v, kind }) => <Exchange key={v} v={v} kind={kind} />)}
                <Tr type="translate" pts={zukBody.mv} smooth>
                    <Tr type="rotate" pts={zukBody.lean} smooth>
                        <Zuko x={zuko.x} y={zuko.y} s={zuko.s}
                              armWrap={arm => (
                                  <Tr type="rotate" pts={zukPts} smooth>
                                      {arm}
                                  </Tr>
                              )} />
                    </Tr>
                </Tr>
                {/* ── 4 · Iroh warms his own tea with a breath of fire ── */}
                <Float glow={glow} h={7} d={0.15}>
                    <Iroh x={iroh.x} y={iroh.y} s={iroh.s}
                          cupWrap={arm => (
                              <Tr type="rotate" pts={[[0, 0, -11, -36], [13.4, 0, -11, -36], [13.9, 8, -11, -36], [15.6, 8, -11, -36], [16.2, 0, -11, -36]]} smooth>
                                  {arm}
                              </Tr>
                          )}
                          cupFx={
                              <>
                                  {/* the tea warms: it glows from the breath of fire, and steams */}
                                  <Fade pts={[[0, 0], [14.2, 0], [14.8, 0.8], [21.5, 0.8], [22.4, 0], [ND, 0]]}>
                                      <ellipse cx={-24.7} cy={-40.2} rx={3.1} ry={0.8} fill="var(--scene-glow)" stroke="none" />
                                  </Fade>
                                  <Fade pts={[[0, 0], [14.6, 0], [15.1, 0.9], [21.5, 0.9], [22.4, 0], [ND, 0]]}>
                                      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth={0.9} opacity={0.65}>
                                          <path d="M-25.9 -41.6 q-1.8 -2 0 -3.8 q1.8 -1.9 0 -3.8" strokeDasharray="2.6 1.8"><Live><animate attributeName="stroke-dashoffset" values="0;-8.8" dur="1.3s" repeatCount="indefinite" /></Live></path>
                                          <path d="M-23.3 -41.6 q1.8 -2.2 0 -4 q-1.8 -2 0 -4.4" strokeDasharray="2.6 1.8"><Live><animate attributeName="stroke-dashoffset" values="0;-8.8" dur="1.7s" repeatCount="indefinite" /></Live></path>
                                      </g>
                                  </Fade>
                              </>
                          } />
                    {/* Iroh is a firebender: he breathes a short jet of fire over his cup to warm the tea (from his mouth, in his own frame) */}
                    <g transform={`translate(${iroh.x} ${iroh.y}) scale(${iroh.s})`}>
                        <Fade pts={[[0, 0], [14.0, 0], [14.12, 1], [14.85, 1], [15.0, 0], [ND, 0]]}>
                            <g transform="translate(-2.5 -41.2)">
                                <Tr type="scale" pts={[[0, 0.3, 0.3], [14.0, 0.3, 0.3], [14.25, 0.85, 0.85], [14.8, 0.85, 0.85], [15.0, 0.4, 0.4], [ND, 0.4, 0.4]]}><Flame /></Tr>
                            </g>
                        </Fade>
                    </g>
                </Float>

                {/* ── 6 · Aang: meditation → arrows lit → the Avatar State, ringed by what his friends send him ── */}
                {/* Katara's and Zuko's elements, thrown across the strip (their hands glow as they let go) */}
                <Fade pts={winN(21.9, WATER_S.tailEnd + 0.4)}><circle cx={KAT_UP[0]} cy={KAT_UP[1]} r={6.5} fill={WATER} opacity={0.5} stroke="none" /></Fade>
                <Fade pts={winN(21.8, FIRE_S.tailEnd + 0.4)}><circle cx={ZUK_UP[0]} cy={ZUK_UP[1]} r={6.5} {...GLOW} opacity={0.55} /></Fade>
                <Stream id={`${ringId}wsb`} plan={WATER_S} kind="water" layer="back" />
                <Stream id={`${ringId}fsb`} plan={FIRE_S} kind="fire" layer="back" />
                <Float glow={glow} h={5} d={0.2}><MeditationRock x={X.aang} y={G} /></Float>
                {/* his staff, planted against the rock beside him; it floats on its own when the state takes him */}
                <Float glow={glow} h={11} d={0.12}><Glider x={X.aang + 29} y={aangY + 1} r={-6} s={0.82} /></Float>
                <Debris />
                <Fade pts={[[0, 1], [21.6, 1], [21.8, 0], [26.3, 0], [26.5, 1], [ND, 1]]}>
                    <AangMeditate x={X.aang} y={aangY} animate={false} />
                    <g transform={`translate(${X.aang} ${aangY})`}><AangLit /></g>
                </Fade>
                {/* the pillar of light: stacked translucent columns, widest and faintest outside */}
                <Fade pts={[[0, 0], [21.6, 0], [22.4, 1], [25.4, 1], [26.3, 0], [ND, 0]]}>
                    <g fill={WATER} stroke="none">
                        <rect x={X.aang - 14} y={0} width={28} height={aangY} rx={14} opacity={0.08} />
                        <rect x={X.aang - 8} y={0} width={16} height={aangY} rx={8} opacity={0.12} />
                    </g>
                    <rect x={X.aang - 3} y={0} width={6} height={aangY} rx={3} fill={LIT} opacity={0.3} />
                </Fade>
                {/* shockwaves: two rings of light roll out across the ground as the state takes him */}
                {[0, 0.5].map(d => (
                    <Fade key={d} pts={[[0, 0], [21.6 + d, 0], [21.7 + d, 0.85], [23.4 + d, 0], [ND, 0]]}>
                        <g transform={`translate(${X.aang} ${G - 1})`}>
                            <Tr type="scale" pts={[[0, 0.3, 0.3], [21.6 + d, 0.3, 0.3], [23.4 + d, 9, 9]]}>
                                <ellipse rx={20} ry={2.2} fill="none" stroke="var(--sc-snow)" strokeWidth={1.6} vectorEffect="non-scaling-stroke" />
                            </Tr>
                        </g>
                    </Fade>
                ))}
                {/* dust ring where he leaves the rock */}
                <Fade pts={[[0, 0], [21.6, 0], [22.0, 0.8], [23.2, 0], [ND, 0]]}>
                    <g transform={`translate(${X.aang} ${aangY + 1})`}>
                        <Tr type="scale" pts={[[0, 0.4, 0.4], [21.6, 0.4, 0.4], [23.2, 1.8, 1.8]]}>
                            <ellipse rx={22} ry={4} fill="none" stroke="currentColor" strokeWidth={1.1} />
                        </Tr>
                    </g>
                </Fade>
                <Tr type="translate" pts={[[0, 0, 0], [21.7, 0, 0], [22.9, 0, -34], [25.3, 0, -34], [26.4, 0, 0]]} smooth>
                    <StoneRing id={ringId + 'sb'} cx={X.aang} cy={cyA - 1} layer="back" />
                    <WaterRing id={ringId + 'wb'} cx={X.aang} cy={cyA - 4} layer="back" />
                    <FireRing id={ringId + 'fb'} cx={X.aang} cy={cyA + 14} layer="back" />
                    <AirSphere cx={X.aang} cy={cyA} />
                    <Fade pts={[[0, 0], [21.6, 0], [21.8, 1], [26.2, 1], [26.45, 0], [ND, 0]]}>
                        <AangAvatarState x={X.aang} y={aangY} />
                    </Fade>
                    <AirSphere cx={X.aang} cy={cyA} front />
                    <WaterRing id={ringId + 'wf'} cx={X.aang} cy={cyA - 4} layer="front" />
                    <FireRing id={ringId + 'ff'} cx={X.aang} cy={cyA + 14} layer="front" />
                    <StoneRing id={ringId + 'sf'} cx={X.aang} cy={cyA - 1} layer="front" />
                </Tr>
                {/* the near side of each stream, over him (the far side and the rope are behind him, above) */}
                <Stream id={`${ringId}wsf`} plan={WATER_S} kind="water" layer="front" />
                <Stream id={`${ringId}fsf`} plan={FIRE_S} kind="fire" layer="front" />

                {/* Iroh's steam swirls up as the light peaks */}
                <Fade pts={winN(22.4, 26.0)}>
                    <path d="M-2 0 C-6 -6 4 -10 0 -17 C-4 -22 4 -26 0 -32" transform={`translate(${CUP[0] + 2} ${CUP[1] - 4})`} {...L} strokeWidth={1.4} opacity={0.7}>
                        <Live><animate attributeName="stroke-dashoffset" values="0;-14" dur="1.4s" repeatCount="indefinite" /></Live>
                    </path>
                </Fade>

                {/* ── 5 · Toph, front row: she stomps, drops her arms, and the boulder comes up out of the ground as her arms rise from the shoulder and the elbow
                       and swing it overhead; at the throw they snap forward and settle back to her guard ── */}
                {[0, 0.5].map(d => (
                    <ellipse key={d} cx={toph.x} cy={toph.y - 1} rx={6} ry={1.6} fill="none" stroke="currentColor" strokeWidth={1} opacity={0}>
                        <Attr name="rx" pts={[[0, 6], [17.0 + d, 6], [18.4 + d, 40], [ND, 40]]} />
                        <Attr name="opacity" pts={[[0, 0], [17.0 + d, 0], [17.05 + d, 0.6], [18.4 + d, 0], [ND, 0]]} />
                    </ellipse>
                ))}
                <Float glow={glow} h={8} d={0.3}>
                    <Tr type="translate" pts={[[0, 0, 0], [17.0, 0, 0], [17.25, 0, -5], [17.5, 0, 0]]}>
                        <Toph x={toph.x} y={toph.y} s={toph.s}
                              upperWrap={(side, n) => <Tr type="rotate" pts={upper(side === 'l' ? -1 : 1)} smooth>{n}</Tr>}
                              foreWrap={(side, n) => <Tr type="rotate" pts={fore(side === 'l' ? -1 : 1)} smooth>{n}</Tr>} />
                    </Tr>
                </Float>
                <BoulderLift clipId={`${ringId}bg`} glow={glow} bx={boulder.x} by={boulder.y} k={boulder.s} />

                {/* ── the speech bubbles, last so nothing draws over them: each tail points at its speaker's head ── */}
                <Say cx={sokka.x - 14} y0={bubY(LINES.sokka, TIP.sokka)} lines={LINES.sokka} tip={[sokka.x - 2, TIP.sokka]} pts={sayWin('sokka')} />
                <Say cx={katara.x} y0={bubY(LINES.katara, TIP.katara)} lines={LINES.katara} tip={[katara.x, TIP.katara]} pts={sayWin('katara')} />
                <Say cx={zuko.x - 4} y0={bubY(LINES.zuko, TIP.zuko)} lines={LINES.zuko} tip={[zuko.x, TIP.zuko]} pts={sayWin('zuko')} />
                <Say cx={iroh.x + 42} y0={bubY(LINES.iroh, TIP.iroh)} lines={LINES.iroh} tip={[iroh.x, TIP.iroh]} tailAt={iroh.x + 4} pts={sayWin('iroh')} />
                <Say cx={toph.x + 2} y0={bubY(LINES.toph, TIP.toph)} lines={LINES.toph} tip={[toph.x, TIP.toph]} pts={sayWin('toph')} />
                <Say cx={X.aang} y0={8} lines={LINES.aang} tip={[X.aang, 50]} pts={sayWin('aang')} />

                {/* the moment the state takes him: a brief flash across the whole strip */}
                <Fade pts={[[0, 0], [21.6, 0], [21.72, 0.5], [22.5, 0], [ND, 0]]}>
                    <rect x={0} y={0} width={780} height={150} fill="var(--sc-snow)" stroke="none" />
                </Fade>
            </Frozen.Provider>
        </DurCtx.Provider>
    )
}



/* ═════════════════════════════ SPACE ═════════════════════════════ */
/*  "Portal Under Pressure" — Gravity Falls, a 28 s loop, one beat at a time (every bubble stays up ≥ chars ÷ 14 s + 1 s so it can be read).
    The Universe Portal is charging in a night clearing; Bill Cipher, the deadline, floats in closer and bigger.
      1–4      Dipper reads Journal 3: "Journal says: clockwise."
      4.4–7.6  Stan whacks the console with a wrench: "Duct tape fixes everything."  (the charge lurches forward)
      8–11.2   Soos hammers the junction box: "Hey, it's working. Mostly."
      11.6–14.4 Mabel throws glitter into the ring: "Needs more glitter!"
      14.8–19  Bill, huge, eye on the portal: "Nice portal. Shame about the deadline." (the bubble sits above Mabel, its tail running right to him)
      19.2–21  the ring closes, a flash, the vortex opens; Ford steps out, waving
      21–24    Ford: "Sorry I'm late. Traffic."  —  24.2–25.8 Bill: "Rude." and he blinks out.
    DEPTH: three lanes on the ground — back (feet at y 124, smaller), middle (134) and front (143, larger) — with mist between them, a far and a middle row of background pines,
    and a lamp, so the clearing has layers and the characters sit at different distances.                                                              */
const SD = 28
const winS = (a: number, b: number): Pts => win(a, b, SD)
const HOLO = 'var(--sc-glass)'
/** the charge arc (dashoffset, 100 = empty): stalls, lurches when Stan hits the console, creeps, lurches again for Soos and Mabel, closes at 19.4 s */
const RING_PCT: Pts = [[0, 100], [0.8, 100], [3.2, 72], [5.4, 72], [6.2, 70], [6.9, 48], [9.6, 44], [10.4, 40], [10.9, 22], [13.0, 22], [13.8, 6], [19.0, 6], [19.4, 0]]
/** when each of the portal's ten glyphs lights up */
const GLYPH_T = [2.2, 3.6, 6.8, 7.6, 10.8, 11.2, 13.8, 14.2, 17.0, 19.3]

/** the three ground lanes (y of the feet) and the scale each lane draws at */
const BACK = 124, MID = 134, FRONT = 143
const X_DIP = 76, X_SOOS = 150, X_BOX = 181, X_STAN = 262, X_CON = 319, X_PORTAL = 420, X_FORD = 502, X_MABEL = 548, X_BILL = 640
/** the Mystery Shack (back lane, right edge), and the gnome's toadstool (front lane, in the open ground between Mabel and the Shack, clear of the console, the portal and Bill's bubbles) */
const X_SHACK = 738, S_SHACK = 0.76
const X_SHROOM = 658, X_GNOME = 637
const PORTAL_S = 0.95
/** each character's scale: gfScale() makes the heights right relative to each other (Soos 6'3\", Stan and Ford 6'0\", the twins ~5'0\"), then a depth factor for the lane */
const LANE = { back: 0.86, mid: 1, front: 1.08 }
const S = { dip: gfScale('dipper') * LANE.front, mabel: gfScale('mabel') * LANE.front, stan: gfScale('stan') * LANE.mid, ford: gfScale('ford') * LANE.mid, soos: gfScale('soos') * LANE.back }

/** the eye-moon hangs over the clearing and, like Bill's own eye, looks at whoever is speaking */
const EYE_AT: [number, number] = [330, 26]
const BILL_EYE_AT: [number, number] = [X_BILL, 49]
const LOOK_AT = { portal: [420, 80], dip: [X_DIP, 92], stan: [X_STAN, 72], soos: [X_SOOS, 70], mabel: [X_MABEL, 84], ford: [X_FORD, 66], bill: [X_BILL, 60] } as const
/** [time, who] — the eye turns to each speaker just before they talk, and back to the portal in the quiet bits */
const LOOK: [number, keyof typeof LOOK_AT][] = [[0, 'portal'], [0.7, 'dip'], [4.1, 'stan'], [7.7, 'soos'], [11.3, 'mabel'], [14.5, 'bill'], [19.0, 'portal'], [20.7, 'ford'], [23.9, 'bill'], [26.0, 'portal']]
/** pupil offset keyframes [t, dx, dy] for an eye at `from` (reach = how far the pupil may travel; span = distance at which it reaches the edge) */
function gazePts(from: [number, number], reach: number, vreach: number, span: number): Pts {
    const out: Pts = []
    LOOK.forEach(([t, who], i) => {
        const [tx, ty] = LOOK_AT[who]
        const dx = Math.max(-1, Math.min(1, (tx - from[0]) / span)) * reach
        const dy = Math.max(-0.2, Math.min(1, (ty - from[1]) / 100)) * vreach
        const prev = out[out.length - 1]
        if (prev && i > 0) out.push([t, prev[1], prev[2]])
        out.push([i === 0 ? 0 : t + 0.4, +dx.toFixed(2), +dy.toFixed(2)])
    })
    return out
}
const EYE_GAZE = gazePts(EYE_AT, 7, 3.4, 220)
const EYE_SQUEEZE: Pts = EYE_GAZE.map(([t, dx]) => [t, +(1 - Math.abs(dx) / 18).toFixed(2), 1])
const BILL_GAZE = gazePts(BILL_EYE_AT, 3.4, 1.6, 300)
/** the gnome looks at whoever is speaking (a small turn of the pupils), and ducks behind the toadstool's stem while Bill looms (14.4 → 20.6 s) */
const GNOME_GAZE = gazePts([X_GNOME, FRONT - 20], 1, 0.9, 170)
const GNOME_DUCK: Pts = [[0, 0, 0], [14.4, 0, 0], [15.1, X_SHROOM - X_GNOME, 0], [19.9, X_SHROOM - X_GNOME, 0], [20.6, 0, 0]]
const RING_C: [number, number] = [X_PORTAL, BACK + 4 + PORTAL_CY * PORTAL_S]   // centre of the portal's opening, in scene coordinates

/** a spiky "clang" burst: a quick pop at (x, y) at time t */
function Burst({ x, y, t, c = AV_YELLOW }: { x: number; y: number; t: number; c?: string }) {
    return (
        <Fade pts={[[0, 0], [t - 0.02, 0], [t, 1], [t + 0.28, 0], [SD, 0]]}>
            <g transform={`translate(${x} ${y})`}>
                <Tr type="scale" pts={[[0, 0.3, 0.3], [t, 0.3, 0.3], [t + 0.28, 1.2, 1.2]]}>
                    <path d="M0 -7 L1.8 -2.2 L7 0 L1.8 2.2 L0 7 L-1.8 2.2 L-7 0 L-1.8 -2.2 Z" fill={c} stroke="currentColor" strokeWidth={0.8} strokeLinejoin="round" />
                </Tr>
            </g>
        </Fade>
    )
}

/** Mabel's glitter: little stars arcing from her hand into the ring, at the three throws */
const GLITTER: { t: number; to: [number, number]; c: string }[] = [
    { t: 12.25, to: [402, 66], c: AV_YELLOW }, { t: 12.25, to: [418, 86], c: 'var(--sc-accent)' }, { t: 12.25, to: [434, 72], c: 'var(--sc-snow)' }, { t: 12.25, to: [408, 96], c: HOLO },
    { t: 12.75, to: [420, 60], c: 'var(--sc-accent)' }, { t: 12.75, to: [436, 92], c: AV_YELLOW }, { t: 12.75, to: [394, 84], c: HOLO }, { t: 12.75, to: [440, 80], c: 'var(--sc-snow)' },
    { t: 13.25, to: [412, 76], c: AV_YELLOW }, { t: 13.25, to: [428, 64], c: HOLO }, { t: 13.25, to: [418, 100], c: 'var(--sc-accent)' },
]
function Glitter() {
    const x0 = X_MABEL - S.mabel * 17.3, y0 = FRONT - S.mabel * 40.4
    return (
        <>
            {GLITTER.map(({ t, to: [tx, ty], c }, i) => (
                <Fade key={i} pts={[[0, 0], [t, 0], [t + 0.05, 1], [t + 0.85, 1], [t + 1.05, 0], [SD, 0]]}>
                    <Tr type="translate" pts={[[0, x0, y0], [t, x0, y0], [t + 0.4, (x0 + tx) / 2, Math.min(y0, ty) - 16 - (i % 3) * 5], [t + 0.95, tx, ty]]} smooth>
                        <path d="M0 -3 L0.9 -0.9 L3 0 L0.9 0.9 L0 3 L-0.9 0.9 L-3 0 L-0.9 -0.9 Z" fill={c} stroke="currentColor" strokeWidth={0.5} />
                    </Tr>
                </Fade>
            ))}
            {/* a lingering shimmer round the ring where it landed */}
            <Fade pts={[[0, 0], [12.6, 0], [13.2, 0.9], [14.8, 0.9], [15.6, 0], [SD, 0]]}>
                <Sparkle x={RING_C[0] - 26} y={RING_C[1] - 20} delay={0.2} s={0.8} /><Sparkle x={RING_C[0] + 24} y={RING_C[1] + 12} delay={0.7} s={0.7} /><Sparkle x={RING_C[0] + 4} y={RING_C[1] - 32} delay={1.1} s={0.6} />
            </Fade>
        </>
    )
}

export function HackathonSpace({ reduce }: { reduce: boolean }) {
    const arc = reduce ? sample(RING_PCT, FREEZE_SPACE, SD)[0] : 100
    const hit = (rest: number, hitDeg: number, cx: number, cy: number, times: number[]): Pts => {
        const a: Pts = [[0, rest, cx, cy]]
        times.forEach(t => { a.push([t - 0.01, rest, cx, cy], [t + 0.12, hitDeg, cx, cy], [t + 0.27, rest, cx, cy]) })
        return a
    }
    const glyphs = PORTAL_GLYPHS.map(([x, y, a], i) => (
        <Fade key={i} pts={[[0, 0], [GLYPH_T[i], 0], [GLYPH_T[i] + 0.3, 1], [26.0, 1], [26.8, 0], [SD, 0]]}>
            <path d="M-2 -2.6 L2 -2.6 M0 -2.6 V2.6 M-2 2.6 L2 2.6" transform={`translate(${x} ${y}) rotate(${a + 90})`} stroke="var(--sc-glass)" strokeWidth={1.4} strokeLinecap="round" fill="none" style={{ filter: 'drop-shadow(0 0 2px var(--sc-glass))' }} />
        </Fade>
    ))
    return (
        <DurCtx.Provider value={SD}>
            <Frozen.Provider value={reduce ? FREEZE_SPACE : null}>
                {/* ── sky ── */}
                <Stars w={780} h={118} n={74} seed={41} />
                <Nebula x={390} y={40} w={640} h={58} />
                <Sparkle x={250} y={16} delay={0.6} s={0.7} /><Sparkle x={470} y={12} delay={1.2} s={0.8} /><Sparkle x={720} y={20} delay={0.3} s={0.7} />
                <GfEye x={EYE_AT[0]} y={EYE_AT[1]} r={15} blink={!reduce}
                       pupilWrap={pupil => <Tr type="translate" pts={EYE_GAZE} smooth><Tr type="scale" pts={EYE_SQUEEZE}>{pupil}</Tr></Tr>} />
                {/* Bill's menace reddens the sky as the deadline nears */}
                <Fade pts={[[0, 0], [14.0, 0], [15.4, 1], [19.0, 1], [20.0, 0], [SD, 0]]}>
                    {[220, 180, 140, 100].map(r => <ellipse key={r} cx={X_BILL} cy={60} rx={r} ry={r * 0.5} fill="var(--sc-accent)" opacity={0.05} />)}
                </Fade>

                {/* ── the far tree-line, the hills, the middle row, the Mystery Shack in the distance ── */}
                <GfForest y={112} tone="far" h={30} w={14} o={0.8} xs={[[20, 1], [48, 0.8], [84, 1.1], [118, 0.9], [168, 1], [214, 0.85], [262, 1.1], [318, 0.9], [372, 1], [470, 1.1], [520, 0.85], [572, 1], [610, 0.9], [668, 1.1]]} />
                <Land />
                <GfForest y={119} tone="mid" h={36} w={16} o={0.9} xs={[[36, 1], [96, 0.9], [200, 1.1], [236, 0.8], [350, 0.9], [494, 1], [590, 0.85], [664, 1.05]]} />
                <MysteryShack x={X_SHACK} y={BACK - 2} s={S_SHACK} />
                {/* the clearing: a patch of trodden ground round the portal */}
                <ellipse cx={X_PORTAL} cy={MID} rx={150} ry={9} fill="var(--sc-near)" stroke="none" opacity={0.4} />
                <Crater x={600} y={FRONT} w={46} o={0.6} /><Crater x={26} y={FRONT} w={40} o={0.6} />

                {/* ── BACK lane (feet at 124): the portal, Soos at his junction box, a lamp ── */}
                <GfLamp x={214} y={BACK} s={0.8} />
                <UniversePortal x={X_PORTAL} y={BACK + 4} s={PORTAL_S} arc={arc}
                                arcFx={<Attr name="stroke-dashoffset" pts={RING_PCT} />}
                                glyphs={glyphs}
                                fill={
                                    <Fade pts={[[0, 0], [19.2, 0], [19.8, 1], [25.8, 1], [26.4, 0], [SD, 0]]}>
                                        <circle cx={0} cy={PORTAL_CY} r={38} fill={HOLO} opacity={0.35} />
                                        <g>
                                            <Live><animateTransform attributeName="transform" type="rotate" values={`0 0 ${PORTAL_CY};360 0 ${PORTAL_CY}`} dur="4s" repeatCount="indefinite" /></Live>
                                            {[30, 22, 14, 7].map((r, i) => <ellipse key={r} cx={0} cy={PORTAL_CY} rx={r} ry={r * 0.62} fill="none" stroke={i % 2 ? 'var(--sc-snow)' : HOLO} strokeWidth={1.6} strokeDasharray="14 9" opacity={0.9} transform={`rotate(${i * 38} 0 ${PORTAL_CY})`} />)}
                                        </g>
                                        <circle cx={0} cy={PORTAL_CY} r={9} fill="var(--sc-snow)" opacity={0.7} />
                                    </Fade>
                                } />
                <Console x={X_BOX} y={BACK} s={0.62} blink={false} />
                <Soos x={X_SOOS} y={BACK} s={S.soos}
                      armWrap={arm => <Tr type="rotate" pts={hit(8, 86, 16, -48, [8.5, 8.95, 9.4, 9.85, 10.3])}>{arm}</Tr>} />
                {[8.62, 9.07, 9.52, 9.97, 10.42].map(t => <Burst key={t} x={X_BOX - 9} y={BACK - 22} t={t} c="var(--sc-glass)" />)}

                {/* mist drifts between the back and middle lanes: it softens the far lane and sets it further off */}
                <GfMist x={300} y={MID - 6} rx={260} ry={8} o={0.1} drift={!reduce} />
                <GfMist x={560} y={MID - 2} rx={220} ry={7} o={0.08} drift={!reduce} />

                {/* cables on the ground: junction box → console → portal */}
                <path d={`M${X_BOX + 6} ${BACK - 1} C${X_BOX + 36} ${MID + 4} ${X_CON - 70} ${MID + 6} ${X_CON - 12} ${MID - 2} M${X_CON + 14} ${MID - 2} C${X_CON + 34} ${MID + 3} ${X_PORTAL - 74} ${BACK + 4} ${X_PORTAL - 52} ${BACK}`} {...L} strokeWidth={1.3} fill="none" opacity={0.85} />
                <Fade pts={[[0, 0], [19.1, 0], [19.25, 0.4], [20.0, 0], [SD, 0]]}>
                    <rect x={0} y={0} width={780} height={150} {...GLOW} />
                </Fade>

                {/* ── MIDDLE lane (feet at 134): Stan and his console, and Ford once he's out ── */}
                <Console x={X_CON} y={MID} />
                <Stan x={X_STAN} y={MID} s={S.stan}
                      armWrap={arm => <Tr type="rotate" pts={hit(-20, 60, 14, -46, [5.0, 5.55, 6.1])}>{arm}</Tr>} />
                <Burst x={X_CON - 15} y={MID - 31} t={5.12} /><Burst x={X_CON - 15} y={MID - 31} t={5.67} /><Burst x={X_CON - 15} y={MID - 31} t={6.22} />
                <Fade pts={[[0, 0], [19.6, 0], [19.9, 1], [26.0, 1], [26.8, 0], [SD, 0]]}>
                    <Tr type="translate" pts={[[0, X_PORTAL, BACK + 4], [19.7, X_PORTAL, BACK + 4], [21.0, X_FORD, MID]]} smooth>
                        <Tr type="scale" pts={[[0, 0.5, 0.5], [19.7, 0.5, 0.5], [21.0, S.ford, S.ford]]} smooth>
                            <Ford armWrap={arm => <Tr type="rotate" pts={[[0, 30, 9, -52], [21.2, 30, 9, -52], [21.5, -12, 9, -52], [21.8, 18, 9, -52], [22.1, -12, 9, -52], [22.4, 18, 9, -52], [22.7, -12, 9, -52], [23.0, 18, 9, -52], [23.4, 30, 9, -52]]}>{arm}</Tr>} />
                        </Tr>
                    </Tr>
                </Fade>

                {/* ── FRONT lane (feet at 143): Dipper and Mabel, the biggest, with grass in front of them ── */}
                <Dipper x={X_DIP} y={FRONT} s={S.dip} />
                <Mabel x={X_MABEL} y={FRONT} s={S.mabel} flip
                       armWrap={arm => <Tr type="rotate" pts={[[0, 62, 7.2, -32.6], [12.0, 62, 7.2, -32.6], [12.25, -25, 7.2, -32.6], [12.5, 62, 7.2, -32.6], [12.75, -25, 7.2, -32.6], [13.0, 62, 7.2, -32.6], [13.25, -25, 7.2, -32.6], [13.5, 62, 7.2, -32.6]]}>{arm}</Tr>} />
                <Glitter />
                {/* the gnome patch: a giant toadstool with a garden gnome peeking out from behind it (he ducks behind the stem while Bill looms) */}
                <Tr type="translate" pts={GNOME_DUCK} smooth>
                    <GfGnome x={X_GNOME} y={FRONT - 1} s={0.58}
                             pupilWrap={pupils => <Tr type="translate" pts={GNOME_GAZE} smooth>{pupils}</Tr>} />
                </Tr>
                <GfMushroom x={X_SHROOM} y={FRONT} s={0.8} />
                <GfGrass xs={[130, 212, 316, 470, 612, 712]} y={FRONT + 2} />
                {/* fireflies, a few */}
                <Firefly x={96} y={84} delay={0.4} /><Firefly x={226} y={70} delay={1.2} /><Firefly x={366} y={104} delay={0.8} /><Firefly x={520} y={72} delay={1.6} /><Firefly x={690} y={90} delay={0.1} />

                {/* ── Bill Cipher, the deadline: small and far, then bigger and closer; his eye follows the ring; he blinks out after "Rude." ── */}
                <Fade pts={[[0, 0], [0.5, 1], [25.0, 1], [25.9, 0], [SD, 0]]}>
                    <g transform={`translate(${X_BILL} 66)`}>
                        <Tr type="scale" pts={[[0, 0.5, 0.5], [0.5, 0.5, 0.5], [14.8, 1, 1], [19.0, 1, 1], [19.5, 0.85, 0.85], [24.0, 0.85, 0.85], [25.0, 0.5, 0.5], [25.9, 0.1, 0.1]]}>
                            <g>
                                <Live><animateTransform attributeName="transform" type="translate" values="0 0;0 -3;0 0" dur="3.2s" repeatCount="indefinite" calcMode="spline" keyTimes="0;0.5;1" keySplines="0.4 0 0.6 1;0.4 0 0.6 1" /></Live>
                                <BillCipher pupilWrap={pupil => (
                                    <Tr type="translate" pts={BILL_GAZE} smooth>{pupil}</Tr>
                                )} />
                            </g>
                        </Tr>
                    </g>
                </Fade>

                {/* ── dialogue, on top of everything ── */}
                <Say cx={X_DIP + 4} y0={30} lines={['Journal says:', 'clockwise.']} tip={[X_DIP, 72]} pts={winS(1.0, 4.0)} />
                <Say cx={X_STAN} y0={8} lines={['Duct tape fixes', 'everything.']} tip={[X_STAN, 49]} pts={winS(4.4, 7.6)} />
                <Say cx={X_SOOS} y0={14} lines={['Hey, it’s working.', 'Mostly.']} tip={[X_SOOS, 54]} pts={winS(8.0, 11.2)} />
                <Say cx={X_MABEL} y0={34} lines={['Needs more', 'glitter!']} tip={[X_MABEL, 73]} pts={winS(11.6, 14.4)} />
                <Say cx={X_MABEL - 10} y0={24} lines={['Nice portal. Shame about', 'the deadline.']} tip={[X_BILL - 29, 50]} tailAt={40} side="right" pts={winS(14.8, 19.0)} />
                <Say cx={X_FORD + 30} y0={12} lines={['Sorry I’m late.', 'Traffic.']} tip={[X_FORD, 56]} tailAt={X_FORD} pts={winS(21.0, 24.0)} />
                <Say cx={X_MABEL + 29} y0={34} lines={['Rude.']} tip={[X_BILL - 27, 52]} tailAt={44} side="right" pts={winS(24.2, 25.8)} />
            </Frozen.Provider>
        </DurCtx.Provider>
    )
}