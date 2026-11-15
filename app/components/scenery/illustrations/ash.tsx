/** Ash, his mouse and the ball (the "catch" strip). Colours are fixed on purpose so the characters stay recognisable. */
import type { ReactNode } from 'react'
import { DOT, F, L, Limb, P, type PlaceProps } from './core'
import { AshPack, PACK } from './snorlax'

/* ═══════════════════════════════════════════════════════════════════════
      ASH + HIS MOUSE + THE BALL   (the "catch" strip — original drawings of an invented boy and his companion)
      Ash:   a boy in a red-and-white cap, blue-and-white jacket, fingerless gloves and jeans.
      Mouse: small, yellow, brown stripes on the back, red cheeks, long dark-tipped ears, a lightning-bolt tail; rides Ash's shoulder.
      Ball:  a red-and-white capture ball with a belt and a button; the red cap hinges open.
      Scale: Ash is ~89 tall (≈ a 140 cm boy), so a sitting fox at s≈0.5 (≈ 30 tall to the ear tips) is its real size beside him.
      Their colours are fixed on purpose — they are what makes the three recognisable — so, unlike the rest of the library, they are not
      theme tokens. Skin, outline and paper still follow the theme.
═══════════════════════════════════════════════════════════════════════ */
export const BALL_RED = '#d8312f'
export const BALL_RED_DK = '#9e1d26'
export const BALL_RED_LT = '#ff7b70'
const ASH_BLUE = '#2b57b0'
const ASH_JEANS = '#5f88c4'
const ASH_WHITE = '#fbfaf4'
const ASH_HAIR = '#3a2a22'
const ASH_GLOVE = '#2a2930'
const ASH_SHOE = '#fafaf6'
const ASH_SOLE = '#1d1d22'
const MOUSE = '#f7cf3d'
const MOUSE_DK = '#7b4e27'
const MOUSE_TIP = '#2c2420'
const MOUSE_CHEEK = '#e2402f'

/** Where things sit on Ash (his local coordinates, feet at the origin, facing right). The scene reads these to start the
 *  thrown ball exactly where the hand is, so the two can never drift apart. */
export const ASH_BODY = {
    hip: -35,                 // y of the hips: legs and the lean pivot here
    shoulder: [1, -60] as [number, number],
    upper: 12.5,              // upper arm length
    fore: 11.5,               // forearm length
    grip: [0.6, 18.4] as [number, number],   // the ball's centre, in the forearm's frame (origin at the elbow, +y along the forearm)
    head: [1.5, -73.5] as [number, number],
}

/** Keyframes for Ash's joints (degrees; + = clockwise on screen, so a hanging limb swings BACK with +, FORWARD with −).
 *  Near = the throwing arm, nearest the viewer. `lean` tips the whole upper body about the hips (+ = forward).
 *  `times` are 0–1 fractions of `dur`. */
export type AshAnim = {
    dur: number
    times: number[]
    legA: number[]; legB: number[]          // far / near leg, about the hip
    armA: number[]; foreA: number[]         // near arm: shoulder, elbow (elbow angle is relative to the upper arm)
    armB: number[]; foreB: number[]         // far arm
    lean: number[]
}
export type AshPose = Partial<Record<'legA' | 'legB' | 'armA' | 'foreA' | 'armB' | 'foreB' | 'lean', number>>

type Track = keyof Omit<AshAnim, 'dur' | 'times'>

/** A rotating joint: static angle `rest` (reduced motion), or the SMIL track `anim[track]` on the scene's clock. */
function Joint({ anim, track, rest = 0, px = 0, py = 0, children }: {
    anim?: AshAnim; track: Track; rest?: number; px?: number; py?: number; children: ReactNode
}) {
    const a0 = anim ? anim[track][0] : rest
    return (
        <g transform={`rotate(${a0} ${px} ${py})`}>
            {anim && (
                <animateTransform
                    attributeName="transform" type="rotate" repeatCount="indefinite" dur={`${anim.dur}s`}
                    keyTimes={anim.times.join(';')}
                    values={anim[track].map(a => `${a} ${px} ${py}`).join(';')}
                />
            )}
            {children}
        </g>
    )
}

