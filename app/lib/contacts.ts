/**
 * Single source of truth for the contact buttons (Home + About render the same list).
 * Add, remove or reorder entries here and both pages follow.
 */
export type Contact = {
  label: string
  href: string
  /** Font Awesome class for the icon, e.g. "fab fa-github" */
  icon: string
  /** opens in a new tab (everything except mailto:) */
  external: boolean
}

/** Used by the mailto link and the header's copy-email button (which copies just the plain address). */
export const EMAIL_ADDRESS = 'durgeshcgowda@gmail.com'

/**
 * mailto: link with a short pre-filled subject and body, so the visitor opens a draft that is already
 * started. Pass `topic` (e.g. a project title) to mention it in the subject. Keep the body short —
 * it's a nudge, not a form — and editable; \r\n is what mail clients expect for line breaks.
 */
export function emailHref(topic?: string) {
  const subject = topic ? `${topic} — reaching out via your portfolio` : 'Reaching out via your portfolio'
  const body = [
    'Hi Durgesh,',
    '',
    'I came across your portfolio and wanted to reach out about [a role / a project / a collaboration].',
    '',
    '[A line about you, and what you have in mind]',
    '',
    'Best,',
    '[Your name]',
  ].join('\r\n')
  return `mailto:${EMAIL_ADDRESS}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

const ALL_CONTACTS: Contact[] = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/durgeshgowdac/', icon: 'fab fa-linkedin-in', external: true },
  { label: 'GitHub',   href: 'https://github.com/durgeshgowdac/',          icon: 'fab fa-github',      external: true },
  { label: 'X',        href: 'https://x.com/durgenious',                   icon: 'fab fa-x-twitter',   external: true },
  { label: 'YouTube',  href: 'https://www.youtube.com/@durgenious',        icon: 'fab fa-youtube',     external: true },
  { label: 'Email',    href: emailHref(),                            icon: 'fas fa-envelope',    external: false },
]

export const CONTACTS: Contact[] = ALL_CONTACTS.filter(c => c.href)

/** "email, LinkedIn, GitHub, X, or YouTube" — built from the buttons that are actually shown. */
export const CONTACT_SUBTEXT = (() => {
  const names = ['email', ...CONTACTS.filter(c => c.label !== 'Email').map(c => c.label)]
  const last = names.pop()
  return `Pick your protocol — ${names.join(', ')}, or ${last}. All return 200 OK.`
})()
