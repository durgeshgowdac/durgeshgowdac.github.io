import { renderToStaticMarkup } from 'react-dom/server'
import { writeFileSync } from 'node:fs'
import * as I from '@/app/components/scenery/illustrations'
import { AangForm, SokkaForm, KataraForm, TophStanceForm, MomoForm, AppaSeamlessForm } from '@/app/components/scenery/avatarCast'
import { Harry, Hedwig, Snitch, GREEN_LOOK } from '@/app/components/scenery/quidditch'
import { Ferret } from '@/app/components/scenery/stadium'
import { NATURE, SPACE } from '@/app/components/CardElementMarks'

type Item = { theme: 'light' | 'dark'; el: any; marks?: boolean }
const slug = (s: string) => 'mark-' + s.toLowerCase().replace(/\s+/g, '-')
const items: Record<string, Item> = {
  aang: { theme: 'light', el: <AangForm /> }, katara: { theme: 'light', el: <KataraForm /> }, sokka: { theme: 'light', el: <SokkaForm /> },
  toph: { theme: 'light', el: <TophStanceForm /> }, zuko: { theme: 'light', el: <I.Zuko /> }, iroh: { theme: 'light', el: <I.Iroh /> },
  momo: { theme: 'light', el: <MomoForm /> }, appa: { theme: 'light', el: <AppaSeamlessForm /> },
  ash: { theme: 'light', el: <I.Ash /> }, pikachu: { theme: 'light', el: <I.Pikachu /> }, snorlax: { theme: 'light', el: <I.Snorlax /> }, pokeball: { theme: 'light', el: <I.Ball /> },
  hiker: { theme: 'light', el: <I.Hiker /> }, fox: { theme: 'light', el: <I.Fox /> }, deer: { theme: 'light', el: <I.Deer /> }, rabbit: { theme: 'light', el: <I.Rabbit /> }, owl: { theme: 'light', el: <I.Owl /> },
  dipper: { theme: 'dark', el: <I.Dipper /> }, mabel: { theme: 'dark', el: <I.Mabel /> }, stan: { theme: 'dark', el: <I.Stan /> }, soos: { theme: 'dark', el: <I.Soos /> },
  ford: { theme: 'dark', el: <I.Ford /> }, bill: { theme: 'dark', el: <I.BillCipher /> }, gnome: { theme: 'dark', el: <I.GfGnome /> },
  luke: { theme: 'dark', el: <I.Luke /> }, vader: { theme: 'dark', el: <I.Vader /> }, grogu: { theme: 'dark', el: <I.Grogu /> }, falcon: { theme: 'dark', el: <I.Falcon /> },
  harry: { theme: 'dark', el: <Harry /> }, draco: { theme: 'dark', el: <Harry look={GREEN_LOOK} /> }, hedwig: { theme: 'dark', el: <Hedwig /> }, snitch: { theme: 'dark', el: <Snitch /> }, ferret: { theme: 'dark', el: <Ferret /> },
  astronaut: { theme: 'dark', el: <I.Astronaut /> }, alien: { theme: 'dark', el: <I.Alien /> }, ufo: { theme: 'dark', el: <I.Ufo /> }, rover: { theme: 'dark', el: <I.Rover /> },
  rocket: { theme: 'dark', el: <I.Rocket /> }, satellite: { theme: 'dark', el: <I.Satellite /> }, comet: { theme: 'dark', el: <I.Comet /> },
}
for (const m of NATURE) items[slug(m.name)] = { theme: 'light', el: <m.Mark />, marks: true }
for (const m of SPACE) items[slug(m.name)] = { theme: 'dark', el: <m.Mark />, marks: true }

const out: Record<string, { theme: string; svg: string; marks: boolean }> = {}
for (const [k, v] of Object.entries(items)) {
  try { out[k] = { theme: v.theme, marks: !!v.marks, svg: renderToStaticMarkup(v.el) } }
  catch (e: any) { console.error('FAIL', k, String(e.message).slice(0, 160)) }
}
writeFileSync(process.env.OUT_JSON!, JSON.stringify(out))
console.log('rendered', Object.keys(out).length, 'of', Object.keys(items).length)
