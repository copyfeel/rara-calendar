import { create } from 'zustand';
import type { Event, Settings } from '../types/event';
import { v4 as uuidv4 } from 'uuid';
import {
  addEventToFirestore,
  updateEventInFirestore,
  deleteEventFromFirestore,
  subscribeUserEvents,
} from '../lib/firestoreService';

interface EventStore {
  events: Event[];
  settings: Settings;
  selectedDate: string;
  currentUserId: string | null;
  firestoreUnsubscribe: (() => void) | null;

  // Event 관련 함수
  addEvent: (event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateEvent: (id: string, event: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
  getEventsByDate: (date: string) => Event[];
  getEventsByMonth: (year: number, month: number) => Event[];

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

const getInitialSettings = (): Settings => ({
  theme: 'pastelGray',
  alarmEnabled: true,
  fontFamily: 'default',
});

export const useEventStore = create<EventStore>((set, get) => ({
  events: [],
  settings: getInitialSettings(),
  selectedDate: new Date().toISOString().split('T')[0],
  currentUserId: null,
  firestoreUnsubscribe: null,

  addEvent: (event) => {
    const newEvent: Event = {
      ...event,
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
    set((state) => ({
      events: state.events.map((event) =>
        event.id === id
          ? {
              ...event,
              ...updates,
              updatedAt: new Date().toISOString(),
            }
          : event
      ),
    }));

    // Firestore에도 업데이트
    const { currentUserId } = get();
    if (currentUserId) {
      updateEventInFirestore(currentUserId, id, {
        ...updates,
        updatedAt: new Date().toISOString(),
      }).catch((err) => console.error('Error updating event in Firestore:', err));
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

  updateSettings: (updates) => set((state) => ({
    settings: {
      ...state.settings,
      ...updates,
    },
  })),

  loadFromStorage: () => {
    try {
      const stored = localStorage.getItem('raraCalendarData');
      if (stored) {
        const { events, settings } = JSON.parse(stored);
        set({
          events: events || [],
          settings: settings || getInitialSettings(),
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
