import { apiClient } from '@/api/client'

export interface VendorSocialLinks {
  linkedin?: string
  facebook?: string
  instagram?: string
  x?: string
  youtube?: string
}

// Public directory card for a live vendor listing, built from the advertiser's profile.
export interface VendorListing {
  campaignId: string
  premium: boolean
  businessName: string
  logoUrl?: string
  website: string
  categories: string[]
  listingTitle: string
  listingDescription: string
  featuredProduct: string
  services: string
  socialLinks: VendorSocialLinks
}

// Public and read-only. Lists every live vendor, premium first.
export const vendorsApi = {
  getVendors: async (): Promise<VendorListing[]> => {
    const { data } = await apiClient.get<{ vendors: VendorListing[] }>('/api/ads/vendors')
    return data.vendors
  },
}
