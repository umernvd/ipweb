import { create } from "zustand";
import { Role } from "@/core/entities/role";
import { configService } from "@/core/services/config.service";

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
      const roles = await configService.getRoles(companyId);
      set({ roles, isLoading: false });
    } catch (err) {
      console.error(err);
      set({ isLoading: false });
    }
  },

  addRole: async (newRoleData) => {
    const tempId = "temp-" + Date.now();
    const tempRole = { ...newRoleData, $id: tempId, isActive: true } as Role;

    set((state) => ({ roles: [tempRole, ...state.roles] }));

    try {
      const createdRole = await configService.createRole(newRoleData);

      set((state) => ({
        roles: state.roles.map((r) => (r.$id === tempId ? createdRole : r)),
      }));
    } catch (err) {
      set((state) => ({ roles: state.roles.filter((r) => r.$id !== tempId) }));
      console.error("Failed to add role", err);
    }
  },

  removeRole: async (id) => {
    const originalRoles = get().roles;
    set({ roles: originalRoles.filter((r) => r.$id !== id) });

    try {
      await configService.deleteRole(id);
    } catch (err) {
      set({ roles: originalRoles });
      console.error("Failed to delete role", err);
    }
  },

  setSelectedRole: (id) => set({ selectedRoleId: id }),
}));
