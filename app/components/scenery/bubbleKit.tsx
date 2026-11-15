/**
 * The one speech-bubble drawing every scene uses, in two styles that follow the theme (no props, no per-scene colours):
 *
 *   Nature (light)  a paper bubble: cream fill, green ink line, softly rounded corners and a little paper shadow; dark-green lettering.
 *   Space  (dark)   a comm-panel bubble: pale fill, indigo lettering, cut (chamfered) corners and a glowing edge.
 *
 * Both are drawn (one path each) and CSS shows the one that matches `[data-theme]`, exactly as `.scene-nature` / `.scene-space` do, so a
 * bubble can never be in the wrong style for its world. The colours live in styles/speech-bubbles.css (`--bub-*`); lettering takes the
 * `bub-text` class (it sets the fill, so the text needs no colour of its own and can never end up pale-on-pale).
 *
 * The geometry is the same for both: a box (x0,y0)–(x1,y1) with a tail on one edge. `at` is where the tail's base is centred along that edge
 * (an x for the top / bottom edges, a y for the left / right edges), `tip` is the point it speaks from, `half` is half the base's width.
 */
export type BubbleTail = { side: 'top' | 'bottom' | 'left' | 'right'; at: number; tip: [number, number]; half?: number }
export type BubbleBox = { x0: number; y0: number; x1: number; y1: number; tail: BubbleTail }

export const BUBBLE_R = 6          // Nature: the corner radius
export const BUBBLE_CUT = 5        // Space: how far each corner is cut

const f = (n: number) => +n.toFixed(2)

/** the outline of a bubble, clockwise from the top-left; `kind` decides how the four corners are turned */
export function bubbleOutline(kind: 'nature' | 'space', { x0, y0, x1, y1, tail }: BubbleBox) {
    // never turn a corner more than a third of the way along the shorter side
    const k = Math.min(kind === 'nature' ? BUBBLE_R : BUBBLE_CUT, (y1 - y0) / 3, (x1 - x0) / 3)
    const turn = (cx: number, cy: number, ex: number, ey: number) => (kind === 'nature' ? ` Q${f(cx)} ${f(cy)} ${f(ex)} ${f(ey)}` : ` L${f(ex)} ${f(ey)}`)
    const { side, at, tip, half = 3 } = tail
    // keep the tail's base on the straight part of its edge, clear of the corners
    const horiz = side === 'bottom' || side === 'top'
    const lo = (horiz ? x0 : y0) + k + half, hi = (horiz ? x1 : y1) - k - half
    const b = Math.min(Math.max(at, Math.min(lo, hi)), Math.max(lo, hi))
    let d = `M${f(x0 + k)} ${f(y0)}`
    if (side === 'top') d += ` H${f(b - half)} L${f(tip[0])} ${f(tip[1])} H${f(b + half)}`
    d += ` H${f(x1 - k)}` + turn(x1, y0, x1, y0 + k)
    if (side === 'right') d += ` V${f(b - half)} L${f(tip[0])} ${f(tip[1])} L${f(x1)} ${f(b + half)}`
    d += ` V${f(y1 - k)}` + turn(x1, y1, x1 - k, y1)
    if (side === 'bottom') d += ` H${f(b + half)} L${f(tip[0])} ${f(tip[1])} L${f(b - half)} ${f(y1)}`
    d += ` H${f(x0 + k)}` + turn(x0, y1, x0, y1 - k)
    if (side === 'left') d += ` V${f(b + half)} L${f(tip[0])} ${f(tip[1])} L${f(x0)} ${f(b - half)}`
    d += ` V${f(y0 + k)}` + turn(x0, y0, x0 + k, y0)
    return d + ' Z'
}

/** the bubble's body in both styles (the lettering is the caller's: give it className="bub-text") */
export function BubbleShape({ strokeWidth = 1.2, ...box }: BubbleBox & { strokeWidth?: number }) {
    const dn = bubbleOutline('nature', box), ds = bubbleOutline('space', box)
    return (
        <>
            <g className="bub-nature">
                <path className="bub-drop" d={dn} transform="translate(1 1.4)" />
                <path className="bub-body" d={dn} strokeWidth={strokeWidth} strokeLinejoin="round" />
            </g>
            <g className="bub-space">
                <path className="bub-halo" d={ds} strokeWidth={strokeWidth + 3.2} strokeLinejoin="round" />
                <path className="bub-body" d={ds} strokeWidth={strokeWidth} strokeLinejoin="miter" />
            </g>
        </>
    )
}