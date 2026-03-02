import { useEffect, useState } from "react";
import { useBlueprintStore } from "@/stores/blueprintStore";
import { useAuthStore } from "@/stores/authStore";
import { Blueprint } from "@/core/entities/blueprint";

export const useBlueprints = (roleId?: string) => {
  const { companyId } = useAuthStore();
  const [isMutating, setIsMutating] = useState(false);

  const {
    blueprints,
    isLoading,
    fetchBlueprints,
    addBlueprint,
    removeBlueprint,
  } = useBlueprintStore();

  // --- READ ---
  useEffect(() => {
    if (companyId) {
      fetchBlueprints(companyId, roleId);
    }
  }, [companyId, roleId, fetchBlueprints]);

  // --- CREATE ---
  const createBlueprint = async (
    data: Omit<Blueprint, "$id" | "createdAt">,
  ) => {
    if (!companyId) return false;
    setIsMutating(true);
    try {
      await addBlueprint(data);
      return true;
    } catch (err: any) {
      console.error(err);
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  // --- DELETE ---
  const deleteBlueprint = async (id: string) => {
    setIsMutating(true);
    try {
      await removeBlueprint(id);
      return true;
    } catch (err: any) {
      console.error(err);
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  return {
    blueprints,
    isLoading,
    isMutating,
    createBlueprint,
    deleteBlueprint,
  };
};
