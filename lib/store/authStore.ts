import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  tempToken: string | null;
  needsSetup: boolean;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setTempToken: (token: string) => void;
  clearTempToken: () => void;
  setNeedsSetup: (value: boolean) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      tempToken: null,
      needsSetup: false,
      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken, tempToken: null }),
      setTempToken: (token) => set({ tempToken: token }),
      clearTempToken: () => set({ tempToken: null }),
      setNeedsSetup: (value) => set({ needsSetup: value }),
      logout: () => {
        set({ accessToken: null, refreshToken: null, tempToken: null, needsSetup: false });
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
        needsSetup: state.needsSetup,
      }),
    }
  )
);
