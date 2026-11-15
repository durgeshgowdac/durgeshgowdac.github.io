'use client'

import { BubbleShape } from '@/app/components/scenery/bubbleKit'
import { useScenePlayback } from '@/app/components/useScenePlayback'
import { useRef, type CSSProperties, type ReactNode } from 'react'
import {
    P, L, Fox, Deer, Alien, Astronaut, Bird, Cloud as SkyCloud, Pine, RoundTree, Sparkle, Moon, Asteroid, Crater,
    Stars, Nebula, Planet, Comet, Lander, Flag, Satellite, Aurora, Flower, Volleyball, Net, Ash, Pikachu, Ball, Snorlax, Boulder, Rock, Cairn, Fern, Mushrooms, Butterfly, MistBand, ashGrip, ASH_BODY, GLOW, BALL_RED, BALL_RED_DK, BALL_RED_LT, type AshAnim,
} from '@/app/components/scenery/illustrations'
import { useReducedMotion } from '@/app/components/useReducedMotion'
import QuidditchScene from '@/app/components/QuidditchScene'
import { HackathonNature, HackathonSpace } from '@/app/components/HackathonScene'
import CricketShot, { SHOT } from '@/app/components/CricketShot'

/**
 * "Postcards" — the wide illustrated strips above the Inspiration and Sports
 * sections (the About grid cards use <AboutCardIcon/> instead). Each is drawn twice
 * (Nature / Space) and crossfaded by the same theme classes as the big backdrop.
 *
 *   sky      Inspiration   fireflies in a canopy  ↔  a constellation of eight stars
 *   sports   Sports        fox v deer, volleyball  ↔  astronaut v alien, low-gravity volleyball
 *            plus cricket stumps and a Taekwondo kicker (rabbit ↔ robot) breaking a board — one scene per sport card
 *   hackathons  Ch.02 header (HackathonScene.tsx, drawn in the full 780 × 150 frame like `catch`) — Nature: "Four Elements, One Deadline" (the
 *            Avatar cast, a setting sun, four crates to Appa) ↔ Space: "Hyperdrive Spooling" (a repair dock, a charging hyperdrive, the jump)
 *   catch    Ch.01 header — Nature: Ash (a boy, mouse on his shoulder) walks up to the fox, says his line, throws a ball and
 *            a red blob of light wraps the fox and draws it into the ball
 *            Space: Harry's Snitch chase over a far-off Quidditch match (QuidditchScene.tsx) — one 16 s loop
 */
export type ArtKind = 'sky' | 'sports' | 'catch' | 'hackathons'

const RIDGE_FAR = 'M0 100 V64 C60 50 120 68 180 58 S300 44 360 54 V100 Z'
const RIDGE_MID = 'M0 100 V80 C80 68 160 84 240 76 S330 70 360 72 V100 Z'

const RIDGE_EDGE = 'M0 64 C60 50 120 68 180 58 S300 44 360 54'

function Hills({ wide = false, dy = 0, edge = false }: { wide?: boolean; dy?: number; edge?: boolean }) {
    // The ridge is drawn for a 360-wide postcard; on the 780-wide strips it is
    // stretched horizontally (non-scaling strokes keep the line weight even).
    // `edge` adds a thin line along the far ridge so whatever sits above it (the asterism) reads as sky, not ground.
    return (
        <g transform={`${wide ? `scale(${780 / 360} 1) ` : ''}translate(0 ${dy})`}>
            <path d={RIDGE_FAR} className="sc-far" />
            <path d={RIDGE_MID} className="sc-mid" />
            {edge && <path d={RIDGE_EDGE} {...L} strokeWidth={1} opacity={0.75} vectorEffect="non-scaling-stroke" />}
            <path d={RIDGE_MID} {...L} strokeWidth={1} opacity={0.4} vectorEffect="non-scaling-stroke" />
        </g>
    )
}

function Constellation() {
    // Eight stars for eight inspirations, joined like a real asterism.
    const pts: [number, number][] = [[70, 62], [150, 30], [240, 52], [320, 24], [430, 58], [520, 34], [610, 66], [700, 40]]
    return (
        <g>
            <path d={`M${pts.map(p => p.join(' ')).join(' L')}`} {...L} strokeWidth={1} strokeDasharray="2 5" opacity={0.65} />
            {pts.map(([x, y], i) => (
                <g key={i}>
                    <circle cx={x} cy={y} r="9" className="sc-glow" opacity={0.35} />
                    <Sparkle x={x} y={y} s={1.5} o={1} delay={i * 0.35} />
                </g>
            ))}
        </g>
    )
}

/** Inspiration strip (Nature), depth back to front: hills → a FAR treeline of tiny hazy trees → a band of mist → a second, clearer row →
 *  a third row of medium trees → a few big trees at the edges and one off-centre → wildflowers → fireflies.
 *  Each row is faded as ONE flat layer (group opacity), so overlapping trees in a row don't show through one another.
 *  Rows come from `treeline` (seeded, so the server and the browser draw the same wood); the strip is 780 × 100, ridge at y ≈ 64–84. */
const SKY_ROW_FAR = treeline(11, -4, 790, 26, 8, 73, 2, 0.2, 0.3, 0.72)
const SKY_ROW_2 = treeline(31, 2, 790, 46, 12, 83, 2, 0.32, 0.46, 0.62)
const SKY_ROW_3 = treeline(53, 0, 790, 84, 22, 93, 2, 0.5, 0.68, 0.55)
/** the few big trees: edges, plus one off-centre pine and one round tree for rhythm — [kind, x, base y, scale] */
const SKY_BIG_TREES: ['p' | 'r', number, number, number][] = [
    ['p', 30, 101, 1.0], ['r', 120, 100, 0.8],
    ['r', 330, 100, 0.7], ['p', 450, 101, 0.62],
    ['p', 640, 101, 0.72], ['r', 712, 100, 0.9], ['p', 764, 101, 0.98],
]
/** sky furniture for the Inspiration strip (Nature) — in the strip's lifted frame, so y < 0 is the headroom above the ridge.
 *  A cloud spans x −34…42 and y −27…0 (× s) and drifts 38 × s to the right, so every top stays ≥ 16 below the strip's top edge and every drifted right edge inside 780. */
const SKY_CLOUDS: [number, number, number, number, string][] = [
    [90, -14, 0.62, 0.9, ''], [230, -8, 0.42, 0.8, 'scene-cloud--b'], [360, -14, 0.68, 0.9, ''],
    [520, -12, 0.5, 0.8, 'scene-cloud--b'], [640, -16, 0.55, 0.85, ''], [740, -8, 0.38, 0.75, 'scene-cloud--b'],
]
const SKY_FLOWERS: [number, number, number][] = [[46, 97, 0.34], [128, 98, 0.46], [214, 96, 0.3], [296, 98, 0.4], [372, 97, 0.34], [418, 98, 0.5], [506, 97, 0.3], [588, 98, 0.44], [668, 97, 0.34], [734, 98, 0.4]]
function SkyTrees() {
    const draw = (list: ['p' | 'r', number, number, number][]) => list.map(([k, x, y, sc], i) => (k === 'p' ? <Pine key={i} x={x} y={y} s={sc} /> : <RoundTree key={i} x={x} y={y} s={sc} />))
    return (
        <>
            {SKY_CLOUDS.map(([x, y, sc, o, c], i) => <SkyCloud key={i} x={x} y={y} s={sc} o={o} drift driftClass={c} />)}
            <Bird x={180} y={-18} s={0.6} className="scene-fly" />
            <Bird x={204} y={-8} s={0.42} className="scene-fly" />
            <Bird x={572} y={-24} s={0.55} className="scene-fly" />
            <g opacity={0.5}>{draw(SKY_ROW_FAR)}</g>
            <MistBand y={76} w={780} h={12} o={0.4} />
            <g opacity={0.76}>{draw(SKY_ROW_2)}</g>
            <g opacity={0.92}>{draw(SKY_ROW_3)}</g>
            {draw(SKY_BIG_TREES)}
            {SKY_FLOWERS.map(([x, y, sc], i) => <Flower key={i} x={x} y={y} s={sc} />)}
        </>
    )
}

/** Fireflies: scattered, not in a row. Different sizes (a bright core and a soft halo scaled to it), a third of them high in the sky and the
 *  rest low among the trees and over the grass; each drifts on its own slow, looping path and blinks on its own beat. Seeded integer LCG with
 *  rounded values, so the server and the browser agree. `still` (reduced motion) keeps them in place, glowing. */
