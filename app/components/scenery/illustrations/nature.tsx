/** NATURE — trees, sun, clouds, birds, the fox, rabbit and deer, mountains, camp. */
import { DOT, F, GLOW, Halo, L, Limb, P, type PlaceProps, SHADE, WARM } from './core'

/* ═══════════════════════════════════════════════════════════════════════
   NATURE
═══════════════════════════════════════════════════════════════════════ */

export function Pine(p: PlaceProps) {
    return (
        <P {...p}>
            <rect x={-2.5} y={-10} width={5} height={10} rx={1} fill="var(--sc-trunk)" stroke="currentColor" strokeWidth={1.1} strokeLinejoin="round" />
            <path d="M-24 -8 L0 -46 L24 -8 Z" fill="var(--sc-tree)" stroke="currentColor" strokeWidth={1.3} strokeLinejoin="round" />
            <path d="M-19 -30 L0 -64 L19 -30 Z" fill="var(--sc-tree)" stroke="currentColor" strokeWidth={1.3} strokeLinejoin="round" />
            <path d="M-13 -52 L0 -84 L13 -52 Z" fill="var(--sc-tree)" stroke="currentColor" strokeWidth={1.3} strokeLinejoin="round" />
            {/* shaded right-hand side of each tier */}
            <path d="M0 -46 L24 -8 H5 Z M0 -64 L19 -30 H4 Z M0 -84 L13 -52 H3 Z" {...SHADE} />
        </P>
    )
}

export function RoundTree(p: PlaceProps) {
    const crown: [number, number, number][] = [[0, -60, 24], [-19, -46, 16], [19, -46, 16]]
    return (
        <P {...p}>
            <path d="M0 0 V-38" {...L} strokeWidth={5.8} />
            <path d="M0 0 V-38" stroke="var(--sc-trunk)" strokeWidth={3.4} strokeLinecap="round" fill="none" />
            <path d="M0 -22 L9 -31" {...L} strokeWidth={1.1} />
            <Blob c={crown} fill="var(--sc-tree)" />
            <path d="M8 -80 A24 24 0 0 1 22 -56 Q14 -52 6 -58 Z" {...SHADE} />
            <path d="M-14 -66 q5 -7 12 -6" {...L} strokeWidth={1} opacity={0.5} />
        </P>
    )
}

/** Math.sin/cos aren't bit-identical between engines (Node on the server vs Safari/Chrome in the browser),
 *  so their raw output prints with different trailing digits and React reports a hydration mismatch.
 *  Anything derived from them is rounded to 2 decimals before it goes into an attribute. */
export const r2 = (n: number) => Math.round(n * 100) / 100

export function Sun({ rays = 14, ...p }: PlaceProps & { rays?: number }) {
    const lines = Array.from({ length: rays }, (_, i) => {
        const a = (i / rays) * Math.PI * 2
        return (
            <line
                key={i}
                x1={r2(Math.cos(a) * 82)}
                y1={r2(Math.sin(a) * 82)}
                x2={r2(Math.cos(a) * (i % 2 ? 96 : 104))}
                y2={r2(Math.sin(a) * (i % 2 ? 96 : 104))}
                {...L}
                strokeWidth={1.2}
            />
        )
    })
    return (
        <P {...p}>
            <Halo r={150} />
            <circle r={66} {...GLOW} opacity={0.55} />
            <circle r={66} {...L} />
            <circle r={74} {...L} strokeWidth={0.9} opacity={0.6} />
            <g className="scene-spin">{lines}</g>
        </P>
    )
}

/** `drift` lets the cloud wander slowly (the class goes on an inner group — the outer one owns the placement transform) */
export function Cloud({ drift, driftClass, tint, ...p }: PlaceProps & { drift?: boolean; driftClass?: string; tint?: string }) {
    const body = <path d="M-34 0 H32 A10 10 0 0 0 32 -18 A14 14 0 0 0 6 -25 A11 11 0 0 0 -16 -17 A9 9 0 0 0 -34 0 Z" {...F} fill={tint ?? F.fill} />
    return <P {...p} bg={tint !== undefined}>{drift ? <g className={`scene-cloud ${driftClass ?? ''}`}>{body}</g> : body}</P>
}

export function Bird({ className, ...p }: PlaceProps) {
    // Every bird gets its own beat and phase (derived from where it sits) so a flock never moves in lock-step.
    const seed = Math.round(((p.x ?? 0) * 7 + (p.y ?? 0) * 13) % 11)
    return (
        <P {...p}>
            <g className={className ?? 'scene-fly'} style={{ animationDuration: `${5.2 + (seed % 5) * 0.6}s`, animationDelay: `${-seed * 0.9}s` }}>
                <path d="M0 0 q8 -9 16 0 q8 -9 16 0" {...L} />
            </g>
        </P>
    )
}

