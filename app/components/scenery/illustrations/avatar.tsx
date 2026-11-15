/** Avatar: The Last Airbender cast — Aang, Sokka, Katara, Momo, Toph and the glider. */
import type { ReactNode } from 'react'
import { AV_ARROW, AV_BLUE, AV_BLUE_D, AV_BOOT, AV_HAIR, AV_MOMO, AV_MOMO_BELLY, AV_MOMO_WING, AV_ORANGE, AV_SKIN, AV_TRIBE_SKIN, AV_TRIM, AV_WOOD, AV_YELLOW, TOPH_BELT, TOPH_CREAM, TOPH_EYE, TOPH_G, TOPH_GD } from './avatarPalette'
import { DOT, F, L, Limb, P, type PlaceProps, SHADE } from './core'

/* ═══════════════════════════════════════════════════════════════════════
      AVATAR: THE LAST AIRBENDER — Aang · Appa · Momo · Sokka · Katara
      (+ Toph, below.) Redrawn in the house style from written descriptions and design notes (no artwork traced).
      Characters are placed in the NATURE world only (inside .scene-nature); every colour is still a theme token, optionally mixed.
          Air Nomad yellow / orange   --scene-glow / --scene-warm      blue tattoos & Water Tribe blue   --sc-panel
          white fur, trim             --sc-rocket / --sc-snow          hair, boots, dark leather         --sc-door
      Aang, Katara and Sokka face front (symmetrical staging); Appa and Momo's wings are drawn as their own groups:
          .appa-tail  (+ .scene-swish when `swish`)        pivots at the root of the tail
          .momo-wing  (+ .scene-flap  when `flap`)         pivots at the shoulder; the right wing is the mirrored left one
═══════════════════════════════════════════════════════════════════════ */

/** Aang's glider, base at the origin, after the card art. CLOSED it is a plain wooden staff 62 tall with two gold joint rings. OPEN
 *  (seen as in the card: the long SPAR runs across the top, y = −62, 120 wide) it is: the spar with a hub at its middle and a short
 *  stub of the tail boom poking up past it; two big triangular FANS hanging from the spar, left and right, each a thick wooden rod
 *  along the spar, a straight trailing edge and eight ribs fanning from the hub between creased orange-to-yellow panels; and the
 *  TAIL BOOM running down from the hub to a short tail spar at y = −12 with two small fans hanging from it (`tail={false}` drops
 *  them). Hang a character from it by the hands on the spar (see Aang `fly`, AangGlide). */
export function Glider({ open = false, tail = true, ...p }: PlaceProps & { open?: boolean; tail?: boolean }) {
    if (!open) {
        return (
            <P {...p}>
                <Limb d="M0 -0.8 V-62" w={6} fill={AV_WOOD} />
                <rect x={-3.6} y={-22} width={7.2} height={3.4} rx={1} {...F} fill={AV_YELLOW} strokeWidth={1} />
                <rect x={-3.6} y={-44} width={7.2} height={3.4} rx={1} {...F} fill={AV_YELLOW} strokeWidth={1} />
                <circle cx={0} cy={-63.2} r={2.3} {...F} fill={AV_YELLOW} strokeWidth={1.1} />
            </P>
        )
    }
    const rad = Math.PI / 180
    const f = (v: number) => v.toFixed(2)
    /** a triangular fan hinged at (hx, hy): one edge of length `len` along the spar (to side sx), the other of length Bd at `ang`° below it */
    const fan = (hx: number, hy: number, sx: 1 | -1, len: number, Bd: number, ang: number, n: number, key: string) => {
        const A: [number, number] = [hx + sx * len, hy]
        const B: [number, number] = [hx + sx * Bd * Math.cos(ang * rad), hy + Bd * Math.sin(ang * rad)]
        const tips = Array.from({ length: n + 1 }, (_, i) => [A[0] + ((B[0] - A[0]) * i) / n, A[1] + ((B[1] - A[1]) * i) / n] as [number, number])
        const rib = (t: [number, number]) => `M${f(hx)} ${f(hy)} L${f(t[0])} ${f(t[1])}`
        return (
            <g key={key}>
                {tips.slice(0, n).map((t, i) => (
                    <path
                        key={i}
                        d={`M${f(hx)} ${f(hy)} L${f(t[0])} ${f(t[1])} L${f(tips[i + 1][0])} ${f(tips[i + 1][1])} Z`}
                        {...F}
                        fill={`color-mix(in srgb, ${AV_YELLOW} ${Math.round(6 + 66 * (i / (n - 1)))}%, ${AV_ORANGE})`}
                        strokeWidth={0.7}
                    />
                ))}
                {tips.slice(1, n).map((t, i) => <path key={`r${i}`} d={rib(t)} stroke={AV_WOOD} strokeWidth={0.8} fill="none" />)}
                <path d={`M${f(hx)} ${f(hy)} L${f(A[0])} ${f(A[1])} L${f(B[0])} ${f(B[1])} Z`} {...L} strokeWidth={1.2} />
                <path d={rib(B)} {...L} strokeWidth={2.4} />
                <path d={rib(B)} stroke={AV_WOOD} strokeWidth={1.1} strokeLinecap="round" fill="none" />
            </g>
        )
    }
    const HY = -62
    return (
        <P {...p}>
            {tail && (
                <>
                    {fan(0, -12, -1, 19, 14, 62, 4, 'tl')}
                    {fan(0, -12, 1, 19, 14, 62, 4, 'tr')}
                    <Limb d="M-21 -12 H21" w={3.8} fill={AV_WOOD} />
                </>
            )}
            {fan(0, HY, -1, 58, 42, 66, 8, 'bl')}
            {fan(0, HY, 1, 58, 42, 66, 8, 'br')}
            <Limb d="M0 -70 V-12" w={3.8} fill={AV_WOOD} />
            <Limb d="M-59 -62 H59" w={4.6} fill={AV_WOOD} />
            <circle cx={-59.4} cy={HY} r={2.5} {...F} fill={AV_YELLOW} strokeWidth={1.1} />
            <circle cx={59.4} cy={HY} r={2.5} {...F} fill={AV_YELLOW} strokeWidth={1.1} />
            <rect x={-3.8} y={HY - 3.8} width={7.6} height={7.6} rx={1.4} {...F} fill={AV_YELLOW} strokeWidth={1.1} />
        </P>
    )
}