const r1 = (v: number) => Math.round(v * 10) / 10
type Fly = { x: number; y: number; r: number; dx: number; dy: number; dur: number; delay: number }
const FLIES: Fly[] = (() => {
    let a = 2024
    const rnd = () => { a = (a * 1664525 + 1013904223) % 4294967296; return a / 4294967296 }
    return Array.from({ length: 20 }, (_, i): Fly => {
        const high = i % 3 === 0
        return {
            x: r1(14 + (i / 20) * 750 + (rnd() - 0.5) * 30),
            y: r1(high ? 8 + rnd() * 34 : 48 + rnd() * 44),
            r: r1(1.2 + rnd() * 1.7),
            dx: r1((rnd() - 0.5) * 24),
            dy: r1((rnd() - 0.5) * 14),
            dur: r1(6 + rnd() * 5),
            delay: r1(rnd() * 3),
        }
    })
})()
function Fireflies({ still = false }: { still?: boolean }) {
    return (
        <g>
            {FLIES.map((f, i) => (
                <g key={i} transform={`translate(${f.x} ${f.y})`}>
                    <g>
                        {!still && (
                            <animateTransform
                                attributeName="transform" type="translate" dur={`${f.dur}s`} repeatCount="indefinite"
                                values={`0 0;${f.dx} ${f.dy};${r1(-f.dx * 0.6)} ${r1(f.dy * 0.4 + 2)};0 0`}
                                calcMode="spline" keyTimes="0;0.35;0.7;1" keySplines="0.45 0 0.55 1;0.45 0 0.55 1;0.45 0 0.55 1"
                            />
                        )}
                        <g className="scene-twinkle" style={{ animationDelay: `${f.delay}s` }}>
                            <circle r={f.r * 3.6} className="sc-sun" opacity={0.27} />
                            <circle r={f.r * 2.1} className="sc-sun" opacity={0.42} />
                            <circle r={f.r} className="sc-sun" stroke={f.r > 1.8 ? 'currentColor' : 'none'} strokeWidth={0.6} />
                        </g>
                    </g>
                </g>
            ))}
        </g>
    )
}

/** Cricket: three stumps with bails and a bat that winds up and swings through the ball (the ball itself, and where it goes, is <CricketShot/>'s — see CricketShot.tsx;
 *  the swing is on the same 18 s loop, meeting the ball at SHOT.swing). `swing={false}` leaves the bat still (reduced motion). */
function Stumps({ x = 0, y = 0, s = 1, swing = true }: { x?: number; y?: number; s?: number; swing?: boolean }) {
    const T = SHOT.swing, D = SHOT.dur
    // the bat pivots about the HANDS (the top of the handle, 27.5 −36), like a real swing: rest → a short back-lift (+18°) → the blade sweeps through the ball (−30° at the hit)
    // → follow-through (−52°), held a moment → back to rest. It never goes near the ground.
    const ts = [0, T - 1.0, T - 0.35, T, T + 0.25, T + 0.9, T + 1.9, D].map(v => (v / D).toFixed(5)).join(';')
    const vs = ['0', '0', '18', '-30', '-52', '-52', '0', '0'].map(v => `${v} 27.5 -36`).join(';')
    const sp = ['0 0 1 1', '0.4 0 0.6 1', '0.5 0 0.9 0.6', '0.1 0.6 0.3 1', '0 0 1 1', '0.4 0 0.6 1', '0 0 1 1'].join(';')
    return (
        <P x={x} y={y} s={s}>
            <path d="M-9 0 V-27 M0 0 V-27 M9 0 V-27" {...L} strokeWidth={1.7} />
            <path d="M-9.6 -27.8 Q-4.8 -30.4 -0.6 -27.8 M0.6 -27.8 Q4.8 -30.4 9.6 -27.8" {...L} strokeWidth={1.4} />
            <g transform="rotate(16 28 0)">
                <g>
                    {swing && <animateTransform attributeName="transform" type="rotate" values={vs} keyTimes={ts} calcMode="spline" keySplines={sp} dur={`${D}s`} repeatCount="indefinite" />}
                    <rect x={22} y={-28} width={11} height={28} rx={3} className="sc-sign" stroke="currentColor" strokeWidth={1.1} />
                    <path d="M27.5 -28 V-40" {...L} strokeWidth={2} />
                </g>
            </g>
        </P>
    )
}

/** The volleyball in play. It travels between the two players (x, linear, `--vb-dx`), rising and falling on a
 *  gravity-shaped curve (y, `--vb-peak`), spinning, with a shadow that tightens as it climbs. It starts at the
 *  left player's contact point (x0, y0) and reaches the right player's after half a cycle — which is exactly
 *  when <Player> has that player jumping to meet it (see the .sp-vb-* rules in globals.css). */
function Rally({ space = false }: { space?: boolean }) {
    const x0 = space ? 318 : 324, y0 = space ? 40 : 38
    const dx = space ? 142 : 134, peak = space ? 30 : 24
    const w = space ? ' sp-ball--space' : ''
    return (
        <g transform={`translate(${x0} ${y0})`} style={{ ['--vb-dx' as string]: `${dx}px`, ['--vb-peak' as string]: `${peak}px` } as CSSProperties}>
            <g className={`sp-ball-x${w}`}>
                <ellipse className={`sp-shadow sc-shade${w}`} cx={0} cy={92 - y0} rx={9} ry={2.2} opacity={0.4} />
                <g className={`sp-ball-y${w}`}>
                    <g className={`sp-ball-spin${w}`}>
                        <Volleyball s={space ? 0.62 : 0.68} />
                    </g>
                </g>
            </g>
        </g>
    )
}

/** One player on the court. Three nested groups, each with its own motion so they can be timed independently:
 *    .sp-vb-hop   up/down — a jump to meet the ball, then back to the ground
 *    .sp-vb-step  toward the net while the ball is coming, back off after hitting it, with a small lean
 *  `dir` is +1 when the net is to the player's right, −1 when it is to the left. The right-hand player runs the
 *  same loop half a cycle later (.sp-vb--r), so the two always alternate. */
function Player({ x, dir = 1, space = false, children }: { x: number; dir?: 1 | -1; space?: boolean; children: ReactNode }) {
    return (
        <g transform={`translate(${x} 92)`}>
            <g className={`sp-vb${space ? ' sp-vb--space' : ''}${dir === -1 ? ' sp-vb--r' : ''}`} style={{ ['--vb-dir' as string]: dir } as CSSProperties}>
                <g className="sp-vb-hop"><g className="sp-vb-step">{children}</g></g>
            </g>
        </g>
    )
}

/** Taekwondo: a kicker in a dobok and black belt (a rabbit on the Nature side, a little robot in Space) chambers a
 *  knee, snaps a front kick through a wooden board in a stand, and the two halves fly apart before a fresh board
 *  fades back in. Drawn facing right with its feet on y = 0 (placed by translate); every limb is its own group so
 *  CSS can swing it about its joint — see the .tk-* rules in globals.css. */
function Kicker({ x, s = 1.08, space = false }: { x: number; s?: number; space?: boolean }) {
    const stroke = { stroke: 'currentColor', strokeWidth: 1.3 }
    return (
        <g transform={`translate(${x} 92) scale(${s})`}>
            <g className={`tk${space ? ' tk--space' : ''}`}>
                {/* the board in its stand: it does not move with the kicker */}
                <path d="M34 0 V-36 M27.5 -32 H34 M27.5 -8.5 H34" {...L} strokeWidth={1.6} />
                <g className="tk-piece tk-piece--top"><rect x={24} y={-32} width={3.4} height={11.5} rx={0.9} className="sc-sign" {...stroke} strokeWidth={1.1} /></g>
                <g className="tk-piece tk-piece--bot"><rect x={24} y={-20.5} width={3.4} height={11.5} rx={0.9} className="sc-sign" {...stroke} strokeWidth={1.1} /></g>
                <g className="tk-burst"><path d="M30 -20.5 H38 M29.5 -25 L36 -30 M29.5 -16 L36 -11" {...L} strokeWidth={1.3} className="tk-burst-lines" /></g>

                <g className="tk-hop"><g transform="translate(0 -20)"><g className="tk-lean"><g transform="translate(0 20)">
                    {/* rear arm, support leg, kicking leg (thigh → knee → shin → foot, each swinging about its joint) */}
                    <g transform="translate(-2 -37)"><g className="tk-arm tk-arm--r"><path d="M0 0 L-5 4 L-9 -1" {...L} strokeWidth={2.6} /></g></g>
                    <path d="M-1 -20 L-2 -10 L-3 0 M-3 0 H3" {...L} strokeWidth={2.5} />
                    <g transform="translate(0 -20)"><g className="tk-thigh">
                        <path d="M0 0 V10" {...L} strokeWidth={2.5} />
                        <g transform="translate(0 10)"><g className="tk-shin"><path d="M0 0 V10 M0 10 H5" {...L} strokeWidth={2.5} /></g></g>
                    </g></g>
                    {/* dobok, collar, black belt with its two tails */}
                    <rect x={-6} y={-41} width={12} height={22} rx={4} className="sc-cloud" {...stroke} />
                    <path d="M-2.4 -41 L1.5 -33 L5 -41" {...L} strokeWidth={0.9} opacity={0.7} />
                    <rect x={-6.4} y={-29} width={12.8} height={3.6} rx={1} className="sc-accent" {...stroke} strokeWidth={1} />
                    <path d="M3 -25.4 L2.2 -19 M5 -25.4 L6.6 -19.5" {...L} strokeWidth={1.5} />
                    <g transform="translate(2 -37)"><g className="tk-arm tk-arm--f"><path d="M0 0 L6 3 L11 -2" {...L} strokeWidth={2.6} /></g></g>
                    {space ? (
                        <>
                            <path d="M0.5 -53 V-58.5" {...L} strokeWidth={1.1} />
                            <circle cx={0.5} cy={-60} r={1.8} fill="var(--scene-warm)" />
                            <rect x={-6} y={-53} width={14} height={12.5} rx={3.4} className="sc-cloud" {...stroke} />
                            <rect x={-1} y={-49.6} width={8} height={3.6} rx={1.7} fill="var(--scene-glow)" opacity={0.9} />
                        </>
                    ) : (
                        <>
                            <path d="M-1 -51.5 Q-4.5 -66 -0.5 -66.5 Q3.5 -64 3 -51.5 Z" className="sc-cloud" {...stroke} strokeWidth={1.1} />
                            <path d="M3 -52 Q5.5 -65.5 9.5 -63 Q10.6 -59 6.8 -51 Z" className="sc-cloud" {...stroke} strokeWidth={1.1} />
                            <ellipse cx={1.5} cy={-46.5} rx={6.6} ry={5.8} className="sc-cloud" {...stroke} />
                            <circle cx={4.6} cy={-47.6} r={1} fill="currentColor" />
                            <circle cx={7.6} cy={-45.6} r={0.9} fill="currentColor" />
                        </>
                    )}
                </g></g></g></g>
            </g>
        </g>
    )
}


