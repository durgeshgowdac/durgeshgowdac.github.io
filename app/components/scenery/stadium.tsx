/**
 * STADIUM PARTS — the dressing around the Quidditch match (see QuidditchScene.tsx): the tournament badge and its trophy, the two
 * house crests, the seven-segment scoreboards, the four coloured stands and their crowds.
 *
 * Same hand as the rest of the library: ink outline in currentColor, round caps and joins, one flat fill per shape from the theme
 * tokens, one soft shade facet (--sc-shade). The only colour that is not a token is the shared scarlet (BALL_RED).
 *   Gryffindor = scarlet + gold (--scene-glow), the lion;   Slytherin = emerald (--sc-alien) + silver (--sc-snow), the snake.
 */
import type { ComponentProps, ReactNode } from 'react'
import { P, L, F, DOT, BALL_RED, BALL_RED_DK } from '@/app/components/scenery/illustrations'

type Place = Omit<ComponentProps<typeof P>, 'children'>
const GOLD = 'var(--scene-glow)', WOOD = 'var(--scene-warm)', SKIN = 'var(--sc-body)', DARK = 'var(--sc-door)', HAIR = 'var(--sc-trunk)'
const SNOW = 'var(--sc-snow)', GREEN = 'var(--sc-alien)', BLUE = 'var(--sc-panel)'
const SHADE = 'var(--sc-shade)'

/* ───────────── trophy, crests ───────────── */

/** a small gold cup; the origin is the middle of its foot, ~16 wide × 21 tall */
export function Trophy(p: Place) {
    return (
        <P {...p}>
            <path d="M-6 -20 C-12 -20 -12 -11 -6.4 -10.6 M6 -20 C12 -20 12 -11 6.4 -10.6" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
            <path d="M-6 -20 C-12 -20 -12 -11 -6.4 -10.6 M6 -20 C12 -20 12 -11 6.4 -10.6" fill="none" stroke={GOLD} strokeWidth={1.1} strokeLinecap="round" />
            <path d="M-6.6 -21 H6.6 V-14.6 C6.6 -8.4 3.4 -6.2 0 -6.2 C-3.4 -6.2 -6.6 -8.4 -6.6 -14.6 Z" fill={GOLD} stroke="currentColor" strokeWidth={1.2} strokeLinejoin="round" />
            <path d="M-4 -19 V-14.4 C-4 -11.6 -3 -10 -1.8 -9.2" fill="none" stroke={SNOW} strokeWidth={1} strokeLinecap="round" opacity={0.8} />
            <path d="M0 -17.6 L1 -15.4 L3.2 -15.2 L1.5 -13.8 L2 -11.6 L0 -12.8 L-2 -11.6 L-1.5 -13.8 L-3.2 -15.2 L-1 -15.4 Z" fill={WOOD} stroke="currentColor" strokeWidth={0.5} strokeLinejoin="round" />
            <rect x={-1.3} y={-6.4} width={2.6} height={4} fill={GOLD} stroke="currentColor" strokeWidth={1} />
            <rect x={-5.2} y={-2.6} width={10.4} height={2.8} rx={1} fill={WOOD} stroke="currentColor" strokeWidth={1.1} />
        </P>
    )
}

