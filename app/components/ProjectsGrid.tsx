'use client'
import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import Link from "next/link";
import { PROJECTS } from '@/app/lib/projects'
import ProjectIcon from '@/app/components/ProjectIcon'
import DeviceFrame from '@/app/components/DeviceFrame'
import { stripRich } from '@/app/components/Rich'

// Project data now comes from a single source of truth (app/lib/projects.ts)
// instead of being hand-duplicated here — the two copies had already drifted
// out of sync (e.g. slightly different newton-gravity descriptions).

// Filters are by *what the project is*, not which language it's written in: language chips were
// one-project chips (C++, C#, Java) or matched most of the list (Python). Languages and tools are still
// findable through the search box, which also matches each project's tech stack.
const FILTERS: { id: string; label: string }[] = [
  { id: 'all',          label: 'All' },
  { id: 'ai/ml',        label: 'AI / ML' },
  { id: 'web',          label: 'Web Apps' },
  { id: 'games',        label: 'Games & Graphics' },
  { id: 'data-science', label: 'Data Science' },
  { id: 'tools',        label: 'Tools' },
]

export default function ProjectsGrid() {
  const pathname = usePathname();
  const [activeFilter, setActiveFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [mounted, setMounted] = useState(false)
  const cardRefs = useRef<(HTMLAnchorElement | null)[]>([])

  useEffect(() => { setMounted(true) }, [])

  const visible = PROJECTS.filter(p => {
    const matchTag = activeFilter === 'all' || p.tags.includes(activeFilter)
    const q = search.toLowerCase()
    const matchSearch = !q || p.title.toLowerCase().includes(q) ||
        stripRich(p.desc).toLowerCase().includes(q) || p.tag.toLowerCase().includes(q) ||
        p.tech.some(t => t.toLowerCase().includes(q))
    return matchTag && matchSearch
  })

  useEffect(() => {
    if (!mounted) return
    // Cards that stay mounted keep their .visible class (React doesn't touch it), so filtering doesn't
    // flash every card out and back in; only newly mounted cards are revealed by the observer.
    let obs: IntersectionObserver
    const timer = setTimeout(() => {
      obs = new IntersectionObserver(
          entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
          { threshold: 0.04 }
      )
      cardRefs.current.forEach(el => el && obs.observe(el))
    }, 60)

    return () => {
      clearTimeout(timer)
      obs?.disconnect()
    }
  }, [activeFilter, search, mounted, visible.length])

  return (
      <>
        <div className="filters-bar">
          <input
              className="project-search"
              type="search"
              placeholder="Search projects or tech…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Search projects"
              suppressHydrationWarning
          />
          <div className="chips" role="group" aria-label="Project category filters">
            {FILTERS.map(f => (
                <button
                    key={f.id}
                    className={`chip${activeFilter === f.id ? ' active' : ''}`}
                    type="button"
                    aria-pressed={activeFilter === f.id}
                    onClick={() => setActiveFilter(f.id)}
                >
                  {f.label}
                </button>
            ))}
          </div>
          <div className="project-count">
            {visible.length} project{visible.length !== 1 ? 's' : ''}
          </div>
        </div>

        <div className="projects-grid">
          {visible.map((p, i) => (
              <Link
                  key={p.slug}
                  href={`/projects/${p.slug}`}
                  className={`project-card ${pathname === `/projects/${p.slug}` ? 'active' : ''}`}
                  ref={el => { cardRefs.current[i] = el }}
                  style={{ transitionDelay: `${i * 55}ms` }}
              >
                <div className="card-flip">
                  <div className="card-face card-face-front">
                    <DeviceFrame label={p.filename} className="project-frame">
                      <ProjectIcon slug={p.slug} />
                    </DeviceFrame>
                    <div className="project-tag">{p.tag}</div>
                    <h3>{p.title}</h3>
                    <p>{stripRich(p.desc)}</p>
                    <div className="card-front-tech" aria-hidden="true">
                      {p.tech.slice(0, 4).map(t => (
                          <span key={t} className="card-tech-pill">{t}</span>
                      ))}
                    </div>
                    <span className="flip-hint" aria-hidden="true">flip for the tech stack →</span>
                  </div>

                  <div className="card-face card-face-back">
                    <div className="project-tag">{p.role}</div>
                    {p.stat && <div className="project-stat">{p.stat}</div>}
                    <div className="card-back-tech">
                      {p.tech.map(t => (
                          <span key={t} className="card-tech-pill">{t}</span>
                      ))}
                    </div>
                    <span className="card-back-cta">
                  View full case study
                  <svg viewBox="0 0 24 24" width="13" height="13">
                    <path
                        d="M6 18L18 6M18 6H10M18 6V14"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                  </svg>
                </span>
                  </div>
                </div>
              </Link>
          ))}
          {visible.length === 0 && (
              <div className="no-results">Nothing matches that — try another filter or a different search term.</div>
          )}
        </div>
      </>
  )
}