/* One butterfly for the whole site. Two layers of motion, like the real thing:
     • the wings beat quickly (.scene-wing — scaleX about the body, left/right mirrored)
     • the whole insect meanders slowly on a closed loop (.scene-butterfly--a/b/c — different loops
       and durations so two of them never move in step).
   `delay` is in seconds and starts the loop part-way through, so neighbours are out of phase.
   Wings are the scene's one warm accent with the usual ink outline, so it reads as a butterfly
   (not an outline-only "∞") in both themes. Wingspan ≈ 44 units at s=1. */
export function Butterfly({ delay = 0, drift = 'a', ...p }: PlaceProps & { delay?: number; drift?: 'a' | 'b' | 'c' }) {
    const wing = { ...L, fill: 'color-mix(in srgb, var(--scene-warm) 68%, var(--scene-fill))', strokeWidth: 1.2 }
    const phase = { animationDelay: `${-delay}s` }
    return (
        <P {...p} s={(p.s ?? 1) * 0.55}>
            <g className={`scene-butterfly scene-butterfly--${drift}`} style={phase}>
                <g className="scene-wing scene-wing--l" style={{ animationDelay: `${-delay * 0.37}s` }}>
                    <path d="M-1 -1 C-5 -15 -21 -19 -23 -9 C-24 -2 -14 3 -1 1 Z" {...wing} />
                    <path d="M-1 1 C-12 2 -19 10 -14 15 C-9 18 -3 11 -1 3 Z" {...wing} fillOpacity={0.8} />
                </g>
                <g className="scene-wing scene-wing--r" style={{ animationDelay: `${-delay * 0.37}s` }}>
                    <path d="M1 -1 C5 -15 21 -19 23 -9 C24 -2 14 3 1 1 Z" {...wing} />
                    <path d="M1 1 C12 2 19 10 14 15 C9 18 3 11 1 3 Z" {...wing} fillOpacity={0.8} />
                </g>
                <path d="M0 -4 V10" {...L} strokeWidth={1.7} />
                <path d="M0 -4 Q-2 -9 -6 -10 M0 -4 Q2 -9 6 -10" {...L} strokeWidth={0.9} />
            </g>
        </P>
    )
}

/** Sitting fox facing right: a full, smoothly curved brush of a tail with a white tip, russet coat, dark socks and ear
 *  linings, cream bib and muzzle. Fur is suggested with a few short strokes rather than flat shapes. `watch` splits
 *  tail and head into their own groups (.sp-tail / .sp-head) for the Sports strip. */
