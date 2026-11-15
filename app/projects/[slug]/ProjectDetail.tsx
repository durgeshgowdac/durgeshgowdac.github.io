'use client'
import Link from 'next/link'
import { useEffect, useRef, forwardRef } from 'react'
import { PROJECTS, type Project, type Section } from '@/app/lib/projects'
import ProjectIcon from '@/app/components/ProjectIcon'
import DeviceFrame from '@/app/components/DeviceFrame'
import PageScene from '@/app/components/PageScene'
import AboutStripScene from '@/app/components/AboutStripScene'
import ChapterBadge from '@/app/components/ChapterBadge'
import ProjectSectionIcon from '@/app/components/ProjectSectionIcon'
import ProjectDemoMedia from '@/app/components/ProjectDemoMedia'
import Reveal from '@/app/components/Reveal'
import { Rich } from '@/app/components/Rich'
import { ResultsStrip, RepoMeta, ShareButton, ContactStrip, NextProjectCard, ProjectJumpNav, type RepoInfo } from '@/app/components/ProjectExtras'

const SECTION_TITLES: Record<Section['type'], string> = {
  brief:        'Brief',
  contribution: 'My Contribution',
  architecture: 'System Architecture',
  features:     'Key Features',
  challenges:   'Technical Challenges',
  takeaways:    'Takeaways',
  retro:        'What I’d Do Differently',
}

/* Each section is a stop on the journey rail and gets its own corner vignette. Names in both worlds. */
const SECTION_STORY: Record<Section['type'], { nature: string; space: string }> = {
  brief:        { nature: 'The Map',      space: 'Mission Brief' },
  contribution: { nature: 'The Pack',     space: 'Crew Duties' },
  architecture: { nature: 'The Cabin',    space: 'The Satellite' },
  features:     { nature: 'In Bloom',     space: 'Bright Stars' },
  challenges:   { nature: 'The Ridge',    space: 'Asteroid Belt' },
  takeaways:    { nature: 'Sunrise',      space: 'Planet-rise' },
  retro:        { nature: 'The Next Climb', space: 'Next Mission' },
}

/** How wide each card should be (in twelfths of the row) so the last row is never a lonely orphan. */
function balancedSpans(n: number): number[] {
  if (n <= 0) return []
  if (n === 1) return [6]
  const cols = n <= 4 ? n : (n === 5 || n === 6 || n === 9) ? 3 : 4
  const rows = Math.ceil(n / cols)
  const base = Math.floor(n / rows), extra = n % rows
  const spans: number[] = []
  for (let r = 0; r < rows; r++) {
    const count = base + (r < extra ? 1 : 0)
    for (let k = 0; k < count; k++) spans.push(12 / count)
  }
  return spans
}

/** Short names for the sticky jump bar. */
const SECTION_SHORT: Record<Section['type'], string> = {
  brief: 'Brief', contribution: 'My part', architecture: 'Architecture', features: 'Features',
  challenges: 'Challenges', takeaways: 'Takeaways', retro: 'Next time',
}

