-- Hotmess Sports Row Level Security Policies
-- Run this AFTER 001_schema.sql

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brackets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bracket_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thread_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.superlative_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.superlative_nominations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.superlative_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.team_members
        WHERE team_members.user_id = $1
        AND team_members.role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is manager of a season
CREATE OR REPLACE FUNCTION is_season_manager(user_id UUID, season_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.seasons
        WHERE seasons.id = $2
        AND seasons.manager_id = $1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is on a team
CREATE OR REPLACE FUNCTION is_team_member(user_id UUID, team_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.team_members
        WHERE team_members.user_id = $1
        AND team_members.team_id = $2
        AND team_members.status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is captain of a team
CREATE OR REPLACE FUNCTION is_team_captain(user_id UUID, team_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.team_members
        WHERE team_members.user_id = $1
        AND team_members.team_id = $2
        AND team_members.role = 'team_captain'
        AND team_members.status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PROFILES POLICIES
-- ============================================

-- Anyone can view profiles
CREATE POLICY "Profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- ============================================
-- PUBLIC READ POLICIES (Organizations, Cities, Sports, etc.)
-- ============================================

CREATE POLICY "Organizations are viewable by everyone"
    ON public.organizations FOR SELECT
    USING (true);

CREATE POLICY "Cities are viewable by everyone"
    ON public.cities FOR SELECT
    USING (true);

CREATE POLICY "Sports are viewable by everyone"
    ON public.sports FOR SELECT
    USING (true);

CREATE POLICY "Venues are viewable by everyone"
    ON public.venues FOR SELECT
    USING (true);

CREATE POLICY "Leagues are viewable by everyone"
    ON public.leagues FOR SELECT
    USING (true);

CREATE POLICY "Seasons are viewable by everyone"
    ON public.seasons FOR SELECT
    USING (true);

CREATE POLICY "Divisions are viewable by everyone"
    ON public.divisions FOR SELECT
    USING (true);

CREATE POLICY "Teams are viewable by everyone"
    ON public.teams FOR SELECT
    USING (true);

CREATE POLICY "Team members are viewable by everyone"
    ON public.team_members FOR SELECT
    USING (true);

CREATE POLICY "Games are viewable by everyone"
    ON public.games FOR SELECT
    USING (true);

CREATE POLICY "Brackets are viewable by everyone"
    ON public.brackets FOR SELECT
    USING (true);

CREATE POLICY "Bracket matches are viewable by everyone"
    ON public.bracket_matches FOR SELECT
    USING (true);

-- ============================================
-- ADMIN WRITE POLICIES
-- ============================================

CREATE POLICY "Admins can insert organizations"
    ON public.organizations FOR INSERT
    WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update organizations"
    ON public.organizations FOR UPDATE
    USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert cities"
    ON public.cities FOR INSERT
    WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update cities"
    ON public.cities FOR UPDATE
    USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert sports"
    ON public.sports FOR INSERT
    WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update sports"
    ON public.sports FOR UPDATE
    USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert venues"
    ON public.venues FOR INSERT
    WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update venues"
    ON public.venues FOR UPDATE
    USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert leagues"
    ON public.leagues FOR INSERT
    WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update leagues"
    ON public.leagues FOR UPDATE
    USING (is_admin(auth.uid()));

-- ============================================
-- MANAGER WRITE POLICIES
-- ============================================

CREATE POLICY "Managers can insert seasons"
    ON public.seasons FOR INSERT
    WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Managers can update their seasons"
    ON public.seasons FOR UPDATE
    USING (is_admin(auth.uid()) OR manager_id = auth.uid());

CREATE POLICY "Managers can insert divisions"
    ON public.divisions FOR INSERT
    WITH CHECK (
        is_admin(auth.uid()) OR
        is_season_manager(auth.uid(), season_id)
    );

CREATE POLICY "Managers can update divisions"
    ON public.divisions FOR UPDATE
    USING (
        is_admin(auth.uid()) OR
        is_season_manager(auth.uid(), season_id)
    );

-- ============================================
-- TEAM POLICIES
-- ============================================

-- Users can create teams (during registration)
CREATE POLICY "Authenticated users can create teams"
    ON public.teams FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Captains and managers can update their teams
CREATE POLICY "Captains and managers can update teams"
    ON public.teams FOR UPDATE
    USING (
        is_admin(auth.uid()) OR
        is_team_captain(auth.uid(), id)
    );

-- ============================================
-- TEAM MEMBER POLICIES
-- ============================================

CREATE POLICY "Users can join teams"
    ON public.team_members FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Captains can add team members"
    ON public.team_members FOR INSERT
    WITH CHECK (is_team_captain(auth.uid(), team_id));

CREATE POLICY "Captains can update team members"
    ON public.team_members FOR UPDATE
    USING (
        is_admin(auth.uid()) OR
        is_team_captain(auth.uid(), team_id)
    );

-- ============================================
-- GAME POLICIES
-- ============================================

CREATE POLICY "Managers can insert games"
    ON public.games FOR INSERT
    WITH CHECK (is_admin(auth.uid()));

-- Referees can update games they're assigned to
CREATE POLICY "Referees can update assigned games"
    ON public.games FOR UPDATE
    USING (
        is_admin(auth.uid()) OR
        referee_id = auth.uid()
    );

-- ============================================
-- MESSAGE POLICIES
-- ============================================

-- Users can view threads they're part of
CREATE POLICY "Users can view their threads"
    ON public.message_threads FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.thread_participants
            WHERE thread_participants.thread_id = message_threads.id
            AND thread_participants.user_id = auth.uid()
        )
    );

-- Users can view their thread participation
CREATE POLICY "Users can view their participation"
    ON public.thread_participants FOR SELECT
    USING (user_id = auth.uid());

-- Users can view messages in their threads
CREATE POLICY "Users can view messages in their threads"
    ON public.messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.thread_participants
            WHERE thread_participants.thread_id = messages.thread_id
            AND thread_participants.user_id = auth.uid()
        )
    );

