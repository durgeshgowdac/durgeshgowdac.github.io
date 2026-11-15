/** Extra SPACE scenery for the hero: a space station and shooting stars. */
import { DOT, F, GLOW, L, P, WARM, type PlaceProps } from './core'

/** <SpaceStation/> — a small orbital station, ~76 wide, centred on the origin: a long truss, four solar arrays, a hub with a window, a docked capsule. */
export function SpaceStation(p: PlaceProps) {
    const panel = (x: number, y: number) => (
        <g key={`${x}${y}`}>
            <rect x={x} y={y} width={10} height={14} {...F} fill="var(--sc-panel)" strokeWidth={1} />
            <path d={`M${x} ${y + 4.7} H${x + 10} M${x} ${y + 9.3} H${x + 10} M${x + 5} ${y} V${y + 14}`} {...L} strokeWidth={0.6} opacity={0.5} />
        </g>
    )
    return (
        <P {...p}>
            <path d="M-36 0 H36" {...L} strokeWidth={2.2} />
            {[-34, 24].flatMap(x => [panel(x, -18), panel(x, 4)])}
            <path d="M-29 -4 V4 M29 -4 V4" {...L} strokeWidth={1} />
            <rect x={-3.2} y={-12} width={6.4} height={24} rx={2.6} {...F} />
            <rect x={-12} y={-5.5} width={24} height={11} rx={4} {...F} fill="var(--scene-glow)" />
            <circle cx={-4} cy={0} r={2.4} {...F} fill="var(--sc-glass)" strokeWidth={0.9} />
            <circle cx={4} cy={0} r={2.4} {...F} fill="var(--sc-glass)" strokeWidth={0.9} />
            <path d="M-12 3 H12" stroke="var(--scene-warm)" strokeWidth={1.2} opacity={0.8} fill="none" />
            <path d="M-2.4 -12 L-1.6 -17 H1.6 L2.4 -12 Z" {...F} fill="var(--sc-panel)" strokeWidth={0.9} />
            <g className="scene-twinkle"><circle cx={0} cy={-18.5} r={1.5} {...WARM} /></g>
            <path d="M0 12 V17 M-3 17 H3" {...L} strokeWidth={1} />
        </P>
    )
}

/** <Meteor/> — a shooting star: a bright head with a dotted tail that streaks `dx, dy` across the sky once per `dur` (staggered by `at`), then rests unseen. */
export function Meteor({ dx = -110, dy = 48, dur = 12, at = 0, len = 34, ...p }: PlaceProps & { dx?: number; dy?: number; dur?: number; at?: number; len?: number }) {
    const a = Math.atan2(dy, dx), k = (n: number) => (at + n) / dur
    const T = [0, k(0), k(0.12), k(1.7), k(2), 1].map(v => Math.max(0, Math.min(1, v)).toFixed(4)).join(';')
    // rounded: Math.cos / Math.sin can differ in their last digits between the server and the browser, which React reports as a hydration mismatch
    const r2 = (n: number) => Math.round(n * 100) / 100
    const tx = r2(Math.cos(a) * len), ty = r2(Math.sin(a) * len)
    return (
        <P {...p}>
            <g opacity={0}>
                <animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes={T} dur={`${dur}s`} repeatCount="indefinite" />
                <g>
                    <animateTransform attributeName="transform" type="translate" values={`0 0;0 0;${r2(dx * 0.08)} ${r2(dy * 0.08)};${dx} ${dy};${dx} ${dy};${dx} ${dy}`} keyTimes={T} dur={`${dur}s`} repeatCount="indefinite" />
                    <path d={`M0 0 L${-tx} ${-ty}`} {...L} strokeWidth={1.2} strokeDasharray="1 4" opacity={0.7} />
                    <path d={`M0 0 L${r2(-tx * 0.5)} ${r2(-ty * 0.5)}`} {...L} strokeWidth={1.8} opacity={0.5} />
                    <circle r={4} {...GLOW} opacity={0.5} />
                    <circle r={1.8} {...DOT} />
                </g>
            </g>
        </P>
    )
}