#!/usr/bin/env node

/**
 * IITNews Advertisement Generator
 *
 * Creates the admin Advertisement module (10 sections) at /admin/advertisement.
 * Reuses the existing Banners and Advertising Codes pages, and reports the
 * backend capabilities that still need to be built instead of inventing endpoints.
 *
 * Examples:
 * node scripts/generators/frontend/generate-advertisement.js --dry-run
 * node scripts/generators/frontend/generate-advertisement.js
 * node scripts/generators/frontend/generate-advertisement.js --root=src/features/_tmp --no-register
 *
 * Options:
 * --root=PATH     Admin feature root inside src/ (default: src/features/admin).
 * --dry-run       Report planned changes without writing anything.
 * --no-register   Generate files but do not edit the router or admin nav.
 * --help          Display help.
 *
 * Safety:
 * - Never overwrites existing files. A zero-byte placeholder is replaced and reported.
 * - Router and nav registration are validated before any file is written, and are idempotent.
 * - Legacy /admin/banners and /admin/advertisements routes redirect to the new module.
 */

import fs from 'node:fs'
import path from 'node:path'
import { getOption, hasFlag } from '../../utils/arguments.js'
import { PROJECT_ROOT, resolveSourceRoot, toProjectRelative } from '../../utils/file-system.js'
import { registerAdvertisementNav, registerAdvertisementRoutes } from '../../utils/advertisement-integration.js'

if (hasFlag('--help')) {
  console.log(`
IITNews Advertisement Generator

Usage:
  node scripts/generators/frontend/generate-advertisement.js [--dry-run] [--no-register]

Options:
  --root=PATH     Admin feature root inside src/ (default: src/features/admin).
  --dry-run       Report planned changes without writing.
  --no-register   Do not edit the router or admin nav.
  --help          Display help.
`)
  process.exit(0)
}

const dryRun = hasFlag('--dry-run')
const noRegister = hasFlag('--no-register')
const ROUTER_FILE = path.join(PROJECT_ROOT, 'src/app/routes/index.tsx')
const NAV_FILE = path.join(PROJECT_ROOT, 'src/features/admin/constants/adminNav.ts')

// Pages that the Banners and Promotional Referral Codes sections wrap. They must exist.
const LEGACY_BANNERS_PAGE = 'src/features/admin/banners/pages/BannersPage.tsx'
const PROMO_CODES_PAGE = 'src/features/admin/advertisement/pages/PromotionalReferralCodesPage.tsx'

// status: connected | partial | local-only | pending
// Missing items describe backend capabilities only. They do not name endpoints that do not exist.
const SECTIONS = [
  {
    route: 'overview',
    title: 'Overview',
    purpose: 'Revenue, active campaigns, pending approvals, impressions, clicks',
    status: 'connected',
    missing: [],
    page: 'AdvertisementOverviewPage',
  },
  {
    route: 'advertisers',
    title: 'Advertisers',
    purpose: 'Business accounts, contacts, billing details, advertiser status',
    status: 'connected',
    missing: [],
    page: 'AdvertisementAdvertisersPage',
  },
  {
    route: 'campaigns',
    title: 'Campaigns',
    purpose: 'Campaign creation, management, targeting, dates, and budgets',
    status: 'partial',
    missing: ['Admin create and edit of campaigns (campaign writes are advertiser-scoped)'],
    page: 'AdvertisementCampaignsPage',
  },
  {
    route: 'ad-placements',
    title: 'Ad Placements',
    purpose: 'Manage Header, Selected Page, Sidepage, Newsletter, Footer',
    status: 'partial',
    missing: ['Assigning campaigns or creatives to placements from admin (placement summaries are read-only)'],
    page: 'AdvertisementAdPlacementsPage',
  },
  {
    route: 'banners',
    title: 'Banners',
    purpose: 'Upload, manage, preview, approve, and assign creative assets',
    status: 'partial',
    missing: ['Creative asset upload and preview', 'Approval state for banners', 'Placement assignment for banners'],
    page: 'AdvertisementBannersPage',
  },
  {
    route: 'promotional-referral-codes',
    title: 'Promotional Referral Codes',
    purpose: 'Promotional referral codes with reward, validity, redemption limits, campaign, and partner',
    status: 'partial',
    missing: [
      'Redemption tracking for total and per-user limits',
      'Subscription plan catalog, campaign records, and partner records',
    ],
    page: 'AdvertisementPromotionalReferralCodesPage',
  },
  {
    route: 'scheduling',
    title: 'Scheduling',
    purpose: 'Campaign start/end dates, placement availability, reservations',
    status: 'partial',
    missing: ['Placement reservations and availability holds (no reservation model exists)'],
    page: 'AdvertisementSchedulingPage',
  },
  {
    route: 'approvals',
    title: 'Approvals',
    purpose: 'Review and approve advertisers, campaigns, and creative assets',
    status: 'partial',
    missing: ['Creative asset approval (ad assets have no approval status)'],
    page: 'AdvertisementApprovalsPage',
  },
  {
    route: 'analytics',
    title: 'Analytics',
    purpose: 'Impressions, clicks, CTR, campaign performance, revenue',
    status: 'partial',
    missing: ['Payment revenue (no payment provider is connected; revenue shown is committed budget)'],
    page: 'AdvertisementAnalyticsPage',
  },
  {
    route: 'settings',
    title: 'Settings',
    purpose: 'Global rules, pricing, integrations, defaults, and permissions',
    status: 'partial',
    missing: ['Editing pricing, ad rules, and defaults (values are read-only)', 'Integration configuration'],
    page: 'AdvertisementSettingsPage',
  },
]