/** Aang, facing front, ~57 tall (the staff ~63): bald, blue arrows (pointing down) on the forehead, hands and feet; yellow tunic,
 *  orange shawl, sash and baggy trousers. `staff` holds the closed glider in his right hand (our right); `fly` hangs him
 *  from an open <Glider> (arms reaching up and out so the fists grip the spar at x = ±16, y = −62; legs together), drawn in front of it. */
export function Aang({ staff = true, fly = false, raise = false, staffWrap, ...p }: PlaceProps & {
    staff?: boolean; fly?: boolean; raise?: boolean
    /** wraps the held staff (drawn behind him) so a scene can animate it — knock it out of his hand, say. Standing pose: at x = 12.8, y = 0 … −63.
     *  `raise` pose (staff held higher, in the lifted hand): at x = 15.6, y = −28 … −91. */
    staffWrap?: (staff: ReactNode) => ReactNode
}) {
    const lx = fly ? 3.2 : 4.4          // legs and feet: together when he hangs from the glider
    const fx = fly ? 3.1 : 4.8
    const hand = (cx: number, cy: number) => (
        <>
            <circle cx={cx} cy={cy} r={2.2} {...F} fill={AV_SKIN} strokeWidth={1.1} />
            <path d={`M${cx} ${cy + 1.5} l-1 -1.9 h2 Z`} fill={AV_ARROW} stroke="none" />
        </>
    )
    return (
        <P {...p}>
            {staff && !fly && !raise && (staffWrap ? staffWrap(<Glider x={12.8} />) : <Glider x={12.8} />)}
            {staff && !fly && raise && (staffWrap ? staffWrap(<g transform="translate(15.6 -28)"><Glider /></g>) : <g transform="translate(15.6 -28)"><Glider /></g>)}
            {/* baggy orange trousers, bare feet with their arrows */}
            <Limb d={`M-3.4 -18 L${-lx} -4.6`} w={6.8} fill={AV_ORANGE} />
            <Limb d={`M3.4 -18 L${lx} -4.6`} w={6.8} fill={AV_ORANGE} />
            <ellipse cx={-fx} cy={-1.8} rx={3.8} ry={1.9} {...F} fill={AV_SKIN} strokeWidth={1.1} />
            <ellipse cx={fx} cy={-1.8} rx={3.8} ry={1.9} {...F} fill={AV_SKIN} strokeWidth={1.1} />
            <path d={`M${-fx} -0.6 l-1.1 -2.2 h2.2 Z M${fx} -0.6 l-1.1 -2.2 h2.2 Z`} fill={AV_ARROW} stroke="none" />
            {/* yellow tunic, orange sash and the shawl across the chest */}
            <path d="M-7 -37 Q0 -40.4 7 -37 L8.2 -18 Q0 -14.6 -8.2 -18 Z" {...F} fill={AV_YELLOW} />
            <path d="M3 -38.6 Q5.4 -38.2 7 -37 L8.2 -18 Q5 -16.6 3.4 -16.6 Z" {...SHADE} />
            <path d="M-8.4 -21.4 Q0 -18 8.4 -21.4 L8 -17.6 Q0 -14.2 -8 -17.6 Z" {...F} fill={AV_ORANGE} strokeWidth={1.1} />
            <Limb d="M-5.6 -36.2 L5.6 -22.4" w={4.6} fill={AV_ORANGE} />
            {/* arms */}
            {fly ? (
                <>
                    <Limb d="M-6.6 -35 L-16 -59" w={5} fill={AV_YELLOW} />
                    {hand(-16.4, -61.4)}
                    <Limb d="M6.6 -35 L16 -59" w={5} fill={AV_YELLOW} />
                    {hand(16.4, -61.4)}
                </>
            ) : (
                <>
                    <Limb d="M-6.6 -35 L-10.4 -22.6" w={5} fill={AV_YELLOW} />
                    {hand(-10.8, -21)}
                    <Limb d={raise ? 'M6.6 -35 L15 -56' : 'M6.6 -35 L11.4 -24'} w={5} fill={AV_YELLOW} />
                    {raise ? hand(15.6, -58.2) : hand(11.8, -22.4)}
                </>
            )}
            {/* head: ears, face, and the arrow that runs from the brow up over the crown */}
            <ellipse cx={-9} cy={-47} rx={1.8} ry={2.6} {...F} fill={AV_SKIN} strokeWidth={1.1} />
            <ellipse cx={9} cy={-47} rx={1.8} ry={2.6} {...F} fill={AV_SKIN} strokeWidth={1.1} />
            <circle cx={0} cy={-47.5} r={9} {...F} fill={AV_SKIN} />
            <path d="M3.6 -56 A9 9 0 0 1 8.9 -45 Q5.6 -44.6 4.4 -48 Q4 -52 3.6 -56 Z" {...SHADE} />
            <path d="M-1 -56.2 V-53.6 L-2.9 -53.6 L0 -50 L2.9 -53.6 L1 -53.6 V-56.2 Z" fill={AV_ARROW} stroke="currentColor" strokeWidth={0.5} strokeLinejoin="round" />
            <circle cx={-3.4} cy={-46.2} r={1.15} {...DOT} />
            <circle cx={3.4} cy={-46.2} r={1.15} {...DOT} />
            <path d="M-2.2 -42.4 Q0 -40.8 2.2 -42.4" {...L} strokeWidth={0.9} />
        </P>
    )
}

