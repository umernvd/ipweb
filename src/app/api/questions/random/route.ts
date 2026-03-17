import { NextRequest, NextResponse } from "next/server";
import { Client, Databases, Query } from "node-appwrite";

// Force dynamic evaluation on every request - disable all caching
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Initialize Appwrite server SDK with admin credentials
const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("interviewpro")
  .setKey(process.env.APPWRITE_API_KEY || "");

const databases = new Databases(client);
const databaseId = "interview_pro_db";
const collectionId = "questions";

// Fisher-Yates shuffle algorithm for secure randomization
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function GET(request: NextRequest) {
  console.log("🚀🚀🚀 ENDPOINT HIT: /api/questions/random 🚀🚀🚀");
  console.log("📍 Full URL:", request.url);

  try {
    // Extract query parameters
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get("companyId");
    const roleId = searchParams.get("roleId");
    const experienceLevelId = searchParams.get("experienceLevelId");

    // Log incoming parameters for debugging
    console.log("🔍 [Random Questions] Incoming Parameters:");
    console.log(`   - companyId: ${companyId}`);
    console.log(`   - roleId: ${roleId}`);
    console.log(`   - experienceLevelId: ${experienceLevelId}`);

    // Validate required parameters
    if (!companyId) {
      return NextResponse.json(
        { error: "Missing required parameter: companyId" },
        { status: 400 },
      );
    }

    // Build query filters
    const queries: string[] = [
      Query.equal("companyId", companyId),
      Query.equal("isActive", true), // Only fetch active questions
    ];

    if (roleId) {
      queries.push(Query.equal("roleId", roleId));
    }

    if (experienceLevelId) {
      queries.push(Query.equal("experienceLevelId", experienceLevelId));
    }

    console.log(
      `📋 [Random Questions] Query Filters: ${JSON.stringify(queries)}`,
    );

    // Fetch all matching questions with pagination
    let allQuestions: any[] = [];
    let offset = 0;
    const pageSize = 100;
    let hasMore = true;

    while (hasMore) {
      const paginationQueries = [
        ...queries,
        Query.limit(pageSize),
        Query.offset(offset),
      ];

      console.log(
        `📄 [Random Questions] Fetching page at offset ${offset} with ${paginationQueries.length} query conditions`,
      );

      const response = await databases.listDocuments(
        databaseId,
        collectionId,
        paginationQueries,
      );

      console.log(
        `🔍 DB Returned ${response.documents.length} Qs | Role: ${roleId} | Level: ${experienceLevelId} | Sent Company: ${companyId}`,
      );
      console.log(
        `✅ [Random Questions] Retrieved ${response.documents.length} documents from offset ${offset}`,
      );

      allQuestions = allQuestions.concat(response.documents);

      // Check if there are more documents to fetch
      if (response.documents.length < pageSize) {
        hasMore = false;
      } else {
        offset += pageSize;
      }
    }

    console.log(
      `🎯 [Random Questions] Total questions found: ${allQuestions.length}`,
    );

    // Return error if no questions found
    if (allQuestions.length === 0) {
      console.warn(
        `⚠️ [Random Questions] No questions found for companyId: ${companyId}, roleId: ${roleId}, experienceLevelId: ${experienceLevelId}`,
      );
      return NextResponse.json(
        { error: "No questions found matching the criteria" },
        { status: 404 },
      );
    }

    // Shuffle the questions
    const shuffledQuestions = shuffleArray(allQuestions);

    // Take exactly 10 questions (or fewer if less than 10 available)
    const randomQuestions = shuffledQuestions.slice(0, 10);

    console.log(
      `🎲 [Random Questions] Returning ${randomQuestions.length} random questions`,
    );

    // Return the random questions
    return NextResponse.json({
      success: true,
      count: randomQuestions.length,
      questions: randomQuestions,
    });
  } catch (error) {
    console.error(
      "❌ [Random Questions] Error fetching random questions:",
      error,
    );
    return NextResponse.json(
      { error: "Failed to fetch random questions" },
      { status: 500 },
    );
  }
}
