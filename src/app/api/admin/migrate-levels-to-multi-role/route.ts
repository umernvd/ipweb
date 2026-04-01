import { NextRequest, NextResponse } from "next/server";
import { Client, Databases, Query } from "node-appwrite";

/**
 * POST /api/admin/migrate-levels-to-multi-role
 *
 * Migrates existing experience levels from single roleId (string) to multiple roleIds (array).
 * This is a one-time migration to support multi-role levels.
 *
 * NOTE: The roleIds attribute must already exist in the Appwrite collection schema.
 * If you get "Unknown attribute: roleIds" errors, you need to:
 * 1. Go to Appwrite Console
 * 2. Navigate to interview_pro_db > experience_levels collection
 * 3. Add a new attribute: roleIds (String, Array, Required)
 * 4. Then run this migration
 *
 * Safe migration:
 * - Only processes levels with roleId field (old format)
 * - Converts roleId: "role-123" → roleIds: ["role-123"]
 * - Logs all changes for audit trail
 * - Returns detailed report of migration
 *
 * Returns:
 * {
 *   "status": "success",
 *   "total": 10,
 *   "migrated": 10,
 *   "skipped": 0,
 *   "failed": 0,
 *   "errors": []
 * }
 */
export async function POST(_request: NextRequest) {
  console.log("🚀 [migrate-levels] Starting experience level migration");

  try {
    // Initialize Appwrite Admin SDK
    const endpoint =
      process.env.APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1";
    const projectId = process.env.APPWRITE_PROJECT_ID || "interviewpro";
    const apiKey = process.env.APPWRITE_API_KEY || "";

    if (!apiKey) {
      console.error("❌ [migrate-levels] APPWRITE_API_KEY is not set");
      return NextResponse.json(
        {
          status: "error",
          error: "APPWRITE_API_KEY environment variable is not configured",
        },
        { status: 500 },
      );
    }

    const appwriteClient = new Client()
      .setEndpoint(endpoint)
      .setProject(projectId)
      .setKey(apiKey);

    const databases = new Databases(appwriteClient);

    // --- STEP 1: Fetch all experience levels ---
    console.log("📋 [migrate-levels] Fetching all experience levels...");
    const response = await databases.listDocuments(
      "interview_pro_db",
      "experience_levels",
      [Query.limit(1000)], // Fetch up to 1000 levels
    );

    const levels = response.documents;
    console.log(`📊 [migrate-levels] Found ${levels.length} total levels`);

    let migrated = 0;
    let skipped = 0;
    let failed = 0;
    const errors: Array<{ levelId: string; title: string; error: string }> = [];

    // --- STEP 2: Process each level ---
    for (const level of levels) {
      const levelId = level.$id;
      const title = (level as any).title || "Unknown";
      const oldRoleId = (level as any).roleId;
      const existingRoleIds = (level as any).roleIds;

      try {
        // Skip if already migrated (has roleIds array with values)
        if (
          existingRoleIds &&
          Array.isArray(existingRoleIds) &&
          existingRoleIds.length > 0
        ) {
          console.log(
            `⏭️  [migrate-levels] Skipping level "${title}" (${levelId}) - already migrated with roleIds: ${existingRoleIds.join(", ")}`,
          );
          skipped++;
          continue;
        }

        // Skip if no roleId to migrate
        if (!oldRoleId) {
          console.log(
            `⏭️  [migrate-levels] Skipping level "${title}" (${levelId}) - no roleId found`,
          );
          skipped++;
          continue;
        }

        // Validate roleId is a string
        if (typeof oldRoleId !== "string") {
          console.warn(
            `⚠️  [migrate-levels] Skipping level "${title}" (${levelId}) - roleId is not a string: ${typeof oldRoleId}`,
          );
          skipped++;
          continue;
        }

        // Migrate: convert roleId to roleIds array
        console.log(
          `🔄 [migrate-levels] Migrating level "${title}" (${levelId}): roleId="${oldRoleId}" → roleIds=["${oldRoleId}"]`,
        );

        const updateData: Record<string, any> = {
          roleIds: [oldRoleId], // Convert to array
        };

        // Remove old roleId field by setting it to null
        // (Appwrite will remove null fields)
        updateData.roleId = null;

        await databases.updateDocument(
          "interview_pro_db",
          "experience_levels",
          levelId,
          updateData,
        );

        console.log(
          `✅ [migrate-levels] Successfully migrated level "${title}" (${levelId})`,
        );
        migrated++;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.error(
          `❌ [migrate-levels] Failed to migrate level "${title}" (${levelId}):`,
          errorMessage,
        );
        errors.push({
          levelId,
          title,
          error: errorMessage,
        });
        failed++;
      }
    }

    // Summary
    console.log("📊 [migrate-levels] Migration complete:");
    console.log(`   Total: ${levels.length}`);
    console.log(`   Migrated: ${migrated}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Failed: ${failed}`);

    if (errors.length > 0) {
      console.error("❌ [migrate-levels] Errors encountered:");
      errors.forEach((err) => {
        console.error(`   - ${err.title} (${err.levelId}): ${err.error}`);
      });
    }

    return NextResponse.json(
      {
        status: "success",
        total: levels.length,
        migrated,
        skipped,
        failed,
        errors: errors.length > 0 ? errors : undefined,
        note:
          failed > 0
            ? "If you see 'Unknown attribute: roleIds' errors, you need to add the roleIds attribute to the Appwrite collection schema first"
            : undefined,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("❌ [migrate-levels] Migration failed:", error);
    return NextResponse.json(
      {
        status: "error",
        error: error.message || "Migration failed",
      },
      { status: 500 },
    );
  }
}
