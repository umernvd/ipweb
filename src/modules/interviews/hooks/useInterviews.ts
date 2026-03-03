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
    setInterviews,
    setPage,
    setSearchQuery,
    setStatusFilter,
    setLoading,
  } = useInterviewStore();

  useEffect(() => {
    const fetchInterviews = async () => {
      if (!companyId) return;

      setLoading(true);
      try {
        // Calculate offset: Page 1 = 0, Page 2 = 10, Page 3 = 20
        const offset = (currentPage - 1) * itemsPerPage;

        const data = await DI.interviewService.getDetailedInterviews(
          companyId,
          {
            limit: itemsPerPage,
            offset: offset,
            status: statusFilter,
            searchQuery: searchQuery || undefined,
          },
        );

        setInterviews(data);
      } catch (error) {
        console.error("Failed to fetch interviews", error);
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
  ]);

  return {
    interviews,
    total: totalCount,
    isLoading,
    error: null,
    currentPage,
    setCurrentPage: setPage,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    itemsPerPage,
  };
};
