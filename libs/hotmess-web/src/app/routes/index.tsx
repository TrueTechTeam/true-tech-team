import { createBrowserRouter, Navigate } from 'react-router-dom';
import { UserRole } from '@true-tech-team/hotmess-types';

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
import { RegisterPage } from '../pages/public/RegisterPage';
import { StartLeaguePage } from '../pages/public/StartLeaguePage';
import { TournamentsPage } from '../pages/public/TournamentsPage';
import { CharityEventsPage } from '../pages/public/CharityEventsPage';
import { HMClassicPage } from '../pages/public/HMClassicPage';
import { CityLeagueRegistrationPage } from '../pages/public/CityLeagueRegistrationPage';

// Admin pages
import { DashboardPage } from '../pages/admin/DashboardPage';
import { CitiesManagerPage } from '../pages/admin/CitiesManagerPage';
import { SportsManagerPage } from '../pages/admin/SportsManagerPage';
import { LeaguesManagerPage } from '../pages/admin/LeaguesManagerPage';
import { SeasonsManagerPage } from '../pages/admin/SeasonsManagerPage';
import { TeamsManagerPage } from '../pages/admin/TeamsManagerPage';
import { SchedulesManagerPage } from '../pages/admin/SchedulesManagerPage';
import { BracketsManagerPage } from '../pages/admin/BracketsManagerPage';
import { NotificationsManagerPage } from '../pages/admin/NotificationsManagerPage';
import { PermissionsManagerPage } from '../pages/admin/PermissionsManagerPage';
import { SeasonDetailPage } from '../pages/admin/SeasonDetailPage';
import { CityDetailPage } from '../pages/admin/CityDetailPage';
import { LeagueDetailPage } from '../pages/admin/LeagueDetailPage';
import { TeamDetailPage } from '../pages/admin/TeamDetailPage';
import { BracketDetailPage } from '../pages/admin/BracketDetailPage';

// Auth pages
import { LoginPage } from '../pages/auth/LoginPage';
import { OAuthCallbackPage } from '../pages/auth/OAuthCallbackPage';

// Role groups for route protection
const ADMIN_ONLY = [UserRole.Admin];
const ADMIN_COMMISSIONER = [UserRole.Admin, UserRole.Commissioner];
const ADMIN_COMMISSIONER_MANAGER = [UserRole.Admin, UserRole.Commissioner, UserRole.Manager];
const SCHEDULE_ROLES = [UserRole.Admin, UserRole.Commissioner, UserRole.Manager, UserRole.Referee];
const ALL_ADMIN_ROLES = [UserRole.Admin, UserRole.Commissioner, UserRole.Manager, UserRole.Referee, UserRole.TeamCaptain, UserRole.Player];

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
          { path: 'cities/:citySlug/:sportSlug', element: <CityLeagueRegistrationPage /> },
          { path: 'sports', element: <SportsPage /> },
          { path: 'sports/:sportSlug', element: <SportsPage /> },
          { path: 'rules', element: <RulesPage /> },
          { path: 'rules/:sportSlug', element: <RulesPage /> },
          { path: 'register', element: <RegisterPage /> },
          { path: 'start-a-league', element: <StartLeaguePage /> },
          { path: 'tournaments', element: <TournamentsPage /> },
          { path: 'charity-events', element: <CharityEventsPage /> },
          { path: 'hm-classic', element: <HMClassicPage /> },
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

      // Admin routes (protected — parent checks authentication, children check roles)
      {
        path: '/admin',
        element: (
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: 'dashboard', element: <ProtectedRoute allowedRoles={ALL_ADMIN_ROLES}><DashboardPage /></ProtectedRoute> },
          { path: 'cities', element: <ProtectedRoute allowedRoles={ADMIN_COMMISSIONER}><CitiesManagerPage /></ProtectedRoute> },
          { path: 'cities/:cityId', element: <ProtectedRoute allowedRoles={ADMIN_COMMISSIONER}><CityDetailPage /></ProtectedRoute> },
          { path: 'sports', element: <ProtectedRoute allowedRoles={ADMIN_ONLY}><SportsManagerPage /></ProtectedRoute> },
          { path: 'leagues', element: <ProtectedRoute allowedRoles={ADMIN_COMMISSIONER}><LeaguesManagerPage /></ProtectedRoute> },
          { path: 'leagues/:leagueId', element: <ProtectedRoute allowedRoles={ADMIN_COMMISSIONER}><LeagueDetailPage /></ProtectedRoute> },
          { path: 'cities/:cityId/leagues', element: <ProtectedRoute allowedRoles={ADMIN_COMMISSIONER}><LeaguesManagerPage /></ProtectedRoute> },
          { path: 'seasons', element: <ProtectedRoute allowedRoles={ADMIN_COMMISSIONER_MANAGER}><SeasonsManagerPage /></ProtectedRoute> },
          { path: 'leagues/:leagueId/seasons', element: <ProtectedRoute allowedRoles={ADMIN_COMMISSIONER_MANAGER}><SeasonsManagerPage /></ProtectedRoute> },
          { path: 'seasons/:seasonId', element: <ProtectedRoute allowedRoles={ADMIN_COMMISSIONER_MANAGER}><SeasonDetailPage /></ProtectedRoute> },
          { path: 'teams', element: <ProtectedRoute allowedRoles={[...ADMIN_COMMISSIONER_MANAGER, UserRole.TeamCaptain]}><TeamsManagerPage /></ProtectedRoute> },
          { path: 'teams/:teamId', element: <ProtectedRoute allowedRoles={[...ADMIN_COMMISSIONER_MANAGER, UserRole.TeamCaptain]}><TeamDetailPage /></ProtectedRoute> },
          { path: 'seasons/:seasonId/teams', element: <ProtectedRoute allowedRoles={[...ADMIN_COMMISSIONER_MANAGER, UserRole.TeamCaptain]}><TeamsManagerPage /></ProtectedRoute> },
          { path: 'schedules', element: <ProtectedRoute allowedRoles={SCHEDULE_ROLES}><SchedulesManagerPage /></ProtectedRoute> },
          { path: 'brackets', element: <ProtectedRoute allowedRoles={SCHEDULE_ROLES}><BracketsManagerPage /></ProtectedRoute> },
          { path: 'brackets/:seasonId', element: <ProtectedRoute allowedRoles={SCHEDULE_ROLES}><BracketDetailPage /></ProtectedRoute> },
          { path: 'notifications', element: <ProtectedRoute allowedRoles={ADMIN_COMMISSIONER_MANAGER}><NotificationsManagerPage /></ProtectedRoute> },
          { path: 'permissions', element: <ProtectedRoute allowedRoles={ADMIN_ONLY}><PermissionsManagerPage /></ProtectedRoute> },
        ],
      },
    ],
  },
]);