/** A boomerang, centred on the origin (so a scene can throw it): a bent wooden blade, a dark grip at the elbow and two gold inlays. */
/** holding a boomerang by its lower end tip: the tip (local point) sits in the hand, and the boomerang stands up from it, tilted a little away from his head */
export const GRIP_TIP: [number, number] = [13, -7.5]   // the lower arm's end, just inside the cap, so the hand covers it
export const GRIP_AT: [number, number] = [16.2, -42.8] // …sits here, in the raised arm's own (pre-mirror) frame
export const GRIP_R = 105                              // …turned this much (the arm's own frame)

export function Boomerang({ grip, ...p }: PlaceProps & {
    /** a point of the boomerang (in its own units) that becomes the origin: place it, rotate it and scale it about THAT point — e.g. an end tip, to hold it by that end */
    grip?: [number, number]
}) {
    return (
        <P {...p}>
            <g transform={grip ? `translate(${-grip[0]} ${-grip[1]})` : undefined}>
                <Limb d="M-15 -9 L0 3.8 L15 -9" w={6.4} fill={AV_WOOD} />
                <Limb d="M-2.8 1.2 L0 3.8 L2.8 1.2" w={6.4} fill={AV_HAIR} />
                <path d="M-11.6 -6 L-6 -2 M11.6 -6 L6 -2" stroke={AV_YELLOW} strokeWidth={1.2} strokeLinecap="round" fill="none" />
            </g>
        </P>
    )
}

/** Sokka, facing front, ~72 tall (+ topknot): Water Tribe blue tunic with white trim, fur boots, shaved sides, a strip of hair on top pulled back
 *  into a wolf tail that hangs behind his head, a deadpan face. `boomerang` holds one in the hand named by `hand` (default his RIGHT, which is our left as he faces us; use 'left' for the other). */
