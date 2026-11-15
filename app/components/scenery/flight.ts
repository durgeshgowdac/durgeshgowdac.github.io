'use client'
import { useEffect, useState } from 'react'

/**
 * Where is the rocket (and which way does it point, and how fast is it going) at a given moment of its loop?
 *
 * The rocket is carried by an SMIL <animateMotion>, so its position only exists inside the browser's animation engine. Dropped stages need it:
 * they must be drawn OUTSIDE the moving rocket (in the scene's own space) so that they stay behind as debris. `useFlightFrames` asks the very same
 * path string for the point at the progress the animation has reached at each given second, so a stage appears exactly where it was let go.
 */
export type Frame = {
    x: number
    y: number
    /** the path's heading there, in degrees (what rotate="auto" gives the rocket) */
    rot: number
    /** speed along the path, scene units per second */
    v: number
    /** the rocket's scale at that moment */
    k: number
}

/** y of a CSS-style cubic-bezier easing (as used by SMIL keySplines) at time x */
export function splineY(x1: number, y1: number, x2: number, y2: number, x: number): number {
    if (x <= 0) return 0
    if (x >= 1) return 1
    let lo = 0, hi = 1
    for (let i = 0; i < 40; i++) {
        const t = (lo + hi) / 2
        const bx = 3 * (1 - t) * (1 - t) * t * x1 + 3 * (1 - t) * t * t * x2 + t * t * t
        if (bx < x) lo = t; else hi = t
    }
    const t = (lo + hi) / 2
    return 3 * (1 - t) * (1 - t) * t * y1 + 3 * (1 - t) * t * t * y2 + t * t * t
}

/**
 * `progress(sec)` → how far along the path (0…1) the rocket is `sec` seconds into the loop; `scaleAt(progress)` → its scale there.
 * Returns the frames (same order as `secs`) once mounted, `null` before that (and always `null` when `path` is empty).
 * `key` must change whenever the numbers behind `progress` / `scaleAt` do (the hook only re-samples then).
 */
export function useFlightFrames(
    path: string,
    secs: number[],
    progress: (sec: number) => number,
    scaleAt: (p: number) => number,
    key: string,
): Frame[] | null {
    const [frames, setFrames] = useState<Frame[] | null>(null)
    useEffect(() => {
        if (!path || secs.length === 0) { setFrames(null); return }
        try {
            const ns = 'http://www.w3.org/2000/svg'
            const svg = document.createElementNS(ns, 'svg')
            svg.setAttribute('width', '0'); svg.setAttribute('height', '0')
            svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;visibility:hidden;pointer-events:none'
            const el = document.createElementNS(ns, 'path')
            el.setAttribute('d', path)
            svg.appendChild(el)
            document.body.appendChild(svg)
            const total = el.getTotalLength()
            const at = (p: number) => el.getPointAtLength(Math.max(0, Math.min(1, p)) * total)
            const dt = 0.1
            const out = secs.map(sec => {
                const p = progress(sec)
                const a = el.getPointAtLength(Math.max(0, p * total - 0.5)), b = el.getPointAtLength(Math.min(total, p * total + 0.5))
                const q = at(progress(sec + dt)), c = at(p)
                return {
                    x: c.x, y: c.y,
                    rot: p <= 0 ? -90 : (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI,
                    v: Math.hypot(q.x - c.x, q.y - c.y) / dt,
                    k: scaleAt(p),
                }
            })
            document.body.removeChild(svg)
            setFrames(out)
        } catch {
            setFrames(null)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [path, key])
    return frames
}