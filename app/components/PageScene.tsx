'use client'

import { useEffect, useRef, useState } from 'react'
import { useScenePlayback } from '@/app/components/useScenePlayback'
import { ridgeFn } from '@/app/components/scenery/ridge'
import AvatarParty from '@/app/components/scenery/AvatarParty'
import AppaFlight from '@/app/components/AppaFlight'
import AppaHover from '@/app/components/scenery/AppaHover'
import MomoOrbit from '@/app/components/scenery/MomoOrbit'
import { SokkaThrow, AangKnock, HitSpark, Cheerers, GagBubbles } from '@/app/components/scenery/BoomerangGag'
import { TophForm, MomoForm } from '@/app/components/scenery/avatarCast'
import SpeechBubble from '@/app/components/scenery/SpeechBubble'
import { SummitPeak, FramingRange, ClimbingHiker, BandMountains, ContactSummit, SUMMIT_PAD } from '@/app/components/scenery/HeroClimb'
import HeroDuelStill from '@/app/components/HeroDuelStill'
import DuelScene from '@/app/components/DuelScene'
import HarryFlight, { HarryCrash } from '@/app/components/HarryFlight'
import { useFlightFrames, splineY } from '@/app/components/scenery/flight'
import {
    L, Pine, RoundTree, Cloud, Sun, Flag, Tent, Campfire, Mushrooms, Flower, Fern, Signpost,
    Planet, Moon, Satellite, Astronaut, Alien, Asteroid, LaunchTower, Dish, Lander, Rover, Crater, Stars,
    Deer, Fox, FoxWalk, Rabbit, Bird, Butterfly, Sparkle, Comet, Constellation, Rocket,
    Cairn, MistBand, Balloon, Beacon, Aurora, Nebula, LimbGlow, Abduction, Lantern, Countdown, CoconutBreak, WARM, GLOW,
    Grogu, AangMeditate, MeditationRock, Glider, Rock, BreakingRocket, StagedRocket, StagedDebris, BlastPlanet, SpaceStation, Meteor,
} from '@/app/components/scenery/illustrations'

/**
 * The site's backdrop — one story told twice.
 *
 *   NATURE (light):  a hike. Trailhead at dawn → winding trail (cairns) → summit flag.
 *   SPACE  (dark):   a mission. Launch pad → trajectory (relay beacons) → ringed planet.
 *
 * Every graphic comes from ./scenery/illustrations/ — one library, one house style.
 *
 * Text-safe rules: tall art lives only in the right ~45% of a section (`Focal`), the left/centre only ever
 * carries a LOW horizon band (`Band`), and the sky decoration is thin and masked dimmer behind the text column.
 *
 * GROUND: the hero's band and focal art share ONE ground (FAR / MID / NEAR below). The band and the focal are
 * sized in the same units (see `.scene--hero` in globals.css: both scale with the section width), and the focal
 * re-draws the front layers with a translate, so the two silhouettes meet exactly — no seam, no cropped ridge.
 *
 *   variant="hero"     home hero: sky + right-hand focal + horizon
 *   variant="about"    About hero: top sky (constellation / sun…) + horizon w/ walking fox
 *   variant="project"  project header: top sky + horizon with the hero's animals
 *   variant="contact"  closing chapter: summit + campfire (Nature) / ground station (Space)
 */
type Variant = 'hero' | 'about' | 'project' | 'contact'

/* Shared ground: three rolling layers coloured by --sc-far/mid/near tokens, so the same silhouette reads as
   forest hills in Nature and regolith ridges in Space. Drawn in the band's 1440×190 space; the hero focal
   re-draws it translated (see GROUND_TO_FOCAL). */
const FAR  = 'M0 190 V120 C120 96 220 110 330 118 S560 96 700 112 S980 70 1120 76 S1340 50 1440 40 V190 Z'
const MID  = 'M0 190 V150 C160 130 300 150 460 146 S760 122 900 130 S1200 100 1440 92 V190 Z'
const NEAR = 'M0 190 V172 C200 160 420 176 640 170 S1000 150 1200 156 S1380 150 1440 146 V190 Z'
const FAR_TOP = 'M0 120 C120 96 220 110 330 118 S560 96 700 112 S980 70 1120 76 S1340 50 1440 40'
/* Ground height under any x on the far and middle ridges. Trees are planted with these (never with a typed y), so a trunk always
   meets the hill it stands on — nothing hovers, and nothing sinks. SINK buries the foot of a trunk a hair into the ground. */
const farY = ridgeFn(FAR)
const midY = ridgeFn(MID)
const nearY = ridgeFn(NEAR)
const SINK = 1.5
/* The hero's own ground, LOW under the text column (x < ~450: the Education block is the last thing in the section, so nothing may reach up into it), then
   rising to meet the shared ground. Every layer is the original from x = 700 (far), 700 (middle) / 640 (near) on, with the same control points there, so it meets the
   focal art's copy of the ridges exactly (no seam at x = 800) and everything planted on the right of it keeps its ground. */
const HERO_FAR  = 'M0 190 V166 C150 162 300 168 450 166 S560 96 700 112 S980 70 1120 76 S1340 50 1440 40 V190 Z'
const HERO_MID  = 'M0 190 V176 C150 172 300 178 450 175 C540 176 623.6 137.3 700 132.7 C768.1 128.7 834 126.2 900 130 C1040 138 1200 100 1440 92 V190 Z'
const HERO_NEAR = 'M0 190 V180 C200 175 420 176 640 170 S1000 150 1200 156 S1380 150 1440 146 V190 Z'
const HERO_FAR_TOP = 'M0 166 C150 162 300 168 450 166 S560 96 700 112 S980 70 1120 76 S1340 50 1440 40'
const hfarY = ridgeFn(HERO_FAR)
const hmidY = ridgeFn(HERO_MID)
const hnearY = ridgeFn(HERO_NEAR)
/* the focal is 640×700 and sits at x = 800 of the band: band (x, y) → focal (x − 800, y + 510) */
const GROUND_TO_FOCAL = 'translate(-800 510)'

/** back layer: the far ridge (+ in Space the planet-limb glow hugging it) */
function GroundBack({ hero = false }: { hero?: boolean }) {
    return (
        <>
            <path d={hero ? HERO_FAR : FAR} className="sc-far" />
            <g className="scene-space"><LimbGlow d={hero ? HERO_FAR_TOP : FAR_TOP} /></g>
            <path d={hero ? HERO_FAR_TOP : FAR_TOP} {...L} strokeWidth={1.1} opacity={0.35} />
        </>
    )
}
/** front layers: mid + near ridges, drawn after whatever stands behind them */
function GroundFront({ hero = false }: { hero?: boolean }) {
    return (
        <>
            <path d={hero ? HERO_MID : MID} className="sc-mid" />
            <path d={hero ? HERO_NEAR : NEAR} className="sc-near" />
            <path d={hero ? HERO_NEAR : NEAR} {...L} strokeWidth={1.1} opacity={0.5} />
        </>
    )
}
function Ground() {
    return (<><GroundBack /><GroundFront /></>)
}

/* The reference's neural-net constellation (glowing nodes + dashed links) */
const CONST_A = {
    nodes: [[0, 26], [58, 0], [120, 34], [92, 88], [30, 74], [176, 76], [204, 8]] as [number, number][],
    links: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [1, 3], [2, 5], [2, 6]] as [number, number][],
}
const CONST_B = {
    nodes: [[0, 34], [44, 8], [92, 28], [70, 70], [18, 76]] as [number, number][],
    links: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]] as [number, number][],
}

