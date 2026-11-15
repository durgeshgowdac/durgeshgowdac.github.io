/** A small outlined speech bubble (the theme's style: see scenery/bubbleKit). */
import { P, type PlaceProps } from './core'
import { BubbleShape } from '../bubbleKit'

/** A dry, outlined speech bubble: the tail tip is the origin (point it at the speaker's head), the body sits above it and grows
 *  into −y. `w`/`h` size the body (SVG text does not wrap, so size it to the line); `shift` slides the body sideways of the tail. */
export function Bubble({ text, w = 64, h = 15, shift = 0, fs = 7.2, ...p }: PlaceProps & { text: string; w?: number; h?: number; shift?: number; fs?: number }) {
    const T = 5
    const y0 = -(T + h)
    return (
        <P {...p}>
            <BubbleShape x0={shift - w / 2} x1={shift + w / 2} y0={y0} y1={-T} tail={{ side: 'bottom', at: 0, tip: [0, 0], half: 2.6 }} />
            <text className="bub-text" x={shift} y={y0 + h / 2 + fs * 0.34} textAnchor="middle" fontSize={fs} style={{ fontFamily: 'inherit' }}>{text}</text>
        </P>
    )
}