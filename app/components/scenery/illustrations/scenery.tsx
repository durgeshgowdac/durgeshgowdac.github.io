/** Scenery for the hero and the story strips: cairn, mist, balloon, lantern, beacon, aurora, nebula, peaks, kite flyers, countdown. */
import type { CSSProperties, ReactNode } from 'react'
import { F, GLOW, L, P, type PlaceProps, SHADE, WARM } from './core'
import { Alien, Ufo } from './space'

/* ═══════════════════════════════════════════════════════════════════════
   NEW — scenery for the hero and the story strips
═══════════════════════════════════════════════════════════════════════ */

/** Trail cairn: four balanced stones in warm sandstone tints, narrowing upward. Marks the way for the hiker. */
export function Cairn(p: PlaceProps) {
    const tone = (c: string) => ({ ...L, fill: c, strokeWidth: 1.2 })
    return (
        <P {...p}>
            <path d="M-11 0 C-14 -6 -10 -10 -4 -10 H5 C11 -10 14 -6 11 0 Z" {...tone('var(--sc-sign)')} />
            <path d="M-8 -10 C-10 -15 -6 -18.4 -1 -18.4 H3.4 C8 -18.4 10 -14.6 8 -10 Z" {...tone('var(--sc-body)')} />
            <path d="M-5 -18.4 C-6 -22.6 -3 -25.2 0 -25.2 C3.4 -25.2 6 -22.6 5 -18.4 Z" {...tone('color-mix(in srgb, var(--sc-accent) 38%, var(--sc-sign))')} />
            <path d="M-2.6 -25.2 C-3 -28.6 -1 -30.4 0.6 -30.4 C2.4 -30.4 3.6 -28.6 2.8 -25.2 Z" {...tone('var(--sc-body)')} />
            <path d="M-6 -5 H-1 M0 -14 H4" {...L} strokeWidth={0.9} opacity={0.4} />
        </P>
    )
}

/** A low band of mist. Deliberately faint — paper-coloured, no outline — so it adds depth without ever
 *  lowering the contrast of text that sits near it. */
export function MistBand({ w = 600, h = 16, o = 0.4, ...p }: PlaceProps & { w?: number; h?: number }) {
    const q = w / 6
    const d = `M0 ${h * 0.5} C${q} ${-h * 0.1} ${q * 1.6} ${h * 0.2} ${q * 2.6} ${h * 0.05} S${q * 4.4} ${h * 0.3} ${q * 6} ${h * 0.12} V${h * 0.62} C${q * 4.6} ${h * 1.1} ${q * 3.4} ${h * 0.82} ${q * 2.4} ${h * 0.98} S${q * 0.8} ${h * 0.9} 0 ${h * 0.88} Z`
    return (
        <P {...p} o={o} bg>
            <path d={d} fill="var(--scene-fill)" stroke="none" />
            <path d={d} fill="var(--scene-fill)" stroke="none" transform={`translate(${w * 0.06} ${h * 0.34}) scale(0.9 0.7)`} opacity={0.6} />
        </P>
    )
}

/** Hot-air balloon, centred on the envelope; the basket hangs below. Drifts gently (.scene-hover). */
export function Balloon({ drift = true, ...p }: PlaceProps & { drift?: boolean }) {
    const body = (
        <>
            <path d="M-9 33 L-5 41 M9 33 L5 41" {...L} strokeWidth={0.9} />
            <path d="M0 -40 C-26 -40 -30 -6 -9 33 H9 C30 -6 26 -40 0 -40 Z" {...F} />
            <path d="M0 -40 C-10 -34 -12 -6 -4 33 H4 C12 -6 10 -34 0 -40 Z" fill="var(--sc-accent)" stroke="currentColor" strokeWidth={1.1} strokeLinejoin="round" />
            <path d="M-26 -16 Q0 -8 26 -16" {...L} strokeWidth={0.9} opacity={0.5} />
            <path d="M12 -36 C24 -26 26 -8 15 20 L9 33 H9 C24 4 22 -26 12 -36 Z" {...SHADE} />
            <rect x={-6} y={41} width={12} height={8} rx={1.6} {...F} fill="var(--sc-sign)" strokeWidth={1.1} />
            <circle cx={0} cy={34} r={2.2} {...WARM} />
        </>
    )
    return <P {...p}>{drift ? <g className="scene-hover">{body}</g> : body}</P>
}

