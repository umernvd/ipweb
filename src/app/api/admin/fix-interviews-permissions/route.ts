import { NextRequest, NextResponse } from "next/server";
import { Client, Databases, Query, Permission, Role } from "node-appwrite";

const DB_ID = "interview_pro_db";
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

async function fetchAll(db: Databases): Promise<any[]> {
  const docs: any[] = [];
  let offset = 0;
  while (true) {
    const res = await db.listDocuments(DB_ID, "interviews", [
      Query.limit(PAGE_SIZE),
      Query.offset(offset),
    ]);
    docs.push(...res.documents);
    if (res.documents.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }
  return docs;
}

function mergePermissions(doc: any): string[] {
  const existing: string[] = doc.$permissions ?? [];
  const anyRead = Permission.read(Role.any());
  if (existing.includes(anyRead)) return existing;
  return [anyRead, ...existing];
}

export async function POST(_request: NextRequest) {
  try {
    const db = getAdminDb();
    const docs = await fetchAll(db);

    let updated = 0,
      skipped = 0,
      failed = 0;
    const errors: { id: string; reason: string }[] = [];

    for (const doc of docs) {
      const merged = mergePermissions(doc);
      if (merged.length === (doc.$permissions ?? []).length) {
        skipped++;
        continue;
      }
      try {
        await db.updateDocument(DB_ID, "interviews", doc.$id, {}, merged);
        updated++;
      } catch (err: any) {
        errors.push({ id: doc.$id, reason: err.message });
        failed++;
      }
    }

    return NextResponse.json({
      success: true,
      total: docs.length,
      updated,
      skipped,
      failed,
      errors,
    });
  } catch (err: any) {
    console.error("fix-interviews-permissions error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 },
    );
  }
}
