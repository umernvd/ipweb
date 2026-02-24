import { create } from "zustand";
import { Role } from "@/core/entities/role";
import { DI } from "@/core/di/container";

interface RoleStore {
  roles: Role[];
  isLoading: boolean;
  selectedRoleId: string | null;

  fetchRoles: (companyId: string) => Promise<void>;
  addRole: (role: Omit<Role, "$id" | "isActive">) => Promise<void>;
  removeRole: (id: string) => Promise<void>;
  setSelectedRole: (id: string | null) => void;
}

export const useRoleStore = create<RoleStore>((set, get) => ({
  roles: [],
  isLoading: false,
  selectedRoleId: null,

  fetchRoles: async (companyId) => {
    set({ isLoading: true });
    try {
      const roles = await DI.roleService.getCompanyRoles(companyId);
      set({ roles, isLoading: false });
    } catch (err) {
      console.error(err);
      set({ isLoading: false });
    }
  },

  addRole: async (newRoleData) => {
    const tempId = "temp-" + Date.now();
    // 1. Create a temporary role object for immediate display
    const tempRole = { ...newRoleData, $id: tempId, isActive: true } as Role;

    set((state) => ({
      roles: [tempRole, ...state.roles],
      // Auto-select the new role immediately
      selectedRoleId: tempId,
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
      set((state) => ({
        roles: state.roles.filter((r) => r.$id !== tempId),
        selectedRoleId:
          state.selectedRoleId === tempId ? null : state.selectedRoleId,
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
    });

    try {
      await DI.roleService.removeRole(id);
    } catch (err) {
      // Revert on failure
      set({ roles: originalRoles, selectedRoleId: get().selectedRoleId }); // Keep selection state
      console.error("Failed to delete role", err);
    }
  },

  setSelectedRole: (id) => set({ selectedRoleId: id }),
}));
