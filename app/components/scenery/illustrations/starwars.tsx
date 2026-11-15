/** Star Wars parody cast for the contact-section duel "A Family Matter": Luke, Vader, Grogu (and the lightsaber the first two share). */
import type { ReactNode } from 'react'
import { DOT, F, GLOW, L, Limb, P, SHADE, WARM, type PlaceProps } from './core'
import { BALL_RED } from './ash'

/* ═══════════════════════════════════════════════════════════════════════
   STAR WARS PARODY — Luke, Vader, Grogu (and the lightsaber the first two share)

   Space-mode art, but every colour is a theme token or a mix of tokens, so the parts follow the theme like everything else.
   The one borrowed value is the red blade (BALL_RED, already used by the Quidditch robes): the palette has no true red.
   Facing right, feet at the origin; mirror with `flip`. Every moving joint takes a keyframe track on the scene's clock
   (fractions of `dur`), or a static `rest` angle for the reduced-motion frame.
═══════════════════════════════════════════════════════════════════════ */

const SW_SKIN = 'color-mix(in srgb, var(--scene-warm) 22%, var(--sc-body))'
const SW_SAND = 'color-mix(in srgb, var(--scene-glow) 60%, var(--scene-warm))'
const SW_TUNIC = 'var(--sc-snow)'
const SW_ROBE = 'var(--sc-rocket)'
const SW_BELT = 'color-mix(in srgb, var(--sc-trunk) 60%, var(--scene-warm))'
const SW_DARK = 'color-mix(in srgb, var(--sc-door) 90%, var(--sc-line))'
const SW_DARK_LT = 'color-mix(in srgb, var(--sc-door) 70%, var(--sc-line))'
const SW_GROGU = 'color-mix(in srgb, var(--sc-alien) 70%, var(--sc-body))'
const SW_GROGU_EAR = 'color-mix(in srgb, var(--sc-accent) 34%, var(--sc-alien))'
const SW_GROGU_ROBE = 'color-mix(in srgb, var(--scene-warm) 38%, var(--sc-body))'

/** keyframes for one rotating joint: `values` are degrees, `times` are 0–1 fractions of `dur` */
export type RotAnim = { dur: number; times: number[]; values: number[] }
/** the blade: `grow` is its length (0 = off, 1 = full), `glow` the halo's opacity */
export type SaberAnim = { dur: number; times: number[]; grow: number[]; glow: number[] }

/** a rotating joint: static `rest` angle, or the SMIL track `anim` */
function Rot({ rest = 0, anim, px = 0, py = 0, children }: { rest?: number; anim?: RotAnim; px?: number; py?: number; children: ReactNode }) {
    const a0 = anim ? anim.values[0] : rest
    return (
        <g transform={`rotate(${a0} ${px} ${py})`}>
            {anim && (
                <animateTransform
                    attributeName="transform" type="rotate" repeatCount="indefinite" dur={`${anim.dur}s`}
                    keyTimes={anim.times.join(';')} values={anim.values.map(a => `${a} ${px} ${py}`).join(';')}
                />
            )}
            {children}
        </g>
    )
}

/** a lightsaber, hilt at the origin, blade growing up into −y. Outlined hilt, a flat-filled blade with a pale core, and a
 *  halo of stacked translucent strokes (the house glow, stretched along the blade). With `anim` the blade ignites, retracts
 *  and its halo breathes on the scene's clock; without it the blade is lit at full length (the reduced-motion frame). */
