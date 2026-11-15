/**
 * Gravity Falls cast for the Space world: Dipper (with Journal 3), Mabel, Grunkle Stan, Soos, Ford and Bill Cipher, plus the Universe Portal, a repair console,
 * the Mystery Shack and the night forest. The characters are drawn as seamless silhouettes (see `Figure`): one pale rim, one ink outline, fills on top.
 * Looks follow the show: Dipper's white-and-blue pine-tree cap, navy vest over a reddish-orange tee; Mabel's sweater, headband and rosy cheeks; Stan's black
 * suit, red string tie, red fez, round glasses and 8-ball cane; Soos's green "?" shirt; Ford's raised hand, long coat and cowlick; Bill's yellow
 * triangle, single eye, top hat and bow tie; a garden gnome (red pointed hat, white beard, round pink nose, aqua shirt) and the giant red-and-blue
 * toadstools of the gnome forest. Everyone faces front; origin = feet.
 */
import type { ReactNode } from 'react'
import { useId } from 'react'
import { AV_HAIR, AV_SKIN, AV_YELLOW } from './avatarPalette'
import { ZK_RED } from './fireNation'
import { Figure, INK, type Item, type Piece } from './figure'
import { DOT, F, GLOW, L, Limb, P, SHADE, type PlaceProps } from './core'

const TEE = 'color-mix(in srgb, var(--sc-accent) 78%, var(--scene-warm))'
const NAVY = 'color-mix(in srgb, var(--sc-panel) 46%, var(--sc-door))'
const CAP_BLUE = 'color-mix(in srgb, var(--sc-panel) 78%, var(--sc-glass))'
const GRAY = 'color-mix(in srgb, var(--sc-line) 30%, var(--sc-cloud))'
const PINK = 'color-mix(in srgb, var(--sc-accent) 60%, var(--sc-snow))'                 // the gnome's round nose
const FUCHSIA = 'color-mix(in srgb, #ee55a0 86%, var(--sc-door))'                       // Mabel's sweater and its matching headband
const SKIRT = 'color-mix(in srgb, #8d55d3 82%, var(--sc-door))'                         // Mabel's purple skirt
const GF_RED = 'color-mix(in srgb, #e03a40 86%, var(--sc-door))'                        // Stan's fez and string tie, the gnome's hat
const JOURNAL = 'color-mix(in srgb, #b5222f 80%, var(--sc-door))'                       // Journal 3's red cover
const SPINE = 'color-mix(in srgb, #b5222f 40%, var(--sc-door))'
const SUIT = 'color-mix(in srgb, var(--sc-door) 80%, var(--sc-line))'
const SOOS_G = 'color-mix(in srgb, var(--sc-alien) 68%, var(--sc-tree))'
const JEANS = 'color-mix(in srgb, var(--sc-panel) 52%, var(--sc-door))'
const FORD_COAT = 'color-mix(in srgb, var(--sc-accent) 40%, var(--sc-door))'
const HAIR_GREY = 'color-mix(in srgb, var(--sc-line) 24%, var(--sc-cloud))'
const BROWN_SHOE = 'color-mix(in srgb, var(--sc-trunk) 70%, var(--sc-door))'
const SHOE = 'color-mix(in srgb, var(--sc-line) 22%, var(--sc-door))'
const SILVER = 'color-mix(in srgb, var(--sc-line) 40%, var(--sc-cloud))'
const WOOD = 'color-mix(in srgb, var(--sc-trunk) 60%, var(--sc-sign))'
const BILL_Y = 'var(--scene-glow)'
const PAGES = 'color-mix(in srgb, var(--sc-sign) 62%, var(--sc-snow))'
const SOOS_SHIRT = 'color-mix(in srgb, #34b283 84%, var(--sc-door))'                    // jade green
const KHAKI = 'color-mix(in srgb, #cdb98c 86%, var(--sc-door))'                         // beige shorts
const SOOS_HAT = 'color-mix(in srgb, #9a7249 82%, var(--sc-door))'                      // light brown cap
const SOOS_SHOE = 'color-mix(in srgb, #5b3b27 84%, var(--sc-door))'                     // dark brown shoes
const WHITE = 'var(--sc-snow)'
const SKIN = AV_SKIN
const HAIR = AV_HAIR


/**
 * Heights. The show never states official heights, so these are the best figures I could find (fan wikis, not Disney): Soos 6'3" (191 cm), Stan about 6'0"
 * (183 cm), Ford is Stan's twin (183 cm), the twins about 152 cm, and canonically ("Little Dipper") Mabel is taller than Dipper by one millimetre. `gfScale(who)` is
 * the scale that makes each drawing the right height relative to the others in the SAME lane, at 0.37 px per cm; a scene then multiplies by its depth lane's factor.
 */
const GF_CM = { dipper: 152, mabel: 152.1, stan: 183, ford: 183, soos: 191 } as const
const GF_TOP = { dipper: 50.6, mabel: 51.4, stan: 63.4, ford: 74, soos: 75.8 } as const   // native height to the top of the head, hats left out
export const gfScale = (who: keyof typeof GF_CM) => Math.round((0.37 * GF_CM[who]) / GF_TOP[who] * 1000) / 1000


/**
 * How many digits Ford's raised hand and the hand on the cover of Journal 3 are drawn with. Asked for: FIVE (four fingers and a thumb). Note: in the show both the
 * journals' golden hand and Ford's own hands have SIX fingers (the Gravity Falls wiki says so for Journals 1–3 and for Ford), so set this to 6 for the canon look —
 * it is the only place the count lives.
 */
export const HAND_DIGITS = 5
const rd = (n: number) => Math.round(n * 100) / 100
/** the digits of an open hand seen palm-on, centred on (cx, cy): the fingers fan upward (a touch longer in the middle) and the thumb sits to the left, toward the body; [x1, y1, x2, y2, isThumb] */
function digitSegs(cx: number, cy: number, reach: number, n: number = HAND_DIGITS): [number, number, number, number, boolean][] {
    const fingers = Math.max(n - 1, 1)
    const seg = (deg: number, r0: number, r1: number, thumb: boolean): [number, number, number, number, boolean] => {
        const a = (deg * Math.PI) / 180
        return [rd(cx + Math.cos(a) * r0), rd(cy + Math.sin(a) * r0), rd(cx + Math.cos(a) * r1), rd(cy + Math.sin(a) * r1), thumb]
    }
    const out: [number, number, number, number, boolean][] = []
    for (let i = 0; i < fingers; i++) {
        const deg = fingers === 1 ? -90 : -114 + (i * 60) / (fingers - 1)                                   // -114° … -54°: straight up is -90°
        const mid = fingers === 1 ? 1 : 1 - Math.abs((i - (fingers - 1) / 2) / ((fingers - 1) / 2))
        out.push(seg(deg, reach * 0.3, reach * (0.86 + 0.14 * mid), false))
    }
    out.push(seg(-160, reach * 0.3, reach * 0.66, true))
    return out
}

const limb = (d: string, w: number, fill: string): Piece => ({ t: 'limb', d, w, fill })
const path = (d: string, fill: string): Piece => ({ t: 'path', d, fill })
const oval = (cx: number, cy: number, rx: number, ry: number, fill: string): Piece => ({ t: 'oval', cx, cy, rx, ry, fill })
/** an eye with a pupil, drawn over the fills */
const eye = (cx: number, cy: number, rx = 1.6, ry = 1.8) => (
    <g key={`${cx},${cy}`}>
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={WHITE} stroke={INK} strokeWidth={0.6} />
        <circle cx={cx + rx * 0.1} cy={cy + 0.2} r={rx * 0.52} fill={INK} stroke="none" />
    </g>
)
const line = (d: string, w = 0.8, o = 1) => <path d={d} fill="none" stroke={INK} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" opacity={o} />

