import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Role } from "@/core/entities/role";
import { DI } from "@/core/di/container";

interface RoleStore {
  roles: Role[];
  isLoading: boolean;
  selectedRoleId: string | null;
  error: string | null;

  fetchRoles: (companyId: string) => Promise<void>;
  addRole: (role: Omit<Role, "$id" | "isActive">) => Promise<void>;
  removeRole: (id: string) => Promise<void>;
  setSelectedRole: (id: string | null) => void;
  setError: (error: string) => void;
  clearError: () => void;
}

export const useRoleStore = create<RoleStore>()(
  persist(
    (set, get) => ({
      roles: [],
      isLoading: false,
      selectedRoleId: null,
      error: null,

      fetchRoles: async (companyId) => {
        set({ isLoading: true, error: null });
        try {
          const roles = await DI.roleService.getCompanyRoles(companyId);
          set({ roles, isLoading: false });
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : "Failed to fetch roles";
          set({ error: errorMessage, isLoading: false });
          console.error(err);
        }
      },

      addRole: async (newRoleData) => {
        const tempId = "temp-" + Date.now();
        // 1. Create a temporary role object for immediate display
        const tempRole = {
          ...newRoleData,
          $id: tempId,
          isActive: true,
        } as Role;

        set((state) => ({
          roles: [tempRole, ...state.roles],
          // Auto-select the new role immediately
          selectedRoleId: tempId,
          error: null,
        }));

        try {
          // 2. Send to backend
          const createdRole = await DI.roleService.createRole(newRoleData);

          // 3. Swap the temporary ID with the real Database ID
          set((state) => ({
            roles: state.roles.map((r) => (r.$id === tempId ? createdRole : r)),
            // If the user is viewing the temp role, update their view to the real ID
            selectedRoleId:
              state.selectedRoleId === tempId
                ? createdRole.$id
                : state.selectedRoleId,
          }));
        } catch (err) {
          // If error, remove the temp role
          const errorMessage =
            err instanceof Error ? err.message : "Failed to add role";
          set((state) => ({
            roles: state.roles.filter((r) => r.$id !== tempId),
            selectedRoleId:
              state.selectedRoleId === tempId ? null : state.selectedRoleId,
            error: errorMessage,
          }));
          console.error("Failed to add role", err);
        }
      },

      removeRole: async (id) => {
        const originalRoles = get().roles;
        const isSelected = get().selectedRoleId === id;

        set({
          roles: originalRoles.filter((r) => r.$id !== id),
          // Deselect if we are deleting the active role
          selectedRoleId: isSelected ? null : get().selectedRoleId,
          error: null,
        });

        try {
          await DI.roleService.removeRole(id);
        } catch (err) {
          // Revert on failure
          const errorMessage =
            err instanceof Error ? err.message : "Failed to delete role";
          set({
            roles: originalRoles,
            selectedRoleId: get().selectedRoleId,
            error: errorMessage,
          }); // Keep selection state
          console.error("Failed to delete role", err);
        }
      },

      setSelectedRole: (id) => set({ selectedRoleId: id }),
      setError: (error: string) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    {
      name: "role-storage",
    },
  ),
);
