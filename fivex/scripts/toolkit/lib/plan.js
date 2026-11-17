/**
 * Safe file operations for the toolkit.
 *
 * Every command builds a plan first. The plan is checked before anything is
 * written: a new file whose content differs from what exists is a conflict,
 * and any conflict aborts the whole run. Re-running an identical plan reports
 * `unchanged`, which keeps generation idempotent. Explicit modifications are
 * patches to existing files, and a timestamped backup is written before each one.
 */
import fs from 'node:fs'
import path from 'node:path'
import { PROJECT_ROOT } from '../../utils/file-system.js'

export function assertInside(rootAbs, targetAbs) {
  const relative = path.relative(rootAbs, targetAbs)

  if (relative === '' || relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Refusing to touch ${targetAbs}: outside ${rootAbs}`)
  }

  return targetAbs
}

/** Resolves a directory option relative to a base directory, keeping it inside the base. */
export function resolveDestination(baseAbs, relativeDir) {
  return assertInside(baseAbs, path.resolve(baseAbs, relativeDir))
}

export function toProjectRelative(absolutePath) {
  return path.relative(PROJECT_ROOT, absolutePath).split(path.sep).join('/')
}

export function createPlan() {
  const operations = []

  return {
    /** Adds a new file. Existing identical content is unchanged; different content is a conflict. */
    addFile(absolutePath, content) {
      operations.push({ kind: 'create', absolutePath, content })
    },

    /**
     * Adds a patch to an existing file. `transform` receives the current text
     * and returns `{ content, changed, reason }`.
     */
    addPatch(absolutePath, transform) {
      operations.push({ kind: 'patch', absolutePath, transform })
    },

    operations,
  }
}

function backupPath(absolutePath, stamp) {
  return `${absolutePath}.bak-${stamp}`
}

/**
 * Checks the whole plan, then (unless dryRun) applies it. Nothing is written
 * when any operation conflicts, so a failed run leaves the tree untouched.
 *
 * @returns {{ ok: boolean, entries: Array<{action: string, path: string, detail: string}> }}
 */
export function executePlan(plan, { dryRun = false, stamp = new Date().toISOString().replace(/[:.]/g, '-') } = {}) {
  const entries = []
  const writes = []

  for (const operation of plan.operations) {
    const relative = toProjectRelative(operation.absolutePath)

    if (operation.kind === 'create') {
      if (!fs.existsSync(operation.absolutePath)) {
        entries.push({ action: 'create', path: relative, detail: 'new file' })
        writes.push({ ...operation, backup: false })
        continue
      }

      const current = fs.readFileSync(operation.absolutePath, 'utf8')
      if (current === operation.content) {
        entries.push({ action: 'unchanged', path: relative, detail: 'already generated' })
      } else {
        entries.push({ action: 'conflict', path: relative, detail: 'file exists with different content; not overwritten' })
      }
      continue
    }

    if (!fs.existsSync(operation.absolutePath)) {
      entries.push({ action: 'conflict', path: relative, detail: 'patch target does not exist' })
      continue
    }

    const current = fs.readFileSync(operation.absolutePath, 'utf8')
    const result = operation.transform(current)

    if (!result.changed) {
      entries.push({ action: 'unchanged', path: relative, detail: result.reason ?? 'already applied' })
      continue
    }

    entries.push({
      action: 'modify',
      path: relative,
      detail: `${result.reason ?? 'patched'}; backup ${toProjectRelative(backupPath(operation.absolutePath, stamp))}`,
    })
    writes.push({ ...operation, content: result.content, backup: true, current })
  }

  if (entries.some((entry) => entry.action === 'conflict')) {
    return { ok: false, entries: entries.map(markAborted) }
  }

  if (dryRun) {
    return {
      ok: true,
      entries: entries.map((entry) => (entry.action === 'create' || entry.action === 'modify' ? { ...entry, action: `preview-${entry.action}` } : entry)),
    }
  }

  for (const write of writes) {
    if (write.backup) {
      fs.writeFileSync(backupPath(write.absolutePath, stamp), write.current, { encoding: 'utf8', flag: 'wx' })
      fs.writeFileSync(write.absolutePath, write.content, 'utf8')
    } else {
      fs.mkdirSync(path.dirname(write.absolutePath), { recursive: true })
      fs.writeFileSync(write.absolutePath, write.content, { encoding: 'utf8', flag: 'wx' })
    }
  }

  return { ok: true, entries }
}

function markAborted(entry) {
  return entry.action === 'create' || entry.action === 'modify'
    ? { ...entry, action: `aborted-${entry.action}`, detail: `${entry.detail}; run stopped, nothing written` }
    : entry
}

export function renderReport(title, result) {
  const lines = [`\n${title}`, '='.repeat(title.length)]

  for (const entry of result.entries) {
    lines.push(`  ${entry.action.padEnd(18)} ${entry.path}  (${entry.detail})`)
  }

  const counts = result.entries.reduce((acc, entry) => {
    acc[entry.action] = (acc[entry.action] ?? 0) + 1
    return acc
  }, {})

  lines.push('', `Summary: ${JSON.stringify(counts)}`)
  lines.push(result.ok ? 'Status: ok' : 'Status: stopped due to conflicts (no files were written)')
  return lines.join('\n')
}
