/**
 * Builds the country boundary file used for device-location country fallback, and adds any
 * missing country, subregion, and continent records to both location seed files.
 *
 * Source: Natural Earth 1:50m Admin 0 - Countries (public domain),
 * https://www.naturalearthdata.com/downloads/50m-cultural-vectors/
 *
 * Usage: tsx backend/scripts/buildCountryBoundaries.ts <path-to-ne_50m_admin_0_countries.geojson>
 */
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

type Position = [number, number]
type Ring = Position[]
type Polygon = Ring[]

interface Region {
  parent: string
  subregion?: { code: string; name: string; continent: string }
  continent?: { code: string; name: string }
}

interface NaturalEarthProperties {
  ISO_A2_EH: string
  NAME: string
  CONTINENT: string
  SUBREGION: string
}

interface SeedRecord {
  level: string
  code: string
  name: string
  aliases: string[]
  parent: string | null
  countryCode: string | null
  timezone: string | null
  latitude: number | null
  longitude: number | null
}

interface SeedFile {
  version: unknown
  source: unknown
  locations: SeedRecord[]
}

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const BOUNDARY_OUT = path.join(ROOT, 'backend/modules/locations/data/countryBoundaries.json')
const SEED_FILES = [
  path.join(ROOT, 'backend/modules/locations/data/locations.seed.json'),
  path.join(ROOT, 'scripts/contracts/global-location.seed.json'),
]

const CONTINENTS: Record<string, { code: string; name: string }> = {
  Africa: { code: '002', name: 'Africa' },
  'North America': { code: '019', name: 'Americas' },
  'South America': { code: '019', name: 'Americas' },
  Asia: { code: '142', name: 'Asia' },
  Europe: { code: '150', name: 'Europe' },
  Oceania: { code: '009', name: 'Oceania' },
  Antarctica: { code: '010', name: 'Antarctica' },
}

const CONTINENT_NAMES_BY_CODE = Object.fromEntries(Object.values(CONTINENTS).map((c) => [c.code, c.name]))

// UN M49 subregions, keyed by the lowercase Natural Earth SUBREGION value.
const SUBREGIONS: Record<string, { code: string; name: string; continent: string }> = {
  'eastern africa': { code: '014', name: 'Eastern Africa', continent: '002' },
  'middle africa': { code: '017', name: 'Middle Africa', continent: '002' },
  'northern africa': { code: '015', name: 'Northern Africa', continent: '002' },
  'southern africa': { code: '018', name: 'Southern Africa', continent: '002' },
  'western africa': { code: '011', name: 'Western Africa', continent: '002' },
  caribbean: { code: '029', name: 'Caribbean', continent: '019' },
  'central america': { code: '013', name: 'Central America', continent: '019' },
  'northern america': { code: '021', name: 'Northern America', continent: '019' },
  'south america': { code: '005', name: 'South America', continent: '019' },
  'central asia': { code: '143', name: 'Central Asia', continent: '142' },
  'eastern asia': { code: '030', name: 'Eastern Asia', continent: '142' },
  'south-eastern asia': { code: '035', name: 'South-eastern Asia', continent: '142' },
  'southern asia': { code: '034', name: 'Southern Asia', continent: '142' },
  'western asia': { code: '145', name: 'Western Asia', continent: '142' },
  'eastern europe': { code: '151', name: 'Eastern Europe', continent: '150' },
  'northern europe': { code: '154', name: 'Northern Europe', continent: '150' },
  'southern europe': { code: '039', name: 'Southern Europe', continent: '150' },
  'western europe': { code: '155', name: 'Western Europe', continent: '150' },
  'australia and new zealand': { code: '053', name: 'Australia and New Zealand', continent: '009' },
  melanesia: { code: '054', name: 'Melanesia', continent: '009' },
  micronesia: { code: '057', name: 'Micronesia', continent: '009' },
  polynesia: { code: '061', name: 'Polynesia', continent: '009' },
}

function round(value: number): number {
  return Math.round(value * 100) / 100
}

function simplifyRing(ring: Position[]): Ring {
  const out: Ring = []
  for (const [lon, lat] of ring) {
    const point: Position = [round(lon), round(lat)]
    const last = out[out.length - 1]
    if (!last || last[0] !== point[0] || last[1] !== point[1]) out.push(point)
  }
  return out
}

