declare module 'suncalc' {
  export interface MoonIllumination {
    fraction: number;
    phase: number;
    angle: number;
  }

  export interface SunTimes {
    sunrise: Date;
    sunriseEnd: Date;
    goldenHourEnd: Date;
    solarNoon: Date;
    goldenHour: Date;
    sunsetStart: Date;
    sunset: Date;
    dusk: Date;
    nauticalDusk: Date;
    night: Date;
    nightEnd: Date;
    nauticalDawn: Date;
  }

  export interface SunPosition {
    azimuth: number;
    altitude: number;
  }

  export interface MoonTimes {
    rise?: Date;
    set?: Date;
  }

  export function getMoonTimes(date: Date, lat: number, lng: number): MoonTimes;

  export function getMoonIllumination(date: Date): MoonIllumination;
  export function getTimes(date: Date, lat: number, lng: number): SunTimes;
  export function getPosition(date: Date, lat: number, lng: number): SunPosition;
}
