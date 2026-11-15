/** Small props that say what an About-card or project section is about (binoculars, medal, hourglass, telescope …). */
import { DOT, F, GLOW, L, P, type PlaceProps, WARM } from './core'

/* ───── Added in the Nature pass: three small props for the About card marks ───── */

/** Binoculars — "attended, watched how the real thing is done" (Conferences). */
export function Binoculars(p: PlaceProps) {
    return (
        <P {...p}>
            <path d="M-13 -31 Q0 -45 13 -31" {...L} strokeWidth={1.1} opacity={0.7} />
            <rect x={-21} y={-32} width={15} height={32} rx={5.5} {...F} />
            <rect x={6} y={-32} width={15} height={32} rx={5.5} {...F} />
            <rect x={-7} y={-22} width={14} height={8} rx={2.5} {...F} />
            <path d="M-21 -26 H-6 M6 -26 H21" {...L} strokeWidth={1} opacity={0.55} />
            <circle cx={-13.5} cy={-9} r={4.6} {...F} />
            <circle cx={13.5} cy={-9} r={4.6} {...F} />
            <circle cx={-13.5} cy={-9} r={2.2} {...GLOW} opacity={0.9} />
            <circle cx={13.5} cy={-9} r={2.2} {...GLOW} opacity={0.9} />
        </P>
    )
}

/** Award medal — certifications and practice streaks (Coding Profiles). */
export function Medal(p: PlaceProps) {
    return (
        <P {...p}>
            <path d="M-9 -28 L-14 -46 L-4 -43 L0 -28 Z" {...F} />
            <path d="M9 -28 L14 -46 L4 -43 L0 -28 Z" {...F} />
            <path d="M-9 -28 L-14 -46 L-4 -43 L0 -28 Z" {...WARM} opacity={0.55} />
            <path d="M9 -28 L14 -46 L4 -43 L0 -28 Z" {...WARM} opacity={0.55} />
            <circle cx={0} cy={-15} r={14} {...F} />
            <circle cx={0} cy={-15} r={9.5} {...L} strokeWidth={1} opacity={0.5} />
            <path d="M0 -23 L2.4 -17.4 L8.4 -16.8 L3.9 -12.8 L5.2 -6.9 L0 -10 L-5.2 -6.9 L-3.9 -12.8 L-8.4 -16.8 L-2.4 -17.4 Z" {...WARM} />
        </P>
    )
}

/** Packed rucksack — "the toolkit I carry" (Skills). */
export function Backpack(p: PlaceProps) {
    return (
        <P {...p}>
            <path d="M-6 -43 Q0 -54 6 -43" {...L} />
            <path d="M-12 -30 Q-21 -22 -12 -5 M12 -30 Q21 -22 12 -5" {...L} strokeWidth={1.2} />
            <path d="M-12 0 V-30 Q-12 -43 0 -43 Q12 -43 12 -30 V0 Z" {...F} />
            <path d="M-12 -26 H12" {...L} />
            <rect x={-7} y={-19} width={14} height={13} rx={3} {...F} fill="var(--scene-warm)" />
            <path d="M-4 -12.5 H4" {...L} strokeWidth={1} opacity={0.6} />
        </P>
    )
}

/** Mission patch — the Space-world partner of the Nature medal (Coding Profiles): a crest with an orbit and a star. */
export function MissionPatch(p: PlaceProps) {
    return (
        <P {...p}>
            <circle cx={0} cy={-18} r={17} {...F} />
            <circle cx={0} cy={-18} r={13} {...L} strokeWidth={1} opacity={0.5} />
            <ellipse cx={0} cy={-18} rx={13} ry={4.5} transform="rotate(-24 0 -18)" {...L} strokeWidth={1.1} />
            <circle cx={0} cy={-18} r={4.4} {...GLOW} />
            <circle cx={10} cy={-24.5} r={1.8} {...WARM} />
            <path d="M-6 0 H6" {...L} strokeWidth={1} opacity={0.5} />
        </P>
    )
}


/* ───── Added in the graphics review: three props that say what their section actually is ───── */

/** Hourglass — "building against the clock" (Hackathons, Nature side). The sand is the warm accent. */
export function Hourglass(p: PlaceProps) {
    return (
        <P {...p}>
            <path d="M-10 -46 C-10 -32 -2 -28 -2 -23 C-2 -18 -10 -14 -10 0 H10 C10 -14 2 -18 2 -23 C2 -28 10 -32 10 -46 Z" {...F} />
            <path d="M-7 -44 C-7 -36 -2 -32 0 -29 C2 -32 7 -36 7 -44 Z" {...WARM} opacity={0.9} />
            <path d="M0 -27 V-11" stroke="var(--scene-warm)" strokeWidth={1.2} strokeLinecap="round" fill="none" />
            <path d="M-7.5 -1 Q0 -13 7.5 -1 Z" {...WARM} opacity={0.9} />
            <path d="M-14 -47 H14 M-14 1 H14" {...L} strokeWidth={2.2} />
        </P>
    )
}

/** Stopwatch — the mission clock (Hackathons, Space side). */
export function Stopwatch(p: PlaceProps) {
    return (
        <P {...p}>
            <rect x={-3.5} y={-47} width={7} height={5} rx={1.5} {...F} />
            <path d="M12 -38 L16 -42" {...L} strokeWidth={2} />
            <circle cx={0} cy={-23} r={19} {...F} />
            <circle cx={0} cy={-23} r={15} {...L} strokeWidth={1} opacity={0.5} />
            <path d="M0 -36 V-33 M13 -23 H10 M0 -10 V-13 M-13 -23 H-10" {...L} strokeWidth={1.2} opacity={0.7} />
            <path d="M0 -23 L8 -31" stroke="var(--scene-warm)" strokeWidth={2} strokeLinecap="round" fill="none" />
            <circle cx={0} cy={-23} r={2.2} {...DOT} />
        </P>
    )
}

/** Telescope on a tripod — learning by looking further (Education, Space side). */
export function Telescope(p: PlaceProps) {
    return (
        <P {...p}>
            <path d="M0 -17 L-13 0 M0 -17 L13 0 M0 -17 V0" {...L} />
            <g transform="rotate(-32 0 -19)">
                <rect x={-24} y={-24} width={40} height={10} rx={3} {...F} />
                <path d="M16 -28 L28 -31 V-7 L16 -10 Z" {...F} />
                <rect x={-30} y={-22} width={6} height={6} rx={1.5} {...F} />
                <path d="M-6 -24 V-14" {...L} strokeWidth={1} opacity={0.55} />
                <circle cx={26} cy={-19} r={2.2} {...WARM} />
            </g>
        </P>
    )
}