/** Ash, facing right, feet at the origin (~89 tall with the cap). Legs, both arms (shoulder + elbow each) and the lean are
 *  joints that move on the scene's clock when `anim` is given. `hand` is drawn in the near hand (it travels with the
 *  forearm — the ball Ash is about to throw); `mouse` is drawn on his near shoulder, over the back of his head. */
export function Ash({ anim, pose, hand, mouse, ...p }: PlaceProps & { anim?: AshAnim; pose?: AshPose; hand?: ReactNode; mouse?: ReactNode }) {
    const [sx, sy] = ASH_BODY.shoulder
    const hip = ASH_BODY.hip
    const leg = (d: string, x0: number, x1: number, track: 'legA' | 'legB', far: boolean) => (
        <g opacity={far ? 0.9 : 1}>
            <Joint anim={anim} track={track} rest={pose?.[track] ?? 0} py={hip}>
                <Limb d={d} w={6.6} fill={ASH_JEANS} />
                {/* black-and-white sneaker: black sole and outline, white upper, black toe cap */}
                <path d={`M${x0} -2.4 H${x1}`} stroke={ASH_SOLE} strokeWidth={5.6} strokeLinecap="round" fill="none" />
                <path d={`M${x0} -3 H${x1 - 1}`} stroke={ASH_SHOE} strokeWidth={2.6} strokeLinecap="round" fill="none" />
                <path d={`M${x1 - 3} -2.7 H${x1 - 0.6}`} stroke={ASH_SOLE} strokeWidth={3.2} strokeLinecap="round" fill="none" />
                <path d={track === 'legA' ? 'M-4.4 -9.4 H0.6' : 'M0.4 -9.4 H5.4'} {...L} strokeWidth={0.9} opacity={0.45} />
            </Joint>
        </g>
    )
    /** one arm: white sleeve, dark-blue cuff, fingerless glove (bare fingertips), optional thing held in the hand */
    const arm = (track: 'armA' | 'armB', fore: 'foreA' | 'foreB', held?: ReactNode) => (
        <g transform={`translate(${sx} ${sy})`}>
            <Joint anim={anim} track={track} rest={pose?.[track] ?? 0}>
                <Limb d={`M0 0 L0 ${ASH_BODY.upper}`} w={5.6} fill={ASH_WHITE} />
                <g transform={`translate(0 ${ASH_BODY.upper})`}>
                    <Joint anim={anim} track={fore} rest={pose?.[fore] ?? -10}>
                        <Limb d={`M0 0 L0 ${ASH_BODY.fore}`} w={5.2} fill={ASH_WHITE} />
                        <path d="M-2.2 7.6 Q0 8.6 2.2 7.6 L2.3 10 Q0 11 -2.3 10 Z" {...F} fill={ASH_BLUE} strokeWidth={0.9} />
                        {held}
                        {/* glove over the palm and knuckles, three bare fingertips poking out */}
                        <path d="M-3 10.4 Q0 9.6 3 10.4 L3.2 14 Q0 15 -3.2 14 Z" {...F} fill={ASH_GLOVE} strokeWidth={0.9} />
                        <path d="M-2.7 14 q0.9 3 1.8 0 M-0.9 14.2 q0.9 3.2 1.8 0 M0.9 14 q0.9 3 1.8 0" fill="var(--sc-body)" stroke="currentColor" strokeWidth={0.8} strokeLinecap="round" strokeLinejoin="round" />
                    </Joint>
                </g>
            </Joint>
        </g>
    )
    return (
        <P {...p}>
            {leg('M0 -35 L-1.2 -18 L-1.7 -4.4', -1.9, 5.2, 'legA', true)}
            {leg('M0 -35 L1.6 -18 L2.6 -4.4', 2.6, 9.8, 'legB', false)}
            <Joint anim={anim} track="lean" rest={pose?.lean ?? 0} py={hip}>
                {arm('armB', 'foreB')}
                {/* jeans at the hips: drawn OVER the far arm, so the far hand (it hangs at hip height) never shows below the jacket */}
                <path d="M-6.8 -41 L7 -41 L7.4 -33 Q0.2 -30.4 -7 -33 Z" {...F} fill={ASH_JEANS} />
                {/* jacket: blue body, white hem band, collar and zip; the sleeves are white */}
                <path d="M-7.8 -63.6 Q1 -66.8 8.6 -63.6 L9 -39.6 Q0.4 -37 -8.8 -39.6 Z" {...F} fill={ASH_BLUE} />
                <path d="M-7.8 -63.4 L-3.4 -63.9 L-4 -39.2 L-8.8 -39.6 Z" fill="var(--sc-shade)" stroke="none" />
                <AshPack />
                <path d="M-8.7 -43.4 Q0.4 -40.8 8.9 -43.4 L9 -39.6 Q0.4 -37 -8.8 -39.6 Z" {...F} fill={ASH_WHITE} strokeWidth={1} />
                <path d="M-4.6 -65.4 Q1.6 -68.4 7 -65.4 L6.6 -62 Q1.4 -64.6 -4.4 -62 Z" {...F} fill={ASH_WHITE} strokeWidth={1} />
                <path d="M7.5 -62 L7.9 -43.6" stroke={ASH_WHITE} strokeWidth={1.3} strokeLinecap="round" fill="none" />
                <path d="M2.6 -55 H7 V-49.4 H2.6 Z" {...L} strokeWidth={0.8} opacity={0.4} />
                {/* head: ear, hair at the nape, face */}
                <path d="M-5.8 -77 L-9.6 -73.6 L-6 -73.6 L-7.8 -69.2 L-3.4 -71.4 L-3 -75 Z" fill={ASH_HAIR} stroke="currentColor" strokeWidth={0.9} strokeLinejoin="round" />
                <circle cx={1.5} cy={-73.5} r={7.4} fill="var(--sc-body)" stroke="currentColor" strokeWidth={1.2} />
                <path d="M-5.4 -77 Q-6.4 -70 -3 -68.6 L-2.2 -73.6 Q-2 -76 -4 -77.6 Z" fill={ASH_HAIR} stroke="currentColor" strokeWidth={0.9} strokeLinejoin="round" />
                <circle cx={-0.6} cy={-72.6} r={1.5} fill="var(--sc-body)" stroke="currentColor" strokeWidth={0.8} />
                <circle cx={5.4} cy={-74} r={1} {...DOT} />
                <path d="M4 -76.4 q1.6 -0.9 3.2 -0.2" {...L} strokeWidth={0.9} />
                <path d="M8.8 -73.4 q1.4 1.2 0 2.4" {...L} strokeWidth={0.9} />
                <path d="M5 -69.8 q1.8 1.1 3.4 0" {...L} strokeWidth={0.9} />
                {/* cap: red crown, white front panel with a badge, red peak */}
                <path d="M-6.8 -77.4 Q-7.8 -89 1.7 -89.2 Q9.6 -89 8.9 -77.4 Z" {...F} fill={BALL_RED} />
                <path d="M3.4 -88.9 Q9.6 -88 8.9 -77.4 L3.6 -77.9 Q5 -83.4 3.4 -88.9 Z" {...F} fill={ASH_WHITE} strokeWidth={1} />
                <circle cx={6.2} cy={-83} r={1.9} fill={PACK} stroke="currentColor" strokeWidth={0.8} />
                <circle cx={1.7} cy={-89} r={1} fill={BALL_RED_DK} stroke="currentColor" strokeWidth={0.7} />
                <path d="M-6.8 -77.4 Q1 -75.8 8.9 -77.4" {...L} strokeWidth={1} opacity={0.7} />
                <path d="M7.4 -78.2 Q13.6 -79.2 16.2 -76.2 Q11.4 -74.8 7.6 -76.2 Z" {...F} fill={BALL_RED} strokeWidth={1.1} />
                {mouse}
                {arm('armA', 'foreA', hand)}
            </Joint>
        </P>
    )
}

