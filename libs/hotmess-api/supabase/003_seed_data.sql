-- Hotmess Sports Seed Data
-- Run this AFTER 001_schema.sql and 002_rls_policies.sql

-- ============================================
-- ORGANIZATION
-- ============================================

INSERT INTO public.organizations (id, name, description, website_url, contact_email)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Hotmess Sports',
    'Recreational sports leagues in multiple cities offering a wide array of organized sports.',
    'https://www.hotmesssports.com',
    'info@hotmesssports.com'
);

-- ============================================
-- SPORTS
-- ============================================

INSERT INTO public.sports (name, description, config) VALUES
('Kickball', 'The classic playground game, now for adults! Easy to learn, fun to play.', '{
    "teamSize": 11,
    "minPlayers": 8,
    "gameDurationMinutes": 60,
    "playAreaName": "Field",
    "scoringType": "points",
    "rankingRules": [
        {"field": "wins", "order": "desc", "priority": 1},
        {"field": "pointDifferential", "order": "desc", "priority": 2},
        {"field": "headToHead", "order": "desc", "priority": 3}
    ]
}'::jsonb),
('Volleyball', 'Beach or indoor volleyball leagues for all skill levels.', '{
    "teamSize": 6,
    "minPlayers": 4,
    "gameDurationMinutes": 45,
    "playAreaName": "Court",
    "scoringType": "sets",
    "rankingRules": [
        {"field": "wins", "order": "desc", "priority": 1},
        {"field": "pointDifferential", "order": "desc", "priority": 2}
    ]
}'::jsonb),
('Pickleball', 'The fastest-growing sport in America! A mix of tennis, badminton, and ping-pong.', '{
    "teamSize": 2,
    "minPlayers": 2,
    "gameDurationMinutes": 30,
    "playAreaName": "Court",
    "scoringType": "points",
    "rankingRules": [
        {"field": "wins", "order": "desc", "priority": 1}
    ]
}'::jsonb),
('Basketball', '3-on-3 or 5-on-5 basketball leagues.', '{
    "teamSize": 5,
    "minPlayers": 4,
    "gameDurationMinutes": 40,
    "playAreaName": "Court",
    "scoringType": "points",
    "rankingRules": [
        {"field": "wins", "order": "desc", "priority": 1},
        {"field": "pointDifferential", "order": "desc", "priority": 2}
    ]
}'::jsonb),
('Cornhole', 'The ultimate tailgate game turned competitive league.', '{
    "teamSize": 2,
    "minPlayers": 2,
    "gameDurationMinutes": 20,
    "playAreaName": "Lane",
    "scoringType": "points",
    "rankingRules": [
        {"field": "wins", "order": "desc", "priority": 1}
    ]
}'::jsonb),
('Bowling', 'Strike up some fun with our bowling leagues.', '{
    "teamSize": 4,
    "minPlayers": 3,
    "gameDurationMinutes": 60,
    "playAreaName": "Lane",
    "scoringType": "frames",
    "rankingRules": [
        {"field": "wins", "order": "desc", "priority": 1},
        {"field": "pointsFor", "order": "desc", "priority": 2}
    ]
}'::jsonb);

-- ============================================
-- CITIES
-- ============================================

INSERT INTO public.cities (organization_id, name, state, timezone) VALUES
('00000000-0000-0000-0000-000000000001', 'Miami', 'FL', 'America/New_York'),
('00000000-0000-0000-0000-000000000001', 'Fort Lauderdale', 'FL', 'America/New_York'),
('00000000-0000-0000-0000-000000000001', 'West Palm Beach', 'FL', 'America/New_York');

-- ============================================
-- LEAGUES (Created from city + sport combinations)
-- ============================================

-- Miami leagues
INSERT INTO public.leagues (city_id, sport_id, name)
SELECT c.id, s.id, c.name || ' ' || s.name
FROM public.cities c
CROSS JOIN public.sports s
WHERE c.name = 'Miami'
AND s.name IN ('Kickball', 'Volleyball', 'Cornhole', 'Pickleball');