export function Fox({ watch = false, ...p }: PlaceProps & { watch?: boolean }) {
    const tail = (
        <>
            <path d="M-8 -4 C-18 4 -34 5 -45 -2 C-55 -9 -58 -26 -44 -40 C-45 -32 -38 -24 -30 -19 C-22 -15 -16 -15 -10 -16 Z" {...F} fill={COAT} />
            {/* white tip, following the curl of the tail */}
            <path d="M-53.3 -16.3 C-54.3 -23.7 -51.7 -32.3 -44 -40 C-44.5 -35.6 -42.7 -31.2 -39.6 -27.3 Q-47.9 -24.3 -46.4 -21.8 T-53.3 -16.3 Z" {...F} fill={CREAM} strokeWidth={1.1} />
            <path d="M-30 -9 q4 -3 9 -2 M-40 -8 q3 -4 8 -4 M-50 -17 q3 -2 7 0 M-44 -27 q3 -2 6 -1" {...L} strokeWidth={0.9} opacity={0.5} />
        </>
    )
    const head = (
        <>
            <path d="M8 -43 L8 -61 L17 -52 Q19.5 -53 22 -52 L31 -61 L31 -45 Q38 -41 43 -38 Q37 -33 29 -32 Q14 -31 8 -43 Z" {...F} fill={COAT} />
            <path d="M10.4 -55 L13.6 -50.6 L10.6 -48.4 Z M28.6 -55 L25.4 -50.6 L28.4 -48.4 Z" {...F} fill={SOCK} strokeWidth={0.8} />
            <path d="M29 -40 Q36 -39 43 -38 Q37 -33 29 -32 Q25 -34 24 -38 Z" {...F} fill={CREAM} strokeWidth={1.1} />
            <path d="M8.4 -42 l-2.6 1.4 l2.8 0.8 M13 -33.6 l-2.2 1.8 l3 0.2" {...L} strokeWidth={0.9} opacity={0.7} />
            <circle cx="25" cy="-43" r="1.4" {...DOT} />
            <circle cx="43" cy="-38" r="1.8" {...DOT} />
        </>
    )
    return (
        <P {...p}>
            {watch ? <g className="sp-tail">{tail}</g> : tail}
            {/* hind paw, tucked in front of the haunch */}
            <path d="M-10 0 C-10 -5 -3 -6 4 -5 L10 -3 C11.4 -1.6 11.4 0 11.4 0 Z" {...F} fill={SOCK} strokeWidth={1.2} />
            {/* back + haunch */}
            <path d="M-10 0 C-18 -12 -12 -30 4 -38 C14 -42 24 -36 26 -26 C28 -16 26 -7 24 0 Z" {...F} fill={COAT} />
            <path d="M-9 -9 C-6 -20 6 -22 11 -12" {...L} strokeWidth={0.9} opacity={0.5} />
            {/* cream chest and bib */}
            <path d="M13 -27 C20 -27 24.6 -21 24.6 -13 C24.6 -7 23.6 -3 23.6 0 H15.4 C17.4 -8 15.4 -19 13 -27 Z" {...F} fill={CREAM} strokeWidth={1.1} />
            {/* dark sock on the foreleg */}
            <path d="M15.6 -9 H23.4 L23.6 -2 Q23.4 0 21 0 H16.6 Q14.8 0 14.9 -2 Z" {...F} fill={SOCK} strokeWidth={1.1} />
            <path d="M-5 -24 q4 -3 8 -1 M-6 -15 q4 -3 8 -1 M2 -30 q4 -2 8 0" {...L} strokeWidth={0.9} opacity={0.5} />
            {watch ? <g className="sp-head">{head}</g> : head}
        </P>
    )
}

/** Walking fox facing right — same coat, socks, cream bib and white-tipped tail; each leg swings from its own hip (.scene-step). */
export function FoxWalk(p: PlaceProps) {
    const leg = (x: number, cls: string, far = false) => (
        <g className={cls} opacity={far ? 0.82 : 1}>
            <path d={`M${x} -15 V-1.6`} {...L} strokeWidth={4.6} />
            <path d={`M${x} -15 V-6`} stroke={COAT} strokeWidth={2.6} strokeLinecap="round" fill="none" />
            <path d={`M${x} -6 V-1.6`} stroke={SOCK} strokeWidth={2.6} strokeLinecap="round" fill="none" />
        </g>
    )
    return (
        <P {...p}>
            <g className="scene-bob">
                {/* tail, trailing low behind with a white tip */}
                <path d="M-21 -21 C-30 -29 -44 -30 -52 -23 C-58 -17 -57 -7 -50 -3 C-50 -9 -42 -12 -33 -14 C-27 -15 -22 -15 -20 -14 Z" {...F} fill={COAT} />
                <path d="M-55.9 -12.2 C-55.5 -8.5 -53.5 -5 -50 -3 C-50 -5.5 -48.6 -7.5 -46.3 -9.1 Q-52.6 -13.2 -51.1 -10.7 T-55.9 -12.2 Z" {...F} fill={CREAM} strokeWidth={1.1} />
                <path d="M-38 -19 q5 -3 10 -1 M-45 -17 q3 -3 7 -2" {...L} strokeWidth={0.9} opacity={0.5} />
                {leg(-8, 'scene-step', true)}{leg(20, 'scene-step', true)}
                {leg(-14, 'scene-step2')}{leg(14, 'scene-step2')}
                {/* body */}
                <path d="M-22 -19 C-22 -32 12 -34 20 -26 C24 -22 22 -14 18 -12 C8 -9 -12 -9 -21 -13 Z" {...F} fill={COAT} />
                <path d="M10 -12.4 C14 -14 18 -14 19 -18 C21 -16 21 -13 18 -12 C15 -11 12 -11 10 -12.4 Z" {...F} fill={CREAM} strokeWidth={1} />
                <path d="M-10 -24 q4 -3 8 -1 M-2 -19 q4 -2 8 0" {...L} strokeWidth={0.9} opacity={0.45} />
                {/* head */}
                <path d="M18 -29 L20 -42 L26 -34 Q29 -35 32 -34 L37 -42 L37 -28 Q43 -25 48 -22 Q42 -17 34 -18 Q22 -18 18 -29 Z" {...F} fill={COAT} />
                <path d="M20.4 -37 L24.2 -33.6 L21 -32 Z M35 -37 L31.2 -33.6 L34.6 -32 Z" {...F} fill={SOCK} strokeWidth={0.8} />
                <path d="M37 -23 Q43 -24 48 -22 Q42 -17 34 -18 Q31 -20 31 -23 Z" {...F} fill={CREAM} strokeWidth={1} />
                <circle cx="30" cy="-27" r="1.3" {...DOT} />
                <circle cx="48" cy="-22" r="1.7" {...DOT} />
            </g>
        </P>
    )
}

