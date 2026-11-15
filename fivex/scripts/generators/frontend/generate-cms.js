#!/usr/bin/env node

/**
 * IITNews CMS Generator
 *
 * Usage:
 *   node scripts/generators/generate-cms.js
 *   node scripts/generators/generate-cms.js --dry-run
 *   node scripts/generators/generate-cms.js --root=src/features/admin/cms
 *
 * Paths resolve from the fivex project root, so the script can run from any directory.
 *
 * Safety:
 *   - Never overwrites existing files.
 *   - Never modifies existing API, hooks, services, or state.
 *   - Does not modify application routes or CmsPage automatically.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const DEFAULT_ROOT = 'src/features/admin/cms'

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const showHelp = args.includes('--help')

const rootArgument = args.find((arg) => arg.startsWith('--root='))
const cmsRoot = path.resolve(
  PROJECT_ROOT,
  rootArgument ? rootArgument.slice('--root='.length) : DEFAULT_ROOT,
)

if (showHelp) {
  console.log(`
IITNews CMS Generator

Options:
  --dry-run       Preview changes without writing files.
  --root=PATH     Set the CMS directory.
  --help          Display this help message.

Default CMS directory:
  ${DEFAULT_ROOT}
`)
  process.exit(0)
}

const moduleDefinitions = [
  {
    folder: 'page-management',
    component: 'PageManagementSection',
    page: 'PageManagementPage',
    title: 'Page Management',
    description:
      'Manage static website pages, publication status, revisions, and page metadata.',
    features: [
      'Create and edit public website pages',
      'Publish, unpublish, and archive pages',
      'Manage page revisions and version history',
      'Configure page titles and metadata',
      'Preview pages before publication',
      'Manage custom landing pages',
    ],
  },
  {
    folder: 'homepage',
    component: 'HomepageManagementSection',
    page: 'HomepageManagementPage',
    title: 'Homepage Management',
    description:
      'Control the stories, sections, and announcements displayed on the IITNews homepage.',
    features: [
      'Manage hero stories and featured articles',
      'Configure editor picks and trending stories',
      'Organize homepage content sections',
      'Manage featured investigations and fact-checks',
      'Schedule homepage content',
      'Manage breaking news banners',
    ],
  },
  {
    folder: 'navigation',
    component: 'NavigationManagementSection',
    page: 'NavigationManagementPage',
    title: 'Navigation Management',
    description:
      'Manage public-facing website navigation, menus, and footer links.',
    features: [
      'Manage header navigation',
      'Manage footer navigation',
      'Create dropdown menus',
      'Reorder navigation items',
      'Configure external links',
      'Control mobile navigation visibility',
    ],
  },
  {
    folder: 'global-content',
    component: 'GlobalContentSection',
    page: 'GlobalContentPage',
    title: 'Global Website Content',
    description:
      'Manage reusable content and messaging displayed throughout the public website.',
    features: [
      'Manage announcement bars',
      'Manage promotional banners',
      'Edit newsletter signup messaging',
      'Manage footer descriptions and contact details',
      'Configure social media links',
      'Manage reusable content blocks',
    ],
  },
  {
    folder: 'media',
    component: 'MediaAssetsSection',
    page: 'MediaAssetsPage',
    title: 'Media & Assets',
    description:
      'Manage public-facing website images, branding assets, and reusable media.',
    features: [
      'Manage logos and brand assets',
      'Manage homepage and page banner images',
      'Manage article thumbnails',
      'Manage category images',
      'Edit image alternative text',
      'Track asset usage across public pages',
    ],
  },
  {
    folder: 'article-presentation',
    component: 'ArticlePresentationSection',
    page: 'ArticlePresentationPage',
    title: 'Article Presentation',
    description:
      'Control how published articles are displayed and recommended across IITNews.',
    features: [
      'Manage featured and pinned articles',
      'Configure homepage article placement',
      'Manage related article recommendations',
      'Configure article display labels',
      'Manage recommended reading sections',
      'Configure article presentation preferences',
    ],
  },
  {
    folder: 'configuration',
    component: 'PlatformConfigurationSection',
    page: 'PlatformConfigurationPage',
    title: 'Platform Configuration',
    description:
      'Manage public-facing content presentation and website display preferences.',
    features: [
      'Configure default article display preferences',
      'Manage date and time presentation',
      'Configure author byline presentation',
      'Manage default category behavior',
      'Configure public-facing feature visibility',
      'Manage content display limits',
    ],
  },
  {
    folder: 'tags',
    component: 'TagManagementSection',
    page: 'TagManagementPage',
    title: 'Tag Management',
    description:
      'Manage article tags and the classification terms used across IITNews.',
    features: [
      'Create and edit article tags',
      'Manage tag descriptions and slugs',
      'Search and filter existing tags',
      'Manage tag visibility',
      'Review tag usage across articles',
      'Prevent deletion of tags still in use',
    ],
  },
]

function toPascalCase(value) {
  return value
    .split(/[-_\s]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
}

function createSectionSource(definition) {
  return `import { CmsModulePanel } from '../shared/CmsModulePanel'

export function ${definition.component}() {
  return (
    <CmsModulePanel
      title="${definition.title}"
      description="${definition.description}"
      features={[
${definition.features.map((feature) => `        '${feature.replace(/'/g, "\\'")}',`).join('\n')}
      ]}
    />
  )
}
`
}

function createPageSource(definition) {
  return `import { ${definition.component} } from '../components/${definition.folder}/${definition.component}'
import { CmsBreadcrumb } from '../components/shared/CmsBreadcrumb'

export function ${definition.page}() {
  return (
    <div className="space-y-6">
      <CmsBreadcrumb current="${definition.title}" />
      <header>
        <h1 className="text-2xl font-semibold text-heading">
          ${definition.title}
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          ${definition.description}
        </p>
      </header>

      <${definition.component} />
    </div>
  )
}
`
}

function createModulePanelSource() {
  return `interface CmsModulePanelProps {
  title: string
  description: string
  features: string[]
}

export function CmsModulePanel({
  title,
  description,
  features,
}: CmsModulePanelProps) {
  return (
    <section className="rounded-2xl border border-card-border bg-card p-5">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-card-heading">
          {title}
        </h2>
        <p className="mt-1 text-sm text-card-text-muted">
          {description}
        </p>
      </div>

      <div className="space-y-3">
        {features.map((feature) => (
          <div
            key={feature}
            className="flex items-start gap-3 text-sm text-card-text"
          >
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
            <span>{feature}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-dashed border-card-border bg-card-2 p-4">
        <p className="text-xs font-medium text-card-heading">
          Integration required
        </p>
        <p className="mt-1 text-xs leading-relaxed text-card-text-muted">
          This is a generated frontend scaffold. Connect this module to its
          existing backend API, services, hooks, and authorization rules
          before enabling management actions.
        </p>
      </div>
    </section>
  )
}
`
}

function createGuideSource() {
  const routeImports = moduleDefinitions
    .map((item) =>
      `import { ${item.page} } from '@/features/admin/cms/pages/${item.page}'`,
    )
    .join('\n')

  const routes = moduleDefinitions
    .map(
      (item) =>
        `  { path: 'cms/${item.folder}', element: <${item.page} /> },`,
    )
    .join('\n')

  return `# IITNews CMS Generator Output

Generated CMS frontend scaffolding.

## Important

- Existing files were preserved.
- Existing backend integrations were not modified.
- Generated pages are presentation scaffolds, not working CRUD modules.
- No API endpoints or backend contracts were invented.
- Connect each module to its actual backend before enabling management actions.

## Generated modules

${moduleDefinitions.map((item) => `- ${item.title}`).join('\n')}

## Route registration

Add the following imports to your existing admin route configuration:

\`\`\`tsx
${routeImports}
\`\`\`

Add the following child routes under your existing admin layout:

\`\`\`tsx
${routes}
\`\`\`

Choose route paths that match your existing routing conventions. These are suggested paths, not automatic route changes.

## Existing modules

The generator intentionally does not replace:

- CmsPage.tsx
- CategoriesSection.tsx
- ArticleEngagementSection.tsx
- Existing API files
- Existing hooks
- Existing services
- Existing state management
- Existing types

## Suggested next steps

1. Inspect the generated page and component scaffolds.
2. Connect each feature to existing backend contracts.
3. Add the appropriate authorization checks.
4. Add form validation and loading/error states.
5. Register the routes.
6. Test each feature against the backend.
`
}

const files = new Map()

function addFile(relativePath, content) {
  files.set(relativePath, content)
}

// Shared presentation component.
addFile(
  'components/shared/CmsModulePanel.tsx',
  createModulePanelSource(),
)

// Module components and pages.
for (const definition of moduleDefinitions) {
  addFile(
    `components/${definition.folder}/${definition.component}.tsx`,
    createSectionSource(definition),
  )

  addFile(
    `pages/${definition.page}.tsx`,
    createPageSource(definition),
  )
}

// Dedicated pages for existing CMS capabilities.
// These reuse the existing components and backend integrations.
addFile(
  'pages/CategoriesPage.tsx',
  `import { CategoriesSection } from '../components/CategoriesSection'
import { CmsBreadcrumb } from '../components/shared/CmsBreadcrumb'

export function CategoriesPage() {
  return (
    <div className="space-y-6">
      <CmsBreadcrumb current="Categories" />
      <header>
        <h1 className="text-2xl font-semibold text-heading">
          Categories
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Manage article categories used throughout IITNews.
        </p>
      </header>

      <CategoriesSection />
    </div>
  )
}
`,
)

addFile(
  'pages/DeveloperToolsPage.tsx',
  `import { ArticleEngagementSection } from '../components/ArticleEngagementSection'
import { CmsBreadcrumb } from '../components/shared/CmsBreadcrumb'

export function DeveloperToolsPage() {
  return (
    <div className="space-y-6">
      <CmsBreadcrumb current="Developer Tools" />
      <header>
        <h1 className="text-2xl font-semibold text-heading">
          Developer Tools
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Development and testing utilities for IITNews.
        </p>
      </header>

      <ArticleEngagementSection />
    </div>
  )
}
`,
)

// Documentation.
addFile('CMS_GENERATOR_GUIDE.md', createGuideSource())

const directories = new Set()

for (const relativePath of files.keys()) {
  let current = path.dirname(path.join(cmsRoot, relativePath))


  while (current.startsWith(cmsRoot)) {
    directories.add(current)
    if (current === cmsRoot) break
    current = path.dirname(current)
  }
}

// Ensure the standard architecture directories exist without adding
// placeholder API files or replacing existing integrations.
for (const directory of [
  'api',
  'components',
  'data',
  'hooks',
  'pages',
  'services',
  'state',
  'types',
  'utils',
]) {
  directories.add(path.join(cmsRoot, directory))
}

let created = 0
let skipped = 0
let directoriesCreated = 0

console.log('\nIITNews CMS Generator')
console.log('=====================')
console.log(`Target: ${cmsRoot}`)
console.log(`Mode: ${dryRun ? 'DRY RUN (no files will be written)' : 'WRITE'}`)
console.log('')

for (const directory of [...directories].sort()) {
  if (fs.existsSync(directory)) continue

  console.log(`${dryRun ? '[CREATE DIR]' : '[CREATE DIR]' } ${path.relative(process.cwd(), directory)}`)

  if (!dryRun) {
    fs.mkdirSync(directory, { recursive: true })
  }

  directoriesCreated += 1
}

console.log('')

for (const [relativePath, content] of files) {
  const absolutePath = path.join(cmsRoot, relativePath)
  const displayPath = path.relative(process.cwd(), absolutePath)

  if (fs.existsSync(absolutePath)) {
    console.log(`[SKIP]       ${displayPath}`)
    skipped += 1
    continue
  }

  console.log(`[CREATE]     ${displayPath}`)

  if (!dryRun) {
    fs.mkdirSync(path.dirname(absolutePath), { recursive: true })

    try {
      fs.writeFileSync(absolutePath, content, {
        encoding: 'utf8',
        flag: 'wx',
      })
      created += 1
    } catch (error) {
      if (error.code === 'EEXIST') {
        console.log(`[SKIP]       ${displayPath} (created by another process)`)
        skipped += 1
      } else {
        throw error
      }
    }
  } else {
    created += 1
  }
}

console.log('\nSummary')
console.log('-------')
console.log(`Directories ${dryRun ? 'to create' : 'created'}: ${directoriesCreated}`)
console.log(`Files ${dryRun ? 'to create' : 'created'}: ${created}`)
console.log(`Existing files preserved: ${skipped}`)

if (dryRun) {
  console.log('\nDry run complete. No files were written.')
  console.log('Run without --dry-run to generate the missing files.')
} else {
  console.log('\nCMS scaffolding generation complete.')
  console.log('Review CMS_GENERATOR_GUIDE.md before registering routes.')
}
