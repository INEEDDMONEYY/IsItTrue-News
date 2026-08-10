import { useState } from 'react'
import { Tags, Plus, Trash2 } from 'lucide-react'
import { useCategories } from '@/features/categories/hooks/useCategories'
import { EmptyStateCard } from '@/components/cards'
import { getErrorMessage } from '@/lib/getErrorMessage'

export function CategoriesPage() {
  const { categories, isLoading, error, createCategory, deleteCategory } = useCategories()
  const [newCategory, setNewCategory] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const handleAdd = async () => {
    const trimmed = newCategory.trim()
    if (!trimmed) return
    setFormError(null)
    try {
      await createCategory(trimmed)
      setNewCategory('')
    } catch (err) {
      setFormError(getErrorMessage(err, 'Failed to create category.'))
    }
  }

  const handleRemove = (id: string) => {
    deleteCategory(id).catch(() => {
      // Errors are surfaced via the query error state on the next fetch.
    })
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-heading mb-1">Article Categories</h1>
      <p className="text-sm text-text-muted mb-6">
        Categories available to authors when publishing an article — and shown as topics in
        the site navigation.
      </p>

      <div className="rounded-2xl border border-card-border bg-card p-5 mb-6">
        <h2 className="text-sm font-semibold text-card-heading mb-3">New category</h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="Category name"
            className="flex-1 rounded-lg border border-card-border bg-card-2 px-3 py-2 text-sm text-card-heading placeholder:text-card-text-dim outline-none focus:border-accent"
          />
          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-accent text-white hover:bg-accent/90 transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
        {formError && <p className="text-xs text-disputed mt-2">{formError}</p>}
      </div>

      {isLoading && <p className="text-sm text-text-muted">Loading categories...</p>}
      {error && <p className="text-sm text-disputed">{getErrorMessage(error, 'Failed to load categories.')}</p>}

      {!isLoading && categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <span
              key={category.id}
              className="inline-flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full border border-card-border bg-card text-sm text-card-heading"
            >
              {category.name}
              <button
                type="button"
                onClick={() => handleRemove(category.id)}
                className="p-0.5 rounded-full text-card-text-muted hover:text-disputed hover:bg-card-2 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      {!isLoading && categories.length === 0 && (
        <EmptyStateCard
          icon={Tags}
          title="No categories yet"
          description="Add a category above so authors can assign it to their articles."
        />
      )}
    </div>
  )
}

