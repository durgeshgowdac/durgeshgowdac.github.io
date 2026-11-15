'use client'

import type { ReactNode } from 'react'
import { L } from '@/app/components/scenery/illustrations'
import {
    Harry, Hedwig, Snitch, Bat, Quaffle, Bludger, Hoops, Tag, Bubble, FAR_HAND,
    HARRY_LOOK, RED_LOOK, GREEN_LOOK, type Look,
} from '@/app/components/scenery/quidditch'
import {
    Scoreboard, Stand, Badge, WinBanner, Ferret, LionCrest, SnakeCrest, GRYFFINDOR, SLYTHERIN, STANDS,
} from '@/app/components/scenery/stadium'
import {
    DUR, T, PITCH, FAR_GROUND, GOAL_L, GOAL_R, HOOPS_L, HOOPS_R, HOOP_GAP, HOOP_RING, PLAYER_S, HEDWIG_S, FERRET_S, SNITCH_S, BALL_S, HOLD_REACH, HEDWIG_AT, FERRET_AT,
    harry, harryReach, draco, dracoReach, snitch, snitchTilt, snitchFacing,
    chaserSPose, chaserGPose, keeperGPose, keeperSPose, beaterGPose, beaterSPose,
    quaffle, bludger1, bludger2, batGAngle, batSAngle, hitBurstG, hitBurstS, BURST_G, BURST_S,
    tagL, tagR, TAG_L_AT, TAG_R_AT, bubble, tag150, banner, chantRed, chantGreen, BUBBLE_AT, TAG150_AT,
    SCORE_STEPS, scoreAt, keyframes, type Pt,
} from '@/app/components/scenery/quidditchTimeline'

/**
 * "The Catch" — Space version (Ch.01 header): the Gryffindor vs Slytherin Quidditch Tournament.
 *
 * One pitch, one scale. Eight riders — a Chaser, a Beater, a Keeper and a Seeker for each house — are the same drawing at the same
 * size, in scarlet-and-gold (the lion) and emerald-and-silver (the snake). The goals are three tall hoops at each end of an oval
 * lawn; the four stands (red, yellow, blue, green) sit behind the pitch, red beside the Gryffindor scoreboard on the left and green
 * beside the Slytherin scoreboard on the right, and chant in turns. The scoreboards are seven-segment screens that start at 0 and
 * climb by 10 for every goal; when Harry grabs the Snitch Gryffindor gets 150, the game ends, the rest of the match freezes and
 * "Gryffindor Wins!" shows over the final scores.
 *
 * There are always four balls on screen — a red Quaffle, two silver Bludgers and the gold Snitch. After a goal (or a miss) the
 * Keeper behind the hoops catches the Quaffle and throws it back to his own Chaser, so nothing ever fades in or out.
 *
 * One loop on ONE SMIL clock: every track below is a sampled function of the timeline in scenery/quidditchTimeline.ts
 * (`dur=DUR`, `repeatCount=indefinite`), so the match, the scores, the catch and the banner can never disagree. The only loops
 * with their own short period are the wing beats, the scarves and the crowd's bobbing — the wind's and the crowd's own rhythm.
 *
 * `reduce` = a visitor who prefers reduced motion: the same functions evaluated once, at T.STILL — the catch pose, bubble and
 * banner showing, final scores up. Coordinates: a 780 × 150 canvas.
 */
export const SPACE_STILL = T.STILL

type Pose = { x: number; y: number; sx: number; rot: number }
const dur = `${DUR}s`
const kt = (times: number[]) => times.map(t => +(t / DUR).toFixed(4)).join(';')
const smil = { dur, repeatCount: 'indefinite' as const }