const SHIELD = 'M-9 -11 H9 V2 C9 8 4 11 0 13 C-4 11 -9 8 -9 2 Z'
/** Gryffindor's lion: a gold mane round a warm face on a scarlet shield; ~18 × 24, centred */
export function LionCrest(p: Place) {
    const mane = Array.from({ length: 10 }, (_, i) => { const a = (i / 10) * Math.PI * 2; return [Math.round(Math.cos(a) * 56) / 10, Math.round((-1 + Math.sin(a) * 5.6) * 10) / 10] as const })   // rounded: the server and the browser round the last digit of cos/sin differently, which is a hydration mismatch
    return (
        <P {...p}>
            <path d={SHIELD} fill={BALL_RED} stroke="currentColor" strokeWidth={1.3} strokeLinejoin="round" />
            <path d="M-9 -4 H9" stroke={GOLD} strokeWidth={0.8} opacity={0.0} />
            {mane.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={2.5} fill={GOLD} stroke="currentColor" strokeWidth={0.6} />)}
            <circle cx={0} cy={-1} r={5.2} fill={GOLD} stroke="currentColor" strokeWidth={0.7} />
            <circle cx={0} cy={-0.6} r={3.6} fill={WOOD} stroke="currentColor" strokeWidth={0.7} />
            <circle cx={-3.2} cy={-4.4} r={1.3} fill={WOOD} stroke="currentColor" strokeWidth={0.6} />
            <circle cx={3.2} cy={-4.4} r={1.3} fill={WOOD} stroke="currentColor" strokeWidth={0.6} />
            <circle cx={-1.5} cy={-1.4} r={0.6} {...DOT} /><circle cx={1.5} cy={-1.4} r={0.6} {...DOT} />
            <path d="M-0.9 0.2 H0.9 L0 1.2 Z" fill="currentColor" />
            <path d="M-1.6 2 Q0 3.2 1.6 2" {...L} strokeWidth={0.6} />
        </P>
    )
}
/** Slytherin's snake: a silver coil on an emerald shield; ~18 × 24, centred */
export function SnakeCrest(p: Place) {
    const coil = 'M2.6 -6.2 C-4.8 -6.2 -4.8 -1 -0.2 0.2 C4.8 1.4 4.6 6.6 -3 6.8'
    return (
        <P {...p}>
            <path d={SHIELD} fill={GREEN} stroke="currentColor" strokeWidth={1.3} strokeLinejoin="round" />
            <path d={SHIELD} fill={SHADE} opacity={0.25} />
            <path d={coil} fill="none" stroke="currentColor" strokeWidth={4.6} strokeLinecap="round" />
            <path d={coil} fill="none" stroke={SNOW} strokeWidth={2.4} strokeLinecap="round" />
            <ellipse cx={3.6} cy={-6.6} rx={2.8} ry={2.1} fill={SNOW} stroke="currentColor" strokeWidth={0.8} />
            <circle cx={4.2} cy={-7.1} r={0.55} {...DOT} />
            <path d="M6.2 -6.4 L8.2 -6.9 M6.2 -6.4 L8.2 -5.6" stroke={BALL_RED} strokeWidth={0.7} strokeLinecap="round" />
        </P>
    )
}

/* ───────────── seven-segment digits ───────────── */

const SEGS = ['a', 'b', 'c', 'd', 'e', 'f', 'g'] as const
const DIGIT_SEGS: Record<string, string> = { '0': 'abcdef', '1': 'bc', '2': 'abdeg', '3': 'abcdg', '4': 'bcfg', '5': 'acdfg', '6': 'acdefg', '7': 'abc', '8': 'abcdefg', '9': 'abcdfg', ' ': '' }
/** a digit's lit segments as a string of segment letters; `null`/' ' = blank */
export const litSegs = (d: string | null) => DIGIT_SEGS[d ?? ' '] ?? ''
function segRect(s: typeof SEGS[number], w: number, h: number, t: number) {
    const m = h / 2, k = t * 0.5
    switch (s) {
        case 'a': return { x: k, y: 0, w: w - 2 * k, h: t }
        case 'd': return { x: k, y: h - t, w: w - 2 * k, h: t }
        case 'g': return { x: k, y: m - t / 2, w: w - 2 * k, h: t }
        case 'b': return { x: w - t, y: k, w: t, h: m - k - t * 0.2 }
        case 'c': return { x: w - t, y: m + t * 0.2, w: t, h: m - k - t * 0.2 }
        case 'f': return { x: 0, y: k, w: t, h: m - k - t * 0.2 }
        default: return { x: 0, y: m + t * 0.2, w: t, h: m - k - t * 0.2 }
    }
}
/** one seven-segment digit. Unlit segments stay faintly visible (a calculator's ghost "8"). A static digit takes `value`; an
 *  animated one takes `seq`: the digit at each moment of the clock (`times` are 0–1 fractions of `dur`, first one 0). */
export function Digit({ x, y, w = 22, h = 36, t = 4.6, value, seq, color, ghost = 0.13 }: {
    x: number; y: number; w?: number; h?: number; t?: number; color: string; ghost?: number
    value?: string | null
    seq?: { dur: string; times: number[]; digits: (string | null)[] }
}) {
    return (
        <g transform={`translate(${x} ${y})`}>
            {SEGS.map(s => {
                const r = segRect(s, w, h, t)
                const on = (d: string | null) => (litSegs(d).includes(s) ? 1 : ghost)
                return (
                    <rect key={s} x={r.x} y={r.y} width={r.w} height={r.h} rx={t / 2} fill={color} opacity={seq ? on(seq.digits[0]) : on(value ?? null)}>
                        {seq && <animate attributeName="opacity" dur={seq.dur} repeatCount="indefinite" calcMode="discrete" keyTimes={seq.times.join(';')} values={seq.digits.map(on).join(';')} />}
                    </rect>
                )
            })}
        </g>
    )
}

