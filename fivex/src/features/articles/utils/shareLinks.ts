export interface ShareTarget {
  id: 'x' | 'facebook' | 'linkedin' | 'whatsapp' | 'email'
  label: string
  href: string
}

// The public address of an article, as it should be shared: always the site's own page, whatever route the
// reader is on.
export function articleShareUrl(slug: string): string {
  return `${window.location.origin}/article/${encodeURIComponent(slug)}`
}

// Each network's "share this link" page, opened with the article already filled in.
export function buildShareTargets(url: string, title: string): ShareTarget[] {
  const u = encodeURIComponent(url)
  const t = encodeURIComponent(title)
  return [
    { id: 'x', label: 'X', href: `https://twitter.com/intent/tweet?url=${u}&text=${t}` },
    { id: 'facebook', label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { id: 'linkedin', label: 'LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
    { id: 'whatsapp', label: 'WhatsApp', href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}` },
    { id: 'email', label: 'Email', href: `mailto:?subject=${t}&body=${encodeURIComponent(`${title}\n\n${url}`)}` },
  ]
}