/** Dipper: the white-and-blue pine-tree cap, shaggy brown hair, a red nose, a navy vest over an orange tee, grey shorts; he hugs a CLOSED Journal 3 to his chest (maroon cover, gold corner caps, the gold hand with a "3") */
export function Dipper(p: PlaceProps) {
    const items: Item[] = [
        limb('M0 -38 V-32', 4.2, SKIN),
        limb('M-3.4 -18 V-6', 4.2, SKIN), limb('M3.4 -18 V-6', 4.2, SKIN),
        path('M-5.6 -10 H-1.2 V-3.8 H-5.6 Z', WHITE), path('M1.2 -10 H5.6 V-3.8 H1.2 Z', WHITE),
        oval(-3.8, -2.2, 5, 2.7, SHOE), oval(3.8, -2.2, 5, 2.7, SHOE),
        path('M-7.4 -20 H7.4 L7 -13.6 Q0 -11.4 -7 -13.6 Z', GRAY),
        path('M-6.8 -34 Q0 -36.8 6.8 -34 L7.8 -19 Q0 -16.8 -7.8 -19 Z', TEE),
        path('M-6.8 -34 L-2.6 -35 L-2.4 -17.6 L-7.8 -19 Z', NAVY), path('M6.8 -34 L2.6 -35 L2.4 -17.6 L7.8 -19 Z', NAVY),
        limb('M-6.8 -32 L-9.8 -24.6', 5, TEE), limb('M6.8 -32 L9.8 -24.6', 5, TEE),
        path('M-4.8 -32.4 H6.6 V-16.6 H-4.8 Z', PAGES),                    // the page block, showing along the right and bottom edges
        path('M-6 -33 H6 V-17.8 H-6 Z', JOURNAL),                          // the cover
        path('M-6 -33 H-4.6 V-17.8 H-6 Z', SPINE),                         // the spine
        limb('M-6.8 -32 L-10.6 -26', 5, TEE), limb('M6.8 -32 L10.6 -26', 5, TEE),                   // the upper arms, elbows out
        limb('M-10.6 -26 L-7 -22.4', 3.6, SKIN), limb('M10.6 -26 L7 -22.4', 3.6, SKIN),             // the forearms come in to the book's lower sides
        oval(-6.3, -21.8, 2.2, 2.6, SKIN), oval(6.3, -21.8, 2.2, 2.6, SKIN),                         // a hand gripping each side
        oval(-8.4, -41, 1.6, 2.3, SKIN), oval(8.4, -41, 1.6, 2.3, SKIN),
        oval(0, -42, 8.6, 8.6, SKIN),
        path('M-8.2 -43 L-9.8 -38 L-7.2 -39.6 L-7.4 -35.6 L-5 -39 Z', HAIR), path('M8.2 -43 L9.8 -38 L7.2 -39.6 L7.4 -35.6 L5 -39 Z', HAIR),
        path('M-7.4 -43.4 L-4.8 -40 L-2.2 -43 L0.4 -39.8 L3 -43 L5.6 -40 L7.4 -43.4 Z', HAIR),
        path('M-9 -44 C-9 -56 9 -56 9 -44 Z', WHITE),
        path('M-9.8 -44.4 Q0 -48.2 9.8 -44.4 L9.4 -42.4 Q0 -46 -9.4 -42.4 Z', CAP_BLUE),
        path('M0 -52.6 L1.9 -50.2 H1 L2.3 -48.3 H0.5 V-47.2 H-0.5 V-48.3 H-2.3 L-1 -50.2 H-1.9 Z', CAP_BLUE),   // the pine: small, centred on the white crown
    ]
    const digits = digitSegs(0, -26, 5.6)
    const details = (
        <>
            {line('M-5.6 -7 H-1.2 M-5.6 -5.4 H-1.2 M1.2 -7 H5.6 M1.2 -5.4 H5.6', 0.7, 0.8)}
            {/* Journal 3: gold corner caps, a dark spine, the gold hand (HAND_DIGITS digits), a black "3" in the palm */}
            <path d="M-6 -33 h3 l-3 3 Z M6 -33 h-3 l3 3 Z M-6 -17.8 h3 l-3 -3 Z M6 -17.8 h-3 l3 -3 Z" fill={AV_YELLOW} stroke={INK} strokeWidth={0.4} strokeLinejoin="round" />
            <g stroke={AV_YELLOW} strokeLinecap="round" fill="none">{digits.map(([a, b, c, d, thumb], i) => <path key={i} d={`M${a} ${b} L${c} ${d}`} strokeWidth={thumb ? 1.6 : 1.25} />)}</g>
            <ellipse cx={0} cy={-26} rx={2.6} ry={2.9} fill={AV_YELLOW} stroke="none" />
            <path d="M-1.1 -27.2 Q0.9 -28.2 1.4 -26.8 Q1.1 -25.9 -0.1 -25.9 Q1.6 -25.7 1.5 -24.4 Q0.8 -23 -1.3 -23.9" fill="none" stroke={INK} strokeWidth={0.8} strokeLinecap="round" strokeLinejoin="round" />

            {line('M-9.6 -44.4 Q0 -48 9.6 -44.4', 0.7, 0.8)}
            {eye(-3, -40.8)}{eye(3, -40.8)}
            <circle cx={0} cy={-38.2} r={1.2} fill="var(--sc-accent)" stroke={INK} strokeWidth={0.5} />
            {line('M-1.8 -35.4 Q0 -34.2 1.8 -35.4', 0.8)}
        </>
    )
    return <Figure items={items} details={details} shadow={11} {...p} />
}

/** Mabel: long brown hair, a headband, rosy cheeks, a big grin, a pink sweater with a gold shooting star, a skirt; her right arm (our right) is the throwing arm — `armWrap` rotates it about the shoulder (7, −33) */
export function Mabel({ armWrap, ...p }: PlaceProps & { armWrap?: (arm: ReactNode) => ReactNode }) {
    const items: Item[] = [
        path('M-10.4 -44 C-13.6 -34 -11.8 -28 -9 -27 L9 -27 C11.8 -28 13.6 -34 10.4 -44 Z', HAIR),
        limb('M0 -38 V-32', 4.2, SKIN),
        limb('M-3.4 -18 V-6', 4, SKIN), limb('M3.4 -18 V-6', 4, SKIN),
        path('M-5.6 -10 H-1.2 V-3.8 H-5.6 Z', WHITE), path('M1.2 -10 H5.6 V-3.8 H1.2 Z', WHITE),
        oval(-3.8, -2.2, 5, 2.7, SHOE), oval(3.8, -2.2, 5, 2.7, SHOE),
        path('M-9 -19.6 H9 L11.4 -12.4 Q0 -10 -11.4 -12.4 Z', SKIRT),
        path('M-7.2 -34 Q0 -36.8 7.2 -34 L8.4 -19.6 Q0 -17.4 -8.4 -19.6 Z', FUCHSIA),
        limb('M-7.2 -32.6 L-10.2 -25 L-8.8 -20.4', 5, FUCHSIA), oval(-8.6, -19, 2.1, 2, SKIN),
        { arm: [limb('M7.2 -32.6 L17.4 -35', 5, FUCHSIA), oval(19.6, -35.4, 2.2, 2, SKIN)], wrap: armWrap ?? ((a: ReactNode) => <g transform="rotate(62 7.2 -32.6)">{a}</g>) },
        oval(0, -42.6, 8.8, 8.8, SKIN),
        path('M-9.4 -44.4 C-10 -55.6 10 -55.6 9.4 -44.4 C6.4 -48.2 3.2 -48.4 0 -46.4 C-3.2 -48.4 -6.4 -48.2 -9.4 -44.4 Z', HAIR),
        limb('M-9 -47.4 Q0 -53.6 9 -47.4', 2.4, FUCHSIA),
    ]
    const details = (
        <>
            <path d="M0 -29.4 L1 -27 L3.6 -26.8 L1.6 -25.2 L2.2 -22.8 L0 -24.2 L-2.2 -22.8 L-1.6 -25.2 L-3.6 -26.8 L-1 -27 Z" fill={AV_YELLOW} stroke={INK} strokeWidth={0.5} strokeLinejoin="round" />
            <circle cx={-5.2} cy={-38.6} r={1.8} fill="var(--sc-accent)" stroke="none" opacity={0.7} /><circle cx={5.2} cy={-38.6} r={1.8} fill="var(--sc-accent)" stroke="none" opacity={0.7} />
            {eye(-3.2, -42, 1.7, 1.9)}{eye(3.2, -42, 1.7, 1.9)}
            {line('M-5.6 -45.2 Q-3.4 -46.6 -1.4 -45.4 M5.6 -45.2 Q3.4 -46.6 1.4 -45.4', 0.7)}
            <path d="M-3.8 -37.4 Q0 -33.4 3.8 -37.4 Z" fill={WHITE} stroke={INK} strokeWidth={0.7} strokeLinejoin="round" />
            {line('M-3.8 -37.4 H3.8', 0.5, 0.6)}
        </>
    )
    return <Figure items={items} details={details} shadow={11} {...p} />
}

