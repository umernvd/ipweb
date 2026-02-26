"use client";

import { useState, useEffect } from "react";
import { DI } from "@/core/di/container";
import { Interview } from "@/core/entities/interview";
import { useAuthStore } from "@/stores/authStore";

export const useInterviews = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get the current logged-in company
  const { companyId } = useAuthStore();

  useEffect(() => {
    const fetchInterviews = async () => {
      // Safety check: Don't fetch if not logged in
      if (!companyId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        // This calls the Appwrite Repository we built earlier!
        const data = await DI.interviewService.getAll(companyId);
        setInterviews(data);
        setError(null);
      } catch (err: any) {
        console.error("Failed to fetch interviews:", err);
        setError("Could not load interviews. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInterviews();
  }, [companyId]); // Re-run if companyId changes

  return { interviews, isLoading, error };
};
