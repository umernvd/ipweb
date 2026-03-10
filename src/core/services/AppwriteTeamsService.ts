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

  /**
   * Add an interviewer to a company team
   * @param companyId The company ID (team ID)
   * @param email The interviewer's email
   * @param name The interviewer's name
   * @returns Membership ID
   */
  async addInterviewerToTeam(
    companyId: string,
    email: string,
    name: string,
  ): Promise<string> {
    try {
      const membership = await this.teams.createMembership(
        companyId,
        [email],
        undefined,
        undefined,
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/team-join`,
        name,
      );
      console.log(`Added interviewer ${email} to team ${companyId}`);
      return membership.$id;
    } catch (error: any) {
      // If membership already exists, that's fine - just log and continue
      if (error?.code === 409 || error?.message?.includes("already exists")) {
        console.log(`Interviewer ${email} already in team ${companyId}`);
        return "";
      }
      // Log but don't throw - team membership is not critical for operation
      console.error(
        `Error adding interviewer ${email} to team ${companyId}:`,
        error,
      );
      return "";
    }
  }
}
