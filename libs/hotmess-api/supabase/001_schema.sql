-- Hotmess Sports Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE user_role AS ENUM ('admin', 'manager', 'referee', 'team_captain', 'player');
CREATE TYPE game_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled', 'postponed');
CREATE TYPE season_status AS ENUM ('draft', 'registration', 'active', 'tournament', 'completed');
CREATE TYPE team_registration_status AS ENUM ('pending', 'confirmed', 'withdrawn');
CREATE TYPE membership_status AS ENUM ('invited', 'requested', 'active', 'inactive');
CREATE TYPE bracket_type AS ENUM ('single_elimination', 'double_elimination', 'round_robin');
CREATE TYPE thread_type AS ENUM ('direct', 'team', 'captains', 'refs', 'announcement', 'custom');
CREATE TYPE superlative_phase AS ENUM ('not_started', 'nominations', 'voting', 'completed');

-- ============================================
-- CORE TABLES
-- ============================================

-- Users (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    sports_engine_id TEXT UNIQUE,
    email TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    preferred_name TEXT,
    pronouns TEXT,
    avatar_url TEXT,
    bio TEXT,
    phone_number TEXT,
    is_onboarded BOOLEAN DEFAULT FALSE,
    last_tshirt_size TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organizations
CREATE TABLE public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    logo_url TEXT,
    website_url TEXT,
    contact_email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cities
CREATE TABLE public.cities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    state TEXT,
    timezone TEXT NOT NULL DEFAULT 'America/New_York',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sports
CREATE TABLE public.sports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    icon_url TEXT,
    rulebook_url TEXT,
    config JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Venues
CREATE TABLE public.venues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    city_id UUID NOT NULL REFERENCES public.cities(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT,
    play_areas TEXT[] DEFAULT '{}',
    map_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leagues (City + Sport combination)
CREATE TABLE public.leagues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    city_id UUID NOT NULL REFERENCES public.cities(id) ON DELETE CASCADE,
    sport_id UUID NOT NULL REFERENCES public.sports(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(city_id, sport_id)
);

-- Seasons
CREATE TABLE public.seasons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    league_id UUID NOT NULL REFERENCES public.leagues(id) ON DELETE CASCADE,
    manager_id UUID REFERENCES public.profiles(id),
    name TEXT NOT NULL,
    status season_status DEFAULT 'draft',
    registration_start_date DATE,
    registration_end_date DATE,
    season_start_date DATE NOT NULL,
    season_end_date DATE NOT NULL,
    schedule_config JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Divisions
CREATE TABLE public.divisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    season_id UUID NOT NULL REFERENCES public.seasons(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    skill_level INTEGER DEFAULT 1,
    max_teams INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teams
CREATE TABLE public.teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    division_id UUID NOT NULL REFERENCES public.divisions(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    shirt_color TEXT,
    logo_url TEXT,
    status team_registration_status DEFAULT 'pending',
    free_agents_requested INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    ties INTEGER DEFAULT 0,
    points_for INTEGER DEFAULT 0,
    points_against INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team Members (join table with role)
CREATE TABLE public.team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'player',
    status membership_status DEFAULT 'active',
    is_rookie BOOLEAN DEFAULT FALSE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(team_id, user_id)
);

-- Games
CREATE TABLE public.games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    division_id UUID NOT NULL REFERENCES public.divisions(id) ON DELETE CASCADE,
    home_team_id UUID NOT NULL REFERENCES public.teams(id),
    away_team_id UUID NOT NULL REFERENCES public.teams(id),
    referee_id UUID REFERENCES public.profiles(id),
    venue_id UUID REFERENCES public.venues(id),
    play_area TEXT,
    scheduled_at TIMESTAMPTZ NOT NULL,
    status game_status DEFAULT 'scheduled',
    home_score INTEGER,
    away_score INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Brackets
CREATE TABLE public.brackets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    division_id UUID NOT NULL REFERENCES public.divisions(id) ON DELETE CASCADE,
    type bracket_type NOT NULL,
    name TEXT NOT NULL,
    team_count INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bracket Matches
CREATE TABLE public.bracket_matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bracket_id UUID NOT NULL REFERENCES public.brackets(id) ON DELETE CASCADE,
    round INTEGER NOT NULL,
    position INTEGER NOT NULL,
    team1_id UUID REFERENCES public.teams(id),
    team2_id UUID REFERENCES public.teams(id),
    winner_next_match_id UUID REFERENCES public.bracket_matches(id),
    loser_next_match_id UUID REFERENCES public.bracket_matches(id),
    venue_id UUID REFERENCES public.venues(id),
    play_area TEXT,
    scheduled_at TIMESTAMPTZ,
    team1_score INTEGER,
    team2_score INTEGER,
    winner_id UUID REFERENCES public.teams(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MESSAGING TABLES
-- ============================================

-- Message Threads
CREATE TABLE public.message_threads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type thread_type NOT NULL,
    name TEXT,
    reference_id UUID,
    reference_type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Thread Participants
CREATE TABLE public.thread_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thread_id UUID NOT NULL REFERENCES public.message_threads(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    last_read_message_id UUID,
    is_muted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(thread_id, user_id)
);

-- Messages
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thread_id UUID NOT NULL REFERENCES public.message_threads(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id),
    content TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PHOTOS & SUPERLATIVES
-- ============================================

-- Photos
CREATE TABLE public.photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    uploader_id UUID NOT NULL REFERENCES public.profiles(id),
    season_id UUID NOT NULL REFERENCES public.seasons(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    caption TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Photo Tags
CREATE TABLE public.photo_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    photo_id UUID NOT NULL REFERENCES public.photos(id) ON DELETE CASCADE,
    tag_type TEXT NOT NULL CHECK (tag_type IN ('user', 'team')),
    tagged_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Superlative Categories
CREATE TABLE public.superlative_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    season_id UUID NOT NULL REFERENCES public.seasons(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    eligibility JSONB DEFAULT '{}',
    display_order INTEGER DEFAULT 0,
    phase superlative_phase DEFAULT 'not_started',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Superlative Nominations
CREATE TABLE public.superlative_nominations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES public.superlative_categories(id) ON DELETE CASCADE,
    nominee_id UUID NOT NULL REFERENCES public.profiles(id),
    nominated_by_id UUID NOT NULL REFERENCES public.profiles(id),
    team_id UUID NOT NULL REFERENCES public.teams(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(category_id, nominee_id, team_id)
);

-- Superlative Votes
CREATE TABLE public.superlative_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nomination_id UUID NOT NULL REFERENCES public.superlative_nominations(id) ON DELETE CASCADE,
    voter_id UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(nomination_id, voter_id)
);

-- ============================================
-- NOTIFICATION PREFERENCES
-- ============================================

CREATE TABLE public.notification_preferences (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    push_enabled BOOLEAN DEFAULT TRUE,
    push_game_reminders BOOLEAN DEFAULT TRUE,
    push_score_updates BOOLEAN DEFAULT TRUE,
    push_team_messages BOOLEAN DEFAULT TRUE,
    push_season_announcements BOOLEAN DEFAULT TRUE,
    push_superlative_voting BOOLEAN DEFAULT TRUE,
    email_enabled BOOLEAN DEFAULT TRUE,
    email_weekly_digest BOOLEAN DEFAULT TRUE,
    email_game_cancellations BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_cities_organization ON public.cities(organization_id);
CREATE INDEX idx_leagues_city ON public.leagues(city_id);
CREATE INDEX idx_leagues_sport ON public.leagues(sport_id);
CREATE INDEX idx_seasons_league ON public.seasons(league_id);
CREATE INDEX idx_divisions_season ON public.divisions(season_id);
CREATE INDEX idx_teams_division ON public.teams(division_id);
CREATE INDEX idx_team_members_team ON public.team_members(team_id);
CREATE INDEX idx_team_members_user ON public.team_members(user_id);
CREATE INDEX idx_games_division ON public.games(division_id);
CREATE INDEX idx_games_scheduled ON public.games(scheduled_at);
CREATE INDEX idx_messages_thread ON public.messages(thread_id);
CREATE INDEX idx_messages_created ON public.messages(created_at DESC);
CREATE INDEX idx_photos_season ON public.photos(season_id);

-- ============================================
-- TRIGGERS FOR updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_cities_updated_at BEFORE UPDATE ON public.cities FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_sports_updated_at BEFORE UPDATE ON public.sports FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_venues_updated_at BEFORE UPDATE ON public.venues FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_leagues_updated_at BEFORE UPDATE ON public.leagues FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_seasons_updated_at BEFORE UPDATE ON public.seasons FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_divisions_updated_at BEFORE UPDATE ON public.divisions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON public.teams FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON public.team_members FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON public.games FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_brackets_updated_at BEFORE UPDATE ON public.brackets FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_bracket_matches_updated_at BEFORE UPDATE ON public.bracket_matches FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_message_threads_updated_at BEFORE UPDATE ON public.message_threads FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_superlative_categories_updated_at BEFORE UPDATE ON public.superlative_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE ON public.notification_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- AUTO-CREATE PROFILE ON AUTH SIGNUP
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, first_name, last_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', 'New'),
        COALESCE(NEW.raw_user_meta_data->>'last_name', 'User')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
