import dayjs from '@/lib/dayjs'
import type { CampaignPlacement, CampaignStatus } from '../types/advertiser.types'

export const STATUS_LABELS: Record<CampaignStatus, string> = {
  active: 'Active',
  pending_review: 'Pending Review',
  rejected: 'Rejected',
  completed: 'Completed',
}

export const PLACEMENT_LABELS: Record<CampaignPlacement, string> = {
  homepage_feature: 'Homepage Feature',
  article: 'Article Placement',
  sidebar: 'Sidebar Placement',
}

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

// Budgets are stored in cents; dividing here (not summing floats) keeps the displayed amount exact.
export function formatMoney(cents: number): string {
  return money.format(cents / 100)
}

export function formatCount(value: number): string {
  return value.toLocaleString('en-US')
}

export function timeAgo(iso: string): string {
  return dayjs(iso).fromNow()
}

// A short reference to show in place of the database id.
export function campaignRef(id: string): string {
  return `#${id.slice(-6).toUpperCase()}`
}