/* ───────────── Horizon band (bottom of every variant) ───────────── */
function Band({ variant }: { variant: Variant }) {
    const tall = variant === 'contact'
    const H = tall ? 230 : 190
    // The band's height follows its width (see .scene-band in globals.css), so the whole 1440-wide drawing is visible at every size.
    const reduceBand = useReducedMotion()
    return (
        <svg
            className={`scene-band${tall ? ' scene-band--tall' : ''}`}
            viewBox={`0 0 1440 ${H}`}
            preserveAspectRatio="xMidYMax meet"
        >
            <g transform={tall ? `translate(0 ${H - 190})` : undefined}>
                {/* Space: the footer-sky haze + aurora, behind the far ridge (so the ridge and its limb glow sit IN the glow) */}
                <g className="scene-space">
                    {variant === 'hero' ? (
                        /* hero: nothing glows behind the text column — the haze and aurora start right of it */
                        <>
                            <Aurora x={780} y={8} w={660} h={96} />
                            <Nebula x={1080} y={78} w={720} h={120} />
                        </>
                    ) : (
                        <>
                            <Aurora x={0} y={8} w={1440} h={96} />
                            <Nebula x={720} y={78} w={1000} h={120} />
                            <Nebula x={230} y={64} w={460} h={90} />
                        </>
                    )}
                </g>
                {variant === 'about' && (
                    <>
                        {/* About: the hero's mountains — pale snow-capped range, one tall summit on the right (clear of the text), green flanks and slope pines;
                            in Space the same silhouettes as bare lunar crags. Drawn before the far ridge, which hides every foot. */}
                        <g className="scene-nature"><BandMountains /></g>
                        <g className="scene-space"><BandMountains lunar /></g>
                    </>
                )}
                <GroundBack hero={variant === 'hero'} />

                {tall && (
                    /* a small pad on the far ridge: its rocket lifts off, climbs well up into the sky (~75 units, nearly three times as high as before) and
                       breaks apart there; the pieces fade, the pad stands empty for a short pause, then a new one waits on it for the next loop
                       (11.6 s: engines light at 2.4, lift-off at 3.6, it blasts at 8.0, the pieces are gone by 10.2, the next rocket is back at 11.8) */
                    <g className="scene-space">
                        <Launch x={1120} y={84} s={0.5} curve="" rise={100} flightScale={0.8} dur={11.6} reduce={reduceBand}
                                ign={2.4 / 11.6} lift={3.6 / 11.6} end={8.33 / 11.6} breakAt={8 / 11.6} breakSpan={2.2 / 11.6} />
                        {/* Harry and Hedwig, no dialogue, on the rocket's own 11.6 s clock: they arrive at (1120, −15), where the rocket is at 8.0 s — the second it
                            breaks apart (it climbs straight up from y = 59.5 and has covered 74.5 % of its 100-unit rise by then) — so it looks as if he flew into it */}
                        <HarryCrash from={[540, 70]} hit={[1120, -15]} s={0.42} T={11.6} tHit={8} tGone={9.6} />
                        {/* a saucer lifts its alien, set back on the ridge at the left */}
                        <Abduction x={400} y={140} h={84} ufo={0.5} delay={2}><Alien s={0.55} /></Abduction>
                    </g>
                )}

                {/* low mist between the horizon and the sky — paper-coloured at ~30%: depth, never contrast */}
                {variant === 'hero' && (
                    <g className="scene-nature">
                        {/* only over the rising hill, right of the text column, so it never crosses the Location / Status / Education lines */}
                        <MistBand x={470} y={122} w={330} h={16} o={0.3} />
                        <MistBand x={560} y={106} w={250} h={12} o={0.22} />
                    </g>
                )}

                {/* Contact: the signpost stands on the FAR ridge — its own, more distant ground layer, drawn before the middle and near hills so they
                    overlap its foot — smaller and a touch paler, to push it back from the gang and the camp in front */}
                {variant === 'contact' && (
                    <g className="scene-nature">
                        <Signpost x={128} y={farY(128) + SINK} s={0.7} o={0.9} />
                    </g>
                )}

                <GroundFront hero={variant === 'hero'} />

                {/* ───────────── NATURE ───────────── */}
                <g className="scene-nature">
                    {variant === 'hero' ? (
                        /* low flora only, and only on the rising ground right of the text column (x ≈ 500–640): nothing under the text,
                           no tall trees, nothing that can peek out from behind the mountains */
                        <>
                            {/* the woods' animals — fox, deer and hare, in the hero's one proportion (deer ≈ 1.7 × fox ≈ 1.6 × rabbit) — stand on the low ground under the Based in block,
                                with flowers between them and a butterfly over the first pair; the fox and the deer face each other, the hare sits on the deer's far side, turned in */}
                            <Fox x={90} y={hnearY(90) + 2} s={0.66} />
                            <Flower x={156} y={hnearY(156) + 2} s={0.7} />
                            <Flower x={175} y={hnearY(175) + 5} s={0.55} />
                            <Butterfly x={166} y={hnearY(166) - 34} s={0.8} drift="c" delay={3} />
                            <Deer x={236} y={hnearY(236) + 2} s={0.72} flip />
                            <Rabbit x={310} y={hnearY(310) + 2} s={0.5} flip />
                            <Flower x={352} y={hnearY(352) + 2} s={0.7} />
                            <Flower x={371} y={hnearY(371) + 5} s={0.55} />
                            <Fern x={412} y={hnearY(412) + 2} s={0.55} />
                            <Flower x={508} y={hnearY(508) + 2} s={0.75} />
                            <Flower x={528} y={hnearY(528) + 5} s={0.6} />
                            <Fern x={574} y={hnearY(574) + 2} s={0.62} />
                            <Mushrooms x={618} y={hnearY(618) + 2} s={0.5} />
                            {/* nothing between x≈640 and the focal art: that's where "scroll" + chevron sit */}
                        </>
                    ) : variant === 'contact' ? (
                        /* Contact: flora spread evenly along the whole ridge — single trees with room around them */
                        <>
                            <Pine x={64} y={farY(64) + SINK} s={0.62} />
                            <Pine x={470} y={farY(470) + SINK} s={0.55} />
                            <Pine x={1404} y={farY(1404) + SINK} s={0.6} />
                            <RoundTree x={590} y={midY(590) + SINK} s={0.5} />
                            <RoundTree x={1290} y={midY(1290) + SINK} s={0.7} />
                            <Flower x={140} y={172} s={0.75} />
                            <Flower x={158} y={176} s={0.6} />
                            <Flower x={540} y={172} s={0.75} />
                            <Mushrooms x={700} y={148} s={0.5} />
                            <Fern x={860} y={172} s={0.7} />
                            <Flower x={1340} y={166} s={0.7} />
                        </>
                    ) : variant === 'project' ? (
                        /* Project header, Nature — three ground layers, each a step smaller than the one in front (depth: far ≈ 0.6, middle ≈ 0.8, near = 1),
                           every foot planted with its ridge's own curve, and every item given its own stretch of ground so nothing hides anything else.
                           Left of the party: far pines, then the middle hill (round tree · deer · mushrooms), then the near ground (flowers · fox · rabbit).
                           Right of it: far pines, the middle hill (cairn · tree · mushrooms) and the near ground (fern · the picnic). The party owns x ≈ 540–900. */
                        <>
                            <g opacity={0.85}>
                                <Pine x={70} y={farY(70) + SINK} s={0.5} />
                                <Pine x={330} y={farY(330) + SINK} s={0.5} />
                                <RoundTree x={440} y={farY(440) + SINK} s={0.42} />
                                <Pine x={1215} y={farY(1215) + SINK} s={0.5} />
                                <Pine x={1422} y={farY(1422) + SINK} s={0.46} />
                            </g>
                            <RoundTree x={134} y={midY(134) + SINK} s={0.52} />
                            <Mushrooms x={292} y={midY(292) + SINK} s={0.42} />
                            <Cairn x={968} y={midY(968) + SINK} s={0.5} />
                            <Mushrooms x={1022} y={midY(1022) + SINK} s={0.4} />
                            <RoundTree x={1372} y={midY(1372) + SINK} s={0.5} />
                        </>
                    ) : (
                        /* About header, Nature — the same three-layer logic as the Projects header: far ridge (×0.5), middle hill (×0.8), near ground (×1), every foot
                           planted on its ridge. The fox walks the near ground from x ≈ 226 to 626 (see .scene-walk--about), so nothing stands on that stretch of
                           the near ground; the middle hill carries the tree, deer and mushrooms behind it. The right is the picnic and kite, with the summit behind. */
                        <>
                            <g opacity={0.85}>
                                <Pine x={70} y={farY(70) + SINK} s={0.5} />
                                <RoundTree x={330} y={farY(330) + SINK} s={0.42} />
                                <Pine x={470} y={farY(470) + SINK} s={0.5} />
                                <Pine x={690} y={farY(690) + SINK} s={0.5} />
                                <Pine x={1262} y={farY(1262) + SINK} s={0.5} />
                                <Pine x={1408} y={farY(1408) + SINK} s={0.46} />
                            </g>
                            <RoundTree x={130} y={midY(130) + SINK} s={0.52} />
                            <Mushrooms x={420} y={midY(420) + SINK} s={0.42} />
                            <RoundTree x={720} y={midY(720) + SINK} s={0.5} />
                            <Cairn x={1240} y={midY(1240) + SINK} s={0.5} />
                            <RoundTree x={1330} y={midY(1330) + SINK} s={0.55} />
                            <Flower x={92} y={nearY(92) + 2} s={0.55} />
                            <Flower x={112} y={nearY(112) + 5} s={0.45} />
                            <Fern x={770} y={nearY(770) + 2} s={0.5} />
                            <Flower x={1000} y={nearY(1000) + 2} s={0.55} />
                            <Flower x={1020} y={nearY(1020) + 5} s={0.45} />
                            <Butterfly x={1012} y={nearY(1012) - 26} s={0.9} drift="c" delay={3} />
                        </>
                    )}

                    {variant === 'about' && (
                        <>
                            {/* animals in the project header's proportion (deer ≈ 1.7 × fox ≈ 2.7 × rabbit): the deer stands back on the middle hill (× 0.8), the hare sits up
                                on the near ground clear of the fox's path, the fox walks the near ground at the same size it has on the Projects page, and the picnic (palm +
                                chair + table on the middle hill) and the kite-flyers + skater (near ground) keep their own stretches. */}
                            <Deer x={560} y={midY(560) + SINK} s={0.58} />
                            <Rabbit x={850} y={nearY(850) + 2} s={0.5} flip />
                            <CoconutBreak part="chill" x={930} y={midY(930) + SINK} s={0.55} />
                            <CoconutBreak part="play" x={1110} y={nearY(1110) + 2} s={0.72} />
                            <g className="scene-walk scene-walk--about"><FoxWalk x={226} y={168} s={0.66} /></g>
                        </>
                    )}
                    {variant === 'project' && (
                        <>
                            {/* The woods' animals, in one consistent proportion: deer ≈ 1.7 × fox, fox ≈ 1.6 × rabbit (the hero's ratios), and the people of the party
                                stand a little shorter than the deer. Each is drawn at a "near" size × its layer's depth factor (middle hill ×0.8), so the deer, standing
                                back on the middle hill, reads smaller than it would on the front ground, while the fox and the rabbit — in front — keep their full size.
                                Native heights at s = 1: deer ≈ 97, fox ≈ 64, rabbit ≈ 53. */}
                            <Deer x={236} y={midY(236) + SINK} s={0.58} />
                            <Fox x={356} y={nearY(356) + 2} s={0.66} />
                            <Rabbit x={448} y={nearY(448) + 2} s={0.5} flip />
                            {/* near-ground flowers: low enough never to out-grow the rabbit */}
                            <Flower x={100} y={nearY(100) + 2} s={0.55} />
                            <Flower x={120} y={nearY(120) + 5} s={0.45} />
                            <Flower x={500} y={nearY(500) + 2} s={0.55} />
                            <Flower x={520} y={nearY(520) + 5} s={0.45} />
                            <Butterfly x={506} y={nearY(506) - 26} s={0.9} drift="c" delay={3} />
                            {/* the centre of the band belongs to the Avatar party: Appa behind, Toph · Sokka · Katara · Momo · Aang in front.
                                (Its footprint is x ≈ 538 – 897, so its middle sits 2.6 units left of its origin: x = 722.6 puts that middle on the band's centre line.) */}
                            <AvatarParty x={722.6} y={172} s={0.58} />
                            <Fern x={1020} y={nearY(1020) + 2} s={0.5} />
                            <CoconutBreak x={1125} y={nearY(1125) + 12} s={0.8} />
                        </>
                    )}

                    {tall && (
                        <>
                            {/* Contact: the summit on the right, base camp on the left — tent · fire · hiker, each with room */}
                            {/* Momo circles the summit: this copy is the one going round the BACK (drawn before the mountain, so it vanishes behind it) */}
                            <MomoOrbit layer="back" cx={1130} cy={30} rx={165} ry={30} />
                            <ContactSummit />
                            <Tent x={200} y={158} s={1.1} />
                            <Campfire x={300} y={162} s={1.15} />
                            <Lantern x={356} y={164} s={0.9} />
                            <Cairn x={720} y={170} s={0.6} />
                            {/* The gag (see BoomerangGag): Sokka throws, the boomerang flies out through the icon labels and back, knocks the staff out of Aang's hand
                                (Aang stands where the hiker would be), and the talk follows. Sokka · [gap] · Toph · Katara stand at the very bottom of the summit. */}
                            <AangKnock />
                            <SokkaThrow />
                            <Cheerers />
                            <HitSpark />
                            <GagBubbles />
                            {/* …and this copy is the one coming round the FRONT, over their heads */}
                            <MomoOrbit layer="front" cx={1130} cy={30} rx={165} ry={30} />
                        </>
                    )}
                </g>

                {/* ───────────── SPACE ───────────── */}
                <g className="scene-space">
                    {tall ? (
                        /* Contact = the Nature camp, on the moon — same composition: base camp on the left (lander + the waving
                           astronaut ≈ tent + hiker), the landmark on the right (small launch pad beside the planet ≈ summit).
                           The centre — heading, blurb and icons — is left completely open: only low craters live there. */
                        <>
                            <Crater x={86} y={186} w={44} o={0.4} />
                            <Crater x={560} y={188} w={60} o={0.45} />
                            <Crater x={880} y={185} w={46} o={0.4} />
                            <Lander x={160} y={midY(160) + 2} s={1.15} />
                            <Astronaut x={290} y={166} s={0.95} />
                            <Asteroid x={1010} y={170} s={0.7} o={0.7} r={14} />
                            <Flag x={1180} y={158} s={0.8} />
                            <Crater x={1330} y={178} w={50} o={0.4} />
                            <Sparkle x={1040} y={70} />
                            <Sparkle x={70} y={74} s={0.8} delay={1.2} />
                        </>
                    ) : variant === 'project' ? (
                        /* Project header, Space — the Nature layout's three ground layers, on the same ridges: FAR (hazy, ×0.5), MIDDLE (×0.75), NEAR (×1).
                           The duel owns the middle of the near ground (x ≈ 540 – 900, bubbles included), so the other graphics keep to the two sides, each on
                           its own stretch of ground and on its own layer, with a clear gap to its neighbours. Feet are planted with each ridge's own curve. */
                        <>
                            {/* far ridge: a flag, a relay beacon, a small dish, a distant dish on the right — small and set back */}
                            <Flag x={92} y={farY(92) + 1} s={0.6} />
                            <Beacon x={236} y={farY(236) - 2} s={0.55} delay={0.6} />
                            <Dish x={512} y={farY(512) + 1} s={0.5} />
                            <Dish x={1384} y={farY(1384) + 1} s={0.45} />
                            <Beacon x={1010} y={farY(1010) - 2} s={0.5} delay={1.4} />
                            {/* middle ridge: the lander, and the saucer lifting its alien on the right */}
                            <Lander x={262} y={midY(262) + 2} s={1.05} />
                            <Crater x={380} y={midY(380) + 10} w={40} o={0.5} />
                            <Abduction x={1292} y={midY(1292) + 2} h={78} ufo={0.55}><Alien s={0.6} /></Abduction>
                            {/* near ground: craters, the astronaut and the rover, full size */}
                            <Crater x={150} y={nearY(150) + 8} w={40} o={0.55} />
                            <Astronaut x={420} y={nearY(420) + 2} s={0.9} />
                            <Crater x={500} y={nearY(500) + 8} w={56} o={0.6} />
                            <Asteroid x={1010} y={nearY(1010) - 2} s={0.7} o={0.7} />
                            <Rover x={1130} y={nearY(1130) + 12} s={1.1} />
                            <Crater x={1230} y={nearY(1230) + 9} w={44} o={0.55} />
                            <Asteroid x={1372} y={nearY(1372) - 2} s={0.9} o={0.7} r={20} />
                            <Sparkle x={560} y={78} delay={0.9} s={0.8} />
                            <Sparkle x={1120} y={60} delay={1.5} s={0.7} />
                            <Sparkle x={1010} y={36} />
                            <Sparkle x={70} y={74} s={0.8} delay={1.2} />
                            <Sparkle x={1394} y={30} delay={0.3} s={0.8} />
                        </>
                    ) : variant === 'about' ? (
                        /* About header, Space — the lunar base, on three ground layers (far ≈ ×0.5, middle ≈ ×0.75, near ×1; every foot planted on its ridge) with the
                           mountains' bare crags behind. FAR: flag · beacon · dish · launch pad with its rocket · dish · beacon. MIDDLE: lander · astronaut · rover · saucer
                           with its alien. NEAR: craters, rocks, the big rover, lander, a waving astronaut and a flag. Each item has its own stretch of ground. */
                        <>
                            <Flag x={96} y={farY(96) + 1} s={0.6} />
                            <Beacon x={236} y={farY(236) - 2} s={0.55} delay={0.6} />
                            <Dish x={400} y={farY(400) + 1} s={0.5} />
                            {/* the pad on the far ridge launches, exactly as the Contacts ground station's does (same 11.6 s clock, scaled to this pad's size): engines light,
                                lift-off, the rocket climbs and breaks apart high up, the pieces fade, the pad stands empty a moment, then a new rocket waits for the next loop */}
                            <Launch x={812} y={farY(812) + 1} s={0.42} curve="" rise={84} flightScale={0.8} dur={11.6} reduce={reduceBand}
                                    ign={2.4 / 11.6} lift={3.6 / 11.6} end={8.33 / 11.6} breakAt={8 / 11.6} breakSpan={2.2 / 11.6} />
                            <Dish x={1010} y={farY(1010) + 1} s={0.45} />
                            <Beacon x={1330} y={farY(1330) - 2} s={0.5} delay={1.6} />
                            <Lander x={178} y={midY(178) + 2} s={1.0} />
                            <Crater x={520} y={midY(520) + 10} w={44} o={0.5} />
                            <Rover x={620} y={midY(620) + 2} s={0.9} />
                            <Crater x={740} y={midY(740) + 10} w={40} o={0.5} />
                            <Abduction x={1232} y={midY(1232) + 2} h={84} ufo={0.6}><Alien s={0.72} /></Abduction>
                            <Crater x={150} y={nearY(150) + 8} w={40} o={0.55} />
                            <Asteroid x={330} y={nearY(330) - 2} s={0.5} o={0.7} />
                            <Asteroid x={560} y={nearY(560) - 2} s={0.7} o={0.7} />
                            <Crater x={680} y={nearY(680) + 9} w={60} o={0.6} />
                            <Lander x={800} y={nearY(800) + 4} s={1.3} />
                            <Asteroid x={900} y={nearY(900) - 2} s={0.55} o={0.7} />
                            <Astronaut x={970} y={nearY(970) + 2} s={0.85} />
                            <Crater x={1090} y={nearY(1090) + 8} w={56} o={0.55} />
                            <Flag x={1160} y={nearY(1160) + 2} s={0.9} />
                            <Asteroid x={1300} y={nearY(1300) - 2} s={0.8} o={0.7} r={18} />
                            <Crater x={1380} y={nearY(1380) + 8} w={44} o={0.55} />
                            <Sparkle x={70} y={74} s={0.8} delay={1.2} />
                            <Sparkle x={330} y={96} delay={0.5} s={0.7} />
                            <Sparkle x={560} y={70} delay={1.1} />
                            <Sparkle x={700} y={100} delay={1.8} s={0.7} />
                            <Sparkle x={950} y={84} delay={0.3} />
                            <Sparkle x={1120} y={60} delay={1.4} s={0.8} />
                            <Sparkle x={1400} y={90} delay={0.9} s={0.7} />
                        </>
                    ) : (
                        <>
                            <Crater x={190} y={180} w={36} o={0.45} />
                            <Crater x={480} y={174} w={64} o={0.7} />
                            {variant !== 'hero' && <Crater x={1080} y={158} w={48} o={0.7} />}
                            <Asteroid x={variant === 'hero' ? 612 : 560} y={variant === 'hero' ? 158 : 166} s={0.7} o={0.7} />
                            {variant !== 'hero' && <Asteroid x={1340} y={140} s={0.9} o={0.7} r={20} />}
                            {/* hero: the lander is set back on the middle ridge and the flag on the far one (depth), the near ground keeps only craters and rocks */}
                            <Lander x={variant === 'hero' ? 512 : 650} y={variant === 'hero' ? hmidY(512) + 2 : 172} s={variant === 'hero' ? 0.85 : 1.4} />
                            <Flag x={variant === 'hero' ? 730 : 864} y={variant === 'hero' ? hfarY(730) + 1 : 168} s={variant === 'hero' ? 0.7 : 1} />
                            {variant !== 'hero' && <Sparkle x={950} y={60} />}
                            {variant !== 'hero' && <Sparkle x={70} y={74} s={0.8} delay={1.2} />}
                            {/* greetings: the saucer lifts its alien on a beam (the hero has its own pair in the focal art) */}
                            {variant !== 'hero' && (
                                <Abduction x={1182} y={168} h={120} ufo={0.7}><Alien s={0.85} /></Abduction>
                            )}
                            {/* hero: the original scene — the saucer beams its alien up and flies away — waits on the low ground at the left, clear of every line of text */}
                            {variant === 'hero' && <Abduction x={90} y={hnearY(90) + 2} h={66} ufo={0.6}><Alien s={0.5} /></Abduction>}
                            {/* hero: Luke and Vader, blades crossed, frozen mid-clash on the low ground right of Grogu, under the Based in block */}
                            {variant === 'hero' && <HeroDuelStill x={340} y={hnearY(340) + 2} k={0.5} />}
                            {/* hero: Grogu stands on the low ground under the Based in block, saying "Patu" twice every 5 s (one still bubble with reduced motion) */}
                            {variant === 'hero' && (
                                <g>
                                    <Grogu x={230} y={hnearY(230) + 2} s={0.9} ears={6} arms={10} />
                                    {reduceBand
                                        ? <SpeechBubble lines={['Patu']} x={230} y={hnearY(230) + 2 - 35} />
                                        : <>
                                            <SpeechBubble lines={['Patu']} x={230} y={hnearY(230) + 2 - 35} timing={{ T: 5, on: 0.5, off: 1.9 }} />
                                            <SpeechBubble lines={['Patu']} x={230} y={hnearY(230) + 2 - 35} timing={{ T: 5, on: 2.7, off: 4.1 }} />
                                        </>}
                                </g>
                            )}
                        </>
                    )}
                </g>
            </g>
        </svg>
    )
}

