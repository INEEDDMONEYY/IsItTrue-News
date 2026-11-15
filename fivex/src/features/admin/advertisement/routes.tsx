import { Navigate } from 'react-router-dom'
import type { RouteObject } from 'react-router-dom'
import { AdvertisementOverviewPage } from './pages/AdvertisementOverviewPage'
import { AdvertisementAdvertisersPage } from './pages/AdvertisementAdvertisersPage'
import { AdvertisementCampaignsPage } from './pages/AdvertisementCampaignsPage'
import { AdvertisementAdPlacementsPage } from './pages/AdvertisementAdPlacementsPage'
import { AdvertisementBannersPage } from './pages/AdvertisementBannersPage'
import { AdvertisementPromotionalReferralCodesPage } from './pages/AdvertisementPromotionalReferralCodesPage'
import { AdvertisementSchedulingPage } from './pages/AdvertisementSchedulingPage'
import { AdvertisementApprovalsPage } from './pages/AdvertisementApprovalsPage'
import { AdvertisementAnalyticsPage } from './pages/AdvertisementAnalyticsPage'
import { AdvertisementSettingsPage } from './pages/AdvertisementSettingsPage'

export const advertisementRoutes: RouteObject = {
  path: 'advertisement',
  children: [
    { index: true, element: <Navigate to="overview" replace /> },
    { path: 'overview', element: <AdvertisementOverviewPage /> },
    { path: 'advertisers', element: <AdvertisementAdvertisersPage /> },
    { path: 'campaigns', element: <AdvertisementCampaignsPage /> },
    { path: 'ad-placements', element: <AdvertisementAdPlacementsPage /> },
    { path: 'banners', element: <AdvertisementBannersPage /> },
    { path: 'promotional-referral-codes', element: <AdvertisementPromotionalReferralCodesPage /> },
    { path: 'scheduling', element: <AdvertisementSchedulingPage /> },
    { path: 'approvals', element: <AdvertisementApprovalsPage /> },
    { path: 'analytics', element: <AdvertisementAnalyticsPage /> },
    { path: 'settings', element: <AdvertisementSettingsPage /> },
  ],
}