/** Sitting rabbit facing right: soft grey-brown coat, long ears with pink linings, a white cotton tail and a long hind foot. */
export function Rabbit(p: PlaceProps) {
    return (
        <P {...p}>
            {/* cotton tail */}
            <circle cx="-17" cy="-11" r="5" {...F} fill={CREAM} strokeWidth={1.2} />
            {/* plump body: a big round haunch rolling up into the shoulders */}
            <path d="M-14 0 C-22 -6 -20 -23 -6 -26.5 C6 -29 16 -22 16 -11 C16 -6 15 -3 14 0 Z" {...F} fill={HARE} />
            <path d="M-13 -4 C-14.6 -16 -3 -22 4 -14 C7.4 -10 7.6 -5 5.6 -1.6" {...L} strokeWidth={0.95} opacity={0.55} />
            <path d="M-9 -22 q4 -2 7 0 M-4 -26 q4 -1 7 1" {...L} strokeWidth={0.8} opacity={0.35} />
            {/* cream chest */}
            <path d="M13.6 -19 C17.4 -15 17 -8 14.6 -3 L12 -3 C13.6 -8 13.6 -14 13.6 -19 Z" fill={CREAM} stroke="none" opacity={0.9} />
            {/* long hind foot reaching forward + forepaws */}
            <path d="M-9 0 C-9 -4.4 0 -5.6 8 -4.2 C12.4 -3.6 14.6 -2 14.6 0 Z" {...F} fill={HARE} strokeWidth={1.2} />
            <path d="M11 -15 C12.4 -9 12.6 -5 12.2 -1.6 H17.6 C18.2 -3.6 16.2 -4.6 15.6 -5.6 C15.8 -9 15.4 -13 14.8 -16 Z" {...F} fill={HARE} strokeWidth={1.1} />
            {/* ears */}
            <path d="M7.4 -29 C2.4 -43 4 -53 9 -52.6 C14.2 -52 13.4 -40 12.6 -29 Z" {...F} fill={HARE} />
            <path d="M8.8 -33 C6.4 -42 7.2 -48.6 9.2 -48.4 C11.4 -48.2 11.2 -41 10.8 -33 Z" fill={PINK} stroke="none" />
            <path d="M12.6 -29 C15 -42 19 -50 23 -47.4 C26 -44.4 21 -36 17.4 -28 Z" {...F} fill={HARE} />
            <path d="M15.4 -32 C17.2 -40 19.6 -45 21.4 -43.6 C22.6 -42 20.4 -37 18.4 -31 Z" fill={PINK} stroke="none" />
            {/* head */}
            <ellipse cx="12.6" cy="-23" rx="8.6" ry="7.4" {...F} fill={HARE} />
            <path d="M17.4 -17.6 Q21.4 -19 21.6 -22.4 Q18.6 -22 17.2 -19.6 Z" {...F} fill={CREAM} strokeWidth={1} />
            <circle cx="15.4" cy="-25.6" r="1.4" {...DOT} />
            <circle cx="21.6" cy="-22.6" r="1.3" fill={PINK} stroke="currentColor" strokeWidth={0.7} />
            <path d="M19 -21 L25 -21.6 M19 -20 L24.6 -18.6" {...L} strokeWidth={0.7} opacity={0.6} />
        </P>
    )
}

/** Standing deer facing right: tan coat with a cream belly, rump tuft and a few fawn spots, jointed legs with dark hooves, a
 *  proper head with an ear and branching antlers. `play` lets the tail flick (.sp-tail) — the volleyball strip uses it. */