/* ───────────── Section-wide sky (home hero + contact) ───────────── */
function Sky({ variant }: { variant: Variant }) {
    const contact = variant === 'contact'
    return (
        <svg className="scene-sky" viewBox="0 0 1440 900" preserveAspectRatio="xMaxYMin slice">
            <g className="scene-nature">
                {contact ? (
                    <>
                        {/* clouds sit in the side columns, high and clear of the summit flag; the centre (heading + icons) stays open */}
                        <Cloud x={110} y={120} s={0.9} drift />
                        <Cloud x={330} y={64} s={0.55} o={0.8} drift driftClass="scene-cloud--b" />
                        <Cloud x={230} y={196} s={0.45} o={0.7} drift />
                        <Cloud x={1060} y={60} s={0.6} o={0.8} drift driftClass="scene-cloud--b" />
                        <Cloud x={1380} y={214} s={0.5} o={0.75} drift />
                        <Bird x={250} y={112} />
                        <Bird x={296} y={134} s={0.75} o={0.8} />
                        <Bird x={1010} y={104} s={0.85} o={0.8} />
                        <Sun x={1290} y={110} s={0.7} />
                        {/* Appa flies towards the sun, getting smaller and fading into its glow, then sets off again */}
                        <AppaHover x={790} y={238} s={0.55} tilt={-13} fly={{ to: [1262, 112], s1: 0.22, dur: 12 }} />
                    </>
                ) : (
                    <>
                        <Cloud x={860} y={78} s={0.6} o={0.8} drift driftClass="scene-cloud--b" />
                        <Cloud x={1010} y={150} s={0.7} o={0.85} drift />
                        <Bird x={900} y={108} />
                        <Bird x={944} y={128} s={0.75} o={0.8} />
                        <Bird x={1090} y={236} s={0.85} o={0.8} />
                    </>
                )}
            </g>
            <g className="scene-space">
                {contact ? (
                    <>
                        <Stars w={1440} h={420} n={70} seed={7} />
                        <Aurora x={0} y={40} w={1440} h={120} />
                        <Nebula x={230} y={170} w={440} h={170} />
                        <Nebula x={1090} y={300} w={560} h={190} />
                        <Beacon x={110} y={190} s={0.8} delay={0.4} />
                        <Beacon x={250} y={30} s={0.7} delay={1.4} />
                        {/* the planet stands exactly where the Nature sun does, with the sun's disc size (66 × 0.7); its moon keeps its place relative to it */}
                        <Planet x={1290} y={110} r={46.2} bands={3} glow tilt={-12} />
                        <Moon x={1172} y={64} r={13} />
                        <Satellite x={330} y={84} s={0.75} o={0.85} />
                        <Sparkle x={420} y={120} delay={0.3} />
                        <Sparkle x={1060} y={78} delay={1.2} s={0.8} />
                        <Sparkle x={200} y={150} delay={0.8} s={0.8} />
                        <Sparkle x={820} y={96} delay={1.8} s={0.7} />
                    </>
                ) : (
                    /* hero: the starfield itself is a CSS layer (.hero::after); here are the haze + aurora from the footer sky, and the glowing stars */
                    <>
                        <Aurora x={760} y={30} w={680} h={140} />
                        <Nebula x={1130} y={230} w={600} h={260} />
                        <Sparkle x={1030} y={150} delay={0.2} />
                        <Sparkle x={1400} y={100} delay={1.1} s={0.8} />
                        <Sparkle x={900} y={330} delay={0.6} s={0.8} />
                        <Sparkle x={1318} y={560} delay={1.7} s={0.7} />
                        <Sparkle x={960} y={520} delay={2.3} s={0.9} />
                    </>
                )}
            </g>
        </svg>
    )
}

