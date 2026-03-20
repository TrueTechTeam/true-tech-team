-- ============================================
-- Hotmess Sports Seed Data v2
-- ============================================
-- This file replaces 003_seed_data.sql with an expanded and updated
-- set of seed data covering 7 cities, 11 sports, auto-generated leagues,
-- venues, seasons (Spring/Summer/Fall 2026), divisions, and teams.
--
-- Run this AFTER 001_schema.sql, 002_rls_policies.sql, and
-- 004_add_sports_engine_id.sql.
-- ============================================

-- ============================================
-- CLEAN SLATE: Delete existing data in reverse dependency order
-- ============================================

DELETE FROM public.teams;
DELETE FROM public.divisions;
DELETE FROM public.seasons;
DELETE FROM public.leagues;
DELETE FROM public.venues;
DELETE FROM public.cities;
DELETE FROM public.sports;

-- Keep the organization row; insert only if it doesn't exist yet.
INSERT INTO public.organizations (id, name, description, website_url, contact_email)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Hotmess Sports',
    'Recreational sports leagues in multiple cities offering a wide array of organized sports.',
    'https://www.hotmesssports.com',
    'info@hotmesssports.com'
) ON CONFLICT (id) DO NOTHING;

-- ============================================
-- CITIES
-- ============================================

INSERT INTO public.cities (organization_id, name, state, timezone) VALUES
('00000000-0000-0000-0000-000000000001', 'Nashville',   'TN', 'America/Chicago'),
('00000000-0000-0000-0000-000000000001', 'St. Pete',    'FL', 'America/New_York'),
('00000000-0000-0000-0000-000000000001', 'St. Louis',   'MO', 'America/Chicago'),
('00000000-0000-0000-0000-000000000001', 'OKC',         'OK', 'America/Chicago'),
('00000000-0000-0000-0000-000000000001', 'Birmingham',  'AL', 'America/Chicago'),
('00000000-0000-0000-0000-000000000001', 'Sarasota',    'FL', 'America/New_York'),
('00000000-0000-0000-0000-000000000001', 'Cincinnati',  'OH', 'America/New_York');

-- ============================================
-- SPORTS
-- ============================================

INSERT INTO public.sports (name, description, config) VALUES

