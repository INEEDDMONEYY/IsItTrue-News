
#!/usr/bin/env node

const fs = require('node:fs')
const path = require('node:path')
const { spawnSync } = require('node:child_process')

const {
  getOption,
  hasFlag,
  requireOption,
  printHelp,
} = require('../utils/arguments')

const { log } = require('../utils/logger')

const projectRoot = process.cwd()

const generators = {
  feature: path.resolve(
    projectRoot,
    'scripts/generators/generate-feature.js',
  ),

  page: path.resolve(
    projectRoot,
    'scripts/generators/generate-page.js',
  ),
}

if (hasFlag('--help')) {
  printHelp('IITNews Feature Setup', [
    'Usage:',
    '  node scripts/setup/setup-feature.js --feature=NAME [options]',
    '',
    'Options:',
    '  --feature=NAME       Feature name. Required.',
    '  --root=PATH          Feature output root. Default: src/features/admin',
    '  --layers=LIST        Comma-separated feature layers.',
    '  --with-page          Also generate the main list page.',
    '  --dry-run            Preview generated files without writing.',
    '  --help               Show help.',
    '',
    'Examples:',
    '  node scripts/setup/setup-feature.js --feature=advertising',
    '  node scripts/setup/setup-feature.js --feature=analytics --with-page',
    '  node scripts/setup/setup-feature.js --feature=case-files --layers=pages,components,types',
    '  node scripts/setup/setup-feature.js --feature=source-library --with-page --dry-run',
  ])

  process.exit(0)
}

function validateGenerators() {
  const missing = Object.entries(generators)
    .filter(([, filePath]) => !fs.existsSync(filePath))

  if (missing.length > 0) {
    const names = missing.map(([name]) => name).join(', ')

    throw new Error(
      `Required generator files are missing: ${names}`,
    )
  }
}

function buildFeatureArguments(feature) {
  const argumentsList = [
    generators.feature,
    `--feature=${feature}`,
    `--root=${getOption('root', 'src/features/admin')}`,
  ]

  const layers = getOption('layers')

  if (layers) {
    argumentsList.push(`--layers=${layers}`)
  }

  if (hasFlag('--dry-run')) {
    argumentsList.push('--dry-run')
  }

  return argumentsList
}

function buildPageArguments(feature) {
  const argumentsList = [
    generators.page,
    `--feature=${feature}`,
    `--name=${feature}`,
    '--type=list',
    `--root=${getOption('root', 'src/features/admin')}`,
  ]

  if (hasFlag('--dry-run')) {
    argumentsList.push('--dry-run')
  }

  return argumentsList
}

function runGenerator(name, argumentsList) {
  const [scriptPath, ...scriptArguments] = argumentsList

  log('info', `Running ${name} generator...`)

  const result = spawnSync(
    process.execPath,
    [scriptPath, ...scriptArguments],
    {
      cwd: projectRoot,
      stdio: 'inherit',
      encoding: 'utf8',
    },
  )

  if (result.error) {
    throw new Error(
      `Unable to run ${name} generator: ${result.error.message}`,
    )
  }

  if (result.status !== 0) {
    throw new Error(
      `${name} generator failed with exit code ${result.status}`,
    )
  }

  log('success', `${name} generator completed.`)
}

function main() {
  const feature = requireOption('feature').trim()
  const dryRun = hasFlag('--dry-run')
  const withPage = hasFlag('--with-page')

  if (!feature) {
    throw new Error('Feature name cannot be empty.')
  }

  validateGenerators()

  log('info', `Setting up feature: ${feature}`)

  if (dryRun) {
    log('warning', 'Dry-run mode enabled. No files will be written.')
  }

  runGenerator(
    'feature',
    buildFeatureArguments(feature),
  )

  if (withPage) {
    runGenerator(
      'page',
      buildPageArguments(feature),
    )
  }

  console.log('\nFeature setup completed.')
  console.log(`Feature: ${feature}`)
  console.log(`Output: ${getOption('root', 'src/features/admin')}/${feature}`)

  if (withPage) {
    console.log('Main list page: included')
  }

  if (dryRun) {
    console.log('Mode: preview only')
  }
}

try {
  main()
} catch (error) {
  log('error', error.message)
  process.exitCode = 1
}