/* ───────────── a scoreboard ───────────── */

export const BOARD_W = 144, BOARD_H = 112
export type Team = {
    name: string; frame: string; screen: string; screenShade: boolean; text: string; digit: string; title: string
    seeker: string; hair: string; glasses: boolean; scar: boolean
}
export const GRYFFINDOR: Team = { name: 'GRYFFINDOR', frame: BALL_RED, screen: BALL_RED_DK, screenShade: false, text: GOLD, digit: GOLD, title: GOLD, seeker: 'Harry Potter', hair: HAIR, glasses: true, scar: true }
export const SLYTHERIN: Team = { name: 'SLYTHERIN', frame: GREEN, screen: GREEN, screenShade: true, text: SNOW, digit: SNOW, title: '#0b3a25', seeker: 'Draco Malfoy', hair: GOLD, glasses: false, scar: false }

/** the seeker's portrait on the board: a round face, hair, and (for Harry) glasses and the scar */
function Portrait({ team }: { team: Team }) {
    return (
        <g>
            <circle r={9} fill="var(--scene-fill)" stroke="currentColor" strokeWidth={1} />
            <circle cx={0} cy={1} r={6.2} fill={SKIN} stroke="currentColor" strokeWidth={0.9} />
            {team.glasses
                ? <path d="M-6 -1.6 C-6.4 -7.6 -1.6 -8.4 1.4 -7.6 C4.6 -7.2 6.6 -4.8 6.2 -1.6 C3.6 -3.2 -1 -3 -3 -0.6 Z" fill={team.hair} stroke="currentColor" strokeWidth={0.8} strokeLinejoin="round" />
                : <path d="M-6.4 -0.6 C-6.6 -7.6 0 -8.4 3.2 -7 C5.6 -6 6.6 -3.4 6.4 -0.8 C3.4 -3.4 -3 -3.4 -6.4 -0.6 Z" fill={team.hair} stroke="currentColor" strokeWidth={0.8} strokeLinejoin="round" />}
            {team.scar && <path d="M-0.4 -4.8 L1 -4.6 L0.2 -3.6 L1.1 -3.6 L-0.4 -2.4 L-0.1 -3.4 L-0.9 -3.4 Z" fill="var(--sc-accent)" />}
            {team.glasses && (<><circle cx={-2.4} cy={0.4} r={2} fill="none" stroke="currentColor" strokeWidth={0.8} /><circle cx={2.4} cy={0.4} r={2} fill="none" stroke="currentColor" strokeWidth={0.8} /><path d="M-0.4 0.4 H0.4" {...L} strokeWidth={0.7} /></>)}
            {!team.glasses && (<><circle cx={-2.2} cy={0.6} r={0.7} {...DOT} /><circle cx={2.2} cy={0.6} r={0.7} {...DOT} /></>)}
            <path d="M-2 4 Q0 5.4 2 4" {...L} strokeWidth={0.8} />
        </g>
    )
}

/** a team-coloured points screen: crest and name on top, a three-digit seven-segment score, the Seeker's portrait and name,
 *  `digits` gives the three digits either statically or as clock sequences; `final` is the
 *  little "FINAL" label that lights up when the match is over. */
