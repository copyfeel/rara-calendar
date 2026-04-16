export interface Event {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  category: 'Work' | 'Personal' | 'Event' | 'Other';
  alarm: number; // 분 단위
  alarmEnabled?: boolean; // 알람 활성화 여부
  useTime?: boolean; // 시간 입력 여부
  isAllDay?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  theme: 'pastelGray' | 'light' | 'dark';
  alarmEnabled: boolean;
  fontFamily: string;
}

export interface StorageData {
  events: Event[];
  settings: Settings;
}