/** Lantern on a short post — a warm point of light for the camp and the trail. With `halo` (the default) it really lights its
 *  surroundings: a soft glow centred on the lamp (stacked translucent discs — no gradient ids to collide), a few short rays, and a pool
 *  of light on the ground by the post, all breathing together in a slow, uneven flicker (.scene-lamp; still when motion is reduced). */
export function Lantern({ halo = true, ...p }: PlaceProps & { halo?: boolean }) {
    return (
        <P {...p}>
            {halo && (
                <g className="scene-lamp">
                    {/* pool of light on the ground, and its brighter heart */}
                    <ellipse cx={6} cy={1} rx={34} ry={6.5} {...GLOW} opacity={0.2} />
                    <ellipse cx={6} cy={1} rx={20} ry={3.6} {...GLOW} opacity={0.26} />
                    {/* the glow itself, centred on the lamp window */}
                    <g transform="translate(10 -27.5)">
                        {[[48, 0.045], [40, 0.06], [32, 0.08], [24, 0.11], [17, 0.16], [11, 0.24]].map(([r, a]) => (
                            <circle key={r} r={r} {...GLOW} opacity={a} />
                        ))}
                        <circle r={6.5} fill="#fff6d6" opacity={0.55} />
                        {/* rays */}
                        <path
                            d={[0, 45, 90, 135, 180, 225, 270, 315]
                                .map(a => {
                                    const rad = (a * Math.PI) / 180, c = Math.cos(rad), s = Math.sin(rad)
                                    return `M${(c * 13).toFixed(1)} ${(s * 13).toFixed(1)} L${(c * 19).toFixed(1)} ${(s * 19).toFixed(1)}`
                                })
                                .join(' ')}
                            stroke="var(--scene-warm)"
                            strokeWidth={1.2}
                            strokeLinecap="round"
                            fill="none"
                            opacity={0.55}
                        />
                    </g>
                </g>
            )}
            <path d="M0 0 V-34 Q0 -40 6 -40 H10" {...L} strokeWidth={1.8} />
            <path d="M10 -40 V-37" {...L} strokeWidth={1.1} />
            <path d="M6 -37 H14 L15.4 -33 H4.6 Z" {...F} strokeWidth={1.1} />
            <rect x={5.4} y={-33} width={9.2} height={11} rx={1.8} {...GLOW} opacity={0.9} />
            <rect x={5.4} y={-33} width={9.2} height={11} rx={1.8} {...L} strokeWidth={1.1} />
            <path d="M10 -33 V-22 M5.4 -27.5 H14.6" {...L} strokeWidth={0.8} opacity={0.5} />
            <path d="M4.6 -22 H15.4" {...L} strokeWidth={1.6} />
        </P>
    )
}

/** Navigation beacon / relay buoy: a capsule hull with two solar wings, a mast and a blinking warm lamp.
 *  It hovers on the spot (.scene-hover) — stationary, but alive. */
export function Beacon({ delay = 0, ...p }: PlaceProps & { delay?: number }) {
    return (
        <P {...p}>
            <g className="scene-hover" style={{ animationDelay: `${-delay * 1.7}s` }}>
                <path d="M-6 -2 L-22 -5 V3 L-6 0 M6 -2 L22 -5 V3 L6 0" {...F} fill="var(--sc-panel)" strokeWidth={1.1} />
                <path d="M0 -8 V-17" {...L} strokeWidth={1.1} />
                <g className="scene-twinkle" style={{ animationDelay: `${delay}s` }}>
                    <circle cy={-19} r={5} {...GLOW} opacity={0.3} />
                    <circle cy={-19} r={2} {...WARM} />
                </g>
                <rect x={-7} y={-8} width={14} height={11} rx={5} {...F} />
                <path d="M-4 -2.5 H4" {...L} strokeWidth={0.9} opacity={0.55} />
            </g>
        </P>
    )
}

