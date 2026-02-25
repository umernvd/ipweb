import { Account, ID, Models, Client, Databases } from "appwrite";

export class AuthService {
  private account: Account;
  private client: Client;
  private databases: Databases;

  constructor() {
    this.client = new Client()
      .setEndpoint("https://cloud.appwrite.io/v1")
      .setProject("interviewpro");
    this.account = new Account(this.client);
    this.databases = new Databases(this.client);
  }

  // 1. Login
  async login(email: string, password: string) {
    return this.account.createEmailPasswordSession(email, password);
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

    // 2. Now we are 100% sure the browser is clean. Proceed with creation.
    const user = await this.account.create(
      ID.unique(),
      email,
      password,
      companyName,
    );

    // 3. Login to the new account
    await this.account.createEmailPasswordSession(email, password);

    // 4. Create the Company Document in Database
    const company = await this.databases.createDocument(
      "interview_pro_db",
      "companies",
      ID.unique(),
      {
        name: companyName,
        email: email,
        status: "pending", // 🔒 CRITICAL: Default to pending
        total_interviews: 0,
      },
    );

    // 5. Update Preferences
    await this.account.updatePrefs({
      companyId: company.$id,
      role: "company_admin",
    });

    return user;
  }

  // 3. Get Current User (Session Check)
  async getCurrentUser(): Promise<Models.User<Models.Preferences> | null> {
    try {
      return await this.account.get();
    } catch {
      return null;
    }
  }

  // 4. Logout
  async logout() {
    return this.account.deleteSession("current");
  }
}
