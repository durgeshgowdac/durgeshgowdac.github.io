import type { MetadataRoute } from 'next'
import { PROJECTS } from '@/app/lib/projects'
import { SITE_URL } from '@/app/lib/site'

export const dynamic = 'force-static'

// No lastModified on purpose: a date that changes on every build tells crawlers everything is always
// fresh and they learn to ignore it. Add a real per-page date here only when you have one.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, changeFrequency: 'monthly', priority: 1 },
    { url: `${SITE_URL}/about/`, changeFrequency: 'monthly', priority: 0.8 },
    ...PROJECTS.map(p => ({
      url: `${SITE_URL}/projects/${p.slug}/`,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ]
}
