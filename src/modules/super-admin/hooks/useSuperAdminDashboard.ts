"use client";

import { useEffect } from "react";
import { useSuperAdminStore } from "@/stores/superAdminStore";
import { DI } from "@/core/di/container";

export const useSuperAdminDashboard = () => {
  const {
    stats,
    pendingList,
    isLoading,
    setStats,
    setPendingList,
    setLoading,
    removePendingCompany,
  } = useSuperAdminStore();

  // Fetch stats and pending list on mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch company stats
        const companyStats = await DI.companyService.getGlobalStats();

        // Fetch interview count
        const interviewCount =
          await DI.interviewService.getGlobalInterviewCount();

        // Fetch pending companies
        const pending = await DI.companyService.getPendingCompanies();

        // Update store
        setStats({
          totalCompanies: companyStats.total,
          activeCompanies: companyStats.active,
          pendingApprovals: companyStats.pending,
          totalInterviews: interviewCount,
        });

        setPendingList(pending);
      } catch (error) {
        console.error("Failed to fetch super admin dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [setStats, setPendingList, setLoading]);

  const approveCompany = async (companyId: string) => {
    try {
      // Optimistically update the store
      removePendingCompany(companyId);

      // Update in Appwrite
      await DI.companyService.approveCompany(companyId);
    } catch (error) {
      console.error("Failed to approve company:", error);
      // On error, refetch to restore correct state
      const pending = await DI.companyService.getPendingCompanies();
      setPendingList(pending);
    }
  };

  const rejectCompany = async (companyId: string) => {
    try {
      // Optimistically update the store
      removePendingCompany(companyId);

      // Update in Appwrite
      await DI.companyService.rejectCompany(companyId);
    } catch (error) {
      console.error("Failed to reject company:", error);
      // On error, refetch to restore correct state
      const pending = await DI.companyService.getPendingCompanies();
      setPendingList(pending);
    }
  };

  return {
    stats,
    pendingList,
    isLoading,
    approveCompany,
    rejectCompany,
  };
};
