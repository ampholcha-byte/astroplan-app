import { CalendarMonth, DayData, MoonLevel } from '@/types';

function generateMockMonth(year: number, month: number): CalendarMonth {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const days: DayData[] = [];

  // Previous month padding
  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    days.push(createMockDay(year, month - 1, d, true));
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(createMockDay(year, month, d, false));
  }

  // Next month padding to fill 5 weeks (35 cells)
  const remaining = 35 - days.length;
  for (let d = 1; d <= remaining; d++) {
    days.push(createMockDay(year, month + 1, d, true));
  }

  return { year, month, days };
}

function createMockDay(
  year: number,
  month: number,
  date: number,
  isPadding: boolean
): DayData {
  const monthIdx = month < 0 ? 11 : month > 11 ? 0 : month;
  const y = month < 0 ? year - 1 : month > 11 ? year + 1 : year;
  const id = `${y}-${String(monthIdx + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;

  if (isPadding) {
    return {
      id,
      date,
      isHoliday: false,
      moonLevel: 1,
      moonPercentage: 0,
      cloudCoverPercentage: 0,
      cloudSource: 'mock',
      weather: null,
      galacticCenter: null,
      visibility: 'hidden',
    };
  }

  // Deterministic pseudo-random based on date
  const seed = date * 7 + month * 13 + year;
  const rand = ((Math.sin(seed) * 10000) % 1 + 1) % 1;

  const moonPercentage = Math.round(rand * 100);
  const moonLevel: MoonLevel =
    moonPercentage < 10 ? 1 :
    moonPercentage < 20 ? 2 :
    moonPercentage < 30 ? 3 :
    moonPercentage < 40 ? 4 :
    moonPercentage < 50 ? 5 :
    moonPercentage < 60 ? 6 :
    moonPercentage < 70 ? 7 :
    moonPercentage < 80 ? 8 :
    moonPercentage < 90 ? 9 : 10;

  const cloudCoverPercentage = Math.round(((Math.cos(seed * 2) * 10000) % 1 + 1) % 1 * 100);

  const isHoliday = date === 1 || date === 15 || date % 7 === 0;

  const visibility: 'visible' | 'hidden' = rand > 0.15 ? 'visible' : 'hidden';

  const gcRiseHour = 17 + Math.round(rand * 4);
  const gcRiseMin = Math.round(rand * 59);
  const gcSetHour = 3 + Math.round(rand * 4);
  const gcSetMin = Math.round((1 - rand) * 59);

  return {
    id,
    date,
    isHoliday,
    moonLevel,
    moonPercentage,
    cloudCoverPercentage,
    cloudSource: 'mock',
    weather: null,
    galacticCenter: visibility === 'visible'
      ? {
          rise: `${String(gcRiseHour).padStart(2, '0')}:${String(gcRiseMin).padStart(2, '0')}`,
          set: `${String(gcSetHour).padStart(2, '0')}:${String(gcSetMin).padStart(2, '0')}`,
        }
      : null,
    visibility,
  };
}

// Default: current month
const now = new Date();
export const mockCalendarData: CalendarMonth = generateMockMonth(
  now.getFullYear(),
  now.getMonth()
);

export { generateMockMonth };
