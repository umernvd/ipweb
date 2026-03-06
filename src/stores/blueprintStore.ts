import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Blueprint } from "@/core/entities/blueprint";
import { DI } from "@/core/di/container";

interface BlueprintStore {
  blueprints: Blueprint[];
  isLoading: boolean;
  selectedBlueprintId: string | null;
  error: string | null;

  fetchBlueprints: (companyId: string, roleId?: string) => Promise<void>;
  addBlueprint: (
    blueprint: Omit<Blueprint, "$id" | "createdAt">,
  ) => Promise<void>;
  removeBlueprint: (id: string) => Promise<void>;
  setSelectedBlueprint: (id: string | null) => void;
  setError: (error: string) => void;
  clearError: () => void;
}

export const useBlueprintStore = create<BlueprintStore>()(
  persist(
    (set, get) => ({
      blueprints: [],
      isLoading: false,
      selectedBlueprintId: null,
      error: null,

      fetchBlueprints: async (companyId, roleId) => {
        set({ isLoading: true, error: null });
        try {
          const blueprints = await DI.blueprintService.getCompanyBlueprints(
            companyId,
            roleId,
          );
          set({ blueprints, isLoading: false });
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : "Failed to fetch blueprints";
          set({ error: errorMessage, isLoading: false });
          console.error(err);
        }
      },

      addBlueprint: async (newBlueprintData) => {
        const tempId = "temp-" + Date.now();
        const tempBlueprint = {
          ...newBlueprintData,
          $id: tempId,
          createdAt: new Date().toISOString(),
        } as Blueprint;

        set((state) => ({
          blueprints: [tempBlueprint, ...state.blueprints],
          selectedBlueprintId: tempId,
          error: null,
        }));

        try {
          const createdBlueprint =
            await DI.blueprintService.createBlueprint(newBlueprintData);

          set((state) => ({
            blueprints: state.blueprints.map((b) =>
              b.$id === tempId ? createdBlueprint : b,
            ),
            selectedBlueprintId:
              state.selectedBlueprintId === tempId
                ? createdBlueprint.$id
                : state.selectedBlueprintId,
          }));
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : "Failed to add blueprint";
          set((state) => ({
            blueprints: state.blueprints.filter((b) => b.$id !== tempId),
            selectedBlueprintId:
              state.selectedBlueprintId === tempId
                ? null
                : state.selectedBlueprintId,
            error: errorMessage,
          }));
          console.error("Failed to add blueprint", err);
        }
      },

      removeBlueprint: async (id) => {
        const originalBlueprints = get().blueprints;
        const isSelected = get().selectedBlueprintId === id;

        set({
          blueprints: originalBlueprints.filter((b) => b.$id !== id),
          selectedBlueprintId: isSelected ? null : get().selectedBlueprintId,
          error: null,
        });

        try {
          await DI.blueprintService.deleteBlueprint(id);
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : "Failed to delete blueprint";
          set({
            blueprints: originalBlueprints,
            selectedBlueprintId: get().selectedBlueprintId,
            error: errorMessage,
          });
          console.error("Failed to delete blueprint", err);
        }
      },

      setSelectedBlueprint: (id) => set({ selectedBlueprintId: id }),
      setError: (error: string) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    {
      name: "blueprint-storage",
    },
  ),
);