/* ───────────────────────── "The Catch" — Nature only ─────────────────────────
 * One 14 s loop on ONE SMIL clock (every <animate*> below is `dur=14s`, `repeatCount=indefinite`, keyed in fractions of
 * the same 14 s), so the walk, the line, the throw, the beam, the wobble and the reset can never disagree:
 *
 *    0.0  scene fades in           Ash is off at the left with the ball in his hand; Snorlax sleeps at the right, head on a boulder
 *    0.4  he walks in (5 steps)    →  3.4 stops about 150 units from it, facing it
 *    3.55 he raises the ball       1.2 – 4.7 speech bubble "Gotta Catch ’Em All!" (travels with him, lingers)
 *    3.85 wind-up                  leans back, elbow up, ball behind the head; the other arm points at Snorlax
 *    4.0  throw                    the arm whips over the top, the body tips forward, the far foot steps in
 *    4.3  release                  the ball flies a straight diagonal, spinning, and HITS Snorlax's flank at 4.95 (flinch, spark)
 *    4.95 rebound                  it ricochets up to hover a little left of, and above, its head (5.4)
 *    5.4  the cap flips open       one red flash; a red blob of light leaves the ball, travels down onto Snorlax (5.9) and wraps it,
 *                                  a single thin ray keeping it tied to the ball the whole way
 *    6.4  the blob — Snorlax inside — is drawn back up the ray, shrinking, into the ball (gone by 6.95)
 *    6.9  the cap closes           7.2 the ball drops to the ground and bounces
 *    8.4  three wobbles            9.9 click: a small flash, the mouse hops; Ash waves (10.3 – 15.4) and speaks twice, in two separate bubbles:
 *                                  10.0 – 11.9 “Yayyy! I caught a Snorlax!”   12.7 – 15.3 “Man, I’m glad we didn’t have to carry him home!” (wrapped)
 *    15.9 → 16.6 everything fades, 17.5 loop (storyboard seconds; played PACE × slower)
 *
 * Scale: Ash is 4′7″ = 55 in = 89 units (1.62 units per inch). Snorlax stands 6′11″ but RESTS here at 5′5″ = 65 in ≈ 105 units, slumped
 * with its head on a boulder, so it is drawn at s = SN_S ≈ 1.065 (the drawing is 99 tall at s = 1). Trees are scaled against Ash too:
 * the meadow trees beside the characters are ≈ 1.5 × his height (the most that fits the strip, none cropped), and only the rows up on the
 * far ridges are small. Composition: Ash (x = 290) and Snorlax (x = 484) sit either side of the centre line, trees frame both sides. Everything is the shared drawings (Ash, Critter, Ball, Snorlax, Boulder, Pine, RoundTree,
 * Flower); Ash's and Snorlax's own colours are fixed, the world is theme tokens. Reduced motion renders a still frame: the moment
 * of the wind-up — ball cocked behind the head, speech bubble up. */
const DUR = 17.5
/** Slow-motion factor: every time below is written in the 16 s storyboard, and the whole loop is played PACE × slower (all the SMIL clocks use
 *  PLAY, the keyTimes stay fractions of DUR), so the walk, the wind-up, the throw and the lines all breathe. 1 = the old, rushed speed. */
const PACE = 1.2
const PLAY = DUR * PACE
const GROUND = 138
const ASH_X = 290
const SN_X = 484                        // Snorlax's seat; the boulder rises just to its right
const SN_S = 1.065                      // 5′5″ resting = 65 in × 1.62 = 105 units; the drawing is 99 tall at s = 1
const SN_C = { x: SN_X, y: GROUND - 52 * SN_S }  // the middle of Snorlax (what the blob wraps and what the beam pulls up)
const BALL_S = 0.9
const BALL_R = 4.5 * BALL_S
const ASH_GRIP = ASH_BODY.grip              // where the ball sits in the near hand (the forearm's frame)
const IMPACT = { x: SN_X - 62, y: GROUND - 44 }   // where the ball strikes Snorlax: its near flank, a clear diagonal from the hand
const HOVER = { x: SN_X - 34, y: 19 }   // where it ricochets to and opens: a little left of, and above, the head (ear tips at y ≈ 33)

/* timeline (seconds) */
const T_REL = 4.3, T_HIT = 4.95, T_OPEN = 5.4, T_BLOB0 = 5.5, T_ENV = 5.9, T_PULL0 = 6.4, T_PULL1 = 6.95
const T_CLOSE0 = 6.9, T_CLOSE1 = 7.05, T_FALL = 7.2, T_CLICK = 9.9
const FALL_T = 0.55                     // the drop from the hover point to the grass

const kf = (t: number) => +(t / DUR).toFixed(4)
type Pts = [number, number][]
function lerpAt(pts: Pts, t: number) {
    if (t <= pts[0][0]) return pts[0][1]
    for (let i = 1; i < pts.length; i++) {
        const [t1, v1] = pts[i]
        if (t <= t1) {
            const [t0, v0] = pts[i - 1]
            return v0 + ((v1 - v0) * (t - t0)) / (t1 - t0 || 1)
        }
    }
    return pts[pts.length - 1][1]
}
const uniq = (ts: number[]) => Array.from(new Set(ts.map(t => +t.toFixed(2)))).sort((a, b) => a - b)
const keyTimes = (ts: number[]) => ts.map(kf).join(';')
const sample = (pts: Pts, ts: number[]) => ts.map(t => +lerpAt(pts, t).toFixed(2))

/** opacity on the shared clock */
function Fade({ pts, children }: { pts: Pts; children: ReactNode }) {
    const ts = uniq(pts.map(p => p[0]))
    return (
        <g opacity={lerpAt(pts, 0)}>
            <animate attributeName="opacity" dur={`${PLAY}s`} repeatCount="indefinite" keyTimes={keyTimes(ts)} values={sample(pts, ts).join(';')} />
            {children}
        </g>
    )
}
/** translate on the shared clock (x and y given as separate piecewise curves) */
function Move({ x, y = [[0, 0], [DUR, 0]], children }: { x: Pts; y?: Pts; children: ReactNode }) {
    const ts = uniq([...x.map(p => p[0]), ...y.map(p => p[0])])
    const xs = sample(x, ts), ys = sample(y, ts)
    return (
        <g transform={`translate(${xs[0]} ${ys[0]})`}>
            <animateTransform attributeName="transform" type="translate" dur={`${PLAY}s`} repeatCount="indefinite" keyTimes={keyTimes(ts)} values={ts.map((_, i) => `${xs[i]} ${ys[i]}`).join(';')} />
            {children}
        </g>
    )
}
/** uniform scale (about the local origin) on the shared clock */
function Zoom({ pts, children }: { pts: Pts; children: ReactNode }) {
    const ts = uniq(pts.map(p => p[0]))
    return (
        <g transform={`scale(${lerpAt(pts, 0)})`}>
            <animateTransform attributeName="transform" type="scale" dur={`${PLAY}s`} repeatCount="indefinite" keyTimes={keyTimes(ts)} values={sample(pts, ts).join(';')} />
            {children}
        </g>
    )
}