/** Grunkle Stan: red fez with a tassel, round glasses, big red nose, grey sideburns, black suit, white shirt, red string tie, an 8-ball cane; his right arm (our right) holds a wrench — `armWrap` rotates it about the shoulder (14, −46) */
export function Stan({ armWrap, ...p }: PlaceProps & { armWrap?: (arm: ReactNode) => ReactNode }) {
    const items: Item[] = [
        limb('M0 -52 V-46', 6.4, SKIN),
        limb('M-5.4 -24 L-6 -6', 7.4, SUIT), limb('M5.4 -24 L6 -6', 7.4, SUIT),
        oval(-6.6, -2.8, 5.8, 3, BROWN_SHOE), oval(6.6, -2.8, 5.8, 3, BROWN_SHOE),
        path('M-14 -47 Q0 -52 14 -47 L16.6 -22 Q0 -17.4 -16.6 -22 Z', SUIT),
        path('M-5.4 -49 L0 -33 L5.4 -49 Z', WHITE),
        path('M0 -43 L-4.6 -40.6 L-4.6 -45.2 Z M0 -43 L4.6 -40.6 L4.6 -45.2 Z', GF_RED),
        limb('M-14 -46 L-19 -33 L-18 -26', 6.8, SUIT), oval(-18, -24.6, 2.9, 2.7, SKIN),
        limb('M-18 -23 V-1.6', 1.9, WOOD), oval(-18, -28.6, 3.2, 3.2, 'color-mix(in srgb, var(--sc-line) 16%, var(--sc-door))'),
        { arm: [limb('M14 -46 L27 -50', 7.2, SUIT), oval(29.2, -50.4, 3.1, 2.9, SKIN), limb('M29 -51 L39 -59', 2.9, SILVER), path('M36 -62.4 L39.8 -64.4 L42.8 -60.8 L40 -58 Z', SILVER)],
            wrap: armWrap ?? ((a: ReactNode) => <g transform="rotate(50 14 -46)">{a}</g>) },
        oval(-8.8, -55.4, 1.7, 2.6, SKIN), oval(8.8, -55.4, 1.7, 2.6, SKIN),
        path('M-8.6 -63.4 H8.6 V-53 Q8.6 -46.4 0 -46.4 Q-8.6 -46.4 -8.6 -53 Z', SKIN),
        path('M-8.6 -58 L-10 -54 L-8.4 -54.6 L-8.6 -50 Z', HAIR_GREY), path('M8.6 -58 L10 -54 L8.4 -54.6 L8.6 -50 Z', HAIR_GREY),
        oval(0, -52.2, 2.9, 2.3, 'var(--sc-accent)'),
        path('M-6.8 -63 L-5.8 -74 H5.8 L6.8 -63 Z', GF_RED),
        oval(0, -74, 5.8, 1.5, GF_RED),
        limb('M5.2 -73.4 Q10.8 -72.8 10.4 -66.4 V-64', 1, INK),
    ]
    const details = (
        <>
            {line('M-5.6 -47.4 L-4.8 -45.4 M-2.7 -40 L0 -33.6 L2.7 -40 M4.8 -45.4 L5.6 -47.4', 0.6, 0.5)}
            <circle cx={0} cy={-43} r={1.1} fill={GF_RED} stroke={INK} strokeWidth={0.5} />
            <circle cx={-18} cy={-28.8} r={1.3} fill={WHITE} stroke="none" />
            {line('M-6 -66 H6', 1.2, 0)}
            <path d="M-6.2 -65.4 H6.2" stroke={AV_YELLOW} strokeWidth={1.3} fill="none" />
            <circle cx={-3.5} cy={-57} r={3.1} fill="var(--sc-snow)" fillOpacity={0.6} stroke={INK} strokeWidth={0.8} /><circle cx={3.5} cy={-57} r={3.1} fill="var(--sc-snow)" fillOpacity={0.6} stroke={INK} strokeWidth={0.8} />
            {line('M-0.5 -57.4 H0.5', 0.8)}
            <circle cx={-3.5} cy={-57} r={1} fill={INK} stroke="none" /><circle cx={3.5} cy={-57} r={1} fill={INK} stroke="none" />
            {line('M-5.6 -49.6 Q0 -47 5.6 -49.6', 1)}
            <path d="M-6.2 -50 l0 0.1 M-4 -48.6 l0 0.1 M4 -48.6 l0 0.1 M6.2 -50 l0 0.1" stroke={INK} strokeWidth={0.9} strokeLinecap="round" />
            <path d="M5 -17.4 Q9 -19 12.4 -20.4" stroke="var(--sc-shade)" strokeWidth={0} />
        </>
    )
    return <Figure items={items} details={details} shadow={17} {...p} />
}

/** Soos: tall and round, a long bowling-pin head under a brown hat, stubble, a dark-cyan shirt with a yellow "?", cargo shorts, white socks, brown shoes; his right arm (our right) holds a hammer — `armWrap` rotates it about the shoulder (16, −48) */
export function Soos({ armWrap, ...p }: PlaceProps & { armWrap?: (arm: ReactNode) => ReactNode }) {
    const items: Item[] = [
        limb('M0 -57 V-50', 6.4, SKIN),
        limb('M-6 -16 L-6.4 -8', 5.4, SKIN), limb('M6 -16 L6.4 -8', 5.4, SKIN),
        path('M-8.6 -10 H-3.6 V-4 H-8.6 Z', WHITE), path('M3.6 -10 H8.6 V-4 H3.6 Z', WHITE),
        oval(-7, -2.8, 6.2, 3.1, SOOS_SHOE), oval(7, -2.8, 6.2, 3.1, SOOS_SHOE),
        path('M-13 -28 H13 L14 -14.6 Q0 -11.6 -14 -14.6 Z', KHAKI),
        path('M-16 -50 Q0 -56.6 16 -50 L20.6 -22 Q0 -16 -20.6 -22 Z', SOOS_SHIRT),
        limb('M-16 -48 L-20 -40', 8, SOOS_SHIRT), limb('M-20 -40 L-19.4 -30.4', 6.2, SKIN), oval(-19.2, -27.6, 3.4, 3.2, SKIN),
        { arm: [limb('M16 -48 L21 -46', 8, SOOS_SHIRT), limb('M21 -46 L26.4 -44', 6.2, SKIN), oval(28.6, -43.6, 3.4, 3.2, SKIN), limb('M29 -44 L34 -57', 2.9, WOOD), path('M30.6 -64 L40.2 -61.4 L38.6 -55.4 L29 -58 Z', SILVER)],
            wrap: armWrap ?? ((a: ReactNode) => <g transform="rotate(30 16 -48)">{a}</g>) },
        oval(-8.8, -64, 1.6, 2.4, SKIN), oval(8.8, -64, 1.6, 2.4, SKIN),
        oval(0, -64.6, 9, 11.2, SKIN),
        path('M-9 -66 L-10.8 -62 L-8.4 -62.8 Z', INK), path('M9 -66 L10.8 -62 L8.4 -62.8 Z', INK),
        path('M-9.6 -70 C-9.8 -82 9.8 -82 9.6 -70 Z', SOOS_HAT),
        path('M-10.6 -70.4 Q0 -74.2 10.6 -70.4 L9.8 -68.4 Q0 -72 -9.8 -68.4 Z', 'color-mix(in srgb, var(--sc-trunk) 62%, var(--sc-door))'),
    ]
    const details = (
        <>
            <path d="M-3.8 -43 Q-3.8 -48 0 -48 Q3.8 -48 3.8 -44.4 Q3.8 -42 0 -40.2 V-38" stroke={AV_YELLOW} strokeWidth={2.6} strokeLinecap="round" fill="none" />
            <circle cx={0} cy={-33.6} r={1.5} fill={AV_YELLOW} stroke="none" />
            <path d="M8 -53.4 Q13 -52.2 16 -50 L20.6 -22 Q14 -19.4 9 -18.8 Z" fill="var(--sc-shade)" stroke="none" opacity={0.5} />
            {line('M-13 -28 H13', 0.6, 0.4)}
            <rect x={-12} y={-23} width={6} height={5.4} rx={0.8} fill="none" stroke={INK} strokeWidth={0.6} opacity={0.6} /><rect x={6} y={-23} width={6} height={5.4} rx={0.8} fill="none" stroke={INK} strokeWidth={0.6} opacity={0.6} />
            {line('M-9.8 -69 Q0 -72.6 9.8 -69', 0.6, 0.6)}
            {eye(-3.6, -64, 1.7, 1.9)}{eye(3.6, -64, 1.7, 1.9)}
            {line('M-3.8 -58.4 Q0 -55 3.8 -58.4', 1)}
            <path d="M-6 -58.2 l0 0.1 M-4.4 -56.6 l0 0.1 M4.4 -56.6 l0 0.1 M6 -58.2 l0 0.1 M-2.2 -55.6 l0 0.1 M2.2 -55.6 l0 0.1" stroke={INK} strokeWidth={0.9} strokeLinecap="round" />
        </>
    )
    return <Figure items={items} details={details} shadow={19} {...p} />
}

