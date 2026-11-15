import type { ReactNode } from 'react'
import { L } from '@/app/components/scenery/illustrations/core'
import ElementMarksPicker from '@/app/components/ElementMarksPicker'

/**
 * Four small emblems for the foot of every Ch.02 hackathon card — the same four on every card, so the cards read as one set.
 *   Nature  the four elements of Avatar: The Last Airbender   Water · Earth · Fire · Air
 *   Space   four Star Wars emblems                            Galactic Empire · Rebel Alliance · Jedi Order · Sith Order (all four are Font Awesome Free brand icons)
 * Same crossfade as every other scene (.scene-nature / .scene-space); bold line-and-solid symbols in theme tokens only (no hard-coded colours).
 * Each emblem is drawn in a 24 × 24 box. Hover, tap or keyboard-focus a mark for its name (see ElementMarksPicker); the same two sets spin as the
 * loading indicator (see ElementSpinner), so NATURE and SPACE are exported.
 */

const r2 = (n: number) => Math.round(n * 100) / 100

/* ───── Avatar: the four elements ───── */
/* Bare line symbols, drawn the way the series draws them, each in its element's colour:
   Earth (teal) · Water (blue) · Fire (orange) · Air (yellow). */

const EARTH = 'color-mix(in srgb, color-mix(in srgb, var(--sc-tree) 62%, var(--sc-panel)) 72%, var(--sc-line))'
const WATER = 'color-mix(in srgb, var(--sc-panel) 78%, var(--sc-line))'
const FIRE = 'color-mix(in srgb, var(--scene-warm) 84%, var(--sc-line))'
const AIR = 'color-mix(in srgb, var(--scene-glow) 66%, var(--sc-line))'

/** a spiral of ever wider half-turns on the line y = cy, starting at cx; the n-th half-turn has radius u × n (keep u above the stroke width, or the turns fuse) */
const spiral = (cx: number, cy: number, u: number, turns: number) => {
    let d = `M${r2(cx)} ${r2(cy)}`
    let x = cx
    for (let n = 1; n <= turns; n++) {
        const r = u * n
        x += (n % 2 ? 1 : -1) * 2 * r
        d += ` A${r2(r)} ${r2(r)} 0 0 1 ${r2(x)} ${r2(cy)}`
    }
    return d
}

function Glyph({ color, children }: { color: string; children: ReactNode }) {
    return <g {...L} strokeWidth={1.35} stroke={color}>{children}</g>
}

/** Earth — the squat trapezoid: a spiral up top, two slabs of ground below. */
const Earth = () => (
    <Glyph color={EARTH}>
        <path d="M8 2.6 H16 L21.6 18.2 Q22.2 21.4 19 21.4 H5 Q1.8 21.4 2.4 18.2 Z" />
        <path d={spiral(10.7, 9.4, 1.3, 3)} />
        <path d="M5.4 15.2 H10.8 M13.2 15.2 H18.6" />
        <rect x={4.8} y={17.2} width={6} height={2.6} rx={0.6} />
        <rect x={13.2} y={17.2} width={6} height={2.6} rx={0.6} />
    </Glyph>
)

/** Water — a ring holding long ribbons of wave under three curling crests. */
const Water = () => (
    <Glyph color={WATER}>
        <circle cx={12} cy={12} r={10.4} />
        <path d="M2 12.4 C6.5 10.8 10.5 12.4 14 14.6 S18.6 16.6 20.2 14.6" />
        <path d="M2.8 16 C7 15 10.4 16.6 13.6 18.4 S18 19.8 19.6 18.6" />
        <path d={spiral(5.2, 9, 1.1, 2)} />
        <path d={spiral(10, 7.2, 1.1, 2)} />
        <path d={spiral(14.8, 8.2, 1.1, 2)} />
    </Glyph>
)

