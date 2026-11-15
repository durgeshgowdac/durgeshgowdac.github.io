'use client'

import { useRef } from 'react'
import { useScenePlayback } from '@/app/components/useScenePlayback'
import { useReducedMotion } from '@/app/components/useReducedMotion'
import { useFlightFrames } from '@/app/components/scenery/flight'
import { ridgeFn } from '@/app/components/scenery/ridge'
import {
  L, Cloud, Bird, Butterfly, FoxWalk, Rabbit, Deer, Flower, Pine, RoundTree,
  Signpost, Tent, Campfire, Hiker, Cairn, MistBand, Balloon, Lantern,
  Planet, Moon, Sparkle, StagedRocket, StagedDebris, Astronaut, Ufo, Satellite, Comet, Asteroid, Beacon, Nebula, Aurora,
} from '@/app/components/scenery/illustrations'

/**
 * Chapter 2 of the story, full-bleed along the top of the Projects section.
 *   Nature: the fox from the hero walks the trail through the woods (cairns mark the way, a little mist
 *           hangs in the valley), past friends, toward the camp glowing at the far end.
 *   Space:  the hero's three-stage rocket cruises the asteroid belt past relay beacons, dropping its stages on the way (they stay behind as
 *           debris until the next loop); the astronaut floats by.
 * Same ground tokens, trees, cairns, beacons and astronaut as the home hero — the strip is that story, shrunk.
 * It sits above the heading (never behind it) — see .journey in globals.css. Its height follows its width (780:150),
 * so the whole strip is visible at every screen size — nothing is cropped.
 * The strip is 780:150 like every other section strip (sky, sports, catch, duel); the trail is laid out for that width.
 */
/** the walking trail (Nature): the dotted line AND the fox's route — the same string */
const TRAIL = 'M-20 146 C20 144 50 142 75 140 C179 128 269 146 388 136 C507 126 597 142 701 132 C736 130 765 134 800 138'
const trailY = ridgeFn(TRAIL)
const RIBBON = 'M-20 140 C12 140 51 133 75 118 C199 40 338 150 467 84 C557 40 626 70 701 52 C740 44 770 50 800 56'

/** the cruise: one loop (s). The rocket flies the whole ribbon, speeding up under each burn and holding its speed in the coasts, and lets go of its stages on the way (fractions of the loop);
 what it drops stays where it was dropped until the loop ends. */
const CRUISE = 34
const SEP1 = 0.27       // stage 1 is let go over the left of the strip
const FAIR = SEP1 + 0.14 // the fairing splits ~3 s after stage 2 lit
const SEP2 = 0.54       // stage 2 is let go; the last stage flies on out of the frame
const ROCKET_SCALE = 0.62
const MECO = 1.0        // s between an engine's cut-off and its stage's release (a coast)
const IGNITE = 1.6      // s between a release and the next stage's ignition (matches StagedRocket's defaults)

/** The ascent speed, from the rocket equation: while a stage burns the rocket accelerates (more and more, as the propellant gets lighter); in the coasts between
 *  cut-off and the next ignition it holds its speed. Integrated into how far along the ribbon (0…1) the rocket is, sampled twice a second, so the SMIL motion and
 *  the debris frames (useFlightFrames) read the very same curve. */
const burns: [number, number, number, number][] = [   // [from s, to s, Δv gained (arbitrary units), fraction of the stack's mass the burn uses]
  [0, SEP1 * CRUISE - MECO, 1.0, 0.55],
  [SEP1 * CRUISE + IGNITE, SEP2 * CRUISE - MECO, 1.0, 0.45],
  [SEP2 * CRUISE + IGNITE, CRUISE, 1.1, 0.5],
]
const speedAt = (t: number) => {
  let v = 1.6                                   // already flying when it enters the strip
  for (const [a, b, dv, mu] of burns) {
    if (t >= b) { v += dv; continue }
    if (t > a) { const x = (t - a) / (b - a); v += dv * Math.log(1 / (1 - mu * x)) / Math.log(1 / (1 - mu)) }
    break
  }
  return v
}
const STEP = 0.5
const PROFILE = (() => {
  const n = Math.round(CRUISE / STEP), d = [0]
  for (let i = 1; i <= n; i++) d.push(d[i - 1] + (speedAt((i - 1) * STEP) + speedAt(i * STEP)) / 2 * STEP)
  return d.map(x => x / d[n])
})()
const progressAt = (sec: number) => {
  const u = Math.max(0, Math.min(CRUISE, sec)) / STEP, i = Math.min(PROFILE.length - 2, Math.floor(u))
  return PROFILE[i] + (PROFILE[i + 1] - PROFILE[i]) * (u - i)
}
const MOTION_POINTS = PROFILE.map(v => v.toFixed(5)).join(';')
const MOTION_TIMES = PROFILE.map((_, i) => (i / (PROFILE.length - 1)).toFixed(5)).join(';')

