"use server";

import { Client, Databases, Query, Account } from "node-appwrite";

/**
 * Initialize Admin Client with API Key
 * This client bypasses all RLS and session restrictions
 */
function getAdminClient() {
  return new Client()
    .setEndpoint("https://cloud.appwrite.io/v1")
    .setProject("interviewpro")
    .setKey(process.env.APPWRITE_API_KEY || "");
}

/**
 * Verify that the caller is the Super Admin using JWT
 * Validates the JWT and checks the user's email
 * Throws an error if verification fails
 */
async function verifySuperAdmin(jwtToken: string): Promise<void> {
  try {
    if (!jwtToken) {
      throw new Error("No JWT token provided");
    }

    // Create a session-based client to verify the user
    const sessionClient = new Client()
      .setEndpoint("https://cloud.appwrite.io/v1")
      .setProject("interviewpro");

    // Set the JWT for authentication
    sessionClient.setJWT(jwtToken);

    // Get the current user from the JWT
    const account = new Account(sessionClient);
    const user = await account.get();

    // Verify the user is the Super Admin
    if (!user || user.email !== "admin@hireai.com") {
      throw new Error(
        `Forbidden: Admin access required. User email: ${user?.email || "unknown"}`,
      );
    }
  } catch (error) {
    // Re-throw the original error message for debugging
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Unauthorized: Session verification failed");
  }
}

/**
 * Fetch all dashboard data for Super Admin
 * Uses Admin Client to bypass RLS completely
 */
export async function getSuperAdminDashboardData(jwtToken: string) {
  try {
    // Verify the caller is Super Admin
    await verifySuperAdmin(jwtToken);

    const adminClient = getAdminClient();
    const databases = new Databases(adminClient);

    const dbId = "interview_pro_db";

    // Fetch all companies (total count)
    const allCompaniesResponse = await databases.listDocuments(
      dbId,
      "companies",
      [Query.limit(1)],
    );
    const totalCompanies = allCompaniesResponse.total;

    // Fetch active companies count
    const activeCompaniesResponse = await databases.listDocuments(
      dbId,
      "companies",
      [Query.equal("status", "active"), Query.limit(1)],
    );
    const activeCompanies = activeCompaniesResponse.total;

    // Fetch pending companies count
    const pendingCompaniesResponse = await databases.listDocuments(
      dbId,
      "companies",
      [Query.equal("status", "pending"), Query.limit(1)],
    );
    const pendingCompanies = pendingCompaniesResponse.total;

    // Fetch pending companies list (with details) - limit to 50
    const pendingListResponse = await databases.listDocuments(
      dbId,
      "companies",
      [
        Query.equal("status", "pending"),
        Query.orderDesc("$createdAt"),
        Query.limit(50),
      ],
    );

    // Fetch total interviews count
    const interviewsResponse = await databases.listDocuments(
      dbId,
      "interviews",
      [Query.limit(1)],
    );
    const totalInterviews = interviewsResponse.total;

    // Map pending companies to domain entities
    const pendingCompaniesList = pendingListResponse.documents.map(
      (doc: any) => ({
        $id: doc.$id,
        name: doc.name,
        email: doc.email,
        status: doc.status,
        total_interviews: doc.total_interviews || 0,
        $createdAt: doc.$createdAt,
      }),
    );

    return {
      stats: {
        total: totalCompanies,
        active: activeCompanies,
        pending: pendingCompanies,
      },
      pendingCompanies: pendingCompaniesList,
      totalInterviews,
    };
  } catch (error) {
    console.error("Error fetching super admin dashboard data:", error);
    throw new Error(
      error instanceof Error ? error.message : "Unknown error occurred",
    );
  }
}

/**
 * Fetch all companies for Super Admin
 * Uses Admin Client to bypass RLS completely
 */
