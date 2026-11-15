import { AangRaiseForm, AppaSeamlessForm, KataraForm, MomoForm, SokkaForm, TophForm, CAST_SCALE } from './avatarCast'
import { Rock } from './illustrations'

/**
 * "The Party" for a horizon band: Appa stands behind (side view, saddled, no harness), and in front of him, on one baseline,
 * Toph (cheering), Sokka, Katara and Aang (glider raised). Momo is perched on a small rock out past Aang, tucked under Appa's chin.
 * (AvatarCliffScene is the same portrait with Momo up in the saddle.)
 *
 * Placed like every other part: the origin is the middle of Appa's feet, `s` scales the whole group. Line weights stay
 * one pixel width whatever the scale (fx-uniform), the way the other cast scenes draw them. Same K = 3.6 proportions as the portrait:
 * people and Momo at CAST_SCALE.person × K, Appa at CAST_SCALE.appa × K.
 */
const K = 3.6
const PS = CAST_SCALE.person * K
const AS = CAST_SCALE.appa * K

export default function AvatarParty({ x = 0, y = 0, s = 1 }: { x?: number; y?: number; s?: number }) {
    return (
        <g transform={`translate(${x} ${y}) scale(${s})`}>
            <g className="fx-uniform">
                <AppaSeamlessForm x={0} y={0} s={AS} />
                <TophForm x={-128} y={0} s={PS} cheer />
                <SokkaForm x={-40} y={0} s={PS} />
                <KataraForm x={40} y={0} s={PS} />
                {/* Momo under Appa's chin: a small rock lifts him up to it (Appa's muzzle ends about x = 270, his chin is ~110 units above the ground) */}
                <Rock x={250} y={0} s={2.1} />
                <MomoForm x={250} y={-27} s={PS * 0.95} />
                <AangRaiseForm x={134} y={0} s={PS} />
            </g>
        </g>
    )
}