/* ── Ash's gait and throw ───────────────────────────────────────────────── */
/* walking: five steps, half a stride every 0.3 s, from 0.4 to 3.4 s */
const STEPS = Array.from({ length: 9 }, (_, i) => +(0.7 + i * 0.3).toFixed(2))      // 0.7 … 3.1
const gait: Pts = [[0, 0], [0.4, 0], ...STEPS.map((t, i) => [t, i % 2 ? -24 : 24] as [number, number]), [3.4, 0]]
const scaled = (pts: Pts, k: number): Pts => pts.map(([t, v]) => [t, v * k])

/* legs: planted while he winds up; at the throw the far foot steps in and the near one stays back, held until the line is over */
const legA: Pts = [...gait, [3.9, 0], [4.28, -22], [7.0, -22], [7.8, 0], [DUR, 0]]
const legB: Pts = [...scaled(gait, -1), [3.9, 0], [4.28, 14], [7.0, 14], [7.8, 0], [DUR, 0]]

/* the throwing (near) arm. Shoulder angle: 0 hangs, − swings forward, + back, 180 straight up.
 *   3.55 ball lifted ahead → 3.85 cocked: upper arm back and a little up, forearm straight up, ball behind the head
 *   → 4.0 the elbow leads (upper arm comes up and over while the forearm lags) → 4.3 release: arm straight, 45° up and forward
 *   → follow-through down across the body → hangs.  The elbow angle is relative to the upper arm.
 *   After the click (9.9) the same arm comes up and out in front (235° = up and forward) and the forearm swings side to side — a wave —
 *   until 15.5, then drops. */
const WAVE_T = Array.from({ length: 20 }, (_, i) => +(10.3 + i * 0.25).toFixed(2))   // 10.3 … 15.05
const armA: Pts = [
    ...scaled(gait, 0.55), [3.55, -35], [3.85, 105], [3.98, 108], [4.12, 175], [4.22, 214], [T_REL, 228],
    [4.45, 290], [4.65, 335], [5.2, 352], [5.8, 360], [T_CLICK, 360], [10.3, 235], [15.4, 235], [16.1, 360], [DUR, 360],
]
const foreA: Pts = [
    [0, -10], [3.4, -10], [3.55, -70], [3.85, 75], [3.98, 78], [4.12, 60], [4.22, 25], [T_REL, 0],
    [4.45, -25], [4.65, -30], [5.2, -14], [5.8, -10], [T_CLICK, -10],
    ...WAVE_T.map((t, i) => [t, i % 2 ? 10 : -48] as [number, number]), [15.5, -48], [16.1, -10], [DUR, -10],
]
/* the far arm: swings in the stride, points at Snorlax while he aims, then hangs */
const armB: Pts = [...scaled(gait, -0.55), [3.55, 0], [3.95, -75], [4.5, -60], [5.2, -5], [5.7, 0], [DUR, 0]]
const foreB: Pts = [[0, -10], [3.4, -10], [3.95, -5], [5.2, -10], [DUR, -10]]
/* the whole upper body: leans back into the wind-up, then tips forward through the release */
const lean: Pts = [[0, 0], [3.4, 0], [3.55, -2], [3.9, -9], [4.0, -9], [4.2, 5], [4.35, 10], [5.2, 2], [5.8, 0], [DUR, 0]]

const TIMES = uniq([...legA, ...legB, ...armA, ...foreA, ...armB, ...foreB, ...lean].map(p => p[0]))
const ASH_ANIM: AshAnim = {
    dur: PLAY,
    times: TIMES.map(kf),
    legA: sample(legA, TIMES), legB: sample(legB, TIMES),
    armA: sample(armA, TIMES), foreA: sample(foreA, TIMES),
    armB: sample(armB, TIMES), foreB: sample(foreB, TIMES),
    lean: sample(lean, TIMES),
}
/* body bob while walking: up on every mid-step */
const BOB: Pts = [[0, 0], [0.4, 0], ...Array.from({ length: 10 }, (_, i) => [0.55 + i * 0.3, -1.4] as [number, number]).flatMap(([t, v]) => [[t, v], [+(t + 0.15).toFixed(2), 0]] as Pts), [DUR, 0]]
const BLINK_T = uniq([0, 2.2, 2.3, 2.4, 8.6, 8.7, 8.8, DUR])
const BLINK = { dur: PLAY, times: BLINK_T.map(kf), scales: [1, 1, 0.1, 1, 1, 0.1, 1, 1] }

/* where the ball is the instant it leaves the hand: the same joint chain Ash draws, read at T_REL, then placed in the world */
const [HX, HY] = ashGrip(lerpAt(armA, T_REL), lerpAt(foreA, T_REL), lerpAt(lean, T_REL))
const RELEASE = { x: ASH_X + HX, y: GROUND + HY }
/** the ball's path, in the world: a straight diagonal from the hand into the fox, a short ricochet up to the hover point, then — after the
 *  catch — a fall to the grass, a bounce, a smaller one, and rest */
const DROP = GROUND - BALL_R - HOVER.y
const fall = (t0: number, dur: number, h: number, n = 7): Pts => Array.from({ length: n + 1 }, (_, i) => [+(t0 + (i / n) * dur).toFixed(3), +(h * (i / n) ** 2).toFixed(2)] as [number, number])
const bounce = (t0: number, dur: number, base: number, rise: number, n = 6): Pts => Array.from({ length: n + 1 }, (_, i) => { const u = i / n; return [+(t0 + u * dur).toFixed(3), +(base - rise * 4 * u * (1 - u)).toFixed(2)] as [number, number] })
const REB_N = 8
const rebound = (from: number, to: number, lift: number): Pts => Array.from({ length: REB_N + 1 }, (_, i) => {
    const u = i / REB_N
    return [+(T_HIT + u * (T_OPEN - T_HIT)).toFixed(3), +(from + (to - from) * u - lift * 4 * u * (1 - u)).toFixed(2)] as [number, number]
})
const BALL_X: Pts = [[0, RELEASE.x], [T_REL, RELEASE.x], [T_HIT, IMPACT.x], ...rebound(IMPACT.x, HOVER.x, 0).slice(1), [DUR, HOVER.x]]
const BALL_Y: Pts = [
    [0, RELEASE.y], [T_REL, RELEASE.y], [T_HIT, IMPACT.y], ...rebound(IMPACT.y, HOVER.y, 14).slice(1), [T_FALL, HOVER.y],
    ...fall(T_FALL, FALL_T, DROP).slice(1).map(([t, v]) => [t, HOVER.y + v] as [number, number]),
    ...bounce(T_FALL + FALL_T, 0.34, DROP, 12).slice(1).map(([t, v]) => [t, HOVER.y + v] as [number, number]),
    ...bounce(T_FALL + FALL_T + 0.34, 0.16, DROP, 3, 4).slice(1).map(([t, v]) => [t, HOVER.y + v] as [number, number]),
    [DUR, HOVER.y + DROP],
]

/** a short flash: soft glow, an expanding ring and a four-point cross, all centred on (x, y) */
function Burst({ x, y, t0, r, tint }: { x: number; y: number; t0: number; r: number; tint?: string }) {
    const ts = [0, t0, t0 + 0.1, t0 + 0.55, DUR]
    const k = keyTimes(ts)
    const anim = (attr: string, v: (string | number)[]) => (
        <animate attributeName={attr} dur={`${PLAY}s`} repeatCount="indefinite" keyTimes={k} values={v.join(';')} />
    )
    return (
        <g transform={`translate(${x} ${y})`}>
            <circle r={r * 0.6} {...GLOW} fill={tint ?? GLOW.fill} opacity={0}>{anim('opacity', [0, 0, 0.7, 0, 0])}</circle>
            <circle r={2} {...L} strokeWidth={1.1} opacity={0}>{anim('r', [2, 2, 3, r, r])}{anim('opacity', [0, 0, 0.9, 0, 0])}</circle>
            <g opacity={0}>
                {anim('opacity', [0, 0, 1, 0, 0])}
                <g>
                    <animateTransform attributeName="transform" type="scale" dur={`${PLAY}s`} repeatCount="indefinite" keyTimes={k} values={`0.3;0.3;0.8;${(r / 9).toFixed(2)};${(r / 9).toFixed(2)}`} />
                    <path d="M-9 0 H9 M0 -9 V9 M-5.6 -5.6 L5.6 5.6 M-5.6 5.6 L5.6 -5.6" {...L} strokeWidth={1.1} />
                </g>
            </g>
        </g>
    )
}

