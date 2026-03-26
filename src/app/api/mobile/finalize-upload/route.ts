import { NextRequest, NextResponse } from "next/server";
import { ID, Permission, Role } from "node-appwrite";
import { Client, Databases, Users, Account } from "node-appwrite";

/**
 * POST /api/mobile/finalize-upload
 *
 * Webhook endpoint for Flutter mobile app to finalize interview upload.
 * After the app streams an audio file to Google Drive, it calls this endpoint
 * to officially log the interview record into Appwrite.
 *
 * Expected Request Body:
 * {
 *   "interviewerId": "string",
 *   "companyId": "string",
 *   "candidateName": "string",
 *   "sessionUri": "string",  // Google Drive file URL
 *   "roleId": "string?",     // Optional
 *   "levelId": "string?",    // Optional - level ID for the interview
 *   "status": "string?"      // Optional - interview status (defaults to "pending")
 * }
 *
 * Returns:
 * {
 *   "status": "success",
 *   "interviewId": "string"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // --- STEP 1: Extract Authorization Header ---
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid Authorization header" },
        { status: 401 },
      );
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // --- STEP 2: Cryptographic JWT Verification ---
    // Initialize a standard client (NO API KEY) specifically to verify the JWT
    const authClient = new Client()
      .setEndpoint(
        process.env.APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1",
      )
      .setProject(process.env.APPWRITE_PROJECT_ID || "interviewpro")
      .setJWT(token); // The token extracted from the Bearer header

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

    // --- STEP 3: Initialize Appwrite Admin SDK for Database Operations ---
    const appwriteClient = new Client()
      .setEndpoint("https://cloud.appwrite.io/v1")
      .setProject("interviewpro")
      .setKey(process.env.APPWRITE_API_KEY || "");

    const databases = new Databases(appwriteClient);

    // --- STEP 4: Parse Request Body ---
    let body: any;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const {
      interviewerId,
      companyId,
      candidateName,
      sessionUri,
      roleId,
      cvUri,
      levelId,
      status: requestStatus,
    } = body;

    // Validate required fields
    if (!interviewerId || !companyId || !candidateName || !sessionUri) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: interviewerId, companyId, candidateName, sessionUri",
        },
        { status: 400 },
      );
    }

    // --- STEP 5: Verify Interviewer Belongs to Company ---
    let interviewerDoc: any;
    try {
      interviewerDoc = await databases.getDocument(
        "interview_pro_db",
        "interviewers",
        interviewerId,
      );

      // Verify tenant isolation: JWT proves authentication; companyId match enforces tenancy.
      if (interviewerDoc.companyId !== companyId) {
        return NextResponse.json(
          { error: "Forbidden: Interviewer does not belong to this company" },
          { status: 403 },
        );
      }

      // Self-heal stale userId: sync the interviewer doc to the current JWT subject.
      if (interviewerDoc.userId !== userId) {
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
    } catch (docError) {
      console.error("Failed to fetch interviewer document:", docError);
      return NextResponse.json(
        { error: "Interviewer not found" },
        { status: 404 },
      );
    }

    // --- STEP 6: Create Interview Document in Appwrite ---
    try {
      const interviewDocument = await databases.createDocument(
        "interview_pro_db",
        "interviews",
        ID.unique(),
        {
          candidateId: "", // REQUIRED BY SCHEMA, DO NOT REMOVE
          interviewerId,
          companyId,
          roleId: roleId || null,
          levelId: levelId || null,
          driveFileUrl: sessionUri,
          driveFolderId: null,
          driveFileId: null,
          cvDriveUrl: cvUri || null,
          aiSummary: null,
          score: null,
          status: "completed",
          startedAt: new Date().toISOString(),
          candidateName: candidateName || "Unknown Candidate",
        },
        [
          // Team-level permissions: all team members can read, update, delete
          Permission.read(Role.team(companyId)),
          Permission.update(Role.team(companyId)),
          Permission.delete(Role.team(companyId)),
        ],
      );

      // --- STEP 7: Return Success Response ---
      return NextResponse.json(
        {
          status: "success",
          interviewId: interviewDocument.$id,
          driveFileUrl: interviewDocument.driveFileUrl,
        },
        { status: 200 },
      );
    } catch (createError: any) {
      console.error("Failed to create interview document:", createError);
      return NextResponse.json(
        { error: "Failed to create interview record" },
        { status: 500 },
      );
    }
  } catch (error: any) {
    console.error("Unexpected error in finalize-upload:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