function Saber({ tone, len = 36, anim }: { tone: string; len?: number; anim?: SaberAnim }) {
    const kt = anim?.times.join(';')
    const dur = anim ? `${anim.dur}s` : undefined
    const halo = (w: number, o: number) => <path d={`M0 0 V${-len}`} stroke={tone} strokeWidth={w} strokeLinecap="round" fill="none" opacity={o} />
    return (
        <g>
            <rect x={-1.7} y={-5} width={3.4} height={9} rx={1.2} {...F} />
            <path d="M-1.7 -1.6 H1.7 M-1.7 1.2 H1.7" {...L} strokeWidth={0.8} opacity={0.7} />
            <rect x={-2.2} y={-7.4} width={4.4} height={2.6} rx={0.9} {...F} fill="var(--sc-panel)" strokeWidth={1} />
            <g transform="translate(0 -7.4)">
                <g transform={`scale(1 ${anim ? anim.grow[0] : 1})`}>
                    {anim && <animateTransform attributeName="transform" type="scale" repeatCount="indefinite" dur={dur} keyTimes={kt} values={anim.grow.map(g => `1 ${g}`).join(';')} />}
                    <g opacity={anim ? anim.glow[0] : 1}>
                        {anim && <animate attributeName="opacity" repeatCount="indefinite" dur={dur} keyTimes={kt} values={anim.glow.join(';')} />}
                        {halo(17, 0.06)}{halo(12, 0.09)}{halo(8, 0.14)}
                    </g>
                    <rect x={-1.7} y={-len} width={3.4} height={len} rx={1.7} fill={tone} stroke="currentColor" strokeWidth={0.9} />
                    <path d={`M0 -2 V${-len + 2.6}`} stroke="var(--sc-rocket)" strokeWidth={1.2} strokeLinecap="round" fill="none" opacity={0.9} />
                </g>
            </g>
        </g>
    )
}

/** keyframes for a fighter's joints and blade (all optional; unset joints sit at their `rest` prop) */
export type DuelAnim = {
    arm?: RotAnim; fore?: RotAnim; lean?: RotAnim; cape?: RotAnim; saber?: SaberAnim
    /** the walk, as Ash's: far / near leg about the hip, and the far (empty) arm swinging against the stride */
    legA?: RotAnim; legB?: RotAnim; armB?: RotAnim
    /** the blade turned about the hilt, added to its resting angle (degrees, + = toward the opponent) */
    wrist?: RotAnim
}

/** where the saber points on screen, in degrees clockwise from straight up (so a raised blade leans toward the opponent) */
const SABER_TILT = 18

/** a boot: ink sole, dark upper */
function Boot({ x0, x1, y = -2.2, w = 5.8 }: { x0: number; x1: number; y?: number; w?: number }) {
    return (
        <>
            <path d={`M${x0} ${y} H${x1}`} stroke="currentColor" strokeWidth={w} strokeLinecap="round" fill="none" />
            <path d={`M${x0} ${y} H${x1}`} stroke={SW_DARK} strokeWidth={w - 2.4} strokeLinecap="round" fill="none" />
        </>
    )
}

/** Luke Skywalker, facing right, feet at the origin (~82 tall): sandy tuft, plain white tunic with a wrap belt, an open robe,
 *  dark boots, and a blue saber raised in the near hand. `arm` / `fore` (shoulder / elbow, degrees, − = forward and up) and
 *  `lean` (about the hips, + = forward) are the static pose; `anim` moves them — and the blade — on the scene's clock. */