export async function getAllCompaniesAdmin(jwtToken: string) {
  try {
    // Verify the caller is Super Admin
    await verifySuperAdmin(jwtToken);

    const adminClient = getAdminClient();
    const databases = new Databases(adminClient);

    const dbId = "interview_pro_db";

    // Fetch all companies without filters - limit to 50
    const response = await databases.listDocuments(dbId, "companies", [
      Query.orderDesc("$createdAt"),
      Query.limit(50),
    ]);

    // Map to domain entities
    const companies = response.documents.map((doc: any) => ({
      $id: doc.$id,
      name: doc.name,
      email: doc.email,
      status: doc.status,
      total_interviews: doc.total_interviews || 0,
      $createdAt: doc.$createdAt,
    }));

    return companies;
  } catch (error) {
    console.error("Error fetching all companies:", error);
    throw new Error(
      error instanceof Error ? error.message : "Unknown error occurred",
    );
  }
}

/**
 * Fetch pending companies for Super Admin
 * Uses Admin Client to bypass RLS completely
 */
export async function getPendingCompaniesAdmin(jwtToken: string) {
  try {
    // Verify the caller is Super Admin
    await verifySuperAdmin(jwtToken);

    const adminClient = getAdminClient();
    const databases = new Databases(adminClient);

    const dbId = "interview_pro_db";

    // Fetch pending companies - limit to 50
    const response = await databases.listDocuments(dbId, "companies", [
      Query.equal("status", "pending"),
      Query.orderDesc("$createdAt"),
      Query.limit(50),
    ]);

    // Map to domain entities
    const companies = response.documents.map((doc: any) => ({
      $id: doc.$id,
      name: doc.name,
      email: doc.email,
      status: doc.status,
      total_interviews: doc.total_interviews || 0,
      $createdAt: doc.$createdAt,
    }));

    return companies;
  } catch (error) {
    console.error("Error fetching pending companies:", error);
    throw new Error(
      error instanceof Error ? error.message : "Unknown error occurred",
    );
  }
}

/**
 * Approve a company for Super Admin
 * Uses Admin Client to bypass RLS completely
 */
export async function approveCompanyAdmin(jwtToken: string, companyId: string) {
  try {
    // Verify the caller is Super Admin
    await verifySuperAdmin(jwtToken);

    const adminClient = getAdminClient();
    const databases = new Databases(adminClient);

    const dbId = "interview_pro_db";

    // Update company status to 'active' - STRICTLY HARDCODED PAYLOAD
    const updatedCompany = await databases.updateDocument(
      "interview_pro_db",
      "companies",
      companyId,
      { status: "active" },
    );

    // Return the updated company data
    return {
      $id: updatedCompany.$id,
      name: updatedCompany.name,
      email: updatedCompany.email,
      status: updatedCompany.status,
      total_interviews: updatedCompany.total_interviews || 0,
      $createdAt: updatedCompany.$createdAt,
    };
  } catch (error) {
    console.error("Error approving company:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to approve company",
    );
  }
}

/**
 * Reject a company for Super Admin
 * Uses Admin Client to bypass RLS completely
 */
export async function rejectCompanyAdmin(jwtToken: string, companyId: string) {
  try {
    // Verify the caller is Super Admin
    await verifySuperAdmin(jwtToken);

    const adminClient = getAdminClient();
    const databases = new Databases(adminClient);

    const dbId = "interview_pro_db";

    // Update company status to 'rejected' - STRICTLY HARDCODED PAYLOAD
    const updatedCompany = await databases.updateDocument(
      "interview_pro_db",
      "companies",
      companyId,
      { status: "rejected" },
    );

    // Return the updated company data
    return {
      $id: updatedCompany.$id,
      name: updatedCompany.name,
      email: updatedCompany.email,
      status: updatedCompany.status,
      total_interviews: updatedCompany.total_interviews || 0,
      $createdAt: updatedCompany.$createdAt,
    };
  } catch (error) {
    console.error("Error rejecting company:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to reject company",
    );
  }
}
