import { Bubble, L } from './illustrations'
import { AangGlideForm, AppaForm, KataraForm, MomoFlyForm, SokkaForm, TophForm, CAST_SCALE } from './avatarCast'

/**
 * Scene A (Nature) — "Appa, Yip Yip": Appa glides across the sky with Sokka (back), Toph (middle) and Katara (front, holding the reins) in the saddle, Aang
 * flying ahead on his glider and Momo flapping alongside. Halfway through the loop Sokka says the line, Appa surges
 * forward, and the whole party leaves the frame; a beat later it drifts back in from the left.
 *
 * ONE clock: every moving part is a SMIL animation with the same `dur`, started together and repeating forever.
 *   party travel + fade ........ translate / opacity, keyed to the loop (cruise, then the surge)
 *   Appa's tail ................ rotate about its root (swishes faster in the surge)   -> Appa `tailAnim`
 *   Momo's wings ............... the whole wing path morphs through one bat wingbeat    -> MomoFly `flapDur` (loop ÷ 42)
 *   bobbing, banking, wind ..... small translate / rotate / opacity tracks
 *   Sokka's bubble ............. pops just before the surge, holds, fades
 * With reduced motion the same drawing is a still frame (party centred, line already spoken).
 *
 * LINES scale with the drawing, like every other illustration on the page. They are not pinned to screen pixels (`fx-uniform`, i.e.
 * `vector-effect: non-scaling-stroke`), because the cast is authored with ~1 unit outlines for figures 57–77 units tall and drawn here at 0.45
 * (people) / 0.9 (Appa) of that, so a pixel-fixed ~1 px line would be two to four times too heavy on the riders (and heavier still whenever
 * the page is narrower than its 1440 design width, which shrinks the scene but not a pixel-fixed line). Scaled with the drawing, a rider's
 * outline is a rider-sized line and Appa's is twice that, as a drawing at twice the size would be.
 *
 * SIZES are proportional to one another: Appa is drawn at A (0.9) and every person and Momo at half of that (0.45), so Appa's body
 * stands about one and a half times a rider's height and Momo is about the size of a rider's torso (as in the show: a bison some
 * twenty feet long, teenagers five or six feet, a small lemur). Aang's glider is his own size: a staff a little longer than he is tall.
 *
 * Drawn in a 780 × 160 frame (viewBox units): mount it in an <svg viewBox="0 0 780 160"> (or scale/translate the group).
 * The bubble sits in clear sky: no character, wing or glider crosses it.
 */
const T = 14
const DUR = `${T}s`
const A = CAST_SCALE.appa           // Appa's scale; people and Momo are drawn at A / 2 (CAST_SCALE.person)
const H = CAST_SCALE.person
const YA = 140                      // Appa's feet
const REST_X = 390                  // reduced-motion frame: Appa centred
const START_X = 210                 // party's x at the start of the loop
const CRUISE = 95                   // how far the party glides before the surge
const TRAVEL = 380                  // … and in total by the time it leaves

const smooth = (a: number, b: number, u: number) => { const t = Math.min(1, Math.max(0, (u - a) / (b - a))); return t * t * (3 - 2 * t) }
/** 0 in cruise, 1 in the surge (rises just before the bubble, falls as the party leaves) */
const surge = (u: number) => smooth(0.44, 0.56, u) * (1 - smooth(0.84, 0.9, u))
const track = (n: number, f: (u: number) => string) => Array.from({ length: n + 1 }, (_, i) => f(i / n)).join(';')
const TAU = Math.PI * 2

/** swish angles for the tail: a steady wag, faster and wider in the surge (phase is integrated so the speed-up is smooth) */
function swishValues() {
    const n = 280
    let ph = 0
    const out: string[] = []
    for (let i = 0; i <= n; i++) {
        const k = surge(i / n)
        out.push(`${((8 + 8 * k) * Math.sin(ph)).toFixed(1)} 0 0`)
        ph += (TAU * (12 + 14 * k)) / n
    }
    return out.join(';')
}
const loop = { dur: DUR, repeatCount: 'indefinite' } as const
const SWISH = swishValues()

function Riders() {
    // Appa faces right: Sokka at the back, Toph in the middle, Katara in front with the reins; all sit at y = −64 in Appa's units
    return (
        <>
            <SokkaForm x={-18} y={-64} s={0.5} />
            <TophForm x={0} y={-64} s={0.5} />
            <KataraForm x={16} y={-64} s={0.5} steer />
        </>
    )
}

