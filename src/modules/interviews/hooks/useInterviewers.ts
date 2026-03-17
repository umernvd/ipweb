import { useEffect, useState } from "react";
import { useInterviewerStore } from "@/stores/interviewerStore";
import { useAuthStore } from "@/stores/authStore";
import { DI } from "@/core/di/container";
import { Interviewer } from "@/core/entities/types";

export const useInterviewers = () => {
  const { companyId } = useAuthStore();
  const [isMutating, setIsMutating] = useState(false); // Used for button loading spinners

  const {
    interviewers,
    isLoading,
    setInterviewers,
    addInterviewer: addInterviewerToStore,
    updateInterviewer: updateInterviewerInStore,
    removeInterviewer: removeInterviewerFromStore,
    setLoading,
    setError,
  } = useInterviewerStore();

  // --- READ ---
  useEffect(() => {
    const fetchInterviewers = async () => {
      if (!companyId) return;
      setLoading(true);
      try {
        // Assuming your DI container has an interviewerService
        const data = await DI.interviewerService.getAll(companyId);
        setInterviewers(data);
      } catch (err: any) {
        setError(err.message || "Failed to load interviewers");
      } finally {
        setLoading(false);
      }
    };
    fetchInterviewers();
  }, [companyId]);

  // --- CREATE ---
  const createInterviewer = async (
    name: string,
    email: string,
    status: string,
  ) => {
    if (!companyId) return;
    setIsMutating(true);
    try {
      // Call the API route to create interviewer atomically
      // Auth code is generated securely on the backend
      // The API route handles: Auth user creation + DB document + Team membership
      const response = await fetch("/api/interviewers/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          name,
          email,
          status,
          // authCode is NOT sent from client - generated on backend
        }),
      });

      // Parse the response
      const result = await response.json();

      if (!response.ok) {
        // Throw the exact error message from the backend
        throw new Error(result.error || "Failed to create interviewer");
      }

      // The API route returns the fully created database document
      // Use it directly as the single source of truth
      const newInterviewer = result;

      // Update Zustand instantly so the table adds a new row
      addInterviewerToStore(newInterviewer);
      return true; // Return success to close the modal
    } catch (err: any) {
      console.error(err);
      throw err; // Re-throw so the UI can display the exact error
    } finally {
      setIsMutating(false);
    }
  };

  // --- UPDATE ---
  const editInterviewer = async (id: string, updates: Partial<Interviewer>) => {
    setIsMutating(true);
    try {
      const updatedData = await DI.interviewerService.update(id, updates);
      // Update Zustand instantly so the table reflects the change
      updateInterviewerInStore(id, updatedData);
      return true;
    } catch (err: any) {
      console.error(err);
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  // --- DELETE ---
  const deleteInterviewer = async (id: string) => {
    setIsMutating(true);
    try {
      await DI.interviewerService.delete(id);
      // Remove from Zustand instantly so the row disappears
      removeInterviewerFromStore(id);
      return true;
    } catch (err: any) {
      console.error(err);
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  // Expose state and functions to your UI
  return {
    interviewers,
    isLoading,
    isMutating, // Bind this to the `disabled` prop of your Save/Delete buttons
    createInterviewer,
    editInterviewer,
    deleteInterviewer,
  };
};
