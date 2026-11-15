/** Momo and Aang in flight (side views used by the Appa flight scene). */
import { Aang, Glider } from './avatar'
import { AV_MOMO, AV_MOMO_BELLY, AV_MOMO_WING } from './avatarPalette'
import { DOT, F, L, Limb, P, type PlaceProps } from './core'

/* ── Momo in flight, side view (facing right). A bat wing is an arm (shoulder → wrist) plus four long fingers carrying the membrane
            back to the hip. On a downstroke the arm drives down and forward while the hand LAGS behind it (fingers trailing up), then the
            arm lifts and the hand follows through: that lag is what reads as a bat rather than a flap of cloth. Each frame is the same path
            with new joint positions, so SMIL can morph one path through the whole beat. ── */
const MF_TAU = Math.PI * 2
const MF_N = 16
function momoWing(t: number, far = false) {
    const a = ((25 + 90 * Math.cos(MF_TAU * t)) * Math.PI) / 180            // arm direction: 0 forward, 90 up, 180 back
    const b = ((40 + 80 * Math.cos(MF_TAU * (t - 0.14))) * Math.PI) / 180   // hand direction, a beat behind the arm
    const S: [number, number] = far ? [2.6, -5] : [4, -4]
    const H: [number, number] = far ? [-7, 2] : [-9, 3]
    const La = far ? 14 : 15.5
    const W: [number, number] = [S[0] + La * Math.cos(a), S[1] - La * Math.sin(a)]
    const tip = (len: number, dd: number): [number, number] => [W[0] + len * Math.cos(b + (dd * Math.PI) / 180), W[1] - len * Math.sin(b + (dd * Math.PI) / 180)]
    const T = [tip(22, 30), tip(25, 6), tip(21.5, -18), tip(16, -42)]
    const g = (q: [number, number]) => `${q[0].toFixed(1)} ${q[1].toFixed(1)}`
    const sc = (P: [number, number], Q: [number, number]) => g([(P[0] + Q[0]) / 2 + (W[0] - (P[0] + Q[0]) / 2) * 0.42, (P[1] + Q[1]) / 2 + (W[1] - (P[1] + Q[1]) / 2) * 0.42])
    return {
        mem: `M${g(S)} L${g(W)} L${g(T[0])} Q${sc(T[0], T[1])} ${g(T[1])} Q${sc(T[1], T[2])} ${g(T[2])} Q${sc(T[2], T[3])} ${g(T[3])} Q${sc(T[3], H)} ${g(H)} Z`,
        bones: `M${g(W)} L${g(T[0])} M${g(W)} L${g(T[1])} M${g(W)} L${g(T[2])} M${g(W)} L${g(T[3])}`,
        arm: `M${g(S)} L${g(W)} L${g(T[0])}`,
    }
}
const MF_NEAR = Array.from({ length: MF_N + 1 }, (_, i) => momoWing(i / MF_N))
const MF_FAR = Array.from({ length: MF_N + 1 }, (_, i) => momoWing(i / MF_N, true))
const AV_MOMO_WING_D = 'color-mix(in srgb, var(--sc-trunk) 22%, var(--sc-body))'

/** Momo flying, side view facing right, centred on the origin (about 50 long with the tail, ears and wings up to 28 above). Big ear swept
 *  back, green eye, hind feet trailing, ringed tail streaming behind. Pass `flapDur` (seconds per wingbeat) to flap it on the scene's
 *  SMIL clock (choose the loop length ÷ a whole number so the beat lines up with the loop); without it Momo holds the pose `pose`
 *  (0 = wings up … 0.5 = wings down), the reduced-motion frame. */