/** The hand's position (the ball's centre) in Ash's local coordinates for given joint angles — the same chain `Ash` draws. */
export function ashGrip(arm: number, fore: number, lean: number): [number, number] {
    const rot = (x: number, y: number, deg: number): [number, number] => {
        const t = (deg * Math.PI) / 180
        return [x * Math.cos(t) - y * Math.sin(t), x * Math.sin(t) + y * Math.cos(t)]
    }
    const [sx, sy] = ASH_BODY.shoulder
    const [ux, uy] = rot(0, ASH_BODY.upper, arm)
    const [fx, fy] = rot(ASH_BODY.grip[0], ASH_BODY.grip[1], arm + fore)
    const [lx, ly] = rot(sx + ux + fx, sy + uy + fy - ASH_BODY.hip, lean)
    return [lx, ly + ASH_BODY.hip]
}

/** The mouse (~32 tall with ears at s = 1), sitting, facing right, base at the origin: yellow, brown stripes across the back, red
 *  cheek, long ears with dark tips, and a lightning-bolt tail. `blink` squashes the eye on the scene's clock. */
export function Pikachu({ blink, ...p }: PlaceProps & { blink?: { dur: number; times: number[]; scales: number[] } }) {
    return (
        <P {...p}>
            {/* lightning-bolt tail: two zig-zags, brown at the root */}
            <path d="M-5.6 -2.6 L-12 -6.6 L-9.6 -9 L-16.4 -14.4 L-14 -16.8 L-22 -24.6 L-19.4 -16.6 L-21.4 -15.2 L-14.4 -9.4 L-16 -7.2 L-7.4 -1 Z" {...F} fill={MOUSE} strokeWidth={1.1} />
            <path d="M-5.6 -2.6 L-9.4 -5 L-8 -3 L-7.4 -1 Z" fill={MOUSE_DK} stroke="currentColor" strokeWidth={0.7} strokeLinejoin="round" />
            {/* feet and body */}
            <ellipse cx={-3.6} cy={-1} rx={3.4} ry={1.5} {...F} fill={MOUSE} strokeWidth={1} />
            <path d="M-7.6 -1 C-10.6 -7 -9 -13.6 -4 -15.6 C1.4 -17.6 7 -15 7.6 -8.4 C7.8 -4.4 6.2 -1.6 4.8 -1 Z" {...F} fill={MOUSE} />
            {/* brown stripes across the back */}
            <path d="M-8.6 -10.8 L-3.4 -14.6 L-2.4 -12.2 L-8.9 -8 Z" fill={MOUSE_DK} stroke="currentColor" strokeWidth={0.7} strokeLinejoin="round" />
            <path d="M-9 -6 L-2.2 -10.6 L-1.4 -8.4 L-8.4 -3.6 Z" fill={MOUSE_DK} stroke="currentColor" strokeWidth={0.7} strokeLinejoin="round" />
            <ellipse cx={4.1} cy={-1} rx={3.4} ry={1.5} {...F} fill={MOUSE} strokeWidth={1} />
            <path d="M5 -9.4 q2.2 1.2 1.4 4.4" {...L} strokeWidth={0.9} />
            {/* ears: long, tipped dark; far ear first */}
            <path d="M-1.8 -19.4 C-7 -23.6 -8.6 -30 -7 -33.4 C-3.6 -32.6 0.4 -26.6 1.2 -19.4 Z" {...F} fill={MOUSE} strokeWidth={1.1} />
            <path d="M-7.9 -29.6 C-8.2 -31.4 -7.9 -32.8 -7 -33.4 C-5.9 -33 -4.9 -31.8 -4.2 -30.2 C-5.4 -30.6 -6.7 -30.4 -7.9 -29.6 Z" fill={MOUSE_TIP} stroke="none" />
            <path d="M2.4 -20 C0.6 -26.2 2 -32 5.6 -34 C8.6 -31.4 8.2 -25 6.4 -19.2 Z" {...F} fill={MOUSE} strokeWidth={1.1} />
            <path d="M2.7 -30.4 C3.2 -32.2 4.2 -33.5 5.6 -34 C7 -32.8 7.8 -31.4 8 -29.6 C6 -30.6 4.2 -30.8 2.7 -30.4 Z" fill={MOUSE_TIP} stroke="none" />
            {/* head */}
            <ellipse cx={3.2} cy={-15.4} rx={7.2} ry={6.2} {...F} fill={MOUSE} />
            {/* red cheek, nose, mouth, eye */}
            <circle cx={2.3} cy={-12.8} r={2.2} fill={MOUSE_CHEEK} stroke="currentColor" strokeWidth={0.7} />
            <path d="M9.6 -15.6 q1 0.4 0.6 1.3 q-1 0.2 -1.4 -0.6 Z" {...DOT} />
            <path d="M8.6 -13 q-1.2 1 -2.6 0.4" {...L} strokeWidth={0.8} />
            <g transform="translate(5.5 -16.8)">
                <g>
                    {blink && (
                        <animateTransform
                            attributeName="transform" type="scale" repeatCount="indefinite" dur={`${blink.dur}s`}
                            keyTimes={blink.times.join(';')} values={blink.scales.map(v => `1 ${v}`).join(';')}
                        />
                    )}
                    <circle r={1.4} {...DOT} />
                    <circle cx={0.45} cy={-0.5} r={0.5} fill="#fff" />
                </g>
            </g>
        </P>
    )
}

