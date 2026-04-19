import { create } from 'zustand';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { auth } from '../lib/firebase';

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // 앱 시작 시 인증 상태 초기화
  onAuthStateChanged(auth, (user) => {
    set({ user, loading: false, initialized: true });
  });

  return {
    user: null,
    loading: true,
    initialized: false,

    signUpWithEmail: async (email: string, password: string) => {
      set({ loading: true });
      try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        set({ user: result.user, loading: false });
      } catch (error) {
        set({ loading: false });
        throw error;
      }
    },

    signInWithEmail: async (email: string, password: string) => {
      set({ loading: true });
      try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        set({ user: result.user, loading: false });
      } catch (error) {
        set({ loading: false });
        throw error;
      }
    },

    signOut: async () => {
      set({ loading: true });
      try {
        await firebaseSignOut(auth);
        set({ user: null, loading: false });
      } catch (error) {
        set({ loading: false });
        throw error;
      }
    },

    initializeAuth: () => {
      // onAuthStateChanged가 자동으로 처리하므로 실제로는 필요 없음
    },
  };
});