/** Fire — tongues of flame round a spiral. */
const Fire = () => (
    <Glyph color={FIRE}>
        <g transform="translate(12 12) scale(1.1) translate(-12 -12.2)">
            <path d="M5.6 18.4 C4.2 15 5.2 11.6 7.2 9.6 C7.2 11 7.8 12 8.8 12.6 C8.6 9 10.2 5.6 12.4 3.6 C12.6 6 14.2 8 15.2 10 C15.8 9.5 16 9 16 8.2 C18.2 10.6 19.2 14.6 17.6 18 Q16.2 20.6 12 20.6 Q8 20.6 5.6 18.4 Z" />
            <path d={spiral(10.9, 16, 1.1, 3)} />
        </g>
    </Glyph>
)

/** Air — three loose spirals: two above, one below. */
const Air = () => (
    <Glyph color={AIR}>
        <path d={spiral(3.4, 9, 1.25, 3)} />
        <path d={spiral(13.6, 9, 1.25, 3)} />
        <path d={spiral(8.6, 18, 1.25, 3)} />
    </Glyph>
)

/* ───── Star Wars: four emblems ───── */
/* The four factions of the saga, each drawn from its Font Awesome Free 6 (Brands) icon — empire, rebel, jedi-order, sith.
   Icons: © Fonticons, Inc., CC BY 4.0 — https://fontawesome.com/license/free. Each path is scaled from FA's 512-high box into our 24 × 24 box
   and centred horizontally (the Empire is 496 wide, the Jedi Order and the Sith 448). */

/* Faction colours (defined once in about-cards.css, tuned for the dark Space theme):
   Imperial stark grey · Rebel red · Jedi gold · Sith crimson. */
const EMPIRE = 'var(--mark-empire)'
const REBEL = 'var(--mark-rebel)'
const JEDI = 'var(--mark-jedi)'
const SITH = 'var(--mark-sith)'

const FA_SCALE = 24 / 512

/** One Font Awesome brand icon, filled in a faction colour. `w` is the icon's own width in FA's 512-high box. */
function FaBrand({ color, path, w }: { color: string; path: string; w: number }) {
    return (
        <g fill={color} stroke="none">
            <path d={path} transform={`translate(${r2((24 - w * FA_SCALE) / 2)} 0) scale(${FA_SCALE})`} />
        </g>
    )
}

/** Galactic Empire — the Imperial crest: a ringed disc with six flared spokes (FA "empire"). */
const EMPIRE_PATH =
    "M287.6 54.2c-10.8-2.2-22.1-3.3-33.5-3.6V32.4c78.1 2.2 146.1 44 184.6 106.6l-15.8 9.1c-6.1-9.7-12.7-18.8-20.2-27.1l-18 15.5c-26-29.6-61.4-50.7-101.9-58.4l4.8-23.9zM53.4 322.4l23-7.7c-6.4-18.3-10-38.2-10-58.7s3.3-40.4 9.7-58.7l-22.7-7.7c3.6-10.8 8.3-21.3 13.6-31l-15.8-9.1C34 181 24.1 217.5 24.1 256s10 75 27.1 106.6l15.8-9.1c-5.3-10-9.7-20.3-13.6-31.1zM213.1 434c-40.4-8-75.8-29.1-101.9-58.7l-18 15.8c-7.5-8.6-14.4-17.7-20.2-27.4l-16 9.4c38.5 62.3 106.8 104.3 184.9 106.6v-18.3c-11.3-.3-22.7-1.7-33.5-3.6l4.7-23.8zM93.3 120.9l18 15.5c26-29.6 61.4-50.7 101.9-58.4l-4.7-23.8c10.8-2.2 22.1-3.3 33.5-3.6V32.4C163.9 34.6 95.9 76.4 57.4 139l15.8 9.1c6-9.7 12.6-18.9 20.1-27.2zm309.4 270.2l-18-15.8c-26 29.6-61.4 50.7-101.9 58.7l4.7 23.8c-10.8 1.9-22.1 3.3-33.5 3.6v18.3c78.1-2.2 146.4-44.3 184.9-106.6l-16.1-9.4c-5.7 9.7-12.6 18.8-20.1 27.4zM496 256c0 137-111 248-248 248S0 393 0 256 111 8 248 8s248 111 248 248zm-12.2 0c0-130.1-105.7-235.8-235.8-235.8S12.2 125.9 12.2 256 117.9 491.8 248 491.8 483.8 386.1 483.8 256zm-39-106.6l-15.8 9.1c5.3 9.7 10 20.2 13.6 31l-22.7 7.7c6.4 18.3 9.7 38.2 9.7 58.7s-3.6 40.4-10 58.7l23 7.7c-3.9 10.8-8.3 21-13.6 31l15.8 9.1C462 331 471.9 294.5 471.9 256s-9.9-75-27.1-106.6zm-183 177.7c16.3-3.3 30.4-11.6 40.7-23.5l51.2 44.8c11.9-13.6 21.3-29.3 27.1-46.8l-64.2-22.1c2.5-7.5 3.9-15.2 3.9-23.5s-1.4-16.1-3.9-23.5l64.5-22.1c-6.1-17.4-15.5-33.2-27.4-46.8l-51.2 44.8c-10.2-11.9-24.4-20.5-40.7-23.8l13.3-66.4c-8.6-1.9-17.7-2.8-27.1-2.8-9.4 0-18.5.8-27.1 2.8l13.3 66.4c-16.3 3.3-30.4 11.9-40.7 23.8l-51.2-44.8c-11.9 13.6-21.3 29.3-27.4 46.8l64.5 22.1c-2.5 7.5-3.9 15.2-3.9 23.5s1.4 16.1 3.9 23.5l-64.2 22.1c5.8 17.4 15.2 33.2 27.1 46.8l51.2-44.8c10.2 11.9 24.4 20.2 40.7 23.5l-13.3 66.7c8.6 1.7 17.7 2.8 27.1 2.8 9.4 0 18.5-1.1 27.1-2.8l-13.3-66.7z"