/** Capture ball, centred on the origin (≈ 9 across at s = 1): red cap, white belly, a dark belt and a button. The cap hinges at the
 *  back; `cap` (degrees on the scene's clock, negative = open) lifts it, and a red glow shows inside while it is open. */
export function Ball({ cap, ...p }: PlaceProps & { cap?: { dur: number; times: number[]; angles: number[] } }) {
    const lid = (
        <>
            <path d="M-4.5 0 A4.5 4.5 0 0 1 4.5 0 Z" {...F} fill={BALL_RED} strokeWidth={1.1} />
            <path d="M-3 -2.5 A3.8 3.8 0 0 1 0.4 -3.9" stroke="#fff" strokeWidth={0.9} strokeLinecap="round" fill="none" opacity={0.6} />
        </>
    )
    return (
        <P {...p}>
            <path d="M-4.5 0 A4.5 4.5 0 0 0 4.5 0 Z" {...F} fill={ASH_WHITE} strokeWidth={1.1} />
            <path d="M1.6 4.2 A4.5 4.5 0 0 0 4.4 0.8 L2.6 0.8 Q2.4 3 1.6 4.2 Z" fill="var(--sc-shade)" stroke="none" />
            {cap && (
                <ellipse rx={4.2} ry={1.1} fill={BALL_RED_LT} opacity={0}>
                    <animate attributeName="opacity" dur={`${cap.dur}s`} repeatCount="indefinite" keyTimes={cap.times.join(';')} values={cap.angles.map(a => (a < 0 ? 0.95 : 0)).join(';')} />
                </ellipse>
            )}
            <path d="M-4.5 0 H4.5" {...L} strokeWidth={1.5} />
            <circle r={1.6} {...F} fill={ASH_WHITE} strokeWidth={1} />
            {cap ? (
                <g>
                    <animateTransform
                        attributeName="transform" type="rotate" repeatCount="indefinite" dur={`${cap.dur}s`}
                        keyTimes={cap.times.join(';')} values={cap.angles.map(a => `${a} -4.5 0`).join(';')}
                    />
                    {lid}
                </g>
            ) : lid}
        </P>
    )
}