export function Scoreboard({ team, crest, digits, final, ...p }: Place & {
    team: Team; crest: ReactNode
    digits: ({ value: string | null } | { seq: { dur: string; times: number[]; digits: (string | null)[] } })[]
    final: ReactNode
}) {
    const dw = 22, gap = 7, x0 = 9 + (126 - (3 * dw + 2 * gap)) / 2
    return (
        <P {...p}>
            <rect width={BOARD_W} height={BOARD_H} rx={9} fill={team.frame} stroke="currentColor" strokeWidth={1.4} />
            {team.screenShade && <rect width={BOARD_W} height={BOARD_H} rx={9} fill={SHADE} opacity={0.32} />}
            <rect y={BOARD_H - 30} width={BOARD_W} height={30} rx={9} fill={SHADE} opacity={0.22} />
            {[[5, 5], [BOARD_W - 5, 5], [5, BOARD_H - 5], [BOARD_W - 5, BOARD_H - 5]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={1.4} fill={team.text} opacity={0.7} />)}
            <g transform="translate(21 19)">{crest}</g>
            <text x={38} y={23} fontSize={11.5} fontWeight={800} letterSpacing={0.7} fill={team.title} stroke={team.title === team.text ? 'currentColor' : SNOW} strokeWidth={team.title === team.text ? 0.5 : 0.35} paintOrder="stroke" fontFamily="inherit">{team.name}</text>
            <rect x={9} y={36} width={126} height={52} rx={5} fill={team.screen} stroke="currentColor" strokeWidth={1.2} />
            {team.screenShade && <rect x={9} y={36} width={126} height={52} rx={5} fill={SHADE} opacity={0.55} />}
            <path d="M14 40 H70" stroke={SNOW} strokeWidth={1} strokeLinecap="round" opacity={0.18} />
            {digits.map((d, i) => <Digit key={i} x={x0 + i * (dw + gap)} y={44} w={dw} h={36} t={4.6} color={team.digit} {...('seq' in d ? { seq: d.seq } : { value: d.value })} />)}
            <g transform="translate(14 46)">{final}</g>
            <rect x={9} y={93} width={126} height={14} rx={4.5} fill="var(--scene-fill)" stroke="currentColor" strokeWidth={1} />
            <g transform="translate(21 100) scale(0.72)"><Portrait team={team} /></g>
            <text x={34} y={104} fontSize={10.4} fontWeight={700} fill={SNOW} stroke="none" fontFamily="inherit">{team.seeker}</text>
        </P>
    )
}

/* ───────────── the stands ───────────── */

export const STAND_W = 320          // design width: drawn at ~0.43 scale as a long, low, far-away stand
export const STANDS: { id: 'red' | 'yellow' | 'blue' | 'green'; x: number; color: string }[] = [
    { id: 'red', x: 101, color: BALL_RED },
    { id: 'yellow', x: 248, color: GOLD },
    { id: 'blue', x: 395, color: BLUE },
    { id: 'green', x: 542, color: GREEN },
]
const HAIRS = [DARK, HAIR, GOLD, WOOD]
/** one stand: three planks of seats in a single colour, seven spectators on each, cheering (each row bobs on its own beat).
 *  Drawn top row first so the lower rows overlap the planks above them. `y` is the top of the top plank. */
export function Stand({ x, y, color, still, w = STAND_W, rows = 3, perRow = 16, deep = false }: { x: number; y: number; color: string; still: boolean; w?: number; rows?: number; perRow?: number; deep?: boolean }) {
    const planks = Array.from({ length: rows }, (_, i) => ({ y: y + i * 24, h: i === rows - 1 ? 22 : 20 }))
    return (
        <g>
            <rect x={x - 3} y={y - 22} width={w + 6} height={(rows - 1) * 24 + 44} rx={6} fill="var(--sc-far)" stroke="currentColor" strokeWidth={1} opacity={0.9} />
            {planks.map((pl, i) => (
                <g key={i}>
                    <rect x={x} y={pl.y} width={w} height={pl.h} rx={3} fill={color} stroke="currentColor" strokeWidth={1.2} />
                    {deep && <rect x={x} y={pl.y} width={w} height={pl.h} rx={3} fill={SHADE} opacity={0.3} />}
                    <rect x={x + 1.2} y={pl.y + pl.h - 7} width={w - 2.4} height={5.8} rx={2} fill={SHADE} opacity={0.3} />
                    <g>
                        {!still && <animateTransform attributeName="transform" type="translate" dur={`${0.5 + i * 0.07}s`} begin={`-${(i * 0.19).toFixed(2)}s`} repeatCount="indefinite" values="0 0;0 -1.8;0 0" />}
                        {Array.from({ length: perRow }, (_, j) => {
                            const cx = x + 9 + j * ((w - 18) / (perRow - 1)), top = pl.y + 1
                            return (
                                <g key={j}>
                                    <path d={`M${cx - 5.4} ${top} V${top - 5} Q${cx - 5.4} ${top - 8.6} ${cx - 1.6} ${top - 8.6} H${cx + 1.6} Q${cx + 5.4} ${top - 8.6} ${cx + 5.4} ${top - 5} V${top} Z`} fill={color} stroke="currentColor" strokeWidth={1} strokeLinejoin="round" />
                                    <circle cx={cx} cy={top - 13} r={4.3} fill={SKIN} stroke="currentColor" strokeWidth={1} />
                                    <path d={`M${cx - 4.3} ${top - 13.6} A4.3 4.3 0 0 1 ${cx + 4.3} ${top - 13.6} Q${cx} ${top - 15.4} ${cx - 4.3} ${top - 13.6} Z`} fill={HAIRS[(i + j * 3) % 4]} stroke="currentColor" strokeWidth={0.7} strokeLinejoin="round" />
                                </g>
                            )
                        })}
                    </g>
                </g>
            ))}
        </g>
    )
}

