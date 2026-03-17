import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { Client, Databases } from "node-appwrite";
import { cookies } from "next/headers";
import { encryptToken } from "@/lib/encryption";

export async function GET(request: NextRequest) {
  try {
    // Extract authorization code, state, and error from query parameters
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state"); // This is the companyId
    const error = searchParams.get("error");

    // OAuth Error Check: Handle user denial or other OAuth errors
    if (error) {
      console.log("OAuth error:", error);
      return NextResponse.redirect(
        new URL("/company/settings?error=google_access_denied", request.url),
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL("/company/settings?error=missing_params", request.url),
      );
    }

    const companyId = state;

    // CSRF Protection: Read and validate oauth_intent cookie
    const cookieStore = await cookies();
    const oauthIntentCookie = cookieStore.get("oauth_intent");

    if (!oauthIntentCookie || oauthIntentCookie.value !== companyId) {
      console.error("CSRF validation failed:", {
        cookieValue: oauthIntentCookie?.value,
        stateCompanyId: companyId,
      });
      return NextResponse.redirect(
        new URL("/company/settings?error=csrf_validation_failed", request.url),
      );
    }

    // Initialize OAuth2 client with safe base URL (no hardcoded protocol)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${baseUrl}/api/auth/google/callback`,
    );

    // Exchange authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.refresh_token) {
      console.error("No refresh token received from Google");
      return NextResponse.redirect(
        new URL("/company/settings?error=no_refresh_token", request.url),
      );
    }

    // Initialize Appwrite Admin SDK
    const appwriteClient = new Client()
      .setEndpoint("https://cloud.appwrite.io/v1")
      .setProject("interviewpro")
      .setKey(process.env.APPWRITE_API_KEY || "");

    const databases = new Databases(appwriteClient);

    // Fetch the company document to get the company name and check for existing rootDriveFolderId
    const companyDoc = await databases.getDocument(
      "interview_pro_db",
      "companies",
      companyId,
    );
    const companyName = (companyDoc as any).name || "Interview Pro";
    const existingRootFolderId = (companyDoc as any).rootDriveFolderId;

    // Encrypt the refresh token before storing
    const encryptedRefreshToken = encryptToken(tokens.refresh_token);

    let rootFolderId = existingRootFolderId;

    // If no root folder exists, create one in Google Drive
    if (!existingRootFolderId) {
      try {
        // Set the credentials for the OAuth2 client
        oauth2Client.setCredentials(tokens);

        // Initialize Google Drive API
        const drive = google.drive({ version: "v3", auth: oauth2Client });

        // Create the root folder
        const fileMetadata = {
          name: `Interview Pro - ${companyName}`,
          mimeType: "application/vnd.google-apps.folder",
        };

        const folder = await drive.files.create({
          requestBody: fileMetadata,
          fields: "id",
        });

        rootFolderId = folder.data.id;
        console.log(`Created root folder: ${rootFolderId}`);
      } catch (driveError) {
        console.error("Error creating Google Drive folder:", driveError);
        // Continue without folder creation - don't fail the entire flow
      }
    }

    // Update the company document with the encrypted refresh token and root folder ID
    await databases.updateDocument("interview_pro_db", "companies", companyId, {
      googleRefreshToken: encryptedRefreshToken,
      rootDriveFolderId: rootFolderId,
      driveConnectedAt: new Date().toISOString(),
    });

    // Cleanup & Success Redirect: Delete oauth_intent cookie
    cookieStore.delete("oauth_intent");

    // Safe base URL extraction - do NOT hardcode http:// or https:// here.
    // NEXT_PUBLIC_APP_URL must contain the full origin (e.g., https://[id].ngrok-free.dev or http://localhost:3000)
    const redirectBaseUrl =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Execute the redirect
    return NextResponse.redirect(
      `${redirectBaseUrl}/company/settings?success=google_connected`,
    );
  } catch (error) {
    console.error("Error in Google OAuth callback:", error);

    // Cleanup cookie on error
    const cookieStore = await cookies();
    cookieStore.delete("oauth_intent");

    return NextResponse.redirect(
      new URL("/company/settings?error=callback_failed", request.url),
    );
  }
}