/** places its children at a pose from `f`: translate → rotate → mirror → scale; animated on the clock unless `still` is a time */
function Actor({ f, s, still, step = 0.1, tol = 0.25, children }: { f: (t: number) => Pose; s: number; still: number | null; step?: number; tol?: number; children: ReactNode }) {
    if (still !== null) {
        const p = f(still)
        return <g transform={`translate(${p.x.toFixed(2)} ${p.y.toFixed(2)}) rotate(${p.rot.toFixed(2)}) scale(${(p.sx * s).toFixed(3)} ${s})`}>{children}</g>
    }
    const pos = keyframes(t => { const p = f(t); return [p.x, p.y] }, step, tol)
    const rot = keyframes(t => [f(t).rot], step, tol * 2)
    const sx = keyframes(t => [f(t).sx], step, 0.02)
    const p0 = f(0)
    return (
        <g transform={`translate(${p0.x.toFixed(2)} ${p0.y.toFixed(2)})`}>
            <animateTransform attributeName="transform" type="translate" {...smil} keyTimes={kt(pos.times)} values={pos.values.map(v => v.join(' ')).join(';')} />
            <g transform={`rotate(${p0.rot.toFixed(2)})`}>
                <animateTransform attributeName="transform" type="rotate" {...smil} keyTimes={kt(rot.times)} values={rot.values.map(v => v[0]).join(';')} />
                <g transform={`scale(${p0.sx.toFixed(3)} 1)`}>
                    <animateTransform attributeName="transform" type="scale" {...smil} keyTimes={kt(sx.times)} values={sx.values.map(v => `${v[0]} 1`).join(';')} />
                    <g transform={`scale(${s})`}>{children}</g>
                </g>
            </g>
        </g>
    )
}

/** opacity + a pop-in scale at a fixed place; `f` gives { o, s } (used for the score tags and the speech bubble only) */
function Pop({ f, at, still, step = 0.05, children }: { f: (t: number) => { o: number; s: number }; at: Pt; still: number | null; step?: number; children: ReactNode }) {
    if (still !== null) {
        const v = f(still)
        return <g opacity={v.o} transform={`translate(${at[0]} ${at[1]}) scale(${v.s.toFixed(3)})`}>{children}</g>
    }
    const o = keyframes(t => [f(t).o], step, 0.01), s = keyframes(t => [f(t).s], step, 0.01)
    const v0 = f(0)
    return (
        <g opacity={v0.o}>
            <animate attributeName="opacity" {...smil} keyTimes={kt(o.times)} values={o.values.map(v => v[0]).join(';')} />
            <g transform={`translate(${at[0]} ${at[1]})`}>
                <g transform={`scale(${v0.s})`}>
                    <animateTransform attributeName="transform" type="scale" {...smil} keyTimes={kt(s.times)} values={s.values.map(v => v[0]).join(';')} />
                    {children}
                </g>
            </g>
        </g>
    )
}

/** a ball: always there, always moving or held */
function Ball({ f, still, step = 0.05, children }: { f: (t: number) => Pt; still: number | null; step?: number; children: ReactNode }) {
    if (still !== null) { const v = f(still); return <g transform={`translate(${v[0].toFixed(2)} ${v[1].toFixed(2)})`}>{children}</g> }
    const pos = keyframes(t => f(t), step, 0.2)
    const v0 = f(0)
    return (
        <g transform={`translate(${v0[0].toFixed(2)} ${v0[1].toFixed(2)})`}>
            <animateTransform attributeName="transform" type="translate" {...smil} keyTimes={kt(pos.times)} values={pos.values.map(v => v.join(' ')).join(';')} />
            {children}
        </g>
    )
}

/** a Beater's bat in the rear fist: rotates about the grip on the clock (angle 0 points forward along the broom) */
function BatSwing({ angle, still }: { angle: (t: number) => number; still: number | null }) {
    const [gx, gy] = FAR_HAND
    if (still !== null) return <g transform={`rotate(${angle(still).toFixed(1)} ${gx} ${gy})`}><Bat x={gx} y={gy} /></g>
    const a = keyframes(t => [angle(t)], 0.05, 1)
    return (
        <g transform={`rotate(${angle(0).toFixed(1)} ${gx} ${gy})`}>
            <animateTransform attributeName="transform" type="rotate" {...smil} keyTimes={kt(a.times)} values={a.values.map(v => `${v[0]} ${gx} ${gy}`).join(';')} />
            <Bat x={gx} y={gy} />
        </g>
    )
}

/** three tiny strokes where a bat meets a Bludger; `dir` = which way they fan out */
function HitBurst({ f, at, dir, still }: { f: (t: number) => number; at: Pt; dir: 1 | -1; still: number | null }) {
    const d = `M${-2.5 * dir} -1.5 L${-4.2 * dir} -2.5 M${-2.8 * dir} 0 L${-4.8 * dir} 0 M${-2.5 * dir} 1.5 L${-4.2 * dir} 2.5`
    if (still !== null) return <g opacity={f(still)} transform={`translate(${at[0]} ${at[1]})`}><path d={d} {...L} strokeWidth={0.7} /></g>
    const o = keyframes(t => [f(t)], 0.04, 0.02)
    return (
        <g transform={`translate(${at[0]} ${at[1]})`}>
            <g opacity={0}>
                <animate attributeName="opacity" {...smil} keyTimes={kt(o.times)} values={o.values.map(v => v[0]).join(';')} />
                <path d={d} {...L} strokeWidth={0.7} />
            </g>
        </g>
    )
}

