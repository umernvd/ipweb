import { NextRequest, NextResponse } from "next/server";
import { Client, Databases } from "node-appwrite";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get("companyId");
    const jwt = searchParams.get("jwt");

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

    // Fetch the company document
    const companyDoc = await databases.getDocument(
      "interview_pro_db",
      "companies",
      companyId,
    );

    // Check if rootDriveFolderId exists (indicates successful connection)
    const isConnected = !!(companyDoc as any).rootDriveFolderId;

    return NextResponse.json({ isConnected }, { status: 200 });
  } catch (error) {
    console.error("Error checking Google Drive status:", error);
    return NextResponse.json(
      { error: "Failed to check connection status" },
      { status: 500 },
    );
  }
}
