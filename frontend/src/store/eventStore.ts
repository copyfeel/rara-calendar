import { create } from 'zustand';
import type { Event, Settings } from '../types/event';
import { v4 as uuidv4 } from 'uuid';

interface EventStore {
  events: Event[];
  settings: Settings;
  selectedDate: string;

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

  addEvent: (event) => set((state) => {
    const newEvent: Event = {
      ...event,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return {
      events: [...state.events, newEvent],
    };
  }),

  updateEvent: (id, updates) => set((state) => ({
    events: state.events.map((event) =>
      event.id === id
        ? {
            ...event,
            ...updates,
            updatedAt: new Date().toISOString(),
          }
        : event
    ),
  })),

  deleteEvent: (id) => set((state) => ({
    events: state.events.filter((event) => event.id !== id),
  })),

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
}));
