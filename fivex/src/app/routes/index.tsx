import { createBrowserRouter } from 'react-router-dom'
import { MainLayout } from '../layouts/MainLayout'
import { AuthLayout } from '../layouts/AuthLayout'
import { AdminLayout } from '../layouts/AdminLayout'
import { DashboardLayout } from '../layouts/DashboardLayout'
import { NotFoundPage } from '../pages/NotFoundPage'
import { ErrorPage } from '../pages/ErrorPage'
import { ProtectedRoute } from './ProtectedRoute'
import { AdminRoute } from './AdminRoute'
import { AuthorRoute } from './AuthorRoute'
import { HomePage } from '@/features/home/pages/HomePage'
import { ForYouPage } from '@/features/for-you/pages/ForYouPage'
import { LocalPage } from '@/features/local/pages/LocalPage'
import { FactChecksPage } from '@/features/fact-checks/pages/FactChecksPage'
import { ArticlePage } from '@/features/articles/pages/ArticlePage'
import { CategoryPage } from '@/features/categories/pages/CategoryPage'
import { TagPage } from '@/features/tags/pages/TagPage'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { RegisterPage } from '@/features/auth/pages/RegisterPage'
import { OrganizationSignUpPage } from '@/features/auth/pages/OrganizationSignUpPage'
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
import { EditArticlePage } from '@/features/authors/pages/EditArticlePage'
import { FactCheckSubmissionPage } from '@/features/authors/pages/FactCheckSubmissionPage'
import { PendingApprovalsPage } from '@/features/editor/pages/PendingApprovalsPage'
import { CorrectionsManagementPage } from '@/features/corrections/pages/CorrectionsManagementPage'
import { ReviewQueuePage } from '@/features/editor/pages/ReviewQueuePage'
import { EditorialCalendarPage } from '@/features/editor/pages/EditorialCalendarPage'
import { FactCheckOversightPage } from '@/features/editor/pages/FactCheckOversightPage'
import { DashboardAnalyticsPage } from '@/features/dashboard/pages/DashboardAnalyticsPage'
import { BookmarksPage } from '@/features/bookmarks/pages/BookmarksPage'
import { AdsPage } from '@/features/company/pages/AdsPage'
import { AboutPage } from '@/features/company/pages/AboutPage'
import { BecomeAContributorPage } from '@/features/company/pages/BecomeAContributorPage'
import { BecomeAnAuthorPage } from '@/features/company/pages/BecomeAnAuthorPage'
import { BecomeAnEditorPage } from '@/features/company/pages/BecomeAnEditorPage'
import { OrganizationsPage } from '@/features/company/pages/OrganizationsPage'
import { CareersPage } from '@/features/company/pages/CareersPage'
import { ContactPage } from '@/features/company/pages/ContactPage'
import { EditorialGuidelinesPage } from '@/features/company/pages/EditorialGuidelinesPage'
import { FaqPage } from '@/features/faq/pages/FaqPage'
import { SubmitTicketPage } from '@/features/tickets/pages/SubmitTicketPage'
import { PrivacyPolicyPage } from '@/features/legal/pages/PrivacyPolicyPage'
import { TermsOfServicePage } from '@/features/legal/pages/TermsOfServicePage'
import { CorrectionsPolicyPage } from '@/features/legal/pages/CorrectionsPolicyPage'
import { MyCommentsPage } from '@/features/comments/pages/MyCommentsPage'
import { MyVideosPage } from '@/features/videos/pages/MyVideosPage'
import VideoStudioPage from '@/features/videos/pages/VideoStudioPage'
import { AuthorSettingsPage } from '@/features/authors/pages/AuthorSettingsPage'
import { ReaderSettingsPage } from '@/features/readers/pages/ReaderSettingsPage'
import { TopicSubmissionPage } from '@/features/readers/pages/TopicSubmissionPage'
import { NotificationsPage } from '@/features/notifications/pages/NotificationsPage'
import { NotificationsPage as AdminNotificationsPage } from '@/features/admin/notifications/pages/NotificationsPage'
import { ProfileIdentityPage } from '@/features/profile/pages/ProfileIdentityPage'
import { DraftsPage } from '@/features/authors/pages/DraftsPage'
import { SubmissionQueuePage } from '@/features/authors/pages/SubmissionQueuePage'
import { PitchCenterPage } from '@/features/authors/pages/PitchCenterPage'
import { VideoPage } from '@/features/videos/pages/VideoPage'
import { NewslettersPage } from '@/features/newsletter/pages/NewslettersPage'
import VideosPage from '@/features/videos/pages/VideosPage'
import { AuthorProfilePage } from '@/features/authors/pages/AuthorProfilePage'
import { CollaborationPage } from '@/features/authors/pages/CollaborationPage'
import { EvidenceVaultPage } from '@/features/evidence/pages/EvidenceVaultPage'
import { InvestigationsPage } from '@/features/authors/pages/InvestigationsPage'
import { NewInvestigationPage } from '@/features/authors/pages/NewInvestigationPage'
import { InvestigationPage } from '@/features/investigations/pages/InvestigationPage'
import { InvestigationReviewPage } from '@/features/admin/investigations/pages/InvestigationReviewPage'
import { InvestigationsPage as PublicInvestigationsPage } from '@/features/investigations/pages/InvestigationsPage'
import { InvestigationDetailPage } from '@/features/investigations/pages/InvestigationDetailPage'
import { SubscribePage } from '@/features/billing/pages/SubscribePage'
import { BecomeAuthorPage } from '@/features/onboarding/pages/BecomeAuthorPage'
import { AuthorOnboardingPage } from '@/features/onboarding/pages/AuthorOnboardingPage'
import { BecomeEditorPage } from '@/features/onboarding/pages/BecomeEditorPage'
import { EditorOnboardingPage } from '@/features/onboarding/pages/EditorOnboardingPage'
import { OrganizationSeatsPage } from '@/features/organizations/pages/OrganizationSeatsPage'
import { OrganizationBillingPage } from '@/features/organizations/pages/OrganizationBillingPage'
import { DevAccessPage } from '@/features/prelaunch/pages/DevAccessPage'
import { PRELAUNCH_ENABLED } from '@/config/prelaunch'

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
      { path: 'videos', element: <VideosPage /> },
      { path: 'videos/:id', element: <VideoPage /> },
      { path: 'investigations', element: <PublicInvestigationsPage /> },
      { path: 'investigations/:id', element: <InvestigationDetailPage /> },
      { path: 'authors/:id', element: <AuthorProfilePage /> },
      { path: 'newsletter', element: <NewslettersPage /> },
      { path: 'subscribe', element: <SubscribePage /> },
      { path: 'ads', element: <AdsPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'become-a-contributor', element: <BecomeAContributorPage /> },
      { path: 'become-author', element: <BecomeAnAuthorPage /> },
      { path: 'become-editor', element: <BecomeAnEditorPage /> },
      { path: 'organizations', element: <OrganizationsPage /> },
      { path: 'careers', element: <CareersPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'editorial-guidelines', element: <EditorialGuidelinesPage /> },
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
          { path: 'notifications', element: <AdminNotificationsPage /> },
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
          { path: 'articles/:id/edit', element: <EditArticlePage /> },
          { path: 'fact-checks', element: <FactCheckSubmissionPage /> },
          { path: 'review', element: <ReviewQueuePage /> },
          { path: 'calendar', element: <EditorialCalendarPage /> },
          { path: 'fact-check-oversight', element: <FactCheckOversightPage /> },
          { path: 'approvals', element: <PendingApprovalsPage /> },
          { path: 'corrections', element: <CorrectionsManagementPage /> },
          { path: 'analytics', element: <DashboardAnalyticsPage /> },
          { path: 'bookmarks', element: <BookmarksPage /> },
          { path: 'comments', element: <MyCommentsPage /> },
          { path: 'videos', element: <MyVideosPage /> },
          { path: 'videos/studio', element: <VideoStudioPage /> },
          { path: 'notifications', element: <NotificationsPage /> },
          { path: 'profile', element: <ProfileIdentityPage /> },
          { path: 'author-settings', element: <AuthorSettingsPage /> },
          { path: 'reader-settings', element: <ReaderSettingsPage /> },
          { path: 'topic-submission', element: <TopicSubmissionPage /> },
          { path: 'become-author', element: <BecomeAuthorPage /> },
          { path: 'become-author/onboarding', element: <AuthorOnboardingPage /> },
          { path: 'become-editor', element: <BecomeEditorPage /> },
          { path: 'become-editor/onboarding', element: <EditorOnboardingPage /> },
          { path: 'organization/seats', element: <OrganizationSeatsPage /> },
          { path: 'organization/billing', element: <OrganizationBillingPage /> },
          { path: 'drafts', element: <DraftsPage /> },
          { path: 'submissions', element: <SubmissionQueuePage /> },
          { path: 'pitches', element: <PitchCenterPage /> },
          { path: 'collaboration', element: <CollaborationPage /> },
        ],
      },
    ],
  },
  {
    path: 'author',
    element: <AuthorRoute />,
    errorElement: <ErrorPage />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { index: true, element: <InvestigationsPage /> },
          { path: 'investigations', element: <InvestigationsPage /> },
          { path: 'investigations/new', element: <NewInvestigationPage /> },
          { path: 'investigations/review-queue', element: <InvestigationReviewPage /> },
          { path: 'investigations/:id', element: <InvestigationPage /> },
          { path: 'evidence', element: <EvidenceVaultPage /> },
        ],
      },
    ],
  },
  // Lets unlocked team members see their status and lock the preview again.
  ...(PRELAUNCH_ENABLED
    ? [{ path: '/dev-access', element: <DevAccessPage />, errorElement: <ErrorPage /> }]
    : []),
  {
    element: <AuthLayout />,
    errorElement: <ErrorPage />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/organizations/signup', element: <OrganizationSignUpPage /> },
    ],
  },
])