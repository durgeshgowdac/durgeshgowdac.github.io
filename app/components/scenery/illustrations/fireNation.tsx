/** Fire Nation & friends — Zuko (topknot-free, Book Three), Uncle Iroh (seated, tea-shop green) and the tea table. Nature world only; house style. */
import type { ReactNode } from 'react'
import { AV_BOOT, AV_HAIR, AV_SKIN, AV_TRIM, AV_YELLOW } from './avatarPalette'
import { DOT, F, L, Limb, P, SHADE, type PlaceProps } from './core'

/** Fire Nation red: the coral accent pulled towards dark wood, so it reads as a deep red in both themes */
export const ZK_RED = 'color-mix(in srgb, var(--sc-accent) 74%, var(--sc-door))'
const ZK_RED_D = 'color-mix(in srgb, var(--sc-accent) 52%, var(--sc-door))'
const ZK_DARK = 'color-mix(in srgb, var(--sc-door) 78%, var(--sc-trunk))'
const ZK_SCAR = 'color-mix(in srgb, var(--sc-accent) 58%, var(--scene-fill))'
/** Iroh's Ba Sing Se tea-shop green: an olive, kept apart from Toph's brighter green */
const IR_GREEN = 'color-mix(in srgb, var(--sc-tree) 52%, var(--sc-sign))'
const IR_GREEN_D = 'color-mix(in srgb, var(--sc-tree) 66%, var(--sc-door))'
const IR_GREY = 'color-mix(in srgb, var(--sc-line) 20%, var(--sc-cloud))'
const TEA_POT = 'color-mix(in srgb, var(--sc-trunk) 52%, var(--sc-sign))'
const TEA_WOOD = 'color-mix(in srgb, var(--sc-trunk) 66%, var(--sc-sign))'

/**
 * Prince Zuko, facing front, ~74 tall: short black hair (no topknot), golden eyes, brows pulled low, and the scar over his LEFT
 * eye (our right, since he faces us). A deep-red tunic with gold collar and trim, a dark belt with a flame buckle, dark trousers
 * and boots. He stands in a firebending stance: the back hand (our right) is a fist guarded at his chest; the striking arm is our
 * LEFT one, drawn stretched out sideways (shoulder at −8.6, −52.6, fist at −32, −50). `armWrap` wraps that arm so a scene can
 * rotate it about the shoulder (e.g. rotate(−65 −8.6 −52.6) = guard, 0 = strike).
 */