// ── Section block ────────────────────────────────────────────────
const SectionBlock = forwardRef<HTMLElement, { section: Section; index: number; github?: string }>(
    ({ section, index, github }, ref) => (
        <section
            id={`sec-${index}`}
            className="proj-section proj-section-hidden"
            ref={ref as React.Ref<HTMLElement>}
            data-rail=""
            data-n={String(index + 1).padStart(2, '0')}
            data-nature={SECTION_STORY[section.type].nature}
            data-space={SECTION_STORY[section.type].space}
        >
          <ProjectSectionIcon kind={section.type} />
          <div className="eyebrow">
            {String(index + 1).padStart(2, '0')}
            <span className="t-nature"> · {SECTION_STORY[section.type].nature}</span>
            <span className="t-space"> · {SECTION_STORY[section.type].space}</span>
          </div>
          <h2 className="proj-section-title">{SECTION_TITLES[section.type]}</h2>

          {(section.type === 'brief' || section.type === 'takeaways') && (
              <div className="proj-prose">
                {section.content.split('\n\n').map((para, i) => (
                    <p key={i}><Rich text={para} /></p>
                ))}
                {section.type === 'brief' && github && (
                    <a href={github} target="_blank" rel="noopener noreferrer" className="proj-link proj-receipts-link">
                      Don&rsquo;t take my word for it — the receipts are on GitHub
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M7 17L17 7M17 7H7M17 7v10"/>
                      </svg>
                    </a>
                )}
              </div>
          )}

          {(section.type === 'contribution' || section.type === 'retro') && (
              <ul className="proj-list">
                {section.items.map((item, i) => <li key={i}><Rich text={item} /></li>)}
              </ul>
          )}

          {(section.type === 'architecture' ||
              section.type === 'features' ||
              section.type === 'challenges') && (
              <div className="proj-cards proj-cards--balanced">
                {section.items.map((item, i) => (
                    <div key={i} className="proj-card" style={{ ['--span' as string]: balancedSpans(section.items.length)[i] }}>
                      <div className="proj-card-title">{item.title}</div>
                      <div className="proj-card-desc"><Rich text={item.desc} /></div>
                    </div>
                ))}
              </div>
          )}
        </section>
    )
)
SectionBlock.displayName = 'SectionBlock'

