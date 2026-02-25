import { create } from "zustand";
import { Models } from "appwrite";
import { DI } from "@/core/di/container"; // We'll add authService to DI next

interface AuthStore {
  user: Models.User<Models.Preferences> | null;
  isLoading: boolean;
  isAdmin: boolean; // True if Super Admin
  companyId: string | null; // ✅ Add this

  checkSession: () => Promise<void>;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: true,
  isAdmin: false,
  companyId: null, // ✅ Initialize

  checkSession: async () => {
    set({ isLoading: true });
    try {
      const user = await DI.authService.getCurrentUser();

      // 1. Identify Super Admin
      const isSuperAdmin = user?.email === "admin@hireai.com";

      // 2. Company Check
      const companyId = (user?.prefs as any)?.companyId || null;

      // 🛑 BLOCK LOGIC (Only for non-admins)
      if (!isSuperAdmin && companyId) {
        const company = await DI.companyService.getById(companyId);

        if (company?.status === "pending") {
          // 🛑 BLOCK LOGIN
          alert("Your account is pending approval.");
          await DI.authService.logout();
          set({ user: null, companyId: null, isLoading: false });
          return;
        }

        if (company?.status === "rejected") {
          // 🛑 BLOCK LOGIN
          alert("Your account was rejected.");
          await DI.authService.logout();
          set({ user: null, companyId: null, isLoading: false });
          return;
        }
      }

      // ✅ Success
      set({ user, isAdmin: isSuperAdmin, companyId, isLoading: false });
    } catch {
      set({ user: null, isAdmin: false, companyId: null, isLoading: false });
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
