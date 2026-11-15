/** Space world cast: the Millennium Falcon (with an open top hatch), Chewbacca (bust, popping out of it) and an Imperial Star Destroyer. House style: outline + flat fill, theme tokens only. */
import type { ReactNode } from 'react'
import { DOT, F, GLOW, L, Limb, P, SHADE, type PlaceProps } from './core'

const HULL = 'color-mix(in srgb, var(--sc-rocket) 70%, var(--scene-fill))'
const HULL_D = 'color-mix(in srgb, var(--sc-rocket) 46%, var(--sc-line))'
const PATCH = 'color-mix(in srgb, var(--sc-accent) 55%, var(--sc-rocket))'
const CHEW = 'color-mix(in srgb, var(--sc-trunk) 72%, var(--sc-door))'
const CHEW_L = 'color-mix(in srgb, var(--sc-sign) 62%, var(--sc-trunk))'
const SD_GREY = 'color-mix(in srgb, var(--sc-line) 20%, var(--sc-cloud))'

/**
 * The Millennium Falcon seen from the side-and-above, nose to the RIGHT, ~146 wide, resting on three struts (origin = ground under the middle of the hull):
 * a thick lens of a hull, two mandibles and the cockpit tube out front, a radar dish on top, a glowing engine strip at the back (−64, −26) and an open
 * top hatch at (−24, −44) — `hatch` is drawn inside it (between the back and front of the rim). The cable port is at (−52, −22).
 */
export function Falcon({ hatch, ...p }: PlaceProps & { hatch?: ReactNode }) {
    return (
        <P {...p}>
            {/* landing struts and pads */}
            <path d="M-40 -16 L-44 -1 M2 -14 L2 -1 M40 -18 L44 -1" {...L} strokeWidth={1.6} />
            <path d="M-50 0 H-37 M-4 0 H8 M38 0 H50" {...L} strokeWidth={2} />
            {/* the mandibles, then the cockpit tube above them */}
            <path d="M44 -34 L86 -31 L86 -26.6 L50 -26 Z" {...F} fill={HULL} />
            <path d="M44 -25.4 L86 -23.4 L86 -19 L50 -19.6 Z" {...F} fill={HULL_D} />
            <path d="M52 -26.6 L84 -26 M52 -19.2 L84 -19" {...L} strokeWidth={0.8} opacity={0.45} />
            <path d="M30 -41 H70 Q76 -41 76 -37.4 Q76 -34 70 -34 H30 Z" {...F} fill={HULL} />
            <path d="M70 -41 Q77 -41 77 -37.6 Q77 -34 70 -34 Z" {...F} fill="var(--sc-glass)" strokeWidth={1.1} />
            <path d="M36 -38.6 H66" {...L} strokeWidth={0.8} opacity={0.45} />
            {/* the hull: a thick lens, lighter on top, a shaded belly, panel lines and a few rust-coloured patches */}
            <path d="M-64 -26 C-64 -40 -32 -47 6 -47 C42 -47 58 -40 60 -30 C58 -20 42 -13 6 -13 C-32 -13 -64 -16 -64 -26 Z" {...F} fill={HULL} />
            <path d="M-64 -26 C-64 -16 -32 -13 6 -13 C42 -13 58 -20 60 -30 L6 -26 Z" {...SHADE} />
            <path d="M-56 -30 C-34 -42 20 -43 52 -34" {...L} strokeWidth={0.9} opacity={0.4} fill="none" />
            <path d="M-50 -22 C-24 -17 24 -17 50 -24" {...L} strokeWidth={0.9} opacity={0.4} fill="none" />
            <path d="M-22 -41 V-18 M16 -42 V-17" {...L} strokeWidth={0.8} opacity={0.3} />
            <rect x={-8} y={-38} width={9} height={5} rx={1} fill={PATCH} stroke="currentColor" strokeWidth={0.7} opacity={0.85} />
            <rect x={26} y={-30} width={11} height={4} rx={1} fill={PATCH} stroke="currentColor" strokeWidth={0.7} opacity={0.7} />
            <rect x={-40} y={-24} width={8} height={4} rx={1} fill={HULL_D} stroke="currentColor" strokeWidth={0.7} />
            {/* the engine strip across the back, and the cable port */}
            <path d="M-64 -34 Q-69 -26 -64 -18 L-59.4 -19.6 Q-63 -26 -59.4 -32.4 Z" {...F} fill="var(--sc-glass)" strokeWidth={1.1} />
            <circle cx={-52} cy={-22} r={2.4} {...F} fill="var(--sc-door)" strokeWidth={1} />
            {/* radar dish on its stalk */}
            <path d="M-8 -46 V-54" {...L} strokeWidth={1.2} />
            <ellipse cx={-8} cy={-55} rx={7.4} ry={2.6} transform="rotate(-14 -8 -55)" {...F} fill={HULL} strokeWidth={1.1} />
            {/* the open top hatch: back rim, whoever is in it, then the front lip */}
            <ellipse cx={-24} cy={-44} rx={11} ry={3.4} {...F} fill="var(--sc-door)" strokeWidth={1.1} />
            {hatch}
            <path d="M-35 -44 A11 3.4 0 0 0 -13 -44 L-14.6 -45.4 A9.4 2.6 0 0 1 -33.4 -45.4 Z" {...F} fill={HULL} strokeWidth={1.1} />
        </P>
    )
}