export function Sokka({ boomerang = true, hand = 'right', armFx, wristFx, boomerangFx, boomerangS = 1.05, gripTip = false, boomerangRot, ...p }: PlaceProps & {
    boomerang?: boolean; hand?: 'right' | 'left'
    /** hold the boomerang by its LOWER END TIP (standing up from the hand) instead of by its middle */
    gripTip?: boolean
    /** with `gripTip`: SMIL elements (a rotate about GRIP_AT) turning the held boomerang about its gripped tip, inside the hand — so its angle can be adjusted as the arm moves */
    boomerangRot?: ReactNode
    /** size of the held boomerang (default 1.05) */
    boomerangS?: number
    /** SMIL elements (e.g. an <animateTransform type="rotate">) put INSIDE the raised arm's group — the whole arm, its hand and the held boomerang move together.
     *  The shoulder is at (8.6, −52.6) in the arm's own (pre-mirror) frame. */
    armFx?: ReactNode
    /** SMIL elements (e.g. an <animateTransform type="rotate"> about the wrist, at (15.4, −43.4) in the arm's frame) put inside the group that holds the HAND and the held
     *  boomerang, which sits inside the arm's group: the wrist can cock and snap while the arm swings. */
    wristFx?: ReactNode
    /** SMIL elements put inside the held boomerang's group (e.g. an opacity <animate> to hide it while it is in the air) */
    boomerangFx?: ReactNode
}) {
    const boot = (sx: 1 | -1) => (
        <>
            <ellipse cx={4.9 * sx} cy={-2.4} rx={4.6} ry={2.6} {...F} fill={AV_BOOT} strokeWidth={1.1} />
            <path d={`M${4.9 * sx - 4.2} -5.4 Q${4.9 * sx} -3.8 ${4.9 * sx + 4.2} -5.4 L${4.9 * sx + 3.8} -3.4 Q${4.9 * sx} -1.8 ${4.9 * sx - 3.8} -3.4 Z`} {...F} fill={AV_TRIM} strokeWidth={0.9} />
        </>
    )
    return (
        <P {...p}>
            <Limb d="M-4.4 -26 V-6.4" w={6.4} fill={AV_BLUE_D} />
            <Limb d="M4.4 -26 V-6.4" w={6.4} fill={AV_BLUE_D} />
            {boot(-1)}{boot(1)}
            {/* tunic, white hem, belt */}
            <path d="M-9 -54 Q0 -57.6 9 -54 L10.6 -41 L13 -25 Q0 -21.6 -13 -25 L-10.6 -41 Z" {...F} fill={AV_BLUE} />
            <path d="M3.4 -56 Q6.4 -55.6 9 -54 L10.6 -41 L13 -25 Q8 -23.2 4 -22.6 Z" {...SHADE} />
            <path d="M-13.2 -26 Q0 -22.4 13.2 -26 L13 -23.2 Q0 -19.6 -13 -23.2 Z" {...F} fill={AV_TRIM} strokeWidth={1} />
            <path d="M-10.6 -33.4 Q0 -30.4 10.6 -33.4 L10.4 -30.4 Q0 -27.6 -10.4 -30.4 Z" {...F} fill={AV_BLUE_D} strokeWidth={1.1} />
            <rect x={-1.8} y={-33} width={3.6} height={3.4} rx={0.8} {...F} fill="var(--sc-sign)" strokeWidth={0.9} />
            <path d="M-5.6 -54.4 Q0 -50.6 5.6 -54.4 L5.2 -52 Q0 -48.2 -5.2 -52 Z" {...F} fill={AV_TRIM} strokeWidth={0.9} />
            {/* arms: one hangs, the other is raised to hold the boomerang. Drawn with the raised arm on our right, then mirrored when the
                    holding hand is Sokka's RIGHT (our left, since he faces us) */}
            <g transform={hand === 'right' ? 'scale(-1 1)' : undefined}>
                <Limb d="M-8.6 -53 L-12.6 -36" w={5.4} fill={AV_BLUE} />
                <Limb d="M-12 -38.4 L-12.6 -36.4" w={6} fill={AV_TRIM} />
                <circle cx={-13} cy={-33.8} r={2.2} {...F} fill={AV_TRIBE_SKIN} strokeWidth={1.1} />
                <g>
                    {armFx}
                    <Limb d="M8.6 -52.6 L15.4 -43.4" w={5.4} fill={AV_BLUE} />
                    <Limb d="M14.6 -44.6 L15.4 -43.4" w={6} fill={AV_TRIM} />
                    <g>
                        {wristFx}
                        {boomerang && <g>{boomerangFx}{gripTip
                            ? <g>{boomerangRot}<Boomerang x={GRIP_AT[0]} y={GRIP_AT[1]} r={GRIP_R} s={boomerangS} grip={GRIP_TIP} /></g>
                            : <Boomerang x={19.6} y={-43.4} r={82} s={boomerangS} />}</g>}
                        <circle cx={15.9} cy={-42.2} r={2.2} {...F} fill={AV_TRIBE_SKIN} strokeWidth={1.1} />
                    </g>
                </g>
            </g>
            {/* head: wolf-tail ponytail, shaved sides, level brows */}
            <path d="M-1.4 -70.6 C-4 -80 -14 -80 -15.6 -68 C-16.4 -62 -15 -58 -13.6 -55.6 C-13 -62 -12 -68 -8.6 -70.6 C-6 -72 -3.4 -71.6 -1.4 -70.6 Z" {...F} fill={AV_HAIR} strokeWidth={1.1} />
            <circle cx={0} cy={-62.6} r={8.8} {...F} fill={AV_TRIBE_SKIN} />
            <path d="M-8.2 -68 Q-9.6 -62.6 -8.4 -58.6 L-6.6 -60.6 Q-7.4 -64.4 -6.6 -67.6 Z M8.2 -68 Q9.6 -62.6 8.4 -58.6 L6.6 -60.6 Q7.4 -64.4 6.6 -67.6 Z" fill={AV_HAIR} stroke="none" opacity={0.22} />
            <path d="M-4.6 -67.2 C-3.8 -72.6 3.8 -72.6 4.6 -67.2 C2.4 -68.6 -2.4 -68.6 -4.6 -67.2 Z" {...F} fill={AV_HAIR} strokeWidth={1} />
            <path d="M-3.2 -71.6 L-0.4 -70" stroke="var(--sc-accent)" strokeWidth={1.7} strokeLinecap="round" fill="none" />
            <circle cx={-3.2} cy={-62.8} r={1.15} {...DOT} />
            <circle cx={3.2} cy={-62.8} r={1.15} {...DOT} />
            <path d="M-5.2 -65.6 L-1.8 -64.6 M5.2 -65.6 L1.8 -64.6" {...L} strokeWidth={1} />
            <path d="M-1.8 -58.6 H1.8" {...L} strokeWidth={0.9} />
        </P>
    )
}

