"use client";

import { useState, useEffect } from "react";
import { DI } from "@/core/di/container";
import { HydratedInterview } from "@/core/entities/types";
import { useAuthStore } from "@/stores/authStore";

export const useInterviews = () => {
  const [interviews, setInterviews] = useState<HydratedInterview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { companyId } = useAuthStore();

  useEffect(() => {
    const fetchInterviews = async () => {
      if (!companyId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const data = await DI.interviewService.getDetailedInterviews(companyId);
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
  }, [companyId]);

  return { interviews, isLoading, error };
};
