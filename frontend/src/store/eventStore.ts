import { create } from 'zustand';
import type { Event, Settings } from '../types/event';
import { v4 as uuidv4 } from 'uuid';
import {
  addEventToFirestore,
  updateEventInFirestore,
  deleteEventFromFirestore,
  subscribeUserEvents,
} from '../lib/firestoreService';
import { getAlarmTime, getPushAlarmFields } from '../utils/alarm';

// 서버 푸시 필드(alarmAt)가 없는 기존 알람 일정을 한 번 채워 넣을 때 중복 쓰기 방지
const backfillingIds = new Set<string>();

interface EventStore {
  events: Event[];
  settings: Settings;
  selectedDate: string;
  currentUserId: string | null;
  firestoreUnsubscribe: (() => void) | null;
  eventOrder: Record<string, string[]>; // date → ordered event IDs

  // Event 관련 함수
  addEvent: (event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateEvent: (id: string, event: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
  getEventsByDate: (date: string) => Event[];
  getEventsByMonth: (year: number, month: number) => Event[];
  reorderEvents: (date: string, fromIndex: number, toIndex: number) => void;

  // 날짜 관련 함수
  setSelectedDate: (date: string) => void;

  // Settings 관련 함수
  updateSettings: (settings: Partial<Settings>) => void;

  // 저장소 관련 함수
  loadFromStorage: () => void;
  saveToStorage: () => void;
  setEvents: (events: Event[]) => void;

  // Firebase 관련 함수
  initializeFirestoreSync: (uid: string) => void;
  clearFirestoreSync: () => void;
}

const DEFAULT_SETTINGS: Settings = {
  theme: 'pastelGray',
  alarmEnabled: true,
  fontFamily: 'default',
};

// 설정은 바뀔 때마다 별도 키에 즉시 저장 (로그인 상태에서도 앱을 다시 열면 유지)
const SETTINGS_KEY = 'raraCalendarSettings';

const getInitialSettings = (): Settings => {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    // 이전 버전은 raraCalendarData 안에 settings를 함께 저장했음
    const legacy = localStorage.getItem('raraCalendarData');
    const settings = stored ? JSON.parse(stored) : legacy ? JSON.parse(legacy).settings : null;
    if (settings) return { ...DEFAULT_SETTINGS, ...settings };
  } catch {
    // 저장값이 깨졌으면 기본값 사용
  }
  return { ...DEFAULT_SETTINGS };
};

export const useEventStore = create<EventStore>((set, get) => ({
  events: [],
  settings: getInitialSettings(),
  selectedDate: new Date().toISOString().split('T')[0],
  currentUserId: null,
  firestoreUnsubscribe: null,
  eventOrder: {},

  addEvent: (event) => {
    const newEvent: Event = {
      ...event,
      ...getPushAlarmFields(event),
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((state) => ({
      events: [...state.events, newEvent],
    }));

    // Firestore에도 저장 (사용자가 로그인한 경우)
    const { currentUserId } = get();
    if (currentUserId) {
      addEventToFirestore(currentUserId, newEvent).catch((err) =>
        console.error('Error adding event to Firestore:', err)
      );
    }
  },

  updateEvent: (id, updates) => {
    // 알람 관련 값이 바뀌면 서버 푸시 필드도 다시 계산
    const prev = get().events.find((event) => event.id === id);
    const alarmFields = prev ? getPushAlarmFields({ ...prev, ...updates }, prev) : {};
    const changes = {
      ...updates,
      ...alarmFields,
      updatedAt: new Date().toISOString(),
    };

    set((state) => ({
      events: state.events.map((event) =>
        event.id === id
          ? {
              ...event,
              ...changes,
            }
          : event
      ),
    }));

    // Firestore에도 업데이트
    const { currentUserId } = get();
    if (currentUserId) {
      updateEventInFirestore(currentUserId, id, changes)
        .catch((err) => console.error('Error updating event in Firestore:', err));
    }
  },

  deleteEvent: (id) => {
    set((state) => ({
      events: state.events.filter((event) => event.id !== id),
    }));

    // Firestore에서도 삭제
    const { currentUserId } = get();
    if (currentUserId) {
      deleteEventFromFirestore(currentUserId, id).catch((err) =>
        console.error('Error deleting event from Firestore:', err)
      );
    }
  },

  getEventsByDate: (date) => {
    const { events } = get();
    return events.filter((event) => event.date === date);
  },

  getEventsByMonth: (year, month) => {
    const { events } = get();
    return events.filter((event) => {
      const [eventYear, eventMonth] = event.date.split('-').map(Number);
      return eventYear === year && eventMonth === month;
    });
  },

  setSelectedDate: (date) => set({ selectedDate: date }),

  updateSettings: (updates) => {
    set((state) => ({
      settings: {
        ...state.settings,
        ...updates,
      },
    }));
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(get().settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  },

  reorderEvents: (date, fromIndex, toIndex) => {
    const { events, eventOrder } = get();
    const dateEvents = events.filter(e => e.date === date);
    const currentOrder = eventOrder[date] || dateEvents.map(e => e.id);

    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 ||
        fromIndex >= currentOrder.length || toIndex >= currentOrder.length) return;

    const newOrder = [...currentOrder];
    const [moved] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, moved);

    const newEventOrder = { ...eventOrder, [date]: newOrder };
    set({ eventOrder: newEventOrder });
    try {
      localStorage.setItem('raraCalendarEventOrder', JSON.stringify(newEventOrder));
    } catch {}
  },

  loadFromStorage: () => {
    try {
      const stored = localStorage.getItem('raraCalendarData');
      const orderStored = localStorage.getItem('raraCalendarEventOrder');
      if (stored) {
        const { events } = JSON.parse(stored);
        const eventOrder = orderStored ? JSON.parse(orderStored) : {};
        set({
          events: events || [],
          settings: getInitialSettings(),
          eventOrder,
        });
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  },

  saveToStorage: () => {
    try {
      const { events, settings } = get();
      localStorage.setItem(
        'raraCalendarData',
        JSON.stringify({ events, settings })
      );
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },

  setEvents: (events) => set({ events }),

  initializeFirestoreSync: (uid) => {
    // 기존 리스너 해제
    const { firestoreUnsubscribe } = get();
    if (firestoreUnsubscribe) {
      firestoreUnsubscribe();
    }

    set({ currentUserId: uid });

    // Firestore 실시간 리스너 등록
    const unsubscribe = subscribeUserEvents(
      uid,
      (events) => {
        set({ events });

        // 푸시 기능 이전에 만든 알람 일정에 alarmAt 채우기 (필드가 없을 때만, 1회)
        events.forEach((event) => {
          if (event.alarmAt !== undefined || backfillingIds.has(event.id)) return;
          if (!getAlarmTime(event)) return;
          backfillingIds.add(event.id);
          updateEventInFirestore(uid, event.id, getPushAlarmFields(event))
            .catch((err) => console.error('Error backfilling alarmAt:', err))
            .finally(() => backfillingIds.delete(event.id));
        });
      },
      (error) => {
        console.error('Error syncing events:', error);
      }
    );

    set({ firestoreUnsubscribe: unsubscribe });
  },

  clearFirestoreSync: () => {
    const { firestoreUnsubscribe } = get();
    if (firestoreUnsubscribe) {
      firestoreUnsubscribe();
    }
    set({
      currentUserId: null,
      firestoreUnsubscribe: null,
      events: [],
    });
  },
}));
