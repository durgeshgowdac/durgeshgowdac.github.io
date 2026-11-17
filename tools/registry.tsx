/**
 * THE ART REGISTRY: one manifest for every drawing the docs show.
 *
 *   PARTS      every illustration component, by name, with the world it lives in. Characters are not a separate list:
 *              a character is just a part that characters.json describes (docs/characters.md), so Aang is drawn once
 *              and appears in the parts library, the contact sheets and the character tables from the same file.
 *   SCENES     compositions photographed in a browser with the site's own stylesheet (strips, page backdrops).
 *   CUTAWAYS   tight, transparent crops of a scene's moving parts (rendered like parts, as baked SVG).
 *
 * Add a drawing here and it shows up in the next `tools/build.sh`: its SVG in both themes, its row in the group
 * sheet, its entry in illustrations.md. build_art.py fails if a part is registered but listed nowhere,
 * or if a scene a page uses has no entry.
 */
import { renderToStaticMarkup } from 'react-dom/server'
import { writeFileSync } from 'node:fs'
import * as I from '@/app/components/scenery/illustrations'
import { AppaSeamlessForm } from '@/app/components/scenery/avatarCast'
import AvatarCliffScene from '@/app/components/scenery/AvatarCliffScene'
import { Harry, Hedwig, Snitch, Quaffle, Bludger, Hoops, Bat, GREEN_LOOK } from '@/app/components/scenery/quidditch'
import { Ferret, Trophy, LionCrest, SnakeCrest } from '@/app/components/scenery/stadium'
import { NATURE, SPACE } from '@/app/components/CardElementMarks'
import AboutStripScene from '@/app/components/AboutStripScene'
import JourneyStrip from '@/app/components/JourneyStrip'
import PageScene from '@/app/components/PageScene'
import DuelScene from '@/app/components/DuelScene'
import HeroDuelStill from '@/app/components/HeroDuelStill'
import ProfileFlight from '@/app/components/ProfileFlight'
import HarryFlight from '@/app/components/HarryFlight'
import SpaceNotFoundScene from '@/app/components/SpaceNotFoundScene'

type Theme = 'light' | 'dark'

// ───────────────────────── parts ─────────────────────────
export type Group = {
  id: string; title: string; blurb: string
  /** the theme the group's characters live in (their canonical picture), and the themes its sheet is drawn in */
  home: Theme; sheets: Theme[]
  /** the 24 × 24 emblems, drawn on a fixed square instead of cropped to their bounds */
  marks?: boolean
  parts: Record<string, any>
}
const mark = (slug: string, M: any) => ['Mark' + slug.replace(/\s+/g, ''), M] as const
const markParts = (list: typeof NATURE) => Object.fromEntries(list.map(m => mark(m.name, m.Mark)))

export const GROUPS: Group[] = [
  { id: 'nature', title: 'The Nature world', blurb: 'Trees, critters and campsite things. The trail, drawn one outline at a time.', home: 'light', sheets: ['light', 'dark'],
    parts: Object.fromEntries(['Pine', 'RoundTree', 'Sun', 'Cloud', 'Bird', 'Butterfly', 'Firefly', 'Fox', 'FoxWalk', 'Rabbit', 'Deer', 'Owl', 'Mushrooms', 'Flower', 'FlowerClassic', 'Fern', 'Mountain', 'Peak', 'Cabin', 'Campfire', 'Tent', 'Signpost', 'Cairn', 'Hiker', 'Lantern', 'Balloon', 'KiteFlyers', 'CoconutPalm', 'Boulder', 'Rock', 'Volleyball', 'Net'].map(n => [n, (I as any)[n]])) },
  { id: 'space', title: 'The Space world', blurb: 'Rockets, rovers and rocks. Launch pad to the far side of the moon.', home: 'dark', sheets: ['dark', 'light'],
    parts: Object.fromEntries(['Planet', 'Moon', 'Sparkle', 'Comet', 'Asteroid', 'Crater', 'Rocket', 'LaunchTower', 'Lander', 'Astronaut', 'Alien', 'Ufo', 'Satellite', 'Dish', 'Rover', 'Flag', 'SpaceStation', 'Beacon', 'Countdown', 'Abduction', 'Aurora', 'Nebula'].map(n => [n, (I as any)[n]])) },
  { id: 'marks', title: 'Card and chapter marks', blurb: 'The small emblems that sit on cards and section headings.', home: 'light', sheets: ['light', 'dark'],
    parts: Object.fromEntries(['Binoculars', 'Medal', 'Backpack', 'MissionPatch', 'Hourglass', 'Stopwatch', 'Telescope'].map(n => [n, (I as any)[n]])) },
  { id: 'avatar', title: 'Avatar: The Last Airbender', blurb: 'Nature mode. Everyone is drawn from scratch and nobody is to scale.', home: 'light', sheets: ['light'],
    parts: Object.fromEntries(['Aang', 'AangGlide', 'AangMeditate', 'MeditationRock', 'AangAvatarState', 'Glider', 'Appa', 'Momo', 'MomoFly', 'Sokka', 'Boomerang', 'Katara', 'Toph', 'Zuko', 'Iroh', 'TeaTable'].map(n => [n, (I as any)[n]])
        .concat([['AppaSeamless', AppaSeamlessForm]])) },
  { id: 'pokemon', title: 'Pokémon', blurb: 'Nature mode. One trainer, one electric mouse, and a very large nap.', home: 'light', sheets: ['light'],
    parts: Object.fromEntries(['Ash', 'Pikachu', 'Ball', 'AshPack', 'Snorlax', 'Zzz'].map(n => [n, (I as any)[n]])) },
  { id: 'starwars', title: 'Star Wars', blurb: 'Space mode. A very polite duel and the ship that arrives for it.', home: 'dark', sheets: ['dark'],
    parts: { Luke: I.Luke, Vader: I.Vader, Grogu: I.Grogu, Falcon: I.Falcon } },
  { id: 'gravityfalls', title: 'Gravity Falls', blurb: 'Space mode. The cast of "Portal Under Pressure" and its woods.', home: 'dark', sheets: ['dark'],
    parts: Object.fromEntries(['Dipper', 'Mabel', 'Stan', 'Soos', 'Ford', 'BillCipher', 'UniversePortal', 'Console', 'MysteryShack', 'GfGnome', 'GfMushroom', 'GfEye', 'GfBoulder', 'GfLamp'].map(n => [n, (I as any)[n]])) },
  { id: 'harrypotter', title: 'Harry Potter', blurb: 'Space mode. A Seeker, an owl, a ferret and a very small, very fast ball.', home: 'dark', sheets: ['dark'],
    parts: { Harry, Draco: (p: any) => <Harry look={GREEN_LOOK} {...p} />, Hedwig, Snitch, Ferret, Quaffle, Bludger, Hoops, Bat, Trophy, LionCrest, SnakeCrest } },
  { id: 'elements', title: 'Element marks', blurb: 'The four-emblem row on every hackathon card, in Nature (the four elements) and Space (the Star Wars factions).', home: 'light', sheets: ['light', 'dark'], marks: true,
    parts: { ...markParts(NATURE), ...markParts(SPACE) } },
]