/* ───────────── Top sky band (About + Project headers) ───────────── */
function TopSky({ variant }: { variant: 'about' | 'project' }) {
    return (
        <svg className="scene-topsky" viewBox="0 0 1440 170" preserveAspectRatio="xMaxYMin meet">
            {variant === 'about' ? (
                <>
                    <g className="scene-nature">
                        <Sun x={1148} y={64} s={0.5} />
                        <Cloud x={640} y={64} s={0.9} o={0.85} />
                        <Cloud x={800} y={108} s={0.7} o={0.75} />
                        <Cloud x={1010} y={36} s={0.55} o={0.65} />
                        <Bird x={590} y={104} />
                        <Bird x={634} y={122} s={0.7} o={0.7} />
                        <Bird x={940} y={92} s={0.8} o={0.75} />
                    </g>
                    <g className="scene-space">
                        <Aurora x={0} y={14} w={1440} h={70} />
                        <Nebula x={760} y={92} w={720} h={90} />
                        <Nebula x={220} y={70} w={420} h={70} />
                        <Constellation x={600} y={28} {...CONST_B} o={0.85} />
                        <Moon x={780} y={46} r={15} />
                        {/* the comet: flipped to fly down and to the right, head first, towards the photo in the column below (tail streams back up and to the left) */}
                        <Comet x={960} y={96} r={64} len={80} />
                        <Planet x={1148} y={64} r={33} ring tilt={-14} glow />
                        <Satellite x={1300} y={52} s={0.7} o={0.85} />
                        <Sparkle x={560} y={130} delay={0.4} s={0.8} />
                        <Sparkle x={1010} y={40} delay={1.3} s={0.8} />
                        <Sparkle x={1380} y={120} delay={0.9} s={0.7} />
                    </g>
                </>
            ) : (
                <>
                    <g className="scene-nature">
                        <Sun x={1330} y={66} s={0.45} />
                        <Cloud x={430} y={52} s={0.7} o={0.7} />
                        <Cloud x={600} y={64} s={0.9} o={0.85} />
                        <Cloud x={780} y={112} s={0.6} o={0.65} />
                        <Cloud x={930} y={78} s={0.75} o={0.8} />
                        <Cloud x={1130} y={50} s={0.6} o={0.7} />
                        <Cloud x={1230} y={122} s={0.5} o={0.6} />
                        <Bird x={700} y={90} />
                        <Bird x={744} y={72} s={0.75} o={0.7} />
                        <Bird x={500} y={116} s={0.7} o={0.7} />
                        <Bird x={1030} y={30} s={0.8} o={0.75} />
                        <Bird x={1070} y={46} s={0.6} o={0.65} />
                        <Bird x={860} y={46} s={0.65} o={0.6} />
                    </g>
                    <g className="scene-space">
                        <Aurora x={0} y={14} w={1440} h={70} />
                        <Nebula x={760} y={92} w={720} h={90} />
                        <Nebula x={220} y={70} w={420} h={70} />
                        <Planet x={1330} y={66} r={29.7} ring tilt={-14} glow />
                        <Moon x={1106} y={56} r={13} />
                        <Comet x={780} y={96} r={180} len={80} />
                        {/* the five-star constellation: placed clear of the chapter badge below it */}
                        <Constellation x={424} y={16} {...CONST_B} o={0.8} />
                        <Satellite x={640} y={52} s={0.6} o={0.85} />
                        <Beacon x={1000} y={92} s={0.55} delay={1.1} />
                        <Planet x={160} y={92} r={14} ring tilt={-20} />
                        <Sparkle x={556} y={78} delay={0.4} />
                        <Sparkle x={600} y={120} delay={1.0} s={0.8} />
                        <Sparkle x={1190} y={104} delay={1.2} s={0.8} />
                        <Sparkle x={900} y={40} delay={2} s={0.7} />
                        <Sparkle x={1400} y={130} delay={0.6} s={0.7} />
                    </g>
                </>
            )}
        </svg>
    )
}

