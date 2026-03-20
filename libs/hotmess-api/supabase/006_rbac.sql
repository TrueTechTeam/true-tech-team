-- Hotmess Sports RBAC Migration
-- Run this AFTER 005_seed_data_v2.sql
-- Adds Commissioner role, user_roles table, and updated RLS policies

-- ============================================
-- ADD COMMISSIONER TO USER_ROLE ENUM
-- ============================================

ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'commissioner' AFTER 'admin';

-- ============================================
-- USER_ROLES TABLE (system-level + city-scoped roles)
-- ============================================
-- Admin rows: role='admin', city_id=NULL (global access)
-- Commissioner rows: role='commissioner', city_id=<city> (one row per city)
-- Other roles (manager, referee, captain, player) remain in their
-- respective tables (seasons.manager_id, games.referee_id, team_members)

CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role user_role NOT NULL,
    city_id UUID REFERENCES public.cities(id) ON DELETE CASCADE,
    source TEXT NOT NULL DEFAULT 'manual',
    se_permission_level TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unique constraint: one role per user per city (NULL city = global)
CREATE UNIQUE INDEX IF NOT EXISTS user_roles_unique_idx
    ON public.user_roles (user_id, role, COALESCE(city_id, '00000000-0000-0000-0000-000000000000'));

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS user_roles_user_id_idx ON public.user_roles (user_id);
CREATE INDEX IF NOT EXISTS user_roles_role_idx ON public.user_roles (role);
CREATE INDEX IF NOT EXISTS user_roles_city_id_idx ON public.user_roles (city_id);

-- ============================================
-- UPDATED HELPER FUNCTIONS
-- ============================================

-- Check if user is admin (now queries user_roles instead of team_members)
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_roles.user_id = $1
        AND user_roles.role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is commissioner of a specific city
