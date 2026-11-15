/** SPACE — planets, rocket, astronaut, alien, UFO, satellite, rover, comets and the launch tower. */
import type { CSSProperties, ReactNode } from 'react'
import { DOT, F, GLOW, Halo, L, Limb, P, type PlaceProps, SHADE, WARM } from './core'
import { r2 } from './nature'

/* ═══════════════════════════════════════════════════════════════════════
   SPACE
═══════════════════════════════════════════════════════════════════════ */

export function Planet({ r = 40, ring = false, bands = 0, tilt = -18, glow = false, ...p }: PlaceProps & { r?: number; ring?: boolean; bands?: number; tilt?: number; glow?: boolean }) {
    const rx = r * 1.75
    const ry = r * 0.3
    return (
        <P {...p}>
            {glow && <Halo r={r * 2.4} a={0.8} />}
            <g transform={`rotate(${tilt})`}>
                {ring && <path d={`M${-rx} 0 A${rx} ${ry} 0 0 1 ${rx} 0`} {...L} strokeWidth={1.2} />}
                <circle r={r} {...F} />
                {glow && <circle r={r} {...GLOW} opacity={0.22} />}
                {Array.from({ length: bands }, (_, i) => {
                    const y = r2(-r * 0.5 + (i * r) / Math.max(bands, 1) * 0.95)
                    const half = r2(Math.sqrt(Math.max(r * r - y * y, 0)) * 0.94)
                    return <path key={i} d={`M${-half} ${y} Q0 ${y + r * 0.14} ${half} ${y}`} {...L} strokeWidth={1} opacity={0.55} />
                })}
                {ring && <path d={`M${-rx} 0 A${rx} ${ry} 0 0 0 ${rx} 0`} {...L} strokeWidth={1.2} />}
            </g>
        </P>
    )
}

export function Moon({ r = 26, ...p }: PlaceProps & { r?: number }) {
    return (
        <P {...p}>
            <circle r={r} {...F} />
            <ellipse cx={-r * 0.3} cy={-r * 0.25} rx={r * 0.22} ry={r * 0.18} {...L} strokeWidth={1} opacity={0.7} />
            <ellipse cx={r * 0.35} cy={r * 0.2} rx={r * 0.16} ry={r * 0.13} {...L} strokeWidth={1} opacity={0.7} />
            <ellipse cx={-r * 0.1} cy={r * 0.5} rx={r * 0.1} ry={r * 0.08} {...L} strokeWidth={1} opacity={0.7} />
        </P>
    )
}

export function Sparkle({ delay = 0, ...p }: PlaceProps & { delay?: number }) {
    return (
        <P {...p}>
            <g className="scene-twinkle" style={{ animationDelay: `${delay}s` }}>
                <path d="M0 -7 Q1 -1 7 0 Q1 1 0 7 Q-1 1 -7 0 Q-1 -1 0 -7 Z" {...DOT} />
            </g>
        </P>
    )
}

/** Launch vehicle, ~88 tall × 18 wide (≈ 1 : 5 — a slender stack, not a stubby capsule), engine bell at the origin so it
 *  stands on a pad with one translate. Light body, orange ogive nose and swept fins, a yellow band, a blue stripe,
 *  a glass porthole, a dark nozzle. `flame` draws the exhaust plume below the nozzle (the hero turns it on only
 *  after ignition, so it passes `flame={false}` and animates its own). */
export function Rocket({ flame = true, ...p }: PlaceProps & { flame?: boolean }) {
    return (
        <P {...p}>
            {flame && (
                <g className="scene-flicker">
                    <path d="M-5.5 0 Q0 32 5.5 0 Z" {...WARM} opacity={0.92} />
                    <path d="M-2.8 0 Q0 16 2.8 0 Z" {...GLOW} />
                </g>
            )}
            <path d="M-4.6 -9 L-6.8 0 H6.8 L4.6 -9 Z" {...F} fill="var(--sc-door)" strokeWidth={1.1} />
            <path d="M-9 -34 L-21.5 -2 L-9 -11 Z M9 -34 L21.5 -2 L9 -11 Z" {...F} fill="var(--sc-accent)" />
            <path d="M-9 -64 V-9 H9 V-64 Q9 -76 0 -88 Q-9 -76 -9 -64 Z" {...F} fill="var(--sc-rocket)" />
            <path d="M3.4 -83 Q9 -75 9 -64 V-9 H3.4 Z" {...SHADE} />
            <path d="M0 -88 Q9 -76 9 -64 H-9 Q-9 -76 0 -88 Z" {...F} fill="var(--sc-accent)" strokeWidth={1.2} />
            <path d="M-9 -21 H9 V-15 H-9 Z" {...F} fill="var(--scene-glow)" strokeWidth={1} />
            <path d="M-9 -36 H9 V-33 H-9 Z" {...F} fill="var(--sc-panel)" strokeWidth={0.9} />
            <circle cx={0} cy={-50} r={4.6} {...F} fill="var(--sc-glass)" />
            <path d="M-2.2 -52 Q0 -54.2 2.4 -52.6" stroke="var(--sc-rocket)" strokeWidth={1} strokeLinecap="round" fill="none" />
        </P>
    )
}

