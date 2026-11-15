import type { ReactNode } from 'react'
import {
    Peak, Pine, Cabin, Tent, Campfire, Signpost, FlowerClassic as Flower, Butterfly, Sun, Bird, Firefly,
    Cairn, MistBand, Rock, Backpack, Flag, Planet, Moon, Sparkle, Astronaut, Satellite, Crater,
    Constellation, Comet, Asteroid, Rocket, LaunchTower,
} from '@/app/components/scenery/illustrations'

export type SectionKind = 'brief' | 'contribution' | 'architecture' | 'features' | 'challenges' | 'takeaways' | 'retro'

const INK = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.3, strokeLinecap: 'round', strokeLinejoin: 'round' } as const
const PAPER = { ...INK, fill: 'var(--scene-fill)' } as const

/**
 * The vignette at the corner of every project-page section heading. Each one is a round PATCH:
 *   Nature  → a trail-park patch   (a little landscape in a ring, like a badge sewn on a rucksack)
 *   Space   → a mission patch      (a little scene in a ring, like the crest on a flight suit)
 * Same ring, same ticks, same sky disc in both worlds; only the scene inside changes, and the two
 * worlds crossfade through the shared .scene-nature / .scene-space classes. Parts come from the shared
 * illustration library and only ever read theme tokens.
 *
 *   brief         a trail climbing to a flagged summit   ↔  a radar sweep with blips
 *   contribution  tent, campfire and a packed rucksack   ↔  an astronaut planting a flag, Earth up high
 *   architecture  a cabin among pines, chimney smoking   ↔  a satellite on its orbit above a planet
 *   features      wildflowers, a butterfly, the sun      ↔  a constellation with a passing comet
 *   challenges    a ridge, a cairn, a rock coming loose  ↔  a ship threading an asteroid field
 *   takeaways     sunrise behind two hills               ↔  a ringed planet rising over the horizon
 *   retro         a signpost pointing at a far peak      ↔  a rocket on the pad, tower beside it
 */
export default function ProjectSectionIcon({ kind }: { kind: SectionKind }) {
    const clip = `smk-${kind}`
    return (
        <svg className="section-mark" viewBox="0 0 96 96" aria-hidden="true">
            <defs><clipPath id={clip}><circle cx="48" cy="48" r="41" /></clipPath></defs>

            {/* the patch itself: sky disc, scene (clipped to the disc), then the ring on top */}
            <circle cx="48" cy="48" r="42" fill="var(--sc-skyA)" />
            <g clipPath={`url(#${clip})`}>
                <g className="scene-nature">{nature(kind)}</g>
                <g className="scene-space">{space(kind)}</g>
            </g>
            <circle cx="48" cy="48" r="43" {...INK} strokeWidth={1.6} />
            <circle className="mark-ring" cx="48" cy="48" r="39.4" {...INK} strokeWidth={0.8} strokeDasharray="0.1 3.6" opacity={0.7} />
            <path d="M48 2 V6.5 M48 89.5 V94 M2 48 H6.5 M89.5 48 H94" {...INK} strokeWidth={1.4} />
        </svg>
    )
}

/** a rolling ground line + fill; the outline sits on the crest, the body is clipped by the patch */
function Ground({ d, fill }: { d: string; fill: string }) {
    return <path d={d} {...INK} fill={fill} strokeWidth={1.2} />
}

/** static pin-prick stars for the Space patches; a few of them breathe */
function Stars({ pts }: { pts: [number, number, number?][] }) {
    return (
        <>
            {pts.map(([x, y, tw], i) => (
                <circle key={i} cx={x} cy={y} r={tw ? 1.05 : 0.8} fill="currentColor" opacity={tw ? 1 : 0.7}
                        className={tw ? 'scene-twinkle' : undefined} style={tw ? { animationDelay: `${-tw}s` } : undefined} />
            ))}
        </>
    )
}