export function Zuko({ armWrap, ...p }: PlaceProps & { armWrap?: (arm: ReactNode) => ReactNode }) {
    const boot = (sx: 1 | -1) => (
        <>
            <ellipse cx={5 * sx} cy={-2.4} rx={4.8} ry={2.7} {...F} fill={AV_BOOT} strokeWidth={1.1} />
            <path d={`M${5 * sx - 4.2} -6 Q${5 * sx} -4.2 ${5 * sx + 4.2} -6 L${5 * sx + 3.8} -3.8 Q${5 * sx} -2.2 ${5 * sx - 3.8} -3.8 Z`} {...F} fill={AV_YELLOW} strokeWidth={0.9} />
        </>
    )
    const arm = (
        <>
            <Limb d="M-8.6 -52.6 L-27 -50.6" w={5.4} fill={ZK_RED} />
            <Limb d="M-23.4 -51 L-27 -50.6" w={6} fill={AV_YELLOW} />
            <circle cx={-30} cy={-50.2} r={2.5} {...F} fill={AV_SKIN} strokeWidth={1.1} />
        </>
    )
    return (
        <P {...p}>
            <Limb d="M-4.6 -26 L-5.4 -6.6" w={6.6} fill={ZK_DARK} />
            <Limb d="M4.6 -26 L5.4 -6.6" w={6.6} fill={ZK_DARK} />
            {boot(-1)}{boot(1)}
            {/* tunic: deep red, shaded right flank, gold hem, a dark belt with a round flame buckle, gold collar */}
            <path d="M-9.4 -54 Q0 -57.6 9.4 -54 L11 -41 L13.4 -25 Q0 -21.4 -13.4 -25 L-11 -41 Z" {...F} fill={ZK_RED} />
            <path d="M3.4 -56 Q6.6 -55.6 9.4 -54 L11 -41 L13.4 -25 Q8 -23 4 -22.4 Z" {...SHADE} />
            <path d="M-13.6 -26 Q0 -22.4 13.6 -26 L13.4 -23.2 Q0 -19.6 -13.4 -23.2 Z" {...F} fill={AV_YELLOW} strokeWidth={1} />
            <path d="M-11 -33.6 Q0 -30.6 11 -33.6 L10.8 -30.4 Q0 -27.6 -10.8 -30.4 Z" {...F} fill={ZK_DARK} strokeWidth={1.1} />
            <circle cx={0} cy={-31} r={2.3} {...F} fill={AV_YELLOW} strokeWidth={0.9} />
            <path d="M0 -32.8 q1.2 1.4 0 3.4 q-1.2 -1.6 0 -3.4 Z" fill={ZK_RED_D} stroke="none" />
            <path d="M-6 -54.4 Q0 -50.4 6 -54.4 L5.6 -51.8 Q0 -47.8 -5.6 -51.8 Z" {...F} fill={AV_YELLOW} strokeWidth={0.9} />
            <path d="M-2 -52 L0 -47.6 L2 -52" {...L} strokeWidth={0.9} />
            {/* the guarded back arm: elbow out, fist at the chest */}
            <Limb d="M8.8 -52.6 L14.6 -42.6 L6.4 -40.4" w={5.4} fill={ZK_RED} />
            <Limb d="M13.4 -43.6 L14.6 -42.6" w={6} fill={AV_YELLOW} />
            <circle cx={4.6} cy={-40} r={2.5} {...F} fill={AV_SKIN} strokeWidth={1.1} />
            {/* the striking arm */}
            {armWrap ? armWrap(arm) : <g transform="rotate(-65 -8.6 -52.6)">{arm}</g>}
            {/* head: ears, face, short black hair, low brows, golden eyes, the scar over the left eye */}
            <ellipse cx={-8.8} cy={-62.6} rx={1.7} ry={2.5} {...F} fill={AV_SKIN} strokeWidth={1.1} />
            <ellipse cx={8.8} cy={-62.6} rx={1.7} ry={2.5} {...F} fill={AV_SKIN} strokeWidth={1.1} />
            <circle cx={0} cy={-62.6} r={8.8} {...F} fill={AV_SKIN} />
            <path d="M-9.2 -63 C-10.4 -73.8 10.4 -73.8 9.2 -63 C7.6 -66.6 3.4 -68.2 0 -66.4 C-3.4 -68.2 -7.6 -66.6 -9.2 -63 Z" {...F} fill={AV_HAIR} strokeWidth={1.2} />
            <path d="M-4.6 -69.4 L-3.2 -72.4 L-1.4 -69.6 L0.4 -72.8 L2 -69.6 L4 -72 L4.8 -69" {...L} strokeWidth={1} />
            <path d="M1.2 -67.4 Q5.6 -68 8 -63.6 Q8.8 -60 6 -57.4 Q4.6 -60.4 3.6 -62.6 Q1.8 -64.4 1.2 -67.4 Z" fill={ZK_SCAR} stroke="currentColor" strokeWidth={0.7} strokeLinejoin="round" />
            <ellipse cx={-3.3} cy={-62.8} rx={1.6} ry={1.35} fill={AV_YELLOW} stroke="currentColor" strokeWidth={0.7} />
            <ellipse cx={3.3} cy={-62.6} rx={1.5} ry={1.05} fill={AV_YELLOW} stroke="currentColor" strokeWidth={0.7} />
            <circle cx={-3.3} cy={-62.8} r={0.6} {...DOT} /><circle cx={3.3} cy={-62.6} r={0.6} {...DOT} />
            <path d="M-6 -66 L-1.6 -64.4 M6 -66.6 L1.6 -64.6" {...L} strokeWidth={1.2} />
            <path d="M-1.9 -58.2 Q0 -59.4 1.9 -58.2" {...L} strokeWidth={0.9} />
        </P>
    )
}

/**
 * Uncle Iroh, seated cross-legged and facing front (origin = the middle of the seat on the ground, ~58 tall): a round, calm man in an
 * olive tea-shop tunic with a darker sash, a gold hair-piece on his grey topknot, bushy brows, closed contented eyes, a grey moustache
 * and beard. One hand rests on his knee; the other (our LEFT arm) holds a little cup out to the side, as if to catch whatever drifts
 * by — wrap it with `cupWrap` to move it about the shoulder (−11, −36); the cup's rim is at (−24.6, −38).
 */
