import { useAuth } from '@/app/providers/AuthProvider'
import { EditorAnalyticsPage } from '@/features/editor/pages/EditorAnalyticsPage'
import { AuthorAnalyticsPage } from '@/features/authors/pages/AuthorAnalyticsPage'

/**
 * The /dashboard/analytics route is shared by editors and authors, each with
 * their own take on "analytics" — pick the right one based on role.
 */
export function DashboardAnalyticsPage() {
  const { user } = useAuth()

  if (user?.role === 'author') return <AuthorAnalyticsPage />
  return <EditorAnalyticsPage />
}
