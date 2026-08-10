import { useState, type KeyboardEvent } from 'react'
import { Plus, Tag as TagIcon, X } from 'lucide-react'
import { useTags } from '@/features/tags/hooks/useTags'

interface TagsInputProps {
  label: string
  helperText?: string
  placeholder?: string
  tags: string[]
  onChange: (tags: string[]) => void
}

/**
 * Free-text tag input with datalist-style suggestions pulled from the real
 * /api/tags list. New tags are created on the fly server-side when the
 * article is saved (see tagService.normalizeTags).
 */
export function TagsInput({ label, helperText, placeholder, tags, onChange }: TagsInputProps) {
  const { tags: existingTags } = useTags()
  const [draft, setDraft] = useState('')

  const addTag = () => {
    const value = draft.trim()
    if (!value || tags.some((t) => t.toLowerCase() === value.toLowerCase())) return
    onChange([...tags, value])
    setDraft('')
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag()
    }
  }

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index))
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
          list="existing-tags"
          placeholder={placeholder ?? 'e.g. Breaking News'}
          className="flex-1 px-3.5 py-2.5 rounded-xl border border-border bg-bg text-sm text-heading placeholder:text-text-dim focus:outline-none focus:ring-2 focus:ring-accent-border"
        />
        <datalist id="existing-tags">
          {existingTags.map((tag) => (
            <option key={tag.id} value={tag.name} />
          ))}
        </datalist>
        <button
          type="button"
          onClick={addTag}
          disabled={!draft.trim()}
          className="px-3 py-2.5 rounded-xl border border-border text-sm text-heading hover:border-accent-border hover:text-accent transition-colors disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {tags.length > 0 && (
        <ul className="flex flex-wrap gap-1.5 mt-2">
          {tags.map((tag, index) => (
            <li
              key={`${tag}-${index}`}
              className="flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full bg-card border border-card-border text-xs"
            >
              <TagIcon className="w-3 h-3 text-text-dim shrink-0" />
              <span className="text-card-text">{tag}</span>
              <button
                type="button"
                onClick={() => removeTag(index)}
                className="text-text-dim hover:text-disputed transition-colors shrink-0"
              >
                <X className="w-3 h-3" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
