import Link from 'next/link'
import type { Metadata } from 'next'
import ChapterBadge from '@/app/components/ChapterBadge'
import PageScene from '@/app/components/PageScene'
import AppaFlight from '@/app/components/AppaFlight'
import SpaceNotFoundScene from '@/app/components/SpaceNotFoundScene'
import DuelScene from '@/app/components/DuelScene'
import { Signpost, Planet, Pine, Aurora, Nebula } from '@/app/components/scenery/illustrations'

export const metadata: Metadata = { title: 'Page not found' }

/** 404 — told in both worlds: Nature has Appa and the gang taking a wrong turn (Sokka: "Appa Yip Yip!"); Space has Harry (on his Nimbus) and Luke either side of the signpost: "Is this Hogwarts?" / "No. Tatooine." — hence the headline, "Wrong galaxy. Wrong school." */
export default function NotFound() {
  return (
      <div className="nf-page">
        <div className="container nf-content">
          <ChapterBadge n="404" nature="Off the Trail" space="Off the Star Chart" natureNote="this path leads nowhere (we checked)" spaceNote="no such address in this galaxy" />

          <svg className="nf-art" viewBox="0 0 320 170" role="img" aria-label="Appa the sky bison carrying four friends past a signpost, or Harry Potter on his broom and Luke Skywalker standing either side of a signpost, asking where they are">
            <g className="scene-nature">
              {/* tidy and symmetrical: two pines, a small signpost dead centre, and Appa passing overhead */}
              <Pine x={34} y={150} s={0.6} />
              <Pine x={286} y={150} s={0.6} />
              <Signpost x={160} y={150} s={0.55} />
              <AppaFlight x={0} y={-6} s={0.7} />
            </g>
            <g className="scene-space">
              <Aurora x={0} y={8} w={320} h={70} />
              <Nebula x={160} y={96} w={300} h={90} />
              <Planet x={292} y={36} r={22} ring tilt={-18} glow />
              <SpaceNotFoundScene />
            </g>
          </svg>

          <h1 className="nf-title">
            <span className="t-nature">Even Appa took a wrong turn.</span>
            <span className="t-space">Wrong galaxy. Wrong school.</span>
          </h1>
          <p className="nf-copy">
            <span className="t-nature">This path goes nowhere &mdash; I&rsquo;ve checked twice, and Appa once, loudly. The trailhead, however, is right where we left it.</span>
            <span className="t-space">Harry was aiming for Hogwarts. Luke is fairly sure this is Tatooine. Either way, the page you wanted isn&rsquo;t here &mdash; but the launch pad is, and it has better signage.</span>
          </p>
          <div className="nf-actions">
            <Link href="/" className="btn-resume">
              <span className="t-nature">Back to the trailhead</span>
              <span className="t-space">Back to the launch pad</span>
            </Link>
            <Link href="/#projects" className="nf-link">Or browse the projects &rarr;</Link>
          </div>
        </div>

        {/* Space: the Contact section's duel (A Family Matter) on the same ground, laid over the ground band's own 1440 × 190 box (the `band` layout: fixed,
            centred on the band's middle, clear of the astronaut group on the left and the rocket on the right — no measuring) */}
        <div className="proj-end nf-ground" aria-hidden="true">
          <PageScene variant="contact" bandOnly />
          <DuelScene band />
        </div>
      </div>
  )
}