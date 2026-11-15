/** "Coconut break" — a Nature vignette: palm, skater kid, chill man and laptop table. */
import { F, L, Limb, P, type PlaceProps } from './core'
import { KiteFlyers } from './scenery'

/* ═══════════════════════════ "Coconut break" — a Nature vignette ═══════════════════════════ */

/** Coconut palm, trunk base at the origin leaning right, ~110 tall, in the site's tree colours (trunk + foliage tokens). */
export function CoconutPalm(p: PlaceProps) {
    const leaf = 'M0 0 C14 -17 38 -17 56 7 C40 -2 20 -3 0 3 Z'
    const frond = (a: number, flipX: boolean, k: number) => (
        <g key={k} transform={`${flipX ? 'scale(-1 1) ' : ''}rotate(${a})`}>
            <path d={leaf} fill="var(--sc-tree)" stroke="currentColor" strokeWidth={1.1} strokeLinejoin="round" />
            <path d="M0 0 C14 -10 34 -9 52 6" {...L} strokeWidth={0.8} opacity={0.5} />
            <path d="M10 -9 L22 2 M24 -10 L35 2" {...L} strokeWidth={0.7} opacity={0.35} />
        </g>
    )
    return (
        <P {...p}>
            <path d="M0 0 C-4 -30 4 -62 14 -92" {...L} strokeWidth={8.6} />
            <path d="M0 0 C-4 -30 4 -62 14 -92" stroke="var(--sc-trunk)" strokeWidth={5.6} strokeLinecap="round" fill="none" />
            <path d="M-2 -14 q4 -2 7 0 M-2 -30 q4 -2 7 0 M3 -46 q4 -2 7 0 M8 -62 q4 -2 7 0 M12 -78 q3 -2 6 0" {...L} strokeWidth={0.9} opacity={0.5} />
            <g transform="translate(14 -92)">
                {[-72, -40, -8, 22].map((a, i) => frond(a, false, i))}
                {[-72, -40, -8, 22].map((a, i) => frond(a, true, i + 10))}
                <path d="M-3 0 L3 0" {...L} />
                {[[-5, 4], [4, 5], [0, 9]].map(([cx, cy], i) => (
                    <circle key={i} cx={cx} cy={cy} r={4.2} fill="var(--sc-trunk)" stroke="currentColor" strokeWidth={1} />
                ))}
            </g>
        </P>
    )
}

/** A kid on a skateboard (origin = board centre on the ground), facing right. */
function SkaterKid() {
    return (
        <>
            <path d="M-13 -5 H13" {...L} strokeWidth={3.6} />
            <path d="M-13 -5 H13" stroke="var(--sc-accent)" strokeWidth={1.9} strokeLinecap="round" fill="none" />
            <circle cx={-7} cy={-1.8} r={2.3} fill="var(--sc-door)" stroke="currentColor" strokeWidth={0.9} />
            <circle cx={7} cy={-1.8} r={2.3} fill="var(--sc-door)" stroke="currentColor" strokeWidth={0.9} />
            <path d="M-3 -6 L-5 -15 M4 -6 L6 -15" {...L} strokeWidth={2} />
            <path d="M-6 -16 Q0 -35 6 -16 Z" fill="var(--sc-panel)" stroke="currentColor" strokeWidth={1.1} strokeLinejoin="round" />
            <path d="M-3 -28 L-12 -25 M3 -28 L12 -30" {...L} strokeWidth={1.7} />
            <circle cx={0} cy={-38} r={4.4} fill="var(--sc-body)" stroke="currentColor" strokeWidth={1.1} />
            <path d="M-5 -39 Q0 -47 5 -39 Z" fill="var(--sc-sun)" stroke="currentColor" strokeWidth={1} strokeLinejoin="round" />
        </>
    )
}

