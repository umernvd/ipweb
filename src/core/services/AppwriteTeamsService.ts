import { Client, Teams } from "node-appwrite";

/**
 * Service for managing Appwrite Teams for B2B tenant isolation
 */
export class AppwriteTeamsService {
  private teams: Teams;

  constructor() {
    const client = new Client()
      .setEndpoint("https://cloud.appwrite.io/v1")
      .setProject("interviewpro")
      .setKey(process.env.APPWRITE_API_KEY || "");

    this.teams = new Teams(client);
  }

  /**
   * Create a team for a company
   * @param companyId The company ID (used as team ID)
   * @param companyName The company name
   * @returns Team ID
   */
  async createCompanyTeam(
    companyId: string,
    companyName: string,
  ): Promise<string> {
    try {
      const team = await this.teams.create(companyId, companyName);
      console.log(`Created team for company ${companyId}`);
      return team.$id;
    } catch (error: any) {
      // If team already exists, that's fine - just log and return the ID
      if (error?.code === 409 || error?.message?.includes("already exists")) {
        console.log(`Team already exists for company ${companyId}`);
        return companyId;
      }
      // Re-throw other errors
      console.error(`Error creating team for company ${companyId}:`, error);
      throw error;
    }
  }

  async addInterviewerToTeam(
    companyId: string,
    email: string,
    userId: string,
    name: string,
  ) {
    try {
      // EXACT positional arguments for Appwrite Node SDK
      const membership = await this.teams.createMembership(
        companyId, // 1. teamId
        ["interviewer"], // 2. roles
        email, // 3. email (MUST be the email string)
        userId, // 4. userId
        undefined, // 5. phone (leave undefined)
        "http://localhost/login", // 6. url (Hardcoded trusted URL)
        name, // 7. name
      );
      return membership;
    } catch (error) {
      console.error("Team invite failed:", error);
      throw error;
    }
  }
}
