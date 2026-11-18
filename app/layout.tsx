import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import '@/app/globals.css'
import Header from '@/app/components/Header'
import ProgressBar from '@/app/components/ProgressBar'
import CustomCursor from '@/app/components/CustomCursor'
import Footer from '@/app/components/Footer'
import ScrollRail from '@/app/components/ScrollRail'
import { SITE_URL, GOOGLE_VERIFICATION } from '@/app/lib/site'
import { pageMeta, SITE_NAME } from '@/app/lib/seo'
import { CONTACTS } from '@/app/lib/contacts'
import { THEME_COLOR_LIGHT, THEME_COLOR_DARK } from '@/app/lib/theme'

// Self-hosted fonts (files in app/fonts, latin subset): no request to Google, no render-blocking stylesheet.
// next/font preloads them and sets size-adjusted fallbacks so text doesn't jump when they load.
const dmSerif = localFont({
  src: [
    { path: './fonts/dm-serif-display-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: './fonts/dm-serif-display-latin-400-italic.woff2', weight: '400', style: 'italic' },
  ],
  variable: '--font-dm-serif',
  display: 'swap',
  fallback: ['Georgia', 'serif'],
})
const dmMono = localFont({
  src: [
    { path: './fonts/dm-mono-latin-300-normal.woff2', weight: '300', style: 'normal' },
    { path: './fonts/dm-mono-latin-300-italic.woff2', weight: '300', style: 'italic' },
    { path: './fonts/dm-mono-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: './fonts/dm-mono-latin-500-normal.woff2', weight: '500', style: 'normal' },
  ],
  variable: '--font-dm-mono',
  display: 'swap',
  fallback: ['ui-monospace', 'monospace'],
})

// Structured data: tells search engines who this site is about and where else that person lives online.
const ORCID = 'https://orcid.org/0009-0004-5475-4104'
const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person',
      '@id': `${SITE_URL}/#person`,
      name: 'Durgesh Gowda C',
      url: SITE_URL,
      jobTitle: 'AI/ML Engineer',
      description: 'AI/ML engineer building production computer-vision, NLP and GenAI systems.',
      address: { '@type': 'PostalAddress', addressLocality: 'Bengaluru', addressCountry: 'IN' },
      alumniOf: [
        { '@type': 'CollegeOrUniversity', name: 'PES University' },
        { '@type': 'CollegeOrUniversity', name: 'Presidency University, Bengaluru' },
      ],
      knowsAbout: ['Computer Vision', 'Natural Language Processing', 'Generative AI', 'Retrieval-Augmented Generation', 'Person Re-identification', 'Machine Learning'],
      sameAs: [...CONTACTS.filter(c => c.href.startsWith('http')).map(c => c.href), ORCID],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'Durgesh Gowda C - Portfolio',
      author: { '@id': `${SITE_URL}/#person` },
    },
  ],
}

const IS_PREVIEW_BUILD =
    process.env.NEXT_PUBLIC_NOINDEX === 'true' ||
    (!!process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'production') ||
    (!!process.env.NETLIFY && process.env.CONTEXT !== undefined && process.env.CONTEXT !== 'production') ||
    (!!process.env.CF_PAGES && process.env.CF_PAGES_BRANCH !== undefined && process.env.CF_PAGES_BRANCH !== 'main')

export const metadata: Metadata = {
  // metadataBase resolves relative OG/Twitter image URLs to absolute ones.
  // SITE_URL comes from NEXT_PUBLIC_SITE_URL at deploy time (see lib/site.ts).
  metadataBase: new URL(SITE_URL),
  // Keep preview/branch deploys out of search results, but never the production site (including
  // GitHub Pages, where none of these variables exist). Set NEXT_PUBLIC_NOINDEX=true to force noindex.
  robots: IS_PREVIEW_BUILD ? { index: false, follow: false } : undefined,
  // ownership tokens for Google Search Console / Bing Webmaster Tools (see lib/site.ts); omitted while empty
  verification: {
    google: GOOGLE_VERIFICATION.length ? GOOGLE_VERIFICATION : undefined,
  },
  title: { default: 'Durgesh Gowda C - Portfolio', template: '%s · Durgesh Gowda C' },
  description:
      'Portfolio of Durgesh Gowda C, an AI/ML engineer building production computer-vision, NLP and GenAI systems.',
  // the home page's tags (the page itself is a client component and can't export metadata); every other page sets its own via pageMeta
  ...pageMeta({
    title: SITE_NAME,
    description: 'Portfolio of Durgesh Gowda C, an AI/ML engineer building production computer-vision, NLP and GenAI systems.',
    path: '/',
  }),
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: THEME_COLOR_LIGHT },
    { media: '(prefers-color-scheme: dark)', color: THEME_COLOR_DARK },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
      <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth" className={`${dmSerif.variable} ${dmMono.variable}`}>
      <head suppressHydrationWarning>
        {/* Runs before hydration/paint so a returning visitor's choice (or the
            new dark/Space default for first-time visitors) never flashes the
            other theme first. Kept intentionally tiny and dependency-free. */}
        <script
            dangerouslySetInnerHTML={{
              // A saved choice always wins. Otherwise: Space (dark) from 7 pm to 6 am local time, Nature (light) by day.
              __html: `(function(){var h=new Date().getHours(),night=h>=19||h<6,d=night;try{var t=localStorage.getItem('theme');if(t==='dark')d=true;else if(t==='light')d=false;}catch(e){}if(d)document.documentElement.setAttribute('data-theme','dark');})();`,
            }}
        />
        {/* Font Awesome, self-hosted and trimmed to the icons in use (/public/fa, no third-party CDN) */}
        <link rel="stylesheet" href="/fa/css/icons.css" />
        {/* Content that fades in via JS stays visible when JS is off */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
        <noscript>
          <style>{`.project-card,.timeline-item,.skill-group,.proj-section-hidden,.reveal{opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </head>
      <body suppressHydrationWarning>
      {/* Site chrome lives here once, so it is not remounted on every route change. */}
      <ProgressBar />
      <CustomCursor />
      <a className="skip-link" href="#main">Skip to content</a>
      <Header />
      <ScrollRail />
      <main id="main" tabIndex={-1}>{children}</main>
      <Footer />
      </body>
      </html>
  )
}