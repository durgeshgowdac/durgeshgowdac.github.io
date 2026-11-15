/** Aang in the Avatar State: lifted off the ground, upright, arms eased out and down, eyes and arrows blazing white. Nature world only. */
import { AV_ARROW, AV_ORANGE, AV_SKIN, AV_YELLOW } from './avatarPalette'
import { F, L, Limb, P, SHADE, type PlaceProps } from './core'

/** the white-blue the eyes and arrows blaze with (the glass token pushed towards white) and the soft blue of their halos */
const LIT = 'color-mix(in srgb, var(--sc-glass) 40%, var(--sc-snow))'
const HALO = 'color-mix(in srgb, var(--sc-panel) 76%, var(--sc-glass))'

/**
 * Feet at the origin (he is floating, so the scene lifts him), ~57 tall like the standing Aang: legs together with toes pointed down,
 * the yellow tunic and orange sash as ever, arms eased out and down at about 35°, head tipped slightly back; his eyes are blank white
 * discs in blue halos and every arrow (brow, hands, feet) is lit. The scene adds the pillar of light and the wind around him.
 */
export function AangAvatarState(p: PlaceProps) {
    const hand = (cx: number, cy: number) => (
        <>
            <circle cx={cx} cy={cy} r={6} fill={HALO} stroke="none" opacity={0.3} />
            <circle cx={cx} cy={cy} r={2.2} {...F} fill={AV_SKIN} strokeWidth={1.1} />
            <path d={`M${cx} ${cy + 1.5} l-1 -1.9 h2 Z`} fill={LIT} stroke="var(--sc-snow)" strokeWidth={0.4} />
        </>
    )
    return (
        <P {...p}>
            <Limb d="M-3 -18 L-2.4 -5.4" w={6.6} fill={AV_ORANGE} />
            <Limb d="M3 -18 L2.4 -5.4" w={6.6} fill={AV_ORANGE} />
            <ellipse cx={-2.4} cy={-2.4} rx={2.6} ry={3.4} {...F} fill={AV_SKIN} strokeWidth={1.1} />
            <ellipse cx={2.4} cy={-2.4} rx={2.6} ry={3.4} {...F} fill={AV_SKIN} strokeWidth={1.1} />
            <circle cx={-2.4} cy={-1} r={4.4} fill={HALO} stroke="none" opacity={0.25} /><circle cx={2.4} cy={-1} r={4.4} fill={HALO} stroke="none" opacity={0.25} />
            <path d="M-2.4 -0.4 l-1 -2 h2 Z M2.4 -0.4 l-1 -2 h2 Z" fill={LIT} stroke="none" />
            <path d="M-7 -37 Q0 -40.4 7 -37 L8.2 -18 Q0 -14.6 -8.2 -18 Z" {...F} fill={AV_YELLOW} />
            <path d="M3 -38.6 Q5.4 -38.2 7 -37 L8.2 -18 Q5 -16.6 3.4 -16.6 Z" {...SHADE} />
            <path d="M-8.4 -21.4 Q0 -18 8.4 -21.4 L8 -17.6 Q0 -14.2 -8 -17.6 Z" {...F} fill={AV_ORANGE} strokeWidth={1.1} />
            <Limb d="M-5.6 -36.2 L5.6 -22.4" w={4.6} fill={AV_ORANGE} />
            <Limb d="M-6.6 -35 L-17.6 -26.4" w={5} fill={AV_YELLOW} />
            {hand(-18.4, -25.2)}
            <Limb d="M6.6 -35 L17.6 -26.4" w={5} fill={AV_YELLOW} />
            {hand(18.4, -25.2)}
            <g transform="rotate(-5 0 -42)">
                <ellipse cx={-9} cy={-47} rx={1.8} ry={2.6} {...F} fill={AV_SKIN} strokeWidth={1.1} />
                <ellipse cx={9} cy={-47} rx={1.8} ry={2.6} {...F} fill={AV_SKIN} strokeWidth={1.1} />
                <circle cx={0} cy={-47.5} r={9} {...F} fill={AV_SKIN} />
                <path d="M3.6 -56 A9 9 0 0 1 8.9 -45 Q5.6 -44.6 4.4 -48 Q4 -52 3.6 -56 Z" {...SHADE} />
                <circle cx={0} cy={-53.4} r={7} fill={HALO} stroke="none" opacity={0.28} />
                <path d="M-1 -56.2 V-53.6 L-2.9 -53.6 L0 -50 L2.9 -53.6 L1 -53.6 V-56.2 Z" fill={LIT} stroke="var(--sc-snow)" strokeWidth={0.5} strokeLinejoin="round" />
                <circle cx={-3.4} cy={-46.4} r={4.6} fill={HALO} stroke="none" opacity={0.3} /><circle cx={3.4} cy={-46.4} r={4.6} fill={HALO} stroke="none" opacity={0.3} />
                <ellipse cx={-3.4} cy={-46.4} rx={2.1} ry={1.6} fill={LIT} stroke="var(--sc-snow)" strokeWidth={0.5} />
                <ellipse cx={3.4} cy={-46.4} rx={2.1} ry={1.6} fill={LIT} stroke="var(--sc-snow)" strokeWidth={0.5} />
                <path d="M-5.6 -49 L-1.6 -48.4 M5.6 -49 L1.6 -48.4" {...L} strokeWidth={0.9} />
                <path d="M-1.8 -42 H1.8" {...L} strokeWidth={0.9} />
            </g>
        </P>
    )
}