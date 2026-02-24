import { create } from "zustand";
import { Level } from "@/core/entities/role";
import { DI } from "@/core/di/container";

interface LevelStore {
  levels: Level[];
  isLoading: boolean;

  fetchLevels: (companyId: string, roleId?: string) => Promise<void>;
  addLevel: (level: Omit<Level, "$id" | "isActive">) => Promise<void>;
  removeLevel: (id: string) => Promise<void>;
}

export const useLevelStore = create<LevelStore>((set, get) => ({
  levels: [],
  isLoading: false,

  fetchLevels: async (companyId, roleId) => {
    set({ isLoading: true });
    const levels = roleId
      ? await DI.levelService.getLevels(companyId, roleId)
      : [];
    set({ levels, isLoading: false });
  },

  addLevel: async (newLevelData) => {
    const tempId = "temp-" + Date.now();
    const tempLevel = { ...newLevelData, $id: tempId, isActive: true } as Level;

    set((state) => ({
      levels: [...state.levels, tempLevel].sort(
        (a, b) => a.sortOrder - b.sortOrder,
      ),
    }));

    try {
      const createdLevel = await DI.levelService.createLevel(newLevelData);
      set((state) => ({
        levels: state.levels.map((l) => (l.$id === tempId ? createdLevel : l)),
      }));
    } catch (err) {
      set((state) => ({
        levels: state.levels.filter((l) => l.$id !== tempId),
      }));
    }
  },

  removeLevel: async (id) => {
    const originalLevels = get().levels;
    set({ levels: originalLevels.filter((l) => l.$id !== id) });
    try {
      await DI.levelService.removeLevel(id);
    } catch (err) {
      set({ levels: originalLevels });
    }
  },
}));
