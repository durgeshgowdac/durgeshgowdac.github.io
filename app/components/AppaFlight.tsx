'use client'
import { useEffect, useRef } from 'react'
import FlightScene from '@/app/components/scenery/FlightScene'
import { useReducedMotion } from '@/app/components/useReducedMotion'
import { useScenePlayback } from '@/app/components/useScenePlayback'

/**
 * Scene A ("Appa, Yip Yip") for use inside an <svg>: mounts the 780 × 160 FlightScene at (x, y) scaled by s, on its own SMIL
 * clock, and hands the owning <svg> to useScenePlayback so the loop pauses off-screen and stops when the Space world is showing.
 * With prefers-reduced-motion it is the still frame.
 */
export default function AppaFlight({ x = 0, y = 0, s = 1 }: { x?: number; y?: number; s?: number }) {
  const reduce = useReducedMotion()
  const g = useRef<SVGGElement>(null)
  const svg = useRef<SVGSVGElement | null>(null)
  useEffect(() => { svg.current = g.current?.ownerSVGElement ?? null })   // declared before the hook so the <svg> is known when it starts
  useScenePlayback(svg)
  return (
    <g ref={g} transform={`translate(${x} ${y}) scale(${s})`}>
      <FlightScene reduce={reduce} />
    </g>
  )
}
