'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

import ProjectsGrid from '@/app/components/ProjectsGrid'
import RotatingWord from '@/app/components/RotatingWord'
import TechMarquee from '@/app/components/TechMarquee'
import CurrentlyBadge from '@/app/components/CurrentlyBadge'
import PageScene from '@/app/components/PageScene'
import ChapterBadge from '@/app/components/ChapterBadge'
import ContactLinks from '@/app/components/ContactLinks'
import { CONTACT_SUBTEXT } from '@/app/lib/contacts'
import JourneyStrip from '@/app/components/JourneyStrip'
import DuelScene from '@/app/components/DuelScene'
import TypedGreeting from '@/app/components/TypedGreeting'

export default function Home() {

  const [isVisible, setIsVisible] = useState(true);

  // Passive listener, last position kept in a ref (not state) so the listener is attached once
  // and the page only re-renders when the cue actually shows or hides.
  useEffect(() => {
    let last = 0;
    const onScroll = () => {
      const y = window.scrollY;
      const projectsTop = document.getElementById('projects')?.offsetTop || 0;
      if (y >= projectsTop - 100) setIsVisible(true);        // reached Projects
      else if (y > last && y > 50) setIsVisible(false);       // scrolling down, not there yet
      else setIsVisible(true);                                 // scrolling up
      last = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToProjects = () => {
    const projectsSection = document.getElementById('projects');
    if (projectsSection) {
      projectsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
      <>
        {/* ── Hero (its own full-bleed section so it can host the decorative
             background/orb independently of the chapters below it) ── */}
        <section className="hero">

          <PageScene />

          <div className="container">
            <div className="hero-text-col">
              <div className="hero-content">
                <ChapterBadge
                    n="00"
                    nature="Trailhead"
                    space="Launch Pad"
                    natureNote="6 a.m., pack light, chocolate milk chilled, no regrets"
                    spaceNote="T-minus 3, all systems nominal"
                />
                <TypedGreeting />
                <h1>DURGESH GOWDA C</h1>
                <h2>
                  AI/ML Engineer —&nbsp;
                  <RotatingWord />
                </h2>
                <>
                  <p className="hero-personality">
                    I build systems that keep working when no one is babysitting them. They{' '}
                    <strong>see</strong> (a <Link href="/projects/foundyou" className="hero-link">re-identification pipeline</Link> that refuses to lose someone behind a pillar),{' '}
                    <strong>read</strong> (a <Link href="/projects/glyphscholar" className="hero-link">RAG system</Link> that cites the exact page instead of improvising),{' '}
                    <strong>judge</strong> (a <Link href="/projects/rolesense" className="hero-link">résumé screener</Link> that scores fit, not just keywords) and{' '}
                    <strong>speak</strong> (a <Link href="/projects/mlxnarrator" className="hero-link">narrator</Link> that runs offline on a laptop).
                  </p>
                  <p className="hero-personality">
                    Two internships (the Indian Navy&rsquo;s <strong>INICAI</strong>, ISRO&rsquo;s <strong>ISTRAC</strong>) and a
                    MTech later, I still <strong>side-eye any model that&rsquo;s too confident</strong>, especially mine.
                  </p>
                </>
                <CurrentlyBadge />
                <div className="hero-actions">
                  <a
                      href="#projects"
                      className="btn-resume"
                      onClick={e => { e.preventDefault(); scrollToProjects() }}
                  >
                    See projects
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M6 9l6 6 6-6"/>
                    </svg>
                  </a>
                  <a href="/Durgesh_Gowda_C_Resume.pdf" download className="btn-resume">
                    Download Resume
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 21h16"/>
                    </svg>
                  </a>
                </div>
              </div>

              <div className="other-info">
                <div className="career-info">
                  <div className="career-column">
                    <h3>Based in</h3>
                    <p>
                      <span className="career-line">Bengaluru, India</span>
                      <span className="career-line">open to relocate, remote and international roles</span>
                    </p>
                  </div>
                </div>

                <div className="career-info">
                  <div className="career-column">
                    <h3>Status</h3>
                    <p>
                      <span className="career-line">
                        M.Tech graduate (CGPA 9.41),{' '}
                        <a href="https://pes.edu" target="_blank" rel="noopener noreferrer" className="hero-link">PES University</a>
                      </span>
                      <span className="career-line"><b>Seeking:</b> AI/ML Engineer roles in computer vision, NLP and GenAI</span>
                      <a href="#contact" className="status-chip">
                        <span className="status-dot" aria-hidden="true" />
                        Available now
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
              type="button"
              className={`scroll-indicator ${!isVisible ? 'hidden' : ''}`}
              onClick={scrollToProjects}
              aria-label="Scroll to projects"
              tabIndex={isVisible ? 0 : -1}
          >
            <p>scroll</p>
            <i className="fas fa-chevron-down" aria-hidden="true" />
          </button>
        </section>

        {/* ── Continuous-scroll tech strip — a chapter break between Hero
             and Projects, and a fresher pattern than static skill pills ── */}
        <TechMarquee />

        {/* ── Projects — same construction as About Ch.01: one framed section, the strip flush with its top,
             then badge → heading → search/filters → cards (cards on --bg inside the --card-bg frame) ── */}
        <section className="projects-section" id="projects">
          <div className="container">
            <div className="about-section about-section--wide about-section--body">
              <div className="card-art card-art--journey" aria-hidden="true">
                <JourneyStrip />
              </div>
              <ChapterBadge
                  n="01"
                  nature="The Trail"
                  space="The Trajectory"
                  natureNote="selected work, each one worth the climb"
                  spaceNote="selected work, one burn each, no wasted fuel"
              />
              <h2>Projects I’ve Built (and Fixed)</h2>
              <ProjectsGrid />
              {/* the sign-off: follows the grid, so it always sits centred just under the last project shown (filters and search included) */}
              <p className="projects-aside projects-aside--end">
                <span className="t-nature">Best debugged on a trail, ideally with a sky bison on standby.</span>
                <span className="t-space">Best debugged at T-minus three, ideally with an owl on courier duty.</span>
              </p>
            </div>
          </div>
        </section>

        {/* ── Contact — its own tinted chapter, matching the About page ── */}
        <section className="contact-section" id="contact">
          <PageScene variant="contact" />
          <DuelScene />
          <div className="container">
            <ChapterBadge
                n="02"
                nature="The Summit"
                space="Signal Received"
                natureNote="open for pull requests"
                spaceNote="open for pull requests"
            />
            <h2>Let&rsquo;s Get in Touch (No 404 Here)</h2>
            <p className="contact-subtext">{CONTACT_SUBTEXT}</p>
            <ContactLinks />
          </div>
        </section>
      </>
  )
}