export function Luke({ anim, arm = -100, fore = -32, lean = 0, wrist = 0, saberLen = 36, ...p }: PlaceProps & { anim?: DuelAnim; arm?: number; fore?: number; lean?: number; wrist?: number; saberLen?: number }) {
    const a0 = anim?.arm?.values[0] ?? arm
    const f0 = anim?.fore?.values[0] ?? fore
    const psi = SABER_TILT - (a0 + f0)   // the saber's fixed angle in the forearm's frame
    return (
        <P {...p}>
            {/* legs and boots */}
            <Rot anim={anim?.legA} py={-34}>
                <Limb d="M-1 -34 L-3.6 -17 L-4.2 -4" w={6.4} fill={SW_TUNIC} />
                <Boot x0={-9} x1={-1} />
            </Rot>
            <Rot anim={anim?.legB} py={-34}>
                <Limb d="M1.2 -34 L2.6 -17 L3.4 -4" w={6.4} fill={SW_TUNIC} />
                <Boot x0={-0.6} x1={7.4} />
            </Rot>
            <Rot rest={lean} anim={anim?.lean} py={-34}>
                {/* far arm, hanging behind the body */}
                <g transform="translate(1 -59)">
                    <Rot rest={12} anim={anim?.armB}>
                        <Limb d="M0 0 L0 11" w={5.6} fill={SW_ROBE} />
                        <g transform="translate(0 11)">
                            <Rot rest={-8}>
                                <Limb d="M0 0 L0 9.6" w={5.4} fill={SW_ROBE} />
                                <circle cy={11} r={2.5} {...F} fill={SW_SKIN} strokeWidth={1} />
                            </Rot>
                        </g>
                    </Rot>
                </g>
                {/* robe: a long back panel to the knees, collar at the neck */}
                <path d="M-8 -63 Q-12 -38 -13.6 -15 Q-4 -11 6 -14 Q4 -38 7.6 -62 Z" {...F} fill={SW_ROBE} />
                <path d="M-8 -63 Q-12 -38 -13.6 -15 Q-10 -14 -7.4 -14.4 Q-8 -38 -4 -63 Z" {...SHADE} />
                {/* tunic, wrap belt, buckle */}
                <path d="M-7.2 -62.5 Q0.6 -65.6 8 -62.5 L8.6 -36 Q0.6 -33.2 -7.8 -36 Z" {...F} fill={SW_TUNIC} />
                <path d="M-7.2 -62.4 L-3 -62.9 L-3.6 -35.6 L-7.8 -36 Z" {...SHADE} />
                <path d="M3.4 -63.4 L2.8 -36.4" {...L} strokeWidth={0.9} opacity={0.55} />
                <path d="M-7.8 -43.4 Q0.6 -41.4 8.4 -43.4 L8.6 -39.4 Q0.6 -37.4 -7.8 -39.4 Z" {...F} fill={SW_BELT} strokeWidth={1} />
                <rect x={3} y={-42.6} width={3.6} height={3} rx={0.6} {...F} fill="var(--scene-glow)" strokeWidth={0.8} />
                {/* head: ear, face, hair (a swept sandy tuft) */}
                <circle cx={1.5} cy={-71.5} r={7.2} {...F} fill={SW_SKIN} strokeWidth={1.2} />
                <circle cx={-0.6} cy={-70.6} r={1.5} fill={SW_SKIN} stroke="currentColor" strokeWidth={0.8} />
                <path d="M-5.6 -70 Q-8 -78 -0.5 -81.2 Q7.6 -82.4 9 -74.2 Q5.4 -78.2 1.2 -77.4 Q-1.4 -76.8 -2.6 -70.6 Z" fill={SW_SAND} stroke="currentColor" strokeWidth={0.9} strokeLinejoin="round" />
                <path d="M3 -81 Q6.4 -84.4 9.8 -81.4 Q6.6 -82 4.4 -78.8 Z" fill={SW_SAND} stroke="currentColor" strokeWidth={0.8} strokeLinejoin="round" />
                <circle cx={5.4} cy={-72} r={0.95} {...DOT} />
                <path d="M4 -74.2 q1.5 -0.9 3 -0.2" {...L} strokeWidth={0.9} />
                <path d="M8.6 -71.4 q1.2 1 0 2.2" {...L} strokeWidth={0.9} />
                <path d="M5 -67.6 q1.7 0.9 3.2 0" {...L} strokeWidth={0.9} />
                {/* near arm, wide robe sleeve; the saber rides the forearm */}
                <g transform="translate(1 -59)">
                    <Rot rest={arm} anim={anim?.arm}>
                        <Limb d="M0 0 L0 11" w={6.6} fill={SW_ROBE} />
                        <g transform="translate(0 11)">
                            <Rot rest={fore} anim={anim?.fore}>
                                <Limb d="M0 0 L0 9.6" w={6.4} fill={SW_ROBE} />
                                <path d="M-3.2 8 Q0 9.2 3.2 8" {...L} strokeWidth={0.8} opacity={0.5} />
                                <g transform={`translate(0 11) rotate(${psi})`}>
                                    <Rot rest={wrist} anim={anim?.wrist}>
                                        <Saber tone="var(--sc-glass)" len={saberLen} anim={anim?.saber} />
                                    </Rot>
                                </g>
                                <circle cy={11} r={2.6} {...F} fill={SW_SKIN} strokeWidth={1} />
                            </Rot>
                        </g>
                    </Rot>
                </g>
            </Rot>
        </P>
    )
}

/** Darth Vader, facing right, feet at the origin (~108 tall): domed helmet with a mask and one dark lens, chest control panel with
 *  three lights, shoulder pauldrons, belt, a long cape that sways, and a red saber raised in the near hand. Same joints as Luke
 *  (`arm`, `fore`, `lean`) plus `anim.cape`. Black is a dark mix of the door and line tokens, so he reads as black armour under
 *  a pale outline in Space and as a dark silhouette in Nature. */
