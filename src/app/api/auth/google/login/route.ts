import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { Client, Account } from "node-appwrite";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    // Parse companyId and jwt from JSON body
    const body = await request.json();
    const { companyId, jwt } = body;

    if (!companyId || !jwt) {
      return NextResponse.json(
        { error: "Missing required parameters: companyId and jwt" },
        { status: 400 },
      );
    }

    // Validate companyId format (alphanumeric, max 36 chars)
    if (!/^[a-zA-Z0-9]{1,36}$/.test(companyId)) {
      return NextResponse.json(
        { error: "Invalid companyId format" },
        { status: 400 },
      );
    }

    // JWT Verification: Initialize Appwrite SDK with JWT
    const appwriteClient = new Client()
      .setEndpoint("https://cloud.appwrite.io/v1")
      .setProject("interviewpro")
      .setJWT(jwt);

    const account = new Account(appwriteClient);

    // Verify user and check companyId match
    const user = await account.get();
    const userCompanyId = (user.prefs as any)?.companyId;

    if (userCompanyId !== companyId) {
      return NextResponse.json(
        { error: "Unauthorized: companyId mismatch" },
        { status: 403 },
      );
    }

    // CSRF Cookie: Set oauth_intent cookie
    const cookieStore = await cookies();
    cookieStore.set("oauth_intent", companyId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 600, // 10 minutes
    });

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

    // Return URL as JSON (no server-side redirect)
    return NextResponse.json({ url: authUrl });
  } catch (error) {
    console.error("Error generating Google OAuth URL:", error);

    // Handle JWT verification errors
    if (error instanceof Error && error.message.includes("Invalid JWT")) {
      return NextResponse.json(
        { error: "Invalid or expired session" },
        { status: 401 },
      );
    }

    return NextResponse.json(
      { error: "Failed to initiate Google Drive authorization" },
      { status: 500 },
    );
  }
}
