interface SocialLink {
  label: string
  href: string
  icon: 'x' | 'instagram'
}

const SOCIAL_LINKS: SocialLink[] = [
  { label: 'IsItTrueNews on X (Twitter)', href: 'https://x.com/IsItTrueNews_', icon: 'x' },
  { label: 'IsItTrueNews on Instagram', href: 'https://www.instagram.com/isittruenews/', icon: 'instagram' },
]

// lucide-react no longer ships brand icons, so these are drawn here at the same 24px grid.
function SocialIcon({ icon }: { icon: SocialLink['icon'] }) {
  if (icon === 'x') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-[18px] fill-current">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    )
  }

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="size-[18px] fill-none stroke-current"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" className="fill-current" />
    </svg>
  )
}

export function SocialLinks() {
  return (
    <ul className="flex items-center gap-2" aria-label="IsItTrue News on social media">
      {SOCIAL_LINKS.map(({ label, href, icon }) => (
        <li key={href}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            title={label}
            className="flex size-9 items-center justify-center rounded-full border border-border text-text-muted transition-colors hover:border-accent-border hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            <SocialIcon icon={icon} />
          </a>
        </li>
      ))}
    </ul>
  )
}
