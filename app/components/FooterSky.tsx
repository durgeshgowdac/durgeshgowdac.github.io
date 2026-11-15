'use client'

import { useRef } from 'react'
import { useScenePlayback } from '@/app/components/useScenePlayback'
import { Sun, Cloud, Bird, Balloon, Stars, Aurora, Nebula, Planet, Moon, Satellite, Comet, Sparkle, Ufo, Rocket, Astronaut, Asteroid, Constellation } from '@/app/components/scenery/illustrations'

/**
 * The sky of the project-page footer — one backdrop for the match strip that stands in front of it.
 *
 * It is a 1440 × 445 drawing anchored to the TOP-RIGHT of the footer (xMaxYMin slice): whatever the footer's width, the top of the sky is
 * always whole (nothing is clipped by the top edge) and the sun / planet — which live at the right — stay in view on phones. Every piece
 * sits inside y = 24 … 330, so the upper sky is composed with room to breathe and the lower part runs down behind the stands, where
 * the strip's own horizon (a far ridge and mist, drawn in the strip's coordinates so it always meets the ground) takes over.
 *
 *   NATURE: a morning sky — a big soft sun, a layered bank of drifting clouds in three sizes, flocks of birds, a hot-air balloon.
 *   SPACE:  a deep sky — a starfield all the way down, an aurora and a nebula, a big ringed planet with its moon, a comet, a satellite,
 *           a flying saucer far off, and a few glints.
 */
/** A banded gas giant: the same sphere as <Planet>, but with soft cloud bands (clipped to the disc), a storm and a lit limb — the showpiece of the Space sky. */
function GasGiant({ x, y, r }: { x: number; y: number; r: number }) {
    const bands: [number, number, number][] = [[-0.74, 0.14, 0.2], [-0.48, 0.12, 0.34], [-0.22, 0.16, 0.2], [0.04, 0.12, 0.36], [0.28, 0.16, 0.22], [0.56, 0.12, 0.3], [0.78, 0.1, 0.18]]
    return (
        <g transform={`translate(${x} ${y})`}>
            <Planet r={r} bands={0} glow />
            <clipPath id="pf-giant"><circle r={r} /></clipPath>
            <g clipPath="url(#pf-giant)" transform="rotate(-14)">
                {bands.map(([c, h, o], i) => <rect key={i} x={-r} y={r2(c * r - (h * r) / 2)} width={r * 2} height={r2(h * r)} fill="var(--sc-glow)" opacity={o} />)}
                {bands.map(([c], i) => <path key={i} d={`M${-r} ${r2(c * r)} Q0 ${r2(c * r + r * 0.1)} ${r} ${r2(c * r)}`} fill="none" stroke="currentColor" strokeWidth={0.9} opacity={0.5} />)}
                <ellipse cx={r * 0.34} cy={r * 0.3} rx={r * 0.2} ry={r * 0.11} fill="var(--sc-glow)" opacity={0.55} stroke="currentColor" strokeWidth={0.9} />
                <ellipse cx={r * 0.34} cy={r * 0.3} rx={r * 0.1} ry={r * 0.05} fill="none" stroke="currentColor" strokeWidth={0.7} opacity={0.6} />
            </g>
            <circle r={r} fill="none" stroke="currentColor" strokeWidth={1.4} />
        </g>
    )
}
const r2 = (n: number) => Math.round(n * 10) / 10

