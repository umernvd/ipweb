import { NextRequest, NextResponse } from "next/server";
import { Client, Databases } from "node-appwrite";

export async function GET(request: NextRequest) {
  try {
    // Get companyId from query parameters
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get("companyId");

    if (!companyId) {
      return NextResponse.json(
        { error: "Missing companyId parameter" },
        { status: 400 },
      );
    }

    // Initialize Appwrite server SDK
    const appwriteClient = new Client()
      .setEndpoint("https://cloud.appwrite.io/v1")
      .setProject("interviewpro")
      .setKey(process.env.APPWRITE_API_KEY || "");

    const databases = new Databases(appwriteClient);

    // Fetch company document
    const company = await databases.getDocument(
      "interview_pro_db",
      "companies",
      companyId,
    );

    // Check if driveRefreshToken exists (never expose the token itself)
    const isConnected = !!(company as any).driveRefreshToken;

    return NextResponse.json(
      {
        isConnected,
        connectedAt: isConnected ? (company as any).driveConnectedAt : null,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error checking Google Drive status:", error);
    return NextResponse.json(
      { error: "Failed to check connection status" },
      { status: 500 },
    );
  }
}