CREATE OR REPLACE FUNCTION is_commissioner(user_id UUID, city_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_roles.user_id = $1
        AND user_roles.role = 'commissioner'
        AND user_roles.city_id = $2
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is commissioner of ANY city
CREATE OR REPLACE FUNCTION is_any_commissioner(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_roles.user_id = $1
        AND user_roles.role = 'commissioner'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get all city IDs a commissioner has access to
CREATE OR REPLACE FUNCTION get_commissioner_city_ids(user_id UUID)
RETURNS UUID[] AS $$
BEGIN
    RETURN ARRAY(
        SELECT user_roles.city_id FROM public.user_roles
        WHERE user_roles.user_id = $1
        AND user_roles.role = 'commissioner'
        AND user_roles.city_id IS NOT NULL
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user has commissioner access to a league (via league's city)
CREATE OR REPLACE FUNCTION is_league_commissioner(user_id UUID, league_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles ur
        JOIN public.leagues l ON l.city_id = ur.city_id
        WHERE ur.user_id = $1
        AND ur.role = 'commissioner'
        AND l.id = $2
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user has commissioner access to a season (via season→league→city)
CREATE OR REPLACE FUNCTION is_season_commissioner(user_id UUID, season_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles ur
        JOIN public.leagues l ON l.city_id = ur.city_id
        JOIN public.seasons s ON s.league_id = l.id
        WHERE ur.user_id = $1
        AND ur.role = 'commissioner'
        AND s.id = $2
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ENABLE RLS ON USER_ROLES
-- ============================================

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Everyone can read user_roles (needed for permission checks)
CREATE POLICY "User roles are viewable by everyone"
    ON public.user_roles FOR SELECT
    USING (true);

-- Only admins can insert user roles
CREATE POLICY "Admins can insert user roles"
    ON public.user_roles FOR INSERT
    WITH CHECK (is_admin(auth.uid()));

-- Only admins can update user roles
CREATE POLICY "Admins can update user roles"
    ON public.user_roles FOR UPDATE
    USING (is_admin(auth.uid()));

-- Only admins can delete user roles
CREATE POLICY "Admins can delete user roles"
    ON public.user_roles FOR DELETE
    USING (is_admin(auth.uid()));

-- ============================================
-- UPDATED WRITE POLICIES FOR COMMISSIONER
-- ============================================

-- Drop and recreate policies that need commissioner access
-- Note: Using DROP IF EXISTS + CREATE to be idempotent

-- Leagues: Commissioners can manage leagues in their cities
DROP POLICY IF EXISTS "Admins can insert leagues" ON public.leagues;
CREATE POLICY "Admins and commissioners can insert leagues"
    ON public.leagues FOR INSERT
    WITH CHECK (
        is_admin(auth.uid()) OR
        is_commissioner(auth.uid(), city_id)
    );

DROP POLICY IF EXISTS "Admins can update leagues" ON public.leagues;
CREATE POLICY "Admins and commissioners can update leagues"
    ON public.leagues FOR UPDATE
    USING (
        is_admin(auth.uid()) OR
        is_commissioner(auth.uid(), city_id)
    );

-- Seasons: Commissioners can manage seasons in their cities
DROP POLICY IF EXISTS "Managers can insert seasons" ON public.seasons;
CREATE POLICY "Admins and commissioners can insert seasons"
    ON public.seasons FOR INSERT
    WITH CHECK (
        is_admin(auth.uid()) OR
        is_season_commissioner(auth.uid(), id)
    );

DROP POLICY IF EXISTS "Managers can update their seasons" ON public.seasons;
CREATE POLICY "Admins commissioners and managers can update seasons"
    ON public.seasons FOR UPDATE
    USING (
        is_admin(auth.uid()) OR
        is_season_commissioner(auth.uid(), id) OR
        manager_id = auth.uid()
    );

-- Divisions: Commissioners can manage divisions in their cities
DROP POLICY IF EXISTS "Managers can insert divisions" ON public.divisions;
CREATE POLICY "Admins commissioners and managers can insert divisions"
    ON public.divisions FOR INSERT
    WITH CHECK (
        is_admin(auth.uid()) OR
        is_season_commissioner(auth.uid(), season_id) OR
        is_season_manager(auth.uid(), season_id)
    );

DROP POLICY IF EXISTS "Managers can update divisions" ON public.divisions;
CREATE POLICY "Admins commissioners and managers can update divisions"
    ON public.divisions FOR UPDATE
    USING (
        is_admin(auth.uid()) OR
        is_season_commissioner(auth.uid(), season_id) OR
        is_season_manager(auth.uid(), season_id)
    );

-- Teams: Commissioners can manage teams in their cities
DROP POLICY IF EXISTS "Captains and managers can update teams" ON public.teams;
CREATE POLICY "Admins commissioners managers and captains can update teams"
    ON public.teams FOR UPDATE
    USING (
        is_admin(auth.uid()) OR
        is_team_captain(auth.uid(), id) OR
        EXISTS (
            SELECT 1 FROM public.divisions d
            WHERE d.id = division_id
            AND (
                is_season_commissioner(auth.uid(), d.season_id) OR
                is_season_manager(auth.uid(), d.season_id)
            )
        )
    );

-- Games: Commissioners can manage games in their cities
DROP POLICY IF EXISTS "Managers can insert games" ON public.games;
CREATE POLICY "Admins commissioners and managers can insert games"
    ON public.games FOR INSERT
    WITH CHECK (
        is_admin(auth.uid()) OR
        EXISTS (
            SELECT 1 FROM public.divisions d
            WHERE d.id = division_id
            AND (
                is_season_commissioner(auth.uid(), d.season_id) OR
                is_season_manager(auth.uid(), d.season_id)
            )
        )
    );

DROP POLICY IF EXISTS "Referees can update assigned games" ON public.games;
CREATE POLICY "Admins commissioners managers and referees can update games"
    ON public.games FOR UPDATE
    USING (
        is_admin(auth.uid()) OR
        referee_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.divisions d
            WHERE d.id = division_id
            AND (
                is_season_commissioner(auth.uid(), d.season_id) OR
                is_season_manager(auth.uid(), d.season_id)
            )
        )
    );

-- Venues: Commissioners can manage venues in their cities
DROP POLICY IF EXISTS "Admins can insert venues" ON public.venues;
CREATE POLICY "Admins and commissioners can insert venues"
    ON public.venues FOR INSERT
    WITH CHECK (
        is_admin(auth.uid()) OR
        is_commissioner(auth.uid(), city_id)
    );

DROP POLICY IF EXISTS "Admins can update venues" ON public.venues;
CREATE POLICY "Admins and commissioners can update venues"
    ON public.venues FOR UPDATE
    USING (
        is_admin(auth.uid()) OR
        is_commissioner(auth.uid(), city_id)
    );
