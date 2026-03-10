import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { Client, Databases } from "node-appwrite";

export async function GET(request: NextRequest) {
  try {
    // Extract authorization code and state from query parameters
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state"); // This is the companyId
    const error = searchParams.get("error");

    // Handle authorization errors
    if (error) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/company/settings?error=google_auth_denied`,
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/company/settings?error=missing_params`,
      );
    }

    const companyId = state;

    // Initialize OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`,
    );

    // Exchange authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.refresh_token) {
      console.error("No refresh token received from Google");
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/company/settings?error=no_refresh_token`,
      );
    }

    // Initialize Appwrite server SDK
    const appwriteClient = new Client()
      .setEndpoint("https://cloud.appwrite.io/v1")
      .setProject("interviewpro")
      .setKey(process.env.APPWRITE_API_KEY || "");

    const databases = new Databases(appwriteClient);

    // Update the company document with the refresh token
    await databases.updateDocument("interview_pro_db", "companies", companyId, {
      driveRefreshToken: tokens.refresh_token,
      driveConnectedAt: new Date().toISOString(),
    });

    // Redirect back to settings page with success message
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/company/settings?success=google_drive_connected`,
    );
  } catch (error) {
    console.error("Error in Google OAuth callback:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/company/settings?error=callback_failed`,
    );
  }
}