function regionFor(props: NaturalEarthProperties): Region {
  const subregion = SUBREGIONS[props.SUBREGION.toLowerCase()]
  if (subregion) {
    return {
      parent: `subregion:${subregion.code}`,
      subregion,
      continent: { code: subregion.continent, name: CONTINENT_NAMES_BY_CODE[subregion.continent] },
    }
  }
  const continent = CONTINENTS[props.CONTINENT]
  if (continent) return { parent: `continent:${continent.code}`, continent }
  return { parent: 'global:world' }
}

function bboxOf(polygons: Polygon[]): [number, number, number, number] {
  let minX = 180
  let minY = 90
  let maxX = -180
  let maxY = -90
  for (const polygon of polygons) {
    for (const ring of polygon) {
      for (const [x, y] of ring) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }
  return [minX, minY, maxX, maxY]
}

function addMissing(seed: SeedFile, record: SeedRecord): boolean {
  if (seed.locations.some((l) => l.level === record.level && l.code === record.code)) return false
  seed.locations.push(record)
  return true
}

function regionRecord(level: string, code: string, name: string, parent: string | null): SeedRecord {
  return { level, code, name, aliases: [], parent, countryCode: null, timezone: null, latitude: null, longitude: null }
}

function main(): void {
  const inputPath = process.argv[2]
  if (!inputPath) throw new Error('Pass the path to ne_50m_admin_0_countries.geojson')

  const source = JSON.parse(readFileSync(inputPath, 'utf8')) as {
    features: { properties: NaturalEarthProperties; geometry: { type: string; coordinates: unknown } }[]
  }

  const countries = new Map<string, { name: string; region: Region; polygons: Polygon[] }>()
  for (const feature of source.features) {
    const iso2 = feature.properties.ISO_A2_EH
    // XK (Kosovo) is a user-assigned code, not ISO 3166-1, so it is excluded.
    if (!/^[A-Z]{2}$/.test(iso2) || iso2 === 'XK') continue

    const raw = feature.geometry.type === 'Polygon' ? [feature.geometry.coordinates] : feature.geometry.coordinates
    const polygons = (raw as Position[][][])
      .map((polygon) => polygon.map(simplifyRing).filter((ring) => ring.length >= 4))
      .filter((polygon) => polygon.length > 0)

    const existing = countries.get(iso2)
    if (existing) {
      existing.polygons.push(...polygons)
    } else {
      countries.set(iso2, { name: feature.properties.NAME, region: regionFor(feature.properties), polygons })
    }
  }

  const sorted = [...countries.keys()].sort()
  const boundaries = {
    source: 'Natural Earth 1:50m Admin 0 - Countries (public domain), https://www.naturalearthdata.com/',
    countries: sorted.map((iso2) => {
      const { polygons } = countries.get(iso2)!
      return { iso2, bbox: bboxOf(polygons), polygons }
    }),
  }
  writeFileSync(BOUNDARY_OUT, JSON.stringify(boundaries) + '\n')

  for (const seedPath of SEED_FILES) {
    const seed = JSON.parse(readFileSync(seedPath, 'utf8')) as SeedFile
    let added = 0
    for (const iso2 of sorted) {
      const { name, region } = countries.get(iso2)!
      if (region.continent) {
        if (addMissing(seed, regionRecord('continent', region.continent.code, region.continent.name, 'global:world'))) added++
      }
      if (region.subregion) {
        const parent = `continent:${region.subregion.continent}`
        if (addMissing(seed, regionRecord('subregion', region.subregion.code, region.subregion.name, parent))) added++
      }
      const countryRecord: SeedRecord = {
        level: 'country',
        code: iso2,
        name,
        aliases: [],
        parent: region.parent,
        countryCode: iso2,
        timezone: null,
        latitude: null,
        longitude: null,
      }
      if (addMissing(seed, countryRecord)) added++
    }
    writeFileSync(seedPath, JSON.stringify(seed, null, 2) + '\n')
    console.log(`${path.relative(ROOT, seedPath)}: added ${added} records`)
  }
  console.log(`${path.relative(ROOT, BOUNDARY_OUT)}: ${sorted.length} countries`)
}

main()