const Empire = () => <FaBrand color={EMPIRE} path={EMPIRE_PATH} w={496} />

/** Rebel Alliance — the starbird in its ring (FA "rebel"). */
const REBEL_PATH =
    "M256.9 504c-139.3 0-247.5-116.2-243.3-254.1 2.8-79.2 43.2-152.2 116.5-200.4 .3 0 1.9-.6 1.1 .8-5.8 5.5-111.3 129.8-14.1 226.4 49.8 49.5 90 2.5 90 2.5 38.5-50.1-.6-125.9-.6-125.9-10-24.9-45.7-40.1-45.7-40.1l28.8-31.8c24.4 10.5 43.2 38.7 43.2 38.7 .8-29.6-21.9-61.4-21.9-61.4L255.5 8 299.8 58.1c-20.5 28.8-21.9 62.6-21.9 62.6 13.8-23 43.5-39.3 43.5-39.3l28.5 31.8c-27.4 8.9-45.4 39.9-45.4 39.9-15.8 28.5-27.1 89.4 .6 127.3 32.4 44.6 87.7-2.8 87.7-2.8 102.7-91.9-10.5-225-10.5-225-6.1-5.5 .8-2.8 .8-2.8 50.1 36.5 114.6 84.4 116.2 204.8 2 145.6-99.9 249.4-242.4 249.4z" as const
const Rebel = () => <FaBrand color={REBEL} path={REBEL_PATH} w={512} />

/** Jedi Order — the winged Jedi crest (FA "jedi-order"). */
const JEDI_PATH =
    "M398.5 373.6c95.9-122.1 17.2-233.1 17.2-233.1 45.4 85.8-41.4 170.5-41.4 170.5 105-171.5-60.5-271.5-60.5-271.5 96.9 72.7-10.1 190.7-10.1 190.7 85.8 158.4-68.6 230.1-68.6 230.1s-.4-16.9-2.2-85.7c4.3 4.5 34.5 36.2 34.5 36.2l-24.2-47.4 62.6-9.1-62.6-9.1 20.2-55.5-31.4 45.9c-2.2-87.7-7.8-305.1-7.9-306.9v-2.4 1-1 2.4c0 1-5.6 219-7.9 306.9l-31.4-45.9 20.2 55.5-62.6 9.1 62.6 9.1-24.2 47.4 34.5-36.2c-1.8 68.8-2.2 85.7-2.2 85.7s-154.4-71.7-68.6-230.1c0 0-107-118.1-10.1-190.7 0 0-165.5 99.9-60.5 271.5 0 0-86.8-84.8-41.4-170.5 0 0-78.7 111 17.2 233.1 0 0-26.2-16.1-49.4-77.7 0 0 16.9 183.3 222 185.7h4.1c205-2.4 222-185.7 222-185.7-23.6 61.5-49.9 77.7-49.9 77.7z"
