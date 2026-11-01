# Day24 — 24-Hour Time Tracking & Productivity App

A production-quality, mobile-first time tracking app built with **React Native**, **Expo**, and **Supabase**.

> Visualize and understand how you spend your 24 hours.

---

## Prerequisites

Before running the project, make sure you have:

- **Node.js** 18+ installed ([nodejs.org](https://nodejs.org))
- **npm** (comes with Node.js)
- A free **Supabase** account ([supabase.com](https://supabase.com))
- Optional: **Expo Go** app on your Android phone for device testing

---

## How to Run This Project

### Step 1 — Install dependencies

Open a terminal in the project folder and run:

```bash
npm install
```

### Step 2 — Create a Supabase project

1. Go to [https://supabase.com](https://supabase.com) and create a new project
2. Wait until the project finishes setting up
3. Open **Project Settings → API**
4. Copy:
   - **Project URL**
   - **anon public** key

### Step 3 — Create the `.env` file

In the project root, create a file named `.env` (you can copy from `.env.example`):

```bash
cp .env.example .env
```

Put your Supabase values in `.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

### Step 4 — Run the database migration

1. Open your Supabase project
2. Go to **SQL Editor**
3. Open the file `supabase/migrations/001_initial_schema.sql` from this project
4. Copy **all** of its contents into the SQL Editor
5. Click **Run**

This creates tables, relationships, default categories, and Row Level Security.

Optional (if you already had users while email confirm was on):

1. Also run `supabase/migrations/002_disable_email_confirm_existing_users.sql`

### Step 5 — Disable email verification (important)

So signup/login work without verifying email:

1. Supabase Dashboard → **Authentication** → **Providers** → **Email**
2. Turn **OFF** **Confirm email**
3. Save

### Step 6 — Start the app

```bash
npm start
```

Then choose how to open it:

| Command | What it does |
|---------|----------------|
| `npm start` | Starts Expo. Scan QR with Expo Go, or press `a` / `w` |
| `npm run android` | Opens on Android emulator / connected device |
| `npm run web` | Opens in browser at `http://localhost:8081` |
| `npm run ios` | Opens on iOS simulator (macOS only) |

**Tips:**

- After changing `.env`, stop the server (`Ctrl + C`) and run `npm start` again
- If the browser shows a blank page, hard refresh with `Ctrl + Shift + R`
- First signup opens the onboarding flow, then the Today screen

---

## Quick Start (summary)

```bash
# 1. Install
npm install

# 2. Add env vars
cp .env.example .env
# Edit .env with your Supabase URL + anon key

# 3. Run SQL in Supabase SQL Editor:
#    supabase/migrations/001_initial_schema.sql

# 4. Disable Confirm email in Supabase Auth → Providers → Email

# 5. Start
npm start
# or
npm run web
# or
npm run android
```

---

## Features

### MVP (Phase 1)
- Email/password authentication
- User onboarding flow
- 24-hour vertical timeline with variable-duration blocks
- Quick activity logging with suggestions
- Category management (16 default + custom)
- Monthly calendar with day summaries
- Daily analytics with category breakdown
- To-do list with priorities
- Profile & settings

### Phase 2
- Goals with automatic progress tracking
- Weekly & monthly analytics
- Productivity scoring
- Overlap detection for activities

### Phase 3
- Rule-based insights engine
- Activity search
- Live activity timer
- Notification settings
- Streaks

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React Native, Expo SDK 57, TypeScript |
| Navigation | Expo Router |
| Backend | Supabase (Auth, PostgreSQL, RLS) |
| State | Zustand |
| Charts | react-native-gifted-charts |
| Dates | date-fns |

## Project Structure

```
app/                  # Expo Router screens
  (auth)/             # Login, signup, forgot password
  (onboarding)/       # Multi-step onboarding
  (tabs)/             # Main tab navigation
  activity/           # Add/edit activities
  task/               # Task management
  goal/               # Goals
  settings/           # Categories, notifications
components/           # Reusable UI components
services/             # Supabase API calls
store/                # Zustand state stores
utils/                # Time, analytics, validation
types/                # TypeScript definitions
supabase/             # Database migrations
```

## Database Schema

- **profiles** — User profile and onboarding state
- **categories** — Activity categories with icons/colors
- **activities** — Time blocks with start/end times
- **tasks** — To-do items with scheduling
- **goals** — Time-based goals with progress
- **planned_blocks** — Daily planning
- **notification_settings** — Reminder preferences
- **activity_suggestions** — Quick-log memory

All tables have Row Level Security (RLS) enabled.

## Building for Android

```bash
npm install -g eas-cli
eas build:configure
eas build --platform android --profile preview
eas build --platform android --profile production
```

## License

MIT
