import { RouterProvider } from 'react-router-dom'
import { router } from './routes'
import { preLaunchRouter } from './routes/preLaunchRouter'
import { QueryProvider } from './providers/QueryProvider'
import { AuthProvider } from './providers/AuthProvider'
import { ThemeProvider } from './providers/ThemeProvider'
import { isSiteLocked } from '@/features/prelaunch/utils/access'

function App() {
  // Before launch, visitors without team access only get the landing page. The auth provider is
  // left out on purpose so they don't trigger a session check against the API.
  if (isSiteLocked()) {
    return (
      <QueryProvider>
        <ThemeProvider>
          <RouterProvider router={preLaunchRouter} />
        </ThemeProvider>
      </QueryProvider>
    )
  }

  return (
    <QueryProvider>
      <AuthProvider>
        <ThemeProvider>
          <RouterProvider router={router} />
        </ThemeProvider>
      </AuthProvider>
    </QueryProvider>
  )
}

export default App