import { useState, type KeyboardEvent } from 'react'
import { Link2, Plus, X } from 'lucide-react'

interface LinkListInputProps {
  label: string
  helperText?: string
  placeholder?: string
  links: string[]
  onChange: (links: string[]) => void
}

export function LinkListInput({ label, helperText, placeholder, links, onChange }: LinkListInputProps) {
  const [draft, setDraft] = useState('')

  const addLink = () => {
    const value = draft.trim()
    if (!value) return
    onChange([...links, value])
    setDraft('')
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addLink()
    }
  }

  const removeLink = (index: number) => {
    onChange(links.filter((_, i) => i !== index))
  }

  return (
    <div>
      <label className="block text-xs text-text-muted mb-1.5">{label}</label>
      {helperText && <p className="text-xs text-text-dim mb-1.5">{helperText}</p>}

      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder ?? 'https://...'}
          className="flex-1 px-3.5 py-2.5 rounded-xl border border-border bg-bg text-sm text-heading placeholder:text-text-dim focus:outline-none focus:ring-2 focus:ring-accent-border"
        />
        <button
          type="button"
          onClick={addLink}
          disabled={!draft.trim()}
          className="px-3 py-2.5 rounded-xl border border-border text-sm text-heading hover:border-accent-border hover:text-accent transition-colors disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {links.length > 0 && (
        <ul className="flex flex-col gap-1.5 mt-2">
          {links.map((link, index) => (
            <li
              key={`${link}-${index}`}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-card-border text-xs"
            >
              <Link2 className="w-3.5 h-3.5 text-text-dim shrink-0" />
              <span className="text-card-text truncate flex-1">{link}</span>
              <button
                type="button"
                onClick={() => removeLink(index)}
                className="text-text-dim hover:text-disputed transition-colors shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
