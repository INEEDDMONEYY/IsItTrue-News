import { readFileSync } from 'node:fs'

type Position = [number, number]
type Ring = Position[]

interface CountryBoundary {
  iso2: string
  bbox: [number, number, number, number]
  polygons: Ring[][]
}

interface BoundaryFile {
  source: string
  countries: CountryBoundary[]
}

const BOUNDARY_PATH = new URL('../data/countryBoundaries.json', import.meta.url)

let cachedBoundaries: CountryBoundary[] | null = null

function loadBoundaries(): CountryBoundary[] {
  if (!cachedBoundaries) {
    cachedBoundaries = (JSON.parse(readFileSync(BOUNDARY_PATH, 'utf8')) as BoundaryFile).countries
  }
  return cachedBoundaries
}

function crossesRing(longitude: number, latitude: number, ring: Ring): boolean {
  let crossings = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]
    const [xj, yj] = ring[j]
    if ((yi > latitude) !== (yj > latitude) && longitude < ((xj - xi) * (latitude - yi)) / (yj - yi) + xi) {
      crossings = !crossings
    }
  }
  return crossings
}

// Every ring toggles the result, so holes and enclaves inside a country are excluded.
function containsPoint(boundary: CountryBoundary, longitude: number, latitude: number): boolean {
  let inside = false
  for (const polygon of boundary.polygons) {
    for (const ring of polygon) {
      if (crossesRing(longitude, latitude, ring)) inside = !inside
    }
  }
  return inside
}

/** Returns the ISO 3166-1 alpha-2 code of the country containing the point, or null (for example, open ocean). */
export function countryAt(latitude: number, longitude: number): string | null {
  for (const boundary of loadBoundaries()) {
    const [minX, minY, maxX, maxY] = boundary.bbox
    if (longitude < minX || longitude > maxX || latitude < minY || latitude > maxY) continue
    if (containsPoint(boundary, longitude, latitude)) return boundary.iso2
  }
  return null
}
