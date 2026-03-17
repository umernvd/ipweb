import {
  Account,
  ID,
  Models,
  Client,
  Databases,
  Permission,
  Role,
  Teams,
} from "appwrite";

export class AuthService {
  private account: Account;
  private client: Client;
  private databases: Databases;
  private teams: Teams;

  constructor() {
    this.client = new Client()
      .setEndpoint("https://cloud.appwrite.io/v1")
      .setProject("interviewpro");
    this.account = new Account(this.client);
    this.databases = new Databases(this.client);
    this.teams = new Teams(this.client);
  }

  // 1. Login
  async login(email: string, password: string) {
    try {
      // SAFETY FLUSH: Clear any existing sessions before creating a new one
      // This prevents "Creation of a session is prohibited when a session is active" errors
      try {
        await this.account.deleteSession("current");
      } catch (error) {
        // Ignore errors - if there's no session to delete, that's fine
        // This is the state we want anyway
      }

      // Now proceed with creating the new session
      return await this.account.createEmailPasswordSession(email, password);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  // 2. Register (Company Admin)
  async register(email: string, password: string, companyName: string) {
    // 1. SAFETY FLUSH: The "Real World" Fix
    // Before we do anything, we try to kill any existing session.
    try {
      // We attempt to delete the 'current' session.
      // If the user was already logged out, this might throw an error, which is fine.
      await this.account.deleteSession("current");
    } catch (error) {
      // We ignore this error intentionally.
      // If deleting the session failed, it likely means there was no session to begin with.
      // That is the state we wanted anyway!
    }

    try {
      // 2. Now we are 100% sure the browser is clean. Proceed with creation.
      const user = await this.account.create(
        ID.unique(),
        email,
        password,
        companyName,
      );

      // 3. Login to the new account - MUST await this
      await this.account.createEmailPasswordSession(email, password);

      // 4. Generate a unique company ID
      const companyId = ID.unique();

      // 5. Create a Team for the company (for B2B tenant isolation)
      try {
        await this.teams.create(companyId, companyName);
        console.log(`Created team for company ${companyId}`);
      } catch (teamError: any) {
        // If team already exists, that's fine - just log and continue
        if (
          teamError?.code === 409 ||
          teamError?.message?.includes("already exists")
        ) {
          console.log(`Team already exists for company ${companyId}`);
        } else {
          console.error(
            `Error creating team for company ${companyId}:`,
            teamError,
          );
          // Don't throw - team creation is not critical for registration
        }
      }

      // 6. Create the Company Document in Database with Team-based RLS permissions
      const company = await this.databases.createDocument(
        "interview_pro_db",
        "companies",
        companyId,
        {
          name: companyName,
          email: email,
          status: "pending", // 🔒 CRITICAL: Default to pending
          total_interviews: 0,
        },
        [
          // Team-based Row-Level Security permissions
          // Allow all team members to read this document
          Permission.read(Role.team(companyId)),
          // Allow all team members to update this document
          Permission.update(Role.team(companyId)),
          // Allow all team members to delete this document
          Permission.delete(Role.team(companyId)),
        ],
      );

      // 7. Update Preferences
      await this.account.updatePrefs({
        companyId: company.$id,
        role: "company_admin",
      });

      return user;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  }

  // 3. Get Current User (Session Check)
  async getCurrentUser(): Promise<Models.User<Models.Preferences> | null> {
    try {
      return await this.account.get();
    } catch (error) {
      // Gracefully handle guest session errors
      if (
        error instanceof Error &&
        (error.message.includes("guests") || error.message.includes("401"))
      ) {
        return null;
      }
      return null;
    }
  }

  // 4. Generate JWT Token
  async createJWT(): Promise<{ jwt: string }> {
    try {
      return await this.account.createJWT();
    } catch (error) {
      console.error("JWT creation error:", error);
      throw error;
    }
  }

  // 6. Update Password
  async updatePassword(
    newPassword: string,
    currentPassword: string,
  ): Promise<void> {
    await this.account.updatePassword(newPassword, currentPassword);
  }

  // 7. Update Email
  async updateEmail(newEmail: string, currentPassword: string): Promise<void> {
    await this.account.updateEmail(newEmail, currentPassword);
  }

  // 8. Logout
  async logout() {
    return this.account.deleteSession("current");
  }
}