export function Iroh({ cupWrap, cupFx, ...p }: PlaceProps & {
    cupWrap?: (arm: ReactNode) => ReactNode
    /** drawn inside the held cup's group (so it moves with the cup), in Iroh's own frame: the cup's mouth is centred at (−24.7, −40.4), about 7 wide */
    cupFx?: ReactNode
}) {
    const cup = (
        <>
            <Limb d="M-11 -35 L-19 -28.6 L-23.6 -33.4" w={5.6} fill={IR_GREEN} />
            <circle cx={-23.6} cy={-33.8} r={2.3} {...F} fill={AV_SKIN} strokeWidth={1.1} />
            <path d="M-21.4 -38.6 Q-18.4 -38.4 -18.8 -36.4 Q-19.2 -34.8 -21.6 -35.4" {...L} strokeWidth={1} />
            <path d="M-28.4 -40.4 H-21 L-21.8 -34.6 Q-24.7 -32.8 -27.6 -34.6 Z" {...F} fill="var(--sc-snow)" strokeWidth={1.1} />
            <ellipse cx={-24.7} cy={-40.2} rx={3.3} ry={0.9} fill="color-mix(in srgb, var(--sc-trunk) 70%, var(--scene-fill))" stroke="none" />
            <path d="M-28.4 -40.4 H-21" {...L} strokeWidth={1.4} />
            {cupFx}
        </>
    )
    return (
        <P {...p}>
            {/* crossed legs, the shins in front, soft shoes */}
            <path d="M-25 -3.6 C-26.4 -11 -15 -15 -6 -14 L6 -14 C15 -15 26.4 -11 25 -3.6 C16 2 -16 2 -25 -3.6 Z" {...F} fill={IR_GREEN_D} />
            <path d="M6 -14 C15 -15 26.4 -11 25 -3.6 C20 -1.4 12 -0.4 5.4 0 C9 -5 9 -9 6 -14 Z" {...SHADE} />
            <Limb d="M-19 -6.4 L5.6 -2.6" w={6.6} fill={IR_GREEN_D} />
            <Limb d="M19 -6.4 L-5.6 -3.2" w={6.6} fill={IR_GREEN_D} />
            <ellipse cx={-7} cy={-1.8} rx={4.2} ry={2} {...F} fill={ZK_DARK} strokeWidth={1.1} />
            <ellipse cx={7} cy={-1.8} rx={4.2} ry={2} {...F} fill={ZK_DARK} strokeWidth={1.1} />
            {/* the round olive tunic, a darker sash across the middle, a cream collar */}
            <path d="M-10 -42 Q0 -45.6 10 -42 L15.6 -14 Q0 -8.4 -15.6 -14 Z" {...F} fill={IR_GREEN} />
            <path d="M4 -44 Q7.6 -43.6 10 -42 L15.6 -14 Q10 -11.6 5 -10.6 Z" {...SHADE} />
            <path d="M-15 -23 Q0 -19 15 -23 L14.8 -18.4 Q0 -14.4 -14.8 -18.4 Z" {...F} fill={IR_GREEN_D} strokeWidth={1.1} />
            <path d="M-6 -42.6 Q0 -38.6 6 -42.6 L5.4 -39.8 Q0 -35.6 -5.4 -39.8 Z" {...F} fill="var(--sc-snow)" strokeWidth={0.9} />
            {/* the resting hand on his knee, then the cup arm */}
            <Limb d="M11 -36 L17.6 -26 L13.6 -17.6" w={5.6} fill={IR_GREEN} />
            <circle cx={13.2} cy={-16.4} r={2.3} {...F} fill={AV_SKIN} strokeWidth={1.1} />
            {cupWrap ? cupWrap(cup) : cup}
            {/* head: grey sides and topknot with a small gold piece, big brows, shut contented eyes, moustache and beard */}
            <circle cx={0} cy={-56.6} r={3} {...F} fill={IR_GREY} strokeWidth={1.1} />
            <path d="M-1.6 -59 L0 -61.6 L1.6 -59 Z" {...F} fill={AV_YELLOW} strokeWidth={0.8} />
            <ellipse cx={-9.4} cy={-50} rx={1.8} ry={2.6} {...F} fill={AV_SKIN} strokeWidth={1.1} />
            <ellipse cx={9.4} cy={-50} rx={1.8} ry={2.6} {...F} fill={AV_SKIN} strokeWidth={1.1} />
            <circle cx={0} cy={-50.4} r={9.6} {...F} fill={AV_SKIN} />
            <path d="M-9.6 -51 C-10.6 -59.6 10.6 -59.6 9.6 -51 C8 -54.8 4 -56.4 0 -56.4 C-4 -56.4 -8 -54.8 -9.6 -51 Z" {...F} fill={IR_GREY} strokeWidth={1.2} />
            <path d="M-6.6 -53.6 L-1.8 -52.8 M6.6 -53.6 L1.8 -52.8" {...L} strokeWidth={2} />
            <path d="M-5.6 -50.6 Q-3.6 -48.6 -1.6 -50.6 M5.6 -50.6 Q3.6 -48.6 1.6 -50.6" {...L} strokeWidth={1} />
            <path d="M-9 -47.6 Q-11 -37.6 0 -35.6 Q11 -37.6 9 -47.6 Q4.4 -43.4 0 -43.8 Q-4.4 -43.4 -9 -47.6 Z" {...F} fill={IR_GREY} strokeWidth={1.1} />
            <path d="M-6.4 -46.4 Q-3.2 -48.8 0 -46 Q3.2 -48.8 6.4 -46.4 Q3.2 -44 0 -44.8 Q-3.2 -44 -6.4 -46.4 Z" {...F} fill={IR_GREY} strokeWidth={1} />
            <path d="M-2.2 -42.2 Q0 -40.8 2.2 -42.2" {...L} strokeWidth={0.8} opacity={0.7} />
        </P>
    )
}

