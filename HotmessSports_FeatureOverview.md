# Hotmess Sports — Platform Feature Overview
### Web App & Mobile App

---

> **Prepared for:** Owner Review
> **Purpose:** Feature overview and competitive differentiation vs. Sports Engine

---

## Table of Contents
1. [Web App — Public Features](#1-web-app--public-features)
2. [Web App — Admin Portal](#2-web-app--admin-portal)
3. [Mobile App — Player Features](#3-mobile-app--player-features)
4. [Mobile App — Role-Based Features](#4-mobile-app--role-based-features)
5. [Bonus Features vs. Sports Engine](#5-bonus-features-vs-sports-engine)

---

## 1. Web App — Public Features

The public-facing website is the first impression for new players and returning members. It is fully accessible without logging in.

---

### Home / Welcome Page

**[PICTURE PLACEHOLDER — Homepage hero section screenshot]**

- Eye-catching hero section with direct **Register to Play** and **Learn More** CTAs
- **Open Registration banner** — dynamically shows leagues currently accepting signups, pulling live data from the database
- **Sports grid** — visual cards for all 12+ available sports with color-coded icons
- **Upcoming Leagues section** — shows leagues starting soon across all cities
- **Find Your City** — photo cards linking to each active city's league page
- **"Why Hotmess Sports?" feature highlights** — Organized Leagues, Meet New People, Social Events, Easy Scheduling

---

### Cities Page

**[PICTURE PLACEHOLDER — Cities page screenshot]**

- Browse all active Hotmess Sports cities
- Click any city to see that city's available sports and leagues
- City-level registration flow: `Cities → Sport → Registration Page`

---

### Sports Page

**[PICTURE PLACEHOLDER — Sports page with sport cards]**

- 12 sports supported at launch:
  - Kickball, Dodgeball, Bowling, Indoor Volleyball, Sand Volleyball, Grass Volleyball, Cornhole, Pickleball, Basketball, Flag Football, Tennis, Beer Pong
- Each sport has its own detail page with relevant info

---

### Rules Page

**[PICTURE PLACEHOLDER — Rules page screenshot]**

- Sport-specific rules pages accessible by URL (`/rules/kickball`, `/rules/dodgeball`, etc.)
- Keeps all official rules in one place, no need for separate PDFs or emails

---

### Registration Page

**[PICTURE PLACEHOLDER — Registration page screenshot]**

- Centralized registration starting point
- Links players into the city/sport/league registration flow

---

### City League Registration Page

**[PICTURE PLACEHOLDER — City/league registration flow]**

- Deep-linked registration: `cities/:city/:sport`
- Players can register for a specific league in a specific city in a single flow

---

### About Page

**[PICTURE PLACEHOLDER — About page]**

- Brand story and company overview

---

## 2. Web App — Admin Portal

The admin portal is a **role-protected dashboard** accessible only to authenticated staff, commissioners, managers, referees, captains, and players. Each role sees only what they need.

---

### Role-Based Dashboard

**[PICTURE PLACEHOLDER — Admin dashboard with KPI cards]**

Each user sees a **custom dashboard** tailored to their role:

| Role | What They See |
|---|---|
| **Admin / Commissioner** | Active cities, sports, seasons, teams; open registrations; recent notifications |
| **Manager** | Their assigned seasons, active/registration counts, quick actions |
| **Referee** | Assigned seasons, upcoming games schedule |
| **Team Captain** | Their teams (W/L/T record), upcoming games, open registrations |
| **Player** | Their teams, upcoming games, open registrations, past seasons |

---

### Cities Manager

**[PICTURE PLACEHOLDER — Cities manager list view]**

- Create, view, and manage all active cities
- Drill into each city to see its leagues
- Protected to Admin + Commissioner roles

---

### Sports Manager

**[PICTURE PLACEHOLDER — Sports manager]**

- Admin-only: add and manage the sports catalog
- Sports data flows into leagues, cities, rules, and registration pages

---

### Leagues Manager

**[PICTURE PLACEHOLDER — Leagues manager with detail view]**

- Create and manage leagues per city
- League detail page shows associated seasons
- Drill-down navigation: Cities → Leagues → Seasons

---

### Seasons Manager

**[PICTURE PLACEHOLDER — Seasons manager with status filters]**

- Full lifecycle management: Registration → Active → Completed
- Season detail page with start/end dates, status, and division info
- Navigation: Leagues → Seasons → Season Detail

---

### Teams Manager

**[PICTURE PLACEHOLDER — Teams list with W/L/T record]**

- View and manage all teams across seasons
- Team detail page shows roster, W/L/T record, shirt color
- Accessible to Admin, Commissioner, Manager, and Team Captain

---

### Schedules Manager

**[PICTURE PLACEHOLDER — Schedules manager]**

- View and manage game schedules across all active seasons
- Accessible to Admin, Commissioner, Manager, and Referee roles

---

### Brackets Manager

**[PICTURE PLACEHOLDER — Brackets manager with bracket detail view]**

- Visual bracket management for tournament-style play
- Bracket detail page per season
- Accessible to Admin, Commissioner, Manager, and Referee roles

---

### Notifications Manager

**[PICTURE PLACEHOLDER — Notifications manager]**

- Create and send notifications to players, teams, or leagues
- View notification history with sent dates and targets

---

### Permissions Manager

**[PICTURE PLACEHOLDER — Permissions manager]**

- Admin-only: manage user roles and access across the platform
- Assign and revoke roles (Commissioner, Manager, Referee, Captain, Player)

---

## 3. Mobile App — Player Features

The mobile app (iOS & Android via React Native / Expo) is designed to be the **everyday companion** for players during a season.

---

### Home Screen

**[PICTURE PLACEHOLDER — Mobile home screen with greeting and upcoming game card]**

- Personalized greeting using preferred name or first name
- **Upcoming Games** — next scheduled game with date, time, and opponent
- **My Teams** — quick access to all teams the player is on
- **Open Registrations** — active seasons accepting new signups
- **Captain Section** — pending join requests badge (captains only)
- **Referee Duties** — upcoming assigned games (referees only)
- Pull-to-refresh for live data updates

---

### Schedule Screen

**[PICTURE PLACEHOLDER — Mobile schedule screen with game list]**

- Full season schedule for the player's teams
- Game date, time, venue, home/away, and opponent
- Win/loss/tie status for completed games

---

### Messages Screen

**[PICTURE PLACEHOLDER — Mobile messages screen grouped by type]**

- In-app messaging organized into **5 channel types**:
  - Announcements (league-wide)
  - Team Chats
  - Captain Chats
  - Referee Chats
  - Direct Messages
- Unread message badge counts
- Relative timestamps (now, 5m, 2h, 3d)
- Thread detail view for reading and sending messages

---

### Profile Screen

**[PICTURE PLACEHOLDER — Mobile profile screen with avatar and settings]**

- Avatar with initials
- Displays preferred name / full name and email
- **Current Season card** — shows sport, team name, and role
- Settings menu:
  - Notification Preferences
  - Edit Profile
  - Privacy Settings
- Sign Out with confirmation

---

### All Teams Screen / Team Details Screen

**[PICTURE PLACEHOLDER — Team details screen with roster]**

- Browse all teams in a season
- Team detail: full roster, sport, division, season

---

## 4. Mobile App — Role-Based Features

The mobile app surfaces **additional screens and tabs** based on the user's role.

---

### Captain Tools

**[PICTURE PLACEHOLDER — Captain team management screen]**

Captains get dedicated management tools:

- **Team Management Screen** — Active roster with player profiles, pending join requests banner
- **Invite Players** — Send invitations to players to join your team
- **Join Requests Screen** — Approve or deny players who have requested to join
- **Free Agent Requests** — Browse and claim free agents looking for a team
- **Superlative Nominations** — Nominate teammates for end-of-season awards (see below)

---

### Referee Tools

**[PICTURE PLACEHOLDER — Referee score entry screen]**

- **Score Entry Screen** — Live score entry for assigned games
  - Toggle game status: Scheduled → In Progress → Final
  - Large numeric input for home/away scores
  - Confirmation before saving

---

### Admin Tab

**[PICTURE PLACEHOLDER — Admin dashboard tab on mobile]**

- Full admin dashboard on mobile for Managers and above
- KPI stats, season overviews, quick navigation

---

## 5. Bonus Features vs. Sports Engine

The features below are **not available** in the standard Sports Engine web or mobile platform. They are unique to the Hotmess Sports platform and directly reflect the brand's social, community-first identity.

---

### ⭐ Superlatives — Voting & Nominations System

**[PICTURE PLACEHOLDER — Superlative voting screen on mobile]**

> **Sports Engine has nothing like this.**

At the end of each season, players can **nominate and vote on fun end-of-season awards** for their teammates. Categories include:

| Award | Description |
|---|---|
| **MVP** | Most Valuable Player |
| **Best Dressed** | Always looking fly on game day |
| **Most Spirited** | Brings the most energy |
| **Best Teammate** | Always has your back |
| **Most Improved** | Biggest glow-up this season |
| **Party MVP** | Life of the after-party |

- Nominations are **anonymous** — no social pressure
- Captains submit nominations; all players vote
- Keeps the platform fun and social beyond just wins and losses

---

### ⭐ In-App Messaging with Channel Types

**[PICTURE PLACEHOLDER — Messages screen showing grouped channel types]**

> **Sports Engine mobile messaging is basic push notifications only — no in-app group messaging.**

- Full in-app messaging across **5 channel types**: Announcements, Team, Captain, Referee, Direct
- Role-gated channels — referees see referee chats, captains see captain chats, etc.
- Unread badges keep players engaged
- Replaces the need for separate GroupMe/WhatsApp group chats

---

### ⭐ Free Agent System

**[PICTURE PLACEHOLDER — Free agents screen on mobile]**

> **Sports Engine does not have a native free agent marketplace.**

- Players without a team can register as **free agents**
- Captains can browse and recruit free agents directly through the app
- Reduces the friction of assembling teams and increases signup conversion

---

### ⭐ Fully Branded, Custom Platform (No Sports Engine Branding)

**[PICTURE PLACEHOLDER — Web homepage with Hotmess branding]**

> **Sports Engine puts their logo and branding on all league websites.**

- The Hotmess Sports platform is **100% custom-branded**
- No third-party platform logos or generic templates
- The web app, admin portal, and mobile app all reflect the Hotmess brand identity consistently
- Custom sport icons, color palette, and tone of voice throughout

---

### ⭐ Granular Role & Permission System

**[PICTURE PLACEHOLDER — Permissions manager page]**

> **Sports Engine has limited role differentiation — primarily admin vs. team manager.**

Six distinct roles with fine-grained access control:

| Role | Access |
|---|---|
| **Admin** | Everything — all cities, sports, permissions |
| **Commissioner** | City-level: leagues, seasons, teams, notifications |
| **Manager** | Season-level: schedules, teams |
| **Referee** | Schedules and score entry |
| **Team Captain** | Team roster, join requests, invites, nominations |
| **Player** | Their teams, schedule, messages |

---

### ⭐ Preferred Name Support

> **Sports Engine does not have a preferred name field — players are listed by legal name only.**

- Players can set a **preferred name** that is used throughout the app
- Greetings, roster displays, and profile views all respect this setting
- Inclusive and personal — important for a welcoming recreational community

---

*End of document — add screenshots to each placeholder before presenting.*