('Kickball', 'The classic playground game grown up. Lace up your sneakers and relive recess — with beer.', '{
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

('Dodgeball', 'If you can dodge a wrench you can dodge a ball. Fast-paced indoor dodgeball action.', '{
    "teamSize": 8,
    "minPlayers": 6,
    "gameDurationMinutes": 45,
    "playAreaName": "Court",
    "scoringType": "points",
    "rankingRules": [
        {"field": "wins", "order": "desc", "priority": 1},
        {"field": "pointDifferential", "order": "desc", "priority": 2},
        {"field": "headToHead", "order": "desc", "priority": 3}
    ]
}'::jsonb),

('Bowling', 'Strike up some fun with our social bowling leagues. Gutter balls welcome.', '{
    "teamSize": 4,
    "minPlayers": 3,
    "gameDurationMinutes": 60,
    "playAreaName": "Lane",
    "scoringType": "frames",
    "rankingRules": [
        {"field": "wins", "order": "desc", "priority": 1},
        {"field": "pointsFor", "order": "desc", "priority": 2}
    ]
}'::jsonb),

('Indoor Volleyball', 'Set, spike, celebrate! Six-a-side indoor volleyball for all skill levels.', '{
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

('Sand Volleyball', 'Sun, sand, and spikes. Four-a-side beach volleyball with a social twist.', '{
    "teamSize": 4,
    "minPlayers": 3,
    "gameDurationMinutes": 45,
    "playAreaName": "Court",
    "scoringType": "sets",
    "rankingRules": [
        {"field": "wins", "order": "desc", "priority": 1},
        {"field": "pointDifferential", "order": "desc", "priority": 2}
    ]
}'::jsonb),

('Grass Volleyball', 'Take your game to the park. Six-a-side grass volleyball under the open sky.', '{
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

('Cornhole', 'The ultimate tailgate game turned competitive league. Bags fly every week.', '{
    "teamSize": 2,
    "minPlayers": 2,
    "gameDurationMinutes": 20,
    "playAreaName": "Lane",
    "scoringType": "points",
    "rankingRules": [
        {"field": "wins", "order": "desc", "priority": 1},
        {"field": "pointDifferential", "order": "desc", "priority": 2}
    ]
}'::jsonb),

('Pickleball', 'The fastest-growing sport in America. A perfect mashup of tennis, badminton, and ping-pong.', '{
    "teamSize": 2,
    "minPlayers": 2,
    "gameDurationMinutes": 30,
    "playAreaName": "Court",
    "scoringType": "points",
    "rankingRules": [
        {"field": "wins", "order": "desc", "priority": 1},
        {"field": "pointDifferential", "order": "desc", "priority": 2}
    ]
}'::jsonb),

('Basketball', 'Five-on-five basketball leagues with weekly matchups and post-game hangouts.', '{
    "teamSize": 5,
    "minPlayers": 4,
    "gameDurationMinutes": 40,
    "playAreaName": "Court",
    "scoringType": "points",
    "rankingRules": [
        {"field": "wins", "order": "desc", "priority": 1},
        {"field": "pointDifferential", "order": "desc", "priority": 2},
        {"field": "headToHead", "order": "desc", "priority": 3}
    ]
}'::jsonb),

('Flag Football', 'All the strategy of football without the tackles. Seven-a-side flag football.', '{
    "teamSize": 7,
    "minPlayers": 5,
    "gameDurationMinutes": 50,
    "playAreaName": "Field",
    "scoringType": "points",
    "rankingRules": [
        {"field": "wins", "order": "desc", "priority": 1},
        {"field": "pointDifferential", "order": "desc", "priority": 2},
        {"field": "headToHead", "order": "desc", "priority": 3}
    ]
}'::jsonb),

('Tennis', 'Doubles tennis leagues for players who love a good rally and a cold drink after.', '{
    "teamSize": 2,
    "minPlayers": 2,
    "gameDurationMinutes": 60,
    "playAreaName": "Court",
    "scoringType": "sets",
    "rankingRules": [
        {"field": "wins", "order": "desc", "priority": 1},
        {"field": "setDifferential", "order": "desc", "priority": 2}
    ]
}'::jsonb);

-- ============================================
-- LEAGUES (every city x every sport)
-- ============================================

INSERT INTO public.leagues (city_id, sport_id, name)
SELECT c.id, s.id, c.name || ' ' || s.name
FROM public.cities c
CROSS JOIN public.sports s;

-- ============================================
-- VENUES (2 per city)
-- ============================================

-- Nashville
INSERT INTO public.venues (city_id, name, address, play_areas)
SELECT id, 'East Park Community Fields', '700 Woodland St, Nashville, TN 37206',
       ARRAY['Field A', 'Field B', 'Field C', 'Field D']
FROM public.cities WHERE name = 'Nashville';

INSERT INTO public.venues (city_id, name, address, play_areas)
SELECT id, 'Centennial Sportsplex', '222 25th Ave N, Nashville, TN 37203',
       ARRAY['Court 1', 'Court 2', 'Court 3', 'Court 4']
FROM public.cities WHERE name = 'Nashville';

-- St. Pete
INSERT INTO public.venues (city_id, name, address, play_areas)
SELECT id, 'North Shore Park', '901 North Shore Dr NE, St. Petersburg, FL 33701',
       ARRAY['Field 1', 'Field 2', 'Sand Court 1', 'Sand Court 2']
FROM public.cities WHERE name = 'St. Pete';

INSERT INTO public.venues (city_id, name, address, play_areas)
SELECT id, 'Walter Fuller Recreation Center', '7891 26th Ave N, St. Petersburg, FL 33710',
       ARRAY['Court A', 'Court B', 'Lane 1', 'Lane 2']
FROM public.cities WHERE name = 'St. Pete';

-- St. Louis
INSERT INTO public.venues (city_id, name, address, play_areas)
SELECT id, 'Forest Park Fields', '5595 Grand Dr, St. Louis, MO 63112',
       ARRAY['Field 1', 'Field 2', 'Field 3']
FROM public.cities WHERE name = 'St. Louis';

INSERT INTO public.venues (city_id, name, address, play_areas)
SELECT id, 'Soulard Recreation Center', '1500 S 10th St, St. Louis, MO 63104',
       ARRAY['Court 1', 'Court 2', 'Lane 1', 'Lane 2']
FROM public.cities WHERE name = 'St. Louis';

-- OKC
INSERT INTO public.venues (city_id, name, address, play_areas)
SELECT id, 'Stars & Stripes Park', '3500 N Martin Luther King Ave, Oklahoma City, OK 73111',
       ARRAY['Field A', 'Field B', 'Field C']
FROM public.cities WHERE name = 'OKC';

INSERT INTO public.venues (city_id, name, address, play_areas)
SELECT id, 'Riversport Adventures Complex', '800 Riversport Dr, Oklahoma City, OK 73129',
       ARRAY['Court 1', 'Court 2', 'Sand Court 1']
FROM public.cities WHERE name = 'OKC';

-- Birmingham
INSERT INTO public.venues (city_id, name, address, play_areas)
SELECT id, 'Railroad Park', '1600 1st Ave S, Birmingham, AL 35233',
       ARRAY['Field 1', 'Field 2', 'Lawn 1', 'Lawn 2']
FROM public.cities WHERE name = 'Birmingham';

INSERT INTO public.venues (city_id, name, address, play_areas)
SELECT id, 'Avondale Brewing Fields', '201 41st St S, Birmingham, AL 35222',
       ARRAY['Court A', 'Court B', 'Court C']
FROM public.cities WHERE name = 'Birmingham';

-- Sarasota
INSERT INTO public.venues (city_id, name, address, play_areas)
SELECT id, 'Payne Park', '2050 Adams Ln, Sarasota, FL 34237',
       ARRAY['Field 1', 'Field 2', 'Sand Court 1']
FROM public.cities WHERE name = 'Sarasota';

INSERT INTO public.venues (city_id, name, address, play_areas)
SELECT id, 'Lakeview Park Recreation Center', '7150 Lago St, Sarasota, FL 34240',
       ARRAY['Court 1', 'Court 2', 'Lane 1', 'Lane 2']
FROM public.cities WHERE name = 'Sarasota';

-- Cincinnati
INSERT INTO public.venues (city_id, name, address, play_areas)
SELECT id, 'Sawyer Point Park', '705 E Pete Rose Way, Cincinnati, OH 45202',
       ARRAY['Field A', 'Field B', 'Sand Court 1', 'Sand Court 2']
FROM public.cities WHERE name = 'Cincinnati';

INSERT INTO public.venues (city_id, name, address, play_areas)
SELECT id, 'OTR Sports Complex', '1301 Western Ave, Cincinnati, OH 45203',
       ARRAY['Court 1', 'Court 2', 'Court 3']
FROM public.cities WHERE name = 'Cincinnati';

-- ============================================
-- SEASONS (~15 popular leagues x 3 seasons each)
-- We pick a representative mix of cities and sports.
-- ============================================

-- Helper: Spring 2026
--   Registration: 2026-02-01 to 2026-02-28
--   Season:       2026-03-07 to 2026-05-23
--   Status:       'registration'

-- Helper: Summer 2026
--   Registration: 2026-05-01 to 2026-05-31
--   Season:       2026-06-06 to 2026-08-22
--   Status:       'draft'

-- Helper: Fall 2026
--   Registration: 2026-08-01 to 2026-08-31
--   Season:       2026-09-05 to 2026-11-21
--   Status:       'draft'

-- 1) Nashville Kickball
INSERT INTO public.seasons (league_id, name, status, registration_start_date, registration_end_date, season_start_date, season_end_date, schedule_config)
SELECT l.id, 'Spring 2026', 'registration', '2026-02-01', '2026-02-28', '2026-03-07', '2026-05-23',
       '{"gameDays":[6],"timeSlots":["10:00","11:00","12:00","13:00"],"totalWeeks":10}'::jsonb
FROM public.leagues l JOIN public.cities c ON l.city_id = c.id JOIN public.sports s ON l.sport_id = s.id
WHERE c.name = 'Nashville' AND s.name = 'Kickball';

INSERT INTO public.seasons (league_id, name, status, registration_start_date, registration_end_date, season_start_date, season_end_date, schedule_config)
SELECT l.id, 'Summer 2026', 'draft', '2026-05-01', '2026-05-31', '2026-06-06', '2026-08-22',
       '{"gameDays":[6],"timeSlots":["09:00","10:00","11:00","12:00"],"totalWeeks":10}'::jsonb
FROM public.leagues l JOIN public.cities c ON l.city_id = c.id JOIN public.sports s ON l.sport_id = s.id
WHERE c.name = 'Nashville' AND s.name = 'Kickball';

INSERT INTO public.seasons (league_id, name, status, registration_start_date, registration_end_date, season_start_date, season_end_date, schedule_config)
SELECT l.id, 'Fall 2026', 'draft', '2026-08-01', '2026-08-31', '2026-09-05', '2026-11-21',
       '{"gameDays":[6],"timeSlots":["10:00","11:00","12:00","13:00"],"totalWeeks":10}'::jsonb
FROM public.leagues l JOIN public.cities c ON l.city_id = c.id JOIN public.sports s ON l.sport_id = s.id
WHERE c.name = 'Nashville' AND s.name = 'Kickball';

-- 2) Nashville Dodgeball
INSERT INTO public.seasons (league_id, name, status, registration_start_date, registration_end_date, season_start_date, season_end_date, schedule_config)
SELECT l.id, 'Spring 2026', 'registration', '2026-02-01', '2026-02-28', '2026-03-07', '2026-05-23',
       '{"gameDays":[3],"timeSlots":["19:00","20:00","21:00"],"totalWeeks":8}'::jsonb
FROM public.leagues l JOIN public.cities c ON l.city_id = c.id JOIN public.sports s ON l.sport_id = s.id
WHERE c.name = 'Nashville' AND s.name = 'Dodgeball';

INSERT INTO public.seasons (league_id, name, status, registration_start_date, registration_end_date, season_start_date, season_end_date, schedule_config)
SELECT l.id, 'Summer 2026', 'draft', '2026-05-01', '2026-05-31', '2026-06-06', '2026-08-22',
       '{"gameDays":[3],"timeSlots":["19:00","20:00","21:00"],"totalWeeks":8}'::jsonb
FROM public.leagues l JOIN public.cities c ON l.city_id = c.id JOIN public.sports s ON l.sport_id = s.id
WHERE c.name = 'Nashville' AND s.name = 'Dodgeball';

INSERT INTO public.seasons (league_id, name, status, registration_start_date, registration_end_date, season_start_date, season_end_date, schedule_config)
SELECT l.id, 'Fall 2026', 'draft', '2026-08-01', '2026-08-31', '2026-09-05', '2026-11-21',
       '{"gameDays":[3],"timeSlots":["19:00","20:00","21:00"],"totalWeeks":8}'::jsonb
FROM public.leagues l JOIN public.cities c ON l.city_id = c.id JOIN public.sports s ON l.sport_id = s.id
WHERE c.name = 'Nashville' AND s.name = 'Dodgeball';

-- 3) St. Pete Sand Volleyball
INSERT INTO public.seasons (league_id, name, status, registration_start_date, registration_end_date, season_start_date, season_end_date, schedule_config)
SELECT l.id, 'Spring 2026', 'registration', '2026-02-01', '2026-02-28', '2026-03-07', '2026-05-23',
       '{"gameDays":[0],"timeSlots":["09:00","10:00","11:00"],"totalWeeks":10}'::jsonb