// A part's home theme: Nature groups live in the day palette, Space groups in the night palette (the Star Wars factions are Space, whatever group holds them).
export const homeOf = (g: Group, id: string): Theme => (g.id === 'elements' ? (SPACE.some(m => 'Mark' + m.name.replace(/\s+/g, '') === id) ? 'dark' : 'light') : g.home)

// ───────────────────────── cutaways ─────────────────────────
// Tight crops, transparent. `view` fixes the frame where a scene is a whole picture rather than a cluster of figures.
export const CUTAWAYS = [
  { id: 'avatar-group', theme: 'light' as Theme, title: 'The Avatar group portrait', where: 'Appa flight scene (About, Contact, project header)',
    blurb: 'Appa, Toph, Sokka, Katara and Aang, with Momo up in the saddle. Nobody is panicking.', el: <AvatarCliffScene /> },
  { id: 'harry-flight', theme: 'dark' as Theme, title: 'Harry and Hedwig', where: 'Space flight scene (hero, About profile)',
    blurb: 'Same angle as Appa, different mode of transport.', el: <HarryFlight reduce w={640} say={['To the skies, Hedwig.']} /> },
  { id: 'duel-still', theme: 'dark' as Theme, title: 'The duel, paused', where: 'Contact section (Space)',
    blurb: 'Luke, Vader and Grogu in one calm frame. The real thing moves.',
    el: <g><g transform="translate(-86 0)"><I.Grogu s={1.1} /></g><g transform="translate(40 0)"><HeroDuelStill k={1} /></g></g> },
  { id: 'space-404', theme: 'dark' as Theme, title: 'The Space 404', where: '404 page (Space)',
    blurb: 'Wrong galaxy. Wrong school.', view: [0, 0, 320, 170] as [number, number, number, number], el: <SpaceNotFoundScene /> },
]

// ───────────────────────── scenes ─────────────────────────
// Each renders once per theme it lives in (light = Nature, dark = Space) in a box of the size the site gives it.
// bg 'strip' keeps the strip's own sky gradient (.card-art, scenery-postcards.css); 'page' paints the page background behind a full-width backdrop.
type Scene = { id: string; title: string; blurb: string; where: string; themes: Theme[]; w: number; h: number; bg: 'strip' | 'page'; el: any; shot: string }
const strip = (kind: 'catch' | 'sky' | 'sports' | 'hackathons') => <AboutStripScene kind={kind} wide />
const page = (children: any, h: number) => <div style={{ position: 'relative', width: 1440, height: h }}>{children}</div>
const BOTH: Theme[] = ['light', 'dark']

