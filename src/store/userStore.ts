'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, WorldIDVerification } from '@/types';

interface UserState {
  user: User | null;
  worldIdVerification: WorldIDVerification | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: User) => void;
  updateUser: (updates: Partial<User>) => void;
  setWorldIdVerification: (verification: WorldIDVerification) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  clearError: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      worldIdVerification: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setUser: (user: User) => {
        set({
          user,
          isAuthenticated: true,
          error: null,
        });
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
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({
        user: state.user,
        worldIdVerification: state.worldIdVerification,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