FROM public.leagues l JOIN public.cities c ON l.city_id = c.id JOIN public.sports s ON l.sport_id = s.id
WHERE c.name = 'St. Pete' AND s.name = 'Sand Volleyball';

INSERT INTO public.seasons (league_id, name, status, registration_start_date, registration_end_date, season_start_date, season_end_date, schedule_config)
SELECT l.id, 'Summer 2026', 'draft', '2026-05-01', '2026-05-31', '2026-06-06', '2026-08-22',
       '{"gameDays":[0],"timeSlots":["08:00","09:00","10:00"],"totalWeeks":10}'::jsonb
FROM public.leagues l JOIN public.cities c ON l.city_id = c.id JOIN public.sports s ON l.sport_id = s.id
WHERE c.name = 'St. Pete' AND s.name = 'Sand Volleyball';

INSERT INTO public.seasons (league_id, name, status, registration_start_date, registration_end_date, season_start_date, season_end_date, schedule_config)
SELECT l.id, 'Fall 2026', 'draft', '2026-08-01', '2026-08-31', '2026-09-05', '2026-11-21',
       '{"gameDays":[0],"timeSlots":["09:00","10:00","11:00"],"totalWeeks":10}'::jsonb
FROM public.leagues l JOIN public.cities c ON l.city_id = c.id JOIN public.sports s ON l.sport_id = s.id
WHERE c.name = 'St. Pete' AND s.name = 'Sand Volleyball';

-- 4) St. Pete Kickball
INSERT INTO public.seasons (league_id, name, status, registration_start_date, registration_end_date, season_start_date, season_end_date, schedule_config)
SELECT l.id, 'Spring 2026', 'registration', '2026-02-01', '2026-02-28', '2026-03-07', '2026-05-23',
       '{"gameDays":[6],"timeSlots":["10:00","11:00","12:00","13:00"],"totalWeeks":10}'::jsonb
