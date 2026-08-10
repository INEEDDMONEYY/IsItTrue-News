import { AppError } from '../../../shared/errors/AppError.js'
import { slugify } from '../../../utils/slug.js'
import { tagRepository } from '../repositories/tag.repository.js'
import { DEFAULT_TAGS } from '../constants/tags.js'

export const tagService = {
  async listTags() {
    return tagRepository.findAll()
  },

  async getBySlug(slug: string) {
    return tagRepository.findBySlug(slug)
  },

  async createTag(name: string) {
    const slug = slugify(name)
    if (!slug) {
      throw new AppError('Please provide a valid tag name.', 400)
    }

    const existing = await tagRepository.findBySlug(slug)
    if (existing) {
      return existing
    }

    return tagRepository.create(name, slug)
  },

  async updateTag(id: string, name: string) {
    const slug = slugify(name)
    if (!slug) {
      throw new AppError('Please provide a valid tag name.', 400)
    }

    const tag = await tagRepository.findById(id)
    if (!tag) {
      throw new AppError('Tag not found.', 404)
    }

    const existing = await tagRepository.findBySlug(slug)
    if (existing && existing.id !== id) {
      throw new AppError('A tag with that name already exists.', 409)
    }

    await tagRepository.updateName(id, name, slug)
  },

  async deleteTag(id: string) {
    const tag = await tagRepository.findById(id)
    if (!tag) {
      throw new AppError('Tag not found.', 404)
    }

    await tagRepository.deleteById(id)
  },

  // Called whenever an article is created/updated with free-text tags. Syncs
  // the Tag collection (used to drive tag pages/filters) and returns the
  // canonical, deduped tag names to store on the article — resolving each
  // input to an existing tag's stored casing (by slug) when one already
  // exists, so "breaking news" and "Breaking News" always collapse to the
  // same tag instead of silently failing to match on tag pages later.
  async normalizeTags(names: string[]): Promise<string[]> {
    const seenSlugs = new Set<string>()
    const result: string[] = []

    for (const name of names) {
      const slug = slugify(name)
      if (!slug || seenSlugs.has(slug)) continue
      seenSlugs.add(slug)

      const existing = await tagRepository.findBySlug(slug)
      if (existing) {
        result.push(existing.name)
      } else {
        const created = await tagRepository.create(name, slug)
        result.push(created.name)
      }
    }

    return result
  },

  // Seeds a small default tag list so tag pages/filters aren't empty before
  // any articles have been tagged. Idempotent — safe to call on every boot.
  async ensureDefaultTags() {
    for (const name of DEFAULT_TAGS) {
      const slug = slugify(name)
      const existing = await tagRepository.findBySlug(slug)
      if (!existing) {
        await tagRepository.create(name, slug)
      }
    }
  },
}