/* ───────────── Home hero's tall right-hand art ───────────── */

/* The two journeys. Both the dotted line that is DRAWN and the path the traveller MOVES along are
   the very same string, so the hiker / rocket can never drift off their trail.
   TRAIL (Nature): left → right, always rising, from the foot of the hill to the summit flag.
   TRAJ  (Space):  from the launch pad (rocket centre, standing on its pad) up and over to Saturn's ring. */
const TRAIL = 'M206 668 C 240 656, 262 640, 282 618 C 306 592, 340 596, 358 560 C 374 528, 374 474, 388 432 C 400 396, 404 342, 409 295'
const ROCKET_H = 88
const PAD = { x: 168, y: 648, s: 0.8 }                                  // launch pad (hero) — a smaller pad, so the journey reads as a long way
const PAD_RISE = 140                                                    // the straight climb off the pad before the gravity turn begins
const PAD_CLIMB_TOP = Math.round(PAD.y - 5 * PAD.s - (ROCKET_H / 2) * PAD.s - PAD_RISE)   // where the climb ends (rocket centre)
const FLIGHT_SCALE = 0.6                                              // the rocket shrinks to this fraction by the time it lands (depth: it is a long way away)

/* The planet it lands on, and exactly where: LANDING is the point on the disc (angle measured from +x, clockwise on screen) where the nose touches down,
   HEADING the direction it is travelling then (towards the planet's centre-ish). The path ends a little short of LANDING — by the length of what is left of the
   rocket ahead of its centre (the last stage and capsule: 37 units of the art, at the final scale) — so the capsule's tip touches the ground, not its middle. */
const PLANET = { x: 520, y: 250, r: 52, tilt: -16 }
const LANDING_ANGLE = 155
const HEADING = -25.5
const HU: [number, number] = [Math.cos((HEADING * Math.PI) / 180), Math.sin((HEADING * Math.PI) / 180)]
const LANDING: [number, number] = [PLANET.x + PLANET.r * Math.cos((LANDING_ANGLE * Math.PI) / 180), PLANET.y + PLANET.r * Math.sin((LANDING_ANGLE * Math.PI) / 180)]
const TOUCH: [number, number] = [LANDING[0] - 37 * PAD.s * FLIGHT_SCALE * HU[0], LANDING[1] - 37 * PAD.s * FLIGHT_SCALE * HU[1]]
const n1 = (n: number) => Math.round(n * 10) / 10
/* The whole journey, one long smooth line: the straight climb off the pad, a gravity turn that eases over to the right (the tangent never jumps), a long
   shallow cruise, and a final approach that lines the capsule up on the landing point. TRAJ_CURVE is what the rocket flies after the climb; TRAJ is the
   dotted line DRAWN for the whole trip, from the pad to the surface. */
const TRAJ_CURVE = `C${PAD.x} ${PAD_CLIMB_TOP - 58}, 186 ${PAD_CLIMB_TOP - 96}, 228 ${PAD_CLIMB_TOP - 122} C270 ${PAD_CLIMB_TOP - 148}, ${n1(TOUCH[0] - 63 * HU[0])} ${n1(TOUCH[1] - 63 * HU[1])}, ${n1(TOUCH[0])} ${n1(TOUCH[1])}`
const TRAJ = `M${PAD.x} ${Math.round(PAD.y - 4)} L${PAD.x} ${PAD_CLIMB_TOP} ${TRAJ_CURVE} L${n1(LANDING[0])} ${n1(LANDING[1])}`

function useReducedMotion() {
    const [reduce, setReduce] = useState(false)
    useEffect(() => {
        const m = window.matchMedia('(prefers-reduced-motion: reduce)')
        setReduce(m.matches)
        const on = () => setReduce(m.matches)
        m.addEventListener('change', on)
        return () => m.removeEventListener('change', on)
    }, [])
    return reduce
}

/** what Harry says to Hedwig, wherever the pair flies: two separate bubbles, one after the other */
const HP_LINE = [['To the skies, Hedwig.'], ['Lead the way, girl!']]

/* A complete launch, on one SMIL clock so the pieces can never disagree:
 *   pad + service tower, the rocket standing on the slab (no flame), a pre-launch hold, IGNITION (flame appears,
 *   smoke puffs bloom around the pad — the same cloud as the Nature sky, greyed), a beat of hold-down, LIFT-OFF:
 *   the rocket rises straight up, then pitches over along `curve` nose-first (rotate="auto"), shrinking as it
 *   recedes. Then it fades and a new rocket is waiting on the pad.
 *   Fractions of `dur`: ign (ignition) < lift (leaves the pad) < end (gone). */