export function Deer({ play = false, ...p }: PlaceProps & { play?: boolean }) {
    const hoof = (x: number, w = 5) => <path d={`M${x - w / 2} -0.4 H${x + w / 2}`} stroke="var(--sc-door)" strokeWidth={2.4} strokeLinecap="round" fill="none" />
    return (
        <P {...p}>
            {/* far legs (darker), then near legs */}
            <Limb d="M-9 -27 C-10 -19 -13 -12 -10 -1.6" w={4.8} fill={DEER_FAR} />
            <Limb d="M18 -30 L19.6 -14 L20 -1.6" w={4.6} fill={DEER_FAR} />
            {hoof(-10)}{hoof(20)}
            <Limb d="M-18 -27 C-19.4 -19 -22 -12 -19 -1.6" w={5} fill={DEER} />
            <Limb d="M26 -31 L27 -14 L28 -1.6" w={4.8} fill={DEER} />
            {hoof(-19)}{hoof(28)}
            {/* tail tuft */}
            <g className={play ? 'sp-tail' : undefined}>
                <path d="M-26.4 -37 L-32 -41.4 L-28 -33 Z" {...F} fill={CREAM} strokeWidth={1.1} />
            </g>
            {/* body + neck */}
            <path d="M-27 -33 C-28 -45 -12 -49 4 -48 C13 -48 19 -46 23 -42 C26 -49 29 -56 30 -62 L40 -61 C41 -57 40 -54 37.5 -52.5 C35 -46 33 -40 31 -34 C24 -25 8 -23 -6 -23 C-16 -23 -26 -25 -27 -33 Z" {...F} fill={DEER} />
            {/* cream belly line + fawn spots */}
            <path d="M-22 -27 C-12 -24 6 -24 20 -28 C12 -25.6 -2 -24.6 -10 -24.6 C-15 -24.6 -20 -25.4 -22 -27 Z" fill={CREAM} stroke="none" />
            {[[-18, -39], [-10, -42], [-1, -43], [7, -42], [-14, -34], [-5, -36], [3, -36], [12, -38]].map(([cx, cy], i) => (
                <circle key={i} cx={cx} cy={cy} r={1.15} fill={CREAM} stroke="none" />
            ))}
            {/* head: longer tapered muzzle, big ear, bright eye, dark nose, white muzzle */}
            <path d="M31 -66 C32 -71.4 41 -72.4 45.4 -67 L52.4 -60 C54 -58 53 -55.4 50.4 -54.8 C46.4 -54 41 -53.4 37.4 -54.6 C32 -56.4 30 -61.4 31 -66 Z" {...F} fill={DEER} />
            <path d="M47.6 -61.6 L52.4 -60 C54 -58 53 -55.4 50.4 -54.8 C47.4 -54.4 44.4 -54.4 42.4 -54.8 C44.6 -57.2 46 -59.6 47.6 -61.6 Z" {...F} fill={CREAM} strokeWidth={1} />
            <ellipse cx="52.6" cy="-58.6" rx="1.9" ry="1.5" fill="var(--sc-door)" stroke="currentColor" strokeWidth={0.7} />
            <path d="M34 -67 C29 -68 24 -72 22.6 -77.6 C28 -77.6 34 -74.6 37.4 -69.4 Z" {...F} fill={DEER} strokeWidth={1.2} />
            <path d="M34.4 -68.2 C31 -69.4 27.4 -72.4 26.2 -75.6 C29.8 -75.2 33.2 -73 35.6 -70 Z" fill={PINK} stroke="none" />
            <circle cx="40.6" cy="-63.6" r="1.7" {...DOT} />
            <circle cx="41.2" cy="-64.2" r="0.55" fill="#fff" stroke="none" />
            <path d="M36.6 -58 q3 2 6.4 1.2" {...L} strokeWidth={0.8} opacity={0.5} />
            {/* antlers: a far and a near beam, each with brow and back tines */}
            <path d="M36 -70 C33.4 -75.6 34.4 -81.4 31.4 -88 M34 -77.4 L28.4 -80.4 M31.8 -85 L27 -86.6" {...L} strokeWidth={1.2} opacity={0.65} />
            <path d="M39.4 -71 C38.4 -77.6 40.4 -83.6 37.4 -91 M39 -78.6 L45.6 -83 M38.6 -84.8 L32.8 -87 M37.4 -91 L41.4 -97 M37.4 -91 L32.6 -95.6" {...L} strokeWidth={1.8} />
            <path d="M-8 -34 Q4 -30 14 -34" {...L} strokeWidth={0.9} opacity={0.4} />
        </P>
    )
}

