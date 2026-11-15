/**
 * ILLUSTRATION LIBRARY — the one shared set of hand-drawn SVG parts behind every scene on the site
 * (hero, About strips, journey strip, contact bands, 404, card marks, project-section marks).
 *
 * House style (so a fox and a rocket look like they were drawn by the same hand):
 *   • ink outline      currentColor, round caps/joins, ~1.3–1.4 px  (the parent <svg> sets color: var(--sc-line))
 *   • flat tinted fill from the existing theme tokens — never a hard-coded colour
 *       --sc-tree / --sc-trunk / --sc-mid …   foliage, wood, ground
 *       --scene-fill                           "paper": the pale body colour that hides lines behind a shape
 *       --scene-warm / --scene-glow            the one warm accent (flame, lamp, sun, windows)
 *       --sc-alien / --sc-glass                alien skin / visors
 *   • light-and-shade   one soft shade facet (--sc-shade) per big shape, nothing more
 *
 * Every part is drawn with its BASE (feet / trunk / launch point) at the local origin and grows up into
 * negative y, so a scene places it on a ground line with one translate. Floating things (planets,
 * comets, balloons) are centred on the origin.
 *
 * Every part takes the same placement props (x, y, s, r, flip, o, className, style).
 */
export { Pine, RoundTree, Sun, Cloud, Bird, Butterfly, Fox, FoxWalk, Rabbit, Deer, Owl, Mushrooms, Flower, FlowerClassic, Fern, Mountain, Cabin, Campfire, Tent, Signpost, Firefly } from './nature'
export { Planet, Moon, Sparkle, Rocket, Astronaut, Alien, Ufo, Satellite, Dish, Rover, Flag, Comet, Asteroid, Constellation, Crater, LaunchTower } from './space'
export { Binoculars, Medal, Backpack, MissionPatch, Hourglass, Stopwatch, Telescope } from './cardMarks'
export { Hiker, Lander, Stars, Volleyball, Net } from './miscParts'
export { Cairn, MistBand, Balloon, Lantern, Beacon, Aurora, Nebula, LimbGlow, Peak, Abduction, KiteFlyers, Countdown } from './scenery'
export { CoconutPalm, CoconutBreak } from './coconutBreak'
export { BALL_RED, BALL_RED_DK, BALL_RED_LT, ASH_BODY, Ash, ashGrip, Pikachu, Ball } from './ash'
export type { AshAnim, AshPose } from './ash'
export { Zzz, Snorlax, Boulder, AshPack, Rock } from './snorlax'
export { Glider, Aang, Boomerang, Sokka, Katara, Momo, Toph } from './avatar'
export { AangMeditate, MeditationRock } from './meditate'
export { Appa } from './appa'
export { Bubble } from './bubble'
export { MomoFly, AangGlide } from './momoFlight'
export { L, F, DOT, WARM, GLOW, P } from './core'
export { Luke, Vader, Grogu } from './starwars'
export type { RotAnim, SaberAnim, DuelAnim, GroguAnim } from './starwars'
export { BreakingRocket, StagedRocket, StagedDebris } from './rocketBreak'
export { BlastPlanet } from './planetBlast'
export { SpaceStation, Meteor } from './spaceExtras'
export { Zuko, Iroh, TeaTable, ZK_RED } from './fireNation'
export { AangAvatarState } from './avatarState'
export { Falcon } from './galaxy'
export { Dipper, Mabel, Stan, Soos, Ford, BillCipher, UniversePortal, Console, MysteryShack, GfGnome, GfMushroom, GfEye, gfScale, GfForest, GfMist, GfBoulder, GfGrass, GfLamp, PORTAL_CY, PORTAL_GLYPHS } from './gravityFalls'