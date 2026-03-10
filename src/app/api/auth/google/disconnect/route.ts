import { NextRequest, NextResponse } from "next/server";
import { Client, Databases } from "node-appwrite";

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const companyId = body.companyId;

    if (!companyId) {
      return NextResponse.json({ error: "Missing companyId" }, { status: 400 });
    }

    // Initialize Appwrite server SDK
    const appwriteClient = new Client()
      .setEndpoint("https://cloud.appwrite.io/v1")
      .setProject("interviewpro")
      .setKey(process.env.APPWRITE_API_KEY || "");

    const databases = new Databases(appwriteClient);

    // Update company document to remove Google Drive connection
    await databases.updateDocument("interview_pro_db", "companies", companyId, {
      driveRefreshToken: null,
      driveConnectedAt: null,
    });

    return NextResponse.json(
      { success: true, message: "Google Drive disconnected successfully" },
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
