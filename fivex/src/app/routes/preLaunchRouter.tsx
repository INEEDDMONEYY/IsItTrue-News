import { createBrowserRouter } from 'react-router-dom'
import { ErrorPage } from '../pages/ErrorPage'
import { LandingPage } from '@/features/prelaunch/pages/LandingPage'
import { DevAccessPage } from '@/features/prelaunch/pages/DevAccessPage'

// What a visitor without access can reach: the landing page for every URL except the team entrance.
export const preLaunchRouter = createBrowserRouter([
  { path: '/dev-access', element: <DevAccessPage />, errorElement: <ErrorPage /> },
  { path: '*', element: <LandingPage />, errorElement: <ErrorPage /> },
])