function nature(k: SectionKind): ReactNode {
    switch (k) {
        // The Map — a dotted trail winds up to a flag on the summit
        case 'brief':
            return (
                <>
                    <Peak x={24} y={68} w={48} h={34} far haze={false} />
                    <Peak x={63} y={70} w={58} h={46} />
                    <Sun x={22} y={24} s={0.1} />
                    <Ground d="M0 72 Q22 66 48 74 T96 70 V96 H0 Z" fill="var(--hill-3)" />
                    <path className="scene-ribbon" style={{ strokeWidth: 1.9 }} d="M30 90 C30 80 58 84 52 76 C46 70 68 66 63 36" />
                    <Flag x={63} y={29} s={0.3} />
                </>
            )
        // The Pack — camp is made: tent, fire, rucksack
        case 'contribution':
            return (
                <>
                    <Firefly x={22} y={36} delay={0.4} />
                    <Firefly x={74} y={30} delay={1.6} />
                    <Ground d="M0 70 Q30 64 52 70 T96 68 V96 H0 Z" fill="var(--hill-2)" />
                    <Tent x={27} y={74} s={0.52} />
                    <Campfire x={51} y={76} s={0.5} />
                    <Backpack x={70} y={77} s={0.44} />
                </>
            )
        // The Cabin — a built place, lamp lit, chimney smoking, pines on guard
        case 'architecture':
            return (
                <>
                    <Ground d="M0 72 Q30 66 52 72 T96 70 V96 H0 Z" fill="var(--hill-2)" />
                    <Pine x={15} y={78} s={0.46} />
                    <Pine x={83} y={78} s={0.38} />
                    <Cabin x={50} y={79} s={0.62} />
                    <Firefly x={30} y={46} delay={0.9} />
                </>
            )
        // In Bloom — a meadow in flower, a butterfly, the morning sun
        case 'features':
            return (
                <>
                    <Sun x={73} y={24} s={0.1} />
                    <Ground d="M0 74 Q26 68 52 74 T96 72 V96 H0 Z" fill="var(--hill-2)" />
                    <Flower x={20} y={80} s={0.7} />
                    <Flower x={36} y={82} s={1.0} />
                    <Flower x={56} y={82} s={0.82} />
                    <Flower x={74} y={80} s={0.62} />
                    <Butterfly x={42} y={38} s={0.45} delay={1} />
                </>
            )
        // The Ridge — steep, misty, with one rock coming loose
        case 'challenges':
            return (
                <>
                    <Peak x={22} y={72} w={46} h={34} far haze={false} />
                    <Peak x={60} y={74} w={74} h={60} />
                    <MistBand x={0} y={56} w={96} h={9} o={0.5} />
                    <path d="M56 22 L62 31 M63 21 L68 29" {...INK} strokeWidth={1} strokeDasharray="1 3" opacity={0.7} />
                    <g className="scene-hover"><Rock x={70} y={39} s={0.46} r={24} /></g>
                    <Ground d="M0 76 Q24 70 46 77 T96 74 V96 H0 Z" fill="var(--hill-3)" />
                    <Cairn x={24} y={80} s={0.6} />
                </>
            )
        // Sunrise — the day's result: sun up over two hills, birds out
        case 'takeaways':
            return (
                <>
                    <Sun x={48} y={58} s={0.17} />
                    <Ground d="M0 66 Q26 56 52 64 T96 62 V96 H0 Z" fill="var(--hill-2)" />
                    <Ground d="M0 76 Q30 66 60 76 T96 72 V96 H0 Z" fill="var(--hill-3)" />
                    <Bird x={16} y={30} s={0.5} />
                    <Bird x={64} y={22} s={0.42} />
                    <Bird x={72} y={34} s={0.32} />
                </>
            )
        // The Next Climb — a signpost at the fork, the far peak waiting
        case 'retro':
            return (
                <>
                    <Peak x={68} y={68} w={60} h={46} far haze={false} />
                    <Ground d="M0 70 Q28 64 54 70 T96 68 V96 H0 Z" fill="var(--hill-2)" />
                    <path className="scene-ribbon" style={{ strokeWidth: 1.7 }} d="M42 84 C54 80 52 74 62 72 C70 70 70 62 70 56" />
                    <Signpost x={33} y={80} s={0.5} />
                    <Bird x={52} y={26} s={0.45} />
                </>
            )
    }
}

