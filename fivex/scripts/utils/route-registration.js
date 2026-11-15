/**
 * Idempotent route registration for the admin router.
 *
 * Adds one import and one `systemRoutes` entry to the admin children, placed
 * after the `audit-logs` route. Pure string transform: callers decide whether
 * to write the result.
 */

const ANCHOR = /^([ \t]*)\{ path: 'audit-logs', element: <AuditLogsPage \/> \},[ \t]*$/m
const TOP_LEVEL_CODE = /^(export |const |function )/m

export function registerSystemRoutes(source, importPath) {
  if (/\bsystemRoutes\b/.test(source)) {
    return { content: source, changed: false, reason: 'already-registered' }
  }

  const anchor = source.match(ANCHOR)
  if (!anchor) {
    throw new Error("Could not find the 'audit-logs' route anchor in the router file.")
  }

  const topLevel = source.search(TOP_LEVEL_CODE)
  if (topLevel === -1) {
    throw new Error('Could not find the end of the import block in the router file.')
  }

  const importLine = `import { systemRoutes } from '${importPath}'\n`
  const withRoute = source.replace(
    ANCHOR,
    (_line, indent) =>
      `${indent}{ path: 'audit-logs', element: <AuditLogsPage /> },\n${indent}systemRoutes,`,
  )
  const insertAt = withRoute.search(TOP_LEVEL_CODE)
  const content = `${withRoute.slice(0, insertAt)}${importLine}${withRoute.slice(insertAt)}`

  return { content, changed: true, reason: 'registered' }
}
