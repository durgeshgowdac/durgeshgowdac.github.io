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
            AI/ML Engineer
          </div>
          <div style={{ fontSize: 96, color: '#eceafc', lineHeight: 1.05 }}>
            Durgesh Gowda C
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <svg width="72" height="72" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="72" fill="none" stroke="#1a1a18" strokeWidth="1.3" opacity={0.45} />
            <circle cx="100" cy="100" r="46" fill="none" stroke="#1a1a18" strokeWidth="1.3" opacity={0.3} />
            <path
              d="M100 100L58 58M100 100L146 62M58 58L38 32M58 58L52 26M146 62L168 38M146 62L174 58"
              fill="none"
              stroke="#1a1a18"
              strokeWidth="1.3"
            />
            <circle cx="100" cy="100" r="4.5" fill="#1a1a18" />
          </svg>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 24, color: '#eceafc' }}>
              Multi-camera Re-ID · Real-time systems · Game dev
            </div>
            <div style={{ fontSize: 18, color: '#8e8ab8', marginTop: 6, letterSpacing: 1 }}>
              durgeshgowdac.dev
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
