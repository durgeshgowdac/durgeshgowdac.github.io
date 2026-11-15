import type { Metadata } from 'next'

// The About page is a client component (it can't export metadata), so its tags live here.
export const metadata: Metadata = {
  title: 'About',
  description:
    'Durgesh Gowda C — AI/ML engineer in Bengaluru. Computer vision and NLP systems, Indian Navy INICAI and ISRO ISTRAC internships, M.Tech at PES University.',
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children
}
