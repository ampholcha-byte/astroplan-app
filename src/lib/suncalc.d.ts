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
  }

  export function getMoonIllumination(date: Date): MoonIllumination;
  export function getTimes(date: Date, lat: number, lng: number): SunTimes;
}