export default function FooterSky() {
    const ref = useRef<HTMLDivElement>(null)
    useScenePlayback(ref)
    return (
        <div ref={ref} className="pf-sky" aria-hidden="true">
            <svg viewBox="0 0 1440 445" preserveAspectRatio="xMaxYMin slice" style={{ color: 'var(--sc-line)' }}>
                {/* ───────── NATURE ───────── */}
                <g className="scene-nature">
                    <Sun x={1236} y={124} s={0.9} />
                    {/* clouds, laid out like a real sky: perspective makes them BIGGER and softer high overhead and smaller, paler and tighter towards the
                        horizon (the strip's ridge). Every cloud has its own patch of sky — none overlaps another, the sun (x ≥ 1142, with its rays), the balloon
                        (x 914 – 946, y 71 – 126) or the birds — and each leaves 38 units to its right for its drift. All of them sit above y ≈ 160, over the strip's
                        treeline and speech bubbles. */}
                    {/* tiny, pale, very high */}
                    <Cloud x={60} y={46} s={0.3} o={0.5} drift driftClass="scene-cloud--b" />
                    <Cloud x={400} y={46} s={0.28} o={0.5} drift />
                    <Cloud x={800} y={48} s={0.3} o={0.5} drift driftClass="scene-cloud--b" />
                    {/* big overhead clouds */}
                    <Cloud x={205} y={66} s={1.35} o={0.88} drift />
                    <Cloud x={590} y={60} s={1.5} o={0.9} drift driftClass="scene-cloud--b" />
                    <Cloud x={1010} y={64} s={1.25} o={0.88} drift />
                    <Cloud x={1370} y={80} s={1.0} o={0.8} drift driftClass="scene-cloud--b" />
                    {/* mid-sky */}
                    <Cloud x={400} y={112} s={0.85} o={0.8} drift driftClass="scene-cloud--b" />
                    <Cloud x={790} y={104} s={0.9} o={0.8} drift />
                    <Cloud x={110} y={126} s={0.7} o={0.74} drift />
                    <Cloud x={1040} y={128} s={0.7} o={0.74} drift driftClass="scene-cloud--b" />
                    {/* small and pale along the horizon */}
                    <Cloud x={300} y={146} s={0.45} o={0.62} drift />
                    <Cloud x={500} y={150} s={0.35} o={0.58} drift driftClass="scene-cloud--b" />
                    <Cloud x={640} y={142} s={0.4} o={0.6} drift />
                    <Cloud x={905} y={152} s={0.4} o={0.6} drift driftClass="scene-cloud--b" />
                    <Cloud x={1400} y={140} s={0.4} o={0.6} drift />
                    <Balloon x={930} y={96} s={0.62} />
                    <Bird x={278} y={100} s={0.8} className="scene-fly" />
                    <Bird x={310} y={116} s={0.56} className="scene-fly" />
                    <Bird x={338} y={100} s={0.5} className="scene-fly" />
                    <Bird x={500} y={110} s={0.7} className="scene-fly" />
                    <Bird x={530} y={126} s={0.46} className="scene-fly" />
                    <Bird x={975} y={112} s={0.62} className="scene-fly" />
                </g>

                {/* ───────── SPACE ───────── */}
                <g className="scene-space">
                    {/* the deep: stars to the horizon, an aurora ribbon, two nebula banks */}
                    <Stars w={1440} h={340} n={180} seed={7} />
                    <Aurora x={0} y={36} w={1440} h={120} />
                    <Nebula x={560} y={200} w={720} h={150} />
                    <Nebula x={190} y={120} w={420} h={100} />

                    {/* the gas giant: shaded cloud bands clipped to the sphere, a storm, a dashed orbit with its moons */}
                    <GasGiant x={1236} y={124} r={59.4} />
                    <ellipse cx={1236} cy={124} rx={118} ry={26} transform="rotate(-14 1236 124)" fill="none" stroke="currentColor" strokeWidth={1} strokeDasharray="2 6" opacity={0.4} />
                    <Moon x={1122} y={148} r={12} />
                    <Moon x={1348} y={96} r={6} />
                    <Planet x={150} y={92} r={15} ring tilt={-20} />

                    {/* things passing through: a rocket climbing out, an astronaut adrift, a satellite, a saucer, an asteroid arc */}
                    {/* the rocket and the astronaut keep to the upper sky, well clear of the match strip's speech bubbles ("Go, Go, Gryffindor!" sits
                        under the rocket's side of the sky, "Gryffindor Wins!" under the astronaut's; the strip's bubbles top out around y = 175) */}
                    <path d="M70 176 C104 156 146 130 196 108" fill="none" stroke="currentColor" strokeWidth={1.2} strokeDasharray="1 7" strokeLinecap="round" opacity={0.4} />
                    <g transform="translate(214 96) rotate(38)"><Rocket x={0} y={0} s={0.48} /></g>
                    <g transform="rotate(-16 704 112)"><Astronaut x={704} y={112} s={0.6} /></g>
                    <Satellite x={812} y={74} s={0.8} o={0.9} />
                    {/* the saucer hangs in the open sky above the asteroid arc: lower down it sat behind the stands and the match's speech bubble */}
                    <Ufo x={930} y={118} s={0.5} />
                    <Asteroid x={838} y={196} s={0.4} o={0.8} />
                    <Asteroid x={862} y={174} s={0.5} o={0.85} />
                    <Asteroid x={894} y={192} s={0.8} o={0.9} />
                    <Asteroid x={928} y={180} s={0.4} o={0.8} />
                    <Asteroid x={958} y={200} s={0.6} o={0.85} />
                    <Comet x={990} y={46} r={0} len={100} />
                    <Comet x={330} y={64} r={0} len={56} />
                    <Constellation x={470} y={40} nodes={[[0, 18], [34, 0], [70, 22], [108, 6], [142, 28], [176, 10]]} links={[[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]]} />

                    <Sparkle x={210} y={150} delay={0.3} s={1} />
                    <Sparkle x={700} y={62} delay={1.1} s={0.8} />
                    <Sparkle x={1040} y={176} delay={0.7} s={0.9} />
                    <Sparkle x={1390} y={170} delay={1.7} s={0.8} />
                    <Sparkle x={90} y={40} delay={1.3} s={0.7} />
                    <Sparkle x={560} y={150} delay={0.5} s={0.7} />
                </g>
            </svg>
        </div>
    )
}