function fail(message) {
  console.error(message)
  process.exit(1)
}

let root
try {
  root = resolveSourceRoot(getOption('root', 'src/features/admin'))
} catch (error) {
  fail(error.message)
}

for (const required of [LEGACY_BANNERS_PAGE, PROMO_CODES_PAGE]) {
  if (!fs.existsSync(path.join(PROJECT_ROOT, required))) {
    fail(`Required existing page is missing: ${required}. No files were written.`)
  }
}

const moduleDirectory = path.join(root, 'advertisement')
const relativeRoot = toProjectRelative(root)
const aliasBase = `@/${relativeRoot.replace(/^src\//, '')}`
const routesImportPath = `${aliasBase}/advertisement/routes`

const SECTIONS_UTIL = `export type AdvertisementSectionStatus = 'connected' | 'partial' | 'local-only' | 'pending'

export interface AdvertisementSection {
  route: string
  title: string
  purpose: string
  status: AdvertisementSectionStatus
  missing: string[]
}

export const ADVERTISEMENT_SECTIONS: readonly AdvertisementSection[] = ${JSON.stringify(SECTIONS.map(({ page, ...section }) => section), null, 2)}

export function requireAdvertisementSection(route: string): AdvertisementSection {
  const section = ADVERTISEMENT_SECTIONS.find((item) => item.route === route)
  if (!section) throw new Error('Unknown advertisement section: ' + route)
  return section
}
`

const STATUS_LABEL = `import type { AdvertisementSectionStatus } from '../utils/advertisementSections'

export const STATUS_LABEL: Record<AdvertisementSectionStatus, string> = {
  connected: 'Connected',
  partial: 'Partially connected',
  'local-only': 'Local only',
  pending: 'Backend not connected',
}
`

const SECTION_LAYOUT = `import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { ADVERTISEMENT_SECTIONS, type AdvertisementSection } from '../utils/advertisementSections'
import { STATUS_LABEL } from '../utils/advertisementStatus'

interface AdvertisementSectionLayoutProps {
  section: AdvertisementSection
  showHeader?: boolean
  children: ReactNode
}

export function AdvertisementSectionLayout({ section, showHeader = true, children }: AdvertisementSectionLayoutProps) {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          {showHeader ? <h1 className="text-2xl font-bold text-foreground">{section.title}</h1> : null}
          <span className="rounded-full border px-2.5 py-0.5 text-xs font-medium">{STATUS_LABEL[section.status]}</span>
        </div>
        <p className="text-sm text-muted-foreground">{section.purpose}</p>
      </header>
      <nav aria-label="Advertisement sections" className="flex flex-wrap gap-2">
        {ADVERTISEMENT_SECTIONS.map((item) => (
          <NavLink
            key={item.route}
            to={'/admin/advertisement/' + item.route}
            className={({ isActive }) =>
              'rounded-md px-3 py-1.5 text-sm ' + (isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted')
            }
          >
            {item.title}
          </NavLink>
        ))}
      </nav>
      {children}
    </div>
  )
}
`

const BACKEND_GAP = `import type { AdvertisementSection } from '../utils/advertisementSections'

export function AdvertisementBackendGap({ section }: { section: AdvertisementSection }) {
  return (
    <section className="space-y-3 rounded-lg border border-dashed p-6">
      <h2 className="text-lg font-semibold text-foreground">Backend not connected</h2>
      <p className="text-sm text-muted-foreground">
        No data is shown for this section. Values are never assumed until the backend provides these capabilities.
      </p>
      <ul className="list-disc space-y-1 pl-5 text-sm">
        {section.missing.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  )
}
`

