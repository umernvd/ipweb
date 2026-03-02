import { create } from "zustand";
import { Blueprint } from "@/core/entities/blueprint";
import { DI } from "@/core/di/container";

interface BlueprintStore {
  blueprints: Blueprint[];
  isLoading: boolean;
  selectedBlueprintId: string | null;

  fetchBlueprints: (companyId: string, roleId?: string) => Promise<void>;
  addBlueprint: (
    blueprint: Omit<Blueprint, "$id" | "createdAt">,
  ) => Promise<void>;
  removeBlueprint: (id: string) => Promise<void>;
  setSelectedBlueprint: (id: string | null) => void;
}

export const useBlueprintStore = create<BlueprintStore>((set, get) => ({
  blueprints: [],
  isLoading: false,
  selectedBlueprintId: null,

  fetchBlueprints: async (companyId, roleId) => {
    set({ isLoading: true });
    try {
      const blueprints = await DI.blueprintService.getCompanyBlueprints(
        companyId,
        roleId,
      );
      set({ blueprints, isLoading: false });
    } catch (err) {
      console.error(err);
      set({ isLoading: false });
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
      set((state) => ({
        blueprints: state.blueprints.filter((b) => b.$id !== tempId),
        selectedBlueprintId:
          state.selectedBlueprintId === tempId
            ? null
            : state.selectedBlueprintId,
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
    });

    try {
      await DI.blueprintService.deleteBlueprint(id);
    } catch (err) {
      set({
        blueprints: originalBlueprints,
        selectedBlueprintId: get().selectedBlueprintId,
      });
      console.error("Failed to delete blueprint", err);
    }
  },

  setSelectedBlueprint: (id) => set({ selectedBlueprintId: id }),
}));
