import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { DI } from "@/core/di/container";
import { Candidate } from "@/core/entities/candidate";

export const useCandidates = () => {
  const { companyId } = useAuthStore();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCandidates = async () => {
      if (!companyId) return;
      setIsLoading(true);
      try {
        // The mobile app stores candidate info directly in the interviews
        // collection (candidateName, cvDriveUrl, interviewerId) rather than
        // creating separate records in the candidates collection.
        // So we derive unique candidates from interviews instead.
        const result = await DI.interviewService.getDetailedInterviews(
          companyId,
          { limit: 250, offset: 0 },
        );

        // De-duplicate by candidateName — one card per unique candidate
        const seen = new Set<string>();
        const derived: Candidate[] = [];

        for (const interview of result.documents) {
          const name = interview.candidateName || interview.candidate?.name;
          if (!name || seen.has(name)) continue;
          seen.add(name);

          derived.push({
            $id: interview.$id,
            name,
            email: "",
            interviewerId: interview.interviewerId || "",
            companyId: interview.companyId,
            phone: undefined,
            cvFileUrl: interview.cvDriveUrl || undefined,
            driveFolderId: interview.driveFolderId || undefined,
          });
        }

        setCandidates(derived);
      } catch (err: any) {
        console.error("Failed to load candidates", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCandidates();
  }, [companyId]);

  return { candidates, isLoading };
};
