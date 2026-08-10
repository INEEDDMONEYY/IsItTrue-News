/**
 * Converts a string into a URL-safe slug (lowercase, hyphen-separated,
 * diacritics stripped, non-alphanumeric characters removed).
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
