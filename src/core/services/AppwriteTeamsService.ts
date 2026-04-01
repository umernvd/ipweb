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
      // Use userId-based membership to add user directly without email invite
      // Email invites require the user to click an acceptance link before
      // they become active team members — which breaks RLS reads immediately after registration
      const membership = await this.teams.createMembership(
        companyId, // teamId
        ["interviewer"], // roles
        undefined, // email — omit to skip invite flow
        userId, // userId — direct add, no confirmation needed
        undefined, // phone
        undefined, // url — not needed when using userId
        name, // name
      );
      return membership;
    } catch (error) {
      console.error("Team membership failed:", error);
      throw error;
    }
  }
}