/** Ford: lean and tall, a square face, a swept grey cowlick, glasses, a long coat over a turtleneck; his right hand (our right) is raised and open, HAND_DIGITS digits (five: four fingers and a thumb) — `armWrap` rotates it about the shoulder (9, −52) */
export function Ford({ armWrap, ...p }: PlaceProps & { armWrap?: (arm: ReactNode) => ReactNode }) {
    const fingers = digitSegs(19.8, -64.2, 6.8).map(([a, b, c, d, thumb]) => limb(`M${a} ${b} L${c} ${d}`, thumb ? 1.9 : 1.5, SKIN))
    const items: Item[] = [
        path('M-3.6 -57.4 H3.6 V-52 H-3.6 Z', SKIN),
        oval(-5, -1.8, 5.6, 2.5, 'var(--sc-door)'), oval(5, -1.8, 5.6, 2.5, 'var(--sc-door)'),
        path('M-8.6 -53.6 H8.6 L11.2 -40 L18.2 -4 Q0 1.4 -18.2 -4 L-11.2 -40 Z', FORD_COAT),
        path('M-4.8 -54.4 H4.8 V-50.2 H-4.8 Z', 'color-mix(in srgb, var(--sc-accent) 30%, var(--sc-door))'),
        limb('M-8.6 -52.6 L-12.8 -38 L-11 -28.6', 5.8, FORD_COAT), oval(-10.8, -26.6, 2.7, 2.5, SKIN),
        { arm: [limb('M8.6 -52.6 L18.4 -61.4', 5.8, FORD_COAT), oval(19.8, -63, 3.1, 2.9, SKIN), ...fingers],
            wrap: armWrap ?? ((a: ReactNode) => <g transform="rotate(30 9 -52)">{a}</g>) },
        oval(-7.4, -63.6, 1.5, 2.4, SKIN), oval(7.4, -63.6, 1.5, 2.4, SKIN),
        path('M-7.2 -70.8 Q-7.2 -71.6 -6 -71.6 H6 Q7.2 -71.6 7.2 -70.8 V-60 Q7.2 -55.4 0 -55.4 Q-7.2 -55.4 -7.2 -60 Z', SKIN),
        path('M-7.8 -64 C-8.6 -75.8 8.6 -75.8 7.8 -64 C5.2 -67.6 2.6 -68.6 0 -67.4 C-3 -68.6 -5.6 -67.4 -7.8 -64 Z', HAIR_GREY),
        path('M-2 -74.6 Q0.6 -80.4 5 -76.2 Q2.4 -76.6 1.6 -73.8 Z', HAIR_GREY),
    ]
    const details = (
        <>
            {line('M0 -50 V-6', 0.8, 0.45)}
            {line('M-10.4 -34 H10.4', 1.2, 0.8)}
            <path d="M4.6 -50 H8.6 L11.2 -40 L18.2 -4 Q11 -2 6 -1.4 Z" fill="var(--sc-shade)" stroke="none" opacity={0.5} />
            <rect x={-6.6} y={-66.4} width={5.4} height={4.6} rx={1.2} fill={WHITE} fillOpacity={0.55} stroke={INK} strokeWidth={0.8} />
            <rect x={1.2} y={-66.4} width={5.4} height={4.6} rx={1.2} fill={WHITE} fillOpacity={0.55} stroke={INK} strokeWidth={0.8} />
            {line('M-1.2 -64.4 H1.2', 0.8)}
            <circle cx={-3.9} cy={-64.2} r={0.9} fill={INK} stroke="none" /><circle cx={3.9} cy={-64.2} r={0.9} fill={INK} stroke="none" />
            {line('M-2.4 -58.8 H2.4', 0.9)}
        </>
    )
    return <Figure items={items} details={details} shadow={15} {...p} />
}

/**
 * Bill Cipher, floating (origin = the middle of his base; hat to cane ~70 tall), drawn after the show's own art: a yellow triangle with three rows of bricks across
 * its lower third and a black bow tie, one almond eye with a thin slit pupil and eyelashes (`pupilWrap` wraps the pupil, drawn at the centre of the eye, to aim it),
 * a plain black top hat floating above the point, thin black noodle arms (one raised, one holding his cane), curled legs.
 */
export function BillCipher({ pupilWrap, ...p }: PlaceProps & { pupilWrap?: (pupil: ReactNode) => ReactNode }) {
    const pupil = <ellipse rx={0.95} ry={4.3} fill={INK} stroke="none" />
    const hand = (cx: number, cy: number, dir: 1 | -1) => [
        limb(`M${cx} ${cy} Q${cx + dir * 3.4} ${cy - 1.6} ${cx + dir * 2.8} ${cy - 5.2}`, 1.1, INK),
        limb(`M${cx} ${cy - 0.4} Q${cx + dir * 0.4} ${cy - 4.4} ${cx - dir * 1.4} ${cy - 5.8}`, 1.1, INK),
        limb(`M${cx - dir * 0.4} ${cy} Q${cx - dir * 3.4} ${cy - 2.8} ${cx - dir * 4.8} ${cy - 1.6}`, 1.1, INK),
    ]
    const items: Item[] = [
        limb('M-4.4 3 Q-6.6 9 -4.2 13 Q-2.6 15.8 -5 18.6 H-2.4', 1.8, INK), limb('M4.4 3 Q6.6 9 4.2 13 Q2.6 15.8 5 18.6 H7.6', 1.8, INK),
        limb('M-12.4 -9 Q-21.6 -7 -23.4 -14 Q-24.4 -19 -24 -22.6', 1.6, INK), ...hand(-24, -22.6, -1),
        limb('M12.4 -9 Q21.6 -7.4 24.6 -1.4', 1.6, INK),
        limb('M25.2 -7 V21', 1.6, INK), limb('M25.2 -7 Q25.2 -12.6 30 -12 Q32.6 -11.2 32 -8', 1.6, INK),
        oval(25.4, -1.6, 2.1, 2.3, INK),
        path('M0 -36 L22 4 H-22 Z', BILL_Y),
        path('M-2.95 -39.6 V-51.6 H2.95 V-39.6 Z', INK), path('M-5.7 -37.8 H5.7 V-39.6 H-5.7 Z', INK),
    ]
    const details = (
        <>
            {/* the three rows of bricks across the lower third, with staggered joints */}
            <path d="M-17.6 -7.4 H17.6 M-20 -3.6 H20 M-22 0.4 H22 M-6 -7.4 V-3.6 M10 -7.4 V-3.6 M-12 -3.6 V0.4 M-1 -3.6 V0.4 M13 -3.6 V0.4 M-18 0.4 V4 M6 0.4 V4" stroke={INK} strokeWidth={0.7} fill="none" />
            <path d="M0 -1.2 L-6.2 -4.2 V1.8 Z M0 -1.2 L6.2 -4.2 V1.8 Z" fill={INK} stroke={INK} strokeWidth={0.4} strokeLinejoin="round" /><circle cx={0} cy={-1.2} r={1.5} fill={INK} stroke="none" />
            {/* the eye: almond-shaped, white, a thin slit pupil, lashes above and below */}
            <path d="M-8.6 -17 Q0 -24.4 8.6 -17 Q0 -9.6 -8.6 -17 Z" fill={WHITE} stroke={INK} strokeWidth={0.9} strokeLinejoin="round" />
            <g transform="translate(0 -17)">{pupilWrap ? pupilWrap(pupil) : pupil}</g>
            <path d="M-6.2 -21.4 L-7.4 -23.8 M-2.6 -22.6 L-3 -25.4 M1.4 -22.6 L1.8 -25.4 M5.2 -21.6 L6.6 -24 M-6 -12.6 L-7 -10.4 M-2.4 -11.4 L-2.8 -9 M2 -11.4 L2.4 -9 M5.4 -12.4 L6.6 -10.4" stroke={INK} strokeWidth={0.75} strokeLinecap="round" fill="none" />
        </>
    )
    const behind = <><circle cx={0} cy={-14} r={32} {...GLOW} opacity={0.13} /><circle cx={0} cy={-14} r={22} {...GLOW} opacity={0.18} /></>
    return <Figure items={items} details={details} behind={behind} shadow={0} {...p} />
}

