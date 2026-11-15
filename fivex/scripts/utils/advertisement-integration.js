/**
 * Idempotent router and nav integration for the admin Advertisement module.
 *
 * Pure string transforms: callers decide whether to write the result. Each
 * function throws when its anchor is missing, so nothing is half-applied.
 */

const BANNERS_ROUTE = /^([ \t]*)\{ path: 'banners', element: <BannersPage \/> \},[ \t]*$/m
const CODES_ROUTE = /^([ \t]*)\{ path: 'advertisements', element: <AdvertisementCodesPage \/> \},[ \t]*$/m
const TOP_LEVEL_CODE = /^(export |const |function )/m

const BANNERS_IMPORT = "import { BannersPage } from '@/features/admin/banners/pages/BannersPage'\n"
const CODES_IMPORT = "import { AdvertisementCodesPage } from '@/features/admin/advertisements/pages/AdvertisementCodesPage'\n"

const NAV_BLOCK = /  \{\n    label: 'Banners',\n    to: '\/admin\/banners',\n    icon: Megaphone,\n  \},\n  \{\n    label: 'Advertisement Codes',\n    to: '\/admin\/advertisements',\n    icon: Code2,\n  \},\n/

function isUsed(source, identifier) {
  return new RegExp(`\\b${identifier}\\b`).test(source.replace(/^import .*$/gm, ''))
}

export function registerAdvertisementRoutes(source, importPath) {
  if (/\badvertisementRoutes\b/.test(source)) {
    return { content: source, changed: false, reason: 'already-registered' }
  }
  if (!BANNERS_ROUTE.test(source) || !CODES_ROUTE.test(source)) {
    throw new Error("Could not find the 'banners' or 'advertisements' route lines in the router file.")
  }
  if (!/\bNavigate\b/.test(source)) {
    throw new Error("The router file must import 'Navigate' to add legacy redirects.")
  }

  let content = source
    .replace(
      BANNERS_ROUTE,
      (_line, indent) =>
        `${indent}{ path: 'banners', element: <Navigate to="/admin/advertisement/banners" replace /> },`,
    )
    .replace(
      CODES_ROUTE,
      (_line, indent) =>
        `${indent}{ path: 'advertisements', element: <Navigate to="/admin/advertisement/promotional-referral-codes" replace /> },\n${indent}advertisementRoutes,`,
    )

  // Drop legacy imports that the redirects no longer use.
  for (const [line, identifier] of [
    [BANNERS_IMPORT, 'BannersPage'],
    [CODES_IMPORT, 'AdvertisementCodesPage'],
  ]) {
    if (content.includes(line) && !isUsed(content.replace(line, ''), identifier)) {
      content = content.replace(line, '')
    }
  }

  const insertAt = content.search(TOP_LEVEL_CODE)
  if (insertAt === -1) {
    throw new Error('Could not find the end of the import block in the router file.')
  }
  const importLine = `import { advertisementRoutes } from '${importPath}'\n`
  content = `${content.slice(0, insertAt)}${importLine}${content.slice(insertAt)}`

  return { content, changed: true, reason: 'registered' }
}

export function registerAdvertisementNav(source) {
  if (/to: '\/admin\/advertisement',/.test(source)) {
    return { content: source, changed: false, reason: 'already-registered' }
  }
  if (!NAV_BLOCK.test(source)) {
    throw new Error("Could not find the 'Banners' and 'Advertisement Codes' nav entries.")
  }

  let content = source.replace(
    NAV_BLOCK,
    "  {\n    label: 'Advertisement',\n    to: '/admin/advertisement',\n    icon: Megaphone,\n  },\n",
  )
  if (!isUsed(content, 'Code2')) {
    content = content.replace(/\bCode2, /, '').replace(/,\s*Code2(?=\s*[,}])/, '')
  }

  return { content, changed: true, reason: 'registered' }
}
