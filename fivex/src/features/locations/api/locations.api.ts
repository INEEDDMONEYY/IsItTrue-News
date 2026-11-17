import { apiClient } from '@/api/client'
import type {
  AssociationInput,
  DiscoveryItem,
  LocationView,
  PublicAssociation,
  ReaderLocationPreference,
  ReviewAssociation,
} from '../types/location.types'

interface Envelope<T> {
  data: T
}

export const locationsApi = {
  async search(query: string, limit = 10): Promise<LocationView[]> {
    const { data } = await apiClient.get<Envelope<LocationView[]>>('/api/locations/search', {
      params: { q: query, limit },
    })
    return data.data
  },

  async browse(parentId?: string): Promise<LocationView[]> {
    const { data } = await apiClient.get<Envelope<LocationView[]>>('/api/locations/browse', {
      params: parentId ? { parent: parentId } : undefined,
    })
    return data.data
  },

  async getLocation(locationId: string): Promise<LocationView> {
    const { data } = await apiClient.get<Envelope<LocationView>>('/api/locations/' + encodeURIComponent(locationId))
    return data.data
  },

  async nearest(latitude: number, longitude: number): Promise<LocationView | null> {
    const { data } = await apiClient.post<Envelope<LocationView | null>>('/api/locations/nearest', {
      latitude,
      longitude,
    })
    return data.data
  },

  /** Country-level estimate. Returns 503 until a provider is configured. */
  async approximate(): Promise<LocationView> {
    const { data } = await apiClient.get<Envelope<LocationView>>('/api/locations/approximate')
    return data.data
  },

  async getPreference(): Promise<ReaderLocationPreference> {
    const { data } = await apiClient.get<Envelope<ReaderLocationPreference>>('/api/locations/preference')
    return data.data
  },

  async savePreference(preference: ReaderLocationPreference): Promise<ReaderLocationPreference> {
    const { data } = await apiClient.put<Envelope<ReaderLocationPreference>>('/api/locations/preference', preference)
    return data.data
  },

  async discover(locationId: string, limit = 20): Promise<DiscoveryItem[]> {
    const { data } = await apiClient.get<Envelope<DiscoveryItem[]>>('/api/locations/discover', {
      params: { locationId, limit },
    })
    return data.data
  },

  async getPublicAssociations(articleId: string): Promise<PublicAssociation[]> {
    const { data } = await apiClient.get<Envelope<PublicAssociation[]>>(
      '/api/locations/articles/' + encodeURIComponent(articleId) + '/associations',
    )
    return data.data
  },

  async getReviewAssociations(articleId: string): Promise<ReviewAssociation[]> {
    const { data } = await apiClient.get<Envelope<ReviewAssociation[]>>(
      '/api/locations/articles/' + encodeURIComponent(articleId) + '/associations/review',
    )
    return data.data
  },

  async saveAssociations(articleId: string, associations: AssociationInput[]): Promise<ReviewAssociation[]> {
    const { data } = await apiClient.put<Envelope<ReviewAssociation[]>>(
      '/api/locations/articles/' + encodeURIComponent(articleId) + '/associations',
      { associations },
    )
    return data.data
  },
}
