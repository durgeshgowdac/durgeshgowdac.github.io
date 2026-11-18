'use client'
import { useEffect, useRef, useState } from 'react'

import PageScene from '@/app/components/PageScene'
import ChapterBadge from '@/app/components/ChapterBadge'
import ContactLinks from '@/app/components/ContactLinks'
import { CONTACT_SUBTEXT } from '@/app/lib/contacts'
import { EXPERIENCE, OPEN_SOURCE, COMMUNITIES, HACKATHONS, CODING_PROFILES, SKILLS, ACHIEVEMENTS, CONFERENCES, INSPIRATIONS, SPORTS } from '@/app/lib/about'
import AboutStripScene from '@/app/components/AboutStripScene'
import DuelScene from '@/app/components/DuelScene'
import ProfileHalo from '@/app/components/ProfileHalo'
import ProfileFlight from '@/app/components/ProfileFlight'
import AboutCardIcon from '@/app/components/AboutCardIcon'
import CardElementMarks from '@/app/components/CardElementMarks'

/** Renders "plain **strong** plain" — lets the strings in lib/about.ts flag the terms worth the eye (numbers, results). */
function Rich({ text }: { text: string }) {
  return <>{text.split('**').map((part, i) => (i % 2 ? <strong key={i}>{part}</strong> : part))}</>
}

/** Portrait sources, tried in order: the GitHub avatar first, then the local photo in public/, then the "DG" initials. */
const PHOTO_SOURCES = ['https://avatars.githubusercontent.com/u/65192493?v=4', '/profile.jpeg']