/** Standing astronaut, feet at the origin (~64 tall): backpack, rounded helmet with a glass visor, chest control
 *  box, outlined arms and legs, warm boot stripes. `wave` raises the right arm; `volley` makes both arms their own
 *  groups (.sp-arm) so the volleyball strip can swing them up for the hit (shoulders sit at the top inner corner
 *  of each arm — that is the pivot the CSS rotates about). */
export function Astronaut({ volley = false, wave = !volley, ...p }: PlaceProps & { wave?: boolean; volley?: boolean }) {
    const arm = (d: string, origin: 'a' | 'b', up: string) => {
        const limb = <Limb d={d} w={6} />
        return volley
            ? <g className={`sp-arm sp-arm--${origin}`} style={{ ['--arm-up' as string]: up } as CSSProperties}>{limb}</g>
            : limb
    }
    const hand = (cx: number, cy: number) => <circle cx={cx} cy={cy} r={2.8} {...F} strokeWidth={1.1} />
    return (
        <P {...p}>
            {/* zero-g hover: a soft shadow stays on the ground while the suit bobs and drifts above it (not in the sports strip) */}
            {!volley && <ellipse className="scene-astro-shadow" cx={0} cy={0.5} rx={11} ry={2.2} fill="currentColor" opacity={0.16} />}
            <g className={volley ? undefined : 'scene-astro-float'}>
                {/* life-support pack behind the shoulders */}
                <rect x={-17} y={-46} width={11} height={26} rx={3.5} {...F} />
                <path d="M-14.5 -40 H-8.5 M-14.5 -35 H-8.5" {...L} strokeWidth={1} opacity={0.55} />
                {/* legs + boots */}
                <Limb d="M-4.6 -17 V-5" w={7} />
                <Limb d="M4.6 -17 V-5" w={7} />
                <path d="M-9.4 -1.2 H-0.2 M0.2 -1.2 H9.4" {...L} strokeWidth={3.6} />
                <path d="M-8.4 -4.2 H-0.8 M0.8 -4.2 H8.4" stroke="var(--scene-warm)" strokeWidth={1.4} strokeLinecap="round" fill="none" />
                {/* torso */}
                <path d="M-11.5 -44 Q0 -48.5 11.5 -44 L12.5 -17 Q0 -12 -12.5 -17 Z" {...F} />
                <path d="M-12 -21 Q0 -16.5 12 -21" {...L} strokeWidth={1} opacity={0.55} />
                <rect x={-6.5} y={-39} width={13} height={9} rx={2} {...F} strokeWidth={1.1} />
                <circle cx={-2.6} cy={-34.5} r={1.5} {...WARM} />
                <circle cx={2.6} cy={-34.5} r={1.5} {...GLOW} />
                {/* arms: the right arm waves (and swings, if motion is allowed) */}
                {arm('M-10 -40 L-18 -27', 'a', '-130deg')}
                {hand(-18.4, -26)}
                {wave && !volley ? (
                    <g className="scene-wave"><Limb d="M10 -40 L21 -54" w={6} />{hand(21.4, -55)}</g>
                ) : (
                    <>{arm('M10 -40 L18 -27', 'b', '-100deg')}{hand(18.4, -26)}</>
                )}
                {/* neck ring + helmet */}
                <path d="M-7 -45 H7" {...L} strokeWidth={2} />
                <circle cx={0} cy={-56} r={13.5} {...F} />
                <path d="M-9 -64 A13.5 13.5 0 0 1 3 -69" {...L} strokeWidth={1} opacity={0.5} />
                <path d="M-7 -57 C-7 -64 8 -64 9 -57 C9.5 -51 -7 -50 -7 -57 Z" fill="var(--sc-glass)" stroke="currentColor" strokeWidth={1.2} strokeLinejoin="round" />
                <path d="M-3.5 -60.5 Q0 -62.8 4.6 -61" stroke="var(--sc-rocket)" strokeWidth={1.3} strokeLinecap="round" fill="none" opacity={0.85} />
                <path d="M-4 -53.5 Q1 -51.8 6 -54" stroke="var(--scene-warm)" strokeWidth={1} strokeLinecap="round" fill="none" opacity={0.7} />
            </g>
        </P>
    )
}

