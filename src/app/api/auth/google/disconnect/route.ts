import { NextRequest, NextResponse } from "next/server";
import { Client, Databases } from "node-appwrite";

export async function POST(request: NextRequest) {
  try {
    const { companyId, jwt } = await request.json();

    if (!companyId || !jwt) {
      return NextResponse.json(
        { error: "Missing companyId or jwt" },
        { status: 400 },
      );
    }

    // Initialize Appwrite Admin SDK
    const appwriteClient = new Client()
      .setEndpoint("https://cloud.appwrite.io/v1")
      .setProject("interviewpro")
      .setKey(process.env.APPWRITE_API_KEY || "");

    const databases = new Databases(appwriteClient);

    // Clear the Google Drive connection data from the company document
    await databases.updateDocument("interview_pro_db", "companies", companyId, {
      googleRefreshToken: null,
      rootDriveFolderId: null,
      driveConnectedAt: null,
    });

    return NextResponse.json(
      { message: "Google Drive disconnected successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error disconnecting Google Drive:", error);
    return NextResponse.json(
      { error: "Failed to disconnect Google Drive" },
      { status: 500 },
    );
  }
}
