'use client'
import { AppaClassicForm } from './avatarCast'
import { useReducedMotion } from '@/app/components/useReducedMotion'

/**
 * Appa in the sky, facing right. Two modes:
 *
 *  • HOVER (default): the body is perfectly STATIONARY — only the tail moves, swishing from its root (the same swish as in the
 *    "Appa, Yip Yip" flight). `tilt` points his nose; negative lifts it.
 *  • FLY (`fly` given): he sets off from (x, y) at scale `s` and flies in a straight line to `fly.to`, shrinking to `fly.s1` as he
 *    recedes — fading in at the start and out at the end, so he can melt into the sun — then the loop starts again. The tail swishes the
 *    whole way. With reduced motion he is a still frame partway along the flight.
 *
 * Optional `children` are riders for the saddle (see Appa: stand them on y = −64 between x = −20 and 20).
 * Placed like every other part: (x, y) is the middle of his feet, `s` scales him (~183 wide × 87 tall at 1).
 */
const CYCLES = 3, STEPS = 72, DUR = '3.6s'
const SWISH = Array.from({ length: STEPS + 1 }, (_, i) => `${(7 * Math.sin((i / STEPS) * Math.PI * 2 * CYCLES)).toFixed(1)} 0 0`).join(';')
const tail = <animateTransform attributeName="transform" type="rotate" values={SWISH} dur={DUR} repeatCount="indefinite" />

type Fly = { to: [number, number]; s1: number; dur?: number }

export default function AppaHover({ x = 0, y = 0, s = 1, tilt = 0, fly, children }: { x?: number; y?: number; s?: number; tilt?: number; fly?: Fly; children?: React.ReactNode }) {
    const reduce = useReducedMotion()
    if (!fly) {
        return (
            <g transform={`translate(${x} ${y}) rotate(${tilt})`}>
                <AppaClassicForm x={0} y={0} s={s} tailAnim={reduce ? undefined : tail}>{children}</AppaClassicForm>
            </g>
        )
    }
    const dx = fly.to[0] - x, dy = fly.to[1] - y
    if (reduce) {
        const t = 0.55
        return (
            <g transform={`translate(${x + dx * t} ${y + dy * t}) rotate(${tilt})`}>
                <AppaClassicForm x={0} y={0} s={s + (fly.s1 - s) * t}>{children}</AppaClassicForm>
            </g>
        )
    }
    const dur = `${fly.dur ?? 12}s`
    return (
        // the position lives on an outer group and the pitch / size on inner ones, so the motion isn't rotated along with him
        <g transform={`translate(${x} ${y})`}>
            <animateMotion path={`M0 0 L${dx} ${dy}`} dur={dur} repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.82;1" dur={dur} repeatCount="indefinite" />
            <g transform={`rotate(${tilt})`}>
                <g>
                    <animateTransform attributeName="transform" type="scale" values={`${s};${fly.s1}`} dur={dur} repeatCount="indefinite" />
                    <AppaClassicForm x={0} y={0} s={1} tailAnim={tail}>{children}</AppaClassicForm>
                </g>
            </g>
        </g>
    )
}