export function Owl(p: PlaceProps) {
    return (
        <P {...p}>
            <path d="M-16 0 H16" {...L} strokeWidth={1.2} />
            <ellipse cx="0" cy="-16" rx="12" ry="15" {...F} />
            <path d="M-11 -28 L-9 -35 L-4 -29 M11 -28 L9 -35 L4 -29" {...L} strokeWidth={1.2} />
            <circle cx="-5" cy="-21" r="3.6" {...L} />
            <circle cx="5" cy="-21" r="3.6" {...L} />
            <circle cx="-5" cy="-21" r="1.1" {...DOT} />
            <circle cx="5" cy="-21" r="1.1" {...DOT} />
            <path d="M-1.5 -16 L0 -13 L1.5 -16" {...L} strokeWidth={1.1} />
            <path d="M-6 -8 Q0 -4 6 -8" {...L} strokeWidth={1} opacity={0.7} />
        </P>
    )
}

/** Toadstools: coral caps with paper spots on paper stems (colour sits inside the outlines, not over them). */
export function Mushrooms(p: PlaceProps) {
    const cap = { ...F, fill: 'var(--sc-accent)' }
    return (
        <P {...p}>
            <path d="M-4 -14 L-4 0 H6 L6 -14" {...F} />
            <path d="M-11 -14 Q-11 -27 1 -27 Q13 -27 13 -14 Z" {...cap} />
            <circle cx="-3" cy="-20" r="1.7" fill="var(--scene-fill)" />
            <circle cx="5" cy="-18.4" r="1.4" fill="var(--scene-fill)" />
            <path d="M22 -8 V0 H28 V-8" {...F} />
            <path d="M17 -8 Q17 -17 25 -17 Q33 -17 33 -8 Z" {...cap} fillOpacity={0.9} />
            <circle cx="23.4" cy="-12.6" r="1.1" fill="var(--scene-fill)" />
        </P>
    )
}

/** Wildflower: coral petals, sunny centre. (`FlowerClassic` below is the uncoloured outline the project-section mark keeps.) */
export function Flower({ warm: _warm, ...p }: PlaceProps & { warm?: boolean }) {
    return (
        <P {...p}>
            <path d="M0 0 V-24" {...L} />
            <path d="M0 -8 Q7 -12 10 -8 Q5 -5 0 -8" {...L} strokeWidth={1} fill="var(--sc-tree)" />
            {[0, 72, 144, 216, 288].map(a => (
                <ellipse key={a} cx="0" cy="-30" rx="3" ry="4.6" transform={`rotate(${a} 0 -25)`} {...L} fill="var(--sc-accent)" strokeWidth={1.1} />
            ))}
            <circle cx="0" cy="-25" r="2.6" fill="var(--sc-sun)" stroke="currentColor" strokeWidth={0.9} />
        </P>
    )
}

export function FlowerClassic({ warm, ...p }: PlaceProps & { warm?: boolean }) {
    return (
        <P {...p}>
            <path d="M0 0 V-24" {...L} />
            <path d="M0 -8 Q7 -12 10 -8 Q5 -5 0 -8" {...L} strokeWidth={1} />
            {[0, 72, 144, 216, 288].map(a => (
                <ellipse key={a} cx="0" cy="-30" rx="3" ry="4.6" transform={`rotate(${a} 0 -25)`} {...L} strokeWidth={1.1} />
            ))}
            <circle cx="0" cy="-25" r="2.4" {...(warm ? WARM : DOT)} />
        </P>
    )
}

/** Fern: three arching fronds, each a curved stem with leaflet pairs that taper to the tip. Leaflets are filled with the
 *  foliage token (a lighter tint on one side for a little light-and-shade), the stem is ink. ~44 tall, ~58 wide. */