FROM public.leagues l JOIN public.cities c ON l.city_id = c.id JOIN public.sports s ON l.sport_id = s.id
WHERE c.name = 'St. Pete' AND s.name = 'Kickball';

INSERT INTO public.seasons (league_id, name, status, registration_start_date, registration_end_date, season_start_date, season_end_date, schedule_config)
SELECT l.id, 'Summer 2026', 'draft', '2026-05-01', '2026-05-31', '2026-06-06', '2026-08-22',
       '{"gameDays":[6],"timeSlots":["09:00","10:00","11:00","12:00"],"totalWeeks":10}'::jsonb
FROM public.leagues l JOIN public.cities c ON l.city_id = c.id JOIN public.sports s ON l.sport_id = s.id
WHERE c.name = 'St. Pete' AND s.name = 'Kickball';

INSERT INTO public.seasons (league_id, name, status, registration_start_date, registration_end_date, season_start_date, season_end_date, schedule_config)
SELECT l.id, 'Fall 2026', 'draft', '2026-08-01', '2026-08-31', '2026-09-05', '2026-11-21',
       '{"gameDays":[6],"timeSlots":["10:00","11:00","12:00","13:00"],"totalWeeks":10}'::jsonb
FROM public.leagues l JOIN public.cities c ON l.city_id = c.id JOIN public.sports s ON l.sport_id = s.id
WHERE c.name = 'St. Pete' AND s.name = 'Kickball';

-- 5) St. Louis Bowling
INSERT INTO public.seasons (league_id, name, status, registration_start_date, registration_end_date, season_start_date, season_end_date, schedule_config)
SELECT l.id, 'Spring 2026', 'registration', '2026-02-01', '2026-02-28', '2026-03-07', '2026-05-23',
       '{"gameDays":[4],"timeSlots":["19:00","20:00","21:00"],"totalWeeks":10}'::jsonb
FROM public.leagues l JOIN public.cities c ON l.city_id = c.id JOIN public.sports s ON l.sport_id = s.id
WHERE c.name = 'St. Louis' AND s.name = 'Bowling';

INSERT INTO public.seasons (league_id, name, status, registration_start_date, registration_end_date, season_start_date, season_end_date, schedule_config)
SELECT l.id, 'Summer 2026', 'draft', '2026-05-01', '2026-05-31', '2026-06-06', '2026-08-22',
       '{"gameDays":[4],"timeSlots":["19:00","20:00","21:00"],"totalWeeks":10}'::jsonb
FROM public.leagues l JOIN public.cities c ON l.city_id = c.id JOIN public.sports s ON l.sport_id = s.id
WHERE c.name = 'St. Louis' AND s.name = 'Bowling';

INSERT INTO public.seasons (league_id, name, status, registration_start_date, registration_end_date, season_start_date, season_end_date, schedule_config)
SELECT l.id, 'Fall 2026', 'draft', '2026-08-01', '2026-08-31', '2026-09-05', '2026-11-21',
       '{"gameDays":[4],"timeSlots":["19:00","20:00","21:00"],"totalWeeks":10}'::jsonb
FROM public.leagues l JOIN public.cities c ON l.city_id = c.id JOIN public.sports s ON l.sport_id = s.id
WHERE c.name = 'St. Louis' AND s.name = 'Bowling';

-- 6) St. Louis Flag Football
INSERT INTO public.seasons (league_id, name, status, registration_start_date, registration_end_date, season_start_date, season_end_date, schedule_config)
SELECT l.id, 'Spring 2026', 'registration', '2026-02-01', '2026-02-28', '2026-03-07', '2026-05-23',
       '{"gameDays":[0],"timeSlots":["12:00","13:00","14:00","15:00"],"totalWeeks":8}'::jsonb
FROM public.leagues l JOIN public.cities c ON l.city_id = c.id JOIN public.sports s ON l.sport_id = s.id
WHERE c.name = 'St. Louis' AND s.name = 'Flag Football';

INSERT INTO public.seasons (league_id, name, status, registration_start_date, registration_end_date, season_start_date, season_end_date, schedule_config)
SELECT l.id, 'Summer 2026', 'draft', '2026-05-01', '2026-05-31', '2026-06-06', '2026-08-22',
       '{"gameDays":[0],"timeSlots":["11:00","12:00","13:00","14:00"],"totalWeeks":8}'::jsonb
FROM public.leagues l JOIN public.cities c ON l.city_id = c.id JOIN public.sports s ON l.sport_id = s.id
WHERE c.name = 'St. Louis' AND s.name = 'Flag Football';

INSERT INTO public.seasons (league_id, name, status, registration_start_date, registration_end_date, season_start_date, season_end_date, schedule_config)
SELECT l.id, 'Fall 2026', 'draft', '2026-08-01', '2026-08-31', '2026-09-05', '2026-11-21',
       '{"gameDays":[0],"timeSlots":["12:00","13:00","14:00","15:00"],"totalWeeks":8}'::jsonb
FROM public.leagues l JOIN public.cities c ON l.city_id = c.id JOIN public.sports s ON l.sport_id = s.id
WHERE c.name = 'St. Louis' AND s.name = 'Flag Football';

-- 7) OKC Cornhole
INSERT INTO public.seasons (league_id, name, status, registration_start_date, registration_end_date, season_start_date, season_end_date, schedule_config)
SELECT l.id, 'Spring 2026', 'registration', '2026-02-01', '2026-02-28', '2026-03-07', '2026-05-23',
       '{"gameDays":[5],"timeSlots":["18:00","19:00","20:00"],"totalWeeks":8}'::jsonb
FROM public.leagues l JOIN public.cities c ON l.city_id = c.id JOIN public.sports s ON l.sport_id = s.id
WHERE c.name = 'OKC' AND s.name = 'Cornhole';

INSERT INTO public.seasons (league_id, name, status, registration_start_date, registration_end_date, season_start_date, season_end_date, schedule_config)
SELECT l.id, 'Summer 2026', 'draft', '2026-05-01', '2026-05-31', '2026-06-06', '2026-08-22',
       '{"gameDays":[5],"timeSlots":["18:00","19:00","20:00"],"totalWeeks":8}'::jsonb
