#!/usr/bin/env node

/**
 * Merges the admin "Fact Check Verification" module into "Fact Checks".
 *
 * Usage:
 *   node scripts/migrations/merge-fact-check-verification.js --dry-run
 *   node scripts/migrations/merge-fact-check-verification.js
 *
 * The plan is built in memory first. Nothing is written if any target file
 * already exists, so existing files are never overwritten.
 */
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL, fileURLToPath } from 'node:url'
import { listFiles } from '../utils/file-system.js'
import { hasFlag, printHelp } from '../utils/arguments.js'
import { log, createSummary } from '../utils/logger.js'

const SOURCE_DIR = 'src/features/admin/fact-check-verification'
const TARGET_DIR = 'src/features/admin/fact-checks'
const NAV_FILE = 'src/features/admin/constants/adminNav.ts'
const SOURCE_EXTENSIONS = ['.ts', '.tsx']

const TEXT_REWRITES = [
  ['@/features/admin/fact-check-verification/', '@/features/admin/fact-checks/'],
  ['/admin/fact-check-verification', '/admin/fact-checks/verification'],
  ["path: 'fact-check-verification'", "path: 'fact-checks/verification'"],
]

const STANDALONE_NAV_ENTRY = `  {
    label: 'Fact Check Verification',
    to: '/admin/fact-check-verification',
    icon: SearchCheck,
  },
`

function rewriteText(text) {
  return TEXT_REWRITES.reduce((output, [from, to]) => output.split(from).join(to), text)
}

function removeStandaloneNav(text) {
  if (!text.includes(STANDALONE_NAV_ENTRY)) {
    throw new Error(`Standalone nav entry not found in ${NAV_FILE}; review it manually.`)
  }

  let next = text.replace(STANDALONE_NAV_ENTRY, '')

  // Drop the SearchCheck icon import only when nothing else uses it.
  const usages = next.match(/\bSearchCheck\b/g) || []
  if (usages.length === 1) {
    next = next.replace(/import \{([^}]*)\} from 'lucide-react'/, (match, names) => {
      const kept = names
        .split(',')
        .map((name) => name.trim())
        .filter((name) => name && name !== 'SearchCheck')
      return `import { ${kept.join(', ')} } from 'lucide-react'`
    })
  }

  return next
}

function walkSource(projectRoot) {
  return listFiles(path.join(projectRoot, 'src'), { extensions: SOURCE_EXTENSIONS })
}

/**
 * Builds the migration plan without touching the file system.
 * Throws if a target already exists or the nav entry cannot be located.
 */
export function planMerge(projectRoot) {
  const sourceAbs = path.join(projectRoot, SOURCE_DIR)
  const targetAbs = path.join(projectRoot, TARGET_DIR)

  if (!fs.existsSync(sourceAbs)) {
    throw new Error(`Source module not found: ${SOURCE_DIR}`)
  }

  const moves = listFiles(sourceAbs).map((from) => {
    const relative = path.relative(sourceAbs, from)
    const to = path.join(targetAbs, relative)

    if (fs.existsSync(to)) {
      throw new Error(`Target already exists, refusing to overwrite: ${path.relative(projectRoot, to)}`)
    }

    const content = fs.readFileSync(from, 'utf8')
    return { from, to, content: rewriteText(content) }
  })

  const edits = []
  for (const file of walkSource(projectRoot)) {
    if (file.startsWith(sourceAbs + path.sep)) continue

    const relative = path.relative(projectRoot, file).split(path.sep).join('/')
    const original = fs.readFileSync(file, 'utf8')
    let updated = relative === NAV_FILE ? removeStandaloneNav(original) : original
    updated = rewriteText(updated)

    if (updated !== original) {
      edits.push({ file, content: updated })
    }
  }

  const leftovers = findLeftovers(projectRoot, moves, edits)

  return { projectRoot, sourceAbs, moves, edits, leftovers }
}

/**
 * Scans the post-migration contents for remaining references to the old
 * module, so the report reflects what will exist after the plan is applied.
 */
function findLeftovers(projectRoot, moves, edits) {
  const sourceAbs = path.join(projectRoot, SOURCE_DIR)
  const editedContent = new Map(edits.map((edit) => [edit.file, edit.content]))
  const hits = []

  const check = (file, content) => {
    content.split('\n').forEach((line, index) => {
      if (line.includes('fact-check-verification')) {
        const relative = path.relative(projectRoot, file).split(path.sep).join('/')
        hits.push({ file: relative, line: index + 1, text: line.trim() })
      }
    })
  }

  for (const file of walkSource(projectRoot)) {
    if (file.startsWith(sourceAbs + path.sep)) continue
    check(file, editedContent.get(file) ?? fs.readFileSync(file, 'utf8'))
  }

  for (const move of moves) {
    check(move.to, move.content)
  }

  return hits
}

/** Applies a plan produced by planMerge. Creates new files with flag 'wx'. */
export function applyMerge(plan, { dryRun = false } = {}) {
  const summary = createSummary()

  for (const move of plan.moves) {
    const relative = path.relative(plan.projectRoot, move.to)
    if (dryRun) {
      log('info', `[dry-run] move ${path.relative(plan.projectRoot, move.from)} -> ${relative}`)
      continue
    }

    fs.mkdirSync(path.dirname(move.to), { recursive: true })
    fs.writeFileSync(move.to, move.content, { encoding: 'utf8', flag: 'wx' })
    fs.unlinkSync(move.from)
    summary.created += 1
    log('success', `moved ${relative}`)
  }

  for (const edit of plan.edits) {
    const relative = path.relative(plan.projectRoot, edit.file)
    if (dryRun) {
      log('info', `[dry-run] update references in ${relative}`)
      continue
    }

    fs.writeFileSync(edit.file, edit.content, 'utf8')
    log('success', `updated ${relative}`)
  }

  if (!dryRun && fs.existsSync(plan.sourceAbs)) {
    const remaining = listFiles(plan.sourceAbs)
    if (remaining.length === 0) {
      fs.rmSync(plan.sourceAbs, { recursive: true })
      log('success', `removed empty obsolete directory ${SOURCE_DIR}`)
    } else {
      log('warning', `obsolete directory kept, still contains ${remaining.length} file(s)`)
    }
  }

  return summary
}

function main() {
  if (hasFlag('--help')) {
    printHelp('Merge Fact Check Verification into Fact Checks', [
      'Usage: node scripts/migrations/merge-fact-check-verification.js [--dry-run]',
      '',
      '  --dry-run   Print the plan without writing any files.',
    ])
    return
  }

  const dryRun = hasFlag('--dry-run')
  const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
  const plan = planMerge(projectRoot)

  log('info', `${dryRun ? 'Dry run: ' : ''}${plan.moves.length} file(s) to move, ${plan.edits.length} file(s) to update`)
  applyMerge(plan, { dryRun })

  if (plan.leftovers.length > 0) {
    log('warning', `${plan.leftovers.length} reference(s) still mention fact-check-verification; review before removing anything else:`)
    plan.leftovers.forEach((hit) => log('detail', `${hit.file}:${hit.line}  ${hit.text}`))
  } else {
    log('info', 'No remaining references to fact-check-verification.')
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    main()
  } catch (error) {
    log('error', error.message)
    process.exitCode = 1
  }
}