export default function AboutPage() {
  const [photoIdx, setPhotoIdx] = useState(0)
  const photoOk = photoIdx < PHOTO_SOURCES.length
  const nextPhoto = () => setPhotoIdx(i => i + 1)
  const photoRef = useRef<HTMLImageElement>(null)
  const tlRefs    = useRef<(HTMLLIElement | null)[]>([])
  const skillRefs = useRef<(HTMLDivElement | null)[]>([])

  // the photo is hot-linked; if it failed before hydration, onError was missed, so check once mounted
  useEffect(() => {
    const i = photoRef.current
    if (i && i.complete && i.naturalWidth === 0) nextPhoto()
  }, [])

  useEffect(() => {
    const obs = new IntersectionObserver(
        entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
        { threshold: 0.1 }
    )
    tlRefs.current.forEach(el    => el && obs.observe(el))
    skillRefs.current.forEach(el => el && obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return (
      <>
        {/* Chapter 00 — full-bleed stage; the text sits on the left, the horizon runs underneath */}
        <section className="about-hero-wrap">
          <PageScene variant="about" />
          <div className="container">
            <div className="about-hero">
              <div className="about-hero-text">
                <ChapterBadge
                    n="00"
                    nature="Base Camp"
                    space="Mission Control"
                    natureNote="who's holding the map"
                    spaceNote="who's on the console"
                />
                <h1>About Me</h1>
                <p>
                  A kid who <strong>screws and unscrews things to see how they worked</strong>. The
                  screwdriver just got a GPU.
                </p>
                <p>
                  Hi there! I&rsquo;m Durgesh, an <strong>AI/ML engineer</strong> based in Bengaluru with a freshly
                  minted M.Tech in Machine Intelligence (<a href="https://pes.edu" target="_blank" rel="noopener noreferrer" className="hero-link">PES University</a>, CGPA 9.41,
                  <strong> Prof. CNR Rao Scholar</strong>, which I&rsquo;ll take as proof that the
                  late-night debugging sessions were, on balance, worth it). Curiosity has always
                  been my first instinct, and taking things apart my first method. I still
                  can&rsquo;t leave <strong>a black box closed</strong>, and I&rsquo;m happiest when it&rsquo;s messy,
                  real and slightly misbehaving.
                </p>
                <p>
                  My first big box was at ISRO&rsquo;s <strong>ISTRAC</strong>, where I spent six months engineering
                  an NLP pipeline that gave scientists <strong>10 times faster</strong> access to satellite
                  telemetry data. That felt appropriately high-stakes for someone who still
                  double-checks whether a for-loop is off by one.
                </p>
                <p>
                  Most recently, at the Indian Navy&rsquo;s AI Incubation Centre (<strong>INICAI</strong>), I built a
                  real-time <strong>multi-camera person re-identification</strong> system on NVIDIA DeepStream.
                  That&rsquo;s a fancy way of saying I taught a network of cameras to stop losing
                  track of people every time they walked behind a pillar.
                </p>
                <p>
                  The pattern across all of it is simple: <strong>find the part that isn&rsquo;t working, open it up, understand it, and make it hold up under real conditions.</strong> It&rsquo;s
                  why I&rsquo;m drawn to the gap between AI research and what actually survives
                  production: <strong>reliability and real impact first, elegance second</strong> (though
                  I&rsquo;ll take elegance if it&rsquo;s free).
                </p>
                <p>
                  Around the edges, I lead <strong>hackathon teams, mentor others, contribute to Open Source </strong>
                  (<a href="https://github.com/simple-icons/simple-icons/commits?author=durgeshgowdac" target="_blank" rel="noopener noreferrer" className="hero-link">Simple Icons</a>), solve an unreasonable number of <a href="https://leetcode.com/u/durgeshgowdac/" target="_blank" rel="noopener noreferrer" className="hero-link">LeetCode</a> problems at hours
                  polite people are asleep, and build the odd side project, like the one
                  you&rsquo;re looking at right now.
                </p>
                <p>
                  Off-screen, I stay in motion: years of <strong>Taekwondo</strong> before I hung up my dobok, and
                  I&rsquo;ll never say no to <strong>cricket</strong> or <strong>volleyball</strong> (the patience for a stubborn bug
                  and for a stubborn opponent come from the same place). The rest of my time
                  splits between trails and trees, anything that isn&rsquo;t a screen, and the
                  cosmos, which is really just nature that happens to be very far away. This
                  site&rsquo;s background quietly swaps between the two, which is less a design
                  choice and <strong>more a confession</strong>.
                </p>
              </div>
              <div className="profile-col">
                {/* Portrait: the GitHub avatar, falling back to public/avatar.jpeg if it doesn't load, then to the initials. */}
                <div className="profile-frame">
                  <div className="profile-halo" aria-hidden="true" />
                  <ProfileHalo />
                  {photoOk ? (
                      <img
                          key={photoIdx}
                          ref={photoRef}
                          src={PHOTO_SOURCES[photoIdx]}
                          alt="Durgesh Gowda C"
                          className="profile-img"
                          width={200}
                          height={256}
                          referrerPolicy="no-referrer"
                          onError={nextPhoto}
                      />
                  ) : (
                      <div className="profile-img profile-fallback" role="img" aria-label="Durgesh Gowda C">DG</div>
                  )}
                </div>
                <a href="/Durgesh_Gowda_C_Resume.pdf" download className="btn-resume btn-resume--about">
                  Download Resume
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 21h16"/>
                  </svg>
                </a>
                {/* small screens only (≤ 900px): the hero's background flight is hidden there, so Appa / Harry & Hedwig fly under the button instead */}
                <ProfileFlight />
              </div>
            </div>
          </div>
        </section>

        <div className="container about-page">
          {/* Chapter 01 — one seamless section, same construction as Inspiration and Sports below:
              strip scene → chapter badge → cards. The cards sit on --bg inside the --card-bg frame,
              and every gap between them is the same --about-gap. */}
          <section className="about-section about-section--wide about-section--body">
            <AboutStripScene kind="catch" wide />
            <ChapterBadge
                n="01"
                nature="The Climb"
                space="The Ascent"
                natureNote="experience, craft and proof"
                spaceNote="experience, craft and proof"
            />

            <h2>The Handbook</h2>
            <p className="inspo-intro">
              The working record: internships, open-source commits, degrees, certifications and the
              communities I learn alongside. Everything here is something I can point to, with numbers
              wherever there are numbers, and it&rsquo;s going to keep growing.
            </p>

            <div className="about-grid">

              {/* Column 1 — Experience & practice: what I have built, where I keep practising, and what I contribute back */}
              <div className="about-col">
                <div className="about-section about-card">
                  <AboutCardIcon kind="journey" />
                  <div className="eyebrow">Experience</div>
                  <h2>My Journey So Far</h2>
                  <ul className="timeline">
                    {EXPERIENCE.map((e, i) => (
                        <li
                            key={i}
                            className="timeline-item about-item"
                            ref={el => { tlRefs.current[i] = el }}
                            style={{ transitionDelay: `${i * 75}ms` }}
                        >
                          <div className="timeline-date">{e.date}</div>
                          <h4>{e.title}</h4>
                          <div className="org">{e.org}</div>
                          <p className="item-desc"><Rich text={e.desc} /></p>
                        </li>
                    ))}
                  </ul>
                </div>
                <div className="about-section about-card">
                  <AboutCardIcon kind="opensource" />
                  <div className="eyebrow">Contributions</div>
                  <h2>Open Source</h2>
                  <ul className="opensource-list">
                    {OPEN_SOURCE.map(o => (
                        <li key={o.name} className="opensource-item about-item">
                          <div className="timeline-date">{o.date}</div>
                          <div className="item-head">
                            <h4>{o.name}</h4>
                            <a href={o.url} target="_blank" rel="noopener noreferrer" className="proj-link">
                              Commits
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M7 17L17 7M17 7H7M17 7v10"/>
                              </svg>
                            </a>
                          </div>
                          <div className="org">{o.role}</div>
                          <p className="item-desc"><Rich text={o.desc} /></p>
                        </li>
                    ))}
                  </ul>
                </div>
                <div className="about-section about-card">
                  <AboutCardIcon kind="coding" />
                  <div className="eyebrow">Practice & Certifications</div>
                  <h2>Find Me Coding</h2>
                  <ul className="coding-profile-list">
                    {CODING_PROFILES.map(p => (
                        <li key={p.name} className="coding-profile-item about-item">
                          <div className="item-head">
                            <h4>{p.name}</h4>
                            <a href={p.url} target="_blank" rel="noopener noreferrer" className="proj-link">
                              View
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M7 17L17 7M17 7H7M17 7v10"/>
                              </svg>
                            </a>
                          </div>
                          {p.stat && <div className="org"><Rich text={p.stat} /></div>}
                        </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Column 2 — Education & toolkit */}
              <div className="about-col">
                <div className="about-section about-card">
                  <AboutCardIcon kind="education" />
                  <div className="eyebrow">Academic Background</div>
                  <h2>Education</h2>
                  <div className="edu-list">
                    <div className="edu-block about-item">
                      <div className="timeline-date">2024 – 2026</div>
                      <h4>Master of Technology (MTech)</h4>
                      <div className="org"><strong>PES University</strong></div>
                      <div className="org">Computer Science (Machine Intelligence)</div>
                      <div className="item-badges">
                        <span className="edu-stat"><span className="edu-stat-label">CGPA</span><strong>9.41</strong></span>
                        <span className="item-badge">Prof. CNR Rao Scholar</span>
                      </div>
                      <p className="item-desc"><strong>Specialty:</strong> Software Engineering, Machine Learning and Artificial Intelligence.</p>
                      <p className="item-desc"><strong>Relevant coursework:</strong> Deep Learning Theory and Practices, Stochastic Models and Machine Learning, Speech and Natural Language Processing, Distributed Computing, Scalable Computing.</p>
                    </div>

                    <div className="edu-block about-item">
                      <div className="timeline-date">2019 – 2023</div>
                      <h4>Bachelor of Technology (BTech)</h4>
                      <div className="org"><strong>Presidency University</strong></div>
                      <div className="org">Computer Engineering (Data Science)</div>
                      <div className="item-badges">
                        <span className="edu-stat"><span className="edu-stat-label">CGPA</span><strong>9.19</strong></span>
                      </div>
                      <p className="item-desc"><strong>Specialty:</strong> Software Engineering and Data Science.</p>
                      <p className="item-desc"><strong>Relevant coursework:</strong> Machine Learning using Python, Principles of Artificial Intelligence, Introduction to Deep Learning, Big Data Analytics, Information Retrieval and Organization, Calculus, Linear Algebra and Optimization Techniques.</p>
                    </div>
                  </div>
                </div>
                <div className="about-section about-card">
                  <AboutCardIcon kind="skills" />
                  <div className="eyebrow">Toolkit</div>
                  <h2>Skills</h2>
                  {SKILLS.map((s, i) => (
                      <div
                          key={s.group}
                          className="skill-group"
                          ref={el => { skillRefs.current[i] = el }}
                          style={{ transitionDelay: `${i * 70}ms` }}
                      >
                        <div className="skill-group-label">{s.group}</div>
                        <div className="skill-pills">
                          {s.items.map(skill => (
                              <span key={skill} className="skill-pill">{skill}</span>
                          ))}
                        </div>
                      </div>
                  ))}
                </div>
              </div>

              {/* Column 3 — Recognition & community: merit, events attended and the communities I belong to */}
              <div className="about-col">
                <div className="about-section about-card">
                  <AboutCardIcon kind="achievements" />
                  <div className="eyebrow">Merit</div>
                  <h2>Achievements</h2>
                  <ul className="achievement-list">
                    {ACHIEVEMENTS.map((a, i) => (
                        <li key={i} className="achievement-item about-item">
                          <h4>{a.title}</h4>
                          <p className="item-desc"><Rich text={a.detail} /></p>
                        </li>
                    ))}
                  </ul>
                </div>
                <div className="about-section about-card">
                  <AboutCardIcon kind="conferences" />
                  <div className="eyebrow">Attended</div>
                  <h2>Conferences & Talks</h2>
                  <ul className="conference-list">
                    {CONFERENCES.map((c, i) => (
                        <li key={i} className="conference-item about-item">
                          <div className="timeline-date">{c.year}</div>
                          <h4>{c.name}</h4>
                          <p className="item-desc"><Rich text={c.blurb} /></p>
                        </li>
                    ))}
                  </ul>
                </div>
                <div className="about-section about-card">
                  <AboutCardIcon kind="communities" />
                  <div className="eyebrow">Beyond the Classroom</div>
                  <h2>Communities & Teaching</h2>
                  {COMMUNITIES.map(g => (
                      <div key={g.stage} className="community-group">
                        <div className="skill-group-label">{g.stage}</div>
                        <div className="skill-pills">
                          {g.items.map(item => (
                              <span key={item} className="skill-pill">{item}</span>
                          ))}
                        </div>
                      </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Hackathons — building against the clock, a chapter of its own (it used to be a card in the Handbook).
              The strip is HackathonScene.tsx: Nature "Four Elements, One Deadline" (Avatar) / Space "Hyperdrive Spooling" (Star Wars). */}
          <section className="about-section about-section--wide">
            <AboutStripScene kind="hackathons" wide />
            <ChapterBadge
                n="02"
                nature="Four Elements, One Deadline"
                space="Hyperdrive Spooling"
                natureNote="a plan, a bug, a deadline, a launch"
                spaceNote="a plan, a bug, a deadline, a launch"
            />
            <h2>Building Under Pressure</h2>
            <p className="inspo-intro">
              Hackathons are where I find out whether a plan survives a deadline: three times leading the
              team, and once mentoring one from the sidelines. The result comes first, the project
              underneath, and the scoreboard is the only thing in this section that doesn&rsquo;t negotiate.
            </p>
            <div className="hackathon-grid">
              {HACKATHONS.map(h => (
                  <article key={h.event} className="hackathon-card">
                    <div className="hackathon-top">
                      <span className="inspo-field">{h.year}</span>
                      <span className="item-badge">{h.role}</span>
                    </div>
                    {/* the result is the headline: a big figure over a stopwatch-bezel ruler */}
                    <div className="hackathon-stat">
                      <div className="hackathon-stat-main">{h.stat}</div>
                      {/* always rendered (even when empty) so the ruler sits at the same height on every card */}
                      <div className="hackathon-stat-note">{h.statNote}</div>
                      <div className="hackathon-ticks" aria-hidden="true" />
                    </div>
                    <h4>{h.event}</h4>
                    {h.org && <div className="hackathon-org">{h.org}</div>}
                    <div className="hackathon-project">
                      <div className="hackathon-project-label">{h.role === 'Mentor' ? 'Mentored team' : 'Team'} · {h.team}</div>
                      <strong className="hackathon-project-name">{h.project}</strong>
                      <span className="hackathon-blurb">{h.desc}</span>
                    </div>
                    {/* Nature: Water · Earth · Fire · Air (Avatar)  /  Space: Rebel · Empire · Jedi · Mandalorian (Star Wars) */}
                    <CardElementMarks />
                  </article>
              ))}
            </div>
          </section>

          {/* Inspiration — deliberately not exhaustive; a starting shelf
              across build-it-that-works, AI/ML, and hard science. */}
          <section className="about-section about-section--wide">
            <AboutStripScene kind="sky" wide />
            <ChapterBadge
                n="03"
                nature="The Canopy"
                space="The Constellations"
                natureNote="standing on shoulders, citing sources"
                spaceNote="standing on shoulders, citing sources"
            />
            <h2>Inspiration</h2>
            <p className="inspo-intro">
              People whose work makes me want to build something that actually holds up —
              across security, product, AI research, and physics. Not a complete list, and
              it&rsquo;s going to keep growing.
            </p>
            <div className="inspo-grid">
              {INSPIRATIONS.map(p => (
                  <div key={p.name} className="inspo-card">
                    <div className="inspo-field">{p.field}</div>
                    <h4>{p.name}</h4>
                    <p>{p.note}</p>
                  </div>
              ))}
            </div>
          </section>

          {/* Sports — discipline off the keyboard, on purpose kept apart
              from the technical Skills column. */}
          <section className="about-section about-section--wide">
            <AboutStripScene kind="sports" wide />
            <ChapterBadge
                n="04"
                nature="Off the Trail"
                space="Zero-G"
                natureNote="off the keyboard"
                spaceNote="off the keyboard"
            />
            <h2>Sports & Athleticism</h2>
            <p className="inspo-intro">
              Discipline off the keyboard: years of Taekwondo, and a standing yes to cricket or volleyball.
              The patience for a stubborn opponent turns out to be the same patience a stubborn bug
              asks for, just with more cardio.
            </p>
            <div className="sports-grid">
              {SPORTS.map(s => (
                  <div key={s.title} className="sports-card">
                    <h4>{s.title}</h4>
                    <p>{s.detail}</p>
                  </div>
              ))}
            </div>
          </section>
        </div>

        {/* Contact — its own full-bleed tinted chapter, matching Home */}
        <section className="contact-section" id="contact">
          <PageScene variant="contact" />
          <DuelScene />
          <div className="container">
            <ChapterBadge
                n="05"
                nature="The Summit"
                space="Signal Received"
                natureNote="open for pull requests"
                spaceNote="open for pull requests"
            />
            <h2>Let&rsquo;s Connect &mdash; Handshake, Not Deadlock</h2>
            <p className="contact-subtext">{CONTACT_SUBTEXT}</p>
            <ContactLinks />
          </div>
        </section>
      </>
  )
}