"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { DI } from "@/core/di/container";
import { HydratedInterview } from "@/core/entities/types";

interface ChartDataPoint {
  label: string;
  height: number;
  count: number;
}

interface DashboardMetrics {
  totalInterviewers: number;
  activeRoles: number;
  totalInterviews: number;
  pendingInterviews: number;
  recentInterviews: HydratedInterview[];
  chartData: ChartDataPoint[];
  isLoading: boolean;
}

// Helper function to generate weekly chart data
const generateWeeklyChartData = (
  interviews: HydratedInterview[],
): ChartDataPoint[] => {
  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const dayCounts = [0, 0, 0, 0, 0, 0, 0];

  // Get today's date and calculate the start of the week (Monday)
  const today = new Date();
  const dayOfWeek = today.getDay();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  startOfWeek.setHours(0, 0, 0, 0);

  // Count interviews for each day of the week
  interviews.forEach((interview) => {
    const interviewDate = interview.startedAt
      ? new Date(interview.startedAt)
      : null;

    if (interviewDate) {
      interviewDate.setHours(0, 0, 0, 0);
      const dayDiff = Math.floor(
        (interviewDate.getTime() - startOfWeek.getTime()) /
          (1000 * 60 * 60 * 24),
      );

      if (dayDiff >= 0 && dayDiff < 7) {
        dayCounts[dayDiff]++;
      }
    }
  });

  // Find max count (fallback to 1 to avoid division by zero)
  const maxCount = Math.max(...dayCounts, 1);

  // Map to chart data points
  return dayLabels.map((label, index) => ({
    label,
    count: dayCounts[index],
    height: (dayCounts[index] / maxCount) * 100,
  }));
};

export const useCompanyDashboard = (): DashboardMetrics => {
  const { companyId } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalInterviewers: 0,
    activeRoles: 0,
    totalInterviews: 0,
    pendingInterviews: 0,
    recentInterviews: [],
    chartData: [],
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
        const chartData = generateWeeklyChartData(interviewsResponse.documents);

        setMetrics({
          totalInterviewers,
          activeRoles,
          totalInterviews,
          pendingInterviews,
          recentInterviews,
          chartData,
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
