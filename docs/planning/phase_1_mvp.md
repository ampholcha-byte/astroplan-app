# Phase 1: MVP

## Scope & User Stories

- As a user, I can enter a place name and get its coordinates via geocoding.
- As a user, I can view a monthly calendar for any month (working `<` `>` navigation).
- As a user, I can see each day cell colored by moon illumination (Yellow=Bright, Olive=Medium, Dark Gray=Dark).
- As a user, I can see the Galactic Center rise time (green dot) and set time (red dot).
- As a user, I can see a visual curve representing the E S W path.
- As a user, I can see the cloud cover percentage for each day (mock data).
- As a user, I can tap a day cell to open a modal showing extended details.
- As a user, I can use the app on both mobile and desktop browsers.

## Pages & Screens

- **Path:** `/` (Home)
- **Components:**
  - **LocationSearch:** Text input for place name → calls Nominatim API → displays coordinates. Shows inline error if location not found or API fails.
  - **Header:** Month/Year display with working `<` and `>` navigation arrows.
  - **Grid:** 7 columns (Sun–Sat), responsive.
  - **DayCell:** Background color by moon illumination, green/red dots for GC times, cloud %, E S W path graphic.
  - **Empty State Day Cell:** Large "X" in the middle for hidden visibility days.
  - **DayDetailsModal:** Opens on tap, shows moon %, cloud %, weather pattern, GC times. Close button.

## Task Breakdown

### Milestone 1: Setup & Types

- **Action:** Initialize Next.js project with Tailwind CSS. Create folder structure. Define TypeScript interfaces in `src/types/index.ts`. Create `src/lib/astro.ts` with suncalc integration and Galactic Center calculation. Create `src/lib/geocoding.ts` with Nominatim helper.
- **Expected Output:** Project compiles. TypeScript interfaces defined. Astro and geocoding utilities ready.

### Milestone 2: Mock Data Implementation

- **Action:** Create `src/data/mockCalendarData.ts`. Generate an array of 35 days (5 weeks) of `DayData` covering edge cases: dark/medium/bright moon, holidays, hidden days, varying cloud cover %.
- **Expected Output:** TypeScript file exporting mock data ready for UI consumption.

### Milestone 3: Frontend — Location Search & Calendar Layout

- **Action:** Implement `LocationSearch.tsx` with geocoding integration and inline error handling. Implement `CalendarGrid.tsx` and main `page.tsx`. Build the header with working month navigation (`<` `>` arrows that recalculate the calendar). Build the 7-column CSS Grid.
- **Expected Output:** User can search a place name and see coordinates. Month navigation works. Grid renders with mock data.

### Milestone 4: Frontend — Day Cell & SVG Graphic

- **Action:** Implement `DayCell.tsx` and `PathGraphic.tsx`. Tailwind for background colors, holiday ribbon, positioning. SVG/Plain CSS for the curved E S W path. Implement empty/hidden state (Big X). Show cloud cover %.
- **Expected Output:** Day cells render with correct conditional rendering for moon states, GC times, cloud %, and path graphics.

### Milestone 5: Frontend — Interaction & Modal

- **Action:** Implement `DayDetailsModal.tsx`. Add `onClick` to `DayCell` to trigger modal, passing `DayData` for extended details.
- **Expected Output:** Tapping a cell opens a modal displaying mock details. Modal closes cleanly.

## Acceptance Criteria

- [ ] Location search returns coordinates via Nominatim; inline error on failure.
- [ ] Month navigation (`<` `>`) works and recalculates the calendar.
- [ ] 7-column grid displays correctly on mobile and desktop.
- [ ] 3 background colors render properly based on moon illumination.
- [ ] Galactic Center rise/set times display (green/red dots).
- [ ] Cloud cover % displays on each day cell.
- [ ] SVG/CSS E S W path curve is visible and correctly aligned.
- [ ] Modal opens and closes without error.
- [ ] Responsive layout works on both mobile and desktop.
