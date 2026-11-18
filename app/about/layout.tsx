import type { Metadata } from 'next'
import { pageMeta } from '@/app/lib/seo'

// The About page is a client component (it can't export metadata), so its tags live here.
const ABOUT_DESC =
    'Durgesh Gowda C — AI/ML engineer in Bengaluru. Computer vision and NLP systems, Indian Navy INICAI and ISRO ISTRAC internships, M.Tech at PES University.'

export const metadata: Metadata = {
  title: 'About',
  description: ABOUT_DESC,
  ...pageMeta({ title: 'About · Durgesh Gowda C', description: ABOUT_DESC, path: '/about/' }),
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children
}