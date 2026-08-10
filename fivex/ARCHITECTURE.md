# Architecture

This document defines what belongs in **shared** folders versus **feature** folders,
so the codebase doesn't drift back into duplicated, scattered logic.

## Rule of thumb

> If code encodes domain rules for one specific feature (articles, comments, users, ...),
> it lives inside that feature/module. If code has no feature-specific business logic
> and is reused by two or more features unchanged, it lives in a shared/global folder.

When in doubt, start the code inside the feature/module. Only promote it to a shared
folder once a second feature genuinely needs the same logic.

---

## Frontend (`src/`)

### Shared (global) folders

| Folder | Contains |
| --- | --- |
| `components/ui` | Generic, feature-agnostic UI primitives (Button, Input, Modal shell, etc.) |
| `components/navigation` | App-wide nav/header/footer/menu components |
| `components/typography` | Text/heading/paragraph primitives |
| `shared` | Cross-feature constants, types, and validators with no owning feature |
| `config` | Environment, routes, navigation, and API base configuration values |
| `lib` | Thin wrappers around third-party SDKs/clients (axios instance, cloudinary, dayjs, query client, storage) |
| `api` | The dedicated API layer: request client + generic request helpers used by every feature's `api/` folder |
| `state` | Global app state (auth session, theme, layout) that multiple features read |
| `hooks` | Generic reusable hooks with no feature-specific logic |
| `utils` | Generic helpers (date/number formatting) with no domain meaning |

### Feature folder contract (`src/features/<feature>/`)

Every feature — including reserved ones (`editor`, `seo`, `newsletter`) and every Admin
sub-module (`cms`, `dashboard`, `media`, `moderation`, `users`, `roles`, `analytics`,
`settings`) — follows the same internal shape:

```
<feature>/
├── api/         # feature-specific request functions, built on src/api
├── components/  # UI only used by this feature
├── hooks/       # hooks only used by this feature
├── pages/       # routed page components
├── services/    # business/orchestration logic for this feature
├── state/       # feature-local state (store slice, context)
├── types/       # feature-specific types/interfaces
└── utils/       # feature-specific helpers (e.g. articles/slug, seo/seo)
```

A feature should never need to reach into another feature's internals. Cross-feature
communication goes through `state/`, `api/`, or `shared/`.

---

## Backend (`backend/`)

### Shared (global) folders

| Folder | Contains |
| --- | --- |
| `config` | App-wide config only: `env.ts`, `cors.ts`, `logger.ts` instance factory |
| `middleware` | Express middleware used across every module (`authenticate`, `authorize`, `validate`, `errorHandler`, `notFound`, `rateLimiter`, `upload`) |
| `database` | DB connection, indexes, migrations, plugins, seed — infrastructure, not schemas |
| `cache` | Redis client + generic cache service/keys |
| `events` | Cross-module domain events (`articlePublished`, `commentCreated`, `userRegistered`) consumed by notifications/analytics/jobs |
| `mail` | Mail transport/service, providers, templates |
| `storage` | Cloudinary/object storage client, image optimization, upload service |
| `logging` | Audit/error/request loggers built on top of `config/logger.ts` |
| `security` | CSRF, encryption, security headers |
| `jobs` | Scheduled tasks that don't belong to a single module (e.g. `cleanup.job.ts`) |
| `utils` | Generic helpers with no domain meaning (`pagination.ts`, `slug.ts`) |
| `shared/constants` | Constants used by 2+ modules or by shared middleware (`permissions.ts`, `roles.ts`) |

### Module contract (`backend/modules/<module>/`)

```
<module>/
├── controllers/
├── services/
├── repositories/
├── routes/
├── validations/
├── models/        # Mongoose/DB schema(s) owned by this module
├── constants/      # only if the module has its own enums/constants
├── docs/           # OpenAPI/Swagger fragment for this module's routes
├── jobs/           # scheduled tasks specific to this module (e.g. articles/publishArticles)
└── utils/          # helpers specific to this module (e.g. articles/readingTime)
```

Modules: `articles`, `auth`, `bookmarks`, `categories`, `comments`, `media`,
`notifications`, `search`, `tags`, `users`.

A module owns its own model(s) — models are never scattered in a top-level `models/`
folder. If a piece of logic is needed by more than one module, move it to `shared/`,
not into one of the modules that happens to use it first.