/** Friendly alien, feet at the origin (~62 tall): big bulb head, two almond eyes and twin antennae, drawn purely in
 *  the house outline on the paper fill — no colour fill. `volley` makes the arms and antennae animated groups
 *  (.sp-arm / .sp-antenna) for the volleyball strip. */
export function Alien({ volley = false, ...p }: PlaceProps & { volley?: boolean }) {
    // saturated green skin (own tint, not mixed with the paper — that washed it out), paper-white suit like the astronaut's
    const SKIN = 'color-mix(in srgb, var(--sc-alien) 62%, #2f9d57)'
    const SKIN_DK = 'color-mix(in srgb, var(--sc-alien) 40%, #14602f)'
    const EYE = '#16202b'
    const OUT = 1.9
    const arm = (d: string, origin: 'a' | 'b', up: string) => {
        const limb = <Limb d={d} w={5.8} fill={SKIN} />
        return volley
            ? <g className={`sp-arm sp-arm--${origin}`} style={{ ['--arm-up' as string]: up } as CSSProperties}>{limb}</g>
            : limb
    }
    return (
        <P {...p}>
            {/* antennae */}
            <g className={volley ? 'sp-antenna' : undefined}>
                <path d="M-6 -54 Q-9 -61 -13 -63 M6 -54 Q9 -61 13 -63" {...L} strokeWidth={1.5} />
                <circle cx={-13.6} cy={-64} r={2.6} {...F} fill="var(--scene-warm)" strokeWidth={1.4} />
                <circle cx={13.6} cy={-64} r={2.6} {...F} fill="var(--scene-glow)" strokeWidth={1.4} />
            </g>
            {/* legs + boots with the astronaut's warm stripe */}
            <Limb d="M-3.6 -12 V-2" w={5.6} fill={SKIN} />
            <Limb d="M3.6 -12 V-2" w={5.6} fill={SKIN} />
            <path d="M-9 -0.8 H-1 M1 -0.8 H9" {...L} strokeWidth={3.8} />
            <path d="M-8 -3.6 H-1.2 M1.2 -3.6 H8" stroke="var(--scene-warm)" strokeWidth={1.4} strokeLinecap="round" fill="none" />
            {/* suit: paper white, chest control box, shaded side */}
            <path d="M-9 -27 Q0 -30.6 9 -27 L8 -10 Q0 -6.6 -8 -10 Z" {...F} strokeWidth={OUT} />
            <path d="M3.6 -28 Q7 -27.6 9 -27 L8 -10 Q5.8 -9 3.6 -8.6 Z" {...SHADE} />
            <rect x={-4.4} y={-24} width={8.8} height={6.4} rx={1.6} {...F} strokeWidth={1.2} />
            <circle cx={-1.7} cy={-20.8} r={1.1} {...WARM} />
            <circle cx={1.7} cy={-20.8} r={1.1} {...GLOW} />
            {/* arms (green hands out of paper sleeves) */}
            {arm('M-8 -25 L-16 -16', 'a', '100deg')}
            {arm('M8 -25 L16 -16', 'b', '-100deg')}
            {/* the head: a big inverted egg — wide cranium tapering to a small chin */}
            <path d="M0 -60 C15 -60 24 -50 21 -40 C19 -33 10 -27 0 -26 C-10 -27 -19 -33 -21 -40 C-24 -50 -15 -60 0 -60 Z" fill={SKIN} stroke="currentColor" strokeWidth={OUT} strokeLinejoin="round" />
            <path d="M10 -58 C20 -53 22.4 -44 19 -37 C16 -32 11 -29 6 -27.6 C13 -35 14 -47 10 -58 Z" fill={SKIN_DK} opacity={0.55} stroke="none" />
            <path d="M-12 -55 Q-8 -58 -3 -58" stroke="#fff" strokeWidth={1.6} strokeLinecap="round" fill="none" opacity={0.7} />
            {/* huge slanted almond eyes, dark with a glint */}
            <path d="M-17 -45 C-12 -49 -4 -42 -2.6 -36.6 C-9 -35.2 -16 -39.6 -17 -45 Z" fill={EYE} stroke="currentColor" strokeWidth={1.3} strokeLinejoin="round" />
            <path d="M17 -45 C12 -49 4 -42 2.6 -36.6 C9 -35.2 16 -39.6 17 -45 Z" fill={EYE} stroke="currentColor" strokeWidth={1.3} strokeLinejoin="round" />
            <circle cx={-10.4} cy={-42.4} r={1.4} fill="#fff" opacity={0.9} />
            <circle cx={9.2} cy={-42.4} r={1.4} fill="#fff" opacity={0.9} />
            {/* nostrils + small mouth */}
            <path d="M-1.2 -34 h0.1 M1.2 -34 h0.1" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" />
            <path d="M-2.6 -30.2 Q0 -28.6 2.6 -30.2" {...L} strokeWidth={1.3} />
        </P>
    )
}