export default function FlightScene({ reduce = false }: { reduce?: boolean }) {
    const a = !reduce
    const bubbleAt = { x: -18 * 0.5 * A, y: YA - (64 + 77 * 0.5) * A - 3 }   // just above Sokka's topknot, at the back of the saddle
    const party = (
        <>
            {/* wind: three short strokes trail the tail, only while Appa surges */}
            {a && (
                <g opacity={0}>
                    <animate attributeName="opacity" values="0;0;0.7;0.7;0;0" keyTimes="0;0.45;0.52;0.82;0.9;1" {...loop} />
                    <path d={`M-98 ${YA - 46} H-126 M-106 ${YA - 34} H-150 M-98 ${YA - 22} H-124`} {...L} strokeWidth={1.4} />
                </g>
            )}

            {/* Appa, his riders and the speech bubble share one bob */}
            <g>
                {a && <animateTransform attributeName="transform" type="translate" values={track(100, u => `0 ${(1.8 * Math.sin(TAU * 5 * u)).toFixed(2)}`)} {...loop} />}
                <AppaForm
                    x={0}
                    y={YA}
                    s={A}
                    reins={[16 + 14.2 * 0.5, -64 - 43.2 * 0.5]}
                    tailAnim={a ? <animateTransform attributeName="transform" type="rotate" values={SWISH} {...loop} /> : undefined}
                >
                    <Riders />
                </AppaForm>
                <g transform={`translate(${bubbleAt.x} ${bubbleAt.y})`}>
                    <g opacity={a ? 0 : 1}>
                        {a && <animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;0.44;0.47;0.58;0.64;1" {...loop} />}
                        {a && <animateTransform attributeName="transform" type="scale" values="0.4;0.4;1.14;1;1;0.92;0.92" keyTimes="0;0.44;0.485;0.52;0.58;0.64;1" {...loop} />}
                        <Bubble text="Appa Yip Yip!" w={88} h={18} fs={9} shift={-4} />
                    </g>
                </g>
            </g>

            {/* Aang, ahead of Appa, hangs from his glider in the card-art pose (fists wide on the spar), climbing at a gentle 18° just ahead of Appa's head, banking and bobbing */}
            <g transform={`translate(122 ${YA - 46})`}>
                <g>
                    {a && <animateTransform attributeName="transform" type="translate" values={track(100, u => `0 ${(2.4 * Math.sin(TAU * 5 * u + 1.3)).toFixed(2)}`)} {...loop} />}
                    <g>
                        <g>
                            {a && <animateTransform attributeName="transform" type="rotate" values={track(100, u => `${(2.4 * Math.sin(TAU * 5 * u + 0.4)).toFixed(2)} 0 -30`)} {...loop} />}
                            <g transform={`scale(${H})`}>
                                <AangGlideForm tilt={18} />
                            </g>
                        </g>
                    </g>
                </g>
            </g>

            {/* Momo, side-on, beats his bat wings off Appa's tail: one wingbeat is 1/42 of the loop (3 beats a second) */}
            <g transform={`translate(-120 ${YA - 72})`}>
                <g>
                    {a && <animateTransform attributeName="transform" type="translate" values={track(140, u => `${(5 * Math.cos(TAU * 3 * u)).toFixed(2)} ${(4 * Math.sin(TAU * 7 * u + 0.5)).toFixed(2)}`)} {...loop} />}
                    <MomoFlyForm s={H} flapDur={a ? T / 42 : undefined} />
                </g>
            </g>
        </>
    )

    if (!a) return <g transform={`translate(${REST_X} 0)`}>{party}</g>
    return (
        <g transform={`translate(${START_X} 0)`}>
            <g>
                <animateTransform attributeName="transform" type="translate" values={`0 0;${CRUISE} 0;${TRAVEL} 0;${TRAVEL} 0`} keyTimes="0;0.46;0.88;1" calcMode="spline" keySplines="0 0 1 1;0.55 0 0.85 0.45;0 0 1 1" {...loop} />
                <g opacity={0}>
                    <animate attributeName="opacity" values="0;1;1;0;0" keyTimes="0;0.05;0.8;0.9;1" {...loop} />
                    {party}
                </g>
            </g>
        </g>
    )
}