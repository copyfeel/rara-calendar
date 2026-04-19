export interface Event {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  category: '업무' | '카피' | 'Event' | '가족' | '예주' | '마님';
  alarm: number; // 분 단위
  alarmEnabled?: boolean;  // 알람 활성화 여부
  useTime?: boolean;       // 시간 입력 여부
  useCategory?: boolean;   // 카테고리 설정 여부
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