/**
 * A low tea table (base at the origin, ~38 wide): a lacquered top on four short legs, a round clay teapot at the left, a teacup on its saucer in the middle and a White Lotus
 * Pai Sho tile standing at the right end, each with its own space. `potWrap` wraps the teapot (spout mouth at about (−17.6, −22)) so it can hover.
 */
export function TeaTable({ potWrap, ...p }: PlaceProps & { potWrap?: (pot: ReactNode) => ReactNode }) {
    const pot = (
        <g transform="translate(-8.6 -9.6)">
            <path d="M-6.4 0 C-8.4 -8 -4 -12.4 0.4 -12.4 C5 -12.4 8.6 -8 6.8 0 Z" {...F} fill={TEA_POT} strokeWidth={1.2} />
            <path d="M3 -12 C6 -11 8 -7 6.8 0 L3.4 0 C4.4 -5 4.4 -9 3 -12 Z" {...SHADE} />
            <path d="M-6 -6.4 C-9.4 -7.6 -10.2 -10.8 -9.6 -13" {...L} strokeWidth={1.4} />
            <path d="M6.6 -9.6 C11 -10 11 -2.8 6.8 -3.4" {...L} strokeWidth={1.2} />
            <path d="M-2.6 -12.4 Q0.4 -15.6 3.4 -12.4 Z" {...F} fill={TEA_WOOD} strokeWidth={1} />
            <circle cx={0.4} cy={-16} r={1.1} {...F} fill={TEA_WOOD} strokeWidth={0.8} />
        </g>
    )
    return (
        <P {...p}>
            <path d="M-15 0 V-6.4 M15 0 V-6.4 M-10 0 V-6.4 M10 0 V-6.4" {...L} strokeWidth={1.3} />
            <rect x={-19} y={-9.6} width={38} height={3.6} rx={1.4} {...F} fill={TEA_WOOD} strokeWidth={1.2} />
            {potWrap ? potWrap(pot) : pot}
            {/* a teacup on its saucer, steaming a little */}
            <g transform="translate(5.2 -9.6)">
                <ellipse cx={0} cy={-0.5} rx={5.2} ry={1.1} {...F} fill="var(--sc-snow)" strokeWidth={0.9} />
                <path d="M3.2 -5.2 q3.4 0.2 2.8 2.6 q-0.4 1.3 -2.4 1.3" {...L} strokeWidth={0.9} />
                <path d="M-3.4 -6 H3.4 L2.7 -1.6 Q0 0.2 -2.7 -1.6 Z" {...F} fill="var(--sc-snow)" strokeWidth={1} />
                <ellipse cx={0} cy={-5.8} rx={3} ry={0.6} fill="color-mix(in srgb, var(--sc-trunk) 70%, var(--scene-fill))" stroke="none" />
                <path d="M-3.4 -6 H3.4" {...L} strokeWidth={1.1} />
                <path d="M0 -7 q-1.5 -1.8 0 -3.4 q1.5 -1.6 0 -3.2" {...L} strokeWidth={0.7} opacity={0.5} strokeDasharray="2.4 1.6">
                    <animate attributeName="stroke-dashoffset" values="0;-8" dur="1.6s" repeatCount="indefinite" />
                </path>
            </g>
            {/* the White Lotus tile, standing at the end of the table, leaning a little: a small square with a five-petal lotus */}
            <g transform="translate(15.8 -9.6) rotate(-7)">
                <rect x={-2.9} y={-6.3} width={5.8} height={6.3} rx={0.9} {...F} fill="var(--sc-snow)" strokeWidth={0.9} />
                <g transform="translate(0 -2.7)" fill="none" stroke="currentColor" strokeWidth={0.55} strokeLinejoin="round">
                    {[-70, -35, 0, 35, 70].map(a => <ellipse key={a} cx={0} cy={-1.3} rx={0.7} ry={1.5} transform={`rotate(${a})`} />)}
                    <circle cx={0} cy={0.1} r={0.5} fill="var(--sc-accent)" stroke="none" />
                </g>
            </g>
        </P>
    )
}