export function Vader({ anim, arm = -98, fore = -34, lean = 0, wrist = 0, saberLen = 40, ...p }: PlaceProps & { anim?: DuelAnim; arm?: number; fore?: number; lean?: number; wrist?: number; saberLen?: number }) {
    const a0 = anim?.arm?.values[0] ?? arm
    const f0 = anim?.fore?.values[0] ?? fore
    const psi = SABER_TILT - (a0 + f0)
    return (
        <P {...p}>
            {/* cape: hangs from the shoulders to the floor, wavy hem, a fold or two */}
            <Rot anim={anim?.cape} px={1} py={-76}>
                <path d="M-8 -78 Q-21 -48 -20 -5 Q-14 -1 -9 -3.4 Q-3 1 3 -3 Q4 -34 7.4 -78 Z" {...F} fill={SW_DARK} />
                <path d="M-12.6 -70 Q-16 -40 -15 -8 M-5.4 -72 Q-6.6 -40 -4.6 -5" {...L} strokeWidth={0.8} opacity={0.45} />
            </Rot>
            {/* legs and heavy boots */}
            <Rot anim={anim?.legA} py={-42}>
                <Limb d="M-1.4 -42 L-3 -22 L-3.6 -5" w={7.6} fill={SW_DARK} />
                <Boot x0={-9.4} x1={-0.4} y={-2.6} w={7.4} />
            </Rot>
            <Rot anim={anim?.legB} py={-42}>
                <Limb d="M1.6 -42 L3 -22 L4 -5" w={7.6} fill={SW_DARK} />
                <Boot x0={-0.6} x1={9.6} y={-2.6} w={7.4} />
            </Rot>
            <Rot rest={lean} anim={anim?.lean} py={-42}>
                {/* far arm, hanging */}
                <g transform="translate(0 -75)">
                    <Rot rest={10} anim={anim?.armB}>
                        <Limb d="M0 0 L0 13" w={7} fill={SW_DARK} />
                        <g transform="translate(0 13)">
                            <Rot rest={-6}>
                                <Limb d="M0 0 L0 11.6" w={6.6} fill={SW_DARK} />
                                <circle cy={13.4} r={3.2} {...F} fill={SW_DARK_LT} strokeWidth={1} />
                            </Rot>
                        </g>
                    </Rot>
                </g>
                {/* torso: armoured chest, belt and buckle */}
                <path d="M-10 -78 Q0.6 -82.4 11 -78 L11.4 -46 Q0.6 -42.6 -10 -46 Z" {...F} fill={SW_DARK} />
                <path d="M-10 -78 L-4.6 -79.6 L-5.2 -45 L-10 -46 Z" {...SHADE} />
                <path d="M-10.2 -50 Q0.6 -47.4 11.6 -50 L11.4 -45 Q0.6 -42.4 -10 -45 Z" {...F} fill={SW_DARK_LT} strokeWidth={1} />
                <rect x={-1} y={-49.2} width={6} height={3.6} rx={0.8} {...F} fill="var(--sc-panel)" strokeWidth={0.8} />
                {/* the chest control panel: three lights and two sliders */}
                <rect x={1.6} y={-72} width={9} height={12.4} rx={1.6} {...F} strokeWidth={1} />
                <circle cx={4.2} cy={-68.6} r={1.15} {...WARM} />
                <circle cx={6.6} cy={-68.6} r={1.15} fill="var(--sc-glass)" stroke="none" />
                <circle cx={9} cy={-68.6} r={1.15} {...GLOW} />
                <path d="M3.4 -65 H8.8 M3.4 -62.6 H8.8" {...L} strokeWidth={0.8} opacity={0.6} />
                {/* shoulder pauldron */}
                <path d="M-12.4 -78 Q0.6 -85.6 13 -78 L12 -72.6 Q0.6 -77 -11.4 -72.6 Z" {...F} fill={SW_DARK_LT} />
                {/* helmet: dome with a flared rim at the back, the mask, one lens, a grille */}
                <path d="M-8.4 -87 C-10.4 -103 -0.4 -108.6 6 -108 C13.2 -107.4 14.8 -98 13.2 -90 L11.6 -84 L9 -80.4 H-3.6 L-8.6 -84.2 L-10.8 -79.8 L-3.6 -78.4 Z" {...F} fill={SW_DARK} />
                <path d="M-8.4 -87 C-10.4 -103 -2 -108.4 2.4 -108.2 C-2.6 -102 -3 -92 -3.6 -82 L-8.6 -84.2 Z" {...SHADE} />
                <path d="M-3.6 -105.8 Q3.6 -109.8 10 -105" {...L} strokeWidth={0.8} opacity={0.55} />
                <path d="M5 -98 Q13 -98.6 13.4 -91 L11 -84 Q8.2 -80.8 5.4 -83 Z" {...F} fill={SW_DARK_LT} strokeWidth={1.1} />
                <path d="M7.2 -94.4 Q10.6 -95.8 13 -93.6 L12.6 -91.4 Q9.8 -90.6 7.2 -92.2 Z" fill="var(--scene-fill)" stroke="currentColor" strokeWidth={0.9} strokeLinejoin="round" />
                <path d="M5.6 -96.8 Q10.8 -98.6 13.4 -95.4" {...L} strokeWidth={0.9} />
                <path d="M7.4 -86 H11.8 M7.8 -84.2 H11.2 M8.2 -82.4 H10.4" {...L} strokeWidth={0.8} opacity={0.7} />
                <path d="M-6 -100 Q-4.6 -104.6 0.4 -106" stroke="var(--sc-snow)" strokeWidth={1.2} strokeLinecap="round" fill="none" opacity={0.45} />
                {/* near arm; the saber rides the forearm */}
                <g transform="translate(1 -75)">
                    <Rot rest={arm} anim={anim?.arm}>
                        <Limb d="M0 0 L0 13" w={7.4} fill={SW_DARK} />
                        <g transform="translate(0 13)">
                            <Rot rest={fore} anim={anim?.fore}>
                                <Limb d="M0 0 L0 11.6" w={7} fill={SW_DARK} />
                                <path d="M-3.4 8.4 Q0 9.6 3.4 8.4" {...L} strokeWidth={0.8} opacity={0.5} />
                                <g transform={`translate(0 13) rotate(${psi})`}>
                                    <Rot rest={wrist} anim={anim?.wrist}>
                                        <Saber tone={BALL_RED} len={saberLen} anim={anim?.saber} />
                                    </Rot>
                                </g>
                                <circle cy={13} r={3.2} {...F} fill={SW_DARK_LT} strokeWidth={1} />
                            </Rot>
                        </g>
                    </Rot>
                </g>
            </Rot>
        </P>
    )
}

