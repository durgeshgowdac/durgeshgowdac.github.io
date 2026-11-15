'use client'
import { useReducedMotion } from '@/app/components/useReducedMotion'
import AppaFlight from '@/app/components/AppaFlight'
import HarryFlight from '@/app/components/HarryFlight'
import { Cloud, Peak, Crater, Aurora, Nebula, Sparkle } from '@/app/components/scenery/illustrations'

/**
 * The compact flight under the Download Resume button — for SMALL screens only (≤ 900px).
 *
 * From 901px up, the same two flights are part of the About hero's background (the focal slot in PageScene: <AppaFlight/> in Nature,
 * <HarryFlight/> in Space, with the range in the header ground). Below 900px that focal art is hidden, so this strip stands in for it:
 *   Nature: Appa and the gang over a small range.
 *   Space:  Harry on his Nimbus 2000 with Hedwig, over a lunar ridge.
 * CSS (.profile-flight) hides it above 900px, so only one of the two is ever on screen.
 *
 * <AppaFlight/> owns the pause-when-off-screen / theme-swap playback for the whole <svg>, so this component does not call
 * useScenePlayback itself. The frame is the flight scene's middle (its centre stays at x = 280) widened to x −150 … 710, plus a strip of ground underneath; on phones the strip is the full screen width
 * (CSS), cropped to the middle when the screen is narrower than the drawing (preserveAspectRatio slice).
 */
export default function ProfileFlight() {
    const reduce = useReducedMotion()
    return (
        <svg className="profile-flight" viewBox="-150 8 860 200" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
            <g className="scene-nature">
                <Cloud x={-90} y={64} s={0.45} o={0.6} drift driftClass="scene-cloud--b" />
                <Cloud x={120} y={44} s={0.5} o={0.7} drift />
                <Cloud x={300} y={74} s={0.35} o={0.55} drift driftClass="scene-cloud--b" />
                <Cloud x={420} y={30} s={0.4} o={0.6} drift driftClass="scene-cloud--b" />
                <Cloud x={560} y={58} s={0.5} o={0.68} drift />
                <Cloud x={670} y={26} s={0.35} o={0.55} drift driftClass="scene-cloud--b" />
                <AppaFlight x={0} y={0} s={1} />
                {/* the range below Appa, across the whole frame: faded far peaks, then the near ones with snow caps (ground line at y = 206, the frame's bottom edge) */}
                <Peak x={-90} y={206} w={210} h={34} far />
                <Peak x={108} y={206} w={200} h={36} far />
                <Peak x={300} y={206} w={230} h={40} far />
                <Peak x={446} y={206} w={170} h={34} far />
                <Peak x={620} y={206} w={220} h={38} far />
                <Peak x={-20} y={206} w={180} h={42} />
                <Peak x={190} y={206} w={190} h={46} />
                <Peak x={372} y={206} w={160} h={38} />
                <Peak x={560} y={206} w={190} h={44} />
                <Peak x={700} y={206} w={150} h={34} />
            </g>
            <g className="scene-space">
                <Aurora x={-150} y={14} w={860} h={64} />
                <Nebula x={280} y={90} w={380} h={90} />
                <Nebula x={560} y={70} w={300} h={80} />
                <Sparkle x={-70} y={52} delay={0.9} s={0.7} />
                <Sparkle x={110} y={34} delay={0.4} s={0.8} />
                <Sparkle x={236} y={140} delay={1.1} s={0.7} />
                <Sparkle x={330} y={22} delay={0.2} s={0.6} />
                <Sparkle x={452} y={52} delay={1.7} s={0.8} />
                <Sparkle x={600} y={130} delay={1.4} s={0.7} />
                <Sparkle x={660} y={40} delay={0.6} s={0.8} />
                {/* the moon below: a far ridge across the whole frame and a few craters */}
                <path d="M-160 184 C-110 174 -50 178 0 188 S40 192 60 190 C120 176 170 172 230 182 S350 190 410 178 S470 176 500 184 S580 192 640 182 S700 176 720 182 V210 H-160 Z" className="sc-far" opacity={0.9} />
                <Crater x={-60} y={201} w={40} o={0.7} />
                <Crater x={150} y={200} w={44} o={0.7} />
                <Crater x={330} y={202} w={56} o={0.7} />
                <Crater x={570} y={200} w={50} o={0.7} />
                <HarryFlight x={0} y={100} s={1} w={500} reduce={reduce} say={[['To the skies, Hedwig.'], ['Lead the way, girl!']]} />
            </g>
        </svg>
    )
}