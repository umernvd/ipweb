import { NextRequest, NextResponse } from "next/server";
import { ID, Permission, Role, Query } from "node-appwrite";
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
  console.log("🚀 [finalize-upload] Endpoint hit");
  try {
    // --- STEP 1: Extract Authorization Header ---
    const authHeader = request.headers.get("Authorization");
    console.log("🔑 [finalize-upload] Auth header present:", !!authHeader);
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error(
        "❌ [finalize-upload] Missing or invalid Authorization header",
      );
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
      const user = await account.get();
      userId = user.$id;
      console.log("✅ [finalize-upload] JWT verified, userId:", userId);
    } catch (error) {
      console.error("❌ [finalize-upload] JWT verification failed:", error);
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
      candidateEmail,
      candidatePhone,
      sessionUri,
      roleId,
      cvUri,
      levelId,
      status: requestStatus,
    } = body;

    console.log("📦 [finalize-upload] Body received:", {
      interviewerId,
      companyId,
      candidateName,
      candidateEmail: candidateEmail ? "present" : "MISSING",
      candidatePhone: candidatePhone ? "present" : "MISSING",
      sessionUri: sessionUri ? "present" : "MISSING",
      roleId,
      levelId,
    });

    // --- STEP 4A: COMPREHENSIVE INPUT VALIDATION ---
    const validationErrors: string[] = [];

    // Validate required fields
    if (
      !interviewerId ||
      typeof interviewerId !== "string" ||
      interviewerId.trim() === ""
    ) {
      validationErrors.push(
        "interviewerId is required and must be a non-empty string",
      );
    }

    if (
      !companyId ||
      typeof companyId !== "string" ||
      companyId.trim() === ""
    ) {
      validationErrors.push(
        "companyId is required and must be a non-empty string",
      );
    }

    if (
      !candidateName ||
      typeof candidateName !== "string" ||
      candidateName.trim() === ""
    ) {
      validationErrors.push(
        "candidateName is required and must be a non-empty string",
      );
    }

    if (
      !sessionUri ||
      typeof sessionUri !== "string" ||
      sessionUri.trim() === ""
    ) {
      validationErrors.push(
        "sessionUri is required and must be a non-empty string",
      );
    }

    // Validate optional fields if provided
    if (roleId !== undefined && roleId !== null) {
      if (typeof roleId !== "string" || roleId.trim() === "") {
        validationErrors.push("roleId must be a non-empty string if provided");
      }
    }

    if (levelId !== undefined && levelId !== null) {
      if (typeof levelId !== "string" || levelId.trim() === "") {
        validationErrors.push("levelId must be a non-empty string if provided");
      }
    }

    if (candidateEmail !== undefined && candidateEmail !== null) {
      if (typeof candidateEmail !== "string" || candidateEmail.trim() === "") {
        validationErrors.push(
          "candidateEmail must be a non-empty string if provided",
        );
      }
    }

    if (candidatePhone !== undefined && candidatePhone !== null) {
      if (typeof candidatePhone !== "string" || candidatePhone.trim() === "") {
        validationErrors.push(
          "candidatePhone must be a non-empty string if provided",
        );
      }
    }

    // Return validation errors if any - CRITICAL: Stop here, don't create interview
    if (validationErrors.length > 0) {
      console.error("❌ [finalize-upload] Validation failed:", {
        errors: validationErrors,
        requestBody: body,
      });
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationErrors,
        },
        { status: 400 },
      );
    }

    console.log(
      "✅ [finalize-upload] All required fields validated successfully",
    );

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
        console.error(
          "❌ [finalize-upload] Interviewer does not belong to company:",
          {
            interviewerId,
            companyId,
            interviewerCompanyId: interviewerDoc.companyId,
          },
        );
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
          console.log(`✅ Synced stale userId on interviewer ${interviewerId}`);
        } catch (syncError) {
          console.warn(
            "⚠️ Failed to sync userId on interviewer doc:",
            syncError,
          );
          // Non-fatal: continue with the upload
        }
      }
    } catch (docError) {
      console.error(
        "❌ [finalize-upload] Failed to fetch interviewer document:",
        {
          interviewerId,
          error: docError,
        },
      );
      return NextResponse.json(
        { error: "Interviewer not found or inaccessible" },
        { status: 404 },
      );
    }

    // --- STEP 5A: VALIDATE ROLE AND LEVEL EXISTENCE ---
    // Verify roleId exists if provided
    if (roleId) {
      try {
        console.log(`🔍 [finalize-upload] Validating roleId: ${roleId}`);
        const roleDoc = await databases.getDocument(
          "interview_pro_db",
          "roles",
          roleId,
        );
        console.log(`✅ [finalize-upload] Role found: ${roleDoc.$id}`);
      } catch (roleError) {
        console.error("❌ [finalize-upload] Role not found:", {
          roleId,
          error: roleError,
        });
        return NextResponse.json(
          {
            error: "Validation failed",
            details: [`roleId "${roleId}" does not exist in the system`],
          },
          { status: 409 },
        );
      }
    }

    // Verify levelId exists if provided
    if (levelId) {
      try {
        console.log(`🔍 [finalize-upload] Validating levelId: ${levelId}`);
        const levelDoc = await databases.getDocument(
          "interview_pro_db",
          "experience_levels",
          levelId,
        );
        console.log(`✅ [finalize-upload] Level found: ${levelDoc.$id}`);
      } catch (levelError) {
        console.error("❌ [finalize-upload] Level not found:", {
          levelId,
          error: levelError,
        });
        return NextResponse.json(
          {
            error: "Validation failed",
            details: [`levelId "${levelId}" does not exist in the system`],
          },
          { status: 409 },
        );
      }
    }

    // --- STEP 6: CREATE OR UPDATE CANDIDATE DOCUMENT (WITH DEDUPLICATION) ---
    let candidateId: string = "";

    try {
      // Only attempt candidate lookup if email is provided
      if (candidateEmail && candidateEmail.trim() !== "") {
        console.log(
          `🔍 [finalize-upload] Checking for existing candidate with email: ${candidateEmail}`,
        );

        // Check if candidate exists by email (tenant-isolated query)
        const existingCandidates = await databases.listDocuments(
          "interview_pro_db",
          "candidates",
          [
            Query.equal("companyId", companyId),
            Query.equal("email", candidateEmail.trim()),
          ],
        );

        if (existingCandidates.total > 0) {
          // Candidate exists - reuse and update
          candidateId = existingCandidates.documents[0].$id;
          console.log(
            `♻️ [finalize-upload] Found existing candidate: ${candidateId}`,
          );

          // Update with latest phone if provided
          if (candidatePhone && candidatePhone.trim() !== "") {
            try {
              await databases.updateDocument(
                "interview_pro_db",
                "candidates",
                candidateId,
                { phone: candidatePhone.trim() },
              );
              console.log(
                `📞 [finalize-upload] Updated candidate phone: ${candidatePhone}`,
              );
            } catch (updateError) {
              console.warn(
                `⚠️ [finalize-upload] Failed to update candidate phone:`,
                updateError,
              );
              // Non-fatal: continue with interview creation
            }
          }
        } else {
          // Candidate doesn't exist - create new
          try {
            const candidateDoc = await databases.createDocument(
              "interview_pro_db",
              "candidates",
              ID.unique(),
              {
                name: candidateName.trim(),
                email: candidateEmail.trim(),
                phone: candidatePhone ? candidatePhone.trim() : null,
                interviewerId: interviewerId,
                companyId: companyId,
              },
              [
                Permission.read(Role.any()),
                Permission.read(Role.team(companyId)),
                Permission.write(Role.team(companyId)),
                Permission.update(Role.team(companyId)),
                Permission.delete(Role.team(companyId)),
              ],
            );

            candidateId = candidateDoc.$id;
            console.log(
              `✨ [finalize-upload] Created new candidate: ${candidateId}`,
            );
            console.log(`📧 [finalize-upload] Email: ${candidateEmail}`);
            console.log(
              `📞 [finalize-upload] Phone: ${candidatePhone || "not provided"}`,
            );
          } catch (createCandidateError) {
            console.error("❌ [finalize-upload] Failed to create candidate:", {
              candidateName,
              candidateEmail,
              error: createCandidateError,
            });
            // Non-fatal: continue with interview creation without candidate link
            // This ensures robustness if candidate creation fails
          }
        }
      } else {
        console.log(
          `⚠️ [finalize-upload] No email provided, skipping candidate deduplication`,
        );
      }
    } catch (candidateError) {
      console.error(
        "❌ [finalize-upload] Unexpected error in candidate handling:",
        {
          candidateEmail,
          error: candidateError,
        },
      );
      // Non-fatal: continue with interview creation
      // This ensures robustness if candidate operations fail
    }

    // --- STEP 7: CREATE INTERVIEW DOCUMENT (ONLY AFTER ALL VALIDATIONS PASS) ---
    try {
      // CRITICAL: Double-check candidateName is not empty before creating interview
      if (!candidateName || candidateName.trim() === "") {
        console.error(
          "❌ [finalize-upload] CRITICAL: Attempted to create interview with empty candidateName",
          {
            candidateName,
            interviewerId,
            companyId,
          },
        );
        return NextResponse.json(
          {
            error: "Validation failed",
            details: ["candidateName cannot be empty"],
          },
          { status: 400 },
        );
      }

      console.log(`📝 [finalize-upload] Creating interview document with:`, {
        candidateId: candidateId || "not linked",
        candidateName: candidateName.trim(),
        interviewerId,
        companyId,
        roleId: roleId || "not specified",
        levelId: levelId || "not specified",
        sessionUri: sessionUri.substring(0, 50) + "...",
      });

      const interviewDocument = await databases.createDocument(
        "interview_pro_db",
        "interviews",
        ID.unique(),
        {
          candidateId: candidateId || "", // Empty string if candidate creation failed
          candidateName: candidateName.trim(),
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
        },
        [
          // Any authenticated or unauthenticated client can read (needed for web dashboard RLS bypass)
          Permission.read(Role.any()),
          // Team-level permissions: all team members can update, delete
          Permission.read(Role.team(companyId)),
          Permission.update(Role.team(companyId)),
          Permission.delete(Role.team(companyId)),
        ],
      );

      console.log(`✅ [finalize-upload] Interview created successfully:`, {
        interviewId: interviewDocument.$id,
        candidateId: candidateId || "not linked",
        candidateName: interviewDocument.candidateName,
        roleId: interviewDocument.roleId,
        levelId: interviewDocument.levelId,
      });

      // --- STEP 8: Return Success Response ---
      return NextResponse.json(
        {
          status: "success",
          interviewId: interviewDocument.$id,
          driveFileUrl: interviewDocument.driveFileUrl,
          candidateId: candidateId || null,
        },
        { status: 200 },
      );
    } catch (createError: any) {
      console.error(
        "❌ [finalize-upload] Failed to create interview document:",
        {
          error: createError,
          requestBody: {
            candidateId,
            candidateName,
            interviewerId,
            companyId,
            roleId,
            levelId,
            sessionUri: sessionUri.substring(0, 50) + "...",
          },
        },
      );
      return NextResponse.json(
        {
          error: "Failed to create interview record",
          details: createError.message || "Unknown error",
        },
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
