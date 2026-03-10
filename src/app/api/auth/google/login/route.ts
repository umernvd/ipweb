import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET(request: NextRequest) {
  try {
    // Extract companyId from query parameters
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get("companyId");

    if (!companyId) {
      return NextResponse.json(
        { error: "Missing required parameter: companyId" },
        { status: 400 },
      );
    }

    // Initialize OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`,
    );

    // Generate authorization URL with Drive scope
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: ["https://www.googleapis.com/auth/drive.file"],
      state: companyId, // Pass companyId in state for CSRF protection
      prompt: "consent", // Force consent screen to ensure refresh token is returned
    });

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("Error generating Google OAuth URL:", error);
    return NextResponse.json(
      { error: "Failed to initiate Google Drive authorization" },
      { status: 500 },
    );
  }
}