/** Aurora ribbon: a few soft, translucent glow strokes along a wavy line. Very low contrast by design. */
export function Aurora({ w = 640, h = 110, o = 1, ...p }: PlaceProps & { w?: number; h?: number }) {
    const d = (k: number) => `M0 ${h * 0.5 + k} C${w * 0.18} ${h * 0.05 + k} ${w * 0.34} ${h * 0.7 + k} ${w * 0.52} ${h * 0.34 + k} S${w * 0.84} ${h * 0.02 + k} ${w} ${h * 0.3 + k}`
    return (
        <P {...p} o={o} bg>
            <g className="scene-aurora" fill="none" stroke="var(--sc-glow)" strokeLinecap="round">
                <path d={d(0)} strokeWidth={26} opacity={0.035} />
                <path d={d(0)} strokeWidth={14} opacity={0.05} />
                <path d={d(0)} strokeWidth={4} opacity={0.12} />
                <path d={d(h * 0.22)} strokeWidth={18} opacity={0.035} />
                <path d={d(h * 0.22)} strokeWidth={3} opacity={0.08} />
            </g>
        </P>
    )
}

/** Subtle nebula haze: overlapping soft ellipses, no filter (so no ids to collide). */
export function Nebula({ w = 360, h = 180, ...p }: PlaceProps & { w?: number; h?: number }) {
    const blob = (cx: number, cy: number, rx: number, ry: number, a: number, f = 'var(--sc-glow)') =>
        [1, 0.78, 0.58, 0.4].map((k, i) => <ellipse key={`${cx}${cy}${i}`} cx={cx} cy={cy} rx={rx * k} ry={ry * k} fill={f} opacity={a * (i + 1) * 0.42} stroke="none" />)
    return (
        <P {...p} bg>
            {blob(0, 0, w * 0.5, h * 0.4, 0.05)}
            {blob(w * 0.22, h * 0.12, w * 0.32, h * 0.34, 0.04, 'var(--sc-glow)')}
            {blob(-w * 0.2, -h * 0.1, w * 0.3, h * 0.28, 0.035, 'var(--sc-glow)')}
        </P>
    )
}

/** Planet-limb glow: a luminous rim traced along a horizon path — stacked translucent strokes that fall off with
 *  distance, like atmosphere catching the light. Draw it on the ground silhouette. */
export function LimbGlow({ d, o = 1 }: { d: string; o?: number }) {
    return (
        <g fill="none" stroke="var(--sc-glow)" strokeLinecap="round" strokeLinejoin="round" opacity={o}>
            <path d={d} strokeWidth={22} opacity={0.035} />
            <path d={d} strokeWidth={13} opacity={0.05} />
            <path d={d} strokeWidth={6} opacity={0.08} />
        </g>
    )
}
/** Summit peak: a clean triangle tinted with the ground token, a shaded east face, a snow cap and a veil of haze
 *  around the summit. `far` makes it a distant, faded range member (ground-far tint, no snow, no shade).
 *  (<Mountain/> is the craggier outline used by the small card marks.) */
