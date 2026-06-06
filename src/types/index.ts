export type MoonLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type VisibilityState = 'visible' | 'hidden';
export type CloudSource = 'api' | 'mock';

export interface WeatherData {
  cloudCoverPercentage: number;
  humidity: number;
  windSpeed: number;
  description: string;
  icon: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
  displayName: string;
}

export interface GalacticCenterTime {
  rise: string;
  set: string;
}

export interface DayData {
  id: string;
  date: number;
  isHoliday: boolean;
  moonLevel: MoonLevel;
  moonPercentage: number;
  cloudCoverPercentage: number;
  cloudSource: CloudSource;
  weather: WeatherData | null;
  galacticCenter: GalacticCenterTime | null;
  visibility: VisibilityState;
}

export interface CalendarMonth {
  year: number;
  month: number;
  days: DayData[];
}

export interface AppSettings {
  latitude: number;
  longitude: number;
  timezone: string;
  useGPS: boolean;
  weatherApiKey: string;
}
