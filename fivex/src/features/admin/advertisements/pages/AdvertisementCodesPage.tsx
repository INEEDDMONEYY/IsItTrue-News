import { useState } from 'react'
import { Code2, Plus, Trash2 } from 'lucide-react'
import { EmptyStateCard } from '@/components/cards'

type AdPlacement = 'Header' | 'Sidebar' | 'In-Article' | 'Footer'

interface AdCode {
  id: string
  placement: AdPlacement
  code: string
  active: boolean
}

const PLACEMENTS: AdPlacement[] = ['Header', 'Sidebar', 'In-Article', 'Footer']

const INITIAL_AD_CODES: AdCode[] = [
  {
    id: 'ad1',
    placement: 'Header',
    code: '<ins class="adsbygoogle" data-ad-slot="1111111111"></ins>',
    active: true,
  },
  {
    id: 'ad2',
    placement: 'In-Article',
    code: '<ins class="adsbygoogle" data-ad-slot="2222222222"></ins>',
    active: false,
  },
]

export function AdvertisementCodesPage() {
  const [codes, setCodes] = useState<AdCode[]>(INITIAL_AD_CODES)
  const [placement, setPlacement] = useState<AdPlacement>('Header')
  const [code, setCode] = useState('')

  const handleAdd = () => {
    if (!code.trim()) return
    setCodes((prev) => [{ id: `ad-${Date.now()}`, placement, code: code.trim(), active: true }, ...prev])
    setCode('')
  }

  const handleToggle = (id: string) => {
    setCodes((prev) => prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c)))
  }

  const handleRemove = (id: string) => {
    setCodes((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-heading mb-1">Advertisement Codes</h1>
      <p className="text-sm text-text-muted mb-6">
        Manage ad slot snippets injected into the reader-facing site by placement.
      </p>

      <div className="rounded-2xl border border-card-border bg-card p-5 mb-6">
        <h2 className="text-sm font-semibold text-card-heading mb-3">New ad code</h2>
        <div className="flex flex-col gap-3">
          <select
            value={placement}
            onChange={(e) => setPlacement(e.target.value as AdPlacement)}
            className="rounded-lg border border-card-border bg-card-2 px-3 py-2 text-sm text-card-heading outline-none focus:border-accent w-fit"
          >
            {PLACEMENTS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste ad script or tag snippet"
            rows={3}
            className="rounded-lg border border-card-border bg-card-2 px-3 py-2 text-sm font-mono text-card-heading placeholder:text-card-text-dim outline-none focus:border-accent resize-y"
          />
          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-accent text-white hover:bg-accent/90 transition-colors w-fit"
          >
            <Plus className="w-4 h-4" />
            Add code
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {codes.map((ad) => (
          <div key={ad.id} className="rounded-xl border border-card-border bg-card p-4">
            <div className="flex items-center justify-between gap-4 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border border-card-border text-card-text-muted">
                  {ad.placement}
                </span>
                <span
                  className={`text-xs ${ad.active ? 'text-verified' : 'text-card-text-dim'}`}
                >
                  {ad.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  role="switch"
                  aria-checked={ad.active}
                  onClick={() => handleToggle(ad.id)}
                  className={`relative w-10 h-6 rounded-full transition-colors ${
                    ad.active ? 'bg-accent' : 'bg-card-2'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                      ad.active ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(ad.id)}
                  className="p-1.5 rounded-lg text-card-text-muted hover:text-disputed hover:bg-card-2 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <pre className="text-xs font-mono text-card-text-muted bg-card-2 rounded-lg p-3 overflow-x-auto">
              {ad.code}
            </pre>
          </div>
        ))}

        {codes.length === 0 && (
          <EmptyStateCard
            icon={Code2}
            title="No ad codes yet"
            description="Add an ad slot snippet above to start monetizing a placement."
          />
        )}
      </div>
    </div>
  )
}
