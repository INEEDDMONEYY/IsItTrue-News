export const FEATURE_NAME_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/
export const NAME_PATTERN = /^[A-Za-z][A-Za-z0-9-]*$/
export const MAX_FEATURE_NAME_LENGTH = 64

export function toKebabCase(value) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-zA-Z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
}

export function toPascalCase(value) {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
}

export function toCamelCase(value) {
  const pascal = toPascalCase(value)

  return pascal.charAt(0).toLowerCase() + pascal.slice(1)
}

export function isValidIdentifier(value) {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(value)
}

/**
 * Feature names are used as directory names, so they must be strict
 * kebab-case. Invalid input is rejected instead of being normalized.
 */
export function validateFeatureName(value) {
  if (
    typeof value !== 'string' ||
    value.length > MAX_FEATURE_NAME_LENGTH ||
    !FEATURE_NAME_PATTERN.test(value)
  ) {
    throw new Error(
      `Invalid feature name "${value}". Use lowercase kebab-case, for example: case-files`,
    )
  }

  return value
}

/**
 * Page and component names become identifiers and file names.
 * Returns the PascalCase form.
 */
export function validateName(value, label = 'Name') {
  if (typeof value !== 'string' || !NAME_PATTERN.test(value)) {
    throw new Error(
      `Invalid ${label.toLowerCase()} "${value}". Use letters, digits, and hyphens, starting with a letter.`,
    )
  }

  const pascal = toPascalCase(value)

  if (!isValidIdentifier(pascal)) {
    throw new Error(`Invalid ${label.toLowerCase()} "${value}".`)
  }

  return pascal
}

export function validateLayers(layers, availableLayers) {
  const invalid = layers.filter((layer) => !availableLayers.includes(layer))

  if (invalid.length > 0) {
    throw new Error(
      `Invalid layers: ${invalid.join(', ')}. Available layers: ${availableLayers.join(', ')}`,
    )
  }

  return layers
}

/**
 * Contract paths are written into generated source. Only plain API
 * paths under /api/ are accepted, which rules out quotes, template
 * syntax, and path traversal.
 */
export function validateApiPath(value) {
  if (
    typeof value !== 'string' ||
    !/^\/api\/[A-Za-z0-9_\-/{}]+$/.test(value) ||
    value.includes('//') ||
    value.split('/').includes('..')
  ) {
    throw new Error(
      `Invalid API path "${value}". Paths must start with /api/ and contain only letters, digits, "-", "_", "/", and {param} segments.`,
    )
  }

  const segments = value.match(/\{[^}]*\}/g) || []

  for (const segment of segments) {
    const name = segment.slice(1, -1)

    if (!isValidIdentifier(name)) {
      throw new Error(`Invalid path parameter "${segment}" in "${value}".`)
    }
  }

  return value
}

export function escapeComment(value) {
  return String(value).replace(/\*\//g, '* /')
}