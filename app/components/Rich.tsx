import Link from 'next/link'
import type { ReactNode } from 'react'

/**
 * Inline markup for copy that lives in data files (lib/projects.ts):
 *   **key term**          → <strong>  (full ink, a touch heavier — the same emphasis as the Home hero and About Me)
 *   [label](https://…)    → dotted-underline link (.hero-link); a "/path" target stays inside the app
 * Everything else is plain text. Keep links out of strings that render inside another link (e.g. a project card);
 * those use stripRich() instead.
 */
const TOKEN = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g

export function Rich({ text }: { text: string }) {
    const out: ReactNode[] = []
    let last = 0
    let key = 0
    const re = new RegExp(TOKEN.source, 'g')
    let m: RegExpExecArray | null
    while ((m = re.exec(text)) !== null) {
        const at = m.index
        if (at > last) out.push(text.slice(last, at))
        if (m[1] !== undefined) {
            out.push(<strong key={key++}>{m[1]}</strong>)
        } else if (m[3].startsWith('/')) {
            out.push(<Link key={key++} href={m[3]} className="hero-link">{m[2]}</Link>)
        } else {
            out.push(<a key={key++} href={m[3]} target="_blank" rel="noopener noreferrer" className="hero-link">{m[2]}</a>)
        }
        last = at + m[0].length
    }
    if (last < text.length) out.push(text.slice(last))
    return <>{out}</>
}

/** The same string with the markup removed — for search, <meta> descriptions, the social image and nested-link cards. */
export function stripRich(text: string): string {
    return text.replace(TOKEN, (_m, bold, label) => bold ?? label)
}