/** one rider of the match: the shared drawing in a team's colours, carrying the Quaffle arm (`reach`) and an optional bat */
function Player({ f, look, still, reduce, reach = HOLD_REACH, bat }: { f: (t: number) => Pose; look: Look; still: number | null; reduce: boolean; reach?: number; bat?: (t: number) => number }) {
    return (
        <Actor f={f} s={PLAYER_S} still={still} step={0.1} tol={0.2}>
            <Harry look={look} reach={reach} wobble={!reduce} farHand={bat ? <BatSwing angle={bat} still={still} /> : undefined} />
        </Actor>
    )
}


/** a digit of a team's score over the loop: the three digits (hundreds, tens, ones) with leading zeros left blank */
function scoreDigits(team: 'g' | 's', still: number | null) {
    const at = (v: number, pos: number) => { const str = String(v).padStart(3, ' '); const ch = str[pos]; return ch === ' ' ? null : ch }
    return [0, 1, 2].map(pos => {
        if (still !== null) return { value: at(scoreAt(still)[team], pos) }
        return { seq: { dur, times: SCORE_STEPS.map(st => +(st.t / DUR).toFixed(4)), digits: SCORE_STEPS.map(st => at(st[team], pos)) } }
    })
}

const DRACO_LOOK: Look = { ...GREEN_LOOK, hair: 'var(--sc-snow)' }

