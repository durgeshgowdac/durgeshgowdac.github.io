/** The hero's ringed planet (Space) that the rocket lands on — and that goes up in a cartoon explosion, in pieces, and comes back for the next cycle. */
import { useId, type ReactNode } from 'react'
import { DOT, F, GLOW, Halo, L, P, SHADE, WARM, type PlaceProps } from './core'
import { Cloud } from './nature'

/**
 * <BlastPlanet/> — drawn at (x, y) (its centre), radius `r`, ring tilted by `tilt`. All on the caller's SMIL clock (`dur`, seconds; every time below is
 * in seconds of that loop):
 *   whole planet   disc with bands, craters, a shaded side, a halo and a ring (back half behind the disc, front half over it), until `hit`
 *   at `hit`       a cartoon blast at the landing point `at` (given relative to the centre): a white flash, a spiky starburst, a shock ring, sparks,
 *                  billowing smoke puffs, and the whole picture gives a little shake
 *   the pieces     the disc breaks into seven jagged chunks and a core (each the planet's own art, clipped — nothing is drawn twice or differently),
 *                  the ring into four arcs, plus loose rocks; all are thrown away from the landing point, tumble, hang there drifting, fade by `gone`
 *   the planet     reappears (fades in, growing back) between `back0` and `back1`, whole again for the next cycle
 * `still`: just the whole planet, no motion.
 */
type Pt = [number, number]
/** what is being blasted: the hero's ringed `planet`; a plain cratered `moon` (no ring); or a `sun` (a glow disc with spinning rays — the rays fly off as sparks of their own) */
export type BlastLook = 'planet' | 'moon' | 'sun'
const EPS = 0.0004
const rad = (d: number) => (d * Math.PI) / 180
const f2 = (n: number) => (Math.round(n * 100) / 100).toString()
const rotPt = ([x, y]: Pt, deg: number): Pt => [x * Math.cos(rad(deg)) - y * Math.sin(rad(deg)), x * Math.sin(rad(deg)) + y * Math.cos(rad(deg))]

/* ── the pieces of the disc, in units of the radius ── */
const CUTS = [-25, 28, 82, 140, 198, 255, 312]                    // where the seven wedges are cut (degrees)
const RINGS = [1, 0.8, 0.62, 0.46]                                 // radii at which a cut kinks
const CORE = 0.46
const wob = (a: number, t: number) => a + Math.sin(rad(a) * 3 + t * 9.1) * 4         // the same cut seen from both of its sides (periodic in 360°)
const polar = (a: number, t: number): Pt => [Math.cos(rad(a)) * t, Math.sin(rad(a)) * t]
const arc = (a0: number, a1: number, t: number): Pt[] => {
    const n = Math.max(2, Math.ceil(Math.abs(a1 - a0) / 12))
    return Array.from({ length: n + 1 }, (_, i) => polar(a0 + ((a1 - a0) * i) / n, t))
}
const cutEdge = (a: number) => RINGS.map(t => polar(wob(a, t), t))      // outer → inner
function wedge(i: number): Pt[] {
    const a0 = CUTS[i], a1 = i + 1 < CUTS.length ? CUTS[i + 1] : CUTS[0] + 360
    const e0 = cutEdge(a0), e1 = cutEdge(a1)
    const outer = arc(wob(a0, 1), wob(a1, 1), 1)
    const inner = arc(wob(a1, CORE), wob(a0, CORE), CORE)
    return [...outer, ...e1.slice(1, 3), ...inner, ...e0.slice(1, 3).reverse()]
}
const CORE_POLY: Pt[] = Array.from({ length: 24 }, (_, i) => polar((i / 24) * 360, CORE))
const poly = (pts: Pt[], r: number) => `M${pts.map(([x, y]) => `${f2(x * r)} ${f2(y * r)}`).join(' L')} Z`
const centroid = (pts: Pt[]): Pt => [pts.reduce((a, p) => a + p[0], 0) / pts.length, pts.reduce((a, p) => a + p[1], 0) / pts.length]

