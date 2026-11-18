import type { AdTargetPage, CampaignPlacement } from '../types/advertiser.types'

export interface PlacementSpec {
  id: CampaignPlacement
  label: string
  summary: string
  where: string
  // Recommended creative size, shown to the advertiser and used for the preview's aspect ratio.
  size: { width: number; height: number }
  sizeLabel: string
  // Mirrors the server's PLACEMENT_REQUIREMENTS, so the form can flag gaps before submitting.
  imageRequired: boolean
  bodyRequired: boolean
  targeted: boolean
}

export const PLACEMENT_SPECS: PlacementSpec[] = [
  {
    id: 'header',
    label: 'Header',
    summary: 'A leaderboard banner across the top of every page.',
    where: 'Directly under the site navigation, site-wide',
    size: { width: 728, height: 90 },
    sizeLabel: '728 × 90 (mobile 320 × 50)',
    imageRequired: true,
    bodyRequired: false,
    targeted: false,
  },
  {
    id: 'selected_page',
    label: 'Category Sponsor',
    summary: 'A native sponsored card on only the pages you choose.',
    where: 'In the content of the pages you select',
    size: { width: 1200, height: 628 },
    sizeLabel: '1200 × 628',
    imageRequired: false,
    bodyRequired: true,
    targeted: true,
  },
  {
    id: 'sidepage',
    label: 'Sidepage Ad',
    summary: 'A medium rectangle in the sidebar on the pages you choose.',
    where: 'Right-hand sidebar on desktop, below the content on mobile',
    size: { width: 300, height: 250 },
    sizeLabel: '300 × 250',
    imageRequired: true,
    bodyRequired: false,
    targeted: true,
  },
  {
    id: 'newsletter',
    label: 'Newsletter',
    summary: 'A sponsored block inside the IsItTrue News newsletter.',
    where: 'Between stories in the subscriber newsletter email',
    size: { width: 600, height: 300 },
    sizeLabel: '600 × 300',
    imageRequired: false,
    bodyRequired: true,
    targeted: false,
  },
  {
    id: 'footer',
    label: 'Footer',
    summary: 'A wide banner above the footer of every page.',
    where: 'Above the site footer, site-wide',
    size: { width: 970, height: 90 },
    sizeLabel: '970 × 90',
    imageRequired: true,
    bodyRequired: false,
    targeted: false,
  },
  {
    id: 'vendor_listing',
    label: 'Vendor Listing',
    summary: 'A native listing card in the vendor directory section.',
    where: 'Vendor directory card on the home page',
    size: { width: 600, height: 300 },
    sizeLabel: '600 × 300',
    imageRequired: false,
    bodyRequired: true,
    targeted: false,
  },
  {
    id: 'premium_vendor_listing',
    label: 'Premium Vendor Listing',
    summary: 'A highlighted vendor card with an image and copy.',
    where: 'Top of the vendor directory section on the home page',
    size: { width: 600, height: 300 },
    sizeLabel: '600 × 300',
    imageRequired: true,
    bodyRequired: true,
    targeted: false,
  },
  {
    id: 'homepage_sponsor',
    label: 'Homepage Sponsor',
    summary: 'A sponsor banner on the home page.',
    where: 'Home page, below the category bar',
    size: { width: 970, height: 250 },
    sizeLabel: '970 × 250',
    imageRequired: true,
    bodyRequired: false,
    targeted: false,
  },
  {
    id: 'exclusive_homepage_sponsor',
    label: 'Exclusive Homepage Sponsor',
    summary: 'The single headline sponsor banner on the home page.',
    where: 'Home page, top of the content',
    size: { width: 1200, height: 400 },
    sizeLabel: '1200 × 400',
    imageRequired: true,
    bodyRequired: false,
    targeted: false,
  },
  {
    id: 'newsletter_sponsor',
    label: 'Newsletter Sponsor',
    summary: 'A sponsor block in the newsletter.',
    where: 'Top of the subscriber newsletter email',
    size: { width: 600, height: 300 },
    sizeLabel: '600 × 300',
    imageRequired: false,
    bodyRequired: true,
    targeted: false,
  },
  {
    id: 'sponsored_article',
    label: 'Sponsored Article',
    summary: 'A sponsored story in the home page feed.',
    where: 'Home page feed, between news stories',
    size: { width: 1200, height: 628 },
    sizeLabel: '1200 × 628',
    imageRequired: false,
    bodyRequired: true,
    targeted: false,
  },
  {
    id: 'section_ad',
    label: 'Section Ad',
    summary: 'One of five rotating slots that sponsor a group of sections, shared evenly across the site.',
    where: 'Inside the sections of the site assigned to your slot',
    size: { width: 600, height: 300 },
    sizeLabel: '600 × 300',
    imageRequired: true,
    bodyRequired: false,
    targeted: false,
  },
]

export const PLACEMENT_SPEC_BY_ID = Object.fromEntries(PLACEMENT_SPECS.map((spec) => [spec.id, spec])) as Record<
  CampaignPlacement,
  PlacementSpec
>

export const TARGET_PAGE_OPTIONS: { id: AdTargetPage; label: string }[] = [
  { id: 'home', label: 'Home page' },
  { id: 'for_you', label: 'For You' },
  { id: 'article', label: 'Article pages' },
  { id: 'fact_checks', label: 'Fact-checks' },
  { id: 'videos', label: 'Videos' },
  { id: 'investigations', label: 'Investigations' },
  { id: 'local', label: 'Local news' },
  { id: 'newsletter', label: 'Newsletter' },
]

export const TARGET_PAGE_LABELS = Object.fromEntries(TARGET_PAGE_OPTIONS.map((page) => [page.id, page.label])) as Record<
  AdTargetPage,
  string
>