/**
 * The moon, as in the show: a huge glowing white eye with a thin vertical slit pupil, hanging over the clearing. `pupilWrap` wraps the pupil (drawn at the eye's
 * centre) so a scene can aim it at whoever is speaking; the eye blinks now and then (`blink` false = still).
 */
export function GfEye({ r = 15, blink = true, pupilWrap, ...p }: PlaceProps & { r?: number; blink?: boolean; pupilWrap?: (pupil: ReactNode) => ReactNode }) {
    const pupil = <ellipse rx={r * 0.08} ry={r * 0.64} fill="var(--sc-door)" stroke="none" />
    return (
        <P {...p}>
            <circle r={r * 2.1} fill="var(--sc-glass)" stroke="none" opacity={0.07} />
            <circle r={r * 1.6} fill="var(--sc-glass)" stroke="none" opacity={0.11} />
            <circle r={r * 1.28} fill="var(--sc-snow)" stroke="none" opacity={0.18} />
            <g>
                {blink && <animateTransform attributeName="transform" type="scale" values="1 1;1 1;1 0.06;1 1" keyTimes="0;0.955;0.972;1" dur="7s" repeatCount="indefinite" />}
                <circle r={r} fill="var(--sc-snow)" stroke="var(--sc-glass)" strokeWidth={1.4} />
                <circle r={r * 0.86} fill="none" stroke="var(--sc-glass)" strokeWidth={1} opacity={0.3} />
                {pupilWrap ? pupilWrap(pupil) : pupil}
            </g>
        </P>
    )
}

/**
 * The Universe Portal (origin = the middle of its base on the ground, ring centred at (0, −52), ~104 across): a metal ring with twelve rune glyphs, two
 * pylons with crystals, a stepped base, a dark opening. `fill` is drawn inside the opening (clipped to it); `glyphs` draws over the ring's glyph track.
 * The charge arc runs round the inner edge: pass its dashoffset in `arc` (100 = empty, 0 = full) or animate it via `arcFx` (children of the arc path).
 */
export const PORTAL_CY = -52
export const PORTAL_GLYPHS = Array.from({ length: 10 }, (_, i) => {
    const a = (-90 + i * 36) * (Math.PI / 180)
    return [Math.round(43 * Math.cos(a) * 100) / 100, Math.round((PORTAL_CY + 43 * Math.sin(a)) * 100) / 100, -90 + i * 36] as [number, number, number]
})
export function UniversePortal({ fill, glyphs, arc = 100, arcFx, ...p }: PlaceProps & { fill?: ReactNode; glyphs?: ReactNode; arc?: number; arcFx?: ReactNode }) {
    const clip = useId().replace(/[^a-zA-Z0-9]/g, '') + 'p'
    return (
        <P {...p}>
            {/* stepped base and pylons */}
            <path d="M-58 0 L-50 -6 H50 L58 0 Z" {...F} fill={GRAY} strokeWidth={1.2} />
            <rect x={-46} y={-9} width={92} height={3.4} {...F} fill={GRAY} strokeWidth={1} />
            {[-1, 1].map(s => (
                <g key={s}>
                    <rect x={s * 60 - 3.4} y={-44} width={6.8} height={38} rx={1.4} {...F} fill={GRAY} strokeWidth={1.1} />
                    <path d={`M${s * 60 - 2.4} -30 h4.8 M${s * 60 - 2.4} -22 h4.8 M${s * 60 - 2.4} -14 h4.8`} {...L} strokeWidth={0.8} opacity={0.5} />
                    <path d={`M${s * 60} -50 L${s * 60 + 3.4} -44 H${s * 60 - 3.4} Z`} {...F} fill="var(--sc-glass)" strokeWidth={0.9} />
                </g>
            ))}
            {/* the dark opening */}
            <clipPath id={clip}><circle cx={0} cy={PORTAL_CY} r={37.4} /></clipPath>
            <circle cx={0} cy={PORTAL_CY} r={37.4} fill="var(--sc-door)" stroke="none" opacity={0.7} />
            <g clipPath={`url(#${clip})`}>{fill}</g>
            {/* the ring itself: an annulus, a shaded side, a track of glyphs */}
            <path d={`M-48 ${PORTAL_CY} a48 48 0 1 0 96 0 a48 48 0 1 0 -96 0 Z M-38 ${PORTAL_CY} a38 38 0 1 1 76 0 a38 38 0 1 1 -76 0 Z`} fillRule="evenodd" {...F} fill={GRAY} strokeWidth={1.3} />
            <circle cx={0} cy={PORTAL_CY} r={43} fill="none" stroke="currentColor" strokeWidth={0.6} opacity={0.35} strokeDasharray="1 3" />
            {PORTAL_GLYPHS.map(([x, y, a], i) => <path key={i} d="M-2 -2.6 L2 -2.6 M0 -2.6 V2.6 M-2 2.6 L2 2.6" transform={`translate(${x} ${y}) rotate(${a + 90})`} {...L} strokeWidth={0.9} opacity={0.55} />)}
            {glyphs}
            {/* the charge arc round the inner edge */}
            <circle cx={0} cy={PORTAL_CY} r={36.4} fill="none" stroke="var(--sc-glass)" strokeWidth={1.2} opacity={0.3} />
            <circle cx={0} cy={PORTAL_CY} r={36.4} fill="none" stroke="var(--sc-glass)" strokeWidth={2.8} strokeLinecap="round" pathLength={100} strokeDasharray="100" strokeDashoffset={arc}
                    transform={`rotate(-90 0 ${PORTAL_CY})`} style={{ filter: 'drop-shadow(0 0 3px var(--sc-glass))' }}>{arcFx}</circle>
        </P>
    )
}

/** a repair console on a stand (origin = ground, ~34 tall): a screen with a trace, buttons that blink, an antenna */
export function Console({ blink = true, ...p }: PlaceProps & { blink?: boolean }) {
    return (
        <P {...p}>
            <path d="M-14 0 L-12 -10 H12 L14 0 Z" {...F} fill={GRAY} strokeWidth={1.2} />
            <path d="M-16 -10 L-13 -34 H13 L16 -10 Z" {...F} fill={GRAY} strokeWidth={1.3} />
            <rect x={-9} y={-31} width={18} height={11} rx={1.2} {...F} fill="var(--sc-door)" strokeWidth={1} />
            <path d="M-7.6 -24 L-5 -27.4 L-2.4 -23 L0.4 -28.4 L3 -22.6 L5.4 -26.4 L7.6 -24" stroke="var(--sc-glass)" strokeWidth={1} fill="none" strokeLinejoin="round" />
            {[-8, -2.6, 2.8, 8.2].map((x, i) => (
                <circle key={i} cx={x} cy={-15} r={1.5} {...F} fill={i % 2 ? 'var(--sc-accent)' : 'var(--sc-glass)'} strokeWidth={0.7}>
                    {blink ? <animate attributeName="opacity" values="1;0.35;1" dur={`${1.2 + i * 0.35}s`} repeatCount="indefinite" /> : null}
                </circle>
            ))}
            <path d="M10 -34 L12 -42" {...L} strokeWidth={1.1} /><circle cx={12.2} cy={-42.6} r={1.3} {...F} fill="var(--sc-accent)" strokeWidth={0.7} />
        </P>
    )
}

