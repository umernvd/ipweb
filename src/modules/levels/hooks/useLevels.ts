import { useEffect, useState } from "react";
import { useLevelStore } from "@/stores/levelStore";
import { useAuthStore } from "@/stores/authStore";

export const useLevels = (roleId?: string) => {
  const { companyId } = useAuthStore();
  const [isMutating, setIsMutating] = useState(false);

  const { levels, isLoading, fetchLevels, addLevel, removeLevel } =
    useLevelStore();

  // --- READ ---
  useEffect(() => {
    if (companyId) {
      fetchLevels(companyId, roleId);
    }
  }, [companyId, roleId, fetchLevels]);

  // --- CREATE ---
  const createLevel = async (
    title: string,
    roleId: string,
    description: string,
    sortOrder: number,
  ) => {
    if (!companyId) return false;
    setIsMutating(true);
    try {
      await addLevel({
        title,
        roleIds: [roleId], // Changed from roleId to roleIds array
        description,
        sortOrder,
        companyId,
      });
      return true;
    } catch (err: any) {
      console.error(err);
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  // --- DELETE ---
  const deleteLevel = async (id: string) => {
    setIsMutating(true);
    try {
      await removeLevel(id);
      return true;
    } catch (err: any) {
      console.error(err);
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  return {
    levels,
    isLoading,
    isMutating,
    createLevel,
    deleteLevel,
  };
};
