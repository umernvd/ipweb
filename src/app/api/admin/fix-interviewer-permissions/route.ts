import { NextRequest, NextResponse } from "next/server";
import { Client, Databases, Query, Permission, Role } from "node-appwrite";

const DB_ID = "interview_pro_db";
const COLLECTION_ID = "interviewers";
const PAGE_SIZE = 100;

function getAdminDb(): Databases {
  const client = new Client()
    .setEndpoint(
      process.env.APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1",
    )
    .setProject(process.env.APPWRITE_PROJECT_ID || "interviewpro")
    .setKey(process.env.APPWRITE_API_KEY || "");
  return new Databases(client);
}

async function fetchAllInterviewers(db: Databases): Promise<any[]> {
  const docs: any[] = [];
  let offset = 0;

  while (true) {
    const res = await db.listDocuments(DB_ID, COLLECTION_ID, [
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
 * Merges read("any") into the document's existing permissions.
 * Preserves all existing permissions and avoids duplicates.
 */
function buildMergedPermissions(doc: any): string[] {
  const existing: string[] = doc.$permissions ?? [];
  const anyRead = Permission.read(Role.any());

  if (existing.includes(anyRead)) return existing; // already has it, no-op
  return [anyRead, ...existing];
}

export async function POST(_request: NextRequest) {
  try {
    const db = getAdminDb();
    const interviewers = await fetchAllInterviewers(db);

    let updated = 0;
    let skipped = 0;
    let failed = 0;
    const errors: { id: string; email: string; reason: string }[] = [];

    for (const doc of interviewers) {
      const merged = buildMergedPermissions(doc);

      // If permissions didn't change, skip to avoid unnecessary writes
      if (merged.length === (doc.$permissions ?? []).length) {
        skipped++;
        continue;
      }

      try {
        await db.updateDocument(DB_ID, COLLECTION_ID, doc.$id, {}, merged);
        updated++;
      } catch (err: any) {
        errors.push({
          id: doc.$id,
          email: doc.email ?? "unknown",
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
    console.error("fix-interviewer-permissions error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 },
    );
  }
}
