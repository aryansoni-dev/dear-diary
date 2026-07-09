# DearDiary

![DearDiary app cover](assets/images/github-cover.png)

DearDiary is a mindful, AI-assisted journaling app built with Expo and React
Native. It helps people capture their thoughts, track emotional patterns, and
build a consistent reflection practice in a calm, private space.

> DearDiary is under active development and is being prepared for an Android
> release.

## Features

- **Smart journaling** — create, edit, organize, search, and revisit entries.
- **Mood check-ins** — record emotions and see how moods change over time.
- **Guided reflection** — use thoughtful prompts when you need help getting
  started.
- **AI reflections** — receive entry summaries and follow-up questions.
- **Journal chat** — explore themes and patterns across past entries.
- **Personal insights** — view weekly and monthly mood and journaling trends.
- **History and calendar** — browse activity by date, mood, and tags.
- **Streaks and achievements** — build a steady journaling habit.
- **Privacy controls** — protect the app with biometrics or a PIN, export your
  data, and manage account deletion.
- **Offline-friendly experience** — keep writing with local persistence and
  synchronize supported data when connectivity returns.

## Tech Stack

- Expo and React Native
- TypeScript
- Expo Router
- NativeWind
- Zustand with AsyncStorage
- Clerk authentication
- Supabase

## Project Structure

```text
dear-diary/
├── app/                 # Expo Router screens and route layouts
│   ├── (auth)/          # Authentication flow
│   ├── (onboarding)/    # First-time user experience
│   ├── (tabs)/          # Main app tabs
│   ├── journal/         # Journal entry routes
│   ├── insights/        # Insight report routes
│   ├── settings/        # Privacy and app-lock settings
│   └── legal/           # In-app legal screens
├── assets/              # App images, icons, and animations
├── components/          # Reusable UI grouped by feature
├── constants/           # Shared theme, mood, and asset constants
├── content/             # Static app content
├── data/                # Typed local and mock data
├── hooks/               # Reusable React hooks
├── lib/                 # Services, storage, sync, and utilities
├── navigation/          # Shared navigation configuration
├── providers/           # App-level React providers
├── store/               # Zustand state stores
├── supabase/            # Database migrations and server-side functions
├── tests/               # Automated tests and fixtures
└── types/               # Shared TypeScript types
```

<!-- ## Getting Started

### Prerequisites

- Node.js LTS
- npm
- An Expo-compatible Android or iOS development environment

### Installation

```bash
git clone <your-fork-or-repository-url>
cd dear-diary
npm install
cp .env.example .env
```

Add your own development values to `.env`. Never commit local environment
files, signing credentials, service-account files, or server-side secrets.

Run the development server manually when you are ready:

```bash
npm start
```

## Available Commands

```bash
npm start       # Start Expo
npm run android # Run the Android native project
npm run ios     # Run the iOS native project
npm run web     # Run the web build
npm run lint    # Check code quality
``` -->

## Privacy and Security

Journal content is sensitive by nature. The project keeps privileged
credentials out of the mobile client, provides local privacy controls, and
routes protected operations through server-side services. Public environment
variables must never contain private or administrative credentials.

## Project Status

DearDiary is not yet a finished public release. Features, screenshots, and
behavior may change as development continues.
