import { ImageResponse } from 'next/og'

export const dynamic = 'force-static'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#0a0a14',
          padding: '72px 80px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: 20,
              letterSpacing: 4,
              textTransform: 'uppercase',
              color: '#8e8ab8',
              marginBottom: 22,
            }}
          >
            Who I Am
          </div>
          <div style={{ fontSize: 80, color: '#eceafc', lineHeight: 1.1 }}>
            About Durgesh
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 26, color: '#eceafc', maxWidth: 900, lineHeight: 1.5 }}>
            AI/ML engineer · INICAI (Indian Navy) &amp; ISRO ISTRAC alum · M.Tech, PES University
          </div>
          <div style={{ fontSize: 18, color: '#8e8ab8', marginTop: 14, letterSpacing: 1 }}>
            durgeshgowdac.dev/about
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