/** The man: in a low folding chair, sunglasses on, sipping a tender coconut through a straw. Stationary. */
function ChillMan() {
    return (
        <>
            {/* chair */}
            <path d="M-9 -12 L-12 0 M7 -12 L10 0" {...L} strokeWidth={1.5} />
            <path d="M-14 -13 L-18 -38 H-12 L-8 -13 Z" {...F} fill="var(--sc-panel)" strokeWidth={1.1} />
            <path d="M-14 -13 H9 V-10.4 H-14 Z" {...F} fill="var(--sc-panel)" strokeWidth={1.1} />
            {/* far arm resting on the chair, legs stretched out */}
            <Limb d="M-5 -35 L-8 -26 L-2 -22" w={4.6} fill="var(--sc-body)" />
            <Limb d="M2 -17 L13 -17 L21 -9 L23 -1.5" w={5} fill="var(--sc-body)" />
            <path d="M19 -1 H27" {...L} strokeWidth={2.4} />
            <path d="M-7 -22 H8 L13 -15 L-6 -13 Z" {...F} fill="var(--sc-accent)" strokeWidth={1.1} />
            {/* torso: yellow shirt */}
            <path d="M-8 -17 L-10 -38 Q-3 -43 4 -38 L6 -17 Z" {...F} fill="var(--sc-sun)" strokeWidth={1.2} />
            <path d="M-6 -30 q3 -3 6 0 M-1 -24 q3 -3 6 0" stroke="var(--sc-accent)" strokeWidth={1} strokeLinecap="round" fill="none" opacity={0.8} />
            {/* near arm lifts the coconut to his mouth */}
            <Limb d="M3 -36 L10 -30 L9 -38" w={4.6} fill="var(--sc-body)" />
            <circle cx={11} cy={-43} r={5.8} fill="var(--sc-tree)" stroke="currentColor" strokeWidth={1.2} />
            <ellipse cx={11} cy={-47.6} rx={3.4} ry={1.4} fill="var(--sc-glow)" stroke="currentColor" strokeWidth={0.8} />
            <path d="M11 -47 Q5 -52 1.6 -46" stroke="var(--sc-accent)" strokeWidth={1.4} strokeLinecap="round" fill="none" />
            {/* head: cap-less, sunglasses, smile */}
            <circle cx={-3} cy={-50} r={5.4} fill="var(--sc-body)" stroke="currentColor" strokeWidth={1.1} />
            <path d="M-8.6 -52 Q-3 -60 2.6 -52 Q-3 -55 -8.6 -52 Z" fill="var(--sc-trunk)" stroke="currentColor" strokeWidth={0.8} />
            <rect x={-8.2} y={-52.2} width={4.8} height={3} rx={1.2} fill="var(--sc-door)" stroke="currentColor" strokeWidth={0.7} />
            <rect x={-2.6} y={-52.2} width={4.8} height={3} rx={1.2} fill="var(--sc-door)" stroke="currentColor" strokeWidth={0.7} />
            <path d="M-3.4 -50.8 H-2.6 M2.2 -51 L4.6 -51.6" {...L} strokeWidth={0.8} />
            <path d="M-4.6 -46.6 Q-3 -45.4 -1.4 -46.6" {...L} strokeWidth={0.8} />
        </>
    )
}

/** A foldable table with a laptop on it (screen on, glowing). */
function LaptopTable() {
    return (
        <>
            <path d="M-11 -14 L-13 0 M11 -14 L13 0" {...L} strokeWidth={1.5} />
            <path d="M-15 -14 H15" {...L} strokeWidth={2.4} />
            <path d="M-10 -14 L-8 -17.4 H9 L11 -14 Z" {...F} strokeWidth={1.1} />
            <path d="M-8 -17.4 L-9.4 -30 H8.6 L9 -17.4 Z" fill="var(--scene-glow)" stroke="currentColor" strokeWidth={1.1} strokeLinejoin="round" opacity={0.95} />
            <path d="M-5.4 -26 H3 M-5.4 -22.4 H5.4" {...L} strokeWidth={0.8} opacity={0.45} />
        </>
    )
}

/**
 * "Coconut break" — a man in sunglasses sips a tender coconut under a palm, a laptop open on a little table beside him,
 * a pair of kids a good way off flying a kite (animated) and another kid skateboarding back and forth (animated) beyond them,
 * so the two groups have room to breathe. The man, the palm and the kite-flyers stay put; only the kite, its string and
 * the skater move. Origin = the man's chair on the ground.
 */
export function CoconutBreak({ dur = 9, part = 'all', ...p }: PlaceProps & { dur?: number; part?: 'all' | 'chill' | 'play' }) {
    const d = `${dur}s`
    return (
        <P {...p}>
            {part !== 'play' && (
                <>
                    <CoconutPalm x={-60} y={0} s={1} />
                    <ChillMan />
                    <g transform="translate(46 0)"><LaptopTable /></g>
                </>
            )}
            {/* part="play": origin = the kite-flyers' feet, so the pair can stand on a different ground layer from the palm */}
            {part !== 'chill' && (
                <g transform={part === 'play' ? 'translate(-158 0)' : undefined}>
                    <KiteFlyers x={158} y={0} s={0.92} />
                    {/* skater: well clear of the kite-flyers — rolls right, turns, rolls back (turn = the discrete flip at 50 %) */}
                    <g transform="translate(282 0)">
                        <g>
                            <animateTransform attributeName="transform" type="translate" values="0 0;58 0;58 0;0 0;0 0" keyTimes="0;0.45;0.5;0.95;1" dur={d} repeatCount="indefinite" calcMode="spline" keySplines="0.45 0 0.55 1;0 0 1 1;0.45 0 0.55 1;0 0 1 1" />
                            <g>
                                <animateTransform attributeName="transform" type="scale" values="1 1;-1 1;1 1;1 1" keyTimes="0;0.5;0.97;1" dur={d} repeatCount="indefinite" calcMode="discrete" />
                                <SkaterKid />
                            </g>
                        </g>
                    </g>
                </g>
            )}
        </P>
    )
}
