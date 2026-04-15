declare module 'lunar-calendar' {
  export interface LunarDate {
    lunarYear: number;
    lunarMonth: number;
    lunarDay: number;
    isLeapMonth: boolean;
    solarYear: number;
    solarMonth: number;
    solarDay: number;
  }

  export class Lunar {
    static fromSolar(year: number, month: number, day: number): LunarDate | null;
    static fromLunar(year: number, month: number, day: number, isLeapMonth?: boolean): LunarDate | null;
  }
}
