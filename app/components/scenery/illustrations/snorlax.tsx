/** Snorlax, the boulder, Ash's pack and a rock (the catch strip's quarry). */
import { F, L, P, type PlaceProps } from './core'

/* ═══════════════════════════════════════════════════════════════════════
   SNORLAX + BOULDER + ASH'S PACK   (the catch strip's quarry — an original, invented creature drawn for the site)
   Snorlax is a huge, round, sleepy teal-blue beast: cream belly and face, two small fangs, curved ears, smooth filled side arms, big
   cream feet with brown pads and white claws. Standing it would be ~6′11″; RESTING like this (slumped back, head on a rock behind
   it) it reads as ~5′1″ — 99 units at s = 1 against Ash's 89 (4′7″), i.e. 1.62 units per inch. Origin: the middle of its seat on
   the ground. Its colours are fixed (like Ash's); the rock is built from theme tokens, so it follows Nature/Space.
═══════════════════════════════════════════════════════════════════════ */
const SNX_BLUE = '#2f7fb0'
const SNX_DK = '#24668f'
const SNX_CREAM = '#f4e3b5'
const SNX_PAD = '#8c5b2e'
export const PACK = '#3f9a55'
const PACK_DK = 'color-mix(in srgb, #1b5c2e 70%, var(--sc-line))'
const ROCK = 'color-mix(in srgb, var(--sc-line) 14%, var(--sc-cloud))'

/** three z's that float up and fade from above the sleeper's head (2.8 s — five rises per 14 s loop); origin as Snorlax's.
 *  `still` draws them fixed and visible (the reduced-motion frame). */
export function Zzz({ still = false, ...p }: PlaceProps & { still?: boolean }) {
    return (
        <P {...p}>
            <g fontStyle="italic" fontWeight={700} fill="currentColor" stroke="none" fontFamily="inherit">
                {[[44, -102, 9, 0], [54, -113, 7.4, 0.9], [63, -122, 6, 1.8]].map(([x, y, fs, d], i) => (
                    <text key={i} x={x} y={y} fontSize={fs} opacity={still ? 0.85 - i * 0.2 : 0}>
                        z
                        {!still && <animate attributeName="opacity" dur="2.8s" begin={`${d}s`} repeatCount="indefinite" values="0;0.9;0" keyTimes="0;0.4;1" />}
                    </text>
                ))}
            </g>
        </P>
    )
}

/** Snorlax, asleep, facing us — drawn entirely from smooth curves: a bell of a body, a big cream belly, filled arms hugging the sides,
 *  two clawed feet, and a wide head with its eyes shut and two small fangs, tipped a few degrees to rest on the rock behind it (+x).
 *  `breathe` slowly swells the body about the ground (3.5 s — four breaths per 14 s loop); `zzz` floats the z's (`'still'` = fixed). */
