'use client'
import { Harry, HARRY_HEAD } from '@/app/components/scenery/quidditch'
import SpeechBubble from '@/app/components/scenery/SpeechBubble'
import { Luke, Signpost, Crater, Sparkle } from '@/app/components/scenery/illustrations'
import { useReducedMotion } from '@/app/components/useReducedMotion'

/**
 * Space 404, a crossover: Harry (hovering on his Nimbus) and Luke stand either side of the signpost, dead-pan, both a little lost.
 *   Harry: "Is this Hogwarts?"   Luke: "No. Tatooine."
 * Drawn for the 320 × 170 frame in not-found.tsx, ground at y = 150 (the signpost's foot, like the Nature version).
 * One 9 s loop: Harry's bubble, then Luke's. With reduced motion Harry stops bobbing and both bubbles stay up
 * (they sit well apart, so nothing overlaps).
 */
const T = 9
const GROUND = 150
const LUKE_X = 84, LUKE_S = 0.66
const HARRY_X = 236, HARRY_Y = 106, HARRY_S = 0.8
const bob = Array.from({ length: 9 }, (_, i) => `0 ${(3.2 * Math.sin((i / 8) * Math.PI * 2)).toFixed(2)}`).join(';')

export default function SpaceNotFoundScene() {
    const reduce = useReducedMotion()
    // the tail tips: just above each head (Harry is mirrored, so his head is left of his middle)
    const harryTip: [number, number] = [HARRY_X - HARRY_S * HARRY_HEAD[0], HARRY_Y + HARRY_S * (HARRY_HEAD[1] - 14)]
    const lukeTip: [number, number] = [LUKE_X + 2 * LUKE_S, GROUND - 87 * LUKE_S]
    return (
        <>
            {/* a short lunar ridge to stand on, a few craters and rocks */}
            <path d="M-20 154 C30 148 70 152 120 151 S210 153 250 150 S320 150 340 153 V170 H-20 Z" fill="var(--scene-fill)" stroke="none" />
            <path d="M-20 154 C30 148 70 152 120 151 S210 153 250 150 S320 150 340 153" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" />
            <Crater x={44} y={163} w={36} o={0.7} />
            <Crater x={150} y={166} w={44} o={0.7} />
            <Crater x={274} y={162} w={34} o={0.7} />

            <Signpost x={160} y={GROUND} s={0.55} />

            {/* Luke: facing the signpost, saber lowered */}
            <Luke x={LUKE_X} y={GROUND} s={LUKE_S} arm={-8} fore={-4} wrist={0} saberLen={30} />

            {/* Harry: hovering on the other side, mirrored so he faces the signpost */}
            <g>
                {!reduce && <animateTransform attributeName="transform" type="translate" values={bob} dur="3.4s" repeatCount="indefinite" />}
                <Harry x={HARRY_X} y={HARRY_Y} s={HARRY_S} flip wobble={!reduce} />
            </g>

            <Sparkle x={52} y={34} />
            <Sparkle x={196} y={26} delay={0.8} s={0.8} />
            <Sparkle x={300} y={48} delay={1.4} s={0.7} />

            <g transform={`translate(${harryTip[0]} ${harryTip[1]})`}>
                <SpeechBubble lines={['Is this Hogwarts?']} fs={9.2} shift={-10} timing={reduce ? undefined : { T, on: 0.8, off: 4.3 }} />
            </g>
            <g transform={`translate(${lukeTip[0]} ${lukeTip[1]})`}>
                <SpeechBubble lines={['No. Tatooine.']} fs={9.2} shift={10} timing={reduce ? undefined : { T, on: 5, off: 8.5 }} />
            </g>
        </>
    )
}
