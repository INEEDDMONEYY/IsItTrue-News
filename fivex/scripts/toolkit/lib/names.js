/**
 * Name and field validation shared by every toolkit command.
 * Names are kebab-case so they are safe as directory names and URL segments.
 */

const NAME_PATTERN = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/
const FIELD_PATTERN = /^[a-z][A-Za-z0-9]{0,39}$/
const RESERVED_FIELDS = new Set(['id', '_id', '__v', 'createdAt', 'updatedAt'])
export const FIELD_TYPES = ['string', 'number', 'boolean', 'date']

export function validateName(name) {
  if (typeof name !== 'string' || !NAME_PATTERN.test(name) || name.length > 40) {
    throw new Error(
      `Invalid name "${name}". Use lowercase kebab-case (letters, digits, single hyphens), max 40 characters.`,
    )
  }

  return name
}

/** Parses `title:string,count:number` into `[{ name, type }]`. */
export function parseFields(spec = '') {
  const entries = spec
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

  if (entries.length === 0) {
    return [{ name: 'name', type: 'string' }]
  }

  const seen = new Set()

  return entries.map((entry) => {
    const [name, type = 'string'] = entry.split(':').map((part) => part.trim())

    if (!FIELD_PATTERN.test(name) || RESERVED_FIELDS.has(name)) {
      throw new Error(`Invalid field name "${name}". Use camelCase and avoid id, _id, __v, createdAt, updatedAt.`)
    }

    if (!FIELD_TYPES.includes(type)) {
      throw new Error(`Invalid type "${type}" for field "${name}". Use one of: ${FIELD_TYPES.join(', ')}.`)
    }

    if (seen.has(name)) {
      throw new Error(`Duplicate field "${name}".`)
    }

    seen.add(name)
    return { name, type }
  })
}

export function toPascal(name) {
  return name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
}

export function toCamel(name) {
  const pascal = toPascal(name)
  return pascal.charAt(0).toLowerCase() + pascal.slice(1)
}

/** Singular, camelCase identifier used for single-record variables. */
export function singularCamel(name) {
  return toCamel(name.endsWith('s') && !name.endsWith('ss') ? name.slice(0, -1) : name)
}

export function singularPascal(name) {
  return toPascal(name.endsWith('s') && !name.endsWith('ss') ? name.slice(0, -1) : name)
}