const Jedi = () => <FaBrand color={JEDI} path={JEDI_PATH} w={448} />

/** Sith Order — the Sith crest: a ring of eight blades (FA "sith"). */
const SITH_PATH =
    "M0 32l69.71 118.75-58.86-11.52 69.84 91.03a146.741 146.741 0 0 0 0 51.45l-69.84 91.03 58.86-11.52L0 480l118.75-69.71-11.52 58.86 91.03-69.84c17.02 3.04 34.47 3.04 51.48 0l91.03 69.84-11.52-58.86L448 480l-69.71-118.78 58.86 11.52-69.84-91.03c3.03-17.01 3.04-34.44 0-51.45l69.84-91.03-58.86 11.52L448 32l-118.75 69.71 11.52-58.9-91.06 69.87c-8.5-1.52-17.1-2.29-25.71-2.29s-17.21.78-25.71 2.29l-91.06-69.87 11.52 58.9L0 32zm224 99.78c31.8 0 63.6 12.12 87.85 36.37 48.5 48.5 48.49 127.21 0 175.7s-127.2 48.46-175.7-.03c-48.5-48.5-48.49-127.21 0-175.7 24.24-24.25 56.05-36.34 87.85-36.34zm0 36.66c-22.42 0-44.83 8.52-61.92 25.61-34.18 34.18-34.19 89.68 0 123.87s89.65 34.18 123.84 0c34.18-34.18 34.19-89.68 0-123.87-17.09-17.09-39.5-25.61-61.92-25.61z"
const Sith = () => <FaBrand color={SITH} path={SITH_PATH} w={448} />

/** One mark of a set: its name, the three words it stands for, shown in the touch label, and the drawing. */
export type MarkEntry = { name: string; hint: string; Mark: () => ReactNode }

/* Listed by how central each element is to the story: Air (Aang, the last airbender, is the title and the Avatar), Water (Book One: Katara, Sokka
   and the Southern Water Tribe), Earth (Book Two: Toph and Ba Sing Se), Fire (Book Three: the Fire Nation as the antagonist, and Zuko's arc). */
export const NATURE: MarkEntry[] = [
    { name: 'Air', hint: 'Travel light, ship fast', Mark: Air },
    { name: 'Water', hint: 'Adapt when the plan breaks', Mark: Water },
    { name: 'Earth', hint: 'Stay steady under load', Mark: Earth },
    { name: 'Fire', hint: 'Meet the deadline', Mark: Fire },
]
export const SPACE: MarkEntry[] = [
    { name: 'Galactic Empire', hint: 'Process over improvisation', Mark: Empire },
    { name: 'Rebel Alliance', hint: 'Outnumbered, still shipping', Mark: Rebel },
    { name: 'Jedi Order', hint: 'Calm under pressure', Mark: Jedi },
    { name: 'Sith Order', hint: 'Unchecked ambition', Mark: Sith },
]


const toSet = (key: 'nature' | 'space', list: MarkEntry[]) => ({
    key,
    marks: list.map(({ name, hint, Mark }) => ({
        name,
        hint,
        icon: <svg viewBox="0 0 24 24" aria-hidden="true"><Mark /></svg>,
    })),
})

export default function CardElementMarks() {
    return <ElementMarksPicker sets={[toSet('nature', NATURE), toSet('space', SPACE)]} />
}