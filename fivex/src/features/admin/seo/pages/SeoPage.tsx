import { useState } from 'react'
import { Globe } from 'lucide-react'

interface ToggleRowProps {
  label: string
  description: string
  defaultChecked?: boolean
}

function ToggleRow({ label, description, defaultChecked = false }: ToggleRowProps) {
  const [checked, setChecked] = useState(defaultChecked)

  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-card-border last:border-b-0">
      <div>
        <p className="text-sm text-card-heading">{label}</p>
        <p className="text-xs text-card-text-muted">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => setChecked((v) => !v)}
        className={`relative w-10 h-6 rounded-full transition-colors shrink-0 ${
          checked ? 'bg-accent' : 'bg-card-2'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
}

export function SeoPage() {
  const [siteTitle, setSiteTitle] = useState('IsItTrue News')
  const [metaDescription, setMetaDescription] = useState(
    'Fact-checked news and analysis you can trust.',
  )
  const [ogImageUrl, setOgImageUrl] = useState('')

  return (
    <div>
      <h1 className="text-2xl font-semibold text-heading mb-1">SEO</h1>
      <p className="text-sm text-text-muted mb-6">
        Search engine metadata and indexing preferences for the reader-facing site.
      </p>

      <div className="rounded-2xl border border-card-border bg-card p-5 mb-4">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-sm font-semibold text-card-heading">Site metadata</h2>
          <span className="text-[10px] uppercase tracking-wide text-card-text-dim px-2 py-0.5 rounded-full border border-card-border">
            Preview
          </span>
        </div>
        <p className="text-xs text-card-text-muted mb-4">
          Not yet persisted to the backend — this is a preview of upcoming SEO settings.
        </p>

        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-card-text-muted">Site title</span>
            <input
              type="text"
              value={siteTitle}
              onChange={(e) => setSiteTitle(e.target.value)}
              className="rounded-lg border border-card-border bg-card-2 px-3 py-2 text-sm text-card-heading outline-none focus:border-accent"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-card-text-muted">Meta description</span>
            <textarea
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              rows={2}
              className="rounded-lg border border-card-border bg-card-2 px-3 py-2 text-sm text-card-heading outline-none focus:border-accent resize-y"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-card-text-muted">Default Open Graph image URL</span>
            <input
              type="text"
              value={ogImageUrl}
              onChange={(e) => setOgImageUrl(e.target.value)}
              placeholder="https://..."
              className="rounded-lg border border-card-border bg-card-2 px-3 py-2 text-sm text-card-heading placeholder:text-card-text-dim outline-none focus:border-accent"
            />
          </label>
        </div>
      </div>

      <div className="rounded-2xl border border-card-border bg-card p-5">
        <div className="flex items-center gap-2 mb-1">
          <Globe className="w-4 h-4 text-card-text-muted" />
          <h2 className="text-sm font-semibold text-card-heading">Indexing</h2>
        </div>
        <p className="text-xs text-card-text-muted mb-3">
          Control how search engines crawl and index the site.
        </p>
        <div>
          <ToggleRow
            label="Allow search engine indexing"
            description="Let search engines crawl and index published articles."
            defaultChecked
          />
          <ToggleRow
            label="Generate sitemap.xml"
            description="Automatically include published articles in the site's sitemap."
            defaultChecked
          />
          <ToggleRow
            label="Noindex draft & pending articles"
            description="Prevent unpublished content from being indexed."
            defaultChecked
          />
        </div>
      </div>
    </div>
  )
}
