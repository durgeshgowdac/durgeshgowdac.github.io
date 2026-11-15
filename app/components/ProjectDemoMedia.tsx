'use client'
import { useEffect, useRef, useState } from 'react'

/**
 * Demo video for a project page — YouTube only, and only when a link is given.
 *
 * In app/lib/projects.ts set `youtube: 'https://www.youtube.com/watch?v=…'` (watch, youtu.be, shorts and
 * embed links all work; a ?t=90 / &t=1m30s start time is respected). No link, an empty string, or a link
 * that isn't recognisably YouTube → nothing renders, so there is never an empty box on the page.
 *
 * Until the visitor interacts the page only shows a thumbnail + play button, so the heavy YouTube iframe
 * isn't loaded for people who never press play. Uses youtube-nocookie.com.
 */

/** Flip to true to autoplay (muted) once the player is mostly on screen. Off by default — see the write-up
 *  in the project notes: click-to-play with sound is the better default for narrated demos. */
const AUTOPLAY_WHEN_VISIBLE = false

export type YouTubeRef = { id: string; start?: number }

/** "90", "90s", "1m30s", "1h2m3s" → seconds. */
function parseTime(t: string | null): number | undefined {
  if (!t) return undefined
  if (/^\d+$/.test(t)) return Number(t)
  const m = t.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/)
  if (!m) return undefined
  const secs = Number(m[1] ?? 0) * 3600 + Number(m[2] ?? 0) * 60 + Number(m[3] ?? 0)
  return secs > 0 ? secs : undefined
}

/** Pull the video id (and optional start time) out of any common YouTube URL. */
export function parseYouTube(url?: string): YouTubeRef | null {
  if (!url || !url.trim()) return null
  let u: URL
  try { u = new URL(url.trim()) } catch { return null }
  const host = u.hostname.replace(/^(www|m)\./, '')
  let id: string | null = null
  if (host === 'youtu.be') id = u.pathname.slice(1).split('/')[0]
  else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    if (u.pathname === '/watch') id = u.searchParams.get('v')
    else {
      const m = u.pathname.match(/^\/(?:embed|shorts|live|v)\/([^/?#]+)/)
      if (m) id = m[1]
    }
  }
  if (!id || !/^[\w-]{11}$/.test(id)) return null
  const start = parseTime(u.searchParams.get('t') ?? u.searchParams.get('start'))
  return { id, ...(start ? { start } : {}) }
}

/**
 * Captions default to OFF. YouTube has no documented "force captions off" switch (cc_load_policy=0 only
 * means "don't force them on"), so on top of the URL flags we also send the player its own "unload the
 * captions module" command once it has loaded. The CC button in the player still works for anyone who
 * wants subtitles.
 */
function silenceCaptions(frame: HTMLIFrameElement) {
  const send = (func: string, args: unknown[]) =>
    frame.contentWindow?.postMessage(JSON.stringify({ event: 'command', func, args }), 'https://www.youtube-nocookie.com')
  const run = () => { send('unloadModule', ['captions']); send('unloadModule', ['cc']) }
  run()                       // the player may not be ready for the first one…
  setTimeout(run, 700)        // …so repeat while it finishes starting up
  setTimeout(run, 2200)
}

/** Player URL — only ever called once the iframe is mounted in the browser (it reads window.location). */
function playerSrc(video: YouTubeRef, muted: boolean) {
  const params = new URLSearchParams({
    autoplay: '1', mute: muted ? '1' : '0', rel: '0', modestbranding: '1', playsinline: '1',
    cc_load_policy: '0', iv_load_policy: '3',                       // no forced captions, no annotations
    enablejsapi: '1', origin: window.location.origin,                // lets us talk to the player (see silenceCaptions)
  })
  if (video.start) params.set('start', String(video.start))
  return `https://www.youtube-nocookie.com/embed/${video.id}?${params.toString()}`
}

export default function ProjectDemoMedia({ url, title }: { url?: string; title: string }) {
  const video = parseYouTube(url)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)      // a click is a user gesture, so it can play with sound
  const [thumbOk, setThumbOk] = useState(true)   // if the thumbnail can't load, keep the dark poster clean
  const boxRef = useRef<HTMLDivElement>(null)
  const videoId = video?.id

  // optional autoplay (muted — browsers only allow autoplay when muted), skipped for reduced-motion visitors
  useEffect(() => {
    if (!AUTOPLAY_WHEN_VISIBLE || !videoId || playing) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const el = boxRef.current
    if (!el || !('IntersectionObserver' in window)) return
    const io = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) { setMuted(true); setPlaying(true); io.disconnect() }
    }, { threshold: 0.45 })
    io.observe(el)
    return () => io.disconnect()
  }, [videoId, playing])

  if (!video) return null

  return (
    <div className="proj-demo">
      <div className="proj-video" ref={boxRef}>
        {playing ? (
          <iframe
            src={playerSrc(video, muted)}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            onLoad={e => silenceCaptions(e.currentTarget)}
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <button type="button" className="proj-video-poster" onClick={() => { setMuted(false); setPlaying(true) }} aria-label={`Play: ${title}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {thumbOk && (
              <img src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`} alt="" loading="lazy" onError={() => setThumbOk(false)} />
            )}
            <span className="proj-video-play" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" fill="currentColor" /></svg>
            </span>
            <span className="proj-video-label">{title}</span>
          </button>
        )}
      </div>
    </div>
  )
}
