"use client";

import { useState, useEffect } from "react";
import { DI } from "@/core/di/container";
import { HydratedInterview } from "@/core/entities/types";
import { useAuthStore } from "@/stores/authStore";

const ITEMS_PER_PAGE = 10;

export const useInterviews = () => {
  const [interviews, setInterviews] = useState<HydratedInterview[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination and filter state
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [dateRange, setDateRange] = useState<{
    startDate?: string;
    endDate?: string;
  }>({});

  const { companyId } = useAuthStore();

  useEffect(() => {
    const fetchInterviews = async () => {
      if (!companyId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Calculate offset based on current page
        const offset = (currentPage - 1) * ITEMS_PER_PAGE;

        const result = await DI.interviewService.getDetailedInterviews(
          companyId,
          {
            limit: ITEMS_PER_PAGE,
            offset,
            searchQuery: searchQuery || undefined,
            status: statusFilter || undefined,
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
          },
        );

        setInterviews(result.documents);
        setTotal(result.total);
        setError(null);
      } catch (err: any) {
        console.error("Failed to fetch interviews:", err);
        setError("Could not load interviews. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInterviews();
  }, [companyId, currentPage, searchQuery, statusFilter, dateRange]);

  return {
    interviews,
    total,
    isLoading,
    error,
    currentPage,
    setCurrentPage,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    dateRange,
    setDateRange,
    itemsPerPage: ITEMS_PER_PAGE,
  };
};
