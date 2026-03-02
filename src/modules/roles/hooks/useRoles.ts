import { useEffect, useState } from "react";
import { useRoleStore } from "@/stores/roleStore";
import { useAuthStore } from "@/stores/authStore";

export const useRoles = () => {
  const { companyId } = useAuthStore();
  const [isMutating, setIsMutating] = useState(false);

  const { roles, isLoading, fetchRoles, addRole, removeRole } = useRoleStore();

  // --- READ ---
  useEffect(() => {
    if (companyId) {
      fetchRoles(companyId);
    }
  }, [companyId, fetchRoles]);

  // --- CREATE ---
  const createRole = async (
    name: string,
    description: string,
    icon?: string,
  ) => {
    if (!companyId) return false;
    setIsMutating(true);
    try {
      await addRole({ name, description, icon, companyId });
      return true;
    } catch (err: any) {
      console.error(err);
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  // --- DELETE ---
  const deleteRole = async (id: string) => {
    setIsMutating(true);
    try {
      await removeRole(id);
      return true;
    } catch (err: any) {
      console.error(err);
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  return {
    roles,
    isLoading,
    isMutating,
    createRole,
    deleteRole,
  };
};
