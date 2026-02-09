import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layouts
import { RootLayout } from '../layouts/RootLayout';
import { PublicLayout } from '../layouts/PublicLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { ProtectedRoute } from '../layouts/ProtectedRoute';

// Public pages
import { WelcomePage } from '../pages/public/WelcomePage';
import { AboutPage } from '../pages/public/AboutPage';
import { CitiesPage } from '../pages/public/CitiesPage';
import { SportsPage } from '../pages/public/SportsPage';
import { RulesPage } from '../pages/public/RulesPage';

// Admin pages
import { DashboardPage } from '../pages/admin/DashboardPage';
import { CitiesManagerPage } from '../pages/admin/CitiesManagerPage';
import { SportsManagerPage } from '../pages/admin/SportsManagerPage';
import { LeaguesManagerPage } from '../pages/admin/LeaguesManagerPage';
import { SeasonsManagerPage } from '../pages/admin/SeasonsManagerPage';

// Auth pages
import { LoginPage } from '../pages/auth/LoginPage';
import { OAuthCallbackPage } from '../pages/auth/OAuthCallbackPage';

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      // Public routes
      {
        path: '/',
        element: <PublicLayout />,
        children: [
          { index: true, element: <WelcomePage /> },
          { path: 'about', element: <AboutPage /> },
          { path: 'cities', element: <CitiesPage /> },
          { path: 'cities/:citySlug', element: <CitiesPage /> },
          { path: 'sports', element: <SportsPage /> },
          { path: 'sports/:sportSlug', element: <SportsPage /> },
          { path: 'rules', element: <RulesPage /> },
          { path: 'rules/:sportSlug', element: <RulesPage /> },
        ],
      },

      // Auth routes
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/auth/callback',
        element: <OAuthCallbackPage />,
      },

      // Admin routes (protected)
      {
        path: '/admin',
        element: (
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'cities', element: <CitiesManagerPage /> },
          { path: 'sports', element: <SportsManagerPage /> },
          { path: 'leagues', element: <LeaguesManagerPage /> },
          { path: 'seasons', element: <SeasonsManagerPage /> },
        ],
      },
    ],
  },
]);