FROM public.leagues l JOIN public.cities c ON l.city_id = c.id JOIN public.sports s ON l.sport_id = s.id
WHERE c.name = 'OKC' AND s.name = 'Cornhole';

INSERT INTO public.seasons (league_id, name, status, registration_start_date, registration_end_date, season_start_date, season_end_date, schedule_config)
SELECT l.id, 'Fall 2026', 'draft', '2026-08-01', '2026-08-31', '2026-09-05', '2026-11-21',
       '{"gameDays":[5],"timeSlots":["18:00","19:00","20:00"],"totalWeeks":8}'::jsonb
FROM public.leagues l JOIN public.cities c ON l.city_id = c.id JOIN public.sports s ON l.sport_id = s.id
WHERE c.name = 'OKC' AND s.name = 'Cornhole';

-- 8) OKC Basketball
INSERT INTO public.seasons (league_id, name, status, registration_start_date, registration_end_date, season_start_date, season_end_date, schedule_config)
SELECT l.id, 'Spring 2026', 'registration', '2026-02-01', '2026-02-28', '2026-03-07', '2026-05-23',
       '{"gameDays":[2],"timeSlots":["19:00","20:00","21:00"],"totalWeeks":10}'::jsonb
FROM public.leagues l JOIN public.cities c ON l.city_id = c.id JOIN public.sports s ON l.sport_id = s.id
WHERE c.name = 'OKC' AND s.name = 'Basketball';

INSERT INTO public.seasons (league_id, name, status, registration_start_date, registration_end_date, season_start_date, season_end_date, schedule_config)
SELECT l.id, 'Summer 2026', 'draft', '2026-05-01', '2026-05-31', '2026-06-06', '2026-08-22',
       '{"gameDays":[2],"timeSlots":["19:00","20:00","21:00"],"totalWeeks":10}'::jsonb
FROM public.leagues l JOIN public.cities c ON l.city_id = c.id JOIN public.sports s ON l.sport_id = s.id
WHERE c.name = 'OKC' AND s.name = 'Basketball';

INSERT INTO public.seasons (league_id, name, status, registration_start_date, registration_end_date, season_start_date, season_end_date, schedule_config)
SELECT l.id, 'Fall 2026', 'draft', '2026-08-01', '2026-08-31', '2026-09-05', '2026-11-21',
       '{"gameDays":[2],"timeSlots":["19:00","20:00","21:00"],"totalWeeks":10}'::jsonb
FROM public.leagues l JOIN public.cities c ON l.city_id = c.id JOIN public.sports s ON l.sport_id = s.id
WHERE c.name = 'OKC' AND s.name = 'Basketball';

-- 9) Birmingham Kickball
INSERT INTO public.seasons (league_id, name, status, registration_start_date, registration_end_date, season_start_date, season_end_date, schedule_config)
SELECT l.id, 'Spring 2026', 'registration', '2026-02-01', '2026-02-28', '2026-03-07', '2026-05-23',
       '{"gameDays":[6],"timeSlots":["10:00","11:00","12:00","13:00"],"totalWeeks":10}'::jsonb
FROM public.leagues l JOIN public.cities c ON l.city_id = c.id JOIN public.sports s ON l.sport_id = s.id
WHERE c.name = 'Birmingham' AND s.name = 'Kickball';

INSERT INTO public.seasons (league_id, name, status, registration_start_date, registration_end_date, season_start_date, season_end_date, schedule_config)
SELECT l.id, 'Summer 2026', 'draft', '2026-05-01', '2026-05-31', '2026-06-06', '2026-08-22',
       '{"gameDays":[6],"timeSlots":["09:00","10:00","11:00","12:00"],"totalWeeks":10}'::jsonb
FROM public.leagues l JOIN public.cities c ON l.city_id = c.id JOIN public.sports s ON l.sport_id = s.id
WHERE c.name = 'Birmingham' AND s.name = 'Kickball';

INSERT INTO public.seasons (league_id, name, status, registration_start_date, registration_end_date, season_start_date, season_end_date, schedule_config)
SELECT l.id, 'Fall 2026', 'draft', '2026-08-01', '2026-08-31', '2026-09-05', '2026-11-21',
       '{"gameDays":[6],"timeSlots":["10:00","11:00","12:00","13:00"],"totalWeeks":10}'::jsonb
FROM public.leagues l JOIN public.cities c ON l.city_id = c.id JOIN public.sports s ON l.sport_id = s.id
WHERE c.name = 'Birmingham' AND s.name = 'Kickball';

-- 10) Birmingham Dodgeball
INSERT INTO public.seasons (league_id, name, status, registration_start_date, registration_end_date, season_start_date, season_end_date, schedule_config)
SELECT l.id, 'Spring 2026', 'registration', '2026-02-01', '2026-02-28', '2026-03-07', '2026-05-23',
       '{"gameDays":[3],"timeSlots":["19:00","20:00","21:00"],"totalWeeks":8}'::jsonb
FROM public.leagues l JOIN public.cities c ON l.city_id = c.id JOIN public.sports s ON l.sport_id = s.id
WHERE c.name = 'Birmingham' AND s.name = 'Dodgeball';

INSERT INTO public.seasons (league_id, name, status, registration_start_date, registration_end_date, season_start_date, season_end_date, schedule_config)
SELECT l.id, 'Summer 2026', 'draft', '2026-05-01', '2026-05-31', '2026-06-06', '2026-08-22',
       '{"gameDays":[3],"timeSlots":["19:00","20:00","21:00"],"totalWeeks":8}'::jsonb
FROM public.leagues l JOIN public.cities c ON l.city_id = c.id JOIN public.sports s ON l.sport_id = s.id
WHERE c.name = 'Birmingham' AND s.name = 'Dodgeball';