/**
 * The Mystery Shack, drawn after the show's title-card art (origin = the middle of the building on the ground, ~105 across and ~105 to the top of the sign; a scene
 * scales it down). Seen from the gable end: a tall A-frame facade (a lit triangular window, a door, "MYSTERY SHACK" painted on the boards, a porch deck, a lantern on
 * its post) with one huge dark roof sloping away to the right — patched with planks, mossy along the ridge — and, on top, the two yellow sign boards "MYSTERY" /
 * "SHACK" (red letters) under a pair of lamps, a loudspeaker, and the question-mark weathervane. The lower gift-shop annex on the right has its own roof (with the
 * "WORLD PAPOV" oval sign the pilot's art misspells), a lit window with an X, a drinks machine, the hanging "GIFT" board and a string of bunting hung from the weathervane's pole; a stone path
 * leads up to it.
 */
const SHACK_WALL = 'color-mix(in srgb, var(--sc-near) 72%, var(--sc-door))'
const SHACK_SIDE = 'color-mix(in srgb, var(--sc-near) 50%, var(--sc-door))'
const SHACK_ROOF = 'color-mix(in srgb, var(--sc-door) 72%, var(--sc-near))'
const MOSS = 'color-mix(in srgb, var(--sc-alien) 52%, var(--sc-tree))'
type Pt = [number, number]
const lerp = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
const pt = (q: Pt) => `${rd(q[0])} ${rd(q[1])}`
export function MysteryShack(p: PlaceProps) {
    // the long roof plane: ridge A→B (A is the apex over the gable), eave D→C; `on(u, v)` is a point on it (u along the ridge, v from ridge to eave)
    const A: Pt = [-31, -72], B: Pt = [23, -47], C: Pt = [31, -7], D: Pt = [-14, -30]
    const on = (u: number, v: number): Pt => lerp(lerp(A, B, u), lerp(D, C, u), v)
    const quad = (u0: number, v0: number, u1: number, v1: number) => `M${pt(on(u0, v0))} L${pt(on(u1, v0))} L${pt(on(u1, v1))} L${pt(on(u0, v1))} Z`
    const courses = [0.24, 0.46, 0.68, 0.88]
    const rows = courses.map(v => `M${pt(on(0, v))} L${pt(on(1, v))}`).join(' ')
    const joints = courses.slice(0, -1).map((v, i) => [0.3, 0.55, 0.8].map(u => { const uu = u + (i % 2 ? 0.1 : 0); return `M${pt(on(uu, v))} L${pt(on(uu, courses[i + 1]))}` }).join(' ')).join(' ')
    let moss = `M${pt(A)}`
    for (let k = 1; k <= 8; k++) {
        const a = lerp(A, B, (k - 1) / 8), b = lerp(A, B, k / 8)
        moss += ` Q${rd((a[0] + b[0]) / 2)} ${rd((a[1] + b[1]) / 2 - 3.4 - (k % 3))} ${pt(b)}`
    }
    moss += ` L${rd(B[0])} ${rd(B[1] + 2.2)} L${rd(A[0])} ${rd(A[1] + 2.6)} Z`
    // bunting from the ridge's far end down to the annex roof
    const b0: Pt = [31, -48], b1: Pt = [54, -34]
    const flags = [0, 1, 2, 3, 4].map(i => {
        const t = (i + 0.5) / 5, q = lerp(b0, b1, t), y = q[1] + 5 * 4 * t * (1 - t)
        return <path key={i} d={`M${rd(q[0] - 2)} ${rd(y)} H${rd(q[0] + 2)} L${rd(q[0])} ${rd(y + 4.6)} Z`} {...F} fill={[ZK_RED, AV_YELLOW, 'var(--sc-glass)', ZK_RED, AV_YELLOW][i]} strokeWidth={0.6} />
    })
    const SIGN_TXT = { fontFamily: 'inherit', fontWeight: 900 } as const
    return (
        <P {...p}>
            {/* the ground: a pool of lantern light, the stone path */}
            <ellipse cx={-30} cy={1} rx={44} ry={4.4} {...GLOW} opacity={0.1} />
            {[[34, 2.4, 3.4], [42, 3, 3], [50, 2.4, 2.8]].map(([x, y, rx], i) => <ellipse key={i} cx={x} cy={y} rx={rx} ry={1.3} {...F} fill="var(--sc-far)" strokeWidth={0.9} />)}

            {/* the long side wall under the roof, then the gift-shop annex tucked behind the roof's far end */}
            <path d={`M${pt(D)} L${pt(C)} V0 H${D[0]} Z`} {...F} fill={SHACK_SIDE} strokeWidth={1.2} />
            <path d="M24 0 V-22 H50 V0 Z" {...F} fill={SHACK_WALL} strokeWidth={1.2} />
            <path d="M19 -23 L33 -37 L55 -33 L54 -22 Z" {...F} fill={SHACK_ROOF} strokeWidth={1.3} />
            <path d="M23 -29 L33 -35 M36 -34 L52 -31" {...L} strokeWidth={0.6} opacity={0.4} />
            <ellipse cx={42} cy={-30.4} rx={8.4} ry={2.8} transform="rotate(4 42 -30.4)" {...F} fill={WOOD} strokeWidth={1} />
            <path d="M37 -30.6 H47 M38.6 -29.2 H45.4" {...L} strokeWidth={0.6} opacity={0.55} />
            {/* the annex's lit window (an X for the panes), the drinks machine, the hanging GIFT board */}
            <circle cx={37} cy={-13} r={11} {...GLOW} opacity={0.18} />
            <rect x={33} y={-17.6} width={8.6} height={8.2} {...F} fill="var(--scene-glow)" strokeWidth={1} />
            <path d="M33 -17.6 L41.6 -9.4 M41.6 -17.6 L33 -9.4" {...L} strokeWidth={0.7} />
            <rect x={43.4} y={-12.4} width={4.6} height={12.4} {...F} fill={ZK_RED} strokeWidth={0.9} />
            <rect x={44.4} y={-10.6} width={2.6} height={4} fill={WHITE} stroke="none" />
            <path d="M44.4 -22 V-20.6 M51.2 -22 V-20.6" {...L} strokeWidth={0.7} />
            <rect x={43} y={-20.6} width={9.6} height={6} rx={0.8} {...F} fill={WOOD} strokeWidth={1} />
            <text x={47.8} y={-16.2} textAnchor="middle" fontSize={4.6} textLength={7.6} lengthAdjust="spacingAndGlyphs" fill={AV_YELLOW} stroke="none" style={SIGN_TXT}>GIFT</text>

            {/* the A-frame's gable end: boards, a lit triangular window, the painted name, the door */}
            <circle cx={-31} cy={-54} r={11} {...GLOW} opacity={0.2} />
            <path d="M-48 0 V-30 L-31 -72 L-14 -30 V0 Z" {...F} fill={SHACK_WALL} strokeWidth={1.4} />
            <path d="M-42 -2 V-27 M-36.5 -2 V-34 M-25.5 -2 V-34 M-20 -2 V-27" {...L} strokeWidth={0.6} opacity={0.3} />
            <path d="M-31 -64 L-35 -48.6 H-27 Z" {...F} fill="var(--scene-glow)" strokeWidth={0.9} />
            <text x={-31} y={-27.2} textAnchor="middle" fontSize={4.8} textLength={20} lengthAdjust="spacingAndGlyphs" fill="var(--sc-accent)" stroke="none" style={SIGN_TXT}>MYSTERY</text>
            <text x={-31} y={-22.2} textAnchor="middle" fontSize={4.8} textLength={17} lengthAdjust="spacingAndGlyphs" fill="var(--sc-accent)" stroke="none" style={SIGN_TXT}>SHACK</text>
            <rect x={-37} y={-17.4} width={10} height={17.4} {...F} fill="var(--sc-door)" strokeWidth={1} />
            <circle cx={-29.4} cy={-8.6} r={0.9} fill={AV_YELLOW} stroke="none" />
            {/* the porch deck and its two steps */}
            <path d="M-54 0 V-3.6 H-8 V0 Z" {...F} fill={WOOD} strokeWidth={1.1} />
            <path d="M-46 -3.6 V0 M-38 -3.6 V0 M-30 -3.6 V0 M-22 -3.6 V0 M-14 -3.6 V0" {...L} strokeWidth={0.5} opacity={0.4} />
            <path d="M-8 -3.6 H-4.6 V-1.8 H-1.4 V0 H-8 Z" {...F} fill={WOOD} strokeWidth={0.9} />

            {/* the roof: shingle courses and joints, two patch planks, moss along the ridge */}
            <path d={`M${pt(A)} L${pt(B)} L${pt(C)} L${pt(D)} Z`} {...F} fill={SHACK_ROOF} strokeWidth={1.5} />
            <path d={rows} {...L} strokeWidth={0.7} opacity={0.4} />
            <path d={joints} {...L} strokeWidth={0.5} opacity={0.3} />
            <path d={quad(0.4, 0.4, 0.74, 0.54)} {...F} fill={WOOD} strokeWidth={1} />
            <path d={quad(0.5, 0.62, 0.86, 0.76)} {...F} fill={WOOD} strokeWidth={1} />
            <path d={moss} {...F} fill={MOSS} strokeWidth={1} />

            {/* the sign: two posts, the MYSTERY board and the SHACK board (offset, a little lower), a pair of lamps, the loudspeaker, the question-mark weathervane */}
            <path d="M-15 -65 V-69 M13 -65 V-51" {...L} strokeWidth={2.6} />
            <path d="M-15 -65 V-69 M13 -65 V-51" stroke={WOOD} strokeWidth={1.2} strokeLinecap="round" fill="none" />
            <ellipse cx={-6} cy={-92} rx={30} ry={13} {...GLOW} opacity={0.12} />
            <rect x={-30} y={-98} width={46} height={17} rx={1.2} {...F} fill={AV_YELLOW} strokeWidth={1.4} />
            <text x={-7} y={-85.4} textAnchor="middle" fontSize={12.4} textLength={41} lengthAdjust="spacingAndGlyphs" fill={INK} stroke="none" style={SIGN_TXT}>MYSTERY</text>
            <rect x={-21} y={-82} width={41} height={17} rx={1.2} {...F} fill={AV_YELLOW} strokeWidth={1.4} />
            <text x={-0.5} y={-69.2} textAnchor="middle" fontSize={13} textLength={35} lengthAdjust="spacingAndGlyphs" fill={ZK_RED} stroke="none" style={SIGN_TXT}>SHACK</text>
            {[-21, 3].map(x => (
                <g key={x}>
                    <path d={`M${x} -98 Q${x} -104.4 ${x + 5.4} -103`} {...L} strokeWidth={1.1} />
                    <path d={`M${x + 3.6} -104.4 h4 l-1 2.8 h-2 Z`} {...F} fill={SHACK_ROOF} strokeWidth={0.8} />
                </g>
            ))}
            <path d="M-35 -77 L-43 -81.4 V-71 L-35 -73.4 Z" {...F} fill={GRAY} strokeWidth={1} />
            <path d="M-35 -75 V-72 M-33 -72.6 L-31 -72" {...L} strokeWidth={0.9} />
            <path d="M31 -35 V-71 M26.4 -62 H35.6 M27.4 -64.4 L34.6 -59.8 M34.6 -64.4 L27.4 -59.8" {...L} strokeWidth={0.9} />
            <g transform="translate(31 -78) scale(0.95)">
                <path d="M-3.2 -2 Q-3.2 -5.4 0 -5.4 Q3.2 -5.4 3.2 -2.6 Q3.2 -0.4 0 0.8 V2.6" {...L} strokeWidth={1.5} />
                <circle cx={0} cy={5.6} r={0.9} {...DOT} />
            </g>

            {/* the bunting: a string from the far end of the ridge down to the annex roof */}
            <path d={`M${pt(b0)} Q${rd((b0[0] + b1[0]) / 2)} ${rd((b0[1] + b1[1]) / 2 + 10)} ${pt(b1)}`} {...L} strokeWidth={0.7} />
            {flags}

            {/* the lantern on its post, at the foot of the deck */}
            <circle cx={-57} cy={-32} r={15} {...GLOW} opacity={0.14} /><circle cx={-57} cy={-32} r={8} {...GLOW} opacity={0.2} />
            <rect x={-59.2} y={-30} width={4.4} height={30} {...F} fill={SHACK_WALL} strokeWidth={1.1} />
            <rect x={-60.4} y={-37} width={6.8} height={7} {...F} fill="var(--scene-glow)" strokeWidth={1.1} />
            <path d="M-61.4 -37 H-52.6 L-57 -41 Z" {...F} fill={SHACK_ROOF} strokeWidth={1} />
        </P>
    )
}