export function Peak({ w = 300, h = 260, snow = true, far = false, haze = true, ...p }: PlaceProps & { w?: number; h?: number; snow?: boolean; far?: boolean; haze?: boolean }) {
    const hw = w / 2
    return (
        <P {...p} bg>
            <path d={`M${-hw} 0 L0 ${-h} L${hw} 0 Z`} fill={far ? 'var(--sc-far)' : 'var(--sc-mid)'} stroke="currentColor" strokeWidth={far ? 1.1 : 1.3} strokeLinejoin="round" strokeOpacity={far ? 0.5 : 1} />
            {!far && <path d={`M0 ${-h} L${hw} 0 H${hw * 0.28} L${hw * 0.1} ${-h * 0.42} Z`} {...SHADE} />}
            {snow && !far && (
                <path
                    d={`M0 ${-h} L${-hw * 0.2} ${-h * 0.72} L${-hw * 0.09} ${-h * 0.77} L0 ${-h * 0.66} L${hw * 0.1} ${-h * 0.76} L${hw * 0.19} ${-h * 0.71} Z`}
                    fill="var(--sc-snow)" stroke="currentColor" strokeWidth={1.1} strokeLinejoin="round"
                />
            )}
            {haze && (
                <g stroke="none" fill="var(--scene-fill)">
                    <ellipse cx={-w * 0.02} cy={-h * 0.6} rx={w * 0.3} ry={h * 0.035} opacity={far ? 0.32 : 0.5} />
                    <ellipse cx={w * 0.05} cy={-h * 0.5} rx={w * 0.36} ry={h * 0.04} opacity={far ? 0.22 : 0.34} />
                    <ellipse cx={-w * 0.08} cy={-h * 0.4} rx={w * 0.3} ry={h * 0.03} opacity={far ? 0.16 : 0.24} />
                </g>
            )}
        </P>
    )
}


/** "Greetings": a UFO hovering `h` above the ground with a tractor beam, and a little alien (the library's outline
 *  alien, or anything passed as children) who is periodically lifted up the beam toward the saucer. The loop is
 *  CSS (.scene-abduct-*): beam fades in, the alien rises and shrinks into the saucer, the beam fades out, and the
 *  alien reappears on the ground. With reduced motion everything simply rests: saucer, faint beam, alien on the
 *  ground. Origin = the alien's feet. */
/** the saucer's flight path (a slow sinuous glide, relative to its hover spot) — mirrored by the abductUfo keyframes in globals.css */
const TRAIL = 'M0 0C2 -1 6 -3 10 -6C14 -9 21 -13 24 -18C27 -23 30 -30 28 -36C26 -42 19 -50 13 -54C7 -58 -2 -59 -8 -63C-14 -67 -21 -72 -23 -78C-25 -84 -22 -93 -18 -99C-14 -105 -6 -110 -2 -115C2 -120 6 -126 8 -128'


export function Abduction({ h = 100, ufo = 0.7, delay = 0, children, rider, aside, ...p }: PlaceProps & { h?: number; ufo?: number; delay?: number; children?: ReactNode; rider?: ReactNode; aside?: ReactNode }) {
    const top = -h + 7 * ufo          // the saucer's belly
    const bw = 15 * ufo, gw = 30      // beam half-width at the saucer / at the ground
    const lift = -(h - 4 * ufo)    // up through the belly, into the hull
    const phase = { animationDelay: `${-delay}s` } as CSSProperties
    return (
        <P {...p}>
            <path d={`M${-bw} ${top} L${-gw} 0 H${gw} L${bw} ${top} Z`} className="scene-abduct-beam" style={phase} fill="var(--sc-glow)" stroke="none" />
            <path d={`M${-bw} ${top} L${-gw} 0 M${bw} ${top} L${gw} 0`} {...L} strokeWidth={0.9} strokeDasharray="2 5" className="scene-abduct-rib" style={phase} />
            <ellipse cx={0} cy={0} rx={gw * 0.8} ry={3} className="scene-abduct-beam" style={phase} fill="var(--sc-glow)" stroke="none" />
            <g className="scene-abduct-alien" style={{ ...phase, ['--lift' as string]: `${lift}px` } as CSSProperties}>
                {children ?? <Alien />}
            </g>
            {/* optional extra drawn on the ground only while the one below is there (e.g. a speech bubble): it shows in the windows before the beam lifts him */}
            {aside && <g className="scene-abduct-say" style={phase}>{aside}</g>}
            {/* after the beam: the saucer wobbles, then zigzags up and away, leaving a curling trail */}
            <g transform={`translate(0 ${-h})`} fill="none" stroke="var(--sc-glow)" strokeLinecap="round" strokeLinejoin="round">
                <path d={TRAIL} pathLength={1} className="scene-abduct-trail" style={phase} strokeWidth={5} strokeOpacity={0.35} />
                <path d={TRAIL} pathLength={1} className="scene-abduct-trail" style={phase} strokeWidth={1.8} />
            </g>
            <g className="scene-abduct-ufo" style={phase}>
                <g className="scene-hover">
                    <Ufo y={-h} s={ufo} pods rider={<g className="scene-abduct-rider" style={phase}>{rider ?? <Alien x={0} y={-5} s={0.3} />}</g>} />
                </g>
            </g>
        </P>
    )
}

