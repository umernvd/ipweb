import { useEffect } from "react";
import { useInterviewStore } from "@/stores/interviewStore";
import { useAuthStore } from "@/stores/authStore";
import { DI } from "@/core/di/container";

export const useInterviews = () => {
  const { companyId } = useAuthStore();
  const {
    interviews,
    totalCount,
    isLoading,
    currentPage,
    itemsPerPage,
    searchQuery,
    statusFilter,
    error,
    setInterviews,
    setPage,
    setSearchQuery,
    setStatusFilter,
    setLoading,
    setError,
    clearError,
  } = useInterviewStore();

  useEffect(() => {
    const fetchInterviews = async () => {
      if (!companyId) return;

      setLoading(true);
      clearError();
      try {
        // Calculate offset: Page 1 = 0, Page 2 = 10, Page 3 = 20
        const offset = (currentPage - 1) * itemsPerPage;

        // Add cache-busting timestamp to force fresh data from Appwrite
        // This prevents Next.js from caching stale interview data
        const cacheBuster = Date.now();

        const data = await DI.interviewService.getDetailedInterviews(
          companyId,
          {
            limit: itemsPerPage,
            offset: offset,
            status: statusFilter,
            searchQuery: searchQuery || undefined,
            cacheBuster, // Pass timestamp to service
          },
        );

        setInterviews(data);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch interviews";
        setError(errorMessage);
        console.error("Failed to fetch interviews", err);
      } finally {
        setLoading(false);
      }
    };

    // We implement a small debounce for the search query to prevent spamming Appwrite
    const timeoutId = setTimeout(() => {
      fetchInterviews();
    }, 300); // Wait 300ms after user stops typing

    return () => clearTimeout(timeoutId);
  }, [
    companyId,
    currentPage,
    itemsPerPage,
    searchQuery,
    statusFilter,
    setInterviews,
    setLoading,
    setError,
    clearError,
  ]);

  return {
    interviews,
    total: totalCount,
    isLoading,
    error,
    currentPage,
    setCurrentPage: setPage,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    itemsPerPage,
  };
};