-- Users can send messages to their threads
CREATE POLICY "Users can send messages to their threads"
    ON public.messages FOR INSERT
    WITH CHECK (
        sender_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.thread_participants
            WHERE thread_participants.thread_id = messages.thread_id
            AND thread_participants.user_id = auth.uid()
        )
    );

-- ============================================
-- PHOTO POLICIES
-- ============================================

CREATE POLICY "Photos are viewable by everyone"
    ON public.photos FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can upload photos"
    ON public.photos FOR INSERT
    WITH CHECK (auth.uid() = uploader_id);

CREATE POLICY "Users can delete their own photos"
    ON public.photos FOR DELETE
    USING (auth.uid() = uploader_id OR is_admin(auth.uid()));

CREATE POLICY "Photo tags are viewable by everyone"
    ON public.photo_tags FOR SELECT
    USING (true);

-- ============================================
-- SUPERLATIVE POLICIES
-- ============================================

CREATE POLICY "Superlative categories are viewable by everyone"
    ON public.superlative_categories FOR SELECT
    USING (true);

CREATE POLICY "Nominations are viewable by everyone"
    ON public.superlative_nominations FOR SELECT
    USING (true);

-- Captains can nominate
CREATE POLICY "Captains can nominate"
    ON public.superlative_nominations FOR INSERT
    WITH CHECK (
        nominated_by_id = auth.uid() AND
        is_team_captain(auth.uid(), team_id)
    );

-- Users can vote once per nomination
CREATE POLICY "Users can vote"
    ON public.superlative_votes FOR INSERT
    WITH CHECK (voter_id = auth.uid());

CREATE POLICY "Users can view votes"
    ON public.superlative_votes FOR SELECT
    USING (true);

-- ============================================
-- NOTIFICATION PREFERENCES POLICIES
-- ============================================

CREATE POLICY "Users can view their own notification preferences"
    ON public.notification_preferences FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notification preferences"
    ON public.notification_preferences FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own notification preferences"
    ON public.notification_preferences FOR INSERT
    WITH CHECK (user_id = auth.uid());
