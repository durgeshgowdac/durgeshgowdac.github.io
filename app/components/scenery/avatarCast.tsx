import type { ComponentType, ReactNode } from 'react'
import { Aang, AangGlide, Appa, Katara, Momo, MomoFly, Sokka, Toph } from './illustrations'

/**
 * The Avatar cast, as reusable character forms: the final version of each character that appears in Scene A, nothing more.
 *
 *   Aang · Sokka · Katara · Toph · Momo  → drawn FACING FORWARD (front view), base (feet) at the origin
 *   Appa                                 → drawn from the SIDE, facing right, base (feet) at the origin
 *
 * Every form takes the same placement props as the rest of the library: x, y, s (scale), flip, o (opacity). They keep their own pose
 * options, and a form can be reused in any scene without redrawing it. Colours are theme tokens; line weights are set by the scene
 * (add the `fx-uniform` class to a group to draw every character in it at one line weight whatever its scale, as Scene A does).
 *
 * SCALE: people and Momo are drawn together at `CAST_SCALE.person`, Appa at `CAST_SCALE.appa` (twice that), which is what keeps
 * Appa's body about one and a half times a rider's height and Momo about the size of a rider's torso.
 */
export type CastProps = { x?: number; y?: number; s?: number; flip?: boolean; o?: number }

/** Aang, front view, with his closed glider staff in his right hand (our right). Pose: `staff={false}` for empty hands. */
export const AangForm = (p: CastProps & { staff?: boolean; raise?: boolean; staffWrap?: (staff: ReactNode) => ReactNode }) => <Aang {...p} />
/** Aang gliding as on the card art, front view hanging from the open glider (see AangGlide). */
export const AangGlideForm = (p: CastProps & { tilt?: number }) => <AangGlide {...p} />
/** Sokka, front view, boomerang in his RIGHT hand (our left, since he faces us). `hand="left"` swaps it for another pose. */
export const SokkaForm = (p: CastProps & { boomerang?: boolean; hand?: 'right' | 'left'; boomerangS?: number; gripTip?: boolean; boomerangRot?: ReactNode; armFx?: ReactNode; wristFx?: ReactNode; boomerangFx?: ReactNode }) => <Sokka boomerang hand="right" {...p} />
/** Katara, front view, hands at her sides. `steer` raises her front hand to hold reins. */
export const KataraForm = (p: CastProps & { steer?: boolean }) => <Katara {...p} />
/** Toph, front view, in her planted stance with a fist in her palm. */
export const TophForm = (p: CastProps & { cheer?: boolean }) => <Toph {...p} />
/** Momo, front view, perched with wings raised. `flap` / `wingAnim` animate the wings (see Momo). */
export const MomoForm = (p: CastProps & { flap?: boolean }) => <Momo {...p} />
/** Momo in flight, side view facing right, with the bat wing beat (`flapDur` seconds per beat; omit for the still pose). */
export const MomoFlyForm = (p: CastProps & { flapDur?: number; pose?: number }) => <MomoFly {...p} />
/** Appa, SIDE view facing right, saddled. Add riders as children, `reins` for the harness, `swish`/`tailAnim` for the tail. */
export const AppaForm = (p: CastProps & { swish?: boolean; saddle?: boolean; seamless?: boolean; reins?: [number, number]; tailAnim?: ReactNode; children?: ReactNode }) => <Appa {...p} />

/** Appa as in the flight scene: the original marking (a separate arrow on the head, back and tail), tail free to swish. */
export const AppaClassicForm = (p: Parameters<typeof AppaForm>[0]) => <AppaForm {...p} seamless={false} />
/** Appa as in the group portrait: ONE tapered arrow from the tail tip to the forehead (no swishing tail). */
export const AppaSeamlessForm = (p: Parameters<typeof AppaForm>[0]) => <AppaForm {...p} seamless />
/** Toph in her planted stance, fist in palm (the original pose). */
export const TophStanceForm = (p: CastProps) => <TophForm {...p} cheer={false} />
/** Toph cheering, both arms raised (the group portrait). */
export const TophCheerForm = (p: CastProps) => <TophForm {...p} cheer />
/** Aang holding his closed glider straight up (the group portrait). */
export const AangRaiseForm = (p: CastProps) => <AangForm {...p} raise />

export type CastId = 'aang' | 'sokka' | 'katara' | 'toph' | 'momo' | 'appa'
export type CastEntry = {
  name: string
  view: 'front' | 'side'
  /** height at s = 1, in the library's units (feet at 0) */
  height: number
  /** the form to draw; `poses` lists the alternatives */
  Form: ComponentType<any>
  poses: Record<string, ComponentType<any>>
  note: string
}

export const CAST: Record<CastId, CastEntry> = {
  aang: { name: 'Aang', view: 'front', height: 57, Form: AangForm, poses: { staff: AangForm, raise: AangRaiseForm, glide: AangGlideForm }, note: 'bald, blue arrows (pointing down) on forehead, hands and feet; yellow and orange Air Nomad clothes; glider staff' },
  sokka: { name: 'Sokka', view: 'front', height: 77, Form: SokkaForm, poses: { boomerang: SokkaForm }, note: 'Water Tribe blue, wolf-tail ponytail, boomerang in his right hand' },
  katara: { name: 'Katara', view: 'front', height: 69, Form: KataraForm, poses: { rest: KataraForm, steer: (p: CastProps) => <KataraForm steer {...p} /> }, note: 'Water Tribe blue, hair loops, braid and necklace' },
  toph: { name: 'Toph', view: 'front', height: 60, Form: TophForm, poses: { stance: TophStanceForm, cheer: TophCheerForm }, note: 'green earthbender tunic, hair bun with headband, bare feet, fist in palm' },
  momo: { name: 'Momo', view: 'front', height: 32, Form: MomoForm, poses: { perched: MomoForm, flying: MomoFlyForm }, note: 'winged lemur: big ears, green eyes, raised bat wings' },
  appa: { name: 'Appa', view: 'side', height: 87, Form: AppaForm, poses: { classic: AppaClassicForm, seamless: AppaSeamlessForm }, note: 'shaggy white sky bison, six legs, one brown arrow from head to tail, a horn each side of it' },
}
/** the one scale rule every Avatar scene follows: people and Momo at `person`, Appa at `appa` */
export const CAST_SCALE = { person: 0.45, appa: 0.9 } as const