/* ───────────── the ferret ───────────── */

/** a small white ferret sitting on a ledge, facing right: a long body, stubby legs, pink nose, a tail that flicks. The origin is the
 *  middle of its belly on the ledge; ~34 long × 14 tall. */
export function Ferret({ wag = true, ...p }: Place & { wag?: boolean }) {
    return (
        <P {...p}>
            <g>
                {wag && <animateTransform attributeName="transform" type="rotate" dur="1.3s" repeatCount="indefinite" values="-8 -12 -5;9 -12 -5;-8 -12 -5" calcMode="spline" keySplines="0.45 0 0.55 1;0.45 0 0.55 1" keyTimes="0;0.5;1" />}
                <path d="M-12 -3 C-19 -2 -24 -6 -21 -12 C-19 -9.6 -15.6 -8.4 -11.6 -7.4 Z" fill={SNOW} stroke="currentColor" strokeWidth={1.1} strokeLinejoin="round" />
            </g>
            <ellipse cx={-9.4} cy={-0.6} rx={2.6} ry={1.4} fill={SNOW} stroke="currentColor" strokeWidth={1} />
            <ellipse cx={5.6} cy={-0.6} rx={2.6} ry={1.4} fill={SNOW} stroke="currentColor" strokeWidth={1} />
            <ellipse cx={-2} cy={-4.6} rx={13} ry={4.6} fill={SNOW} stroke="currentColor" strokeWidth={1.2} />
            <path d="M-8 -2 Q-2 -0.6 4 -2" {...L} strokeWidth={0.7} opacity={0.35} />
            <ellipse cx={11.6} cy={-7.4} rx={5.4} ry={4.2} fill={SNOW} stroke="currentColor" strokeWidth={1.2} />
            <ellipse cx={16.4} cy={-6.2} rx={2.7} ry={2} fill={SNOW} stroke="currentColor" strokeWidth={1} />
            <circle cx={18.6} cy={-6.6} r={0.95} fill="var(--sc-accent)" stroke="currentColor" strokeWidth={0.4} />
            <circle cx={9} cy={-11.2} r={2} fill={SNOW} stroke="currentColor" strokeWidth={1} />
            <circle cx={9} cy={-11.2} r={0.9} fill="var(--sc-accent)" opacity={0.7} />
            <circle cx={13.2} cy={-8.6} r={0.85} {...DOT} />
            <path d="M17.4 -5.4 L21.6 -4.8 M17.4 -5 L21.2 -3.2" {...L} strokeWidth={0.5} opacity={0.7} />
        </P>
    )
}

/* ───────────── the title badge and the winner's banner ───────────── */

/** the dotted tournament badge: a pill with a dotted outline, a small trophy and the title; centred on (x, y) */
export function Badge({ x, y, w = 404, h = 28, title }: { x: number; y: number; w?: number; h?: number; title: string }) {
    return (
        <g transform={`translate(${x} ${y})`}>
            <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2} fill="var(--scene-fill)" opacity={0.92} />
            <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeDasharray="0.1 5" />
            <Trophy x={-w / 2 + 26} y={h / 2 - 3.5} s={0.85} />
            <text x={16} y={4} textAnchor="middle" fontSize={11.4} fontWeight={700} letterSpacing={0.4} fill="currentColor" stroke="none" fontFamily="inherit">{title}</text>
        </g>
    )
}

/** "Gryffindor Wins!": a scarlet pill with a gold edge and a cup at each end, centred on the origin */
export function WinBanner({ text, w = 214, h = 27 }: { text: string; w?: number; h?: number }) {
    return (
        <g>
            <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2} fill={BALL_RED} stroke="currentColor" strokeWidth={3.2} />
            <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2} fill="none" stroke={GOLD} strokeWidth={1.4} />
            <Trophy x={-w / 2 + 17} y={h / 2 - 3.4} s={0.82} />
            <Trophy x={w / 2 - 17} y={h / 2 - 3.4} s={0.82} />
            <text x={0} y={5.4} textAnchor="middle" fontSize={14} fontWeight={800} letterSpacing={0.4} fill={GOLD} stroke="currentColor" strokeWidth={0.6} paintOrder="stroke" fontFamily="inherit">{text}</text>
        </g>
    )
}
void F