/** Katara, facing front, ~68 tall: blue Water Tribe tunic with white trim and her necklace, the two hair loops framing
 *  her face and a braid down her back. `steer` raises her front hand (at 14.2, −43.2) to hold Appa's reins. */
export function Katara({ steer = false, armWrap, ...p }: PlaceProps & {
    steer?: boolean
    /** a bending arm: her right-hand sleeve (our right) drawn stretched out sideways (shoulder at 7.8, −48.6; hand at 24.6, −46), wrapped by this so a scene can rotate it about the shoulder */
    armWrap?: (arm: ReactNode) => ReactNode
}) {
    const sleeve = (sx: 1 | -1) => (
        <>
            <Limb d={`M${7.8 * sx} -48.6 L${11.4 * sx} -33`} w={5.2} fill={AV_BLUE} />
            <Limb d={`M${11 * sx} -35.6 L${11.4 * sx} -33.6`} w={5.8} fill={AV_TRIM} />
            <circle cx={11.8 * sx} cy={-31} r={2.2} {...F} fill={AV_TRIBE_SKIN} strokeWidth={1.1} />
        </>
    )
    const boot = (sx: 1 | -1) => (
        <>
            <ellipse cx={4.8 * sx} cy={-2.4} rx={4.4} ry={2.6} {...F} fill={AV_BOOT} strokeWidth={1.1} />
            <path d={`M${4.8 * sx - 4} -5.4 Q${4.8 * sx} -3.8 ${4.8 * sx + 4} -5.4 L${4.8 * sx + 3.6} -3.4 Q${4.8 * sx} -1.8 ${4.8 * sx - 3.6} -3.4 Z`} {...F} fill={AV_TRIM} strokeWidth={0.9} />
        </>
    )
    return (
        <P {...p}>
            {/* the braid hangs behind her back, tied off with a ribbon */}
            {[[8.6, -52], [10.2, -46.4], [11.4, -40.8], [12, -35.2]].map(([cx, cy], i) => (
                <ellipse key={i} cx={cx} cy={cy} rx={2.5} ry={2.9} {...F} fill={AV_HAIR} strokeWidth={1} />
            ))}
            <circle cx={12.1} cy={-31.2} r={1.6} {...F} fill="var(--sc-accent)" strokeWidth={0.9} />
            <Limb d="M-4.4 -19 V-5.8" w={6} fill={AV_BLUE} />
            <Limb d="M4.4 -19 V-5.8" w={6} fill={AV_BLUE} />
            {boot(-1)}{boot(1)}
            {/* tunic, belt, white hem and collar */}
            <path d="M-8 -50 Q0 -53.6 8 -50 L10 -35 L13 -21 Q0 -17.6 -13 -21 L-10 -35 Z" {...F} fill={AV_BLUE} />
            <path d="M3.4 -52 Q6 -51.6 8 -50 L10 -35 L13 -21 Q8 -19.2 4 -18.6 Z" {...SHADE} />
            <path d="M-13.2 -22 Q0 -18.4 13.2 -22 L13 -19.2 Q0 -15.6 -13 -19.2 Z" {...F} fill={AV_TRIM} strokeWidth={1} />
            <path d="M-10 -34 Q0 -31 10 -34 L9.8 -31.2 Q0 -28.2 -9.8 -31.2 Z" {...F} fill={AV_BLUE_D} strokeWidth={1.1} />
            <path d="M-7.6 -50.6 Q0 -47 7.6 -50.6 L8.2 -48 Q0 -44 -8.2 -48 Z" {...F} fill={AV_TRIM} strokeWidth={0.9} />
            <path d="M-3.2 -48.6 Q0 -42.6 3.2 -48.6" {...L} strokeWidth={0.8} />
            <circle cx={0} cy={-43.4} r={1.7} {...F} fill={AV_ARROW} strokeWidth={0.8} />
            {sleeve(-1)}
            {steer ? (
                <>
                    <Limb d="M7.8 -48.6 L13.4 -44" w={5.2} fill={AV_BLUE} />
                    <Limb d="M12.2 -45 L13.4 -44" w={5.8} fill={AV_TRIM} />
                    <circle cx={14.2} cy={-43.2} r={2.2} {...F} fill={AV_TRIBE_SKIN} strokeWidth={1.1} />
                </>
            ) : armWrap ? armWrap(
                <>
                    <Limb d="M7.8 -48.6 L22.6 -46.4" w={5.2} fill={AV_BLUE} />
                    <Limb d="M20.8 -46.7 L22.6 -46.4" w={5.8} fill={AV_TRIM} />
                    <circle cx={24.8} cy={-46} r={2.2} {...F} fill={AV_TRIBE_SKIN} strokeWidth={1.1} />
                </>
            ) : sleeve(1)}
            {/* head: hair cap, two loops, calm face */}
            <circle cx={0} cy={-58.6} r={8.6} {...F} fill={AV_TRIBE_SKIN} />
            <path d="M-9.2 -58 C-10.6 -70.6 10.6 -70.6 9.2 -58 C7.8 -61.8 4.4 -63.6 0 -63.6 C-4.4 -63.6 -7.8 -61.8 -9.2 -58 Z" {...F} fill={AV_HAIR} strokeWidth={1.2} />
            <Limb d="M-9 -60 C-14.2 -58.4 -14.4 -51.4 -10.4 -49.6" w={3.9} fill={AV_HAIR} />
            <Limb d="M9 -60 C14.2 -58.4 14.4 -51.4 10.4 -49.6" w={3.9} fill={AV_HAIR} />
            <circle cx={-3.2} cy={-58.6} r={1.15} {...DOT} />
            <circle cx={3.2} cy={-58.6} r={1.15} {...DOT} />
            <path d="M-1.8 -54.6 Q0 -53.4 1.8 -54.6" {...L} strokeWidth={0.9} />
        </P>
    )
}