export function Ufo({ beam = false, pods = false, rider, ...p }: PlaceProps & { beam?: boolean; pods?: boolean; rider?: ReactNode }) {
    const HULL = 'color-mix(in srgb, var(--sc-rocket) 80%, var(--scene-fill))'
    return (
        <P {...p}>
            {beam && <path d="M-22 6 L-40 70 H40 L22 6 Z" {...GLOW} opacity={0.14} />}
            {beam && <path d="M-22 6 L-40 70 M22 6 L40 70" {...L} strokeWidth={0.9} strokeDasharray="2 5" opacity={0.6} />}
            {/* three rounded landing pods on short struts, tucked under the hull */}
            {pods && [-27, 0, 27].map(x => (
                <g key={x}>
                    <path d={`M${x} ${x ? 8 : 11} V16`} {...L} strokeWidth={1.6} />
                    <ellipse cx={x} cy={18.4} rx={5.6} ry={3.2} {...F} fill={HULL} />
                </g>
            ))}
            {/* glass dome, a little pilot's glint */}
            <path d="M-24 -8 C-22 -32 22 -32 24 -8 Z" {...F} fill="var(--sc-glass)" />
            {rider && <>{rider}<path d="M-24 -8 C-22 -32 22 -32 24 -8 Z" {...F} fill="var(--sc-glass)" opacity={0.3} /></>}
            <path d="M-15 -17 Q-9 -26 -1 -26.6" stroke="#fff" strokeWidth={1.4} strokeLinecap="round" fill="none" opacity={0.6} />
            {/* saucer hull: pale metal, accent belt, shaded underside */}
            <ellipse cx="0" cy="0" rx="46" ry="12" {...F} fill={HULL} />
            <path d="M-45.2 2.4 Q0 17 45.2 2.4 Q41 11.6 0 12 Q-41 11.6 -45.2 2.4 Z" {...SHADE} />
            <path d="M-45.6 -2.6 Q0 8 45.6 -2.6 Q44 3 36 6 Q0 12.6 -36 6 Q-44 3 -45.6 -2.6 Z" fill="var(--sc-accent)" stroke="none" opacity={0.9} />
            <ellipse cx="0" cy="0" rx="46" ry="12" {...L} />
            <circle cx="-26" cy="1.6" r="2.2" {...F} fill="var(--scene-warm)" strokeWidth={1} />
            <circle cx="-9" cy="4.6" r="2.2" {...F} fill="var(--scene-glow)" strokeWidth={1} />
            <circle cx="9" cy="4.6" r="2.2" {...F} fill="var(--scene-warm)" strokeWidth={1} />
            <circle cx="26" cy="1.6" r="2.2" {...F} fill="var(--scene-glow)" strokeWidth={1} />
        </P>
    )
}

/** A coloured satellite: blue solar wings with a lighter cell grid, a gold-foil body with a little glass window and a blinking lamp,
 *  and a dish and mast picked out in the scene's accent. */
