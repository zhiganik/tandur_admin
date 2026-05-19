import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RestaurantState {
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  clear: () => void;
}

export const useRestaurantStore = create<RestaurantState>()(
  persist(
    (set) => ({
      selectedId: null,
      setSelectedId: (id) => set({ selectedId: id }),
      clear: () => set({ selectedId: null }),
    }),
    {
      name: 'tandur-restaurant',
      skipHydration: true,
      partialize: (state) => ({ selectedId: state.selectedId }),
    }
  )
);
