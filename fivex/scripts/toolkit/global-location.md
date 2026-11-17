# Global Location generator

Command: `node scripts/toolkit/toolkit.js global-location [--dry-run] [--register]` (run from `fivex/`).

This generator scaffolds the shared location foundation. It does not change the application UI or routes unless you pass `--register`.

## What it does

1. Loads and validates `scripts/contracts/global-location.contract.json` and `scripts/contracts/global-location.seed.json`. On any error it exits 1 and writes nothing.
2. Plans these new files. It never overwrites a file. A file that already exists with different content is a conflict, and the whole run aborts.
   - `backend/modules/locations/`: constants, three Mongoose models, provider abstraction, service, validation, controller, routes, and `data/locations.seed.json`.
   - `src/features/locations/`: types, API client, reader-location storage, device-location helper, two hooks, and `LocationModal.tsx`.
3. Reports the header status. The header is never patched.
4. With `--register`, adds `app.use('/api/locations', locationsRoutes)` to `backend/app.ts`, once. Repeat runs are idempotent.

`--dry-run` prints the plan and writes nothing.

## Architecture

**Identifiers.** Each location has an internal `locationId` in the form `prefix:code`. Display names are never keys.

| Level | Prefix | Code |
| --- | --- | --- |
| global | `global` | `world` |
| continent | `continent` | UN M49 |
| subregion | `subregion` | UN M49 |
| country | `country` | ISO 3166-1 alpha-2 |
| admin division | `admin_division` | ISO 3166-2 |
| city | `city` | GeoNames ID |
| district | `district` | GeoNames ID |
| place | `place` | GeoNames ID |

Not every level is required. A parent must rank above its child. Coordinates must be both null, or both finite and in range. `(0,0)` is rejected as a placeholder.

**Seed.** The seed is a small curated set (6 countries, 5 admin divisions, 6 cities, plus continents and subregions). Its place data is from GeoNames, licensed CC BY 4.0. Attribution is in the seed's `source` block and must be kept. Coordinates and IDs were entered without verification against GeoNames and must be checked before production use.

**Reader location (separate from article metadata).**
- The reader's selection is stored in its own model, `readerLocationPreference`. It is never stored on an article.
- Authenticated readers: server-side, via `GET` and `PUT /api/locations/preference`.
- Anonymous readers: localStorage.
- A saved location that no longer exists falls back to Global.
- Selecting a location never changes language, timezone, or currency.
- Device location: only after an explicit button press, with a single `getCurrentPosition` call. No watch. The coordinates go to `POST /api/locations/nearest` and are not stored.
- IP-based approximate location: `GET /api/locations/approximate`. Disabled by default (returns 503). It is country-level only and must be confirmed by the reader. Raw IPs are never stored or logged. Rate-limit keys are HMAC-hashed with `LOCATION_IP_HASH_SECRET`.

**Article geographic metadata.** Associations are stored per article in `articleGeoAssociation`.
- Relationship types: `primary` (one per article), `event`, `coverage`, `region` (global, continent, or subregion only), `country` (country only), `dateline` (one per article), `subject`.
- Duplicates are blocked by a unique index on (article, location, relationship).
- Status is `proposed`, `approved`, or `rejected`. Author writes are forced to `proposed`. Editor and admin writes are `approved`.
- Confidence is `confirmed` or `uncertain`.
- Public precision is capped by the location level and the relationship type. Order: hidden < region < country < subdivision < city. The effective cap is the lower of the two.
- Public responses never include coordinates.

**Provider abstraction.** `providers/locationProvider.ts` defines the interface. Two implementations exist:
- `local` (default): searches the MongoDB seed.
- `geonames`: optional. Uses `GEONAMES_USERNAME`, caches results for 24 hours, and calls the `searchJSON` endpoint. The GeoNames response fields are not yet verified against a live response.

No provider key goes to the frontend.

**Discovery.** Location selection should boost relevance, not hard-filter results. City, region, country, and Global each raise ranking differently. International stories stay reachable. Future feed integration must use the existing article search, not a second search engine.

**SEO.** Documentation only. Approved, public-precision locations may map to `contentLocation` and `spatialCoverage` in future NewsArticle JSON-LD. The reader's selected location must never appear there. No JSON-LD or sitemap exists in the repo today.

## Environment variables

| Variable | Purpose | Default |
| --- | --- | --- |
| `LOCATION_PROVIDER` | `local` or `geonames` | `local` |
| `GEONAMES_USERNAME` | Required when `LOCATION_PROVIDER=geonames` | none |
| `LOCATION_IP_HASH_SECRET` | HMAC key for IP rate-limit keys. Required before enabling approximate location. | none |

## Generated file layout

```
backend/modules/locations/
  constants.ts
  models/geoLocation.model.ts
  models/readerLocationPreference.model.ts
  models/articleGeoAssociation.model.ts
  providers/locationProvider.ts
  providers/geonamesLocationProvider.ts
  services/location.service.ts
  validations/location.validation.ts
  controllers/location.controller.ts
  routes/locations.routes.ts
  data/locations.seed.json
src/features/locations/
  types/location.types.ts
  api/locations.api.ts
  utils/readerLocationStorage.ts
  utils/deviceLocation.ts
  hooks/useReaderLocation.ts
  hooks/useLocationSearch.ts
  components/LocationModal.tsx
```

The backend rules are duplicated in `constants.ts` because generated code cannot import from `scripts/`. The contract and the lib constants must be kept in step. The test suite checks the shipped contract, not the generated copy.

## Tests

```
node --test scripts/tests/global-location.test.js
node --test scripts/tests/*.test.js
```

Coverage: seed and contract validity, coordinate and association rules, syntax checks of all generated TS, dry run, create, idempotent repeat, conflict refusal, `--register` mounting once, and an invalid contract blocking writes.

The generated backend module and frontend feature were also typechecked (strict) in temp copies of the repo. Those checks are not part of the automated suite.

## Header integration

`Header.tsx` opens `LocationModal` from both Set Location buttons (desktop and mobile). It renders one modal instance and holds a single `locationOpen` flag. The modal reads and writes the reader preference through `useReaderLocation`. The header's other behavior is unchanged.

## Known limitations

- The seed is small. Its GeoNames IDs and coordinates were checked on the GeoNames site. ISO 3166-2 and M49 codes were not checked against their source lists.
- Approximate (IP) location stays disabled until a provider and `LOCATION_IP_HASH_SECRET` are configured.
- The article editor is not wired to geographic metadata.
- Replacing free-text location values in existing article data is a later migration step.
- The discovery ranking and SEO output are design only.
- Continent and subregion codes use UN M49, which is a choice, not a confirmed requirement.
