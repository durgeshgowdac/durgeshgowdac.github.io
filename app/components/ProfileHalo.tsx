'use client'
import { useRef } from 'react'
import { useScenePlayback } from '@/app/components/useScenePlayback'
import { Firefly, Sparkle, Moon, Satellite, Aurora, Nebula } from '@/app/components/scenery/illustrations'

/**
 * A soft orbit of tiny things around the About photo. Sits *behind* the photo
 * (z-order handled in CSS) and extends past its edges, which is what makes the
 * halo read as a halo. Nature: fireflies.
 * Space: a moon, a satellite, sparkles on a dashed orbit.
 */
export default function ProfileHalo() {
  const ref = useRef<SVGSVGElement>(null)
  useScenePlayback(ref)
  return (
    <svg ref={ref} className="profile-orbit" viewBox="0 0 320 380" aria-hidden="true">
      <g className="scene-nature">
        <ellipse className="scene-ribbon" cx="160" cy="190" rx="140" ry="172" opacity={0.6} />
        <Firefly x={48} y={250} delay={0.4} s={1.3} />
        <Firefly x={282} y={84} delay={1.2} s={1.3} />
        <Firefly x={160} y={10} delay={2} s={1} />
      </g>
      <g className="scene-space">
        <Nebula x={160} y={190} w={300} h={320} />
        <Aurora x={0} y={40} w={320} h={100} />
        <ellipse className="scene-ribbon" cx="160" cy="190" rx="140" ry="172" opacity={0.6} />
        <Moon x={36} y={96} r={11} />
        <Satellite x={280} y={268} s={0.7} />
        <Sparkle x={282} y={84} delay={0.6} s={1.1} />
        <Sparkle x={44} y={256} delay={1.4} />
        <Sparkle x={160} y={12} delay={2.1} s={0.8} />
        <Sparkle x={300} y={190} delay={0.2} s={0.7} />
      </g>
    </svg>
  )
}