INSERT INTO public.seasons (league_id, name, status, registration_start_date, registration_end_date, season_start_date, season_end_date, schedule_config)
SELECT l.id, 'Fall 2026', 'draft', '2026-08-01', '2026-08-31', '2026-09-05', '2026-11-21',
       '{"gameDays":[3],"timeSlots":["19:00","20:00","21:00"],"totalWeeks":8}'::jsonb
FROM public.leagues l JOIN public.cities c ON l.city_id = c.id JOIN public.sports s ON l.sport_id = s.id
WHERE c.name = 'Birmingham' AND s.name = 'Dodgeball';

-- 11) Sarasota Sand Volleyball
INSERT INTO public.seasons (league_id, name, status, registration_start_date, registration_end_date, season_start_date, season_end_date, schedule_config)
SELECT l.id, 'Spring 2026', 'registration', '2026-02-01', '2026-02-28', '2026-03-07', '2026-05-23',
       '{"gameDays":[0],"timeSlots":["09:00","10:00","11:00"],"totalWeeks":10}'::jsonb
FROM public.leagues l JOIN public.cities c ON l.city_id = c.id JOIN public.sports s ON l.sport_id = s.id
WHERE c.name = 'Sarasota' AND s.name = 'Sand Volleyball';

INSERT INTO public.seasons (league_id, name, status, registration_start_date, registration_end_date, season_start_date, season_end_date, schedule_config)
SELECT l.id, 'Summer 2026', 'draft', '2026-05-01', '2026-05-31', '2026-06-06', '2026-08-22',
       '{"gameDays":[0],"timeSlots":["08:00","09:00","10:00"],"totalWeeks":10}'::jsonb
FROM public.leagues l JOIN public.cities c ON l.city_id = c.id JOIN public.sports s ON l.sport_id = s.id
WHERE c.name = 'Sarasota' AND s.name = 'Sand Volleyball';

INSERT INTO public.seasons (league_id, name, status, registration_start_date, registration_end_date, season_start_date, season_end_date, schedule_config)
SELECT l.id, 'Fall 2026', 'draft', '2026-08-01', '2026-08-31', '2026-09-05', '2026-11-21',
       '{"gameDays":[0],"timeSlots":["09:00","10:00","11:00"],"totalWeeks":10}'::jsonb
FROM public.leagues l JOIN public.cities c ON l.city_id = c.id JOIN public.sports s ON l.sport_id = s.id
WHERE c.name = 'Sarasota' AND s.name = 'Sand Volleyball';

-- 12) Sarasota Pickleball
INSERT INTO public.seasons (league_id, name, status, registration_start_date, registration_end_date, season_start_date, season_end_date, schedule_config)
SELECT l.id, 'Spring 2026', 'registration', '2026-02-01', '2026-02-28', '2026-03-07', '2026-05-23',
       '{"gameDays":[6],"timeSlots":["08:00","09:00","10:00","11:00"],"totalWeeks":10}'::jsonb
FROM public.leagues l JOIN public.cities c ON l.city_id = c.id JOIN public.sports s ON l.sport_id = s.id
WHERE c.name = 'Sarasota' AND s.name = 'Pickleball';

INSERT INTO public.seasons (league_id, name, status, registration_start_date, registration_end_date, season_start_date, season_end_date, schedule_config)
SELECT l.id, 'Summer 2026', 'draft', '2026-05-01', '2026-05-31', '2026-06-06', '2026-08-22',
       '{"gameDays":[6],"timeSlots":["07:00","08:00","09:00","10:00"],"totalWeeks":10}'::jsonb
FROM public.leagues l JOIN public.cities c ON l.city_id = c.id JOIN public.sports s ON l.sport_id = s.id
WHERE c.name = 'Sarasota' AND s.name = 'Pickleball';

INSERT INTO public.seasons (league_id, name, status, registration_start_date, registration_end_date, season_start_date, season_end_date, schedule_config)
SELECT l.id, 'Fall 2026', 'draft', '2026-08-01', '2026-08-31', '2026-09-05', '2026-11-21',
       '{"gameDays":[6],"timeSlots":["08:00","09:00","10:00","11:00"],"totalWeeks":10}'::jsonb
FROM public.leagues l JOIN public.cities c ON l.city_id = c.id JOIN public.sports s ON l.sport_id = s.id
WHERE c.name = 'Sarasota' AND s.name = 'Pickleball';

-- 13) Cincinnati Kickball
INSERT INTO public.seasons (league_id, name, status, registration_start_date, registration_end_date, season_start_date, season_end_date, schedule_config)
SELECT l.id, 'Spring 2026', 'registration', '2026-02-01', '2026-02-28', '2026-03-07', '2026-05-23',
       '{"gameDays":[6],"timeSlots":["10:00","11:00","12:00","13:00"],"totalWeeks":10}'::jsonb
FROM public.leagues l JOIN public.cities c ON l.city_id = c.id JOIN public.sports s ON l.sport_id = s.id
WHERE c.name = 'Cincinnati' AND s.name = 'Kickball';

INSERT INTO public.seasons (league_id, name, status, registration_start_date, registration_end_date, season_start_date, season_end_date, schedule_config)
SELECT l.id, 'Summer 2026', 'draft', '2026-05-01', '2026-05-31', '2026-06-06', '2026-08-22',
       '{"gameDays":[6],"timeSlots":["10:00","11:00","12:00","13:00"],"totalWeeks":10}'::jsonb
FROM public.leagues l JOIN public.cities c ON l.city_id = c.id JOIN public.sports s ON l.sport_id = s.id
WHERE c.name = 'Cincinnati' AND s.name = 'Kickball';

INSERT INTO public.seasons (league_id, name, status, registration_start_date, registration_end_date, season_start_date, season_end_date, schedule_config)
SELECT l.id, 'Fall 2026', 'draft', '2026-08-01', '2026-08-31', '2026-09-05', '2026-11-21',
       '{"gameDays":[6],"timeSlots":["10:00","11:00","12:00","13:00"],"totalWeeks":10}'::jsonb
