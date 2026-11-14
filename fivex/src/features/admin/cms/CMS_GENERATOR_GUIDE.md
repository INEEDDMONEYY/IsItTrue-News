# IITNews CMS Generator Output

Generated CMS frontend scaffolding.

## Important

- Existing files were preserved.
- Existing backend integrations were not modified.
- Generated pages are presentation scaffolds, not working CRUD modules.
- No API endpoints or backend contracts were invented.
- Connect each module to its actual backend before enabling management actions.

## Generated modules

- Page Management
- Homepage Management
- Navigation Management
- Global Website Content
- Media & Assets
- Article Presentation
- Platform Configuration
- Tag Management

## Route registration

Add the following imports to your existing admin route configuration:

```tsx
import { PageManagementPage } from '@/features/admin/cms/pages/PageManagementPage'
import { HomepageManagementPage } from '@/features/admin/cms/pages/HomepageManagementPage'
import { NavigationManagementPage } from '@/features/admin/cms/pages/NavigationManagementPage'
import { GlobalContentPage } from '@/features/admin/cms/pages/GlobalContentPage'
import { MediaAssetsPage } from '@/features/admin/cms/pages/MediaAssetsPage'
import { ArticlePresentationPage } from '@/features/admin/cms/pages/ArticlePresentationPage'
import { PlatformConfigurationPage } from '@/features/admin/cms/pages/PlatformConfigurationPage'
import { TagManagementPage } from '@/features/admin/cms/pages/TagManagementPage'
```

Add the following child routes under your existing admin layout:

```tsx
  { path: 'cms/page-management', element: <PageManagementPage /> },
  { path: 'cms/homepage', element: <HomepageManagementPage /> },
  { path: 'cms/navigation', element: <NavigationManagementPage /> },
  { path: 'cms/global-content', element: <GlobalContentPage /> },
  { path: 'cms/media', element: <MediaAssetsPage /> },
  { path: 'cms/article-presentation', element: <ArticlePresentationPage /> },
  { path: 'cms/configuration', element: <PlatformConfigurationPage /> },
  { path: 'cms/tags', element: <TagManagementPage /> },
```

Choose route paths that match your existing routing conventions. These are suggested paths, not automatic route changes.

## Existing modules

The generator intentionally does not replace:

- CmsPage.tsx
- CategoriesSection.tsx
- ArticleEngagementSection.tsx
- Existing API files
- Existing hooks
- Existing services
- Existing state management
- Existing types

## Suggested next steps

1. Inspect the generated page and component scaffolds.
2. Connect each feature to existing backend contracts.
3. Add the appropriate authorization checks.
4. Add form validation and loading/error states.
5. Register the routes.
6. Test each feature against the backend.