function buildPage(section) {
  const isBanners = section.route === 'banners'
  const isCodes = section.route === 'promotional-referral-codes'
  const imports = [
    "import { AdvertisementSectionLayout } from '../components/AdvertisementSectionLayout'",
    isBanners || isCodes ? '' : "import { AdvertisementBackendGap } from '../components/AdvertisementBackendGap'",
    "import { requireAdvertisementSection } from '../utils/advertisementSections'",
    isBanners ? "import { BannersPage } from '@/features/admin/banners/pages/BannersPage'" : '',
    isCodes ? "import { PromotionalReferralCodesPage } from './PromotionalReferralCodesPage'" : '',
  ]
    .filter(Boolean)
    .join('\n')

  let body
  if (isBanners) {
    body = `    <AdvertisementSectionLayout section={section} showHeader={false}>
      <BannersPage />
    </AdvertisementSectionLayout>`
  } else if (isCodes) {
    body = `    <AdvertisementSectionLayout section={section} showHeader={false}>
      <PromotionalReferralCodesPage />
    </AdvertisementSectionLayout>`
  } else {
    body = `    <AdvertisementSectionLayout section={section}>
      <AdvertisementBackendGap section={section} />
    </AdvertisementSectionLayout>`
  }

  return `${imports}

const section = requireAdvertisementSection('${section.route}')

export function ${section.page}() {
  return (
${body}
  )
}
`
}

const ROUTES = `import { Navigate } from 'react-router-dom'
import type { RouteObject } from 'react-router-dom'
${SECTIONS.map((section) => `import { ${section.page} } from './pages/${section.page}'`).join('\n')}

export const advertisementRoutes: RouteObject = {
  path: 'advertisement',
  children: [
    { index: true, element: <Navigate to="overview" replace /> },
${SECTIONS.map((section) => `    { path: '${section.route}', element: <${section.page} /> },`).join('\n')}
  ],
}
`

const files = [
  { file: 'utils/advertisementSections.ts', content: SECTIONS_UTIL },
  { file: 'utils/advertisementStatus.ts', content: STATUS_LABEL },
  { file: 'components/AdvertisementSectionLayout.tsx', content: SECTION_LAYOUT },
  { file: 'components/AdvertisementBackendGap.tsx', content: BACKEND_GAP },
  { file: 'routes.tsx', content: ROUTES },
  ...SECTIONS.map((section) => ({ file: `pages/${section.page}.tsx`, content: buildPage(section) })),
]

// Plan registration first, so a missing anchor leaves no partial output.
let routerUpdate = null
let navUpdate = null
if (!noRegister) {
  try {
    routerUpdate = registerAdvertisementRoutes(fs.readFileSync(ROUTER_FILE, 'utf8'), routesImportPath)
  } catch (error) {
    fail(`Router registration failed; no files were written. ${error.message}`)
  }
  try {
    navUpdate = registerAdvertisementNav(fs.readFileSync(NAV_FILE, 'utf8'))
  } catch (error) {
    fail(`Nav registration failed; no files were written. ${error.message}`)
  }
}

const created = []
const replaced = []
const conflicts = []

for (const entry of files) {
  const target = path.join(moduleDirectory, entry.file)
  const label = toProjectRelative(target)

  if (!fs.existsSync(target)) {
    created.push(label)
  } else if (fs.statSync(target).size === 0) {
    replaced.push(label)
  } else {
    conflicts.push(label)
    continue
  }

  if (!dryRun) {
    fs.mkdirSync(path.dirname(target), { recursive: true })
    fs.writeFileSync(target, entry.content, 'utf8')
  }
}

const writeIfChanged = (update, file) => {
  if (update?.changed && !dryRun) fs.writeFileSync(file, update.content, 'utf8')
}
writeIfChanged(routerUpdate, ROUTER_FILE)
writeIfChanged(navUpdate, NAV_FILE)

function printList(title, items) {
  console.log(`\n${title} (${items.length})`)
  for (const item of items) console.log(`  - ${item}`)
}

console.log(`Advertisement generator${dryRun ? ' (dry run, nothing written)' : ''}`)
printList('Created', created)
printList('Replaced zero-byte placeholders', replaced)
printList('Kept existing files (conflicts, not overwritten)', conflicts)

if (noRegister) {
  console.log('\nRegistration: skipped (--no-register)')
} else {
  const describe = (update, file) =>
    update.reason === 'already-registered'
      ? `already registered in ${toProjectRelative(file)}`
      : `${dryRun ? 'would update' : 'updated'} ${toProjectRelative(file)}`
  console.log(`\nRegistration: ${describe(routerUpdate, ROUTER_FILE)}; ${describe(navUpdate, NAV_FILE)}`)
}

console.log('\nBackend capabilities still needed:')
for (const section of SECTIONS) {
  if (section.missing.length === 0) continue
  console.log(`  ${section.title} [${section.status}]`)
  for (const item of section.missing) console.log(`    - ${item}`)
}
