import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  role: string | null;
  tempToken: string | null;
  setTokens: (accessToken: string, refreshToken: string, role?: string) => void;
  setTempToken: (token: string) => void;
  clearTempToken: () => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      role: null,
      tempToken: null,
      setTokens: (accessToken, refreshToken, role) =>
        set({ accessToken, refreshToken, role: role ?? get().role, tempToken: null }),
      setTempToken: (token) => set({ tempToken: token }),
      clearTempToken: () => set({ tempToken: null }),
      logout: () => {
        set({ accessToken: null, refreshToken: null, role: null, tempToken: null });
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
        role: state.role,
        tempToken: state.tempToken,
      }),
    }
  )
);
