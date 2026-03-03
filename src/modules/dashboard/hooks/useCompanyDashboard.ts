"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { DI } from "@/core/di/container";
import { HydratedInterview } from "@/core/entities/types";

interface DashboardMetrics {
  totalInterviewers: number;
  activeRoles: number;
  totalInterviews: number;
  pendingInterviews: number;
  recentInterviews: HydratedInterview[];
  isLoading: boolean;
}

export const useCompanyDashboard = (): DashboardMetrics => {
  const { companyId } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalInterviewers: 0,
    activeRoles: 0,
    totalInterviews: 0,
    pendingInterviews: 0,
    recentInterviews: [],
    isLoading: true,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!companyId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Fetch all required data in parallel
        const [interviewers, roles, interviewsResponse] = await Promise.all([
          DI.interviewerService.getAll(companyId),
          DI.roleService.getAll(companyId),
          DI.interviewService.getDetailedInterviews(companyId, {
            limit: 50,
          }),
        ]);

        // Calculate metrics
        const totalInterviewers = interviewers.length;
        const activeRoles = roles.length;
        const totalInterviews = interviewsResponse.total;
        const pendingInterviews = interviewsResponse.documents.filter(
          (interview) => interview.status === "Pending",
        ).length;
        const recentInterviews = interviewsResponse.documents.slice(0, 5);

        setMetrics({
          totalInterviewers,
          activeRoles,
          totalInterviews,
          pendingInterviews,
          recentInterviews,
          isLoading: false,
        });
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        setMetrics((prev) => ({ ...prev, isLoading: false }));
      }
    };

    fetchDashboardData();
  }, [companyId]);

  return metrics;
};