/** the speech bubbles, in the theme's bubble style (see scenery/bubbleKit): a tail that points down at the speaker's cap. `textLength` pins each
 *  line to its width so the words fit whatever font the site resolves. */
function Bubble({ still = false }: { still?: boolean }) {
    const body = (
        <>
            <BubbleShape x0={222} y0={5} x1={349} y1={31} tail={{ side: 'bottom', at: 284, tip: [286, 40], half: 8 }} />
            <text className="bub-text" x={285.5} y={21.4} textAnchor="middle" fontSize={10} fontFamily="inherit" textLength={112} lengthAdjust="spacingAndGlyphs">Gotta Catch ’Em All!</text>
        </>
    )
    // it appears early in the walk, travels with Ash (he walks 140 → ASH_X between 0.4 and 3.4 s), and lingers through his stop and the wind-up
    return still ? <g>{body}</g> : (
        <Move x={[[0, 140 - ASH_X], [0.4, 140 - ASH_X], [3.4, 0], [DUR, 0]]}>
            <Fade pts={[[0, 0], [1.0, 0], [1.2, 1], [4.7, 1], [4.95, 0], [DUR, 0]]}>{body}</Fade>
        </Move>
    )
}
/** after the catch, while Ash waves: two separate bubbles, one after the other (the second wraps onto two lines) */
function Bubble2() {
    return (
        <Fade pts={[[0, 0], [T_CLICK + 0.1, 0], [T_CLICK + 0.3, 1], [11.8, 1], [11.95, 0], [DUR, 0]]}>
            <BubbleShape x0={212} y0={10} x1={384} y1={36} tail={{ side: 'bottom', at: 297, tip: [297, 46], half: 8 }} />
            <text className="bub-text" x={298} y={26.4} textAnchor="middle" fontSize={10} fontFamily="inherit" textLength={148} lengthAdjust="spacingAndGlyphs">Yayyy! I caught a Snorlax!</text>
        </Fade>
    )
}
function Bubble3() {
    return (
        <Fade pts={[[0, 0], [12.7, 0], [12.9, 1], [15.3, 1], [15.5, 0], [DUR, 0]]}>
            <BubbleShape x0={224} y0={2} x1={372} y1={38} tail={{ side: 'bottom', at: 297, tip: [297, 46], half: 8 }} />
            <text className="bub-text" x={298} y={17.2} textAnchor="middle" fontSize={9.4} fontFamily="inherit" textLength={118} lengthAdjust="spacingAndGlyphs">Man, I’m glad we didn’t</text>
            <text className="bub-text" x={298} y={29.6} textAnchor="middle" fontSize={9.4} fontFamily="inherit" textLength={118} lengthAdjust="spacingAndGlyphs">have to carry him home!</text>
        </Fade>
    )
}

/** a closed, smooth blob through `j.length` points around an ellipse (rx × ry), each pushed in or out by its factor */
function blobD(rx: number, ry: number, j: number[]) {
    const n = j.length
    const pts = j.map((k, i): [number, number] => {
        const a = (i / n) * Math.PI * 2 - Math.PI / 2
        return [Math.cos(a) * rx * (1 + k), Math.sin(a) * ry * (1 + k)]
    })
    const f = (v: number) => +v.toFixed(2)
    let d = `M${f(pts[0][0])} ${f(pts[0][1])}`
    for (let i = 0; i < n; i++) {
        const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n]
        d += ` C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`
    }
    return d + ' Z'
}
const BLOB_J = [
    [0.1, -0.08, 0.12, -0.04, 0.09, -0.1, 0.06, -0.06, 0.11, -0.05],
    [-0.07, 0.1, -0.05, 0.12, -0.08, 0.08, -0.09, 0.1, -0.04, 0.09],
    [0.05, 0.04, -0.1, 0.08, 0.1, -0.06, 0.12, -0.04, -0.08, 0.06],
]
const morph = (rx: number, ry: number, off = 0) => [0, 1, 2, 0].map(i => blobD(rx, ry, BLOB_J[(i + off) % 3])).join(';')

/** The capture light is ONE thing: a blob of red beam that leaves the open ball, travels down onto the fox, swells and wraps it, holds
 *  (wobbling and morphing, a bright inner glow, a highlight, a few swirling sparks), then is drawn back up into the ball, shrinking.
 *  Its path (`BLOB_X/Y`) is shared with the thin ray that keeps it tied to the ball, so the two can never disagree. */
const BLOB_RX = 82, BLOB_RY = 62
const BLOB_X: Pts = [[0, HOVER.x], [T_BLOB0, HOVER.x], [T_ENV, SN_C.x], [T_PULL0, SN_C.x], [T_PULL1, HOVER.x], [DUR, HOVER.x]]
const BLOB_Y: Pts = [[0, HOVER.y + 2], [T_BLOB0, HOVER.y + 2], [T_ENV, SN_C.y], [T_PULL0, SN_C.y], [T_PULL1, HOVER.y + 2], [DUR, HOVER.y + 2]]
const BLOB_ON: Pts = [[0, 0], [T_BLOB0 - 0.01, 0], [T_BLOB0, 1], [T_PULL1 - 0.05, 1], [T_PULL1 + 0.1, 0], [DUR, 0]]

function RedBlob() {
    const sparks = [[0, 3], [72, 2.2], [144, 3.4], [216, 2.4], [288, 3.2]]
    return (
        <Move x={BLOB_X} y={BLOB_Y}>
            <Fade pts={BLOB_ON}>
                <Zoom pts={[[0, 0.02], [T_BLOB0, 0.02], [T_ENV, 0.85], [T_ENV + 0.15, 1.12], [T_ENV + 0.3, 0.98], [T_ENV + 0.42, 1.03], [T_PULL0, 1], [T_PULL1, 0.05], [DUR, 0.05]]}>
                    <path d={blobD(BLOB_RX, BLOB_RY, BLOB_J[0])} fill={BALL_RED} fillOpacity={0.44} stroke={BALL_RED_DK} strokeWidth={1.4} strokeLinejoin="round" strokeOpacity={0.9}>
                        <animate attributeName="d" dur="1.2s" repeatCount="indefinite" values={morph(BLOB_RX, BLOB_RY)} />
                    </path>
                    <path d={blobD(BLOB_RX * 0.7, BLOB_RY * 0.68, BLOB_J[1])} fill={BALL_RED_LT} fillOpacity={0.36}>
                        <animate attributeName="d" dur="0.9s" repeatCount="indefinite" values={morph(BLOB_RX * 0.7, BLOB_RY * 0.68, 1)} />
                    </path>
                    <ellipse cx={-28} cy={-22} rx={15} ry={5.4} transform="rotate(-24 -28 -22)" fill="#fff" opacity={0.4} />
                    <g transform={`scale(1 ${(BLOB_RY / BLOB_RX).toFixed(3)})`}>
                        <animateTransform attributeName="transform" type="rotate" dur="1.8s" repeatCount="indefinite" values="0;360" additive="sum" />
                        {sparks.map(([a, r], i) => (
                            <circle key={i} cx={Math.round(Math.cos((a * Math.PI) / 180) * 74 * 1000) / 1000}
                                    cy={Math.round(Math.sin((a * Math.PI) / 180) * 74 * 1000) / 1000}
                                    r={r}
                                    fill={BALL_RED_LT}
                                    stroke={BALL_RED_DK}
                                    strokeWidth={0.5}
                            />
                        ))}
                    </g>
                </Zoom>
            </Fade>
        </Move>
    )
}

/** the single ray from the ball's mouth to the blob's centre; its far end rides the blob, so it stretches out, holds, and reels back in */
function Ray() {
    const ts = uniq([...BLOB_X.map(p => p[0]), ...BLOB_Y.map(p => p[0])])
    const bx = sample(BLOB_X, ts), by = sample(BLOB_Y, ts)
    const k = keyTimes(ts)
    const ends = (
        <>
            <animate attributeName="x2" dur={`${PLAY}s`} repeatCount="indefinite" keyTimes={k} values={bx.join(';')} />
            <animate attributeName="y2" dur={`${PLAY}s`} repeatCount="indefinite" keyTimes={k} values={by.join(';')} />
        </>
    )
    return (
        <Fade pts={BLOB_ON}>
            <line x1={HOVER.x} y1={HOVER.y + 2} x2={bx[0]} y2={by[0]} stroke={BALL_RED} strokeOpacity={0.5} strokeWidth={3.4} strokeLinecap="round">{ends}</line>
            <line x1={HOVER.x} y1={HOVER.y + 2} x2={bx[0]} y2={by[0]} stroke={BALL_RED_LT} strokeOpacity={0.85} strokeWidth={1.1} strokeLinecap="round">{ends}</line>
        </Fade>
    )
}

