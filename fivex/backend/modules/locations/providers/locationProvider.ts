import { createGeonamesProvider } from './geonamesLocationProvider.js'

export interface ProviderPlace {
  code: string
  name: string
  countryCode: string
  adminCode1: string | null
  timezone: string | null
  latitude: number
  longitude: number
}

export interface LocationProvider {
  readonly name: 'local' | 'geonames'
  search(query: string, limit: number): Promise<ProviderPlace[]>
}

const localProvider: LocationProvider = {
  name: 'local',
  async search() {
    return []
  },
}

/** Selected with LOCATION_PROVIDER. The local provider searches the Mongo seed only. */
export function createLocationProvider(): LocationProvider {
  return process.env.LOCATION_PROVIDER === 'geonames' ? createGeonamesProvider() : localProvider
}