/** the planet's art inside the disc: shade, bands, craters (no outline — the outline belongs to the whole disc / each chunk) */
function Details({ r, glow, look = 'planet' }: { r: number; glow: boolean; look?: BlastLook }) {
    if (look === 'sun') return null
    if (look === 'moon') {
        return (
            <>
                <path d={`M0 ${-r} A${r} ${r} 0 0 1 0 ${r} A${f2(r * 0.55)} ${r} 0 0 0 0 ${-r} Z`} {...SHADE} />
                {[[-0.3, -0.25, 0.22, 0.18], [0.35, 0.2, 0.16, 0.13], [-0.1, 0.5, 0.1, 0.08]].map(([cx, cy, rx, ry], i) => (
                    <ellipse key={i} cx={f2(cx * r)} cy={f2(cy * r)} rx={f2(rx * r)} ry={f2(ry * r)} {...L} strokeWidth={1} opacity={0.7} />
                ))}
            </>
        )
    }
    return (
        <>
            {glow && <circle r={r} {...GLOW} opacity={0.22} />}
            <path d={`M0 ${-r} A${r} ${r} 0 0 1 0 ${r} A${f2(r * 0.55)} ${r} 0 0 0 0 ${-r} Z`} {...SHADE} />
            {[-0.5, -0.17, 0.2].map((t, i) => {
                const y = r * t, half = Math.sqrt(Math.max(r * r - y * y, 0)) * 0.94
                return <path key={i} d={`M${f2(-half)} ${f2(y)} Q0 ${f2(y + r * 0.14)} ${f2(half)} ${f2(y)}`} {...L} strokeWidth={1} opacity={0.5} />
            })}
            {[[-0.35, -0.3, 0.2, 0.14], [0.3, 0.38, 0.15, 0.11], [-0.18, 0.58, 0.1, 0.07], [0.5, -0.34, 0.09, 0.07]].map(([cx, cy, rx, ry], i) => (
                <ellipse key={i} cx={f2(cx * r)} cy={f2(cy * r)} rx={f2(rx * r)} ry={f2(ry * r)} {...L} strokeWidth={1} opacity={0.7} />
            ))}
        </>
    )
}