/** Depth, back to front: faded sky furniture (clouds and birds, including a few in the centre) → hills → a FAR row of small trees high on the ridge (faded into the haze) → a MID row →
 *  the rock outcrop → the big FRONT trees at the edges (they overlap the rock and the mid row) → grass-level detail → the characters.
 *  The front trees stand well above Ash (89): pines ≈ 130, round trees ≈ 108; tall trees stay clear of the speech bubbles (x 168–428,
 *  y < 46) and of the z's above Snorlax, and nothing in front of the characters' feet sits on their path (x 135–305, 415–560). */
function Sky() {
    return (
        <>
            <SkyCloud x={286} y={14} s={0.4} o={0.8} drift driftClass="scene-cloud--b" />
            <SkyCloud x={590} y={38} s={0.36} o={0.8} drift driftClass="scene-cloud--b" />
            {/* centre sky: three clouds of different sizes and a loose flock of birds, kept off the ball's flight and the hover point */}
            <SkyCloud x={392} y={20} s={0.55} o={0.85} drift driftClass="scene-cloud--b" />
            <SkyCloud x={338} y={43} s={0.27} o={0.75} drift />
            <SkyCloud x={462} y={15} s={0.34} o={0.8} drift />
            <Bird x={352} y={26} s={0.62} className="scene-fly" />
            <Bird x={376} y={35} s={0.42} className="scene-fly" />
            <Bird x={398} y={47} s={0.3} className="scene-fly" />
            <Bird x={598} y={12} s={0.5} className="scene-fly" />
            <Bird x={620} y={22} s={0.38} className="scene-fly" />
        </>
    )
}

/** A natural treeline: trees march along the ridge at uneven spacing, each a different size, mostly pines with round trees mixed in and
 *  the baseline wobbling a little. Seeded (integer LCG, values rounded) so the server and the browser draw exactly the same forest.
 *  Returns [kind, x, base y, scale]; p = pine, r = round tree. */
function treeline(seed: number, x0: number, x1: number, step: number, spread: number, y: number, wobble: number, sMin: number, sMax: number, pines: number): ['p' | 'r', number, number, number][] {
    let a = seed
    const rnd = () => { a = (a * 1664525 + 1013904223) % 4294967296; return a / 4294967296 }
    const r2 = (v: number) => Math.round(v * 100) / 100
    const out: ['p' | 'r', number, number, number][] = []
    for (let x = x0; x < x1; x += step + (rnd() - 0.5) * 2 * spread) {
        out.push([rnd() < pines ? 'p' : 'r', r2(x), r2(y + (rnd() - 0.5) * 2 * wobble), r2(sMin + rnd() * (sMax - sMin))])
    }
    return out
}
const FAR_ROW = treeline(7, -6, 790, 26, 8, 121, 2, 0.22, 0.34, 0.75)     // tiny, hazy, packed close — trees on the far ridge
const NEAR_ROW = treeline(23, 4, 790, 46, 12, 127, 2, 0.36, 0.54, 0.62)   // small, a little clearer — the next ridge
type Tree = ['p' | 'r', number, number, number]
/** Meadow trees: they stand on the same grass as Ash (his feet are at y = 138), so they are drawn at a real tree's size against him —
 *  Ash is 89 tall, a pine at s = 1 is 84, so the front pines (s = 1.62, ≈ 136) are ≈ 1.5 × Ash and fill the strip's height without being cut off.
 *  Only the ridge rows above are small. These are the ones set a little back from the front: a medium pine behind Ash's path and one
 *  small round tree far off in the middle, so the centre is not bare. */
const MID_TREES: Tree[] = [
    ['p', 214, 131, 1.45], ['r', 380, 127, 0.9],
]
/** The boulder Snorlax rests its head on (x = SN_X + 6, s = 1, ~ −43 … 127 wide, 97 tall, base at y = GROUND − 9), and a small one beside it.
 *  A tree drawn BEHIND it must stand further back than its base — trunk foot at or above the boulder's base line — or the trunk shows
 *  underneath the rock. So back trees whose trunk is under the rock are lifted to just above the base line. */
const BOULDER = { x: SN_X + 6, s: 1, y: GROUND - 9 }
const BOULDER_X0 = BOULDER.x - 43 * BOULDER.s, BOULDER_X1 = BOULDER.x + 127 * BOULDER.s, BOULDER_BASE = BOULDER.y
const behindRock = (list: Tree[]) =>
    list.map(([k, x, y, sc]): Tree => (x > BOULDER_X0 - 2 && x < BOULDER_X1 + 2 && y > BOULDER_BASE - 2 ? [k, x, BOULDER_BASE - 2.5, sc] : [k, x, y, sc]))
/** the big front trees frame the scene: a tall pine and a round tree on each side, sized to fit the strip's height. */
const FRONT_TREES: Tree[] = [
    ['p', 30, 142, 1.62], ['r', 100, 140, 1.5],
    ['r', 690, 140, 1.5], ['p', 752, 142, 1.62],
]
/** in the project-page footer the strip is not clipped (the sky is above it), so there the trees are capped to stay near the strip's height */
const FOOTER_CAP = 2
function Trees({ layer, footer = false }: { layer: 'back' | 'front'; footer?: boolean }) {
    const cap = (sc: number) => (footer ? Math.min(sc, FOOTER_CAP) : sc)
    const draw = (list: Tree[]) => list.map(([k, x, y, sc], i) => (k === 'p' ? <Pine key={i} x={x} y={y} s={cap(sc)} /> : <RoundTree key={i} x={x} y={y} s={cap(sc)} />))
    if (layer === 'front') return <>{draw(FRONT_TREES)}</>
    // each row is faded as ONE flat layer (group opacity), so overlapping trees in a row don't show through one another
    return (
        <>
            <g opacity={0.55}>{draw(FAR_ROW)}</g>
            <MistBand y={121} w={780} h={14} o={0.4} />
            <g opacity={0.8}>{draw(behindRock(NEAR_ROW))}</g>
            <g opacity={0.95}>{draw(behindRock(MID_TREES))}</g>
        </>
    )
}

/** the rock Snorlax leans on, plus a smaller one beside it (drawn before the front trees) */
function Boulders() {
    return (
        <>
            <Boulder x={BOULDER.x} y={BOULDER.y} s={BOULDER.s} />
            <Boulder x={SN_X + 178} y={GROUND - 3} s={0.46} />
        </>
    )
}

/** Grass-level detail: small far flowers (behind the characters), then a foreground of flowers, stones, ferns, mushrooms and a
 *  cairn on the centre line — plus two butterflies (kept out of the way of the trees and the characters). */
function Ground() {
    // Nothing here sits on anything else: the flowers keep clear of the tree trunks (x ≈ 30, 100, 214, 380, 690, 752), both boulders
    // (x 447 – 720), Snorlax and each other; the other ground items are spaced so no two touch.
    // Depth: a flower's size follows its row (nearer = lower on the strip = bigger), the rows are scattered rather than lined up, and each
    // group is drawn back to front. Behind the characters the flowers keep to the meadow gaps (y 127 – 137) between the trunks, the cairn
    // and the rocks; in front of everything they sit at the edges, away from Snorlax's feet and Ash's path.
    const fl = (x: number, y: number): [number, number, number] => [x, y, +(0.24 + (y - 126) * 0.0105).toFixed(2)]
    const byY = (l: [number, number, number][]) => [...l].sort((p, q) => p[1] - q[1])
    const far = byY([fl(148, 133), fl(166, 127), fl(196, 136), fl(238, 129), fl(260, 137), fl(304, 134), fl(336, 128), fl(352, 136), fl(368, 130)])
    const near = byY([fl(76, 141), fl(90, 148), fl(352, 146), fl(538, 144), fl(556, 149), fl(646, 149), fl(738, 147), fl(766, 148), fl(776, 143)])
    return (
        <>
            {far.map(([x, y, sc]) => <Flower key={`f${x}`} x={x} y={y} s={sc} />)}
            <Butterfly x={246} y={104} s={0.7} delay={0} drift="a" />
            <Butterfly x={364} y={118} s={0.7} delay={3} drift="b" />
            <Rock x={8} y={150} s={0.9} />
            <Mushrooms x={52} y={150} s={0.5} />
            <Fern x={126} y={148} s={0.55} />
            <Rock x={322} y={148} s={0.8} />
            <Cairn x={392} y={147} s={0.6} />
            <Rock x={414} y={149} s={0.55} />
            <Rock x={590} y={148} s={1.1} />
            <Rock x={628} y={150} s={0.6} />
            <Fern x={668} y={148} s={0.5} />
            <Mushrooms x={712} y={149} s={0.5} />
            {near.map(([x, y, sc]) => <Flower key={`n${x}`} x={x} y={y} s={sc} />)}
        </>
    )
}

