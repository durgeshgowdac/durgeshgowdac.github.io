/**
 * A tiny story beat: "Chapter 02 · The Trail — every project is a waypoint".
 * Renders BOTH themes' wording; CSS shows the one that matches the active
 * theme (.t-nature / .t-space), so it costs no JS and never flashes. The
 * ScrollRail reads the data-* attributes to label its stops.
 */
export default function ChapterBadge({
  n,
  nature,
  space,
  natureNote,
  spaceNote,
  className = '',
}: {
  n: string
  nature: string
  space: string
  natureNote?: string
  spaceNote?: string
  className?: string
}) {
  return (
    <div className={`chapter-mark ${className}`} data-n={n} data-nature={nature} data-space={space}>
      <span className="chapter-n">Ch.&nbsp;{n}</span>
      <span className="chapter-rule" aria-hidden="true" />
      <span className="t-nature">
        <b>{nature}</b>
        {natureNote && <em> — {natureNote}</em>}
      </span>
      <span className="t-space">
        <b>{space}</b>
        {spaceNote && <em> — {spaceNote}</em>}
      </span>
    </div>
  )
}
