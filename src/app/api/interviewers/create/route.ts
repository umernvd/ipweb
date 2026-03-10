import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import {
  Client,
  Databases,
  Permission,
  Role as AppwriteRole,
} from "node-appwrite";
import { AppwriteTeamsService } from "@/core/services/AppwriteTeamsService";
import { sendInterviewerOnboardingEmail } from "@/lib/emailService";

/**
 * Generate a cryptographically secure 6-character alphanumeric auth code
 * Uses Node.js crypto module for secure random generation
 */
function generateAuthCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const bytes = randomBytes(6);
  return Array.from(bytes)
    .map((byte) => chars[byte % chars.length])
    .join("");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId, name, email, status } = body;

    // Validate required fields (authCode is NOT expected from client)
    if (!companyId || !name || !email || !status) {
      return NextResponse.json(
        { error: "Missing required fields: companyId, name, email, status" },
        { status: 400 },
      );
    }

    // Generate secure auth code on the backend using Node.js crypto
    const authCode = generateAuthCode();

    // Initialize Appwrite server SDK
    const appwriteClient = new Client()
      .setEndpoint("https://cloud.appwrite.io/v1")
      .setProject("interviewpro")
      .setKey(process.env.APPWRITE_API_KEY || "");

    const databases = new Databases(appwriteClient);
    const teamsService = new AppwriteTeamsService();

    // Fetch company name for email
    const company = await databases.getDocument(
      "interview_pro_db",
      "companies",
      companyId,
    );
    const companyName = (company as any).name || "Your Company";

    // Create interviewer document with team-based permissions
    const interviewerDoc = await databases.createDocument(
      "interview_pro_db",
      "interviewers",
      "unique()",
      {
        companyId,
        name,
        email,
        status,
        authCode, // Generated securely on backend
      },
      [
        Permission.read(AppwriteRole.team(companyId)),
        Permission.write(AppwriteRole.team(companyId)),
        Permission.update(AppwriteRole.team(companyId)),
        Permission.delete(AppwriteRole.team(companyId)),
      ],
    );

    // Add interviewer to company team
    try {
      await teamsService.addInterviewerToTeam(companyId, email, name);
    } catch (teamError) {
      console.error("Failed to add interviewer to team:", teamError);
      // Don't fail the entire operation if team membership fails
    }

    // Send onboarding email with the generated auth code
    try {
      await sendInterviewerOnboardingEmail(email, name, companyName, authCode);
    } catch (emailError) {
      console.error("Failed to send onboarding email:", emailError);
      // Don't fail the entire operation if email fails
      // The interviewer is still created successfully
    }

    return NextResponse.json(
      {
        success: true,
        interviewerId: interviewerDoc.$id,
        message: "Interviewer created successfully",
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error creating interviewer:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create interviewer" },
      { status: 500 },
    );
  }
}
