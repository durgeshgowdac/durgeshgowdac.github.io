/**
 * Ridge helper — where is the ground at x?
 *
 * The scenery draws its hills as closed SVG paths ("M0 190 V120 C… S… V190 Z"). Placing a tree or a tent with a
 * hand-typed y drifts off the curve (a pine at x = 1180 floated 18 units above the far ridge). `ridgeFn`
 * reads the TOP EDGE of such a path once and returns a function x → y, so a thing can be planted exactly on the ground it stands on.
 *
 * Only the commands the scenery uses are understood: M, V (the opening drop), C and S (cubic Béziers, S reflecting the previous
 * control point). Values are rounded to one decimal so the server and the browser print the same attribute.
 */
export type Ridge = (x: number) => number

type Seg = [[number, number], [number, number], [number, number], [number, number]]

function segments(d: string): Seg[] {
    const t = d.replace(/([A-Za-z])/g, ' $1 ').trim().split(/\s+/)
    const out: Seg[] = []
    let i = 0, cx = 0, cy = 0
    let last: [number, number] = [0, 0]
    while (i < t.length) {
        const c = t[i++]
        if (c === 'M') { cx = +t[i++]; cy = +t[i++] }
        else if (c === 'V') { const y = +t[i++]; if (!out.length) cy = y }          // the opening drop sets where the edge starts
        else if (c === 'C') {
            const p = [+t[i++], +t[i++], +t[i++], +t[i++], +t[i++], +t[i++]]
            out.push([[cx, cy], [p[0], p[1]], [p[2], p[3]], [p[4], p[5]]])
            last = [p[2], p[3]]; cx = p[4]; cy = p[5]
        } else if (c === 'S') {
            const p = [+t[i++], +t[i++], +t[i++], +t[i++]]
            out.push([[cx, cy], [2 * cx - last[0], 2 * cy - last[1]], [p[0], p[1]], [p[2], p[3]]])
            last = [p[0], p[1]]; cx = p[2]; cy = p[3]
        } else if (c === 'Z' || c === 'H') break                                        // closing edge (not part of the ridge)
    }
    return out
}

const bez = (a: number, b: number, c: number, d: number, u: number) =>
    (1 - u) ** 3 * a + 3 * (1 - u) ** 2 * u * b + 3 * (1 - u) * u * u * c + u ** 3 * d

export function ridgeFn(d: string): Ridge {
    const segs = segments(d)
    const first = segs[0][0][0], lastX = segs[segs.length - 1][3][0]
    return (x: number) => {
        const xx = Math.min(lastX, Math.max(first, x))
        const s = segs.find(([a, , , e]) => xx >= a[0] - 1e-6 && xx <= e[0] + 1e-6) ?? segs[segs.length - 1]
        let lo = 0, hi = 1
        for (let k = 0; k < 40; k++) { const m = (lo + hi) / 2; if (bez(s[0][0], s[1][0], s[2][0], s[3][0], m) < xx) lo = m; else hi = m }
        const u = (lo + hi) / 2
        return Math.round(bez(s[0][1], s[1][1], s[2][1], s[3][1], u) * 10) / 10
    }
}