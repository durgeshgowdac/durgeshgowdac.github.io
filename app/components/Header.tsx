'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { EMAIL_ADDRESS } from '@/app/lib/contacts'
import { THEME_COLOR_LIGHT, THEME_COLOR_DARK } from '@/app/lib/theme'

// Keeps the browser's address-bar colour in step with the site's theme (the static <meta> follows the OS setting
// instead). Reads --bg from the live stylesheet, so a palette change in base.css needs no edit here.
function syncThemeColor() {
  const root = document.documentElement
  const isDark = root.getAttribute('data-theme') === 'dark'
  const colour =
    getComputedStyle(root).getPropertyValue('--bg').trim() || (isDark ? THEME_COLOR_DARK : THEME_COLOR_LIGHT)
  const metas = document.querySelectorAll('meta[name="theme-color"]')
  if (metas.length) {
    metas.forEach(m => { m.setAttribute('content', colour); m.removeAttribute('media') })
  } else {
    const m = document.createElement('meta')
    m.name = 'theme-color'
    m.content = colour
    document.head.appendChild(m)
  }
}

export default function Header() {
  // Defaults to true (Space/dark) to match the new default theme set by the
  // blocking script in layout.tsx; the effect below immediately syncs this
  // to whatever data-theme actually ended up on <html> (including a
  // returning visitor's saved "light" choice).
  const [dark, setDark] = useState(true)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const copyTimer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(copyTimer.current), [])

  useEffect(() => {
    // The blocking script in app/layout.tsx already set data-theme on <html>
    // before paint (to avoid a flash); this just syncs React state to match it.
    setDark(document.documentElement.getAttribute('data-theme') === 'dark')
    syncThemeColor()
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Next can re-render the viewport meta on client navigation, so re-apply the colour on each route change.
  useEffect(() => { syncThemeColor() }, [pathname])

  // The header lives in the root layout and is not remounted between routes,
  // so reset scroll explicitly on every route change to land at the top.
  // Skipped when the URL has a hash (e.g. "Back to Projects" → /#projects): Next has already
  // scrolled to that anchor, and jumping to 0 here would override it. 'instant' avoids the
  // smooth-scroll animation that html { scroll-behavior: smooth } would otherwise add.
  useEffect(() => {
    if (window.location.hash) return
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])

  // "Get in touch" scrolls to the contact section if this page has one, otherwise goes to Home's.
  const goContact = (e: React.MouseEvent) => {
    const el = document.getElementById('contact')
    if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth', block: 'start' }) }
  }

  const [copied, setCopied] = useState(false)
  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL_ADDRESS)
    } catch {
      // clipboard API needs https/localhost; fall back to a temporary textarea
      const ta = document.createElement('textarea')
      ta.value = EMAIL_ADDRESS
      ta.style.position = 'fixed'; ta.style.opacity = '0'
      document.body.appendChild(ta); ta.select()
      try { document.execCommand('copy') } catch { /* nothing more to try */ }
      document.body.removeChild(ta)
    }
    setCopied(true)
    window.clearTimeout(copyTimer.current)
    copyTimer.current = window.setTimeout(() => setCopied(false), 1800)
  }

  const toggle = () => {
    const next = !dark
    setDark(next)
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light')
    syncThemeColor()
    try { localStorage.setItem('theme', next ? 'dark' : 'light') } catch { /* storage blocked: theme still applies for this visit */ }
  }

  return (
    <header style={{ boxShadow: scrolled ? 'var(--shadow)' : 'none' }}>
      {/* Left: logo + theme toggle */}
      <div className="logo-container">
        <div className="logo">
          <Link href="/" className="logo-link">
            <img src="/logo.svg" alt="" width={26} height={26} className="logo-mark" />
            durgeshgowdac.
          </Link>
        </div>
        <label className="switch">
          <input type="checkbox" checked={dark} onChange={toggle} aria-label="Space theme (dark). Turn off for Nature theme (light)" />
          <span className="slider">
            <span className="slider-icon slider-icon--tree" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                <path d="M12 2c-1.8 2.4-3.6 4.1-3.6 6.4 0 1 .4 1.8 1 2.4-1.9.3-3.4 1.9-3.4 3.9 0 1.3.7 2.4 1.7 3.1-.6.4-1 1-1 1.8 0 .2 0 .3.1.4h5.7v-4.6c-1.1-.2-2-1.1-2-2.3 0-.2 0-.4.1-.6-.7-.4-1.1-1.1-1.1-2 0-1.2 1-2.2 2.2-2.4-.5-.6-.8-1.4-.8-2.2C11 4.9 11.6 3.4 12 2z"/>
                <path d="M12 2c1.8 2.4 3.6 4.1 3.6 6.4 0 1-.4 1.8-1 2.4 1.9.3 3.4 1.9 3.4 3.9 0 1.3-.7 2.4-1.7 3.1.6.4 1 1 1 1.8 0 .2 0 .3-.1.4h-5.7v-4.6c1.1-.2 2-1.1 2-2.3 0-.2 0-.4-.1-.6.7-.4 1.1-1.1 1.1-2 0-1.2-1-2.2-2.2-2.4.5-.6.8-1.4.8-2.2C13 4.9 12.4 3.4 12 2z" opacity="0.65"/>
                <rect x="11.3" y="15" width="1.4" height="7" />
              </svg>
            </span>
            <span className="slider-icon slider-icon--ufo" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
                <ellipse cx="12" cy="10.5" rx="4.2" ry="3.4" opacity="0.55" />
                <ellipse cx="12" cy="13" rx="9.5" ry="2.6" />
                <circle cx="7.2" cy="13" r="0.9" opacity="0.7" />
                <circle cx="12" cy="14.1" r="0.9" opacity="0.7" />
                <circle cx="16.8" cy="13" r="0.9" opacity="0.7" />
                <path d="M12 13v6" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
              </svg>
            </span>
          </span>
        </label>
      </div>

      {/* Right: nav */}
      <div className="nav-right">
        <nav aria-label="Main navigation">
          <ul>
            <li>
              <Link href="/" className={pathname === '/' ? 'active' : ''}>
                Work
              </Link>
            </li>
            <li>
              <Link href="/about" className={pathname.startsWith('/about') ? 'active' : ''}>
                About
              </Link>
            </li>
          </ul>
        </nav>
        <div className="header-cta">
          <Link href="/#contact" className="header-cta-link" onClick={goContact} aria-label="Get in touch">
            <span className="cta-long" aria-hidden="true">Get in touch</span>
            <i className="fas fa-envelope cta-icon" aria-hidden="true" />
          </Link>
          <button type="button" className="header-cta-copy" onClick={copyEmail} aria-label={`Copy email address (${EMAIL_ADDRESS})`}>
            <i className={copied ? 'fas fa-check' : 'far fa-copy'} aria-hidden="true" />
          </button>
          <span className={`header-cta-tip${copied ? ' show' : ''}`} aria-hidden="true">Email copied</span>
          <span className="sr-only" role="status" aria-live="polite">{copied ? 'Email address copied to clipboard' : ''}</span>
        </div>
      </div>
    </header>
  )
}