/**
 * A giant toadstool of the gnome forest (origin = the middle of the stem's foot, ~45 tall, cap ~44 across): a red-coral dome with pale lavender spots, a blue
 * underside of gills and a tapering blue stem — after the show's own, where they stand higher than the gnomes.
 */
const CAP_RED = 'color-mix(in srgb, var(--sc-accent) 82%, var(--sc-door))'
const SPOT = 'color-mix(in srgb, var(--sc-glass) 40%, var(--sc-snow))'
const STEM = 'color-mix(in srgb, var(--sc-panel) 80%, var(--sc-door))'
const GILLS = 'color-mix(in srgb, var(--sc-panel) 52%, var(--sc-door))'
export function GfMushroom(p: PlaceProps) {
    return (
        <P {...p}>
            {/* the stem, with a few faint stripes, and the gills under the cap */}
            <path d="M-5.2 0 Q-3.2 -8 -3.8 -17.4 H3.8 Q3.2 -8 5.2 0 Q0 1.8 -5.2 0 Z" {...F} fill={STEM} strokeWidth={1.3} />
            <path d="M-1.8 -16 Q-2.2 -8 -2.6 -1.6 M1.6 -16 Q2 -8 2.8 -1.4" {...L} strokeWidth={0.7} opacity={0.35} />
            <ellipse cx={0} cy={-19} rx={21.6} ry={5.2} {...F} fill={GILLS} strokeWidth={1.3} />
            <path d="M-17 -19.4 Q-7 -16.6 0 -16.4 M17 -19.4 Q7 -16.6 0 -16.4 M-10 -18.4 L-8 -15.6 M-3 -17.4 V-14.4 M4 -17.2 L3.4 -14.4 M10.6 -18.2 L8.8 -15.4" {...L} strokeWidth={0.6} opacity={0.4} />
            {/* the cap: a dome whose rim bulges up in the middle so the gills show beneath it */}
            <path d="M-22 -19 C-22.6 -34 -10.6 -45.4 0 -45.4 C10.6 -45.4 22.6 -34 22 -19 Q0 -23.4 -22 -19 Z" {...F} fill={CAP_RED} strokeWidth={1.4} />
            <path d="M10 -43.4 C18 -38.6 22.4 -30 22 -19 Q14.4 -20.8 9.6 -21.4 Z" {...SHADE} />
            <path d="M-20.6 -23 Q0 -26.4 20.6 -23" {...L} strokeWidth={0.6} opacity={0.3} />
            {/* pale spots */}
            {[[-9, -35, 4.8, 3.2, -14], [5.6, -38, 3.8, 2.6, 8], [13.2, -28.4, 3.2, 2.2, 30], [-15.4, -27, 3, 2.2, -28], [-1.4, -26.6, 2.6, 1.8, 0]].map(([x, y, rx, ry, r], i) => (
                <ellipse key={i} cx={x} cy={y} rx={rx} ry={ry} transform={`rotate(${r} ${x} ${y})`} {...F} fill={SPOT} strokeWidth={0.9} />
            ))}
        </P>
    )
}

/**
 * A garden gnome (origin = feet, ~55 tall with the hat; the show says a gnome stands about ten inches, so a scene draws it a good deal bigger than true scale
 * to be seen): a tall red pointed hat pulled down to the brows, big round eyes with white brows, a big round pink nose over a white moustache, a long white
 * beard over an aqua shirt, short dark-blue legs, small dark shoes. `pupilWrap` wraps both pupils (drawn at the eyes' centres) so a scene can aim them.
 */
