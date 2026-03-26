import { NextRequest, NextResponse } from "next/server";
import { Client, Databases, Query } from "node-appwrite";

const DB_ID = "interview_pro_db";
const COMPANY_ID = "69b1478e003001880a55";

// Direct level ID remaps — old id → new id, no name resolution needed.
// Add more entries here if additional stale IDs are discovered.
const LEVEL_REMAP: Record<string, string> = {
  "69b149b6001d936ebda1": "69b3f64d001d94e2d56b", // old level → current Intern
  "69b149b0000286fabb59": "69b3f64d001d94e2d56b", // old Junior → current level (adjust target if needed)
};

// Direct role ID remaps
const ROLE_REMAP: Record<string, string> = {
  "69b1496b002c1c009292": "69b149a8002fe699b35c", // old PM → current Project Manager
};

function getAdminDb() {
  const client = new Client()
    .setEndpoint("https://cloud.appwrite.io/v1")
    .setProject("interviewpro")
    .setKey(process.env.APPWRITE_API_KEY || "");
  return new Databases(client);
}

async function fetchAllQuestions(db: Databases) {
  const docs: any[] = [];
  let offset = 0;
  const limit = 100;
  while (true) {
    const res = await db.listDocuments(DB_ID, "questions", [
      Query.equal("companyId", COMPANY_ID),
      Query.limit(limit),
      Query.offset(offset),
    ]);
    docs.push(...res.documents);
    if (res.documents.length < limit) break;
    offset += limit;
  }
  return docs;
}

export async function POST(_request: NextRequest) {
  try {
    const db = getAdminDb();
    const questions = await fetchAllQuestions(db);

    let updated = 0;
    let skipped = 0;
    let failed = 0;
    const errors: { id: string; reason: string }[] = [];

    for (const q of questions) {
      const patch: Record<string, string> = {};

      const newLevelId = LEVEL_REMAP[q.experienceLevelId];
      if (newLevelId) patch.experienceLevelId = newLevelId;

      const newRoleId = ROLE_REMAP[q.roleId];
      if (newRoleId) patch.roleId = newRoleId;

      if (Object.keys(patch).length === 0) {
        skipped++;
        continue;
      }

      try {
        await db.updateDocument(DB_ID, "questions", q.$id, patch);
        updated++;
      } catch (err: any) {
        errors.push({ id: q.$id, reason: err.message });
        failed++;
      }
    }

    return NextResponse.json({
      success: true,
      total: questions.length,
      updated,
      skipped,
      failed,
      errors,
    });
  } catch (err: any) {
    console.error("migrate-question-ids error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 },
    );
  }
}