export function BlastPlanet({ r = 52, tilt = -16, look = 'planet', at, dur, hit, gone, back0, back1, still = false, ...p }: PlaceProps & {
    r?: number; tilt?: number; look?: BlastLook; at: Pt; dur: number; hit: number; gone: number; back0: number; back1: number; still?: boolean
}) {
    const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
    const loop = { dur: `${dur}s`, repeatCount: 'indefinite' as const }
    const fr = (sec: number) => sec / dur
    const k = (...a: number[]) => a.map(v => Math.max(0, Math.min(1, fr(v))).toFixed(5)).join(';')
    const rx = r * 1.75, ry = r * 0.3
    const out = '0 0 1 1;0.08 0.7 0.25 1;0 0 1 1'
    const lin = '0 0 1 1;0 0 1 1;0 0 1 1'
    const smokeTint = 'color-mix(in srgb, var(--sc-rocket) 30%, var(--scene-fill))'

    const sun = look === 'sun', ringed = look === 'planet'
    // the disc's own outline + fill: a sun is only a translucent glow (it must not hide the sky behind it), the others are opaque
    const disc = sun ? { ...L, fill: 'var(--scene-glow)', fillOpacity: 0.55 } : F
    const RAYS = 14
    const rayAt = (i: number): [Pt, Pt] => {
        const a = (i / RAYS) * Math.PI * 2
        const r0 = r * 1.24, r1 = r * (i % 2 ? 1.45 : 1.58)
        return [[Math.cos(a) * r0, Math.sin(a) * r0], [Math.cos(a) * r1, Math.sin(a) * r1]]
    }
    const ringBack = <path d={`M${-rx} 0 A${rx} ${ry} 0 0 1 ${rx} 0`} {...L} strokeWidth={1.2} />
    const ringFront = <path d={`M${-rx} 0 A${rx} ${ry} 0 0 0 ${rx} 0`} {...L} strokeWidth={1.2} />
    const whole = sun ? (
        <>
            <Halo r={r * 2.27} />
            <circle r={r} {...disc} />
            <circle r={r * 1.12} {...L} strokeWidth={0.9} opacity={0.6} />
            <g className="scene-spin">
                {Array.from({ length: RAYS }, (_, i) => { const [a, b] = rayAt(i); return <line key={i} x1={f2(a[0])} y1={f2(a[1])} x2={f2(b[0])} y2={f2(b[1])} {...L} strokeWidth={1.2} /> })}
            </g>
        </>
    ) : (
        <>
            {ringed && <Halo r={r * 2.4} a={0.8} />}
            <g transform={`rotate(${tilt})`}>
                {ringed && ringBack}
                <circle r={r} {...F} />
                <Details r={r} glow look={look} />
                <circle r={r} {...F} fill="none" />
                {ringed && ringFront}
            </g>
        </>
    )
    if (still) return <P {...p}>{whole}</P>

    /** a thing thrown from the landing point: its world-space centre `c` (relative to the planet's centre), thrown along (c − at) */
    const Thrown = ({ c, mag, spin, tumble, drift = 10, children }: { c: Pt; mag: number; spin: number; tumble: number; drift?: number; children: ReactNode }) => {
        const dx = c[0] - at[0], dy = c[1] - at[1], len = Math.hypot(dx, dy) || 1
        const ux = dx / len, uy = dy / len
        const T = k(0, hit, gone, dur)
        const tr = (v: string, sp: string) => <animateTransform attributeName="transform" type="translate" values={v} keyTimes={T} calcMode="spline" keySplines={sp} {...loop} />
        const ro = (deg: number, sp: string) => <animateTransform attributeName="transform" type="rotate" values={`0 ${f2(c[0])} ${f2(c[1])};0 ${f2(c[0])} ${f2(c[1])};${deg} ${f2(c[0])} ${f2(c[1])};${deg} ${f2(c[0])} ${f2(c[1])}`} keyTimes={T} calcMode="spline" keySplines={sp} {...loop} />
        const X = f2(ux * mag), Y = f2(uy * mag), DX = f2(ux * drift), DY = f2(uy * drift)
        return (
            <g opacity={0}>
                <animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes={k(0, hit - dur * EPS, hit, gone - 2.2, gone, dur)} {...loop} />
                <g>
                    {tr(`0 0;0 0;${X} ${Y};${X} ${Y}`, out)}
                    <g>
                        {tr(`0 0;0 0;${DX} ${DY};${DX} ${DY}`, lin)}
                        <g>
                            {ro(spin, out)}
                            <g>
                                {ro(tumble, lin)}
                                {children}
                            </g>
                        </g>
                    </g>
                </g>
            </g>
        )
    }

    const wedges = CUTS.map((_, i) => wedge(i))
    // pieces: the core and the seven wedges — each is the planet's own art, clipped to its jagged outline
    const chunks: { id: string; pts: Pt[] }[] = [{ id: 'core', pts: CORE_POLY }, ...wedges.map((pts, i) => ({ id: `w${i}`, pts }))]
    // loose rocks, thrown farther than the chunks: [start (units of r), size]
    const rocks: [Pt, number][] = [[[-0.5, 0.2], 3.2], [[0.1, -0.6], 2.6], [[0.6, 0.1], 3.6], [[-0.1, 0.65], 2.4], [[-0.62, -0.35], 2.8], [[0.45, -0.5], 2.2], [[0.3, 0.55], 3], [[-0.4, 0.55], 2]]
    const quarters = !ringed ? [] : [
        { d: `M${-rx} 0 A${rx} ${ry} 0 0 1 0 ${-ry}`, c: [-rx * 0.55, -ry * 0.8] as Pt },
        { d: `M0 ${-ry} A${rx} ${ry} 0 0 1 ${rx} 0`, c: [rx * 0.55, -ry * 0.8] as Pt },
        { d: `M${-rx} 0 A${rx} ${ry} 0 0 0 0 ${ry}`, c: [-rx * 0.55, ry * 0.8] as Pt },
        { d: `M0 ${ry} A${rx} ${ry} 0 0 0 ${rx} 0`, c: [rx * 0.55, ry * 0.8] as Pt },
    ]
    // the starburst: spiky, cartoon-style
    const star = (n: number, ro_: number, ri: number) => `M${Array.from({ length: n * 2 }, (_, i) => {
        const a = (i / (n * 2)) * Math.PI * 2 - Math.PI / 2, t = i % 2 ? ri : ro_
        return `${f2(Math.cos(a) * t)} ${f2(Math.sin(a) * t)}`
    }).join(' L')} Z`
    const burstScale = (to: number, a0 = 0) => (
        <animateTransform attributeName="transform" type="scale" values={`0.1;0.1;${to};${to * 1.15};${to * 1.2}`} keyTimes={k(0, hit + a0, hit + a0 + 0.22, hit + a0 + 0.9, dur)} calcMode="spline" keySplines="0 0 1 1;0.1 0.8 0.3 1;0.3 0 0.7 1;0 0 1 1" {...loop} />
    )
    const shake = ['0 0', '0 0', '-3 2', '3 -2', '-2.5 -1.5', '2 2', '-1.5 1', '1 -1', '0 0', '0 0']
    const shakeT = [0, hit, hit + 0.06, hit + 0.12, hit + 0.2, hit + 0.3, hit + 0.42, hit + 0.55, hit + 0.7, dur]

    return (
        <P {...p}>
            <defs>
                {chunks.map(c => <clipPath key={c.id} id={`pb${uid}${c.id}`}><path d={poly(c.pts, r)} /></clipPath>)}
            </defs>
            <g>
                <animateTransform attributeName="transform" type="translate" values={shake.join(';')} keyTimes={k(...shakeT)} {...loop} />

                {/* the whole planet, until the blast; it comes back (growing, fading in) for the next cycle */}
                <g>
                    <animate attributeName="opacity" values="1;1;0;0;1;1" keyTimes={k(0, hit - dur * EPS, hit, back0, back1, dur)} {...loop} />
                    <animateTransform attributeName="transform" type="scale" values="1;1;0.8;1;1" keyTimes={k(0, hit, back0, back1, dur)} {...loop} />
                    {whole}
                </g>

                {/* the pieces: chunks, ring arcs, loose rocks */}
                {chunks.map((c, i) => {
                    const ctr = rotPt(centroid(c.pts).map(v => v * r) as Pt, tilt)
                    const dist = Math.hypot(ctr[0] - at[0], ctr[1] - at[1])
                    const sgn = i % 2 ? 1 : -1
                    return (
                        <Thrown key={c.id} c={ctr} mag={Math.max(28, 80 - dist * 0.34)} spin={sgn * (70 + i * 23)} tumble={sgn * (26 + i * 5)} drift={9 + (i % 3) * 3}>
                            <g transform={`rotate(${tilt})`}>
                                <path d={poly(c.pts, r)} {...disc} />
                                <g clipPath={`url(#pb${uid}${c.id})`}><Details r={r} glow look={look} /></g>
                                <path d={poly(c.pts, r)} {...F} fill="none" />
                            </g>
                        </Thrown>
                    )
                })}
                {quarters.map((q, i) => {
                    const ctr = rotPt(q.c, tilt)
                    return (
                        <Thrown key={`q${i}`} c={ctr} mag={70} spin={(i % 2 ? 1 : -1) * 120} tumble={(i % 2 ? 1 : -1) * 40} drift={14}>
                            <g transform={`rotate(${tilt})`}><path d={q.d} {...L} strokeWidth={1.2} /></g>
                        </Thrown>
                    )
                })}
                {/* a sun's rays: each flies off on its own, like a splinter of light */}
                {sun && Array.from({ length: RAYS }, (_, i) => {
                    const [a, b] = rayAt(i)
                    const mid: Pt = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
                    return (
                        <Thrown key={`ray${i}`} c={mid} mag={84 + (i % 3) * 16} spin={(i % 2 ? 1 : -1) * (160 + i * 14)} tumble={(i % 2 ? 1 : -1) * 60} drift={14}>
                            <line x1={f2(a[0])} y1={f2(a[1])} x2={f2(b[0])} y2={f2(b[1])} {...L} strokeWidth={1.2} />
                        </Thrown>
                    )
                })}
                {rocks.map(([s0, sz], i) => {
                    const start = rotPt([s0[0] * r, s0[1] * r], tilt)
                    return (
                        <Thrown key={`r${i}`} c={start} mag={92 + (i % 3) * 18} spin={(i % 2 ? 1 : -1) * (200 + i * 40)} tumble={(i % 2 ? 1 : -1) * 70} drift={16}>
                            <path transform={`translate(${f2(start[0])} ${f2(start[1])}) scale(${sz})`} d={i % 2 ? 'M-1.6 -0.9 L1.5 -1.3 L1.9 0.8 L-0.4 1.5 L-1.9 0.4 Z' : 'M-1.3 -1.2 L1.2 -1.5 L1.7 0.5 L0.2 1.6 L-1.7 0.8 Z'}
                                  {...F} strokeWidth={0.5} />
                        </Thrown>
                    )
                })}

                {/* the blast, at the landing point */}
                <g transform={`translate(${f2(at[0])} ${f2(at[1])})`}>
                    {/* the flash */}
                    <circle r={10} {...GLOW} opacity={0}>
                        <animate attributeName="r" values="6;6;70;96;96" keyTimes={k(0, hit, hit + 0.3, hit + 1.2, dur)} {...loop} />
                        <animate attributeName="opacity" values="0;0;0.8;0.4;0;0" keyTimes={k(0, hit, hit + 0.12, hit + 0.5, hit + 1.2, dur)} {...loop} />
                    </circle>
                    {/* the shock ring */}
                    <circle r={10} fill="none" stroke="var(--scene-warm)" strokeWidth={3.5} opacity={0}>
                        <animate attributeName="r" values="8;8;40;96;110" keyTimes={k(0, hit, hit + 0.35, hit + 1.4, dur)} calcMode="spline" keySplines="0 0 1 1;0.1 0.7 0.3 1;0.2 0.5 0.5 1;0 0 1 1" {...loop} />
                        <animate attributeName="opacity" values="0;0;1;0.6;0;0" keyTimes={k(0, hit, hit + 0.05, hit + 0.8, hit + 1.5, dur)} {...loop} />
                        <animate attributeName="stroke-width" values="3.5;3.5;3.5;0.6;0.6" keyTimes={k(0, hit, hit + 0.35, hit + 1.5, dur)} {...loop} />
                    </circle>
                    {/* the starburst: a big warm one with a smaller bright one inside */}
                    <g opacity={0}>
                        <animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes={k(0, hit, hit + 0.04, hit + 0.55, hit + 1.1, dur)} {...loop} />
                        <g>
                            {burstScale(1)}
                            <path d={star(13, 40, 17)} {...WARM} stroke="currentColor" strokeWidth={1.6} strokeLinejoin="round" />
                        </g>
                    </g>
                    <g opacity={0}>
                        <animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes={k(0, hit + 0.04, hit + 0.08, hit + 0.4, hit + 0.85, dur)} {...loop} />
                        <g>
                            {burstScale(0.62, 0.04)}
                            <path d={star(10, 40, 18)} {...GLOW} stroke="currentColor" strokeWidth={1.1} strokeLinejoin="round" />
                        </g>
                    </g>
                    {/* sparks */}
                    {Array.from({ length: 14 }, (_, i) => {
                        const a = (i / 14) * Math.PI * 2 + 0.2, d = 62 + (i % 4) * 20
                        const ex = f2(Math.cos(a) * d), ey = f2(Math.sin(a) * d)
                        return (
                            <circle key={i} r={i % 2 ? 1.6 : 2.5} {...(i % 2 ? WARM : DOT)} opacity={0}>
                                <animate attributeName="cx" values={`0;0;${ex};${f2(Math.cos(a) * d * 1.25)};${f2(Math.cos(a) * d * 1.25)}`} keyTimes={k(0, hit, hit + 0.7, hit + 2.2, dur)} calcMode="spline" keySplines="0 0 1 1;0.1 0.7 0.3 1;0.3 0.2 0.7 1;0 0 1 1" {...loop} />
                                <animate attributeName="cy" values={`0;0;${ey};${f2(Math.sin(a) * d * 1.25 + 10)};${f2(Math.sin(a) * d * 1.25 + 10)}`} keyTimes={k(0, hit, hit + 0.7, hit + 2.2, dur)} calcMode="spline" keySplines="0 0 1 1;0.1 0.7 0.3 1;0.3 0.2 0.7 1;0 0 1 1" {...loop} />
                                <animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes={k(0, hit, hit + 0.03, hit + 0.8, hit + 2.2, dur)} {...loop} />
                            </circle>
                        )
                    })}
                    {/* billowing smoke puffs: they swell, drift out and thin away slowly */}
                    {[[-34, -22, 0.5], [30, -30, 0.58], [-48, 14, 0.46], [46, 10, 0.5], [0, -50, 0.54], [-12, 30, 0.42], [20, 38, 0.4]].map(([x, y, sc], i) => (
                        <g key={i} opacity={0}>
                            <animate attributeName="opacity" values="0;0;0.95;0.7;0;0" keyTimes={k(0, hit + 0.12, hit + 0.5, hit + 2.4, hit + 4.2, dur)} {...loop} />
                            <g>
                                <animateTransform attributeName="transform" type="translate" values={`0 0;0 0;${x} ${y};${x * 1.35} ${y * 1.35 - 8};${x * 1.35} ${y * 1.35 - 8}`} keyTimes={k(0, hit, hit + 1.2, hit + 4.2, dur)} calcMode="spline" keySplines="0 0 1 1;0.1 0.7 0.3 1;0.3 0.2 0.7 1;0 0 1 1" {...loop} />
                                <g>
                                    <animateTransform attributeName="transform" type="scale" values="0.2;0.2;1;1.45;1.45" keyTimes={k(0, hit, hit + 1.2, hit + 4.2, dur)} {...loop} />
                                    <Cloud s={sc as number} tint={smokeTint} />
                                </g>
                            </g>
                        </g>
                    ))}
                </g>
            </g>
        </P>
    )
}