function Launch({ x, y, s = 1, rise = 54, curve, flightScale = 0.45, dur = 24, ign = 10 / 24, lift = 11.2 / 24, end = 20.2 / 24, reduce: reduceMotion, still = false, puffs = 6, breakAt, breakSpan = 0.14, stages, fade = 0.01, smokeEnd, ease = [0.6, 0, 0.9, 0.5], goneAt, burnOut }: {
    x: number; y: number; s?: number; rise?: number; curve: string; flightScale?: number; dur?: number
    ign?: number; lift?: number; end?: number; reduce: boolean; still?: boolean; puffs?: number
    /** fraction of `dur` at which the rocket breaks apart in flight (it then never reaches `end`); `breakSpan` is how long the pieces last */
    breakAt?: number; breakSpan?: number
    /** a multistage rocket: stage 1 is let go at `sep1`, stage 2 at `sep2` (fractions of `dur`) — a clean separation, no blast */
    stages?: { sep1: number; sep2: number; fair?: number; /** the dropped parts hang in the scene from their release until `off0` … `off1` (fractions of `dur`), then fade */ off0?: number; off1?: number }
    /** how long (fraction of `dur`) the flight takes to fade out as it ends */
    fade?: number
    /** when the launch smoke has thinned away (fraction of `dur`); default: just before `end` */
    smokeEnd?: number
    /** the lift-off → `end` easing (a SMIL keySpline: x1 y1 x2 y2); the default accelerates hard and arrives fast */
    ease?: [number, number, number, number]
    /** when the flight vanishes (fraction of `dur`) — e.g. a rocket that has landed and is blown up; default: `end` */
    goneAt?: number
    /** the last stage's engine cuts here (fraction of `dur`) */
    burnOut?: number
}) {
    const spl = `0 0 1 1;${ease.join(' ')};0 0 1 1`
    const reduce = reduceMotion || still   // `still`: the rocket just stands on its pad — no ignition, smoke or lift-off
    const d = `${dur}s`
    const y0 = y - 5 * s - (ROCKET_H / 2) * s           // rocket centre while it stands on the pad
    const path = `M${x} ${y0} L${x} ${y0 - rise} ${curve}`
    const sEnd = smokeEnd ?? end - 0.02
    const smokeTint = 'color-mix(in srgb, var(--sc-rocket) 30%, var(--scene-fill))'
    const flameGroup = (
        <g opacity={reduce ? 0 : undefined}>
            {!reduce && <animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes={`0;${ign};${ign + 0.012};${(breakAt ?? end) - 0.03};${breakAt ?? end};1`} dur={d} repeatCount="indefinite" />}
            <g>
                {!reduce && <animateTransform attributeName="transform" type="scale" values="1 0.3;1 0.3;1 0.8;1 1.15;1 1.15" keyTimes={`0;${ign};${lift};${lift + 0.05};1`} dur={d} repeatCount="indefinite" />}
                <path d="M-5.5 0 Q0 32 5.5 0 Z" {...WARM} opacity={0.92} className="scene-flicker" />
                <path d="M-2.8 0 Q0 16 2.8 0 Z" {...GLOW} className="scene-flicker" />
            </g>
        </g>
    )
    // where the rocket is when each stage is let go — the dropped parts are drawn there, in the scene's own space, and stay (see StagedDebris)
    const fairAt = stages ? (stages.fair ?? (stages.sep1 + stages.sep2) / 2) : 0
    const progressAt = (sec: number) => { const f = sec / dur; return f <= lift ? 0 : f >= end ? 1 : splineY(ease[0], ease[1], ease[2], ease[3], (f - lift) / (end - lift)) }
    const frames = useFlightFrames(stages && !reduce ? path : '', stages ? [stages.sep1 * dur, stages.sep2 * dur, fairAt * dur] : [],
        progressAt, p => s + (flightScale * s - s) * p, `${path}|${ease.join()}|${dur}|${lift}|${end}|${flightScale}|${s}|${stages?.sep1}|${stages?.sep2}|${fairAt}`)
    const art = (
        <g transform={`rotate(90) translate(0 ${ROCKET_H / 2})`}>
            {stages
                ? <StagedRocket dur={dur} ign={ign} lift={lift} sep1={stages.sep1} sep2={stages.sep2} fair={fairAt} still={reduce} debris={!!frames} burnOut={burnOut} />
                : breakAt !== undefined && !reduce
                    ? <BreakingRocket at={breakAt} span={breakSpan} dur={dur} flame={flameGroup} smoke={smokeTint} />
                    : <><Rocket flame={false} />{flameGroup}</>}
        </g>
    )
    // the whole flight fades out when it ends — or, if the rocket breaks up, once the pieces have gone
    const gone = goneAt ?? (stages ? end : breakAt !== undefined ? Math.min(0.99, breakAt + breakSpan) : end)
    return (
        <g>
            <LaunchTower x={x} y={y} s={s} />
            {/* smoke: blooms at ignition, rolls outward along the ground, thins out */}
            {!reduce && Array.from({ length: puffs }).map((_, i) => {
                const side = i % 2 ? 1 : -1
                const k = Math.floor(i / 2)
                const sx = x + side * (6 + k * 3) * s, sy = y - 6 * s
                const ex = x + side * (30 + k * 20) * s, ey = y - (14 + k * 7) * s
                const t0 = ign + k * 0.006
                return (
                    <g key={i} opacity={0}>
                        <animate attributeName="opacity" values="0;0;0.9;0.55;0;0" keyTimes={`0;${t0};${t0 + 0.02};${lift + 0.08};${sEnd};1`} dur={d} repeatCount="indefinite" />
                        <animateTransform attributeName="transform" type="translate" values={`${sx} ${sy};${sx} ${sy};${ex} ${ey};${ex + side * 10 * s} ${ey - 10 * s};${ex + side * 10 * s} ${ey - 10 * s}`} keyTimes={`0;${t0};${lift + 0.08};${sEnd};1`} dur={d} repeatCount="indefinite" />
                        <g>
                            <animateTransform attributeName="transform" type="scale" values="0.3;0.3;1;1.5;1.5" keyTimes={`0;${t0};${lift + 0.08};${sEnd};1`} dur={d} repeatCount="indefinite" />
                            <Cloud s={0.34 * s * (1 - k * 0.12)} tint={smokeTint} />
                        </g>
                    </g>
                )
            })}
            {/* the spent stages and their shards: BEHIND the rocket, left in space until the next cycle (the next stage's plume paints over them, never the reverse) */}
            {stages && !reduce && frames && (
                <StagedDebris part="stages" dur={dur} sep1={stages.sep1} sep2={stages.sep2} fair={fairAt} f1={frames[0]} f2={frames[1]} ff={frames[2]}
                              off0={stages.off0 ?? 0.94} off1={stages.off1 ?? 0.985} />
            )}
            {reduce ? (
                <g transform={`translate(${x} ${y0})`}><Rocket x={0} y={(ROCKET_H / 2) * s} s={s} flame={false} /></g>
            ) : (
                <g>
                    <animateMotion dur={d} repeatCount="indefinite" path={path} rotate="auto" calcMode="spline"
                                   keyPoints="0;0;1;1" keyTimes={`0;${lift};${end};1`} keySplines={spl} />
                    <g>
                        <animate attributeName="opacity" values="0;1;1;0;0" keyTimes={`0;0.02;${gone - fade};${gone};1`} dur={d} repeatCount="indefinite" />
                        <g>
                            <animateTransform attributeName="transform" type="scale" values={`${s};${s};${flightScale * s};${flightScale * s}`} keyTimes={`0;${lift};${end};1`} calcMode="spline" keySplines={spl} dur={d} repeatCount="indefinite" />
                            {art}
                        </g>
                    </g>
                </g>
            )}
            {/* the fairing halves: in FRONT of the rocket, so they still cover the capsule for the first instant as they swing away */}
            {stages && !reduce && frames && (
                <StagedDebris part="fairing" dur={dur} sep1={stages.sep1} sep2={stages.sep2} fair={fairAt} f1={frames[0]} f2={frames[1]} ff={frames[2]}
                              off0={stages.off0 ?? 0.94} off1={stages.off1 ?? 0.985} />
            )}
        </g>
    )
}