FROM public.leagues l JOIN public.cities c ON l.city_id = c.id JOIN public.sports s ON l.sport_id = s.id
WHERE c.name = 'Cincinnati' AND s.name = 'Kickball';

-- 14) Cincinnati Basketball
INSERT INTO public.seasons (league_id, name, status, registration_start_date, registration_end_date, season_start_date, season_end_date, schedule_config)
SELECT l.id, 'Spring 2026', 'registration', '2026-02-01', '2026-02-28', '2026-03-07', '2026-05-23',
       '{"gameDays":[1],"timeSlots":["19:00","20:00","21:00"],"totalWeeks":10}'::jsonb
FROM public.leagues l JOIN public.cities c ON l.city_id = c.id JOIN public.sports s ON l.sport_id = s.id
WHERE c.name = 'Cincinnati' AND s.name = 'Basketball';

INSERT INTO public.seasons (league_id, name, status, registration_start_date, registration_end_date, season_start_date, season_end_date, schedule_config)
SELECT l.id, 'Summer 2026', 'draft', '2026-05-01', '2026-05-31', '2026-06-06', '2026-08-22',
       '{"gameDays":[1],"timeSlots":["19:00","20:00","21:00"],"totalWeeks":10}'::jsonb
FROM public.leagues l JOIN public.cities c ON l.city_id = c.id JOIN public.sports s ON l.sport_id = s.id
WHERE c.name = 'Cincinnati' AND s.name = 'Basketball';

INSERT INTO public.seasons (league_id, name, status, registration_start_date, registration_end_date, season_start_date, season_end_date, schedule_config)
SELECT l.id, 'Fall 2026', 'draft', '2026-08-01', '2026-08-31', '2026-09-05', '2026-11-21',
       '{"gameDays":[1],"timeSlots":["19:00","20:00","21:00"],"totalWeeks":10}'::jsonb
FROM public.leagues l JOIN public.cities c ON l.city_id = c.id JOIN public.sports s ON l.sport_id = s.id
WHERE c.name = 'Cincinnati' AND s.name = 'Basketball';

-- 15) Nashville Cornhole
INSERT INTO public.seasons (league_id, name, status, registration_start_date, registration_end_date, season_start_date, season_end_date, schedule_config)
SELECT l.id, 'Spring 2026', 'registration', '2026-02-01', '2026-02-28', '2026-03-07', '2026-05-23',
       '{"gameDays":[4],"timeSlots":["18:00","19:00","20:00"],"totalWeeks":8}'::jsonb
FROM public.leagues l JOIN public.cities c ON l.city_id = c.id JOIN public.sports s ON l.sport_id = s.id
WHERE c.name = 'Nashville' AND s.name = 'Cornhole';

INSERT INTO public.seasons (league_id, name, status, registration_start_date, registration_end_date, season_start_date, season_end_date, schedule_config)
SELECT l.id, 'Summer 2026', 'draft', '2026-05-01', '2026-05-31', '2026-06-06', '2026-08-22',
       '{"gameDays":[4],"timeSlots":["18:00","19:00","20:00"],"totalWeeks":8}'::jsonb
FROM public.leagues l JOIN public.cities c ON l.city_id = c.id JOIN public.sports s ON l.sport_id = s.id
WHERE c.name = 'Nashville' AND s.name = 'Cornhole';

INSERT INTO public.seasons (league_id, name, status, registration_start_date, registration_end_date, season_start_date, season_end_date, schedule_config)
SELECT l.id, 'Fall 2026', 'draft', '2026-08-01', '2026-08-31', '2026-09-05', '2026-11-21',
       '{"gameDays":[4],"timeSlots":["18:00","19:00","20:00"],"totalWeeks":8}'::jsonb
FROM public.leagues l JOIN public.cities c ON l.city_id = c.id JOIN public.sports s ON l.sport_id = s.id
WHERE c.name = 'Nashville' AND s.name = 'Cornhole';

-- ============================================
-- DIVISIONS (A and B for every season)
-- ============================================

INSERT INTO public.divisions (season_id, name, description, skill_level, max_teams)
SELECT s.id, 'Division A', 'Competitive division', 3, 8
FROM public.seasons s;

INSERT INTO public.divisions (season_id, name, description, skill_level, max_teams)
SELECT s.id, 'Division B', 'Social / recreational division', 1, 8
FROM public.seasons s;

-- ============================================
-- TEAMS (4 per division, creative sport-themed names)
-- ============================================
-- We use a CTE approach: for every division, look up the sport name
-- via division -> season -> league -> sport, then assign four
-- themed team names per sport.

-- Kickball teams
INSERT INTO public.teams (division_id, name, shirt_color, status)
SELECT d.id, team_data.name, team_data.color, 'confirmed'
FROM public.divisions d
JOIN public.seasons sn ON d.season_id = sn.id
JOIN public.leagues l ON sn.league_id = l.id
JOIN public.sports sp ON l.sport_id = sp.id
CROSS JOIN (VALUES
    ('Kick in a Box',     'Red'),
    ('Ball Busters',      'Blue'),
    ('Pitch Slap',        'Black'),
    ('Kickin'' & Screamin''', 'Orange')
) AS team_data(name, color)
WHERE sp.name = 'Kickball';

-- Dodgeball teams
INSERT INTO public.teams (division_id, name, shirt_color, status)
SELECT d.id, team_data.name, team_data.color, 'confirmed'
FROM public.divisions d
JOIN public.seasons sn ON d.season_id = sn.id
JOIN public.leagues l ON sn.league_id = l.id
JOIN public.sports sp ON l.sport_id = sp.id
CROSS JOIN (VALUES
    ('Average Joes',      'Yellow'),
    ('Globo Gym Cobras',  'Purple'),
    ('Duck and Cover',    'Green'),
    ('Dodge City',        'Red')
) AS team_data(name, color)
WHERE sp.name = 'Dodgeball';