/** keyframes for Grogu: ears (`values` = droop, degrees, + = down), the two arms (out from his sides, degrees), and `mood`
 *  (−1 worried … 0 calm … +1 smug), which bends his mouth and tilts his brows together */
export type GroguAnim = { ears?: RotAnim; arms?: RotAnim; mood?: RotAnim }

/** the mouth and brow paths for a mood from −1 (worried) to +1 (smug) */
const groguMouth = (m: number) => `M-2.6 -19.2 Q0 ${(-19.2 + 2.6 * m).toFixed(2)} 2.6 -19.2`
const groguBrow = (m: number, side: 1 | -1) => `M${(side * 6.4).toFixed(1)} ${(-29.2 - 0.5 * m).toFixed(2)} L${(side * 1.4).toFixed(1)} ${(-29.6 + 1.3 * m).toFixed(2)}`

/** Grogu, facing us, feet at the origin (~37 tall with his wisps): a small green head with long drooping ears, very big dark eyes,
 *  a loose tan robe and tiny hands. `ears` (droop, degrees), `arms` (out from the sides, degrees) and `mood` are the static pose;
 *  `anim` moves them on the scene's clock. */
export function Grogu({ anim, ears = 6, arms = 8, mood = 0, ...p }: PlaceProps & { anim?: GroguAnim; ears?: number; arms?: number; mood?: number }) {
    const dur = anim?.mood ? `${anim.mood.dur}s` : undefined
    const kt = anim?.mood?.times.join(';')
    const mAnim = (f: (m: number) => string) => anim?.mood && (
        <animate attributeName="d" repeatCount="indefinite" dur={dur} keyTimes={kt} values={anim.mood.values.map(f).join(';')} />
    )
    const m0 = anim?.mood ? anim.mood.values[0] : mood
    // one ear, drawn for the viewer's left; the right is its mirror, so one droop track moves both symmetrically
    const ear = (
        <Rot rest={-ears} anim={anim?.ears && { ...anim.ears, values: anim.ears.values.map(v => -v) }} px={-7.6} py={-26}>
            <path d="M-7.6 -28.4 C-14.4 -35 -25 -33.6 -29.4 -27.4 C-24.4 -22.8 -14 -22 -7.6 -24 Z" {...F} fill={SW_GROGU} />
            <path d="M-10 -27.8 C-15.4 -31 -21.6 -30.2 -25 -27.4 C-20.8 -25 -14.6 -24.6 -10.2 -25.6 Z" fill={SW_GROGU_EAR} stroke="none" opacity={0.8} />
            <path d="M-12 -33 L-11 -27 M-17 -32.8 L-15.6 -26" {...L} strokeWidth={0.7} opacity={0.35} />
        </Rot>
    )
    const arm = (side: 1 | -1) => (
        <g transform={`translate(${side * 7} -16.6)`}>
            <Rot rest={side * arms} anim={anim?.arms && { ...anim.arms, values: anim.arms.values.map(v => side * v) }}>
                <Limb d="M0 0 L0 8" w={4.8} fill={SW_GROGU_ROBE} />
                <circle cy={9.4} r={2} {...F} fill={SW_GROGU} strokeWidth={0.9} />
            </Rot>
        </g>
    )
    return (
        <P {...p}>
            {/* feet and robe */}
            <ellipse cx={-3.8} cy={-0.9} rx={2.8} ry={1.4} {...F} fill={SW_GROGU} strokeWidth={1} />
            <ellipse cx={3.8} cy={-0.9} rx={2.8} ry={1.4} {...F} fill={SW_GROGU} strokeWidth={1} />
            <path d="M-7.4 -18 Q0 -20.4 7.4 -18 L9.8 -2.4 Q0 1.2 -9.8 -2.4 Z" {...F} fill={SW_GROGU_ROBE} />
            <path d="M3.6 -18.8 Q6 -18.6 7.4 -18 L9.8 -2.4 Q7 -1.2 4.4 -1 Z" {...SHADE} />
            <path d="M-8.8 -8.4 Q0 -5.8 8.8 -8.4" {...L} strokeWidth={0.8} opacity={0.55} />
            {arm(-1)}{arm(1)}
            {/* ears behind the head, then the head */}
            {ear}
            <g transform="scale(-1 1)">{ear}</g>
            <ellipse cx={0} cy={-25} rx={9.8} ry={8.8} {...F} fill={SW_GROGU} strokeWidth={1.2} />
            <path d="M4 -33 Q10 -30 9.6 -24 Q9 -19 4.6 -17.4 Q7.6 -24 4 -33 Z" {...SHADE} />
            <path d="M-1.6 -33.8 q-0.6 -2 -2.2 -2.4 M0 -34 q0 -2.4 0 -3 M1.8 -33.8 q0.8 -2 2.2 -2.2" {...L} strokeWidth={0.9} />
            {/* big dark eyes with a glint, tilting brows, a small mouth */}
            <ellipse cx={-3.8} cy={-25.2} rx={2.6} ry={3.2} fill="var(--sc-door)" stroke="currentColor" strokeWidth={0.8} />
            <ellipse cx={3.8} cy={-25.2} rx={2.6} ry={3.2} fill="var(--sc-door)" stroke="currentColor" strokeWidth={0.8} />
            <circle cx={-3} cy={-26.6} r={0.85} fill="var(--sc-snow)" stroke="none" />
            <circle cx={4.6} cy={-26.6} r={0.85} fill="var(--sc-snow)" stroke="none" />
            <path d={groguBrow(m0, -1)} {...L} strokeWidth={0.9}>{mAnim(m => groguBrow(m, -1))}</path>
            <path d={groguBrow(m0, 1)} {...L} strokeWidth={0.9}>{mAnim(m => groguBrow(m, 1))}</path>
            <path d="M-0.5 -22 h1" {...L} strokeWidth={1} />
            <path d={groguMouth(m0)} {...L} strokeWidth={1}>{mAnim(groguMouth)}</path>
        </P>
    )
}