// ── Main client component ────────────────────────────────────────
export default function ProjectDetail({ project, repo }: { project: Project; repo?: RepoInfo }) {
  const sectionRefs = useRef<(HTMLElement | null)[]>([])

  useEffect(() => {
    const obs = new IntersectionObserver(
        entries => entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('section-visible')
            obs.unobserve(e.target)
          }
        }),
        { threshold: 0.07 }
    )
    sectionRefs.current.forEach(el => el && obs.observe(el))
    return () => obs.disconnect()
  }, [])

  // “What I'd do differently” is an optional closing section, driven by project.retro
  const allSections: Section[] = project.retro?.length
      ? [...project.sections, { type: 'retro', items: project.retro }]
      : project.sections
  const idx  = PROJECTS.findIndex(p => p.slug === project.slug)
  const next = PROJECTS[(idx + 1) % PROJECTS.length]
  const isNotebook = !!project.liveUrl?.includes('colab.research.google.com')   // Colab links aren't a "live app"
  const prev = idx > 0 ? PROJECTS[idx - 1] : undefined   // first project has nothing before it; Next still wraps round

  return (
      <>
        <div className="proj-page">
          <div className="proj-chapter proj-chapter--tint">
            <PageScene variant="project" />
            {/* Back */}
            <div className="container">
              <Link href="/#projects" className="proj-back">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M5 12l7-7M5 12l7 7"/>
                </svg>
                Back to Projects
              </Link>
            </div>

            {/* Hero */}
            <div className="container">
              <div className="proj-hero">
                <div className="proj-hero-left">
                  <ChapterBadge
                      n="00"
                      nature="Waypoint"
                      space="Stage"
                      natureNote={`${idx + 1} of ${PROJECTS.length} on the trail`}
                      spaceNote={`${idx + 1} of ${PROJECTS.length} in the flight log`}
                  />
                  <DeviceFrame label={project.filename} className="project-frame proj-frame">
                    <ProjectIcon slug={project.slug} />
                  </DeviceFrame>
                  <div className="proj-tag-label">{project.tag}</div>
                  <h1 className="proj-title">{project.title}</h1>
                  <p className="proj-desc"><Rich text={project.desc} /></p>
                </div>

                <aside className="proj-meta">
                  {project.stat && (
                      <div className="proj-meta-item">
                        <div className="proj-meta-label">Highlight</div>
                        <div className="proj-meta-value">{project.stat}</div>
                      </div>
                  )}

                  <div className="proj-meta-item">
                    <div className="proj-meta-label">Role</div>
                    <div className="proj-meta-value">{project.role}</div>
                  </div>

                  <div className="proj-meta-item">
                    <div className="proj-meta-label">Technologies</div>
                    <div className="proj-tech-pills">
                      {project.tech.map(t => (
                          <span key={t} className="proj-tech-pill">{t}</span>
                      ))}
                    </div>
                  </div>

                  {project.github && (
                      <div className="proj-meta-item">
                        <div className="proj-meta-label">GitHub</div>
                        <a href={project.github} target="_blank" rel="noopener noreferrer" className="proj-link">
                          View Repository
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M7 17L17 7M17 7H7M17 7v10"/>
                          </svg>
                        </a>
                        <RepoMeta repo={repo} />
                      </div>
                  )}

                  {project.liveUrl && (
                      <div className="proj-meta-item">
                        <div className="proj-meta-label">{isNotebook ? 'Notebook' : 'Live'}</div>
                        <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="proj-link">
                          {isNotebook ? 'Open in Colab' : 'View Live'}
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M7 17L17 7M17 7H7M17 7v10"/>
                          </svg>
                        </a>
                      </div>
                  )}

                  {project.downloadUrl && (
                      <div className="proj-meta-item">
                        <div className="proj-meta-label">Download</div>
                        <a href={project.downloadUrl} download className="proj-link">
                          Get the Build
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 21h16"/>
                          </svg>
                        </a>
                      </div>
                  )}

                  {project.paperUrl && (
                      <div className="proj-meta-item">
                        <div className="proj-meta-label">Research Paper</div>
                        <a href={project.paperUrl} download className="proj-link">
                          Download the Paper
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 21h16"/>
                          </svg>
                        </a>
                      </div>
                  )}

                  <div className="proj-meta-item">
                    <div className="proj-meta-label">Share</div>
                    <ShareButton title={project.title} />
                  </div>
                </aside>
              </div>

              <Reveal><ResultsStrip items={project.results} /></Reveal>

              {project.youtube && (
                  <Reveal><ProjectDemoMedia key={project.slug} url={project.youtube} title={`${project.title} demo video`} /></Reveal>
              )}
            </div>
          </div>

          <div className="proj-divider" />

          {/* Sections */}
          <div className="container">
            <div className="proj-body">
              <ProjectJumpNav items={allSections.map((sec, i) => ({ id: `sec-${i}`, label: SECTION_SHORT[sec.type] }))} />
              {allSections.map((sec, i) => (
                  <SectionBlock
                      key={i}
                      section={sec}
                      index={i}
                      github={project.github}
                      ref={(el: HTMLElement | null) => { sectionRefs.current[i] = el }}
                  />
              ))}
            </div>

            <Reveal><ContactStrip topic={project.title} /></Reveal>

            {/* Bottom nav */}
            <Reveal>
              <div className="proj-nav">
                <div className="proj-nav-cards">
                  {prev && <NextProjectCard dir="prev" project={prev} position={idx} total={PROJECTS.length} />}
                  <NextProjectCard project={next} position={((idx + 1) % PROJECTS.length) + 1} total={PROJECTS.length} />
                </div>
                <Link href="/#projects" className="proj-back">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M5 12l7-7M5 12l7 7"/>
                  </svg>
                  All Projects
                </Link>
              </div>
            </Reveal>
          </div>
        </div>

        {/* closing scene: every page ends with the Ch.02 "Building Under Pressure" strip (HackathonScene.tsx, via AboutStripScene kind="hackathons"):
            Nature is "Four Elements, One Deadline" (Avatar), Space is "Portal Under Pressure" (Gravity Falls). The scene draws its own sky and ground,
            so the footer needs no separate sky layer; the footer's gradient background only supplies the headroom above the strip. */}
        <div
            className="proj-end proj-end--contact proj-end--match"
            aria-hidden="true"
            data-rail=""
            data-n={String(allSections.length + 1).padStart(2, '0')}
            data-nature="The Camp"
            data-space="Splashdown"
        >
          <div className="proj-match">
            <AboutStripScene kind="hackathons" wide />
          </div>
        </div>
      </>
  )
}