/** Snorlax, drawn around its own centre (its seat is 52 below) so the blob can shrink and lift it from there */
const SnorlaxCentred = () => <Snorlax y={GROUND - SN_C.y} s={SN_S} breathe zzz />

/** FOOTER mode (project pages): the match is not a card any more — it is the ground of the closing scene. The sky is drawn in THIS strip's own
 *  coordinates, in the headroom above it (y < 0; the svg is overflow-visible there), so the sky and the match are one drawing, scale together
 *  and can never drift apart. Nature: a sun, a drifting cloud bank, birds and a far ridge that the treeline grows out of. */
function FooterSkyNature() {
    return (
        <>
            {/* the sky itself is FooterSky (a separate layer, anchored to the top of the footer); here is just the horizon:
                the far ridge the treeline grows out of, and a band of mist where they meet */}
            <path d="M0 118 C70 88 150 98 250 90 S470 80 580 92 S730 84 780 90 V130 H0 Z" className="sc-far" opacity={0.55} />
            <MistBand y={96} w={780} h={14} o={0.45} />
        </>
    )
}
/** Space horizon: a haze that lifts the sky toward the horizon so the stands sit IN the sky, and a far lunar ridge rising behind them. */
function FooterSkySpace() {
    return (
        <>
            {/* stars, aurora, nebula, planets: FooterSky. Here: the haze that lifts the sky toward the horizon, and the far lunar ridge behind the stands */}
            <defs>
                <linearGradient id="pf-haze" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" style={{ stopColor: 'var(--sc-glow)', stopOpacity: 0 }} />
                    <stop offset="1" style={{ stopColor: 'var(--sc-glow)', stopOpacity: 0.2 }} />
                </linearGradient>
            </defs>
            <rect x={0} y={-30} width={780} height={110} fill="url(#pf-haze)" />
            <path d="M0 52 C40 34 80 30 120 42 S240 62 390 60 S650 44 700 32 S760 34 780 44 V100 H0 Z" className="sc-far" opacity={0.9} />
        </>
    )
}

function CatchScene({ reduce, footer = false }: { reduce: boolean; footer?: boolean }) {
    const mouse = <Pikachu x={-6} y={-62} s={0.74} blink={reduce ? undefined : BLINK} />
    if (reduce) {
        // the still frame: the wind-up
        return (
            <>
                {footer ? <FooterSkyNature /> : <Sky />}
                <Hills wide dy={50} />
                <Trees layer="back" footer={footer} />
                <Boulders />
                <Trees layer="front" footer={footer} />
                <Ground />
                <Ash
                    x={ASH_X} y={GROUND}
                    pose={{ legA: -10, legB: 8, armA: 105, foreA: 75, armB: -62, foreB: -5, lean: -9 }}
                    hand={<Ball x={ASH_GRIP[0]} y={ASH_GRIP[1]} s={BALL_S} />}
                    mouse={mouse}
                />
                <Snorlax x={SN_X} y={GROUND} s={SN_S} zzz="still" />
                <Bubble still />
            </>
        )
    }
    const hop: Pts = [[0, 0], [T_CLOSE0, 0], [T_CLOSE0 + 0.1, -4.5], [T_CLOSE0 + 0.25, 0], [T_CLICK - 0.05, 0], [T_CLICK + 0.05, -6], [T_CLICK + 0.23, 0], [T_CLICK + 0.35, -4], [T_CLICK + 0.5, 0], [DUR, 0]]
    const hopTs = uniq(hop.map(p => p[0]))
    const rot: Pts = [[0, 0], [T_REL, 0], [T_HIT, 540], [T_OPEN, 720], [8.4, 720], [8.65, 740], [9.0, 700], [9.3, 733], [9.6, 708], [T_CLICK - 0.05, 720], [DUR, 720]]
    const rotTs = uniq(rot.map(p => p[0]))
    const cap: Pts = [[0, 0], [T_OPEN, 0], [T_OPEN + 0.15, -58], [T_CLOSE0, -58], [T_CLOSE1, 0], [DUR, 0]]
    const capTs = uniq(cap.map(p => p[0]))
    return (
        <>
            {footer ? <FooterSkyNature /> : <Sky />}
            <Hills wide dy={50} />
            <Trees layer="back" footer={footer} />
            <Boulders />
            <Trees layer="front" footer={footer} />
            <Ground />
            <Fade pts={[[0, 0], [0.35, 1], [15.9, 1], [16.6, 0], [DUR, 0]]}>
                {/* Snorlax: sleeps (breathing, z's rising) with its head on the boulder behind it; flinches when the ball hits its flank (4.95 s); wrapped by the blob at 5.9 s, then drawn up with it into the ball (it shrinks about its own centre) */}
                <Move
                    x={[[0, SN_C.x], [T_PULL0, SN_C.x], [T_PULL1, HOVER.x], [DUR, HOVER.x]]}
                    y={[[0, SN_C.y], [T_HIT, SN_C.y], [T_HIT + 0.07, SN_C.y - 3], [T_HIT + 0.2, SN_C.y], [T_PULL0, SN_C.y], [T_PULL1, HOVER.y + 2], [DUR, HOVER.y + 2]]}
                >
                    <Fade pts={[[0, 1], [T_PULL1 - 0.1, 1], [T_PULL1, 0], [DUR, 0]]}>
                        <Zoom pts={[[0, 1], [T_PULL0, 1], [T_PULL1, 0.05], [DUR, 0.05]]}>
                            <SnorlaxCentred />
                        </Zoom>
                    </Fade>
                </Move>

                {/* Ash walks in, bobbing; his joints run on the same clock; the ball is in his hand until the release; the mouse hops at the catch and the click */}
                <Move x={[[0, 140], [0.4, 140], [3.4, ASH_X], [DUR, ASH_X]]} y={[[0, GROUND], [DUR, GROUND]]}>
                    <Move x={[[0, 0], [DUR, 0]]} y={BOB}>
                        <Ash
                            anim={ASH_ANIM}
                            hand={
                                <Fade pts={[[0, 1], [T_REL - 0.01, 1], [T_REL, 0], [DUR, 0]]}>
                                    <Ball x={ASH_GRIP[0]} y={ASH_GRIP[1]} s={BALL_S} />
                                </Fade>
                            }
                            mouse={
                                <g>
                                    <animateTransform attributeName="transform" type="translate" dur={`${PLAY}s`} repeatCount="indefinite"
                                                      keyTimes={keyTimes(hopTs)} values={sample(hop, hopTs).map(y => `0 ${y}`).join(';')} />
                                    {mouse}
                                </g>
                            }
                        />
                    </Move>
                </Move>

                <Ray />
                <RedBlob />

                {/* the ball: leaves the hand at 4.3 s and flies a straight diagonal into the fox, ricochets up to hover, opens, closes on the catch, drops, wobbles, clicks */}
                <Fade pts={[[0, 0], [T_REL - 0.01, 0], [T_REL, 1], [DUR, 1]]}>
                    <Move x={BALL_X} y={BALL_Y}>
                        <g>
                            <animateTransform attributeName="transform" type="rotate" dur={`${PLAY}s`} repeatCount="indefinite"
                                              keyTimes={keyTimes(rotTs)} values={sample(rot, rotTs).join(';')} />
                            <Ball s={BALL_S} cap={{ dur: PLAY, times: capTs.map(kf), angles: sample(cap, capTs) }} />
                        </g>
                    </Move>
                </Fade>
                <Burst x={IMPACT.x} y={IMPACT.y} t0={T_HIT} r={11} />
                <Burst x={HOVER.x} y={HOVER.y} t0={T_OPEN} r={11} tint={BALL_RED_LT} />
                <Burst x={HOVER.x} y={HOVER.y} t0={T_PULL1} r={8} tint={BALL_RED_LT} />
                <Burst x={HOVER.x} y={GROUND - BALL_R} t0={T_CLICK} r={9} />
                <Bubble />
                <Bubble2 />
                <Bubble3 />
            </Fade>
        </>
    )
}

