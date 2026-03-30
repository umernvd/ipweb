import { create } from "zustand";
import { Models } from "appwrite";
import { DI } from "@/core/di/container"; // We'll add authService to DI next

interface AuthStore {
  user: Models.User<Models.Preferences> | null;
  isLoading: boolean;
  isAdmin: boolean; // True if Super Admin
  companyId: string | null;
  authError: string | null; // Replaces alert() calls

  checkSession: () => Promise<void>;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  clearAuthError: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: true,
  isAdmin: false,
  companyId: null,
  authError: null,

  clearAuthError: () => set({ authError: null }),

  checkSession: async () => {
    set({ isLoading: true });
    try {
      const user = await DI.authService.getCurrentUser();

      if (!user) {
        set({ user: null, isAdmin: false, companyId: null, isLoading: false });
        return;
      }

      // 1. Identify Super Admin
      const isSuperAdmin = user?.email === "admin@hireai.com";

      // 2. If Super Admin, bypass company check entirely
      if (isSuperAdmin) {
        set({ user, isAdmin: true, companyId: null, isLoading: false });
        return;
      }

      // 3. For regular users, fetch company and check status
      const companyId = (user?.prefs as any)?.companyId || null;

      if (!companyId) {
        // No company ID - user is not properly set up
        set({ user: null, isAdmin: false, companyId: null, isLoading: false });
        return;
      }

      // 4. Fetch company and check status
      try {
        const company = await DI.companyService.getById(companyId);

        if (!company) {
          // Company not found
          await DI.authService.logout();
          set({
            user: null,
            isAdmin: false,
            companyId: null,
            isLoading: false,
          });
          return;
        }

        if (company.status === "pending") {
          await DI.authService.logout();
          set({
            user: null,
            isAdmin: false,
            companyId: null,
            isLoading: false,
            authError:
              "Your account is pending approval. Please wait for admin review.",
          });
          return;
        }

        if (company.status === "rejected") {
          await DI.authService.logout();
          set({
            user: null,
            isAdmin: false,
            companyId: null,
            isLoading: false,
            authError:
              "Your account registration was rejected. Please contact support.",
          });
          return;
        }

        // ✅ Success - Company is active
        set({ user, isAdmin: false, companyId, isLoading: false });
      } catch (companyError) {
        console.error("Error fetching company:", companyError);
        // If company fetch fails, logout the user
        await DI.authService.logout();
        set({ user: null, isAdmin: false, companyId: null, isLoading: false });
      }
    } catch (error) {
      console.error("Session check error:", error);
      // Gracefully handle guest session errors (401/unauthorized)
      if (error instanceof Error && error.message.includes("guests")) {
        // Clear auth state for guest users
        set({ user: null, isAdmin: false, companyId: null, isLoading: false });
      } else {
        set({ user: null, isAdmin: false, companyId: null, isLoading: false });
      }
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    await DI.authService.login(email, password);
    await useAuthStore.getState().checkSession(); // Refresh user data
  },

  logout: async () => {
    await DI.authService.logout();
    set({ user: null, isAdmin: false, companyId: null });
  },
}));