export default function JourneyStrip() {
  const reduce = useReducedMotion()
  const svgRef = useRef<SVGSVGElement>(null)
  useScenePlayback(svgRef)
  // where the rocket is at each release, so the dropped parts can be drawn there, outside the moving rocket
  const frames = useFlightFrames(reduce ? '' : RIBBON, [SEP1 * CRUISE, SEP2 * CRUISE, FAIR * CRUISE], progressAt, () => ROCKET_SCALE, `${CRUISE}|${SEP1}|${SEP2}|${FAIR}`)
  const farHill = 'M-20 160 V108 C50 98 139 112 229 106 C338 98 428 112 547 104 C656 96 746 108 800 104 V160 Z'
  const foreHill = 'M-20 160 V146 C129 140 229 150 388 144 C527 138 656 148 800 142 V160 Z'
  const hill = 'M-20 160 V130 C20 128 50 128 75 126 C159 112 249 132 358 122 C477 112 577 130 701 118 C736 116 765 118 800 122 V160 Z'
  const farY = ridgeFn(farHill), midY = ridgeFn(hill)
  return (
      <svg ref={svgRef} className="journey" viewBox="0 0 780 150" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
        {/* ── NATURE: the trail ── */}
        <g className="scene-nature">
          <Cloud x={585} y={30} s={0.7} o={0.75} drift />
          <Cloud x={150} y={36} s={0.6} o={0.6} />
          <Balloon x={330} y={46} s={0.36} />
          <Bird x={250} y={40} />
          <Bird x={272} y={58} s={0.7} o={0.7} />
          {/* far ridge, valley mist, then the near hill — the hero's three-layer ground, flattened for a strip */}
          <path d={farHill} className="sc-far" />
          <path d={farHill} {...L} strokeWidth={1} opacity={0.3} />
          <MistBand x={20} y={96} w={378} h={16} o={0.34} />
          <MistBand x={487} y={92} w={308} h={14} o={0.28} />
          <path d={hill} className="sc-mid" />
          <path d={hill} {...L} strokeWidth={1.3} opacity={0.9} />
          <path d={foreHill} className="sc-near" />
          <path className="scene-ribbon" d={TRAIL} opacity={0.6} />
          {/* Depth, back to front. BACK row: small, hazy trees on the far crest. MIDDLE row: the signpost, wildlife and the camp, a size up,
              on the middle hill. Nothing stands on the trail (the dotted line along the front hill) — the fox owns it — and nothing
              overlaps: every item has its own stretch of ground. Sizes keep the hero's ratios (pine ≈ 1.5 × a deer, deer ≈ 1.7 × a fox)
              scaled by depth: back ≈ 0.5, middle ≈ 0.75, trail ≈ 0.85 (the fox). Each foot is planted with ridgeFn, never a typed y. */}
          <g className="scene-deco">
            <g opacity={0.8}>
              {[[100, 'p', 0.5], [165, 'r', 0.46], [262, 'p', 0.54], [360, 'r', 0.5], [520, 'p', 0.5], [735, 'p', 0.52]].map(([x, k, sc], i) => (
                  k === 'p' ? <Pine key={i} x={x as number} y={farY(x as number) + 1.5} s={sc as number} /> : <RoundTree key={i} x={x as number} y={farY(x as number) + 1.5} s={sc as number} />
              ))}
            </g>
            <Signpost x={42} y={midY(42) + 2} s={0.72} />
            <Cairn x={122} y={midY(122) + 2} s={0.42} />
            <Rabbit x={214} y={midY(214) + 2} s={0.42} />
            <Flower x={250} y={midY(250) + 2} s={0.55} />
            <Flower x={264} y={midY(264) + 3} s={0.45} />
            <Deer x={322} y={midY(322) + 2} s={0.52} />
            <RoundTree x={410} y={midY(410) + 2} s={0.72} />
            <Pine x={472} y={midY(472) + 2} s={0.78} />
            {/* the camp at the end of the trail — where the story is headed */}
            <Tent x={572} y={midY(572) + 2} s={0.85} />
            <Campfire x={628} y={midY(628) + 3} s={0.6} />
            <Hiker x={668} y={midY(668) + 2} s={0.62} />
            <Lantern x={702} y={midY(702) + 2} s={0.55} />
            <Butterfly x={290} y={96} s={0.7} drift="b" delay={6} />
          </g>
          {/* the fox walks the WHOLE trail: in at the left edge, along the very path the dots are drawn with, out at the right edge —
              it only fades in the last few steps, when it has already left the frame */}
          {reduce ? (
              <g transform={`translate(300 ${trailY(300)}) scale(0.85)`}><FoxWalk /></g>
          ) : (
              <g>
                <animateMotion dur="36s" repeatCount="indefinite" path={TRAIL} rotate="auto" calcMode="linear" />
                <g>
                  <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.02;0.97;1" dur="36s" repeatCount="indefinite" />
                  <g transform="translate(0 3) scale(0.85)"><FoxWalk /></g>
                </g>
              </g>
          )}
        </g>

        {/* ── SPACE: the cruise ── */}
        <g className="scene-space">
          <Aurora x={0} y={6} w={780} h={64} />
          <Nebula x={390} y={70} w={520} h={110} />
          <Nebula x={110} y={104} w={260} h={70} />
          <Sparkle x={109} y={30} delay={0.2} />
          <Sparkle x={233} y={118} delay={0.9} s={0.7} />
          <Sparkle x={417} y={60} delay={1.1} s={0.8} />
          <Sparkle x={527} y={26} delay={1.7} s={0.7} />
          <Sparkle x={671} y={26} delay={0.6} />
          <Sparkle x={756} y={30} delay={1.4} s={0.7} />
          {/* Everything sits well clear of the flight line (≥ 25 units, mostly 45+): above it where the line runs low,
            below it where the line climbs — nothing is on the rocket's way. */}
          <g className="scene-deco">
            {/* top lane (above the line, where it runs low): planet → satellite → comet → saucer → moon */}
            <Planet x={154} y={38} r={26} ring tilt={-16} glow />
            <Satellite x={278} y={40} s={0.7} o={0.85} />
            <Comet x={373} y={30} r={0} len={70} />
            <Ufo x={463} y={28} s={0.55} o={0.9} />
            <Moon x={577} y={24} r={13} />
            {/* bottom lane (below the line, where it runs high / low-left): the belt, then the astronaut drifting by */}
            <Asteroid x={310} y={136} s={1} />
            <Asteroid x={350} y={142} s={0.62} />
            <Asteroid x={392} y={136} s={0.85} />
            <Asteroid x={432} y={141} s={0.55} />
            <Astronaut x={582} y={146} s={0.6} />
          </g>
          <path className="scene-ribbon" d={RIBBON} opacity={0.6} />
          <g className="scene-deco">
            <Beacon x={222} y={26} s={0.5} delay={0} />
            <Beacon x={652} y={120} s={0.5} delay={1.1} />
            <Beacon x={722} y={126} s={0.46} delay={2.2} />
          </g>
          {/* the rocket rides the very same path the dotted line is drawn with (nose-first, turning with the curve), the hero's three-stage vehicle:
              the booster, the fairing and the middle stage are let go one after another and stay behind as debris (drawn below, in the strip's own
              space). The last stage flies on out of the frame; a new rocket enters from the left at the start of the next loop. */}
          {frames && !reduce && (
              <StagedDebris part="stages" dur={CRUISE} sep1={SEP1} sep2={SEP2} fair={FAIR} f1={frames[0]} f2={frames[1]} ff={frames[2]} off0={0.95} off1={0.99} />
          )}
          <g>
            <animateMotion dur={`${CRUISE}s`} repeatCount="indefinite" path={RIBBON} rotate="auto" keyPoints={MOTION_POINTS} keyTimes={MOTION_TIMES} calcMode="linear" />
            <g>
              <animate attributeName="opacity" values="0;1;1;0;0" keyTimes="0;0.03;0.965;0.99;1" dur={`${CRUISE}s`} repeatCount="indefinite" />
              <g transform="rotate(90) translate(0 27)">
                <g transform={`scale(${ROCKET_SCALE})`}>
                  <StagedRocket dur={CRUISE} ign={0} lift={0.01} sep1={SEP1} sep2={SEP2} fair={FAIR} span={0.03} still={reduce} debris={!!frames} />
                </g>
              </g>
            </g>
          </g>
          {frames && !reduce && (
              <StagedDebris part="fairing" dur={CRUISE} sep1={SEP1} sep2={SEP2} fair={FAIR} f1={frames[0]} f2={frames[1]} ff={frames[2]} off0={0.95} off1={0.99} />
          )}
        </g>
      </svg>
  )
}