export default function AboutStripScene({ kind, wide = false, float = false, footer = false }: { kind: ArtKind; wide?: boolean; float?: boolean; footer?: boolean }) {
    // Every wide section strip (Catch / Inspiration / Sports) is 780 × 150 (matching .card-art in scenery-postcards.css);
    // card art is a 360×100 postcard. The Inspiration and Sports scenes were drawn for a 100-tall frame, so they are
    // lowered by LIFT to keep the ground on the bottom edge; the 50 units that opens up above is sky headroom.
    const full = kind === 'catch' || kind === 'hackathons'   // drawn in the whole 780 × 150 frame, not the lifted 100-tall one
    const vb = full || wide ? '0 0 780 150' : '0 0 360 100'
    const LIFT = !full && wide ? 50 : 0
    const lift = LIFT ? `translate(0 ${LIFT})` : undefined
    const reduce = useReducedMotion()
    const rootRef = useRef<HTMLDivElement>(null)
    useScenePlayback(rootRef)   // pauses the animations while the strip is off-screen
    return (
        <div ref={rootRef} className={`card-art card-art--${kind}${float ? ' card-art--float' : ''}${footer ? ' card-art--footer' : ''}`} aria-hidden="true">
            <svg viewBox={vb} preserveAspectRatio="xMidYMax meet" style={{ color: 'var(--sc-line)' }}>
                {/* ───────── NATURE ───────── */}
                <g className="scene-nature">
                    <g transform={lift}>
                        {kind === 'catch' && <CatchScene reduce={reduce} footer={footer} />}
                        {kind === 'sky' && (
                            <>
                                <Hills wide={wide} />
                                <SkyTrees />
                                <Fireflies still={reduce} />
                            </>
                        )}
                        {kind === 'sports' && (
                            <>
                                {/* sky: tiny pale clouds high up (tops kept ≥ 14 below the strip's top edge, none near the side edges so the drift never crops them), mid-size ones below, two small flocks — all clear of the ball's two arcs (x ≈ 140–215 going up,
                                    x ≈ 610–750 coming down onto the Sun), of the players' jumps and of the Taekwondo kick */}
                                <SkyCloud x={30} y={-26} s={0.3} o={0.6} drift driftClass="scene-cloud--b" />
                                <SkyCloud x={292} y={-23} s={0.28} o={0.55} drift />
                                <SkyCloud x={420} y={-27} s={0.3} o={0.6} drift driftClass="scene-cloud--b" />
                                <SkyCloud x={530} y={-24} s={0.3} o={0.55} drift />
                                <SkyCloud x={88} y={-10} s={0.56} o={0.82} drift driftClass="scene-cloud--b" />
                                <SkyCloud x={345} y={-18} s={0.58} o={0.86} drift />
                                <SkyCloud x={480} y={-10} s={0.5} o={0.8} drift driftClass="scene-cloud--b" />
                                <Bird x={236} y={-30} s={0.5} className="scene-fly" />
                                <Bird x={256} y={-20} s={0.36} className="scene-fly" />
                                <Bird x={546} y={-20} s={0.5} className="scene-fly" />
                                <Bird x={566} y={-10} s={0.36} className="scene-fly" />
                                <Hills wide={wide} />
                                <Stumps x={84} y={90} swing={!reduce} />
                                <path d="M236 94 H548" {...L} strokeWidth={1} strokeDasharray="7 5" opacity={0.45} />
                                {/* fox v deer: each steps up to the net as the ball comes, jumps to hit it, then drops back */}
                                <Player x={288}><Fox watch s={0.8} /></Player>
                                <Player x={488} dir={-1}><Deer s={0.6} flip play /></Player>
                                <Net x={390} y={92} s={0.8} />
                                <Rally />
                                {/* Taekwondo: a rabbit breaks a board with a front kick */}
                                <Kicker x={594} />
                                <g className="scene-sway"><Pine x={716} y={88} s={0.6} /></g>
                                <g className="scene-sway scene-sway--b"><Pine x={754} y={92} s={0.46} /></g>
                                <Flower x={246} y={97} s={0.45} />
                                <Flower x={526} y={96} s={0.5} />
                                <Flower x={560} y={97} s={0.42} />
                                {/* the shot: the batsman's ball goes up out of the strip and comes back down onto the Sun, which blasts (and the evening falls) */}
                                <CricketShot world="nature" reduce={reduce} />
                            </>
                        )}
                        {kind === 'hackathons' && <HackathonNature reduce={reduce} />}
                    </g>
                </g>

                {/* ───────── SPACE ───────── */}
                <g className="scene-space">
                    {!full && <Stars w={wide ? 780 : 360} h={70 + LIFT} n={wide ? Math.round(46 * (70 + LIFT) / 70) : 22} seed={kind.length * 13} />}
                    <g transform={lift}>
                        {/* Ch.01 Space: a starry sky from the shared parts (stars, a faint nebula, a moon, a ringed planet, the ridge), then the match */}
                        {kind === 'catch' && (
                            <>
                                {footer ? <FooterSkySpace /> : (
                                    <>
                                        {/* the sky, from the shared parts: a soft nebula, stars, and — kept well clear of the scoreboards (their tops are at y ≈ 57) —
                                        a moon and a ringed planet high in the corners, a comet and a satellite in the open sky between the chant bubbles */}
                                        <Aurora x={0} y={2} w={780} h={44} />
                                        <Nebula x={390} y={34} w={640} h={70} />
                                        <Nebula x={120} y={52} w={260} h={50} />
                                        <Stars w={780} h={118} n={70} seed={39} />
                                        <Moon x={44} y={17} r={10} />
                                        <Planet x={742} y={17} r={8} ring tilt={-16} />
                                        <Satellite x={268} y={13} s={0.45} o={0.85} />
                                        <Comet x={512} y={9} r={0} len={46} />
                                        <Sparkle x={330} y={20} delay={0.4} s={0.7} />
                                        <Sparkle x={120} y={10} delay={1.1} s={0.6} />
                                        <Sparkle x={660} y={12} delay={0.8} s={0.7} />
                                    </>
                                )}
                                <Hills wide dy={50} />
                                <QuidditchScene reduce={reduce} />
                            </>
                        )}
                        {kind === 'sky' && (
                            <>
                                <Aurora x={0} y={-30} w={wide ? 780 : 360} h={60} />
                                <Nebula x={600} y={-4} w={420} h={70} />
                                <Nebula x={170} y={14} w={320} h={60} />
                                <g transform="translate(0 -34)"><Constellation /></g>
                                <Moon x={738} y={-18} r={12} />
                                <Planet x={52} y={-14} r={11} ring tilt={-16} />
                                <Comet x={500} y={-40} r={0} len={50} />
                                <Sparkle x={300} y={-26} delay={0.5} s={0.8} />
                                <Sparkle x={560} y={-10} delay={1.2} s={0.7} />
                                {/* the ground, pulled well up so the sky below the stars is not empty; a strip of near ground fills the bottom edge */}
                                <rect x={0} y={80} width={780} height={30} className="sc-mid" />
                                <Hills wide={wide} dy={-6} edge />
                                <Crater x={90} y={96} w={46} o={0.7} />
                                <Crater x={420} y={98} w={60} o={0.7} />
                                <Crater x={690} y={94} w={40} o={0.7} />
                                <Asteroid x={250} y={92} s={0.7} o={0.7} />
                                <Lander x={560} y={90} s={0.8} />
                                <Flag x={600} y={90} s={0.7} />
                            </>
                        )}
                        {kind === 'sports' && (
                            <>
                                <Aurora x={0} y={-6} w={wide ? 780 : 360} h={56} />
                                <Nebula x={wide ? 390 : 180} y={30} w={wide ? 620 : 300} h={64} />
                                {/* more sky, clear of the ball's arcs (x ≈ 140–215 and 610–750): a far ringed planet, a satellite, a comet and a few glints */}
                                <Planet x={60} y={-20} r={7} ring tilt={-20} />
                                <Satellite x={330} y={-22} s={0.5} o={0.85} />
                                <Comet x={440} y={-34} r={0} len={46} />
                                <Sparkle x={250} y={-12} delay={0.4} s={0.7} />
                                <Sparkle x={540} y={-26} delay={1.1} s={0.8} />
                                <Sparkle x={420} y={4} delay={0.7} s={0.6} />
                                <Sparkle x={760} y={-24} delay={1.5} s={0.7} />
                                <Hills wide={wide} />
                                <Crater x={640} y={93} w={60} />
                                <Crater x={228} y={95} w={48} />
                                <Stumps x={84} y={90} swing={!reduce} />
                                <path d="M236 94 H548" {...L} strokeWidth={1} strokeDasharray="7 5" opacity={0.45} />
                                {/* astronaut v alien: same match in low gravity — slower, higher hops, arms thrown up for the hit */}
                                <Player x={298} space><Astronaut s={0.74} volley /></Player>
                                <Player x={476} dir={-1} space><Alien s={0.82} volley /></Player>
                                <Net x={390} y={92} s={0.8} />
                                <Rally space />
                                {/* Taekwondo, in slow motion: a little robot breaks a board */}
                                <Kicker x={594} space />
                                <g className="sp-float"><g className="sp-tumble sp-tumble--slow"><Asteroid x={548} y={14} s={0.9} r={20} /></g></g>
                                {/* the shot: the ball goes up out of the strip and comes back down onto the Moon, which blasts */}
                                <CricketShot world="space" reduce={reduce} />
                            </>
                        )}
                        {kind === 'hackathons' && <HackathonSpace reduce={reduce} />}
                    </g>
                </g>
            </svg>
        </div>
    )
}