export function Satellite(p: PlaceProps) {
    return (
        <P {...p}>
            {/* solar wings */}
            <path d="M-9 -3 H-30 V3 H-9 M9 -3 H30 V3 H9" {...F} fill="var(--sc-panel)" />
            <path d="M-30 -0.2 H-9 M9 -0.2 H30" stroke="var(--sc-glass)" strokeWidth={0.7} opacity={0.55} fill="none" />
            <path d="M-22 -3 V3 M-14 -3 V3 M14 -3 V3 M22 -3 V3" {...L} strokeWidth={0.8} opacity={0.6} />
            {/* body: gold foil, a glass window, a warm stripe */}
            <rect x="-9" y="-6" width="18" height="12" rx="2" {...F} fill="var(--scene-glow)" />
            <rect x="-5.2" y="-3.6" width="6.6" height="5" rx="1" {...F} fill="var(--sc-glass)" strokeWidth={0.9} />
            <path d="M-9 3.6 H9" stroke="var(--scene-warm)" strokeWidth={1.4} opacity={0.8} fill="none" />
            <g className="scene-twinkle"><circle cx={5.6} cy={-2.6} r={1.25} {...WARM} /></g>
            {/* mast and dish */}
            <path d="M0 -6 V-14" {...L} strokeWidth={1.1} />
            <path d="M-5 -18 Q0 -13 5 -18" stroke="var(--sc-accent)" strokeWidth={1.5} strokeLinecap="round" fill="none" />
            <circle cx={0} cy={-14.4} r={1.1} {...WARM} />
        </P>
    )
}

export function Dish({ signal = true, ...p }: PlaceProps & { signal?: boolean }) {
    return (
        <P {...p}>
            <path d="M-9 0 L0 -18 L9 0" {...L} />
            <g transform="rotate(-32 0 -18)">
                <path d="M-17 -30 Q0 -6 17 -30 Z" {...F} />
                <path d="M0 -20 V-38" {...L} strokeWidth={1.1} />
                <circle cx="0" cy="-39" r="1.8" {...WARM} />
            </g>
            {signal && (
                <g className="scene-signal">
                    <path d="M14 -46 a12 12 0 0 1 10 10" {...L} strokeWidth={1.2} />
                    <path d="M18 -55 a22 22 0 0 1 18 18" {...L} strokeWidth={1.2} opacity={0.7} />
                    <path d="M22 -64 a32 32 0 0 1 26 26" {...L} strokeWidth={1.2} opacity={0.45} />
                </g>
            )}
        </P>
    )
}

export function Rover(p: PlaceProps) {
    const HULL = 'color-mix(in srgb, var(--sc-rocket) 82%, var(--scene-fill))'
    const TYRE = 'color-mix(in srgb, var(--sc-door) 78%, var(--scene-fill))'
    return (
        <P {...p}>
            {/* mast + camera head, with a warm lamp */}
            <path d="M8 -20 V-32 H20" {...L} strokeWidth={1.2} />
            <rect x="15.5" y="-36" width="9" height="6.6" rx="1.6" {...F} fill="var(--sc-glass)" strokeWidth={1.1} />
            <circle cx="21" cy="-32.7" r="1.4" {...WARM} />
            {/* solar panel */}
            <path d="M-18 -20 L-20 -27" {...L} strokeWidth={1} />
            <path d="M-30 -30 L-14 -34 L-10 -26 L-26 -22 Z" {...F} fill="var(--sc-panel)" />
            <path d="M-23 -28.4 L-19 -24.4 M-18 -31.6 L-14.6 -27" {...L} strokeWidth={0.8} opacity={0.55} />
            {/* chassis */}
            <path d="M-20 -8 H20 L16 -20 H-12 Z" {...F} fill={HULL} />
            <path d="M-19 -9.6 H19.2 L18.4 -12 H-18 Z" fill="var(--sc-accent)" stroke="none" opacity={0.95} />
            <path d="M-20 -8 H20 L16 -20 H-12 Z" {...L} />
            <path d="M4 -20 L2 -12 H16.6 L16 -20 Z" {...SHADE} />
            <rect x="-6" y="-18" width="8" height="5.2" rx="1.2" {...F} fill="var(--sc-glass)" strokeWidth={1} />
            {/* wheels */}
            {[-13, 0, 13].map(cx => (
                <g key={cx}>
                    <circle cx={cx} cy="-5" r="5.5" {...F} fill={TYRE} />
                    <circle cx={cx} cy="-5" r="2.2" {...F} fill="var(--scene-warm)" strokeWidth={1} />
                </g>
            ))}
        </P>
    )
}

