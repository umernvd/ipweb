import { Client, Databases, Users, Teams } from "node-appwrite";

/**
 * Create an Appwrite Admin Client with all required services
 * Returns users, databases, and teams clients for admin operations
 * Uses server-side environment variables only (no NEXT_PUBLIC_ prefix)
 */
export function createAdminClient() {
  const client = new Client()
    .setEndpoint(
      process.env.APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1",
    )
    .setProject(process.env.APPWRITE_PROJECT_ID || "")
    .setKey(process.env.APPWRITE_API_KEY || "");

  return {
    databases: new Databases(client),
    users: new Users(client),
    teams: new Teams(client),
  };
}

/**
 * Create an Appwrite Admin Client that bypasses Row-Level Security
 * This should only be used for Super Admin operations
 * Uses node-appwrite SDK which supports setKey for admin access
 */
export function createAdminDatabases(): Databases {
  const adminClient = new Client()
    .setEndpoint("https://cloud.appwrite.io/v1")
    .setProject("interviewpro")
    .setKey(process.env.APPWRITE_API_KEY || "");

  return new Databases(adminClient);
}

/**
 * Check if the current user is a Super Admin
 * Super Admin is identified by email: admin@hireai.com
 */
export function isSuperAdmin(userEmail?: string): boolean {
  return userEmail === "admin@hireai.com";
}
