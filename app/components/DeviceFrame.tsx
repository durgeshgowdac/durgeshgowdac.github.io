'use client'
import type { ReactNode } from 'react'

/**
 * A lightweight bordered "device frame" — a thin title bar with three dots
 * and an optional filename-style label — wrapping a piece of content. Meant
 * to signal "this is a real, running thing" rather than a plain text card,
 * borrowing the *idea* of HeyClicky's window chrome without its literal
 * macOS traffic-light skin: monochrome, theme-token-driven, no color coding.
 */
export default function DeviceFrame({
  label,
  children,
  className,
}: {
  label?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`device-frame${className ? ' ' + className : ''}`}>
      <div className="device-frame-bar">
        <span className="device-frame-dot" />
        <span className="device-frame-dot" />
        <span className="device-frame-dot" />
        {label && <span className="device-frame-label">{label}</span>}
      </div>
      <div className="device-frame-body">{children}</div>
    </div>
  )
}