/* Hero mission clock (seconds). ONE cycle of 37 s: the board starts at T-3, lift-off (T+0) at 3 s, engines and smoke 1.2 s earlier. The rocket is heavy: it climbs slowly and
   gathers speed, so everything that happens in flight happens high above and far from the pad. Then, paced like a real flight (engine cut → coast → separation → pause → next
   ignition; the spent stage is shoved back and has dropped clear before the next plume blooms):
     T+7.7    stage 1's outer engines cut, T+8 the centre one (MECO); T+9 stage 1 is let go (retro-rockets, gas jets)
     T+10.6   stage 2 lights (its plume blooms over ~1.3 s)
     T+12.5   the fairing splits, the capsule is bare
     T+16.5   stage 2 cuts (SECO); T+17.5 it is let go; T+19.1 the last stage lights and cruises on, shrinking with distance
     T+24     it touches down on the planet (still moving: no hover, no crawl) and the planet goes up at that very instant: starburst, smoke, chunks of planet and its ring thrown in every direction, tumbling and drifting
     T+29.6   the pieces have faded; T+30.4 … T+31.9 the planet fades back in, whole, and the dropped stages fade (last second of the cycle) before the next countdown
   Everything let go keeps drifting where it was dropped until then. The countdown board is drawn on this same SMIL clock (see LaunchCountdown), so it can never drift from
   the rocket — not after the theme is toggled, not after the page was scrolled away and back (the playback hook restarts every SMIL element together). */
const LAUNCH_CYCLE = 37
const LAUNCH_ZERO = 3                       // lift-off: the rocket leaves the pad here, and the board reads T+0 (it opens on T-3)
const LAUNCH_IGNITION = LAUNCH_ZERO - 1.2   // engines light, smoke blooms
const LAUNCH_SEP1 = LAUNCH_ZERO + 9         // stage 1 is let go (its engines went out 1.0–1.3 s earlier)
const LAUNCH_FAIR = LAUNCH_SEP1 + 3.5       // the fairing splits ~1.9 s after stage 2 lit: early in its burn, as on a real flight, once the air is thin
const LAUNCH_SEP2 = LAUNCH_SEP1 + 8.5       // stage 2 burns longer than the fairing wait, as upper stages do
const LAUNCH_END = 27                       // touch-down
const LAUNCH_HIT = 27.08                    // the blast: the instant the capsule's tip touches (no pause between the two)
const LAUNCH_PIECES_GONE = 32.6             // the planet's pieces have faded
const LAUNCH_PLANET_BACK = [33.4, 34.9]     // the planet fades back in
const LAUNCH_DEBRIS_OFF = [35.5, 36.5]      // the dropped stages fade out over the last second of the cycle
const LAUNCH_EASE: [number, number, number, number] = [0.5, 0, 0.6, 0.75]   // slow start, long cruise, easing off — but still moving (~15 units/s) when it touches down, so the touch-down and the blast are one beat

/** the digital board: one frame per second of the launch cycle, each shown for exactly its own second (discrete SMIL, same `dur` as the rocket) */
function LaunchCountdown({ x, y, s, reduce }: { x: number; y: number; s: number; reduce: boolean }) {
    if (reduce) return <Countdown x={x} y={y} s={s} value={LAUNCH_ZERO} sign="-" pad={false} />
    return (
        <g>
            {Array.from({ length: LAUNCH_CYCLE }, (_, i) => {
                const before = i < LAUNCH_ZERO
                const a = i / LAUNCH_CYCLE, b = (i + 1) / LAUNCH_CYCLE
                const first = i === 0, last = i === LAUNCH_CYCLE - 1
                return (
                    <g key={i} opacity={first ? 1 : 0}>
                        <animate attributeName="opacity" calcMode="discrete" dur={`${LAUNCH_CYCLE}s`} repeatCount="indefinite"
                                 values={first ? '1;0' : last ? '0;1' : '0;1;0'} keyTimes={first ? `0;${b}` : last ? `0;${a}` : `0;${a};${b}`} />
                        <Countdown x={x} y={y} s={s} value={before ? LAUNCH_ZERO - i : i - LAUNCH_ZERO} sign={before ? '-' : '+'} pad={false} />
                    </g>
                )
            })}
        </g>
    )
}

