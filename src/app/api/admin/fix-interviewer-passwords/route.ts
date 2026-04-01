import { NextRequest, NextResponse } from "next/server";
import { Client, Databases, Users, Query } from "node-appwrite";

const DB_ID = "interview_pro_db";
const PAGE_SIZE = 100;

function getAdminClient() {
  const client = new Client()
    .setEndpoint(
      process.env.APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1",
    )
    .setProject(process.env.APPWRITE_PROJECT_ID || "interviewpro")
    .setKey(process.env.APPWRITE_API_KEY || "");
  return {
    databases: new Databases(client),
    users: new Users(client),
  };
}

async function fetchAllInterviewers(databases: Databases): Promise<any[]> {
  const docs: any[] = [];
  let offset = 0;
  while (true) {
    const res = await databases.listDocuments(DB_ID, "interviewers", [
      Query.limit(PAGE_SIZE),
      Query.offset(offset),
    ]);
    docs.push(...res.documents);
    if (res.documents.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }
  return docs;
}

/**
 * POST /api/admin/fix-interviewer-passwords
 *
 * Finds every interviewer document that has an authCode and a userId,
 * then updates the corresponding Appwrite auth user's password to
 * authCode + "_MagicLogin" — matching what the Flutter app expects.
 *
 * Returns { total, updated, skipped, failed, errors }
 */
export async function POST(_request: NextRequest) {
  try {
    const { databases, users } = getAdminClient();
    const interviewers = await fetchAllInterviewers(databases);

    let updated = 0;
    let skipped = 0;
    let failed = 0;
    const errors: { id: string; email: string; reason: string }[] = [];

    for (const doc of interviewers) {
      const { $id, email, authCode, userId } = doc;

      // Skip if missing required fields
      if (!authCode || !userId) {
        skipped++;
        continue;
      }

      const correctPassword = authCode + "_MagicLogin";

      try {
        // Update the Appwrite auth user's password
        await users.updatePassword(userId, correctPassword);
        updated++;
      } catch (err: any) {
        errors.push({
          id: $id,
          email: email ?? "unknown",
          reason: err.message,
        });
        failed++;
      }
    }

    return NextResponse.json({
      success: true,
      total: interviewers.length,
      updated,
      skipped,
      failed,
      errors,
    });
  } catch (err: any) {
    console.error("fix-interviewer-passwords error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 },
    );
  }
}
