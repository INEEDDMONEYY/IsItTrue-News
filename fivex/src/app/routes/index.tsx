import { createBrowserRouter } from 'react-router-dom'
import { MainLayout } from '../layouts/MainLayout'
import { AuthLayout } from '../layouts/AuthLayout'
import { AdminLayout } from '../layouts/AdminLayout'
import { DashboardLayout } from '../layouts/DashboardLayout'
import { NotFoundPage } from '../pages/NotFoundPage'
import { ErrorPage } from '../pages/ErrorPage'
import { ProtectedRoute } from './ProtectedRoute'
import { AdminRoute } from './AdminRoute'
import { HomePage } from '@/features/home/pages/HomePage'
import { ForYouPage } from '@/features/for-you/pages/ForYouPage'
import { LocalPage } from '@/features/local/pages/LocalPage'
import { FactChecksPage } from '@/features/fact-checks/pages/FactChecksPage'
import { ArticlePage } from '@/features/articles/pages/ArticlePage'
import { CategoryPage } from '@/features/categories/pages/CategoryPage'
import { TagPage } from '@/features/tags/pages/TagPage'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { ProfilePage } from '@/features/auth/pages/ProfilePage'
import { AdminDashboardPage } from '@/features/admin/pages/AdminDashboardPage'
import { UsersPage } from '@/features/admin/users/pages/UsersPage'
import { CmsPage } from '@/features/admin/cms/pages/CmsPage'
import { ModerationPage } from '@/features/admin/moderation/pages/ModerationPage'
import { AnalyticsPage } from '@/features/admin/analytics/pages/AnalyticsPage'
import { SettingsPage } from '@/features/admin/settings/pages/SettingsPage'
import { BannersPage } from '@/features/admin/banners/pages/BannersPage'
import { AdvertisementCodesPage } from '@/features/admin/advertisements/pages/AdvertisementCodesPage'
import { SeoPage } from '@/features/admin/seo/pages/SeoPage'
import { CategoriesPage } from '@/features/admin/categories/pages/CategoriesPage'
import { TicketsPage } from '@/features/admin/tickets/pages/TicketsPage'
import { FactCheckVerificationPage } from '@/features/admin/fact-check-verification/pages/FactCheckVerificationPage'
import { DashboardHomePage } from '@/features/dashboard/pages/DashboardHomePage'
import { AccountSettingsPage } from '@/features/settings/pages/AccountSettingsPage'
import { ArticlesListPage } from '@/features/authors/pages/ArticlesListPage'
import { NewArticlePage } from '@/features/authors/pages/NewArticlePage'
import { FactCheckSubmissionPage } from '@/features/authors/pages/FactCheckSubmissionPage'
import { ReviewQueuePage } from '@/features/editor/pages/ReviewQueuePage'
import { DashboardAnalyticsPage } from '@/features/dashboard/pages/DashboardAnalyticsPage'
import { BookmarksPage } from '@/features/bookmarks/pages/BookmarksPage'
import { AboutPage } from '@/features/company/pages/AboutPage'
import { CareersPage } from '@/features/company/pages/CareersPage'
import { ContactPage } from '@/features/company/pages/ContactPage'
import { FaqPage } from '@/features/faq/pages/FaqPage'
import { SubmitTicketPage } from '@/features/tickets/pages/SubmitTicketPage'
import { PrivacyPolicyPage } from '@/features/legal/pages/PrivacyPolicyPage'
import { TermsOfServicePage } from '@/features/legal/pages/TermsOfServicePage'
import { CorrectionsPolicyPage } from '@/features/legal/pages/CorrectionsPolicyPage'
import { MyCommentsPage } from '@/features/comments/pages/MyCommentsPage'
import { MyVideosPage } from '@/features/videos/pages/MyVideosPage'
import VideoStudioPage from '@/features/videos/pages/VideoStudioPage'
import { AuthorSettingsPage } from '@/features/authors/pages/AuthorSettingsPage'
import { NotificationsPage } from '@/features/notifications/pages/NotificationsPage'
import { ProfileIdentityPage } from '@/features/profile/pages/ProfileIdentityPage'
import { DraftsPage } from '@/features/authors/pages/DraftsPage'
import { SubmissionQueuePage } from '@/features/authors/pages/SubmissionQueuePage'
import { PitchCenterPage } from '@/features/authors/pages/PitchCenterPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'for-you', element: <ForYouPage /> },
      { path: 'local', element: <LocalPage /> },
      { path: 'fact-checks', element: <FactChecksPage /> },
      { path: 'article/:slug', element: <ArticlePage /> },
      { path: 'category/:slug', element: <CategoryPage /> },
      { path: 'tag/:slug', element: <TagPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'careers', element: <CareersPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'faq', element: <FaqPage /> },
      { path: 'submit-ticket', element: <SubmitTicketPage /> },
      { path: 'privacy-policy', element: <PrivacyPolicyPage /> },
      { path: 'terms-of-service', element: <TermsOfServicePage /> },
      { path: 'corrections-policy', element: <CorrectionsPolicyPage /> },
      {
        element: <ProtectedRoute />,
        children: [{ path: 'profile', element: <ProfilePage /> }],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    path: 'admin',
    element: <AdminRoute />,
    errorElement: <ErrorPage />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminDashboardPage /> },
          { path: 'users', element: <UsersPage /> },
          { path: 'cms', element: <CmsPage /> },
          { path: 'moderation', element: <ModerationPage /> },
          { path: 'analytics', element: <AnalyticsPage /> },
          { path: 'banners', element: <BannersPage /> },
          { path: 'advertisements', element: <AdvertisementCodesPage /> },
          { path: 'seo', element: <SeoPage /> },
          { path: 'categories', element: <CategoriesPage /> },
          { path: 'tickets', element: <TicketsPage /> },
          { path: 'fact-check-verification', element: <FactCheckVerificationPage /> },
          { path: 'settings', element: <SettingsPage /> },
        ],
      },
    ],
  },
  {
    path: 'dashboard',
    element: <ProtectedRoute />,
    errorElement: <ErrorPage />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { index: true, element: <DashboardHomePage /> },
          { path: 'settings', element: <AccountSettingsPage /> },
          { path: 'articles', element: <ArticlesListPage /> },
          { path: 'articles/new', element: <NewArticlePage /> },
          { path: 'fact-checks', element: <FactCheckSubmissionPage /> },
          { path: 'review', element: <ReviewQueuePage /> },
          { path: 'analytics', element: <DashboardAnalyticsPage /> },
          { path: 'bookmarks', element: <BookmarksPage /> },
          { path: 'comments', element: <MyCommentsPage /> },
          { path: 'videos', element: <MyVideosPage /> },
          { path: 'videos/studio', element: <VideoStudioPage /> },
          { path: 'notifications', element: <NotificationsPage /> },
          { path: 'profile', element: <ProfileIdentityPage /> },
          { path: 'author-settings', element: <AuthorSettingsPage /> },
          { path: 'drafts', element: <DraftsPage /> },
          { path: 'submissions', element: <SubmissionQueuePage /> },
          { path: 'pitches', element: <PitchCenterPage /> },
        ],
      },
    ],
  },
  {
    element: <AuthLayout />,
    errorElement: <ErrorPage />,
    children: [{ path: '/login', element: <LoginPage /> }],
  },
])