/** Momo, facing front, ~32 tall with the ears: a small grey lemur, enormous ears, green eyes, a ringed-fluff tail and
 *  bat-like wings. The wings rise from the shoulders up and outwards (clear of his little arms), each as its own group
 *  (.momo-wing, shoulder at the group's origin, everything above and outside it; the right one is the mirrored left) so
 *  `flap` can beat them about the shoulders. For a scene clock, pass SMIL <animateTransform type="rotate"> children as
 *  `wingAnim` (angles about 0 0: +18° up … −40° down; 0° is the resting pose). */
export function Momo({ flap = false, wingAnim, ...p }: PlaceProps & { flap?: boolean; wingAnim?: ReactNode }) {
    const wing = (
        <g className={`momo-wing${flap ? ' scene-flap' : ''}`}>
            {wingAnim}
            <path d="M0 0 L-10 -10 L-26 -16 Q-22.4 -10.6 -24 -6 Q-19.6 -2.6 -16 -1 Q-9 -3.4 -1.4 -1.2 Z" {...F} fill={AV_MOMO_WING} strokeWidth={1.2} />
            <path d="M-10 -10 L-24 -6 M-10 -10 L-16 -1" {...L} strokeWidth={0.9} opacity={0.55} />
            <path d="M0 0 L-10 -10 L-26 -16" {...L} strokeWidth={1.8} />
        </g>
    )
    return (
        <P {...p}>
            <g transform="scale(0.62)">
                {/* tail curls up behind him */}
                <Limb d="M5 -4 C19 -2 25 -12 19 -23" w={6.4} fill={AV_MOMO} />
                <path d="M17 -18 l4 -2 M20 -23 l3.4 -1.8" {...L} strokeWidth={0.9} opacity={0.5} />
                {/* wings, behind the body, raised above his arms */}
                <g transform="translate(-5.2 -17) scale(0.82)">{wing}</g>
                <g transform="translate(5.2 -17) scale(-0.82 0.82)">{wing}</g>
                {/* feet, body, belly, arms */}
                <ellipse cx={-3.8} cy={-1.3} rx={3.4} ry={1.5} {...F} fill={AV_MOMO} strokeWidth={1.1} />
                <ellipse cx={3.8} cy={-1.3} rx={3.4} ry={1.5} {...F} fill={AV_MOMO} strokeWidth={1.1} />
                <path d="M-6.4 -2.4 C-8.4 -13 -5 -21 0 -21 C5 -21 8.4 -13 6.4 -2.4 Z" {...F} fill={AV_MOMO} />
                <ellipse cx={0} cy={-10.6} rx={3.4} ry={5.8} fill={AV_MOMO_BELLY} stroke="none" />
                <Limb d="M-5.4 -15 L-6.6 -8.8" w={3.4} fill={AV_MOMO} />
                <Limb d="M5.4 -15 L6.6 -8.8" w={3.4} fill={AV_MOMO} />
                {/* the great ears, then the head */}
                <path d="M-4.4 -31.6 C-11.6 -33.6 -19.4 -39 -18 -47.6 C-11.6 -47.4 -5.4 -42 -2.8 -35.6 Z" {...F} fill={AV_MOMO} strokeWidth={1.2} />
                <path d="M4.4 -31.6 C11.6 -33.6 19.4 -39 18 -47.6 C11.6 -47.4 5.4 -42 2.8 -35.6 Z" {...F} fill={AV_MOMO} strokeWidth={1.2} />
                <path d="M-5 -33.8 C-10 -35.6 -14.6 -39.6 -14.2 -44.4 C-10 -43.8 -5.8 -40 -3.8 -36.2 Z M5 -33.8 C10 -35.6 14.6 -39.6 14.2 -44.4 C10 -43.8 5.8 -40 3.8 -36.2 Z" fill="var(--sc-accent)" opacity={0.45} stroke="none" />
                <circle cx={0} cy={-28} r={7.2} {...F} fill={AV_MOMO} />
                <ellipse cx={0} cy={-26.6} rx={4.8} ry={4.2} fill={AV_MOMO_BELLY} stroke="none" />
                <circle cx={-2.9} cy={-28.2} r={2} fill="var(--sc-alien)" stroke="currentColor" strokeWidth={0.9} />
                <circle cx={2.9} cy={-28.2} r={2} fill="var(--sc-alien)" stroke="currentColor" strokeWidth={0.9} />
                <circle cx={-2.9} cy={-28.2} r={0.85} {...DOT} />
                <circle cx={2.9} cy={-28.2} r={0.85} {...DOT} />
                <ellipse cx={0} cy={-25.4} rx={1} ry={0.8} {...DOT} />
                <path d="M-1.4 -23.6 Q0 -22.6 1.4 -23.6" {...L} strokeWidth={0.8} />
            </g>
        </P>
    )
}

