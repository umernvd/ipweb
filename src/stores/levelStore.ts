import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Level } from "@/core/entities/role";
import { DI } from "@/core/di/container";

interface LevelStore {
  levels: Level[];
  isLoading: boolean;
  error: string | null;

  fetchLevels: (companyId: string, roleId?: string) => Promise<void>;
  addLevel: (level: Omit<Level, "$id" | "isActive">) => Promise<void>;
  removeLevel: (id: string) => Promise<void>;
  setError: (error: string) => void;
  clearError: () => void;
}

export const useLevelStore = create<LevelStore>()(
  persist(
    (set, get) => ({
      levels: [],
      isLoading: false,
      error: null,

      fetchLevels: async (companyId, roleId) => {
        set({ isLoading: true, error: null });
        try {
          const levels = await DI.levelService.getLevels(companyId, roleId);
          set({ levels, isLoading: false });
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : "Failed to fetch levels";
          set({ error: errorMessage, isLoading: false });
          console.error(err);
        }
      },

      addLevel: async (newLevelData) => {
        const tempId = "temp-" + Date.now();
        const tempLevel = {
          ...newLevelData,
          $id: tempId,
          isActive: true,
        } as Level;

        set((state) => ({
          levels: [...state.levels, tempLevel].sort(
            (a, b) => a.sortOrder - b.sortOrder,
          ),
          error: null,
        }));

        try {
          const createdLevel = await DI.levelService.createLevel(newLevelData);
          set((state) => ({
            levels: state.levels.map((l) =>
              l.$id === tempId ? createdLevel : l,
            ),
          }));
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : "Failed to add level";
          set((state) => ({
            levels: state.levels.filter((l) => l.$id !== tempId),
            error: errorMessage,
          }));
          console.error(err);
        }
      },

      removeLevel: async (id) => {
        const originalLevels = get().levels;
        set({
          levels: originalLevels.filter((l) => l.$id !== id),
          error: null,
        });
        try {
          await DI.levelService.removeLevel(id);
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : "Failed to delete level";
          set({ levels: originalLevels, error: errorMessage });
          console.error(err);
        }
      },

      setError: (error: string) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    {
      name: "level-storage",
    },
  ),
);