/** Two kids flying a kite (origin = the kids' feet). The kite bobs and sways on the wind and the string follows it —
 *  one SMIL timeline drives both, so they never drift apart. */
export function KiteFlyers({ dur = 6, ...p }: PlaceProps & { dur?: number }) {
    const pos: [number, number][] = [[74, -96], [82, -104], [68, -99], [78, -92], [74, -96]]
    const hand = [7, -25]
    const str = (k: [number, number]) => `M${hand[0]} ${hand[1]} Q${(hand[0] + k[0]) / 2 + 6} ${(hand[1] + k[1]) / 2 + 22} ${k[0]} ${k[1] + 15}`
    const kid = (tall: boolean) => {
        const h = tall ? 1 : 0.82
        return (
            <g transform={`scale(${h})`}>
                <path d="M-1.6 -12 V0 M1.6 -12 V0" {...L} strokeWidth={2} />
                <path d="M-5 -14 Q0 -30 5 -14 Z" fill={tall ? 'var(--sc-accent)' : 'var(--sc-panel)'} stroke="currentColor" strokeWidth={1.1} strokeLinejoin="round" />
                <circle cx={0} cy={-31} r={4.4} fill="var(--sc-body)" stroke="currentColor" strokeWidth={1.1} />
                <path d="M-4.6 -33 Q0 -39 4.6 -33 Q0 -35 -4.6 -33 Z" fill="var(--sc-trunk)" stroke="currentColor" strokeWidth={0.8} />
            </g>
        )
    }
    return (
        <P {...p}>
            <g transform="translate(-15 0)">{kid(false)}<path d="M2 -24 L9 -30" {...L} strokeWidth={1.6} /></g>
            {kid(true)}
            <path d="M2 -22 L7 -25" {...L} strokeWidth={1.8} />
            {/* string */}
            <path d={str(pos[0])} {...L} strokeWidth={0.8} opacity={0.75}>
                <animate attributeName="d" values={pos.map(str).join(';')} dur={`${dur}s`} repeatCount="indefinite" calcMode="spline" keySplines={pos.slice(1).map(() => '0.45 0 0.55 1').join(';')} />
            </path>
            {/* kite */}
            <g>
                <animateTransform attributeName="transform" type="translate" values={pos.map(k => `${k[0]} ${k[1]}`).join(';')} dur={`${dur}s`} repeatCount="indefinite" calcMode="spline" keySplines={pos.slice(1).map(() => '0.45 0 0.55 1').join(';')} />
                <g>
                    <animateTransform attributeName="transform" type="rotate" values="-9 0 0;9 0 0;-9 0 0" dur={`${dur / 2}s`} repeatCount="indefinite" calcMode="spline" keySplines="0.45 0 0.55 1;0.45 0 0.55 1" />
                    <path d="M0 -17 L11 -3 L0 15 L-11 -3 Z" fill="var(--sc-accent)" stroke="currentColor" strokeWidth={1.2} strokeLinejoin="round" />
                    <path d="M0 -17 L11 -3 L0 -3 Z M0 15 L-11 -3 L0 -3 Z" {...SHADE} />
                    <path d="M0 -17 V15 M-11 -3 H11" {...L} strokeWidth={0.8} opacity={0.6} />
                    <path d="M0 15 C-6 22 6 28 0 35 C-5 41 5 46 0 52" {...L} strokeWidth={1} />
                    <path d="M-3.6 24 L3.6 22 L-3.6 20 Z M3.4 38 L-3.4 36 L3.4 34 Z" fill="var(--sc-sun)" stroke="currentColor" strokeWidth={0.7} />
                </g>
            </g>
        </P>
    )
}