-- Bowling teams
INSERT INTO public.teams (division_id, name, shirt_color, status)
SELECT d.id, team_data.name, team_data.color, 'confirmed'
FROM public.divisions d
JOIN public.seasons sn ON d.season_id = sn.id
JOIN public.leagues l ON sn.league_id = l.id
JOIN public.sports sp ON l.sport_id = sp.id
CROSS JOIN (VALUES
    ('Gutter Punks',      'Black'),
    ('Pin Pals',          'Blue'),
    ('Split Happens',     'White'),
    ('Bowl Movements',    'Green')
) AS team_data(name, color)
WHERE sp.name = 'Bowling';

-- Indoor Volleyball teams
INSERT INTO public.teams (division_id, name, shirt_color, status)
SELECT d.id, team_data.name, team_data.color, 'confirmed'
FROM public.divisions d
JOIN public.seasons sn ON d.season_id = sn.id
JOIN public.leagues l ON sn.league_id = l.id
JOIN public.sports sp ON l.sport_id = sp.id
CROSS JOIN (VALUES
    ('Net Gains',         'Navy'),
    ('Sets on the Beach', 'Teal'),
    ('Block Party',       'Red'),
    ('Ace Ventura',       'White')
) AS team_data(name, color)
WHERE sp.name = 'Indoor Volleyball';

-- Sand Volleyball teams
INSERT INTO public.teams (division_id, name, shirt_color, status)
SELECT d.id, team_data.name, team_data.color, 'confirmed'
FROM public.divisions d
JOIN public.seasons sn ON d.season_id = sn.id
JOIN public.leagues l ON sn.league_id = l.id
JOIN public.sports sp ON l.sport_id = sp.id
CROSS JOIN (VALUES
    ('Sandy Cheeks',      'Yellow'),
    ('Dig Dug',           'Orange'),
    ('Spike Lee',         'Black'),
    ('Set It and Forget It', 'Blue')
) AS team_data(name, color)
WHERE sp.name = 'Sand Volleyball';

-- Grass Volleyball teams
INSERT INTO public.teams (division_id, name, shirt_color, status)
SELECT d.id, team_data.name, team_data.color, 'confirmed'
FROM public.divisions d
JOIN public.seasons sn ON d.season_id = sn.id
JOIN public.leagues l ON sn.league_id = l.id
JOIN public.sports sp ON l.sport_id = sp.id
CROSS JOIN (VALUES
    ('Lawn and Order',    'Green'),
    ('The Grasshoppers',  'Lime'),
    ('Turf Wars',         'Navy'),
    ('Bump Set Spike',    'White')
) AS team_data(name, color)
WHERE sp.name = 'Grass Volleyball';

-- Cornhole teams
INSERT INTO public.teams (division_id, name, shirt_color, status)
SELECT d.id, team_data.name, team_data.color, 'confirmed'
FROM public.divisions d
JOIN public.seasons sn ON d.season_id = sn.id
JOIN public.leagues l ON sn.league_id = l.id
JOIN public.sports sp ON l.sport_id = sp.id
CROSS JOIN (VALUES
    ('Bags to Riches',    'Gold'),
    ('Hole in One',       'Red'),
    ('Corn Stars',        'Yellow'),
    ('Toss Bosses',       'Black')
) AS team_data(name, color)
WHERE sp.name = 'Cornhole';

-- Pickleball teams
INSERT INTO public.teams (division_id, name, shirt_color, status)
SELECT d.id, team_data.name, team_data.color, 'confirmed'
FROM public.divisions d
JOIN public.seasons sn ON d.season_id = sn.id
JOIN public.leagues l ON sn.league_id = l.id
JOIN public.sports sp ON l.sport_id = sp.id
CROSS JOIN (VALUES
    ('Dill With It',      'Green'),
    ('Big Dill Energy',   'Purple'),
    ('Pickle Rick''s',    'Teal'),
    ('Brine Time',        'Yellow')
) AS team_data(name, color)
WHERE sp.name = 'Pickleball';

-- Basketball teams
INSERT INTO public.teams (division_id, name, shirt_color, status)
SELECT d.id, team_data.name, team_data.color, 'confirmed'
FROM public.divisions d
JOIN public.seasons sn ON d.season_id = sn.id
JOIN public.leagues l ON sn.league_id = l.id
JOIN public.sports sp ON l.sport_id = sp.id
CROSS JOIN (VALUES
    ('Air Balls',         'White'),
    ('Net Rippers',       'Red'),
    ('Dunkin'' Donuts',   'Orange'),
    ('Brick Squad',       'Gray')
) AS team_data(name, color)
WHERE sp.name = 'Basketball';

-- Flag Football teams
INSERT INTO public.teams (division_id, name, shirt_color, status)
SELECT d.id, team_data.name, team_data.color, 'confirmed'
FROM public.divisions d
JOIN public.seasons sn ON d.season_id = sn.id
JOIN public.leagues l ON sn.league_id = l.id
JOIN public.sports sp ON l.sport_id = sp.id
CROSS JOIN (VALUES
    ('Flag You',          'Red'),
    ('Sack Masters',      'Blue'),
    ('Two Hand Touch',    'Black'),
    ('Blitz Krieg',       'Camo')
) AS team_data(name, color)
WHERE sp.name = 'Flag Football';

-- Tennis teams
INSERT INTO public.teams (division_id, name, shirt_color, status)
SELECT d.id, team_data.name, team_data.color, 'confirmed'
FROM public.divisions d
JOIN public.seasons sn ON d.season_id = sn.id
JOIN public.leagues l ON sn.league_id = l.id
JOIN public.sports sp ON l.sport_id = sp.id
CROSS JOIN (VALUES
    ('Love Means Nothing', 'White'),
    ('Deuce Bigalow',     'Navy'),
    ('Drop Shots',        'Green'),
    ('Net Prophets',      'Yellow')
) AS team_data(name, color)
WHERE sp.name = 'Tennis';

-- ============================================
-- DONE
-- ============================================

RAISE NOTICE 'v2 seed data inserted successfully!';
