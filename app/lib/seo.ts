import type { Metadata } from 'next'
import { SITE_URL } from '@/app/lib/site'

export const SITE_NAME = 'Durgesh Gowda C - Portfolio'

/**
 * Canonical + Open Graph + Twitter tags for one page. `path` is the page's path with its trailing slash ('/', '/about/', '/projects/<slug>/').
 * Each deployment names itself as the original (self-canonical), so every mirror is an independent, indexable site.
 * Next replaces (does not merge) a parent's `alternates` / `openGraph` / `twitter`, so every page that sets a title calls this itself.
 */
export function pageMeta({ title, description, path }: { title: string; description: string; path: string }): Pick<Metadata, 'alternates' | 'openGraph' | 'twitter'> {
    const url = `${SITE_URL}${path}`
    return {
        alternates: { canonical: url },
        openGraph: { type: 'website', siteName: SITE_NAME, title, description, url },
        twitter: { card: 'summary_large_image', title, description },
    }
}