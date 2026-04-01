import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { Client, Databases, Users, Account } from "node-appwrite";
import { decryptToken } from "@/lib/encryption";

export async function POST(request: NextRequest) {
  try {
    // --- STEP 1: Extract and Verify JWT from Authorization Header ---
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid Authorization header" },
        { status: 401 },
      );
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Initialize a standard client (NO API KEY) specifically to verify the JWT
    const authClient = new Client()
      .setEndpoint("https://cloud.appwrite.io/v1")
      .setProject("interviewpro")
      .setJWT(token);

    const account = new Account(authClient);
    let userId: string;
    try {
      // Cryptographic Verification: This throws if the JWT is invalid, expired, or forged
      const user = await account.get();
      userId = user.$id;
    } catch (error) {
      console.error("JWT verification failed:", error);
      return NextResponse.json(
        { error: "Invalid, expired, or forged JWT session" },
        { status: 401 },
      );
    }

    // --- STEP 2: Parse Request Body ---
    const {
      interviewerId,
      companyId: requestCompanyId,
      candidateName,
      fileName,
      fileType,
    } = await request.json();

    console.log("📦 [init-upload] Body received:", {
      interviewerId,
      companyId: requestCompanyId,
      candidateName,
      fileName,
      fileType,
    });

    // Validate required fields
    if (!interviewerId || !candidateName || !fileName || !fileType) {
      console.error("❌ [init-upload] Missing required fields:", {
        interviewerId: !!interviewerId,
        candidateName: !!candidateName,
        fileName: !!fileName,
        fileType: !!fileType,
      });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // --- STEP 3: Initialize Appwrite Admin SDK for Database Operations ---
    const appwriteClient = new Client()
      .setEndpoint("https://cloud.appwrite.io/v1")
      .setProject("interviewpro")
      .setKey(process.env.APPWRITE_API_KEY || "");

    const databases = new Databases(appwriteClient);

    // --- STEP 4: Fetch interviewer document ---
    const interviewerDoc = await databases.getDocument(
      "interview_pro_db",
      "interviewers",
      interviewerId,
    );
    const companyId = (interviewerDoc as any).companyId;
    const interviewerName = (interviewerDoc as any).name;
    // Field is stored as interviewerDriveFolderId in Appwrite — use it as a fast-path cache
    let interviewerFolderId: string =
      (interviewerDoc as any).interviewerDriveFolderId || "";
    const interviewerUserId = (interviewerDoc as any).userId;

    // Verify tenant isolation: JWT proves authentication; companyId match enforces tenancy.
    if (companyId !== requestCompanyId) {
      return NextResponse.json(
        { error: "Forbidden: Interviewer does not belong to this company" },
        { status: 403 },
      );
    }

    // Self-heal stale userId: sync the interviewer doc to the current JWT subject.
    if (interviewerUserId !== userId) {
      try {
        await databases.updateDocument(
          "interview_pro_db",
          "interviewers",
          interviewerId,
          { userId },
        );
        console.log(`Synced stale userId on interviewer ${interviewerId}`);
      } catch (syncError) {
        console.warn("Failed to sync userId on interviewer doc:", syncError);
        // Non-fatal: continue with the upload
      }
    }

    if (!companyId) {
      return NextResponse.json(
        { error: "Interviewer not associated with a company" },
        { status: 400 },
      );
    }

    // --- STEP 5: Fetch company document ---
    const companyDoc = await databases.getDocument(
      "interview_pro_db",
      "companies",
      companyId,
    );
    const rootDriveFolderId = (companyDoc as any).rootDriveFolderId;
    const encryptedRefreshToken = (companyDoc as any).googleRefreshToken;

    if (!rootDriveFolderId || !encryptedRefreshToken) {
      console.error("❌ [init-upload] Google Drive not connected:", {
        rootDriveFolderId: rootDriveFolderId || "MISSING",
        googleRefreshToken: encryptedRefreshToken ? "present" : "MISSING",
        companyId,
      });
      return NextResponse.json(
        { error: "Company has not connected Google Drive" },
        { status: 400 },
      );
    }

    // --- STEP 6: Decrypt refresh token ---
    let refreshToken: string;
    try {
      refreshToken = decryptToken(encryptedRefreshToken);
    } catch (decryptError) {
      console.error("Failed to decrypt refresh token:", decryptError);
      return NextResponse.json(
        { error: "Failed to decrypt credentials" },
        { status: 500 },
      );
    }

    // --- STEP 7: Initialize OAuth2 client and get fresh access token ---
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`,
    );

    oauth2Client.setCredentials({ refresh_token: refreshToken });

    let accessToken: string;
    try {
      const { credentials } = await oauth2Client.refreshAccessToken();
      accessToken = credentials.access_token || "";
      if (!accessToken) {
        throw new Error("No access token received");
      }
    } catch (tokenError) {
      console.error("Failed to refresh access token:", tokenError);
      return NextResponse.json(
        { error: "Failed to refresh Google credentials" },
        { status: 500 },
      );
    }

    // --- STEP 8: Initialize Google Drive API ---
    const drive = google.drive({ version: "v3", auth: oauth2Client });

    // --- STEP 9: Find or create Interviewer Folder (idempotent) ---
    // Use the cached interviewerDriveFolderId if available; otherwise search/create and cache it.
    try {
      if (!interviewerFolderId) {
        const sanitizedName = interviewerName.replace(/'/g, "\\'");
        const searchResult = await drive.files.list({
          q: `name='${sanitizedName}' and '${rootDriveFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
          spaces: "drive",
          fields: "files(id)",
          pageSize: 1,
        });

        if (searchResult.data.files && searchResult.data.files.length > 0) {
          interviewerFolderId = searchResult.data.files[0].id || "";
          console.log(
            `Found existing interviewer folder: ${interviewerFolderId}`,
          );
        } else {
          const folder = await drive.files.create({
            requestBody: {
              name: interviewerName,
              mimeType: "application/vnd.google-apps.folder",
              parents: [rootDriveFolderId],
            },
            fields: "id",
          });
          interviewerFolderId = folder.data.id || "";
          console.log(`Created interviewer folder: ${interviewerFolderId}`);
        }

        // Persist the resolved folder ID so future calls skip the search
        if (interviewerFolderId) {
          try {
            await databases.updateDocument(
              "interview_pro_db",
              "interviewers",
              interviewerId,
              {
                interviewerDriveFolderId: interviewerFolderId,
              },
            );
          } catch (cacheErr) {
            console.warn("Failed to cache interviewerDriveFolderId:", cacheErr);
          }
        }
      } else {
        console.log(`Using cached interviewer folder: ${interviewerFolderId}`);
      }

      if (!interviewerFolderId) {
        throw new Error("No interviewer folder ID resolved");
      }
    } catch (folderError) {
      console.error(
        "Failed to find or create interviewer folder:",
        folderError,
      );
      return NextResponse.json(
        { error: "Failed to find or create interviewer folder" },
        { status: 500 },
      );
    }

    // --- STEP 10: Search for Existing Candidate Folder, Create if Not Found ---
    let candidateFolderId: string;
    try {
      // Sanitize candidate name to prevent query injection
      const sanitizedCandidateName = candidateName.replace(/'/g, "\\'");
      // Search for existing candidate folder
      const searchQuery = `name='${sanitizedCandidateName}' and '${interviewerFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`;
      const searchResult = await drive.files.list({
        q: searchQuery,
        spaces: "drive",
        fields: "files(id)",
        pageSize: 1,
      });

      if (searchResult.data.files && searchResult.data.files.length > 0) {
        // Folder already exists, reuse it
        candidateFolderId = searchResult.data.files[0].id || "";
        console.log(`Found existing candidate folder: ${candidateFolderId}`);
      } else {
        // Folder doesn't exist, create it
        const fileMetadata = {
          name: candidateName,
          mimeType: "application/vnd.google-apps.folder",
          parents: [interviewerFolderId],
        };

        const folder = await drive.files.create({
          requestBody: fileMetadata,
          fields: "id",
        });

        candidateFolderId = folder.data.id || "";
        console.log(`Created new candidate folder: ${candidateFolderId}`);
      }

      if (!candidateFolderId) {
        throw new Error("No folder ID returned from Google Drive");
      }
    } catch (folderError) {
      console.error(
        "Failed to search or create candidate folder:",
        folderError,
      );
      return NextResponse.json(
        { error: "Failed to search or create candidate folder" },
        { status: 500 },
      );
    }

    // --- STEP 11: Generate Resumable Upload URL using raw fetch ---
    let uploadUrl: string;
    try {
      const uploadUrlResponse = await fetch(
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            "X-Upload-Content-Type": fileType,
          },
          body: JSON.stringify({
            name: fileName,
            parents: [candidateFolderId],
          }),
        },
      );

      uploadUrl = uploadUrlResponse.headers.get("Location") || "";

      if (!uploadUrl) {
        throw new Error("Failed to extract Location header from Google Drive");
      }

      console.log(`Generated resumable upload URL for: ${fileName}`);
    } catch (uploadError) {
      console.error("Failed to generate resumable upload URL:", uploadError);
      return NextResponse.json(
        { error: "Failed to generate upload URL" },
        { status: 500 },
      );
    }

    // --- STEP 12: Return response to mobile app ---
    return NextResponse.json(
      {
        uploadUrl,
        candidateFolderId,
        interviewerFolderId,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error in init-upload:", error);
    return NextResponse.json(
      { error: "Failed to initialize upload" },
      { status: 500 },
    );
  }
}
