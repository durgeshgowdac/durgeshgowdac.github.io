// Small abstract line-art glyphs, one per project, used on project cards and
// the project detail hero. These are intentionally NOT fake screenshots —
// they're a lightweight visual identity per project (à la a recurring design
// motif) until real screenshots/GIFs of each project are available. Swap in
// real media via a future `media` field on Project without removing this —
// it's a reasonable permanent fallback for projects that never get one.
'use client'
import type { ReactNode } from 'react'

const STROKE = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

function Glyph({ children, label, name }: { children: ReactNode; label: string; name: string }) {
  return (
    <svg
      className={`project-glyph glyph-${name}`}
      viewBox="0 0 48 32"
      width="48"
      height="32"
      role="img"
      aria-label={label}
    >
      {children}
    </svg>
  )
}

export default function ProjectIcon({ slug }: { slug: string }) {
  switch (slug) {
    // GlyphScholar — an open book with a magnifier over the page: reads the page, cites the page
    case 'glyphscholar':
      return (
        <Glyph label="Open book with a magnifying glass" name="glyphscholar">
          <path d="M5 8 Q14 5 23 9 V27 Q14 23 5 26 Z" {...STROKE} />
          <path d="M41 8 Q32 5 23 9 V27 Q32 23 41 26 Z" {...STROKE} />
          <path d="M9 13 Q14 12 19 14 M9 17.5 Q14 16.5 19 18.5 M9 22 Q12 21 15 22" {...STROKE} opacity={0.65} />
          <g className="glyph-cite">
            <circle cx="33" cy="16" r="6" {...STROKE} />
            <path d="M37.5 20.5 L42 25" {...STROKE} strokeWidth={1.8} />
            <path d="M30.5 15.5 H35.5 M30.5 18 H34" {...STROKE} strokeWidth={1} opacity={0.7} />
          </g>
        </Glyph>
      )
    // MLXnarrator — a speech bubble holding a sound wave: a silent recording gets its voice
    case 'mlxnarrator':
      return (
        <Glyph label="Speech bubble with a sound wave" name="mlxnarrator">
          <path d="M8 4 H40 Q43 4 43 7 V18 Q43 21 40 21 H27 L20 27.5 V21 H8 Q5 21 5 18 V7 Q5 4 8 4 Z" {...STROKE} />
          {[[12, 10.5, 14.5], [17, 8.5, 16.5], [22, 6.5, 18.5], [27, 9, 16], [32, 7.5, 17.5], [37, 10.5, 14.5]].map(([x, a, b], i) => (
            <path key={x} className="glyph-bar" style={{ transitionDelay: `${i * 40}ms` }} d={`M${x} ${a} V${b}`} {...STROKE} strokeWidth={1.8} />
          ))}
        </Glyph>
      )
    // RoleSense — a resume being scanned/checked off
    case 'rolesense':
      return (
        <Glyph label="Resume being scanned and checked" name="rolesense">
          <rect x="14" y="4" width="20" height="26" rx="1.5" {...STROKE} />
          <path d="M18 11h12M18 15.5h12M18 20h7" {...STROKE} opacity={0.7} />
          <circle className="glyph-scan" cx="33" cy="24" r="7" {...STROKE} />
          <path className="glyph-scan" d="M30.2 24l2 2 3.5-4" {...STROKE} />
        </Glyph>
      )
    // FoundYou — one person, boxed and ID'd, seen by two cameras; the dotted sight-lines "search" on hover
    case 'foundyou':
      return (
        <Glyph label="Person tracked by two cameras" name="foundyou">
          <rect x="17" y="4.5" width="14" height="23" rx="1.6" {...STROKE} strokeDasharray="3.2 2.2" />
          <circle cx="24" cy="11.5" r="3" {...STROKE} />
          <path d="M19 25.5 Q19 17.6 24 17.6 Q29 17.6 29 25.5" {...STROKE} />
          <rect x="2" y="2.5" width="8" height="5.5" rx="1.1" {...STROKE} />
          <path d="M10 4 L13 2.6 V7.9 L10 6.5" {...STROKE} />
          <rect x="38" y="24" width="8" height="5.5" rx="1.1" {...STROKE} />
          <path d="M38 25.5 L35 24.1 V29.4 L38 28" {...STROKE} />
          <path className="glyph-links" d="M12 6 L17 9.5 M34 26 L31 23" {...STROKE} strokeDasharray="1 3.2" />
        </Glyph>
      )
    // AVL Tree Visualizer — nodes pop in sequence, like an insertion animating
    case 'avl-visualizer':
      return (
        <Glyph label="Balanced tree diagram" name="avl-visualizer">
          <path d="M22 9.5L14 15.5M26 9.5L34 15.5M10 20.5L7 25.5M14 20.5L17 25.5" {...STROKE} />
          <circle className="glyph-node" style={{ animationDelay: '0ms' }}  cx="24" cy="7"  r="3"   {...STROKE} />
          <circle className="glyph-node" style={{ animationDelay: '70ms' }} cx="12" cy="18" r="3"   {...STROKE} />
          <circle className="glyph-node" style={{ animationDelay: '70ms' }} cx="36" cy="18" r="3"   {...STROKE} />
          <circle className="glyph-node" style={{ animationDelay: '140ms' }} cx="6" cy="28" r="2.6" {...STROKE} />
          <circle className="glyph-node" style={{ animationDelay: '140ms' }} cx="18" cy="28" r="2.6" {...STROKE} />
        </Glyph>
      )
    // ArtAttack — a gallery picture vandalised: a paint splotch across the frame with drips running down it
    case 'art-attack':
      return (
        <Glyph label="Gallery painting with paint dripping down it" name="art-attack">
          <rect x="9" y="4" width="30" height="23" rx="1.4" {...STROKE} />
          <rect x="12" y="7" width="24" height="17" rx="0.8" {...STROKE} opacity={0.4} />
          <path d="M13 11 C14.5 8.2 19 9.2 22 8.4 C26 7.4 30.5 8 33 9.8 C35 11.4 32.6 14 29.5 13.6 C26.5 13.2 24 14.2 20.5 14 C17 13.8 12 14 13 11 Z" {...STROKE} />
          <path d="M17 14 V19.5 M24 14 V22.5 M30.5 13.8 V18" {...STROKE} />
          <circle cx="17" cy="21" r="1.3" {...STROKE} />
          <circle cx="24" cy="24" r="1.3" {...STROKE} />
          <circle cx="30.5" cy="19.5" r="1.1" {...STROKE} />
          <g className="glyph-rays">
            <circle cx="42.5" cy="9" r="1.6" fill="currentColor" stroke="none" />
            <circle cx="5.5" cy="12" r="1.3" fill="currentColor" stroke="none" />
            <circle cx="44" cy="21" r="1.1" fill="currentColor" stroke="none" />
            <circle cx="4.5" cy="23" r="1" fill="currentColor" stroke="none" />
          </g>
        </Glyph>
      )
    // Newton-Gravity — the apple falls toward a world while a moon orbits it (the orbit turns on hover)
    case 'newton-gravity':
      return (
        <Glyph label="Apple falling toward a planet with an orbiting moon" name="newton-gravity">
          <circle cx="24" cy="46" r="21" {...STROKE} />
          <g className="glyph-orbit">
            <circle cx="24" cy="46" r="26" {...STROKE} strokeDasharray="1 3.4" opacity={0.7} />
            <circle cx="40.7" cy="26.1" r="2.3" fill="currentColor" stroke="none" />
          </g>
          <path d="M17 6.5 C14 4.8 11 7.6 12.6 10.8 C13.6 12.8 15.4 13.4 17 12.7 C18.6 13.4 20.4 12.8 21.4 10.8 C23 7.6 20 4.8 17 6.5 Z" {...STROKE} />
          <path d="M17 6.5 V4 M17.4 4.6 Q20.2 2.6 21.6 4.4" {...STROKE} />
          <path d="M17 16 V22.5 M14.8 20.4 L17 22.8 L19.2 20.4" {...STROKE} strokeDasharray="1 2.6" />
        </Glyph>
      )
    // SAMS — an attendance roster: present students tick in one after another, the absent one stays blank
    case 'sams':
      return (
        <Glyph label="Attendance roster with check marks" name="sams">
          <rect x="4" y="3" width="40" height="26" rx="2" {...STROKE} />
          {[8.5, 16, 23.5].map(y => (
            <g key={y}>
              <circle cx="10" cy={y} r="2" {...STROKE} />
              <path d={`M15 ${y} H29`} {...STROKE} opacity={0.65} />
              <rect x="34" y={y - 2.8} width="5.6" height="5.6" rx="1.3" {...STROKE} />
            </g>
          ))}
          <path className="glyph-cell" style={{ animationDelay: '0ms' }}   d="M35.2 8.6 L36.8 10.2 L39 7.2" {...STROKE} />
          <path className="glyph-cell" style={{ animationDelay: '90ms' }}  d="M35.2 16.1 L36.8 17.7 L39 14.7" {...STROKE} opacity={0} />
          <path className="glyph-cell" style={{ animationDelay: '180ms' }} d="M35.2 23.6 L36.8 25.2 L39 22.2" {...STROKE} />
        </Glyph>
      )
    // Twitter Bot EDA — humans (hollow, spread out) vs bots (solid, suspiciously tight), the cluster ringed
    case 'twitter-bot-eda':
      return (
        <Glyph label="Scatter plot separating bot accounts from human ones" name="twitter-bot-eda">
          <path d="M5 28V5M5 28h38" {...STROKE} />
          <ellipse cx="35" cy="11.5" rx="7.5" ry="5.2" {...STROKE} strokeDasharray="2 2" opacity={0.75} />
          {[[12, 21], [17, 14.5], [21, 23], [27, 19], [12.5, 11], [24, 11.5]].map(([x, y], i) => (
            <circle key={i} className="glyph-dot" style={{ animationDelay: `${i * 40}ms` }} cx={x} cy={y} r="1.9" {...STROKE} />
          ))}
          {[[32, 9.5], [36, 8.8], [38.5, 12.5], [33.5, 13.5], [36.5, 15]].map(([x, y], i) => (
            <circle key={i} className="glyph-dot" style={{ animationDelay: `${240 + i * 40}ms` }} cx={x} cy={y} r="1.5" fill="currentColor" stroke="none" />
          ))}
        </Glyph>
      )
    // Loan Data Processing — a messy table (a struck-out duplicate row) is piped into a tidy, checked one
    case 'loan-data-processing':
      return (
        <Glyph label="Messy loan table being cleaned into a tidy one" name="loan-data-processing">
          {/* before: ragged rows, one crossed out */}
          <rect x="3" y="5" width="18" height="22" rx="2.2" {...STROKE} strokeDasharray="2.6 2" opacity={0.8} />
          <path d="M6.5 10.5h7M6.5 15.5h10M6.5 20.5h5" {...STROKE} opacity={0.8} />
          <path className="glyph-dirty" d="M4.6 15.5L19.4 15.5" {...STROKE} strokeWidth={1.6} />
          <path d="M15.4 19.2l3 3M18.4 19.2l-3 3" {...STROKE} strokeWidth={1.1} opacity={0.8} />
          {/* the pipeline arrow */}
          <path d="M23.5 16h6.5M27.6 13.2L30.4 16l-2.8 2.8" {...STROKE} />
          {/* after: aligned rows, a check, and a coin for the loan */}
          <g className="glyph-clean">
            <rect x="33" y="5" width="12" height="22" rx="2.2" {...STROKE} />
            <path d="M36 10h6M36 14.5h6" {...STROKE} />
            <path d="M36.2 21.2l2 2 3.6-3.8" {...STROKE} strokeWidth={1.6} />
          </g>
        </Glyph>
      )
    default:
      return (
        <Glyph label="Project" name="default">
          <rect x="8" y="8" width="32" height="16" rx="2" {...STROKE} />
        </Glyph>
      )
  }
}
