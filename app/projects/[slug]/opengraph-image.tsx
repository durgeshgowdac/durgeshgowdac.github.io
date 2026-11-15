import { ImageResponse } from 'next/og'
import { PROJECTS, getProject } from '@/app/lib/projects'
import { stripRich } from '@/app/components/Rich'

export const dynamic = 'force-static'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export function generateStaticParams() {
    return PROJECTS.map(p => ({ slug: p.slug }))
}

export default async function OpengraphImage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const p = getProject(slug)
    const title = p?.title ?? 'Project'
    const tag = p?.tag ?? ''
    const full = stripRich(p?.desc ?? '')
    const desc = full.length > 150 ? `${full.slice(0, 150)}…` : full
    return new ImageResponse(
        (
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                backgroundColor: '#0a0a14', padding: '72px 80px', fontFamily: 'sans-serif' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: 22, letterSpacing: 4, textTransform: 'uppercase', color: '#8e8ab8', marginBottom: 22 }}>{tag}</div>
                    <div style={{ fontSize: 88, color: '#eceafc', lineHeight: 1.05 }}>{title}</div>
                    <div style={{ fontSize: 28, color: '#a8a4c8', marginTop: 28, lineHeight: 1.4, maxWidth: 980 }}>{desc}</div>
                </div>
                <div style={{ display: 'flex', fontSize: 24, color: '#ff9f5e', letterSpacing: 1 }}>Durgesh Gowda C · AI/ML Engineer</div>
            </div>
        ),
        { ...size }
    )
}