/**
 * A seamless figure: every body part (torso, limbs, head, hat, hands…) is listed once, in z-order, and painted in three passes — a pale rim, a dark ink outline,
 * then the fills — so the parts merge into ONE silhouette with a single clean outline (no seams where an arm meets a body or a head meets a neck). Interior
 * lines are added on top as `details`. An item can be an `arm`: a group of pieces that a scene may animate with `wrap` (e.g. a rotation about the shoulder);
 * `wrap` is applied to the arm in each pass, and the passes share one clock, so the arm stays whole while it moves.
 */
import type { ReactNode } from 'react'
import { P, type PlaceProps } from './core'

export type Piece =
    | { t: 'path'; d: string; fill: string }
    | { t: 'limb'; d: string; w: number; fill: string }
    | { t: 'oval'; cx: number; cy: number; rx: number; ry: number; fill: string }
export type Item = Piece | { arm: Piece[]; wrap?: (arm: ReactNode) => ReactNode }

/** the dark ink of the outline, and how far the ink and the pale rim reach beyond a shape's edge */
export const INK = 'var(--sc-door)'
const OL = 0.85
const RIM = 0.8

type Mode = 'rim' | 'ink' | 'fill'
function paint(p: Piece, mode: Mode, key: number): ReactNode {
    const extra = mode === 'rim' ? OL + RIM : mode === 'ink' ? OL : 0
    const c = mode === 'rim' ? 'currentColor' : INK
    if (p.t === 'limb') {
        return mode === 'fill'
            ? <path key={key} d={p.d} fill="none" stroke={p.fill} strokeWidth={p.w} strokeLinecap="round" strokeLinejoin="round" />
            : <path key={key} d={p.d} fill="none" stroke={c} strokeWidth={p.w + 2 * extra} strokeLinecap="round" strokeLinejoin="round" />
    }
    if (p.t === 'oval') {
        return mode === 'fill'
            ? <ellipse key={key} cx={p.cx} cy={p.cy} rx={p.rx} ry={p.ry} fill={p.fill} stroke={p.fill} strokeWidth={0.4} />
            : <ellipse key={key} cx={p.cx} cy={p.cy} rx={p.rx} ry={p.ry} fill={c} stroke={c} strokeWidth={2 * extra} />
    }
    return mode === 'fill'
        ? <path key={key} d={p.d} fill={p.fill} stroke={p.fill} strokeWidth={0.4} strokeLinejoin="round" />
        : <path key={key} d={p.d} fill={c} stroke={c} strokeWidth={2 * extra} strokeLinejoin="round" />
}

export function Figure({ items, details, behind, shadow = 14, ...p }: PlaceProps & { items: Item[]; details?: ReactNode; behind?: ReactNode; shadow?: number }) {
    const pass = (mode: Mode) =>
        items.map((it, i) =>
            'arm' in it
                ? <g key={i}>{(it.wrap ?? ((n: ReactNode) => n))(it.arm.map((q, j) => paint(q, mode, j)))}</g>
                : paint(it, mode, i),
        )
    return (
        <P {...p}>
            {shadow > 0 && <ellipse cx={0} cy={0.6} rx={shadow} ry={shadow * 0.2} fill="var(--sc-shade)" stroke="none" opacity={0.5} />}
            {behind}
            {pass('rim')}
            {pass('ink')}
            {pass('fill')}
            {details}
        </P>
    )
}