function Focal() {
    const reduce = useReducedMotion()
    return (
        <svg className="scene-focal" viewBox="0 0 640 700" preserveAspectRatio="xMaxYMax meet">
            {/* ── NATURE: the climb ── */}
            <g className="scene-nature">
                <Sun x={505} y={150} s={0.8} />
                <Cloud x={226} y={158} s={1} drift />
                <Cloud x={330} y={300} s={0.7} o={0.85} drift driftClass="scene-cloud--b" />
                <Cloud x={600} y={344} s={0.5} o={0.75} drift />
                <Balloon x={118} y={108} s={0.62} />
                {/* two low, faded ridges either side of the summit: shoulders that frame it and stay well below its height */}
                <FramingRange />
                <g transform={GROUND_TO_FOCAL}><path d={FAR} className="sc-far" /><path d={FAR_TOP} {...L} strokeWidth={1.1} opacity={0.35} /></g>
                {/* the main mountain, with a level crown for the flag (the hiker brings it: see ClimbingHiker) */}
                <SummitPeak />
                {/* mist veils the foot of the mountains: low contrast, nothing readable sits here */}
                <MistBand x={30} y={566} w={430} h={22} o={0.36} />
                <MistBand x={250} y={596} w={380} h={18} o={0.26} />
                <g transform={GROUND_TO_FOCAL}><GroundFront /></g>
                <path className="scene-ribbon" d={TRAIL} opacity={0.85} />
                {/* cairns mark the way, shrinking as the trail climbs away from us */}
                {/* cairns sit ON the mountain face, clear of the trail (never on it, and above every animal and the mist): one set on its left, and a
                    second set on its right, each one at a height half-way between two of the left-hand cairns, so the way is marked from both sides */}
                <Cairn x={268} y={596} s={0.62} />
                <Cairn x={399} y={548} s={0.56} />
                <Cairn x={326} y={502} s={0.5} />
                <Cairn x={416} y={452} s={0.45} />
                <Cairn x={366} y={398} s={0.4} />
                <Cairn x={430} y={350} s={0.34} />
                <ClimbingHiker trail={TRAIL} reduce={reduce} />
                {/* what he says once the flag is in (see ClimbingHiker: 36 s loop; the flag goes in by 27.3 s, he cheers 27.7 – 29.5, then lowers his hand and stands
                    quietly to 33.6): "Peak perfection" while he cheers, a pause to take it in, then a second thought in the quiet */}
                <SpeechBubble x={409} y={254} shift={-44} lines={['Peak perfection']} timing={reduce ? undefined : { T: 36, on: 27.7, off: 29.7 }} />
                {!reduce && <SpeechBubble x={409} y={254} shift={-44} lines={['It’s so quiet up here.']} timing={{ T: 36, on: 30.9, off: 34.2 }} />}
                {/* Toph stands on the summit's second pad, a good way along the ridge from the flag: clear of the hiker, his flag and both his bubbles. She is drawn at the hiker's
                    summit scale (a little under 40 units tall), and her line comes early in the loop, while he is still on the trail, so the
                    two speeches never share the sky — and it is quiet when he arrives. */}
                <TophForm x={SUMMIT_PAD.x} y={SUMMIT_PAD.y} s={0.62} />
                <SpeechBubble x={SUMMIT_PAD.x} y={SUMMIT_PAD.y - 60 * 0.62 - 3} shift={34} lines={['I am not Toph.', 'I am Melon-Lord!', 'Muah-ha-ha-ha-ha!']} timing={reduce ? undefined : { T: 36, on: 3, off: 12.5 }} />

                {/* Appa flies in from the left, towards the sun: smaller and fainter as he goes, melting into its glow, then sets off again (as in Contacts).
                    Aang meditates on a rock at the far left, his staff leaning at his left (our right) and Momo on a smaller rock at his right (our left) —
                    all of them well left of the trail (it starts at x ≈ 206). */}
                <AppaHover x={70} y={300} s={0.55} tilt={-13} fly={{ to: [478, 166], s1: 0.2, dur: 14 }} />
                <MomoForm x={42} y={678} s={1.1} />
                <Rock x={42} y={694} s={1.3} />
                <MeditationRock x={118} y={694} s={1.25} />
                <AangMeditate x={118} y={664} s={1.25} animate={!reduce} />
                <Glider x={178} y={694} r={-5} s={1.1} />

                {/* foreground — the trees tower over the animals (a pine is ~2× a deer). The animals stand in one proportion (deer ≈ 1.7 × fox ≈ 1.6 × rabbit) as a trio the
                    width of the empty ground: the fox and the deer face each other across a patch of flowers (the butterfly above it), and the hare sits on the deer's far side,
                    turned in towards them. A second pair of flowers, the round tree and the pine fill out the right, so no stretch of the ground is bare now that Toph is up on
                    the summit. */}
                <Fern x={372} y={692} s={0.8} />
                <Mushrooms x={430} y={692} s={0.6} />
                <Flower x={494} y={690} s={0.75} />
                <Flower x={513} y={695} s={0.6} />
                <RoundTree x={548} y={692} s={1.0} />
                <Pine x={606} y={684} s={1.3} />
                <Bird x={330} y={130} s={0.95} />
                <Bird x={376} y={152} s={0.7} o={0.8} />
                <Bird x={250} y={96} s={0.8} o={0.8} />
            </g>

            {/* ── SPACE: the burn ── */}
            <g className="scene-space">
                <Aurora x={-40} y={30} w={720} h={110} />
                <Nebula x={390} y={120} w={420} h={200} />
                <Nebula x={150} y={430} w={380} h={170} />
                <Constellation x={300} y={26} {...CONST_A} o={0.9} />
                <BlastPlanet x={PLANET.x} y={PLANET.y} r={PLANET.r} tilt={PLANET.tilt} at={[LANDING[0] - PLANET.x, LANDING[1] - PLANET.y]} dur={LAUNCH_CYCLE}
                             hit={LAUNCH_HIT} gone={LAUNCH_PIECES_GONE} back0={LAUNCH_PLANET_BACK[0]} back1={LAUNCH_PLANET_BACK[1]} still={reduce} />
                {/* the comet: the original shooting-star comet, turned so it points at the name — head down and to the left, aimed diagonally at the \"C\"
                    that ends it (the heading's last letter is ~40 units left of the art's edge); the tail streams away up and to the right, all of it inside the art
                    (the sky above y = 0 is cropped) */}
                <Comet x={54} y={62} r={-170} len={92} />
                <Moon x={78} y={318} r={20} />
                <Moon x={562} y={592} r={9} />
                <Asteroid x={466} y={540} s={1.05} r={20} o={0.7} />
                <Asteroid x={514} y={512} s={0.6} r={-10} o={0.55} />
                <Sparkle x={70} y={226} s={1.1} delay={0.3} />
                <Sparkle x={556} y={352} s={0.9} delay={1.1} />
                <Sparkle x={246} y={250} s={0.8} delay={1.9} />
                <Sparkle x={572} y={120} s={0.8} delay={0.7} />
                <g transform={GROUND_TO_FOCAL}><GroundBack /><GroundFront /></g>
                <Crater x={452} y={676} w={60} />
                <Crater x={606} y={652} w={40} o={0.5} />
                <path className="scene-ribbon" d={TRAJ} opacity={0.85} />
                {/* the sky below the flight line, spread out: relay beacons, a station, a distant ringed world, moons and a loose belt of rocks, with the odd
                    shooting star — all well away from the rocket's line (and from the stages it drops) and from Harry's, far above */}
                <Nebula x={400} y={440} w={300} h={140} />
                <Planet x={592} y={478} r={13} ring tilt={14} />
                <Moon x={252} y={482} r={8} />
                <Moon x={632} y={372} r={6} />
                <Beacon x={292} y={408} s={0.6} delay={0.8} />
                <Beacon x={438} y={494} s={0.56} delay={1.6} />
                <Beacon x={606} y={326} s={0.5} delay={2.4} />
                <Satellite x={548} y={410} s={0.8} />
                <SpaceStation x={352} y={462} s={0.8} r={-10} />
                <Asteroid x={404} y={528} s={0.5} r={30} o={0.55} />
                <Asteroid x={574} y={556} s={0.5} r={-20} o={0.5} />
                <Asteroid x={330} y={540} s={0.45} r={12} o={0.5} />
                <Asteroid x={620} y={430} s={0.42} r={40} o={0.5} />
                <Sparkle x={300} y={366} s={0.8} delay={0.5} />
                <Sparkle x={452} y={432} s={0.7} delay={1.4} />
                <Sparkle x={604} y={520} s={0.8} delay={2.2} />
                <Sparkle x={226} y={410} s={0.7} delay={0.9} />
                <Sparkle x={500} y={470} s={0.6} delay={2.8} />
                <Meteor x={600} y={378} dx={-120} dy={52} dur={13} at={3.5} />
                <Meteor x={470} y={448} dx={-100} dy={42} dur={19} at={11} len={28} />
                {/* launch complex: the crew chief waves beside a digital countdown; pad + rocket + tower behind them */}
                <LaunchCountdown x={58} y={650} s={0.72} reduce={reduce} />
                <Astronaut x={108} y={648} s={0.7} />
                <Launch {...PAD} curve={TRAJ_CURVE} rise={PAD_RISE} flightScale={FLIGHT_SCALE} ease={LAUNCH_EASE} reduce={reduce} dur={LAUNCH_CYCLE}
                        ign={LAUNCH_IGNITION / LAUNCH_CYCLE} lift={LAUNCH_ZERO / LAUNCH_CYCLE} end={LAUNCH_END / LAUNCH_CYCLE} fade={0.04 / LAUNCH_CYCLE} goneAt={LAUNCH_HIT / LAUNCH_CYCLE} burnOut={LAUNCH_END / LAUNCH_CYCLE} smokeEnd={(LAUNCH_ZERO + 6) / LAUNCH_CYCLE}
                        stages={{ sep1: LAUNCH_SEP1 / LAUNCH_CYCLE, sep2: LAUNCH_SEP2 / LAUNCH_CYCLE, fair: LAUNCH_FAIR / LAUNCH_CYCLE,
                            off0: LAUNCH_DEBRIS_OFF[0] / LAUNCH_CYCLE, off1: LAUNCH_DEBRIS_OFF[1] / LAUNCH_CYCLE }} />
                {/* the surface crew: the rover rolling by (the saucer and its alien now wait by the flag, on the left of the hero band) */}
                <Rover x={548} y={670} s={1.25} />
                {/* Harry and Hedwig, from the About page, climb a diagonal across the upper sky: above the rocket's flight line the whole way, then over the planet
                    (the bubble stays upright) */}
                <HarryFlight x={-20} y={330} s={0.62} w={960} reach={1560} rotate={-21} reduce={reduce} say={HP_LINE} />
            </g>
        </svg>
    )
}

/* ───────────── About focal: an empty slot (same box as the hero's Focal — 640×700, bottom-right, 44cqw wide) ───────────── */
function AboutFocal() {
    const reduce = useReducedMotion()
    return (
        <svg className="scene-focal" viewBox="0 0 640 700" preserveAspectRatio="xMaxYMax meet">
            {/* The slot sits under the portrait (the photo column stops above it), so the flight crosses the open sky between the profile halo and the
                header ground: high enough to clear the range drawn in the band (peaks reach up to y ≈ 390 here), low enough to stay out of the top fade. */}
            <g className="scene-nature">
                <AppaFlight x={-10} y={150} s={0.84} />
            </g>
            <g className="scene-space">
                <Aurora x={-40} y={60} w={720} h={110} />
                <Nebula x={360} y={260} w={460} h={220} />
                <HarryFlight x={0} y={250} s={1} w={640} reduce={reduce} say={HP_LINE} sayFrom={250} layer="pair" />
            </g>
        </svg>
    )
}

/* The About page's speech bubble gets its own layer ABOVE the page text (the focal art sits behind the text, so a bubble drawn there would slide under the paragraphs).
   It is the same box and the same clock as AboutFocal, drawing only the bubble, so it rides along with Harry exactly. */
function AboutBubbleLayer() {
    const reduce = useReducedMotion()
    const ref = useRef<HTMLDivElement>(null)
    useScenePlayback(ref)
    return (
        <div ref={ref} className="scene scene--about-top" aria-hidden="true">
            <svg className="scene-focal" viewBox="0 0 640 700" preserveAspectRatio="xMaxYMax meet">
                <g className="scene-space">
                    <HarryFlight x={0} y={250} s={1} w={640} reduce={reduce} say={HP_LINE} sayFrom={250} layer="bubble" />
                </g>
            </svg>
        </div>
    )
}

/* ───────────── Public component ───────────── */
export default function PageScene({ variant = 'hero', bandOnly = false }: { variant?: Variant; bandOnly?: boolean }) {
    const topSky = variant === 'about' || variant === 'project'
    const rootRef = useRef<HTMLDivElement>(null)
    useScenePlayback(rootRef)   // pause off-screen; stop the hidden theme's SMIL (hiker / rocket)
    return (
        <>
            <div ref={rootRef} className={`scene scene--${variant}`} aria-hidden="true">
                {bandOnly ? null : topSky ? <TopSky variant={variant} /> : <Sky variant={variant} />}
                <Band variant={variant} />
                {/* Project header, Space: "A Family Matter" on the band's near ground, laid over the band's own 1440 × 190 box (the `band` layout: fixed, centred on x = 720,
                    which the Space band above leaves clear). Space-only: the overlay is display:none in Nature, where the Avatar party owns this stretch. */}
                {variant === 'project' && <DuelScene band />}
                {variant === 'hero' && <Focal />}
                {variant === 'about' && <AboutFocal />}
            </div>
            {variant === 'about' && <AboutBubbleLayer />}
        </>
    )
}