import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import {
  Client,
  Databases,
  Permission,
  Role as AppwriteRole,
} from "node-appwrite";
import { getOrCreateFolder, uploadFileToDrive } from "@/lib/googleDriveUtils";

const INTERVIEW_PRO_ROOT_FOLDER = "InterviewPro";

export async function POST(request: NextRequest) {
  try {
    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const companyId = formData.get("companyId") as string;
    const roleName = formData.get("roleName") as string;
    const candidateName = formData.get("candidateName") as string;
    const candidateId = formData.get("candidateId") as string;
    const interviewerId = formData.get("interviewerId") as string;
    const roleId = formData.get("roleId") as string | null;

    // Validate required fields
    if (
      !file ||
      !companyId ||
      !candidateName ||
      !candidateId ||
      !interviewerId
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: file, companyId, candidateName, candidateId, interviewerId",
        },
        { status: 400 },
      );
    }

    // Initialize Appwrite server SDK to fetch company and refresh token
    const appwriteClient = new Client()
      .setEndpoint("https://cloud.appwrite.io/v1")
      .setProject("interviewpro")
      .setKey(process.env.APPWRITE_API_KEY || "");

    const databases = new Databases(appwriteClient);

    // Fetch company document to get driveRefreshToken
    const company = await databases.getDocument(
      "interview_pro_db",
      "companies",
      companyId,
    );

    const driveRefreshToken = (company as any).driveRefreshToken;
    if (!driveRefreshToken) {
      return NextResponse.json(
        { error: "Company has not connected Google Drive" },
        { status: 400 },
      );
    }

    // Initialize Google OAuth2 client with refresh token
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`,
    );

    oauth2Client.setCredentials({
      refresh_token: driveRefreshToken,
    });

    // Initialize Google Drive API
    const drive = google.drive({ version: "v3", auth: oauth2Client });

    // Convert file to buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileName = file.name || `interview_${Date.now()}`;
    const fileMimeType = file.type || "application/octet-stream";

    // Create folder hierarchy: InterviewPro -> [Role Name] -> [Candidate Name]
    const folderCache: { [key: string]: string } = {};

    // Get or create InterviewPro root folder
    const rootFolderId = await getOrCreateFolder(
      drive,
      INTERVIEW_PRO_ROOT_FOLDER,
      "root",
      folderCache,
    );

    // Get or create role folder (use roleName if provided, otherwise "Unassigned")
    const roleFolderName = roleName || "Unassigned";
    const roleFolderId = await getOrCreateFolder(
      drive,
      roleFolderName,
      rootFolderId,
      folderCache,
    );

    // Get or create candidate folder
    const candidateFolderId = await getOrCreateFolder(
      drive,
      candidateName,
      roleFolderId,
      folderCache,
    );

    // Upload file to candidate folder
    const { fileId, webViewLink } = await uploadFileToDrive(
      drive,
      fileName,
      fileBuffer,
      fileMimeType,
      candidateFolderId,
    );

    // Create interview document in Appwrite
    const interviewData = {
      candidateId,
      interviewerId,
      companyId,
      roleId: roleId || null,
      driveFileUrl: webViewLink,
      driveFolderId: candidateFolderId,
      driveFileId: fileId,
      aiSummary: null,
      score: null,
      status: "started" as const,
      startedAt: new Date().toISOString(),
    };

    const interviewDoc = await databases.createDocument(
      "interview_pro_db",
      "interviews",
      "unique()",
      interviewData,
      [
        Permission.read(AppwriteRole.team(companyId)),
        Permission.write(AppwriteRole.team(companyId)),
        Permission.update(AppwriteRole.team(companyId)),
        Permission.delete(AppwriteRole.team(companyId)),
      ],
    );

    return NextResponse.json(
      {
        success: true,
        interviewId: interviewDoc.$id,
        driveFileUrl: webViewLink,
        driveFileId: fileId,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error in interview upload:", error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes("refresh token")) {
        return NextResponse.json(
          { error: "Google Drive token expired or invalid" },
          { status: 401 },
        );
      }
      if (error.message.includes("quota")) {
        return NextResponse.json(
          { error: "Google Drive quota exceeded" },
          { status: 429 },
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to upload interview file" },
      { status: 500 },
    );
  }
}
