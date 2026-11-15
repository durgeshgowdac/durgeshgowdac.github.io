import { PROJECTS, getProject } from '@/app/lib/projects'
import { notFound } from 'next/navigation'
import ProjectDetail from '@/app/projects/[slug]/ProjectDetail'
import type { Metadata } from 'next'
import type { RepoInfo } from '@/app/components/ProjectExtras'
import { stripRich } from '@/app/components/Rich'

/**
 * Language / last push / stars for the repository link. Runs once at build time (static export), so it
 * refreshes whenever you redeploy. If GitHub can't be reached or rate-limits the build, this returns
 * undefined and the page simply omits the line. Set GITHUB_TOKEN in the build environment for a higher limit.
 */
async function getRepoInfo(url?: string): Promise<RepoInfo | undefined> {
  const m = url?.match(/github\.com\/([^/]+)\/([^/?#]+)/)
  if (!m) return undefined
  try {
    const res = await fetch(`https://api.github.com/repos/${m[1]}/${m[2].replace(/\.git$/, '')}`, {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'portfolio-build',
        ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
      },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return undefined
    const j = await res.json()
    return { language: j.language ?? null, pushedAt: j.pushed_at ?? null, stars: j.stargazers_count ?? 0 }
  } catch {
    return undefined
  }
}

// Required for `output: export` — tells Next.js all valid slugs at build time
export function generateStaticParams() {
  return PROJECTS.map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const project = getProject(slug)
  if (!project) return {}
  return { title: project.title, description: stripRich(project.desc) }
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const project = getProject(slug)
  if (!project) notFound()
  return <ProjectDetail key={project.slug} project={project} repo={await getRepoInfo(project.github)} />
}