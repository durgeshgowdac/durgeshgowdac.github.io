import {
  Signpost, Rocket, Mountain, Flag, Dish, Sparkle, Binoculars, Medal, MissionPatch, Hourglass, Stopwatch, Flower, Satellite, Campfire, SpaceStation, Iroh, Falcon, L, F, BALL_RED,
} from '@/app/components/scenery/illustrations'
import { Hedwig, Snitch } from '@/app/components/scenery/quidditch'

export type MarkKind = 'journey' | 'hackathons' | 'education' | 'achievements' | 'conferences' | 'skills' | 'coding' | 'opensource' | 'communities'

/**
 * A tiny themed vignette in the corner of each About card. Same idea as the big
 * scenes: Nature in light mode, Space in dark mode (crossfaded by CSS).
 */
export default function AboutCardIcon({ kind }: { kind: MarkKind }) {
  return (
      <svg className="card-mark" viewBox="0 0 80 72" aria-hidden="true">
        <g className="scene-nature">{nature(kind)}</g>
        <g className="scene-space">{space(kind)}</g>
        <path d="M6 66 H74" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeDasharray="2 5" opacity={0.5} />
      </svg>
  )
}

function nature(k: MarkKind) {
  switch (k) {
    case 'journey':      return <Signpost x={40} y={66} s={0.8} />
    case 'hackathons':   return <Hourglass x={40} y={66} s={1.2} />
    case 'education':    return <Iroh x={40} y={66} s={0.92} />   // the tea-sipping teacher of Avatar
    case 'achievements': return (<><Mountain x={36} y={66} w={64} h={46} snow={false} /><Flag x={36} y={32} s={0.8} /></>)
    case 'conferences':  return <Binoculars x={40} y={66} s={1.3} />
    case 'skills':       return (<><PokeBall cx={30} cy={48} r={17.5} /><PokeBall cx={62} cy={57.5} r={8.5} /></>)   // gotta catch 'em all
    case 'coding':       return <Medal x={40} y={66} s={1.15} />
    case 'opensource':   return (<><Flower x={24} y={66} s={1.05} /><Flower x={40} y={66} s={1.6} /><Flower x={56} y={66} s={1.2} /></>)   // a small garden everyone adds to
    case 'communities':  return <Campfire x={40} y={66} s={1.25} halo={false} />
  }
}

function space(k: MarkKind) {
  switch (k) {
    case 'journey':      return <Rocket x={40} y={64} s={0.72} />
    case 'hackathons':   return <Stopwatch x={40} y={66} s={1.2} />
    case 'education':    return <Hedwig x={44} y={42} s={1.5} r={-6} flap={false} wing={18} />   // the post-owl that carries every Hogwarts letter
    case 'achievements': return (<><Snitch x={44} y={38} s={3.6} flutter={false} glow={false} /><Sparkle x={12} y={16} /><Sparkle x={67} y={54} /></>)   // caught it
    case 'conferences':  return <Dish x={36} y={66} s={1.15} />
    case 'skills':       return (<><Falcon x={36} y={62} s={0.46} /><Sparkle x={12} y={14} /><Sparkle x={68} y={22} /></>)   // the ship that can do a bit of everything
    case 'coding':       return (<><MissionPatch x={40} y={66} s={1.1} /><Sparkle x={63} y={14} /></>)
    case 'opensource':   return (<><Satellite x={40} y={38} s={1.05} r={-12} /><Sparkle x={12} y={16} /><Sparkle x={67} y={56} /></>)   // released into orbit for anyone to use
    case 'communities':  return <SpaceStation x={40} y={40} s={0.95} />
  }
}

/** A capture ball drawn at the card marks' own line weight (the library's Ball is a 9-unit part, so scaling it up would fatten its outline).
 *  Same red as Ash's cap and the capture ball elsewhere on the site; centred on (cx, cy), radius r. */
function PokeBall({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const paper = '#fbfaf4'
  return (
      <g transform={`translate(${cx} ${cy})`}>
        <circle r={r} {...F} fill={paper} />
        <path d={`M${r * 0.38} ${r * 0.92} A${r} ${r} 0 0 0 ${r * 0.96} ${r * 0.3} L${r * 0.62} ${r * 0.3} Q${r * 0.56} ${r * 0.74} ${r * 0.38} ${r * 0.92} Z`} fill="var(--sc-shade)" stroke="none" />
        <path d={`M${-r} 0 A${r} ${r} 0 0 1 ${r} 0 Z`} {...F} fill={BALL_RED} />
        <path d={`M${-r * 0.62} ${-r * 0.42} A${r * 0.76} ${r * 0.76} 0 0 1 ${-r * 0.1} ${-r * 0.74}`} fill="none" stroke="#fff" strokeWidth={1.2} strokeLinecap="round" opacity={0.6} />
        <path d={`M${-r} 0 H${r}`} {...L} strokeWidth={1.7} />
        <circle r={r * 0.3} {...F} fill={paper} />
      </g>
  )
}