'use client'
import { MomoFly } from './illustrations'
import { useReducedMotion } from '@/app/components/useReducedMotion'

/**
 * Momo circling a mountain: round the back, out of sight behind it, and round the front again.
 *
 * One elliptical loop of centre (cx, cy), radii (rx, ry), seen from slightly below — so the FRONT half is the upper arc (right → left,
 * Momo facing left) and the BACK half the lower arc (left → right, Momo facing right). Because a single element can't be both behind
 * and in front of the mountain, it is drawn as two copies on the same loop, each visible for exactly half of it:
 *
 *   <MomoOrbit layer="back" …/>   draw this BEFORE the mountain, so the mountain hides it as it passes behind
 *   <MomoOrbit layer="front" …/>  draw this AFTER the mountain (and anything it should fly in front of)
 *
 * Give both the same props. The two hand over at the left / right extremes of the loop, so pick rx wide enough that those points
 * are in clear sky (outside the mountain's outline). With reduced motion only the front copy is drawn, hovering at the loop's top-left.
 */
export default function MomoOrbit({ layer, cx, cy, rx, ry, s = 0.8, dur = 10, flap = 0.36 }: {
    layer: 'back' | 'front'; cx: number; cy: number; rx: number; ry: number; s?: number; dur?: number; flap?: number
}) {
    const reduce = useReducedMotion()
    const front = layer === 'front'
    if (reduce) {
        return front ? <MomoFly x={cx - rx * 0.55} y={cy - ry * 0.85} s={s} /> : null
    }
    // relative to the start point (the loop's right-hand extreme): top arc (front) to the far left, then bottom arc (back) home
    const path = `M0 0 A${rx} ${ry} 0 0 0 ${-2 * rx} 0 A${rx} ${ry} 0 0 0 0 0`
    const d = `${dur}s`
    return (
        <g transform={`translate(${cx + rx} ${cy})`}>
            <g>
                <animateMotion path={path} dur={d} repeatCount="indefinite" />
                <animate attributeName="opacity" values={front ? '1;0' : '0;1'} keyTimes="0;0.5" calcMode="discrete" dur={d} repeatCount="indefinite" />
                {/* the front half runs right → left, the back half left → right; Momo faces the way he is going */}
                <g transform={front ? 'scale(-1 1)' : undefined}>
                    <MomoFly x={0} y={0} s={s} flapDur={flap} />
                </g>
            </g>
        </g>
    )
}