/** Toph Beifong, facing front, ~60 tall, short and stocky: a blind earthbender planted in a wide stance with a fist in her palm.
 *  Black hair in a high bun under a green-and-gold headband with two white puffs, long bangs, pale cloudy eyes; a dark green
 *  tunic with wide sleeves, a cream over-tunic, a dark belt with gold studs, loose green trousers, green ankle wraps, bare feet. */
export function Toph({ cheer = false, upperWrap, foreWrap, ...p }: PlaceProps & {
    cheer?: boolean
    /** articulated arms for animation: when given, each arm is two parts (upper arm hinged at the shoulder, forearm + fist hinged at the elbow) in her fists-in-palm guard
     *  pose; `upperWrap` wraps a whole arm and `foreWrap` just its forearm, so the arm can swing from the shoulder and bend at the elbow. `side` is 'l' (our left) or 'r'.
     *  Shoulders are at (±7.6, −41) and elbows at (±13.4, −33.6), in her own frame (inside the 0.9 scale). */
    upperWrap?: (side: 'l' | 'r', arm: ReactNode) => ReactNode
    foreWrap?: (side: 'l' | 'r', forearm: ReactNode) => ReactNode
}) {
    const arm = (sx: 1 | -1) => {
        const side = sx < 0 ? 'l' : 'r'
        const fore = (
            <>
                <Limb d={`M${13.4 * sx} -33.6 L${2.6 * sx} -32.4`} w={6.6} fill={TOPH_GD} />
                <circle cx={1.85 * sx} cy={-32.6} r={2.3} {...F} fill={AV_SKIN} strokeWidth={1.1} />
                <path d={`M${6 * sx} -33.6 H${4 * sx}`} stroke={AV_YELLOW} strokeWidth={1.6} strokeLinecap="round" fill="none" />
            </>
        )
        const whole = (
            <>
                <Limb d={`M${7.6 * sx} -41 L${13.4 * sx} -33.6`} w={6.6} fill={TOPH_GD} />
                {foreWrap ? foreWrap(side, fore) : fore}
            </>
        )
        return upperWrap ? upperWrap(side, whole) : whole
    }
    return (
        <P {...p}>
            <g transform="scale(0.9)">
                {/* loose trousers, bare feet in a wide stance, green ankle wraps */}
                <Limb d="M-5 -21 L-8.8 -6.4" w={7.8} fill={TOPH_G} />
                <Limb d="M5 -21 L8.8 -6.4" w={7.8} fill={TOPH_G} />
                <ellipse cx={-9.4} cy={-1.8} rx={4.4} ry={2} {...F} fill={AV_SKIN} strokeWidth={1.1} />
                <ellipse cx={9.4} cy={-1.8} rx={4.4} ry={2} {...F} fill={AV_SKIN} strokeWidth={1.1} />
                <Limb d="M-12.4 -5.4 H-6.2" w={3.8} fill={TOPH_GD} />
                <Limb d="M12.4 -5.4 H6.2" w={3.8} fill={TOPH_GD} />
                {/* dark tunic, cream over-tunic, studded belt */}
                <path d="M-8.4 -42 Q0 -45.6 8.4 -42 L9.8 -21.6 Q0 -18 -9.8 -21.6 Z" {...F} fill={TOPH_GD} />
                <path d="M-5.6 -43.4 L-2.4 -43 L0 -39.6 L2.4 -43 L5.6 -43.4 L6.4 -21.4 Q0 -18.6 -6.4 -21.4 Z" {...F} fill={TOPH_CREAM} strokeWidth={1.1} />
                <path d="M-10 -26.4 Q0 -23 10 -26.4 L9.8 -22.2 Q0 -18.8 -9.8 -22.2 Z" {...F} fill={TOPH_BELT} strokeWidth={1.1} />
                <circle cx={-5.6} cy={-24} r={0.9} fill={AV_YELLOW} stroke="none" />
                <circle cx={0} cy={-22.6} r={0.9} fill={AV_YELLOW} stroke="none" />
                <circle cx={5.6} cy={-24} r={0.9} fill={AV_YELLOW} stroke="none" />
                {/* wide sleeves bring her hands together: fist in palm (or, for animation, two hinged arms) */}
                {upperWrap || foreWrap ? (
                    <>{arm(-1)}{arm(1)}</>
                ) : (
                    <>
                        <Limb d={cheer ? 'M-7.6 -41 L-17 -55' : 'M-7.6 -41 L-13.4 -33.6 L-2.6 -32.4'} w={6.6} fill={TOPH_GD} />
                        <Limb d={cheer ? 'M7.6 -41 L17 -55' : 'M7.6 -41 L13.4 -33.6 L2.6 -32.4'} w={6.6} fill={TOPH_GD} />
                        <circle cx={cheer ? -17.8 : -1.8} cy={cheer ? -57.2 : -32.4} r={cheer ? 2.6 : 2.3} {...F} fill={AV_SKIN} strokeWidth={1.1} />
                        <circle cx={cheer ? 17.8 : 1.9} cy={cheer ? -57.2 : -32.8} r={cheer ? 2.6 : 2.3} {...F} fill={AV_SKIN} strokeWidth={1.1} />
                        <path d="M-6 -33.6 H-4 M4 -33.6 H6" stroke={AV_YELLOW} strokeWidth={1.6} strokeLinecap="round" fill="none" display={cheer ? 'none' : undefined} />
                    </>
                )}
                {/* head: bun, face, hair, headband, white puffs, bangs, pale sightless eyes */}
                <circle cx={0} cy={-62.8} r={4.4} {...F} fill={AV_HAIR} strokeWidth={1.1} />
                <circle cx={0} cy={-50} r={8.6} {...F} fill={AV_SKIN} />
                <path d="M-9 -49 C-10 -61 10 -61 9 -49 C7.6 -53 4 -55 0 -55 C-4 -55 -7.6 -53 -9 -49 Z" {...F} fill={AV_HAIR} strokeWidth={1.1} />
                <path d="M-8.9 -52.6 Q0 -56.2 8.9 -52.6 L8.7 -50.4 Q0 -54 -8.7 -50.4 Z" {...F} fill={TOPH_G} strokeWidth={1} />
                <circle cx={0} cy={-53.2} r={1} fill={AV_YELLOW} stroke="none" />
                <circle cx={-9.8} cy={-52.2} r={2.4} {...F} fill={AV_TRIM} strokeWidth={0.9} />
                <circle cx={9.8} cy={-52.2} r={2.4} {...F} fill={AV_TRIM} strokeWidth={0.9} />
                <Limb d="M-7.2 -51.4 C-8.8 -47.8 -8.4 -44.8 -7 -42.6" w={3.6} fill={AV_HAIR} />
                <Limb d="M7.2 -51.4 C8.8 -47.8 8.4 -44.8 7 -42.6" w={3.6} fill={AV_HAIR} />
                <path d="M-2.6 -53 L-0.6 -49.2 L1.6 -53 Z" {...F} fill={AV_HAIR} strokeWidth={0.8} />
                <circle cx={-3.2} cy={-48.2} r={1.7} fill={TOPH_EYE} stroke="currentColor" strokeWidth={0.8} />
                <circle cx={3.2} cy={-48.2} r={1.7} fill={TOPH_EYE} stroke="currentColor" strokeWidth={0.8} />
                <path d="M-2.2 -43.6 Q0.6 -42.2 2.8 -44" {...L} strokeWidth={0.9} />
            </g>
        </P>
    )
}