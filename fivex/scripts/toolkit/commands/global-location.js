/**
 * Global Location generator. Validates the location contract and curated seed,
 * then plans the backend module, the frontend feature, and a copy of the seed.
 * It never overwrites files and never patches the header. With --register it
 * adds the /api/locations mount to backend/app.ts, which is opt-in.
 */
import fs from 'node:fs'
import path from 'node:path'
import { PROJECT_ROOT } from '../../utils/file-system.js'
import { createPlan, executePlan, renderReport, resolveDestination } from '../lib/plan.js'
import {
  BACKEND_MODULE,
  BOUNDARY_FILE,
  FRONTEND_FEATURE,
  HEADER_FILE,
  SEED_FILE,
  inspectHeaderIntegration,
  loadContract,
  loadSeed,
  validateContract,
  validateSeed,
} from '../lib/global-location.js'
import { appRegistrationPatch } from './generate.js'
import { locationBackendFiles } from '../templates/global-location-backend.js'
import { locationFrontendFiles } from '../templates/global-location-frontend.js'

const SEED_TARGET = 'data/locations.seed.json'
const BOUNDARY_TARGET = 'data/countryBoundaries.json'
const MOUNT = { name: 'locations', backendDir: BACKEND_MODULE, scope: 'public-read' }

/**
 * @param {{ dryRun?: boolean, register?: boolean }} options
 * @returns {{ exitCode: number, output: string }}
 */
export function runGlobalLocation({ dryRun = false, register = false } = {}, root = PROJECT_ROOT) {
  const lines = ['Global Location generator', '========================']

  let contract
  let seed
  try {
    contract = loadContract(root)
    seed = loadSeed(root)
  } catch (error) {
    return { exitCode: 1, output: [...lines, `Could not read contract or seed: ${error.message}`].join('\n') }
  }

  const problems = [
    ...validateContract(contract).map((message) => `contract: ${message}`),
    ...validateSeed(seed).map((message) => `seed: ${message}`),
  ]
  if (problems.length) {
    return { exitCode: 1, output: [...lines, 'Validation failed. Nothing was written.', ...problems.map((p) => `  - ${p}`)].join('\n') }
  }
  lines.push('Contract and seed: valid.')

  const plan = createPlan()
  const backendBase = path.join(root, 'backend', BACKEND_MODULE)
  const frontendBase = path.join(root, 'src', FRONTEND_FEATURE)

  for (const [relative, content] of Object.entries(locationBackendFiles())) {
    plan.addFile(resolveDestination(backendBase, relative), content)
  }
  for (const [relative, content] of Object.entries(locationFrontendFiles())) {
    plan.addFile(resolveDestination(frontendBase, relative), content)
  }
  plan.addFile(resolveDestination(backendBase, SEED_TARGET), fs.readFileSync(path.join(root, SEED_FILE), 'utf8'))
  plan.addFile(resolveDestination(backendBase, BOUNDARY_TARGET), fs.readFileSync(path.join(root, BOUNDARY_FILE), 'utf8'))

  if (register) {
    plan.addPatch(path.join(root, 'backend', 'app.ts'), appRegistrationPatch(MOUNT))
  }

  const result = executePlan(plan, { dryRun })
  lines.push('', renderReport(`Files${dryRun ? ' (dry run)' : ''}`, result))

  const header = inspectHeaderIntegration(root)
  lines.push('')
  if (!header.exists) {
    lines.push(`Header: ${HEADER_FILE} not found.`)
  } else if (header.wired) {
    lines.push(`Header: Set Location is wired to ${FRONTEND_FEATURE}.`)
  } else {
    lines.push(`Header: Set Location is not wired yet. The header is not patched by this generator (${HEADER_FILE}).`)
  }
  if (!register) lines.push('Run with --register to mount /api/locations in backend/app.ts.')

  return { exitCode: result.ok ? 0 : 1, output: lines.join('\n') }
}
