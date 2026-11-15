/** Appa, with his shaggy-coat outline helpers. */
import type { ReactNode } from 'react'
import { AV_BROWN, AV_FUR, AV_FUR_D, AV_HORN, AV_ORANGE, AV_PAW_D, AV_SADDLE, AV_YELLOW } from './avatarPalette'
import { DOT, F, L, P, type PlaceProps, SHADE } from './core'

/* ── Appa's soft, slightly shaggy coat: every outline is a closed ring of points joined by rounded tufts that bulge outwards ── */
type Pt = [number, number]
const bez = (p0: Pt, p1: Pt, p2: Pt, p3: Pt, n: number): Pt[] =>
    Array.from({ length: n }, (_, i) => {
        const t = i / n
        const u = 1 - t
        return [u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0], u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]] as Pt
    })
/** joins `pts` (a closed loop) with quadratic tufts bulging outward by about `bump`/2, a little uneven so it reads as fur, not a scallop; `amp` scales the tufts by place */
function shag(pts: Pt[], bump: number, amp?: (m: Pt) => number): string {
    const n = pts.length
    const c: Pt = [pts.reduce((s, q) => s + q[0], 0) / n, pts.reduce((s, q) => s + q[1], 0) / n]
    let side = 0
    const seg = pts.map((q, i) => {
        const r = pts[(i + 1) % n]
        const dx = r[0] - q[0]
        const dy = r[1] - q[1]
        const len = Math.hypot(dx, dy) || 1
        const m: Pt = [(q[0] + r[0]) / 2, (q[1] + r[1]) / 2]
        const nx = dy / len
        const ny = -dx / len
        side += nx * (m[0] - c[0]) + ny * (m[1] - c[1])
        return { q, r, m, nx, ny }
    })
    const s = side >= 0 ? 1 : -1
    let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`
    seg.forEach((e, i) => {
        const k = bump * (amp ? amp(e.m) : 1) * (0.8 + (0.4 * ((i * 5) % 3)) / 2)
        d += ` Q${(e.m[0] + s * e.nx * k).toFixed(1)} ${(e.m[1] + s * e.ny * k).toFixed(1)} ${e.r[0].toFixed(1)} ${e.r[1].toFixed(1)}`
    })
    return `${d} Z`
}
const APPA_BODY = shag([
    ...bez([-48, -40], [-52, -56], [-34, -68], [-8, -68], 6),
    ...bez([-8, -68], [18, -68], [38, -64], [48, -52], 8),
    ...bez([48, -52], [54, -44], [52, -30], [44, -24], 6),
    ...bez([44, -24], [34, -20], [-8, -16], [-30, -20], 10),
    ...bez([-30, -20], [-40, -23], [-46, -30], [-48, -40], 4),
], 3.4)
const APPA_HEAD = shag([
    ...bez([46, -60], [52, -70], [68, -72], [78, -66], 6),
    ...bez([78, -66], [87, -62], [92, -53], [90, -45], 5),
    ...bez([90, -45], [88, -37], [79, -33], [68, -33.6], 5),
    ...bez([68, -33.6], [56, -34], [46, -40], [44, -50], 5),
    [44.4, -54], [45, -57],
], 2.6, m => (m[0] > 79 ? 0.3 : 1))                 // the muzzle stays broad and smooth
const APPA_TAIL = shag([
    ...bez([0, -6], [-8, -10], [-20, -15], [-32, -14], 6),
    ...bez([-32, -14], [-44, -13], [-49, -4], [-48, 3], 5),
    ...bez([-48, 3], [-47, 11], [-40, 16], [-30, 15], 5),
    ...bez([-30, 15], [-18, 14], [-8, 10], [0, 6], 6),
], 3.4)
const APPA_EAR = shag([...bez([52, -62], [44, -68], [32, -64], [30, -52], 5), ...bez([30, -52], [37, -50], [46, -52], [54, -57], 4)], 2.6)
const appaLeg = (x: number) => shag([[x - 8, -34], [x - 8, -27], [x - 8.6, -20], [x - 9, -13], [x - 9.2, -6], [x + 9.8, -6], [x + 9.4, -13], [x + 9, -20], [x + 8.4, -27], [x + 8, -34]], 3)
/** the head group is drawn scaled 1.14 about (66, −48); this maps a point in Appa's units to where it sits inside that group, and back */
const HEAD_S = 1.14
const toHeadWorld = (q: Pt): Pt => [66 + (q[0] - 66) * HEAD_S, -48 + (q[1] + 48) * HEAD_S]

/** `seamless` marking: a filled ribbon along cubic segments that narrows toward its start (`keys` = [fraction of length, width]) */
type Seg = [Pt, Pt, Pt, Pt]
function taper(segs: Seg[], keys: [number, number][]): string {
    const P_: Pt[] = []
    segs.forEach(([a, b, c, d]) => {
        for (let i = 0; i < 14; i++) {
            const t = i / 14, u = 1 - t
            P_.push([u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0], u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1]])
        }
    })
    P_.push(segs[segs.length - 1][3])
    const cum = [0]
    for (let i = 1; i < P_.length; i++) cum.push(cum[i - 1] + Math.hypot(P_[i][0] - P_[i - 1][0], P_[i][1] - P_[i - 1][1]))
    const wAt = (f: number) => {
        const k = keys.findIndex(q => f <= q[0])
        if (k < 1) return keys[Math.max(k, 0)][1]
        return keys[k - 1][1] + ((keys[k][1] - keys[k - 1][1]) * (f - keys[k - 1][0])) / (keys[k][0] - keys[k - 1][0] || 1)
    }
    const A: string[] = [], B: string[] = []
    P_.forEach((q, i) => {
        const a = P_[Math.max(0, i - 1)], b = P_[Math.min(P_.length - 1, i + 1)]
        const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, w = wAt(cum[i] / cum[cum.length - 1]) / 2
        A.push(`${(q[0] - ((b[1] - a[1]) / l) * w).toFixed(1)} ${(q[1] + ((b[0] - a[0]) / l) * w).toFixed(1)}`)
        B.push(`${(q[0] + ((b[1] - a[1]) / l) * w).toFixed(1)} ${(q[1] - ((b[0] - a[0]) / l) * w).toFixed(1)}`)
    })
    return `M${A.join(' L')} L${B.reverse().join(' L')} Z`
}
/** the ribbon `d` in brown with a soft halo, so it fades into the fur */
const marking = (d: string) => (
    <g>
        <path d={d} fill={AV_BROWN} stroke={AV_BROWN} strokeWidth={5.2} strokeLinejoin="round" opacity={0.12} />
        <path d={d} fill={AV_BROWN} stroke={AV_BROWN} strokeWidth={2.6} strokeLinejoin="round" opacity={0.2} />
        <path d={d} fill={AV_BROWN} stroke={AV_BROWN} strokeWidth={0.9} strokeLinejoin="round" />
    </g>
)

/** Appa the sky bison, facing right, ~183 wide × 87 tall with the saddle at scale 1 (a scene will usually scale him to 0.3–0.9):
 *  a thick, soft, slightly shaggy white coat on body, head, legs and tail; six legs (three near, three far) with brown paws; ONE
 *  continuous brown arrow from the forehead, over the head between his two horns, along the back and out along the tail to its tip;
 *  a floppy ear, a broad soft muzzle with small eyes and a gentle mouth; and a brown saddle on an orange blanket. The broad flat
 *  tail is its own group (.appa-tail, pivoting at its root); `swish` lets it sway, or pass SMIL <animateTransform type="rotate">
 *  children as `tailAnim`. `children` are riders for the saddle: draw them standing on y = −64 between x = −20 and 20; a near-side
 *  wall is then drawn in front of them so they sit INSIDE it. `reins` (a point in Appa's units, e.g. the driver's hand) adds a
 *  harness fixed to both horns (a band round each horn base, a brow strap between them, a cheek strap to a ring) and reins to the point. */
export function Appa({ swish = false, saddle = true, seamless = false, tailAnim, reins, children, ...p }: PlaceProps & { swish?: boolean; saddle?: boolean; seamless?: boolean; tailAnim?: ReactNode; reins?: [number, number]; children?: ReactNode }) {
    const leg = (x: number, far: boolean) => {
        const fill = far ? AV_FUR_D : AV_FUR
        return (
            <g key={`${far ? 'f' : 'n'}${x}`}>
                <path d={appaLeg(x)} {...F} fill={fill} />
                <path d={`M${x - 9} -1.2 C${x - 9} -10.4 ${x + 9.6} -10.4 ${x + 9.6} -1.2 Z`} {...F} fill={far ? AV_PAW_D : AV_BROWN} />
                <path d={`M${x - 3} -6.2 V-1.6 M${x + 3.2} -6.2 V-1.6`} stroke={AV_FUR} strokeWidth={0.9} strokeLinecap="round" fill="none" />
                <path d={`M${x - 5} -22 q3 -2.4 6 0 M${x + 1} -17 q3 -2.4 6 0`} {...L} strokeWidth={0.8} opacity={0.35} />
            </g>
        )
    }
    const ring = toHeadWorld([46.6, -52])
    return (
        <P {...p}>
            {/* three far legs, then three near ones: all tuck under the belly */}
            {[-26, 10, 42].map(x => leg(x, true))}
            {[-38, -2, 32].map(x => leg(x, false))}
            {/* broad flat tail, behind the rump: the arrow carries on to its tip (soft-edged so it blends into the fur) */}
            <g transform="translate(-47 -38)">
                <g className={`appa-tail${swish ? ' scene-swish' : ''}`}>
                    {tailAnim}
                    <path d={APPA_TAIL} {...F} fill={AV_FUR} />
                    <path d="M-1 -1 C-12 -1 -28 -1 -40 1" stroke={AV_BROWN} strokeWidth={9} strokeLinecap="round" fill="none" opacity={0.22} display={seamless ? 'none' : undefined} />
                    <path d="M-1 -1 C-12 -1 -28 -1 -40 1" stroke={AV_BROWN} strokeWidth={5.4} strokeLinecap="round" fill="none" display={seamless ? 'none' : undefined} />
                    <path d="M-14 8 C-24 11 -34 11 -41 8 M-16 -8 C-24 -10 -34 -10 -41 -8" {...L} strokeWidth={0.9} opacity={0.4} />
                </g>
            </g>
            {/* the body, its softer belly and a few layers of fur */}
            <path d={APPA_BODY} {...F} fill={AV_FUR} />
            <path d="M-26 -23 C8 -20 38 -26 51 -43 C53 -34 49 -26 42 -23 C28 -18.4 4 -16.6 -26 -23 Z" fill={AV_FUR_D} stroke="none" opacity={0.7} />
            <path d="M-40 -34 q3 -2.6 6 0 M-30 -28 q3 -2.6 6 0 M-16 -31 q3 -2.6 6 0 M2 -27 q3 -2.6 6 0 M18 -30 q3 -2.6 6 0 M28 -38 q3 -2.6 6 0 M36 -29 q3 -2.6 6 0 M-22 -44 q3 -2.6 6 0 M12 -44 q3 -2.6 6 0 M-6 -38 q3 -2.6 6 0" {...L} strokeWidth={0.9} opacity={0.38} />
            {/* the arrow along his back: a soft halo and a core, following the contour from the neck to the rump and on into the tail */}
            <path d="M47 -62.4 C40 -61 30 -63 18 -63.6 C0 -65 -20 -64.6 -34 -60 C-44 -55 -49 -47 -48 -39" stroke={AV_BROWN} strokeWidth={9.4} strokeLinecap="round" fill="none" opacity={0.22} display={seamless ? 'none' : undefined} />
            <path d="M47 -62.4 C40 -61 30 -63 18 -63.6 C0 -65 -20 -64.6 -34 -60 C-44 -55 -49 -47 -48 -39" stroke={AV_BROWN} strokeWidth={5.6} strokeLinecap="round" fill="none" display={seamless ? 'none' : undefined} />
            {/* `seamless`: tail tip -> rump -> back -> neck as one tapered ribbon (drawn here, so the saddle covers it); the head part is drawn in the head group */}
            {seamless && marking(taper([[[-90, -37], [-84, -37.8], [-74, -38.8], [-64, -38.8]], [[-64, -38.8], [-56, -38.8], [-51, -40], [-50, -44]], [[-50, -44], [-49, -51], [-42, -57.6], [-34, -60.5]], [[-34, -60.5], [-26, -63.6], [-14, -64.6], [0, -64.6]], [[0, -64.6], [18, -64.6], [32, -64.4], [44.3, -64.4]]], [[0, 2.2], [0.15, 4.4], [0.35, 5], [0.6, 5.4], [1, 5.6]]))}
            {/* orange blanket, girth strap and the saddle */}
            {saddle && (
                <>
                    <path d="M-32 -60 C-16 -67 8 -67 24 -62 L27 -46 C10 -50 -14 -50 -33 -45 Z" {...F} fill={AV_ORANGE} />
                    <path d="M-32.6 -53 C-14 -58 10 -58 26 -53" {...L} strokeWidth={0.9} opacity={0.5} />
                    <path d="M-2 -61 C-1 -52 -3 -44 -4 -36" stroke={AV_SADDLE} strokeWidth={3} strokeLinecap="round" fill="none" />
                    <path d="M-28 -66 L-28 -85 Q-28 -87 -26 -87 H-22 L-22 -72 H18 L18 -87 H22 Q24 -87 24 -85 L24 -66 Z" {...F} fill={AV_SADDLE} />
                </>
            )}
            {/* riders sit in the saddle: drawn in Appa's own units, cut off below the seat line so they sit rather than stand */}
            {children && (
                <>
                    <defs><clipPath id="appa-seat-clip"><rect x={-90} y={-220} width={200} height={154} /></clipPath></defs>
                    <g clipPath="url(#appa-seat-clip)">{children}</g>
                    {/* the saddle's near wall, in front of the riders: they sit inside it */}
                    {saddle && (
                        <>
                            <path d="M-26 -66 L-26 -73 Q-26 -75 -24 -75 H20 Q22 -75 22 -73 L22 -66 Z" {...F} fill={AV_SADDLE} />
                            <path d="M-24 -70.4 H20" {...L} strokeWidth={0.8} opacity={0.45} />
                            <circle cx={-21} cy={-68.2} r={0.8} fill={AV_YELLOW} stroke="none" />
                            <circle cx={-5} cy={-68.2} r={0.8} fill={AV_YELLOW} stroke="none" />
                            <circle cx={11} cy={-68.2} r={0.8} fill={AV_YELLOW} stroke="none" />
                        </>
                    )}
                </>
            )}
            {/* the head, scaled up a touch: two horns (rear and front), the soft head, ear, then the arrow's shaft over the ridge between the
                    horns and its head on the forehead, the small eye, nostril and a gentle mouth; the harness is fixed to both horns */}
            <g transform={`translate(66 -48) scale(${HEAD_S}) translate(-66 48)`}>
                <path d="M62.4 -70.6 C60.6 -77.4 64.6 -83.6 70.8 -82.8 C67.4 -79.6 67.4 -75.4 68.2 -70.6 Z" {...F} fill={AV_PAW_D} strokeWidth={1.2} />
                <path d="M50 -69.6 C47.6 -78 53 -85 61 -84 C56.4 -81 56.4 -75.6 57.6 -69.6 Z" {...F} fill={AV_HORN} strokeWidth={1.2} />
                <path d="M57.4 -83.6 C55 -82 54.4 -80 54.6 -78.4 C56.4 -80.4 58.6 -81.4 61 -84 Z" fill={AV_BROWN} stroke="none" />
                <path d={APPA_HEAD} {...F} fill={AV_FUR} />
                <path d="M62 -35.6 C74 -33.6 85 -37.4 90 -45 C90 -39 83 -33.4 70 -33.2 Z" {...SHADE} />
                <path d="M66 -34.6 q2.6 -2.2 5 0 M52 -42 q2.6 -2.2 5 0 M56 -48 q2.6 -2.2 5 0" {...L} strokeWidth={0.8} opacity={0.35} />
                {seamless && marking(taper([[[47, -62.4], [51, -66.4], [55.6, -69.4], [59.6, -69.6]], [[59.6, -69.6], [63, -69.8], [64.6, -67.4], [66.7, -65.3]]], [[0, 4.9], [1, 4.9]]))}
                {seamless && marking('M66 -70.5 L82 -57.6 L62 -62.7 L66.7 -65.3 Z')}
                <path d={APPA_EAR} {...F} fill={AV_FUR} strokeWidth={1.2} />
                <path d="M47 -62.4 C51 -66.4 55.6 -69.4 59.6 -69.6 C63 -69.8 64.6 -67.4 66.7 -65.3" stroke={AV_BROWN} strokeWidth={8.6} strokeLinecap="round" fill="none" opacity={0.22} display={seamless ? 'none' : undefined} />
                <path d="M47 -62.4 C51 -66.4 55.6 -69.4 59.6 -69.6 C63 -69.8 64.6 -67.4 66.7 -65.3" stroke={AV_BROWN} strokeWidth={4.6} strokeLinecap="round" fill="none" display={seamless ? 'none' : undefined} />
                <path d="M66 -70.5 L82 -57.6 L62 -62.7 L66.7 -65.3 Z" fill={AV_BROWN} stroke="currentColor" strokeWidth={0.8} strokeLinejoin="round" display={seamless ? 'none' : undefined} />
                <circle cx={72.4} cy={-51.8} r={1.7} {...DOT} />
                <circle cx={72.9} cy={-52.3} r={0.5} fill="var(--sc-snow)" stroke="none" />
                <ellipse cx={87.8} cy={-47.4} rx={1.4} ry={1.9} {...DOT} />
                <path d="M73.4 -41.6 Q81.4 -37.6 88.6 -42.8" {...L} strokeWidth={0.9} />
                {reins && (
                    <>
                        {/* harness: a band round each horn, a brow strap tying the two together, a cheek strap down to the ring the reins run from */}
                        <path d="M57.4 -74.6 Q59.8 -72.6 62.6 -75" {...L} strokeWidth={3.4} />
                        <path d="M57.4 -74.6 Q59.8 -72.6 62.6 -75" stroke={AV_SADDLE} strokeWidth={1.8} strokeLinecap="round" fill="none" />
                        <path d="M52 -73.8 C47 -66 45.4 -58 46.6 -52" {...L} strokeWidth={3.4} />
                        <path d="M52 -73.8 C47 -66 45.4 -58 46.6 -52" stroke={AV_SADDLE} strokeWidth={1.8} strokeLinecap="round" fill="none" />
                        <path d="M50.6 -75.4 Q54.4 -72.8 57.8 -75.2" {...L} strokeWidth={4} />
                        <path d="M50.6 -75.4 Q54.4 -72.8 57.8 -75.2" stroke={AV_SADDLE} strokeWidth={2.4} strokeLinecap="round" fill="none" />
                        <path d="M62 -76.2 Q65 -74 68.4 -76.2" {...L} strokeWidth={4} />
                        <path d="M62 -76.2 Q65 -74 68.4 -76.2" stroke={AV_SADDLE} strokeWidth={2.4} strokeLinecap="round" fill="none" />
                        <circle cx={54.2} cy={-73.9} r={0.9} fill={AV_YELLOW} stroke="none" />
                        <circle cx={65.2} cy={-74.9} r={0.9} fill={AV_YELLOW} stroke="none" />
                        <circle cx={46.6} cy={-52} r={2.6} {...F} fill={AV_YELLOW} strokeWidth={1} />
                    </>
                )}
            </g>
            {reins && (
                <>
                    <path d={`M${ring[0].toFixed(1)} ${ring[1].toFixed(1)} Q36 -62 ${reins[0]} ${reins[1]}`} {...L} strokeWidth={2.4} />
                    <path d={`M${ring[0].toFixed(1)} ${ring[1].toFixed(1)} Q36 -62 ${reins[0]} ${reins[1]}`} stroke={AV_SADDLE} strokeWidth={1.1} strokeLinecap="round" fill="none" />
                </>
            )}
        </P>
    )
}