export function Snorlax({ breathe = false, zzz = false, ...p }: PlaceProps & { breathe?: boolean; zzz?: boolean | 'still' }) {
    const claw = (x: number, y: number) => (
        <path d={`M${x - 3.4} ${y} C${x - 2.6} ${y - 5} ${x - 1} ${y - 8.6} ${x} ${y - 10} C${x + 1} ${y - 8.6} ${x + 2.6} ${y - 5} ${x + 3.4} ${y} Z`} {...F} fill="#fff" strokeWidth={1.1} />
    )
    const foot = (cx: number) => (
        <>
            <ellipse cx={cx} cy={-12.5} rx={19} ry={13.5} {...F} fill={SNX_CREAM} />
            <ellipse cx={cx} cy={-9.8} rx={9} ry={7} {...F} fill={SNX_PAD} strokeWidth={1.2} />
            {claw(cx - 11, -23)}{claw(cx, -25.4)}{claw(cx + 11, -23)}
        </>
    )
    return (
        <P {...p}>
            <g>
                {breathe && <animateTransform attributeName="transform" type="scale" dur="3.5s" repeatCount="indefinite" values="1 1;1 1.022;1 1" />}
                {/* body (light from the left: the right flank is a shade darker) and belly */}
                <path d="M0 -75 C34 -75 64 -58 62 -24 C61 -7 46 3 0 3 C-46 3 -61 -7 -62 -24 C-64 -58 -34 -75 0 -75 Z" {...F} fill={SNX_BLUE} />
                <path d="M40 -68 C56 -58 59 -38 58.4 -24 C57.4 -11 48 -2 35 0.2 C48 -15 50 -44 40 -68 Z" fill={SNX_DK} opacity={0.4} stroke="none" />
                <path d="M0 -68 C33 -68 47 -47 41 -28 C36 -12 19 -7 0 -7 C-19 -7 -36 -12 -41 -28 C-47 -47 -33 -68 0 -68 Z" {...F} fill={SNX_CREAM} />
                {/* arms: smooth filled lobes down the sides, cream paws */}
                <path d="M-52 -62 C-66 -56 -73 -40 -69 -26 C-67 -18 -62 -13 -57 -12 C-52 -22 -48 -38 -47 -53 C-47 -58 -49 -61 -52 -62 Z" {...F} fill={SNX_BLUE} />
                <path d="M52 -62 C66 -56 73 -40 69 -26 C67 -18 62 -13 57 -12 C52 -22 48 -38 47 -53 C47 -58 49 -61 52 -62 Z" {...F} fill={SNX_BLUE} />
                <circle cx={-57} cy={-13} r={5.6} {...F} fill={SNX_CREAM} />
                <circle cx={57} cy={-13} r={5.6} {...F} fill={SNX_CREAM} />
                {foot(-31)}{foot(31)}
                {/* head: wide, cream face, closed eyes, two fangs; tipped 6° toward the rock */}
                <g transform="translate(5 0) rotate(6 0 -66)">
                    <path d="M-32 -86 C-33 -93 -29 -98 -25 -98.6 C-19 -98 -13 -94 -9 -90 Z" {...F} fill={SNX_BLUE} />
                    <path d="M32 -86 C33 -93 29 -98 25 -98.6 C19 -98 13 -94 9 -90 Z" {...F} fill={SNX_BLUE} />
                    <path d="M-27 -90 C-27.4 -93 -26 -95 -24.6 -95.4 C-22 -95 -19.6 -93 -18 -91 Z M27 -90 C27.4 -93 26 -95 24.6 -95.4 C22 -95 19.6 -93 18 -91 Z" fill={SNX_DK} stroke="none" />
                    <ellipse cx={0} cy={-75} rx={36} ry={19} {...F} fill={SNX_BLUE} />
                    <ellipse cx={0} cy={-72} rx={26} ry={14.5} {...F} fill={SNX_CREAM} strokeWidth={1.1} />
                    <path d="M-17 -76 H-7 M7 -76 H17" {...L} strokeWidth={1.5} />
                    <path d="M-10 -70.5 H10" {...L} strokeWidth={1.3} />
                    <path d="M-7.8 -70.5 C-7.6 -68 -6.8 -66.4 -5.8 -65.8 C-4.8 -66.6 -4.4 -68.4 -4.4 -70.5 Z M7.8 -70.5 C7.6 -68 6.8 -66.4 5.8 -65.8 C4.8 -66.6 4.4 -68.4 4.4 -70.5 Z" {...F} fill="#fff" strokeWidth={0.9} />
                </g>
            </g>
            {zzz && <Zzz still={zzz === 'still'} />}
        </P>
    )
}

/** A rocky outcrop BEHIND the creature (draw it first), origin on the ground at the creature's centre: a craggy, many-faceted stack ~165
 *  wide and ~98 tall — stepped ledges on the left, a high shoulder at head height behind Snorlax's right side (where the tipped head
 *  rests), a sheer shaded face on the right. Lit top planes, dark side planes, cracks, moss on the ledges, loose stones at the foot.
 *  Theme-token colours. */
