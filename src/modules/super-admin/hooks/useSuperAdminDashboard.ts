"use client";

import { useEffect, useState } from "react";
import { useSuperAdminStore } from "@/stores/superAdminStore";
import {
  getSuperAdminDashboardData,
  approveCompanyAdmin,
  rejectCompanyAdmin,
  getPendingCompaniesAdmin,
} from "@/app/actions/adminActions";
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

  const [isMutating, setIsMutating] = useState(false);

  // Fetch stats and pending list on mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Generate a fresh JWT token using DI AuthService
        const { jwt } = await DI.authService.createJWT();

        // Call Server Action with JWT
        const data = await getSuperAdminDashboardData(jwt);

        // Update store
        setStats({
          totalCompanies: data.stats.total,
          activeCompanies: data.stats.active,
          pendingApprovals: data.stats.pending,
          totalInterviews: data.totalInterviews,
        });

        setPendingList(data.pendingCompanies);
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
      setIsMutating(true);
      // Optimistically update the store
      removePendingCompany(companyId);

      // Generate JWT and use Server Action for Super Admin
      const { jwt } = await DI.authService.createJWT();
      await approveCompanyAdmin(jwt, companyId);
    } catch (error) {
      console.error("Failed to approve company:", error);
      // On error, refetch to restore correct state
      try {
        const { jwt } = await DI.authService.createJWT();
        const pending = await getPendingCompaniesAdmin(jwt);
        setPendingList(pending);
      } catch (refetchError) {
        console.error("Failed to refetch pending companies:", refetchError);
      }
    } finally {
      setIsMutating(false);
    }
  };

  const rejectCompany = async (companyId: string) => {
    try {
      setIsMutating(true);
      // Optimistically update the store
      removePendingCompany(companyId);

      // Generate JWT and use Server Action for Super Admin
      const { jwt } = await DI.authService.createJWT();
      await rejectCompanyAdmin(jwt, companyId);
    } catch (error) {
      console.error("Failed to reject company:", error);
      // On error, refetch to restore correct state
      try {
        const { jwt } = await DI.authService.createJWT();
        const pending = await getPendingCompaniesAdmin(jwt);
        setPendingList(pending);
      } catch (refetchError) {
        console.error("Failed to refetch pending companies:", refetchError);
      }
    } finally {
      setIsMutating(false);
    }
  };

  return {
    stats,
    pendingList,
    isLoading,
    isMutating,
    approveCompany,
    rejectCompany,
  };
};