/* ─────────── 7-segment countdown readout (a lit-LED calculator display, drawn — no font needed) ─────────── */
const SEG7: Record<string, string> = { '0': 'abcdef', '1': 'bc', '2': 'abdeg', '3': 'abcdg', '4': 'bcfg', '5': 'acdfg', '6': 'acdefg', '7': 'abc', '8': 'abcdefg', '9': 'abcdfg' }
function Digit7({ d, x }: { d: string; x: number }) {
    const w = 7, h = 12, t = 1.5
    const hs = (y: number) => `M${x + t} ${y} H${x + w - t} L${x + w - t * 0.4} ${y + t / 2} L${x + w - t} ${y + t} H${x + t} L${x + t * 0.4} ${y + t / 2} Z`
    const vs = (px: number, y: number) => `M${px} ${y + t} L${px + t / 2} ${y + t * 0.4} L${px + t} ${y + t} V${y + h / 2 - t * 0.6} L${px + t / 2} ${y + h / 2 - t * 0.1} L${px} ${y + h / 2 - t * 0.6} Z`
    const segs: Record<string, string> = {
        a: hs(0), g: hs(h / 2 - t / 2), d: hs(h - t),
        f: vs(x, 0), b: vs(x + w - t, 0), e: vs(x, h / 2), c: vs(x + w - t, h / 2),
    }
    const on = SEG7[d] ?? ''
    return (
        <>
            {Object.entries(segs).map(([k, v]) => (
                <path key={k} d={v} fill="var(--scene-glow)" stroke="none" opacity={on.includes(k) ? 1 : 0.1} />
            ))}
        </>
    )
}

/** "T-10"-style countdown panel on a short post. `value` is 0–99, `sign` '-' (before launch) or '+' (after). */
export function Countdown({ value, sign = '-', pad = true, ...p }: PlaceProps & { value: number; sign?: '-' | '+'
    /** show a leading zero (T-03). Off: the tens digit stays dark, so the board reads T-3 like a real launch clock */
    pad?: boolean }) {
    const n = Math.max(0, Math.min(99, Math.round(value)))
    const v = pad || n >= 10 ? String(n).padStart(2, '0') : ` ${n}`
    return (
        <P {...p}>
            <path d="M0 0 V-14" {...L} strokeWidth={2} />
            <rect x={-27} y={-37} width={54} height={24} rx={3.5} fill="var(--sc-door)" stroke="currentColor" strokeWidth={1.3} />
            <rect x={-24.6} y={-34.6} width={49.2} height={19.2} rx={2} fill="none" stroke="currentColor" strokeWidth={0.7} opacity={0.4} />
            {/* T */}
            <g fill="var(--scene-glow)" stroke="none">
                <rect x={-21.4} y={-31.4} width={7} height={1.6} />
                <rect x={-18.7} y={-31.4} width={1.6} height={12} />
                {sign === '+' ? <path d="M-10.5 -25.4 H-4.5 M-7.5 -28.4 V-22.4" stroke="var(--scene-glow)" strokeWidth={1.5} /> : <rect x={-10.5} y={-26.1} width={6} height={1.6} />}
            </g>
            <g transform="translate(0 -31.4)"><Digit7 d={v[0]} x={-1.6} /><Digit7 d={v[1]} x={9.4} /></g>
        </P>
    )
}