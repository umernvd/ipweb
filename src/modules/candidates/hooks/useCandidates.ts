import { useEffect } from "react";
import { useCandidateStore } from "@/stores/candidateStore";
import { useAuthStore } from "@/stores/authStore";
import { DI } from "@/core/di/container";

export const useCandidates = () => {
  const { companyId } = useAuthStore();

  const { candidates, isLoading, setCandidates, setLoading } =
    useCandidateStore();

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

  return {
    candidates,
    isLoading,
  };
};
