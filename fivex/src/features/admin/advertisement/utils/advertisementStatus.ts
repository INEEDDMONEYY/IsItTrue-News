import type { AdvertisementSectionStatus } from '../utils/advertisementSections'

export const STATUS_LABEL: Record<AdvertisementSectionStatus, string> = {
  connected: 'Connected',
  partial: 'Partially connected',
  'local-only': 'Local only',
  pending: 'Backend not connected',
}
