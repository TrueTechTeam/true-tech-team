-- ============================================================
-- Landing App Schema
-- Run this in your dedicated landing app Supabase project.
-- This is completely separate from the hotmess-web project.
-- ============================================================

-- ============================================================
-- PROFILES
-- Auto-created on signup via trigger. Stores display info.
-- id maps 1:1 to auth.users(id).
-- ============================================================

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    first_name TEXT NOT NULL DEFAULT '',
    last_name TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create a profile row when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, first_name, last_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', '')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- USER ROLES
-- Only role is 'admin'. Admins can manage users and permissions.
-- All other signed-in users are standard members.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role = 'admin'),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS user_roles_user_id_idx ON public.user_roles (user_id);

-- ============================================================
-- APP PERMISSIONS
-- Tracks which users have been granted access to specific
-- restricted tools/apps. Open tools don't need a row here.
-- app_slug is a stable identifier for the tool (e.g. 'analytics').
-- ============================================================

CREATE TABLE IF NOT EXISTS public.app_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    app_slug TEXT NOT NULL,
    granted_by UUID REFERENCES public.profiles(id),
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, app_slug)
);

CREATE INDEX IF NOT EXISTS app_permissions_user_id_idx ON public.app_permissions (user_id);
CREATE INDEX IF NOT EXISTS app_permissions_app_slug_idx ON public.app_permissions (app_slug);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_permissions ENABLE ROW LEVEL SECURITY;

-- Helper: check if the current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
        AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: users read/update their own; admins read all
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
    ON public.profiles FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- User roles: authenticated users can read (needed for permission checks);
-- only admins can write
CREATE POLICY "Authenticated users can read roles"
    ON public.user_roles FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage roles"
    ON public.user_roles FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- App permissions: users see their own; admins can manage all
CREATE POLICY "Users can view own app permissions"
    ON public.app_permissions FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Admins can manage app permissions"
    ON public.app_permissions FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());
