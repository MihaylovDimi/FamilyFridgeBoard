import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import type { Member, Theme, UserProfile } from '../types';

// ─── State Shape ──────────────────────────────────────────────────────────────

interface AuthState {
  // Firebase user (null when not logged in)
  uid: string | null;
  email: string | null;
  displayName: string | null;

  // Family context
  familyId: string | null;
  familyName: string | null;
  members: Member[];

  // UI
  theme: Theme;
  appReady: boolean; // true once Firebase auth state has been checked

  // Actions
  setUser: (profile: UserProfile | null) => void;
  setFamily: (id: string, name: string) => void;
  clearFamily: () => void;
  setMembers: (members: Member[]) => void;
  setTheme: (theme: Theme) => void;
  setAppReady: () => void;
  logout: () => Promise<void>;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      uid: null,
      email: null,
      displayName: null,
      familyId: null,
      familyName: null,
      members: [],
      theme: 'dark',
      appReady: false,

      setUser: (profile) =>
        set(
          profile
            ? {
                uid: profile.uid,
                email: profile.email,
                displayName: profile.name,
                familyId: profile.familyId ?? null,
                familyName: profile.familyName ?? null,
              }
            : {
                uid: null,
                email: null,
                displayName: null,
                familyId: null,
                familyName: null,
                members: [],
              }
        ),

      setFamily: (id, name) =>
        set({ familyId: id, familyName: name }),

      clearFamily: () =>
        set({ familyId: null, familyName: null, members: [] }),

      setMembers: (members) => set({ members }),

      setTheme: (theme) => {
        document.documentElement.dataset.theme = theme;
        set({ theme });
      },

      setAppReady: () => set({ appReady: true }),

      logout: async () => {
        await signOut(auth);
        set({
          uid: null,
          email: null,
          displayName: null,
          familyId: null,
          familyName: null,
          members: [],
        });
      },
    }),
    {
      name: 'ffb-auth',
      // Only persist theme and familyId — everything else re-hydrates from Firebase
      partialize: (state) => ({
        theme: state.theme,
        familyId: state.familyId,
        familyName: state.familyName,
      }),
      onRehydrateStorage: () => (state) => {
        // Apply persisted theme on load
        if (state?.theme) {
          document.documentElement.dataset.theme = state.theme;
        }
      },
    }
  )
);
