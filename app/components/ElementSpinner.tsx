import type { CSSProperties } from 'react'
import { NATURE, SPACE } from '@/app/components/CardElementMarks'
import '@/app/styles/element-marks.css'

/**
 * The loading indicator: the same four marks as the hackathon cards, riding a slowly turning ring and staying upright as they go.
 * Nature shows the four Avatar elements, Space the four Star Wars emblems, crossfaded with the theme like every other scene.
 * Announced to screen readers as a polite status; the caption stays visible, so it still reads as "loading" when motion is reduced.
 */
export default function ElementSpinner({ label = 'Loading' }: { label?: string }) {
    const sets = [['nature', NATURE], ['space', SPACE]] as const
    return (
        <div className="element-spinner" role="status" aria-live="polite">
            <div className="element-spinner-ring" aria-hidden="true">
                {sets.map(([key, list]) => (
                    <div key={key} className={`element-spinner-set scene-${key}`}>
                        {list.map(({ name, Mark }, i) => (
                            <span key={name} className="element-spinner-mark" style={{ '--i': i } as CSSProperties}>
                                <svg viewBox="0 0 24 24"><Mark /></svg>
                            </span>
                        ))}
                    </div>
                ))}
            </div>
            <span className="element-spinner-label">{label}</span>
        </div>
    )
}