export function MomoFly({ flapDur, pose = 0.1, ...p }: PlaceProps & { flapDur?: number; pose?: number }) {
    const anim = flapDur !== undefined
    const dur = `${flapDur}s`
    const wing = (set: typeof MF_NEAR, fill: string, far: boolean) => {
        const cur = momoWing(pose, far)
        const am = (k: 'mem' | 'bones' | 'arm') => anim && <animate attributeName="d" values={set.map(fr => fr[k]).join(';')} dur={dur} repeatCount="indefinite" />
        return (
            <g>
                <path d={cur.mem} {...F} fill={fill} strokeWidth={1.1}>{am('mem')}</path>
                <path d={cur.bones} {...L} strokeWidth={0.8} opacity={0.55}>{am('bones')}</path>
                <path d={cur.arm} {...L} strokeWidth={1.6}>{am('arm')}</path>
            </g>
        )
    }
    return (
        <P {...p}>
            <g>
                {anim && <animateTransform attributeName="transform" type="translate" values="0 1.4;0 0;0 -1.4;0 0;0 1.4" dur={dur} repeatCount="indefinite" />}
                {wing(MF_FAR, AV_MOMO_WING_D, true)}
                {/* ringed tail streaming back, hind feet trailing */}
                <Limb d="M-9 2 C-20 7 -29 1 -35 -8" w={5.6} fill={AV_MOMO} />
                <path d="M-22 4.4 l1.4 -3 M-28 1.2 l1.8 -2.6 M-33 -4 l2 -2.2" {...L} strokeWidth={0.9} opacity={0.5} />
                <Limb d="M-5 4.4 L-7.4 9.6" w={2.9} fill={AV_MOMO} />
                <Limb d="M-1.4 5.2 L-2.2 10.6" w={2.9} fill={AV_MOMO} />
                {/* far ear, body, belly */}
                <path d="M12.6 -9 C11 -16 15 -23 20 -24.4 C19.6 -18 17.8 -13 15.8 -9 Z" {...F} fill={AV_MOMO_WING_D} strokeWidth={1.1} />
                <ellipse cx={0} cy={0} rx={10.4} ry={5.8} transform="rotate(-6)" {...F} fill={AV_MOMO} />
                <ellipse cx={0.6} cy={2.4} rx={6.4} ry={2.6} transform="rotate(-6)" fill={AV_MOMO_BELLY} stroke="none" />
                {wing(MF_NEAR, AV_MOMO_WING, false)}
                {/* head: near ear swept back, face, eye, nose */}
                <circle cx={12} cy={-5} r={5.4} {...F} fill={AV_MOMO} />
                <path d="M9.4 -8.4 C4.2 -13.6 4 -22 8.6 -26 C11.6 -21 13 -14 12.2 -8.2 Z" {...F} fill={AV_MOMO} strokeWidth={1.2} />
                <path d="M9.6 -10 C6.6 -14 6.8 -19.6 9 -22.4 C10.6 -19 11.2 -14.6 10.8 -10 Z" fill="var(--sc-accent)" opacity={0.45} stroke="none" />
                <ellipse cx={14.8} cy={-3.4} rx={3.3} ry={2.6} fill={AV_MOMO_BELLY} stroke="none" />
                <circle cx={13.8} cy={-6.2} r={1.9} fill="var(--sc-alien)" stroke="currentColor" strokeWidth={0.8} />
                <circle cx={14.2} cy={-6.2} r={0.8} {...DOT} />
                <ellipse cx={17.4} cy={-3.7} rx={0.9} ry={0.75} {...DOT} />
                <path d="M14.4 -1.4 Q16 -0.6 17.2 -1.6" {...L} strokeWidth={0.7} />
            </g>
        </P>
    )
}

/** Aang gliding as on the card art: hanging from the open glider's spar, fists wide apart, legs trailing, the whole figure and glider
 *  tilted `tilt`° (clockwise, so he climbs toward the upper right; 0 = hanging straight). Base (his feet) at the origin; the glider is
 *  120 wide, about twice his height. */
export function AangGlide({ tilt = 31, ...p }: PlaceProps & { tilt?: number }) {
    return (
        <P {...p}>
            <g transform={`rotate(${tilt})`}>
                <Glider open />
                <Aang fly staff={false} />
            </g>
        </P>
    )
}
