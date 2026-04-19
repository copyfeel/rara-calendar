import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Event } from '../types/event';

const EVENTS_COLLECTION = 'events';

// 실시간 이벤트 리스너
export const subscribeUserEvents = (
  uid: string,
  callback: (events: Event[]) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  const eventsRef = collection(db, `users/${uid}/${EVENTS_COLLECTION}`);

  return onSnapshot(
    eventsRef,
    (snapshot) => {
      const events: Event[] = [];
      snapshot.forEach((doc) => {
        events.push(doc.data() as Event);
      });
      // 날짜순 정렬
      events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      callback(events);
    },
    (error) => {
      console.error('Error subscribing to events:', error);
      onError?.(error as Error);
    }
  );
};

// 이벤트 추가
export const addEventToFirestore = async (uid: string, event: Event): Promise<void> => {
  try {
    const eventRef = doc(db, `users/${uid}/${EVENTS_COLLECTION}`, event.id);
    await setDoc(eventRef, event);
  } catch (error) {
    console.error('Error adding event:', error);
    throw error;
  }
};

// 이벤트 수정
export const updateEventInFirestore = async (
  uid: string,
  eventId: string,
  updates: Partial<Event>
): Promise<void> => {
  try {
    const eventRef = doc(db, `users/${uid}/${EVENTS_COLLECTION}`, eventId);
    await updateDoc(eventRef, updates);
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
};

// 이벤트 삭제
export const deleteEventFromFirestore = async (uid: string, eventId: string): Promise<void> => {
  try {
    const eventRef = doc(db, `users/${uid}/${EVENTS_COLLECTION}`, eventId);
    await deleteDoc(eventRef);
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};

// 로컬 데이터를 Firestore로 마이그레이션 (초기 1회)
export const migrateLocalEventsToFirestore = async (
  uid: string,
  events: Event[]
): Promise<void> => {
  try {
    // 각 이벤트를 개별적으로 저장
    const promises = events.map((event) =>
      setDoc(doc(db, `users/${uid}/${EVENTS_COLLECTION}`, event.id), event)
    );

    await Promise.all(promises);
    console.log(`Migrated ${events.length} events to Firestore`);
  } catch (error) {
    console.error('Error migrating events:', error);
    throw error;
  }
};
