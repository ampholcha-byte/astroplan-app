# AstroPlan — Master Overview

## Project Overview

- **Name:** AstroPlan
- **Description:** A responsive web application for planning Milky Way astrophotography. Users enter a place name to get coordinates, then view a monthly calendar showing optimal shooting conditions including moon phase, galactic center timing, and cloud cover.
- **Target Users:** Beginner astrophotographers who want to know which days are suitable for shooting the Milky Way.

## Tech Stack & Architecture

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (mobile-first responsive, works on mobile + desktop)
- **Astronomical Calculations:** `suncalc` (moon phases) + custom Galactic Center formula
- **Geocoding:** OpenStreetMap Nominatim API (free, no API key required)
- **Cloud Cover Data:** Mock random data (Phase 1), real weather API (Phase 2)
- **UI Language:** English
- **Offline/PWA:** Not required (online only)

## Folder Structure

```
astroplan/
├── src/
│   ├── app/
│   │   ├── page.tsx             # Main Calendar Page
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── LocationSearch.tsx   # Place name input + geocoding
│   │   ├── CalendarGrid.tsx     # 7-column grid wrapper
│   │   ├── DayCell.tsx          # Individual day component
│   │   ├── PathGraphic.tsx      # SVG/CSS graphic for E S W path
│   │   └── DayDetailsModal.tsx  # Modal with extended details
│   ├── data/
│   │   └── mockCalendarData.ts  # Hardcoded mock data
│   ├── lib/
│   │   ├── astro.ts             # Astronomical calculation utilities
│   │   └── geocoding.ts         # Nominatim geocoding helper
│   └── types/
│       └── index.ts             # TypeScript interfaces
└── docs/planning/               # Planning Documents
```

## Global Data Model

```typescript
// src/types/index.ts

export type MoonIllumination = 'dark' | 'medium' | 'bright';
export type VisibilityState = 'visible' | 'hidden';

export interface Coordinates {
  lat: number;
  lng: number;
  displayName: string; // e.g., "Chiang Mai, Thailand"
}

export interface GalacticCenterTime {
  rise: string;  // e.g., "18:30"
  set: string;   // e.g., "05:15"
}

export interface DayData {
  id: string;           // YYYY-MM-DD
  date: number;         // 1-31
  isHoliday: boolean;
  moonIllumination: MoonIllumination;
  moonPercentage: number;       // 0-100
  cloudCoverPercentage: number; // 0-100 (mock in Phase 1)
  galacticCenter: GalacticCenterTime | null;
  visibility: VisibilityState;
}

export interface CalendarMonth {
  year: number;
  month: number;        // 0-11
  days: DayData[];
}
```

## Global Rules

- **Mobile-First Responsive:** Design for mobile screens first, but must also work on desktop.
- **Online Only:** No offline/PWA support required.
- **Geographic Scope:** Thailand as the initial boundary. Expand globally in Phase 2.
- **Error Handling:** Use inline error messages (no toast notifications).
- **No Real Connections in Phase 1:** Mock data for cloud cover. Real weather API in Phase 2.
- **No Notifications in Phase 1:** Notification system deferred to Phase 2.