const FERN_FRONDS: { b: [number, number][]; n: number; len: number; tint: number }[] = [
    { b: [[0, 0], [-6, -10], [-17, -17], [-28, -20]], n: 8, len: 10, tint: 0.78 },
    { b: [[0, 0], [7, -9], [18, -15], [29, -16]], n: 8, len: 10, tint: 0.7 },
    { b: [[0, 0], [0, -14], [2, -29], [7, -43]], n: 10, len: 11.5, tint: 0.92 },
]
function frondLeaves(f: (typeof FERN_FRONDS)[number]) {
    const [p0, p1, p2, p3] = f.b
    const at = (t: number): [number, number] => {
        const u = 1 - t
        return [
            u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
            u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
        ]
    }
    const ang = (t: number) => {
        const u = 1 - t
        const dx = 3 * u * u * (p1[0] - p0[0]) + 6 * u * t * (p2[0] - p1[0]) + 3 * t * t * (p3[0] - p2[0])
        const dy = 3 * u * u * (p1[1] - p0[1]) + 6 * u * t * (p2[1] - p1[1]) + 3 * t * t * (p3[1] - p2[1])
        return (Math.atan2(dy, dx) * 180) / Math.PI
    }
    const out: { x: number; y: number; a: number; l: number; light: boolean }[] = []
    for (let i = 0; i < f.n; i++) {
        const t = 0.16 + (0.84 * i) / (f.n - 1)
        const [x, y] = at(t)
        const l = f.len * (1 - 0.72 * t)
        const base = ang(t)
        out.push({ x, y, a: base - 58, l, light: true })
        out.push({ x, y, a: base + 58, l, light: false })
    }
    const [tx, ty] = at(1)
    out.push({ x: tx, y: ty, a: ang(1), l: f.len * 0.34, light: true })
    return out
}
export function Fern(p: PlaceProps) {
    return (
        <P {...p}>
            {FERN_FRONDS.map((f, k) => {
                const [p0, p1, p2, p3] = f.b
                const lightFill = `color-mix(in srgb, var(--sc-tree) ${Math.round(f.tint * 100)}%, var(--scene-fill))`
                return (
                    <g key={k}>
                        <path d={`M${p0[0]} ${p0[1]} C${p1[0]} ${p1[1]} ${p2[0]} ${p2[1]} ${p3[0]} ${p3[1]}`} {...L} strokeWidth={1.3} />
                        {frondLeaves(f).map((lf, i) => (
                            <ellipse
                                key={i}
                                cx={(lf.l / 2).toFixed(2)}
                                cy={0}
                                rx={(lf.l / 2).toFixed(2)}
                                ry={(lf.l * 0.2).toFixed(2)}
                                transform={`translate(${lf.x.toFixed(2)} ${lf.y.toFixed(2)}) rotate(${lf.a.toFixed(1)})`}
                                fill={lf.light ? lightFill : 'var(--sc-tree)'}
                                stroke="currentColor"
                                strokeWidth={0.8}
                                strokeLinejoin="round"
                            />
                        ))}
                    </g>
                )
            })}
        </P>
    )
}

/** Craggy peak. Defaults are the pale `--hill-1` look the About-card mark relies on; the hero passes `fill`
 *  and `shade` to tint it with the ground tokens and give it a shaded flank. */
export function Mountain({ w = 260, h = 150, snow = true, fill = 'var(--hill-1)', shade = false, ...p }: PlaceProps & { w?: number; h?: number; snow?: boolean; fill?: string; shade?: boolean }) {
    const hw = w / 2
    const peakX = hw * 0.12
    return (
        <P {...p}>
            <path
                d={`M${-hw} 0 L${-hw * 0.28} ${-h * 0.82} L${-hw * 0.1} ${-h * 0.7} L${peakX} ${-h} L${hw} 0 Z`}
                fill={fill}
                stroke="currentColor"
                strokeWidth={1.4}
                strokeLinejoin="round"
            />
            {shade && <path d={`M${peakX} ${-h} L${hw} 0 H${hw * 0.3} L${hw * 0.12} ${-h * 0.46} Z`} {...SHADE} />}
            {snow && (
                <path
                    d={`M${peakX - w * 0.09} ${-h * 0.8} L${peakX - w * 0.03} ${-h * 0.72} L${peakX + w * 0.02} ${-h * 0.79} L${peakX + w * 0.06} ${-h * 0.71} L${peakX + w * 0.1} ${-h * 0.78}`}
                    {...L}
                    strokeWidth={1.1}
                    opacity={0.8}
                />
            )}
        </P>
    )
}

export function Cabin(p: PlaceProps) {
    return (
        <P {...p}>
            <path d="M-30 0 V-30 H30 V0 Z" {...F} />
            <path d="M-38 -30 L0 -58 L38 -30 Z" {...F} />
            <path d="M16 -48 V-66 H26 V-40" {...F} />
            <rect x="-22" y="-22" width="14" height="13" {...GLOW} opacity={0.85} />
            <rect x="-22" y="-22" width="14" height="13" {...L} strokeWidth={1.1} />
            <path d="M-15 -22 V-9 M-22 -15.5 H-8" {...L} strokeWidth={0.8} />
            <path d="M8 0 V-20 H22 V0" {...L} strokeWidth={1.2} />
            <g className="scene-smoke">
                <path d="M21 -72 q-5 -6 0 -12 q5 -6 0 -12" {...L} strokeWidth={1.1} opacity={0.6} />
            </g>
        </P>
    )
}

