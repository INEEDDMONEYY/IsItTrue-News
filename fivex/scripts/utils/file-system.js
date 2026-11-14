
const fs = require('node:fs')
const path = require('node:path')

const DEFAULT_IGNORED_DIRECTORIES = [
  'node_modules',
  '.git',
  'dist',
  'build',
  'coverage',
  '.next',
  '.vite',
]

function ensureDirectory(directoryPath, options = {}) {
  const { dryRun = false } = options

  if (fs.existsSync(directoryPath)) {
    return {
      created: false,
      path: directoryPath,
    }
  }

  if (!dryRun) {
    fs.mkdirSync(directoryPath, { recursive: true })
  }

  return {
    created: true,
    path: directoryPath,
  }
}

function writeFileIfMissing(filePath, content, options = {}) {
  const { dryRun = false } = options

  if (fs.existsSync(filePath)) {
    return {
      status: 'skipped',
      path: filePath,
    }
  }

  if (!dryRun) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true })

    try {
      fs.writeFileSync(filePath, content, {
        encoding: 'utf8',
        flag: 'wx',
      })
    } catch (error) {
      if (error.code === 'EEXIST') {
        return {
          status: 'skipped',
          path: filePath,
        }
      }

      throw error
    }
  }

  return {
    status: dryRun ? 'preview' : 'created',
    path: filePath,
  }
}

function readTextFile(filePath) {
  return fs.readFileSync(filePath, 'utf8')
}

function listFiles(directoryPath, options = {}) {
  const {
    extensions = null,
    recursive = true,
    ignoredDirectories = DEFAULT_IGNORED_DIRECTORIES,
  } = options

  if (!fs.existsSync(directoryPath)) return []

  const output = []

  for (const entry of fs.readdirSync(directoryPath, {
    withFileTypes: true,
  })) {
    const fullPath = path.join(directoryPath, entry.name)

    if (entry.isDirectory()) {
      if (recursive && !ignoredDirectories.includes(entry.name)) {
        output.push(
          ...listFiles(fullPath, {
            extensions,
            recursive,
            ignoredDirectories,
          }),
        )
      }

      continue
    }

    if (!extensions || extensions.includes(path.extname(entry.name))) {
      output.push(fullPath)
    }
  }

  return output
}

function resolveProjectPath(projectRoot, inputPath) {
  const resolvedRoot = path.resolve(projectRoot)
  const resolvedPath = path.resolve(resolvedRoot, inputPath)
  const relativePath = path.relative(resolvedRoot, resolvedPath)

  if (
    relativePath === '..' ||
    relativePath.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relativePath)
  ) {
    throw new Error(`Path escapes project root: ${inputPath}`)
  }

  return resolvedPath
}

module.exports = {
  DEFAULT_IGNORED_DIRECTORIES,
  ensureDirectory,
  writeFileIfMissing,
  readTextFile,
  listFiles,
  resolveProjectPath,
}