export function Flag({ tone = 'warm', ...p }: PlaceProps & { tone?: 'warm' | 'accent' }) {
    const fill = tone === 'accent' ? 'var(--sc-accent)' : 'var(--scene-warm)'
    return (
        <P {...p}>
            <path d="M0 0 V-42" {...L} strokeWidth={1.6} />
            <path d="M0 -42 H22 Q18 -36 22 -30 H0" fill={fill} stroke="none" />
            <path d="M0 -42 H22 Q18 -36 22 -30 H0" {...L} strokeWidth={1.1} />
        </P>
    )
}

export function Comet({ len = 140, ...p }: PlaceProps & { len?: number }) {
    return (
        <P {...p}>
            <g className="scene-comet">
                <Halo r={16} a={2} />
                <circle r={3.4} {...DOT} />
                <path d={`M-4 3 L${-len} ${len * 0.52}`} {...L} strokeDasharray="1 6" opacity={0.6} />
                <path d={`M-2 -3 L${-len * 0.8} ${len * 0.32}`} {...L} strokeDasharray="1 7" opacity={0.4} />
                <path d={`M-6 6 L${-len * 0.65} ${len * 0.6}`} {...L} strokeDasharray="1 7" opacity={0.4} />
            </g>
        </P>
    )
}

export function Asteroid({ s = 1, ...p }: PlaceProps) {
    return (
        <P s={s} {...p}>
            <path d="M-9 -2 L-3 -9 L6 -7 L10 0 L4 8 L-6 6 Z" {...F} />
            <path d="M-2 -3 l3 1 M2 3 l3 -1" {...L} strokeWidth={0.9} opacity={0.6} />
        </P>
    )
}

/** neural-net-style constellation: nodes + links */
export function Constellation({ nodes, links, ...p }: PlaceProps & { nodes: [number, number][]; links: [number, number][] }) {
    return (
        <P {...p}>
            {links.map(([a, b], i) => (
                <line key={i} x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]} {...L} strokeWidth={0.9} opacity={0.55} strokeDasharray="2 4" />
            ))}
            {nodes.map(([x, y], i) => (
                <g key={i}>
                    <circle cx={x} cy={y} r={i % 3 === 0 ? 5 : 3.4} {...F} />
                    {i % 3 === 0 && <circle cx={x} cy={y} r={1.8} {...GLOW} />}
                </g>
            ))}
        </P>
    )
}

export function Crater({ w = 40, ...p }: PlaceProps & { w?: number }) {
    return (
        <P {...p}>
            <ellipse cx="0" cy="0" rx={w / 2} ry={w / 8} {...L} strokeWidth={1.1} opacity={0.7} />
            <path d={`M${-w / 2 + 3} 1 Q0 ${w / 6} ${w / 2 - 3} 1`} {...L} strokeWidth={0.9} opacity={0.45} />
        </P>
    )
}

/** Launch pad + service tower, proportioned to <Rocket/>. Origin = the pad's centre-line on the ground; the rocket
 *  stands on the slab at the SAME x, 5 units up (rocket y = pad y − 5). The tower rises beside it (≈ 1.3× the rocket's
 *  height), its two swing arms reach the rocket's skin, and a flame trench darkens the slab beneath the engine. */
export function LaunchTower(p: PlaceProps) {
    return (
        <P {...p} bg>
            {/* slab + flame trench */}
            <path d="M-26 0 V-5 H26 V0 Z" {...F} />
            <path d="M-8 -5 H8 V0 H-8 Z" fill="var(--sc-door)" stroke="none" opacity={0.7} />
            <path d="M-14 -5 L-11 -9 M14 -5 L11 -9" {...L} strokeWidth={1.2} />
            {/* tower: two chords, lattice, platforms, lightning mast */}
            <path d="M22 -5 V-114 H34 V-5" {...F} />
            {[-17, -35, -53, -71, -89].map(y => (
                <path key={y} d={`M22 ${y} L34 ${y - 18} M34 ${y} L22 ${y - 18}`} {...L} strokeWidth={0.8} opacity={0.5} />
            ))}
            <path d="M22 -78 H9.4 M22 -52 H9.4" {...L} strokeWidth={2} />
            <path d="M9.4 -81 V-75 M9.4 -55 V-49" {...L} strokeWidth={1.4} />
            <path d="M34 -96 H42 M34 -62 H42" {...L} strokeWidth={1.4} />
            <path d="M28 -114 V-126" {...L} strokeWidth={1.2} />
            <circle cx={28} cy={-127} r={1.8} {...WARM} />
        </P>
    )
}