export const SCENES: Scene[] = [
  { id: 'about-catch', title: 'Chapter 01: The Catch', where: 'About, Chapter 01 header', themes: BOTH, w: 780, h: 150, bg: 'strip', shot: '.card-art', el: strip('catch'),
    blurb: 'Nature: Ash walks up to a very large, very asleep Snorlax and throws the ball. Space: Harry chases the Snitch over a far-off Quidditch match.' },
  { id: 'about-inspiration', title: 'Inspiration', where: 'About, Inspiration section', themes: BOTH, w: 780, h: 150, bg: 'strip', shot: '.card-art', el: strip('sky'),
    blurb: 'Eight inspirations as eight stars, joined like a real asterism. Nature: fireflies over the hills. Space: a lunar ridge, a lander and a flag.' },
  { id: 'about-hackathons', title: 'Building Under Pressure', where: 'About, Hackathons section; project pages (hackathon projects)', themes: BOTH, w: 780, h: 150, bg: 'strip', shot: '.card-art', el: strip('hackathons'),
    blurb: 'The hackathon strip. Space is the "Portal Under Pressure" scene from Gravity Falls.' },
  { id: 'about-sports', title: 'Sports & Athleticism', where: 'About, Sports section', themes: BOTH, w: 780, h: 150, bg: 'strip', shot: '.card-art', el: strip('sports'),
    blurb: 'Volleyball, a Taekwondo board break and a cricket shot that ends badly for the Sun (Nature) or the Moon (Space).' },
  { id: 'home-journey', title: 'The journey strip', where: 'Home, Journey section', themes: BOTH, w: 780, h: 150, bg: 'strip', shot: '.card-art', el: <div className="card-art card-art--journey"><JourneyStrip /></div>,
    blurb: 'The Trail by day, the Trajectory by night.' },
  { id: 'page-hero', title: 'The hero', where: 'Home, top of the page', themes: BOTH, w: 1440, h: 800, bg: 'page', shot: '.scene', el: page(<PageScene />, 800),
    blurb: 'Nature: Aang on his rock, Appa flying into the sun, a summit with Toph. Space: the same ground, from launch pad to the far side of the moon.' },
  { id: 'page-about', title: 'The About backdrop', where: 'About, top of the page', themes: BOTH, w: 1440, h: 760, bg: 'page', shot: '.scene', el: page(<PageScene variant="about" />, 760),
    blurb: 'A top sky under the header, a ground band and the About focal scene.' },
  { id: 'page-project', title: 'The project backdrop', where: 'Project pages, top of the page', themes: BOTH, w: 1440, h: 420, bg: 'page', shot: '.scene', el: page(<PageScene variant="project" />, 420),
    blurb: 'A quiet sky and a short ground for the case-study pages.' },
  { id: 'page-contact', title: 'The Contact scene', where: 'Home and About, Contact section', themes: BOTH, w: 1440, h: 600, bg: 'page', shot: '.contact-wrap',
    el: <div className="contact-wrap" style={{ position: 'relative', width: 1440, height: 600 }}><PageScene variant="contact" /><DuelScene /></div>,
    blurb: 'Nature: the Avatar gang and the boomerang gag. Space: the lunar ground with the Star Wars duel on it.' },
  { id: 'about-profile-flight', title: 'The profile flight', where: 'About, around the profile photo', themes: BOTH, w: 860, h: 200, bg: 'page', shot: '.pfw',
    el: <div className="pfw" style={{ width: 860, height: 200 }}><style>{'.pfw .profile-flight{display:block;width:860px;height:200px;margin:0;color:var(--sc-line)}'}</style><ProfileFlight /></div>,
    blurb: 'Appa and Harry take turns crossing the profile photo.' },
]

// ───────────────────────── write the build file ─────────────────────────
const out: any = { groups: [], cutaways: [], scenes: SCENES.map(({ el, ...m }) => m), renders: [] }
for (const g of GROUPS) {
  const parts: any[] = []
  for (const [id, C] of Object.entries(g.parts)) {
    const home = homeOf(g, id)
    for (const theme of ['light', 'dark'] as Theme[]) {
      try { parts.push({ id, theme, home: theme === home, svg: renderToStaticMarkup(<C />) }) }
      catch (e: any) { console.error('FAIL part', g.id, id, theme, String(e.message).slice(0, 160)) }
    }
  }
  out.groups.push({ id: g.id, title: g.title, blurb: g.blurb, home: g.home, sheets: g.sheets, marks: !!g.marks, ids: Object.keys(g.parts), parts })
}
for (const c of CUTAWAYS) {
  try { out.cutaways.push({ id: c.id, theme: c.theme, title: c.title, where: c.where, blurb: c.blurb, view: (c as any).view ?? null, svg: renderToStaticMarkup(c.el) }) }
  catch (e: any) { console.error('FAIL cutaway', c.id, String(e.message).slice(0, 160)) }
}
for (const s of SCENES) for (const theme of s.themes) {
  try { out.renders.push({ id: s.id, theme, w: s.w, h: s.h, bg: s.bg, shot: s.shot, svg: renderToStaticMarkup(s.el) }) }
  catch (e: any) { console.error('FAIL scene', s.id, theme, String(e.message).slice(0, 160)) }
}
writeFileSync(process.env.OUT_JSON!, JSON.stringify(out))
const np = out.groups.reduce((n: number, g: any) => n + g.parts.length, 0)
console.log(`rendered ${np / 2} parts x2 themes, ${out.cutaways.length} cutaways, ${out.renders.length} scene renders`)