import { useEffect, useState } from "react";
import { useCandidateStore } from "@/stores/candidateStore";
import { useAuthStore } from "@/stores/authStore";
import { DI } from "@/core/di/container";
import { Candidate } from "@/core/entities/candidate";

export const useCandidates = () => {
  const { companyId } = useAuthStore();
  const [isMutating, setIsMutating] = useState(false);

  const {
    candidates,
    isLoading,
    setCandidates,
    updateCandidate: updateCandidateInStore,
    setLoading,
  } = useCandidateStore();

  // --- READ (Fetch All) ---
  useEffect(() => {
    const fetchCandidates = async () => {
      if (!companyId) return;
      setLoading(true);
      try {
        const data = await DI.candidateService.getCandidates(companyId);
        setCandidates(data);
      } catch (err: any) {
        console.error("Failed to load candidates", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCandidates();
  }, [companyId, setCandidates, setLoading]);

  // --- CREATE ---
  const createCandidate = async (
    data: Omit<Candidate, "$id" | "createdAt" | "updatedAt" | "companyId">,
  ) => {
    if (!companyId) return false;
    setIsMutating(true);

    // Optimistic update: create a temporary candidate object
    const tempId = `temp-${Date.now()}`;
    const tempCandidate: Candidate = {
      $id: tempId,
      ...data,
      companyId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      // Add to store immediately (optimistic)
      updateCandidateInStore(tempId, tempCandidate);

      // Call the service
      const newCandidate = await DI.candidateService.addCandidate({
        ...data,
        companyId,
      });

      // Replace temp candidate with real one from server
      updateCandidateInStore(tempId, newCandidate);
      return true;
    } catch (err: any) {
      console.error("Failed to create candidate", err);
      // Rollback: remove the temp candidate by fetching fresh data
      const freshData = await DI.candidateService.getCandidates(companyId);
      setCandidates(freshData);
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  return {
    candidates,
    isLoading,
    isMutating,
    createCandidate,
  };
};
