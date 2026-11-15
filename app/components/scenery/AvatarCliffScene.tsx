import { AangForm, AppaForm, KataraForm, MomoForm, SokkaForm, TophForm, CAST_SCALE } from './avatarCast'

/**
 * "The Party" — the whole cast in one still group portrait, no background. Appa stands behind all four, saddle on and no harness (Toph cheering, Sokka, Katara,
 * Aang with his glider held straight up); Momo sits inside the saddle, front view and still.
 * Appa's marking is one tapered arrow from the tail tip to the forehead (`seamless`), so his tail does not sway.
 *
 * SCALE: one rule, K = 3.6 — people and Momo at CAST_SCALE.person × K, Appa at CAST_SCALE.appa × K (twice that). Momo is drawn
 * inside Appa's own units, so he gets PS / AS = 0.5.
 *
 * Draw it in <svg viewBox="50 90 680 350"> (no background of its own; the colour comes from var(--sc-line)).
 */
const K = 3.6
const PS = CAST_SCALE.person * K      // people and Momo
const AS = CAST_SCALE.appa * K        // Appa
const GROUND = 420
const AX = 390                        // Appa's centre, so his body sits behind all four

export default function AvatarCliffScene() {
    return (
        <g className="fx-uniform">
            {/* Appa first, so everyone else is in front of him */}
            <AppaForm x={AX} y={GROUND} s={AS} seamless>
                {/* Momo in the saddle: his feet are hidden behind the near wall (top at y = −75), so he reads as sitting inside it */}
                <MomoForm x={-2} y={-69.5} s={PS / AS} />
            </AppaForm>

            {/* the four, front view, one baseline: Toph, Sokka, Katara, Aang */}
            <TophForm x={AX - 128} y={GROUND} s={PS} cheer />
            <SokkaForm x={AX - 40} y={GROUND} s={PS} />
            <KataraForm x={AX + 40} y={GROUND} s={PS} />
            <AangForm x={AX + 130} y={GROUND} s={PS} raise />
        </g>
    )
}