export function Campfire({ halo = true, ...p }: PlaceProps & { halo?: boolean }) {
    return (
        <P {...p}>
            {halo && <g transform="translate(0 -8)"><Halo r={52} a={1.4} /></g>}
            <path d="M-18 -2 L16 -8 M-16 -8 L18 -2" {...L} strokeWidth={2.2} />
            <g className="scene-flicker">
                <path d="M0 -8 C-11 -14 -8 -26 -1 -34 C0 -26 8 -24 7 -14 C11 -18 12 -12 8 -8 Z" {...WARM} />
                <path d="M0 -8 C-5 -12 -3 -19 1 -23 C3 -18 6 -15 3 -8 Z" {...GLOW} />
            </g>
            <circle cx="-12" cy="0" r="2.6" {...F} />
            <circle cx="-4" cy="1" r="2.2" {...F} />
            <circle cx="6" cy="1" r="2.6" {...F} />
            <circle cx="14" cy="0" r="2.2" {...F} />
        </P>
    )
}

/** Camp tent: coral canvas, dark doorway, pole and a flap line. */
export function Tent(p: PlaceProps) {
    return (
        <P {...p}>
            <path d="M-26 0 L0 -34 L26 0 Z" fill="var(--sc-accent)" stroke="currentColor" strokeWidth={1.3} strokeLinejoin="round" />
            <path d="M0 -34 L26 0 H9 Z" {...SHADE} />
            <path d="M0 -34 L-7.5 0 H7.5 Z" fill="var(--sc-door)" stroke="currentColor" strokeWidth={1.1} strokeLinejoin="round" />
            <path d="M0 -34 V-50" {...L} strokeWidth={1.3} />
            <path d="M0 -50 L11 -46 L0 -42 Z" fill="var(--sc-accent)" stroke="currentColor" strokeWidth={1} strokeLinejoin="round" />
            <path d="M-26 0 L-34 2 M26 0 L34 2" {...L} strokeWidth={0.9} opacity={0.6} />
        </P>
    )
}

/** Wayfinding post: brown wooden post, tan boards with a painted arrow line, a coral cap. */
export function Signpost(p: PlaceProps) {
    return (
        <P {...p}>
            <path d="M0 0 V-72" {...L} strokeWidth={4.6} />
            <path d="M0 0 V-72" stroke="var(--sc-trunk)" strokeWidth={2.6} strokeLinecap="round" fill="none" />
            <path d="M0 -66 H34 L42 -59 L34 -52 H0 Z" {...F} fill="var(--sc-sign)" />
            <path d="M0 -46 H-30 L-38 -39 L-30 -32 H0 Z" {...F} fill="var(--sc-sign)" />
            <path d="M8 -59 H26 M-8 -39 H-24" stroke="var(--sc-accent)" strokeWidth={1.6} strokeLinecap="round" fill="none" />
            <circle cx={0} cy={-72} r={2.6} fill="var(--sc-accent)" stroke="currentColor" strokeWidth={1} />
        </P>
    )
}

export function Firefly({ delay = 0, ...p }: PlaceProps & { delay?: number }) {
    return (
        <P {...p}>
            <g className="scene-twinkle" style={{ animationDelay: `${delay}s` }}>
                <circle r={5} {...GLOW} opacity={0.3} />
                <circle r={1.7} {...GLOW} />
            </g>
        </P>
    )
}

/** the fox: a russet-tan coat (still light enough to read in both themes), brown socks / ear linings, cream bib + tail tip */
const COAT = 'color-mix(in srgb, var(--scene-warm) 58%, var(--sc-body))'

const SOCK = 'color-mix(in srgb, var(--sc-trunk) 72%, var(--scene-warm))'

const CREAM = 'color-mix(in srgb, #ffffff 70%, var(--scene-fill))'

/** deer: a warm tan coat with a darker far-side leg; hare: soft grey-brown with pink inner ears */
const DEER = 'color-mix(in srgb, var(--sc-trunk) 38%, var(--sc-body))'

const DEER_FAR = 'color-mix(in srgb, var(--sc-trunk) 58%, var(--sc-body))'

const HARE = 'color-mix(in srgb, var(--sc-trunk) 20%, var(--sc-body))'

const PINK = 'color-mix(in srgb, var(--sc-accent) 50%, var(--sc-body))'

/** cloud-like union of circles with clean outer outline */
function Blob({ c, fill = 'var(--scene-fill)' }: { c: [number, number, number][]; fill?: string }) {
    return (
        <>
            {c.map(([x, y, r], i) => (
                <circle key={`s${i}`} cx={x} cy={y} r={r} {...L} />
            ))}
            {c.map(([x, y, r], i) => (
                <circle key={`f${i}`} cx={x} cy={y} r={r - 0.75} fill={fill} stroke="none" />
            ))}
        </>
    )
}
