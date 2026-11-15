import { CONTACTS } from '@/app/lib/contacts'

/** The row of contact buttons (the circle + label markup the .social-links CSS expects). */
export default function ContactLinks() {
  return (
    <div className="social-links">
      {CONTACTS.map(c => (
        <a
          key={c.label}
          href={c.href}
          aria-label={c.label}
          {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          <i className={c.icon} aria-hidden="true" />
          <span className="social-label">{c.label}</span>
        </a>
      ))}
    </div>
  )
}
