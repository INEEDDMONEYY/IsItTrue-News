/**
 * Turns a name into the URL slug the backend uses for categories and tags (backend/utils/slug.ts). Keep the two
 * identical: a tag chip links to /tag/<slug>, and that page looks the tag up by exactly this value.
 */
export function slugify(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
