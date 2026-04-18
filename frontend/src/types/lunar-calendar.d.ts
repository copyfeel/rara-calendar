declare module 'korean-lunar-calendar' {
  export interface CalendarData {
    year: number;
    month: number;
    day: number;
    intercalation?: boolean;
  }

  export default class KoreanLunarCalendar {
    setSolarDate(solarYear: number, solarMonth: number, solarDay: number): boolean;
    setLunarDate(lunarYear: number, lunarMonth: number, lunarDay: number, isIntercalation: boolean): boolean;
    getLunarCalendar(): CalendarData;
    getSolarCalendar(): CalendarData;
  }
}
