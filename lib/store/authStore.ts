import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  tempToken: string | null;
  sessionToken: string | null;
  needsVerification: boolean;
  setTokens: (accessToken: string, refreshToken: string, needsVerification?: boolean) => void;
  setTempToken: (token: string) => void;
  clearTempToken: () => void;
  setSessionToken: (token: string) => void;
  clearSessionToken: () => void;
  setNeedsVerification: (value: boolean) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      tempToken: null,
      sessionToken: null,
      needsVerification: false,
      setTokens: (accessToken, refreshToken, needsVerification = false) =>
        set({ accessToken, refreshToken, tempToken: null, sessionToken: null, needsVerification }),
      setTempToken: (token) => set({ tempToken: token }),
      clearTempToken: () => set({ tempToken: null }),
      setSessionToken: (token) => set({ sessionToken: token }),
      clearSessionToken: () => set({ sessionToken: null }),
      setNeedsVerification: (value) => set({ needsVerification: value }),
      logout: () => {
        set({ accessToken: null, refreshToken: null, tempToken: null, sessionToken: null, needsVerification: false });
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      },
      isAuthenticated: () => !!get().accessToken,
    }),
    {
      name: 'tandur-auth',
      skipHydration: true,
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        tempToken: state.tempToken,
        sessionToken: state.sessionToken,
        needsVerification: state.needsVerification,
      }),
    }
  )
);