-- Fort Lauderdale leagues
INSERT INTO public.leagues (city_id, sport_id, name)
SELECT c.id, s.id, c.name || ' ' || s.name
FROM public.cities c
CROSS JOIN public.sports s
WHERE c.name = 'Fort Lauderdale'
AND s.name IN ('Kickball', 'Pickleball');

-- West Palm Beach leagues
INSERT INTO public.leagues (city_id, sport_id, name)
SELECT c.id, s.id, c.name || ' ' || s.name
FROM public.cities c
CROSS JOIN public.sports s
WHERE c.name = 'West Palm Beach'
AND s.name IN ('Volleyball', 'Basketball');

-- ============================================
-- VENUES
-- ============================================

INSERT INTO public.venues (city_id, name, address, play_areas)
SELECT id, 'Miami Sports Complex', '123 Sports Ave, Miami, FL', ARRAY['Field A', 'Field B', 'Field C', 'Field D']
FROM public.cities WHERE name = 'Miami';

INSERT INTO public.venues (city_id, name, address, play_areas)
SELECT id, 'Tropical Park', '7900 SW 40th St, Miami, FL', ARRAY['Court 1', 'Court 2', 'Court 3']
FROM public.cities WHERE name = 'Miami';

INSERT INTO public.venues (city_id, name, address, play_areas)
SELECT id, 'Fort Lauderdale Recreation Center', '456 Beach Blvd, Fort Lauderdale, FL', ARRAY['Field 1', 'Field 2']
FROM public.cities WHERE name = 'Fort Lauderdale';

INSERT INTO public.venues (city_id, name, address, play_areas)
SELECT id, 'Palm Beach Athletic Club', '789 Palm Way, West Palm Beach, FL', ARRAY['Court A', 'Court B']
FROM public.cities WHERE name = 'West Palm Beach';

-- ============================================
-- SAMPLE SEASON
-- ============================================

-- Create a sample season for Miami Kickball
INSERT INTO public.seasons (league_id, name, status, registration_start_date, registration_end_date, season_start_date, season_end_date, schedule_config)
SELECT
    l.id,
    'Fall 2024',
    'active',
    '2024-08-01',
    '2024-08-31',
    '2024-09-07',
    '2024-11-16',
    '{
        "gameDays": [6],
        "timeSlots": ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00"],
        "totalWeeks": 10,
        "blackoutDates": [],
        "tournamentDate": "2024-11-23",
        "makeupDates": ["2024-11-30"],
        "minTimeBetweenGames": 2,
        "maxGamesPerDay": 2
    }'::jsonb
FROM public.leagues l
JOIN public.cities c ON l.city_id = c.id
JOIN public.sports s ON l.sport_id = s.id
WHERE c.name = 'Miami' AND s.name = 'Kickball';

-- Create divisions for the season
INSERT INTO public.divisions (season_id, name, skill_level, max_teams)
SELECT s.id, 'Division A', 3, 8 FROM public.seasons s WHERE s.name = 'Fall 2024'
UNION ALL
SELECT s.id, 'Division B', 2, 8 FROM public.seasons s WHERE s.name = 'Fall 2024'
UNION ALL
SELECT s.id, 'Division C', 1, 8 FROM public.seasons s WHERE s.name = 'Fall 2024';

-- Create sample teams
INSERT INTO public.teams (division_id, name, shirt_color, status)
SELECT d.id, 'The Hotshots', 'Red', 'confirmed'
FROM public.divisions d WHERE d.name = 'Division A'
UNION ALL
SELECT d.id, 'Ball Busters', 'Blue', 'confirmed'
FROM public.divisions d WHERE d.name = 'Division A'
UNION ALL
SELECT d.id, 'Kick Flips', 'Green', 'confirmed'
FROM public.divisions d WHERE d.name = 'Division A'
UNION ALL
SELECT d.id, 'The Kickers', 'Yellow', 'confirmed'
FROM public.divisions d WHERE d.name = 'Division A';

RAISE NOTICE 'Seed data inserted successfully!';