function space(k: SectionKind): ReactNode {
    switch (k) {
        // Mission Brief — a radar sweep, three contacts pinging
        case 'brief':
            return (
                <>
                    <circle cx="48" cy="48" r="32" {...INK} strokeWidth={0.9} opacity={0.55} />
                    <circle cx="48" cy="48" r="21" {...INK} strokeWidth={0.9} opacity={0.5} />
                    <circle cx="48" cy="48" r="10" {...INK} strokeWidth={0.9} opacity={0.5} />
                    <path d="M14 48 H82 M48 14 V82" {...INK} strokeWidth={0.8} opacity={0.35} />
                    <g className="mark-sweep">
                        <path d="M48 48 L80 48 A32 32 0 0 0 73.4 28.6 Z" fill="var(--scene-warm)" opacity={0.28} stroke="none" />
                        <path d="M48 48 H80" {...INK} stroke="var(--scene-warm)" strokeWidth={1.5} />
                    </g>
                    <g className="scene-ping" style={{ animationDelay: '-0.3s' }}><circle cx="62" cy="34" r="2.6" fill="var(--scene-warm)" /></g>
                    <g className="scene-ping" style={{ animationDelay: '-1.1s' }}><circle cx="36" cy="60" r="2.2" fill="var(--scene-warm)" /></g>
                    <g className="scene-ping" style={{ animationDelay: '-1.7s' }}><circle cx="60" cy="62" r="1.8" fill="var(--scene-warm)" /></g>
                    <circle cx="48" cy="48" r="2" fill="currentColor" />
                </>
            )
        // Crew Duties — the flag goes in the regolith, Earth hangs overhead
        case 'contribution':
            return (
                <>
                    <Stars pts={[[16, 24], [30, 14, 0.8], [76, 20], [84, 44, 2], [20, 46], [58, 12]]} />
                    <Planet x={70} y={30} r={8} bands={2} tilt={-16} glow />
                    <Ground d="M0 72 Q28 66 52 72 T96 70 V96 H0 Z" fill="var(--hill-3)" />
                    <Crater x={22} y={80} w={22} />
                    <Crater x={72} y={84} w={26} />
                    <Flag x={62} y={76} s={0.42} />
                    <Astronaut x={36} y={77} s={0.46} wave />
                </>
            )
        // The Satellite — on station, orbit dotted, signal falling to the planet
        case 'architecture':
            return (
                <>
                    <Stars pts={[[14, 22], [24, 36, 1.2], [82, 26], [78, 50, 2.1], [30, 12]]} />
                    <circle cx="48" cy="112" r="46" {...INK} fill="var(--hill-2)" />
                    <path d="M14 82 Q48 62 82 82" {...INK} strokeWidth={0.9} opacity={0.4} />
                    <ellipse cx="48" cy="44" rx="36" ry="12" transform="rotate(-18 48 44)" {...INK} strokeWidth={1} strokeDasharray="1 4.4" opacity={0.7} />
                    <g className="scene-hover"><Satellite x={48} y={44} s={0.78} /></g>
                    <g className="scene-signal">
                        <path d="M40 60 q8 6 16 0" {...INK} strokeWidth={1.2} />
                        <path d="M35 66 q13 9 26 0" {...INK} strokeWidth={1.2} opacity={0.65} />
                    </g>
                </>
            )
        // Bright Stars — a constellation drawn, a comet crossing it
        case 'features':
            return (
                <>
                    <Stars pts={[[14, 28], [84, 66, 0.5], [22, 78], [70, 14, 1.4], [50, 80], [88, 36]]} />
                    <Constellation x={0} y={0}
                                   nodes={[[18, 68], [32, 50], [49, 62], [64, 44], [77, 66]]}
                                   links={[[0, 1], [1, 2], [2, 3], [2, 4]]} />
                    <Comet x={62} y={22} len={34} s={0.8} />
                    <Sparkle x={20} y={26} s={0.7} delay={0.6} />
                    <Sparkle x={78} y={46} s={0.5} delay={1.8} />
                </>
            )
        // Asteroid Belt — a dotted course threads through the rocks to a ship
        case 'challenges':
            return (
                <>
                    <Stars pts={[[14, 14], [82, 48, 1.1], [40, 84], [86, 78], [24, 66, 2.2]]} />
                    <path className="scene-ribbon" style={{ strokeWidth: 1.7 }} d="M16 78 C28 76 26 62 38 62 S46 46 56 48 S62 34 70 36" />
                    <g className="scene-drift"><Asteroid x={28} y={42} s={1.1} /></g>
                    <g className="scene-drift" style={{ animationDelay: '-3s' }}><Asteroid x={52} y={68} s={0.95} /></g>
                    <g className="scene-drift" style={{ animationDelay: '-5s' }}><Asteroid x={58} y={22} s={0.7} /></g>
                    <g className="scene-drift" style={{ animationDelay: '-7s' }}><Asteroid x={20} y={22} s={0.6} /></g>
                    <g className="scene-drift" style={{ animationDelay: '-2s' }}><Asteroid x={76} y={66} s={0.8} /></g>
                    <Rocket x={72} y={44} s={0.3} r={62} />
                </>
            )
        // Planet-rise — the finish: a ringed world coming up over the horizon
        case 'takeaways':
            return (
                <>
                    <Stars pts={[[14, 20], [28, 34, 1.5], [82, 18], [72, 36, 0.4], [16, 52], [88, 50]]} />
                    <Moon x={76} y={26} r={4.6} />
                    <Planet x={48} y={54} r={17} ring tilt={-14} />
                    <Ground d="M0 74 Q48 56 96 74 V96 H0 Z" fill="var(--hill-2)" />
                    <Flag x={22} y={77} s={0.3} />
                    <Sparkle x={34} y={22} s={0.55} delay={1.2} />
                </>
            )
        // Next Mission — rocket on the pad, tower beside it, ready for the next window
        case 'retro':
            return (
                <>
                    <Stars pts={[[14, 18], [26, 40, 0.9], [80, 16], [86, 46, 2], [64, 10], [18, 62]]} />
                    <Moon x={76} y={30} r={5} />
                    <Ground d="M0 80 Q30 76 56 80 T96 78 V96 H0 Z" fill="var(--hill-3)" />
                    <LaunchTower x={42} y={82} s={0.42} />
                    <Rocket x={42} y={80} s={0.42} />
                </>
            )
    }
}