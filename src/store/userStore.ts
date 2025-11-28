'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, WorldIDVerification } from '@/types';

interface UserState {
  user: User | null;
  worldIdVerification: WorldIDVerification | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  _hasHydrated: boolean;
  
  // Actions
  setUser: (user: User) => void;
  updateUser: (updates: Partial<User>) => void;
  setWorldIdVerification: (verification: WorldIDVerification) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  clearError: () => void;
  setHasHydrated: (hasHydrated: boolean) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      worldIdVerification: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      _hasHydrated: false,

      setUser: (user: User) => {
        console.log('🔹 setUser called with:', user);
        set({
          user,
          isAuthenticated: true,
          error: null,
        });
        console.log('🔹 After setUser, state:', get());
      },

      updateUser: (updates: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...updates },
          });
        }
      },

      setWorldIdVerification: (verification: WorldIDVerification) => {
        console.log('🔹 setWorldIdVerification called with:', verification);
        set({
          worldIdVerification: verification,
        });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      logout: () => {
        console.log('🔹 logout called');
        set({
          user: null,
          worldIdVerification: null,
          isAuthenticated: false,
          error: null,
        });
      },

      clearError: () => {
        set({ error: null });
      },

      setHasHydrated: (hasHydrated: boolean) => {
        set({ _hasHydrated: hasHydrated });
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => {
        // Only use localStorage if we're in the browser
        if (typeof window !== 'undefined') {
          return localStorage;
        }
        // Return a no-op storage for SSR
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      partialize: (state) => ({
        user: state.user,
        worldIdVerification: state.worldIdVerification,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        console.log('🔹 Hydration finished, state:', state);
        state?.setHasHydrated(true);
      },
    }
  )
);
