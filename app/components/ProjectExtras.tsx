'use client'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import ProjectIcon from '@/app/components/ProjectIcon'
import { CONTACTS, emailHref } from '@/app/lib/contacts'
import type { Project } from '@/app/lib/projects'

/** Facts about the GitHub repo, fetched once at build time (see projects/[slug]/page.tsx). */
export type RepoInfo = { language: string | null; pushedAt: string | null; stars: number }

const ARROW = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M7 17L17 7M17 7H7M17 7v10" />
  </svg>
)

/** "At a glance" — three or four verifiable numbers, shown before any prose. */
export function ResultsStrip({ items }: { items?: Project['results'] }) {
  if (!items || items.length === 0) return null
  return (
    <section className="proj-results" aria-label="Project at a glance">
      <div className="proj-results-head">
        <span className="t-nature">Trail stats</span>
        <span className="t-space">Telemetry</span>
        <span> · at a glance</span>
      </div>
      <ul className="proj-results-grid" style={{ ['--n' as string]: items.length }}>
        {items.map(r => (
          <li key={r.label} className="proj-result">
            <div className="proj-result-value">{r.value}</div>
            <div className="proj-result-label">{r.label}</div>
          </li>
        ))}
      </ul>
    </section>
  )
}

/** Language · last pushed · stars, shown under the repository link. Absent (not broken) if the build couldn't reach GitHub. */
export function RepoMeta({ repo }: { repo?: RepoInfo }) {
  if (!repo) return null
  const updated = repo.pushedAt
    ? new Date(repo.pushedAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' })
    : null
  if (!repo.language && !updated && repo.stars <= 0) return null
  return (
    <div className="proj-repo-meta" title="Fetched from GitHub when the site was last built">
      {repo.language && <span className="proj-repo-lang"><i className="proj-repo-dot" aria-hidden="true" />{repo.language}</span>}
      {updated && <span>Updated {updated}</span>}
      {repo.stars > 0 && <span>★ {repo.stars}</span>}
    </div>
  )
}

/** Native share sheet on phones; copies the link everywhere else. */
export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false)
  const copyTimer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(copyTimer.current), [])
  const share = async () => {
    const url = window.location.href.split('#')[0]
    if (navigator.share && /Mobi|Android/i.test(navigator.userAgent)) {
      try { await navigator.share({ title, text: `${title} — Durgesh Gowda C`, url }); return }
      catch (e) { if ((e as DOMException)?.name === 'AbortError') return }
    }
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = url; ta.style.position = 'fixed'; ta.style.opacity = '0'
      document.body.appendChild(ta); ta.select()
      try { document.execCommand('copy') } catch { /* nothing more to try */ }
      document.body.removeChild(ta)
    }
    setCopied(true)
    window.clearTimeout(copyTimer.current)
    copyTimer.current = window.setTimeout(() => setCopied(false), 1800)
  }
  return (
    <div className="proj-share">
      <button type="button" className="proj-link proj-share-btn" onClick={share} aria-label={`Share ${title}: copy the page link`}>
        {copied ? 'Link copied' : 'Copy page link'}
        <i className={copied ? 'fas fa-check' : 'fas fa-link'} aria-hidden="true" />
      </button>
      <span className="sr-only" role="status" aria-live="polite">{copied ? 'Page link copied to clipboard' : ''}</span>
    </div>
  )
}

/** A compact, one-line invitation at the end of every project. */
export function ContactStrip({ topic }: { topic?: string }) {
  const picks = CONTACTS.filter(c => ['LinkedIn', 'GitHub', 'Email'].includes(c.label))
  return (
    <aside className="proj-contact" id="contact" aria-label="Get in touch">
      <p className="proj-contact-copy">Like this work? <em>Let&rsquo;s talk.</em></p>
      <div className="proj-contact-links">
        {picks.map(c => (
          <a
            key={c.label}
            href={c.label === 'Email' ? emailHref(topic) : c.href}
            className="proj-contact-link"
            aria-label={c.label}
            title={c.label}
            {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            <i className={c.icon} aria-hidden="true" />
          </a>
        ))}
      </div>
    </aside>
  )
}

/** A neighbouring project as a card — its glyph, name and one-line pitch. `dir` flips it for "previous". */
export function NextProjectCard({ project, position, total, dir = 'next' }: { project: Project; position: number; total: number; dir?: 'next' | 'prev' }) {
  const prev = dir === 'prev'
  const arrow = (
    <span className="proj-next-arrow" aria-hidden="true">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d={prev ? 'M19 12H5M11 6l-6 6 6 6' : 'M5 12h14M13 6l6 6-6 6'} />
      </svg>
    </span>
  )
  return (
    <Link href={`/projects/${project.slug}`} className={`proj-next-card${prev ? ' proj-next-card--prev' : ''}`}>
      {prev && arrow}
      <div className="proj-next-glyph" aria-hidden="true"><ProjectIcon slug={project.slug} /></div>
      <div className="proj-next-text">
        <div className="proj-next-eyebrow">
          {prev
            ? (<><span className="t-nature">Previous waypoint</span><span className="t-space">Previous burn</span></>)
            : (<><span className="t-nature">Next waypoint</span><span className="t-space">Next burn</span></>)}
          <span> · {position} of {total}</span>
        </div>
        <div className="proj-next-title">{project.title}</div>
        {project.tagline && <div className="proj-next-tagline">{project.tagline}</div>}
      </div>
      {!prev && arrow}
    </Link>
  )
}

export { ARROW }

/**
 * Sticky "jump to" bar for long project pages. Chips scroll sideways on small screens, the current section is
 * highlighted as you scroll, and the active chip is kept centred. Hidden on very wide screens, where the
 * right-hand rail shows every chapter label instead (see .journey-rail--labels).
 */
export function ProjectJumpNav({ items }: { items: { id: string; label: string }[] }) {
  const [active, setActive] = useState(items[0]?.id)
  const barRef = useRef<HTMLElement>(null)

  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      // the last section whose top has passed the middle of the viewport is "current"
      const line = window.innerHeight * 0.5
      let current = items[0]?.id
      for (const it of items) {
        const el = document.getElementById(it.id)
        if (el && el.getBoundingClientRect().top <= line) current = it.id
      }
      setActive(current)
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); if (raf) cancelAnimationFrame(raf) }
  }, [items])

  // keep the active chip centred in the (horizontally scrollable) bar
  useEffect(() => {
    const bar = barRef.current
    const chip = bar?.querySelector<HTMLElement>('[aria-current="true"]')
    if (bar && chip && bar.scrollWidth > bar.clientWidth) {
      bar.scrollTo({ left: chip.offsetLeft - bar.clientWidth / 2 + chip.offsetWidth / 2, behavior: 'smooth' })
    }
  }, [active])

  if (items.length < 2) return null
  return (
    <nav ref={barRef} className="proj-jump" aria-label="Jump to section">
      <span className="proj-jump-label">Jump to</span>
      {items.map(it => (
        <a
          key={it.id}
          href={`#${it.id}`}
          className={`proj-jump-chip${active === it.id ? ' is-active' : ''}`}
          aria-current={active === it.id ? 'true' : undefined}
          onClick={e => {
            const el = document.getElementById(it.id)
            if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth', block: 'start' }) }
          }}
        >
          {it.label}
        </a>
      ))}
    </nav>
  )
}