export function Boulder({ ...p }: PlaceProps) {
    const stone = { ...F, fill: ROCK, strokeWidth: 1.3 }
    return (
        <P {...p}>
            {/* silhouette: angular, stepped, with a notch between two summits */}
            <path d="M-36 0 L-43 -19 L-34 -33 L-39 -50 L-23 -68 L-8 -63 L1 -81 L21 -90 L38 -84 L47 -97 L72 -95 L87 -80 L103 -77 L117 -57 L111 -41 L127 -27 L125 0 Z" {...stone} strokeLinejoin="round" />
            {/* lit top planes */}
            <path d="M-23 -68 L-8 -63 L1 -81 L21 -90 L38 -84 L28 -70 L8 -58 Z M47 -97 L72 -95 L87 -80 L66 -78 L50 -84 Z" fill="var(--scene-fill)" opacity={0.42} stroke="none" />
            {/* dark side planes */}
            <path d="M87 -80 L103 -77 L117 -57 L111 -41 L127 -27 L125 0 L98 0 L104 -30 L94 -50 L88 -66 Z" fill="var(--sc-shade)" stroke="none" />
            <path d="M-39 -50 L-34 -33 L-43 -19 L-36 0 L-14 0 L-18 -26 L-12 -44 Z" fill="var(--sc-shade)" stroke="none" opacity={0.7} />
            {/* ledges and cracks */}
            <path d="M-34 -33 L-14 -30 L-4 -38 M1 -81 L9 -62 L3 -50 L13 -34 L7 -18 M47 -97 L56 -76 L50 -62 L62 -44 L58 -26 M98 -53 L88 -38 L98 -22" {...L} strokeWidth={0.95} opacity={0.6} />
            <path d="M72 -60 L84 -54 M20 -46 L30 -52" {...L} strokeWidth={0.8} opacity={0.4} />
            {/* moss on the ledges */}
            <path d="M-23 -68 L-8 -63 L-12 -59 L-20 -61 Z M47 -97 L72 -95 L68 -90 L56 -90 L50 -92 Z" className="sc-far" stroke="currentColor" strokeWidth={0.9} strokeLinejoin="round" />
            {/* loose stones at the foot */}
            <path d="M126 0 L130 -7 L141 -6 L145 0 Z" {...stone} strokeWidth={1.1} />
            <path d="M-38 0 L-35 -6 L-26 -5 L-23 0 Z" {...stone} strokeWidth={1.1} />
        </P>
    )
}

/** Ash's green backpack, in his local coordinates, WORN: a rounded pack on his back with a flap, a side pocket and a rolled mat, and a
 *  strap that goes up over the crest of the shoulder, down the front of his jacket and back under the arm to the pack's lower corner,
 *  with a small buckle. Draw it right after the jacket body (before the collar, so the collar stays on top) and before the head. */
export function AshPack() {
    return (
        <>
            <path d="M-19 -63 Q-19.6 -68.4 -13.6 -68.4 H-8.4 L-6.4 -39.6 H-16.6 Q-19 -39.6 -19.4 -43 Z" {...F} fill={PACK} strokeWidth={1.2} />
            <path d="M-19 -57 H-7.4" {...L} strokeWidth={0.9} opacity={0.6} />
            <path d="M-19.4 -50.4 H-12.6 V-41.6 H-18.4 Q-19.6 -41.6 -19.4 -44 Z" {...F} fill={PACK_DK} strokeWidth={1} />
            <rect x={-20} y={-72.6} width={13.6} height={4.6} rx={2.3} {...F} fill={PACK_DK} strokeWidth={1.1} />
            <path d="M-13 -56.6 V-53.6" {...L} strokeWidth={1.2} />
            {/* the strap: over the shoulder, down the chest, back under the arm */}
            <path d="M-9 -66.2 Q-2 -69.2 4.6 -64.4 Q9 -58 6.4 -48.4 Q1.4 -41.6 -6.4 -43.4" {...L} strokeWidth={4} />
            <path d="M-9 -66.2 Q-2 -69.2 4.6 -64.4 Q9 -58 6.4 -48.4 Q1.4 -41.6 -6.4 -43.4" stroke={PACK} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <rect x={5} y={-56} width={3.4} height={4.4} rx={0.8} {...F} fill={PACK_DK} strokeWidth={0.8} />
        </>
    )
}


/** A small faceted stone (~28 wide, 14 tall at s = 1), base on the ground: for scattering over the grass. Lit top, shaded right flank. */
export function Rock({ ...p }: PlaceProps) {
    return (
        <P {...p}>
            <path d="M-14 0 L-16 -7 L-8 -13 L3 -14 L12 -9 L16 -3 L14 0 Z" {...F} fill={ROCK} strokeWidth={1.2} strokeLinejoin="round" />
            <path d="M-8 -13 L3 -14 L5 -9 L-6 -8 Z" fill="var(--scene-fill)" opacity={0.45} stroke="none" />
            <path d="M3 -14 L12 -9 L16 -3 L14 0 L6 0 L8 -8 Z" fill="var(--sc-shade)" stroke="none" />
            <path d="M-5 -8 L-3 -3" {...L} strokeWidth={0.8} opacity={0.5} />
        </P>
    )
}
