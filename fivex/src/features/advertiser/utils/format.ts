import dayjs from '@/lib/dayjs'
import type { CampaignPlacement, CampaignStatus } from '../types/advertiser.types'

export const STATUS_LABELS: Record<CampaignStatus, string> = {
  draft: 'Draft',
  active: 'Active',
  pending_review: 'Pending Review',
  paused: 'Paused',
  rejected: 'Rejected',
  completed: 'Completed',
}

export const PLACEMENT_LABELS: Record<CampaignPlacement, string> = {
  header: 'Header',
  selected_page: 'Selected Page Ad',
  sidepage: 'Sidepage Ad',
  newsletter: 'Newsletter',
  footer: 'Footer',
}

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

// Budgets are stored in cents; dividing here (not summing floats) keeps the displayed amount exact.
export function formatMoney(cents: number): string {
  return money.format(cents / 100)
}

export function formatCount(value: number): string {
  return value.toLocaleString('en-US')
}

// The API returns CTR already as a percentage.
export function formatCtr(ctr: number): string {
  return `${ctr.toFixed(2)}%`
}

export function timeAgo(iso: string): string {
  return dayjs(iso).fromNow()
}

// A short reference to show in place of the database id.
export function campaignRef(id: string): string {
  return `#${id.slice(-6).toUpperCase()}`
}

export function formatDate(iso: string | null | undefined): string {
  return iso ? dayjs.utc(iso).format('MMM D, YYYY') : '—'
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// Stored as YYYY-MM-DD midnight UTC; reading it back in UTC keeps the advertiser's chosen day.
export function toDateInput(iso: string | null | undefined): string {
  return iso ? dayjs.utc(iso).format('YYYY-MM-DD') : ''
}
