import { ExternalLink } from 'lucide-react'

// The "Sources" box under a published article.
export function ArticleSources({ links }: { links: string[] }) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4">
      <h2 className="text-sm font-semibold text-heading">Sources</h2>
      <ul className="flex flex-col gap-1.5">
        {links.map((link, i) => (
          <li key={i}>
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline break-all"
            >
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              {link}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