export default function QuidditchScene({ reduce }: { reduce: boolean }) {
    const st = reduce ? SPACE_STILL : null
    const arm = (f: (t: number) => number) => { const k = reduce ? null : keyframes(t => [f(t)], 0.05, 0.01); return k ? { dur: DUR, times: k.times.map(t => +(t / DUR).toFixed(4)), values: k.values.map(v => v[0]) } : undefined }
    const harryArm = arm(harryReach), dracoArm = arm(dracoReach)
    const snitchPose = (t: number): Pose => { const [x, y] = snitch(t); return { x, y, sx: snitchFacing(t), rot: snitchTilt(t) } }
    const finalLabel = (c: string) => <Pop f={banner} at={[0, 0]} still={st}><text fontSize={6} fontWeight={800} fill={c} stroke="none" fontFamily="inherit">FINAL</text></Pop>
    const standScale = 0.43, standRows = 4, standH = ((standRows - 1) * 24 + 22) * standScale, standTop = FAR_GROUND - standH
    return (
        <g>
            {/* ── the ground: a far ground line the stands rest on, and the near ground under the pitch and the title ── */}
            <rect y={FAR_GROUND} width={780} height={150 - FAR_GROUND} className="sc-far" />
            <path d={`M0 ${FAR_GROUND} H780`} {...L} strokeWidth={0.8} opacity={0.35} />
            <rect y={125} width={780} height={25} className="sc-mid" />

            {/* ── the four stands, far behind and dimmed: red on the Gryffindor side, green on the Slytherin side ── */}
            {STANDS.map(s => (
                <g key={s.id} opacity={0.5} transform={`translate(${s.x} ${standTop.toFixed(2)}) scale(${standScale})`}>
                    <Stand x={0} y={0} rows={standRows} color={s.color} still={reduce} deep={s.id === 'green'} />
                </g>
            ))}

            {/* ── the scoreboards sit centred in the space beside each goal (seven-segment screens); Hedwig perches on the top-right of Gryffindor's, a white ferret on the top-left of Slytherin's — both facing the game ── */}
            <Scoreboard x={8.5} y={57.5} s={0.54} team={GRYFFINDOR} crest={<LionCrest />} digits={scoreDigits('g', st)} final={finalLabel('var(--scene-glow)')} />
            <Scoreboard x={693.6} y={57.5} s={0.54} team={SLYTHERIN} crest={<SnakeCrest />} digits={scoreDigits('s', st)} final={finalLabel('var(--sc-snow)')} />
            <Actor f={() => ({ x: HEDWIG_AT[0], y: HEDWIG_AT[1], sx: 1, rot: 0 })} s={HEDWIG_S} still={st ?? 0}><Hedwig flap={false} wing={-34} /></Actor>
            <g transform={`translate(${FERRET_AT[0]} ${FERRET_AT[1]}) scale(${-FERRET_S} ${FERRET_S})`}><Ferret wag={!reduce} /></g>

            {/* ── one pitch: an oval lawn, a goal of three hoops at each end; the title plate underneath ── */}
            <ellipse cx={PITCH.cx} cy={PITCH.y} rx={PITCH.rx} ry={PITCH.ry} fill="var(--sc-near)" stroke="currentColor" strokeWidth={0.9} />
            <path d={`M${PITCH.cx} ${PITCH.y - PITCH.ry} V${PITCH.y + PITCH.ry}`} {...L} strokeWidth={0.6} opacity={0.5} />
            <Hoops x={GOAL_L.x} y={GOAL_L.y} heights={HOOPS_L} gap={HOOP_GAP} rx={HOOP_RING.rx} ry={HOOP_RING.ry} pw={1.7} />
            <Hoops x={GOAL_R.x} y={GOAL_R.y} heights={HOOPS_R} gap={HOOP_GAP} rx={HOOP_RING.rx} ry={HOOP_RING.ry} pw={1.7} />
            <g transform="translate(390 136) scale(0.74)"><Badge x={0} y={0} h={25} title="Gryffindor vs Slytherin Quidditch Tournament" /></g>

            {/* ── the match: Keepers behind the goals, Beaters at the top, a Chaser from each house ── */}
            <Player f={keeperGPose} look={RED_LOOK} still={st} reduce={reduce} />
            <Player f={keeperSPose} look={GREEN_LOOK} still={st} reduce={reduce} />
            <Player f={beaterGPose} look={RED_LOOK} still={st} reduce={reduce} reach={0} bat={batGAngle} />
            <Player f={beaterSPose} look={GREEN_LOOK} still={st} reduce={reduce} reach={0} bat={batSAngle} />
            <Player f={chaserGPose} look={RED_LOOK} still={st} reduce={reduce} />
            <Player f={chaserSPose} look={GREEN_LOOK} still={st} reduce={reduce} />

            {/* ── the balls, always in play: red Quaffle, two silver Bludgers (the gold Snitch is below) ── */}
            <Ball f={quaffle} still={st}><Quaffle s={BALL_S} /></Ball>
            <Ball f={bludger1} still={st}><Bludger s={BALL_S} /></Ball>
            <Ball f={bludger2} still={st}><Bludger s={BALL_S} /></Ball>
            <HitBurst f={hitBurstG} at={BURST_G} dir={1} still={st} />
            <HitBurst f={hitBurstS} at={BURST_S} dir={-1} still={st} />
            <Pop f={tagL} at={TAG_L_AT} still={st}><Tag text="+10" w={20} h={9} size={6.4} /></Pop>
            <Pop f={tagR} at={TAG_R_AT} still={st}><Tag text="+10" w={20} h={9} size={6.4} /></Pop>

            {/* ── the Seekers and the Snitch ── */}
            <Actor f={draco} s={PLAYER_S} still={st} step={0.1} tol={0.1}><Harry look={DRACO_LOOK} reach={dracoReach(st ?? 0)} arm={dracoArm} wobble={!reduce} /></Actor>
            <Actor f={harry} s={PLAYER_S} still={st} step={0.1} tol={0.1}><Harry look={HARRY_LOOK} reach={harryReach(st ?? 0)} arm={harryArm} wobble={!reduce} /></Actor>
            <Actor f={snitchPose} s={SNITCH_S} still={st} step={0.04} tol={0.12}><Snitch flutter={!reduce} /></Actor>

            {/* ── the crowd chants in turns (above the stands); the catch; the winner (in the clear sky at the top) ── */}
            <Pop f={chantRed} at={[STANDS[0].x + 69, 24]} still={st}><Bubble text="Go, Go, Gryffindor!" w={106} h={15} tail={5} tailFrac={0.5} size={7.8} /></Pop>
            <Pop f={chantGreen} at={[STANDS[3].x + 69, 24]} still={st}><Bubble text="Slytherin for the win!" w={117} h={15} tail={5} tailFrac={0.5} size={7.6} /></Pop>
            <Pop f={bubble} at={BUBBLE_AT} still={st}><Bubble text="I’ve got the snitch!" w={112} h={17} tail={5} size={8} /></Pop>
            <Pop f={tag150} at={TAG150_AT} still={st}><Tag text="+150" w={26} h={10} size={7} /></Pop>
            <Pop f={banner} at={[390, 13]} still={st}><g transform="scale(0.68)"><WinBanner text="Gryffindor Wins!" /></g></Pop>
        </g>
    )
}