/**
 * The hero's three changing lines (the typed greeting, the rotating word, the "currently" badge) take turns, one after the other,
 * so only one of them is ever moving. Each registers a `step` in its slot; one shared loop runs slot 0, waits, runs slot 1, waits,
 * runs slot 2, waits, and round again. A step resolves when its own animation is finished, so a long typed line never overlaps the next change.
 * Reduced-motion visitors never register, so nothing moves. The loop runs only while at least one step is registered.
 */
export const HERO_SLOT = { greeting: 0, word: 1, badge: 2 } as const
const SLOTS = 3
const GAP = 1500   // ms of stillness between one change and the next

type Step = () => Promise<void>
const steps: (Step | undefined)[] = []
let gen = 0
let starter: ReturnType<typeof setTimeout> | undefined
let running = false

const wait = (ms: number) => new Promise<void>(res => setTimeout(res, ms))

async function loop(mine: number) {
    let slot = 0
    while (gen === mine) {
        const step = steps[slot]
        if (step) { try { await step() } catch { /* a step that fails must not stop the others */ } }
        if (gen !== mine) return
        await wait(GAP)
        slot = (slot + 1) % SLOTS
    }
}

export function registerHeroStep(slot: number, step: Step) {
    steps[slot] = step
    clearTimeout(starter)
    // wait one tick so all three components have registered before the first turn starts (and so a strict-mode remount doesn't start two loops)
    starter = setTimeout(() => { if (!running) { running = true; loop(gen) } }, 0)
    return () => {
        if (steps[slot] === step) steps[slot] = undefined
        if (!steps.some(Boolean)) { gen++; running = false; clearTimeout(starter) }
    }
}