const GN_SHIRT = 'color-mix(in srgb, var(--sc-glass) 58%, var(--sc-alien))'
export function GfGnome({ pupilWrap, ...p }: PlaceProps & { pupilWrap?: (pupils: ReactNode) => ReactNode }) {
    const items: Item[] = [
        limb('M-3 -9 V-3.4', 3.4, NAVY), limb('M3 -9 V-3.4', 3.4, NAVY),
        oval(-3.5, -1.5, 3.7, 1.9, SHOE), oval(3.5, -1.5, 3.7, 1.9, SHOE),
        path('M-6.4 -21 Q0 -23.4 6.4 -21 L7 -9 Q0 -7 -7 -9 Z', GN_SHIRT),
        limb('M-6 -19.6 L-9.4 -11.6', 3.2, GN_SHIRT), oval(-9.8, -10, 1.8, 1.7, SKIN),
        limb('M6 -19.6 L9.4 -11.6', 3.2, GN_SHIRT), oval(9.8, -10, 1.8, 1.7, SKIN),
        oval(-6.8, -27, 1.4, 2, SKIN), oval(6.8, -27, 1.4, 2, SKIN),
        oval(0, -27, 7, 6.6, SKIN),
        path('M-7.2 -27 C-9.6 -19 -7.8 -10.6 -2.8 -6.6 Q0 -5.2 2.8 -6.6 C7.8 -10.6 9.6 -19 7.2 -27 C4.4 -23.4 2.2 -22.4 0 -23 C-2.2 -22.4 -4.4 -23.4 -7.2 -27 Z', WHITE),
        path('M-6.8 -25.4 Q-3.4 -28 0 -24.8 Q3.4 -28 6.8 -25.4 Q4.8 -21 0 -22.6 Q-4.8 -21 -6.8 -25.4 Z', WHITE),
        oval(0, -25.6, 2.5, 2.3, PINK),
        path('M-7.6 -30.6 L-1.4 -54 Q0 -56.2 1.4 -54 L7.6 -30.6 Q0 -34.6 -7.6 -30.6 Z', GF_RED),
    ]
    const pupil = (
        <>
            <circle cx={-2.6} cy={-28.2} r={0.95} fill={INK} stroke="none" />
            <circle cx={2.6} cy={-28.2} r={0.95} fill={INK} stroke="none" />
        </>
    )
    const details = (
        <>
            {line('M-6.4 -9.6 Q-3 -8 0 -8.6 Q3 -8 6.4 -9.6', 0.6, 0.35)}
            {line('M-4.6 -13.4 Q-3.8 -17.4 -4.2 -20 M4.6 -13.4 Q3.8 -17.4 4.2 -20', 0.6, 0.3)}
            <ellipse cx={-2.6} cy={-28.2} rx={2.1} ry={2.3} fill={WHITE} stroke={INK} strokeWidth={0.7} />
            <ellipse cx={2.6} cy={-28.2} rx={2.1} ry={2.3} fill={WHITE} stroke={INK} strokeWidth={0.7} />
            {pupilWrap ? pupilWrap(pupil) : pupil}
            {/* the white brows ride the hat's lower edge */}
            <path d="M-5 -31.4 Q-2.8 -32.6 -0.8 -31.6 M0.8 -31.6 Q2.8 -32.6 5 -31.4" fill="none" stroke={INK} strokeWidth={2.2} strokeLinecap="round" />
            <path d="M-5 -31.4 Q-2.8 -32.6 -0.8 -31.6 M0.8 -31.6 Q2.8 -32.6 5 -31.4" fill="none" stroke={WHITE} strokeWidth={1.1} strokeLinecap="round" />
            {line('M-3 -34 Q-3.4 -42 -2 -49', 0.6, 0.3)}
        </>
    )
    return <Figure items={items} details={details} shadow={8} {...p} />
}

/** one pine as a silhouette: three tiers and a trunk, `w` wide and `h` tall, base at the origin */
const pinePath = (w: number, h: number) =>
    `M0 ${-h} L${w * 0.34} ${-h * 0.62} H${w * 0.16} L${w * 0.52} ${-h * 0.3} H${w * 0.24} L${w * 0.72} ${-h * 0.05} H${w * 0.1} V0 H${-w * 0.1} V${-h * 0.05} H${-w * 0.72} L${-w * 0.24} ${-h * 0.3} H${-w * 0.52} L${-w * 0.16} ${-h * 0.62} H${-w * 0.34} Z`

/**
 * A row of pine silhouettes on one baseline: `xs` are [x, scale] pairs. A far row is small, pale and soft; the near row at the edges of the frame is large with a thin
 * outline — stacked in that order they give the clearing its depth.
 */
export function GfForest({ y, tone, xs, h = 40, w = 18, o = 1, outline = false }: { y: number; tone: 'far' | 'mid' | 'near'; xs: [number, number][]; h?: number; w?: number; o?: number; outline?: boolean }) {
    const fill = tone === 'far' ? 'var(--sc-far)' : tone === 'mid' ? 'var(--sc-mid)' : 'var(--sc-near)'
    return (
        <g opacity={o}>
            {xs.map(([x, k], i) => (
                <path key={i} d={pinePath(w, h * (0.86 + ((i * 7) % 5) * 0.07))} transform={`translate(${x} ${y}) scale(${k})`} fill={fill}
                      stroke={outline ? 'currentColor' : 'none'} strokeWidth={outline ? 0.9 / k : 0} strokeLinejoin="round" />
            ))}
        </g>
    )
}

/** a low band of mist: translucent ellipses that drift slowly sideways (`drift` false = still, for reduced motion) */
export function GfMist({ x, y, rx, ry = 7, o = 0.12, drift = true }: { x: number; y: number; rx: number; ry?: number; o?: number; drift?: boolean }) {
    return (
        <g>
            {drift && <animateTransform attributeName="transform" type="translate" values="-18 0;18 0;-18 0" dur="22s" repeatCount="indefinite" calcMode="spline" keyTimes="0;0.5;1" keySplines="0.45 0 0.55 1;0.45 0 0.55 1" />}
            <ellipse cx={x} cy={y} rx={rx} ry={ry} fill="var(--sc-cloud)" stroke="none" opacity={o} />
            <ellipse cx={x + rx * 0.2} cy={y - ry * 0.5} rx={rx * 0.6} ry={ry * 0.7} fill="var(--sc-cloud)" stroke="none" opacity={o * 0.8} />
        </g>
    )
}

/** a boulder (a lumpy silhouette with a thin outline) and a tuft of grass, for the foreground */
export function GfBoulder({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
    return (
        <g transform={`translate(${x} ${y}) scale(${s})`}>
            <path d="M-12 0 C-13 -6 -8 -11 -2 -11 C5 -12 12 -8 13 0 Z" fill="var(--sc-far)" stroke="currentColor" strokeWidth={1} strokeLinejoin="round" />
            <path d="M-4 -9 C0 -10 5 -8 8 -4" fill="none" stroke="currentColor" strokeWidth={0.7} opacity={0.4} />
        </g>
    )
}
export function GfGrass({ xs, y }: { xs: number[]; y: number }) {
    return (
        <g stroke="var(--sc-line)" strokeWidth={0.9} strokeLinecap="round" fill="none" opacity={0.6}>
            {xs.map((x, i) => <path key={i} d={`M${x} ${y} L${x - 2.4} ${y - 5} M${x} ${y} L${x + 0.4} ${y - 6.6 - (i % 3)} M${x} ${y} L${x + 2.6} ${y - 5}`} />)}
        </g>
    )
}

/** a lamp on a post (origin = ground): a warm lantern with a soft glow, and the pool of light it throws on the ground */
export function GfLamp({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
    return (
        <g transform={`translate(${x} ${y}) scale(${s})`}>
            <ellipse cx={0} cy={0} rx={30} ry={4.4} {...GLOW} opacity={0.14} />
            <circle cx={0} cy={-44} r={26} {...GLOW} opacity={0.1} /><circle cx={0} cy={-44} r={15} {...GLOW} opacity={0.18} />
            <path d="M0 0 V-42" {...L} strokeWidth={1.8} />
            <path d="M-3 -43 H3 L4 -49 H-4 Z" {...F} fill="var(--scene-glow)" strokeWidth={1.1} />
            <path d="M-4.6 -49 H4.6 L0 -53 Z" {...F} fill="var(--sc-door)" strokeWidth={1} />
        </g>
    )
}