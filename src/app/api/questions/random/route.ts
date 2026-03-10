import { NextRequest, NextResponse } from "next/server";
import { Client, Databases, Query } from "node-appwrite";

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
  try {
    // Extract query parameters
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get("companyId");
    const roleId = searchParams.get("roleId");
    const experienceLevelId = searchParams.get("experienceLevelId");

    // Validate required parameters
    if (!companyId) {
      return NextResponse.json(
        { error: "Missing required parameter: companyId" },
        { status: 400 },
      );
    }

    // Build query filters
    const queries: string[] = [Query.equal("companyId", companyId)];

    if (roleId) {
      queries.push(Query.equal("roleId", roleId));
    }

    if (experienceLevelId) {
      queries.push(Query.equal("experienceLevelId", experienceLevelId));
    }

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

      const response = await databases.listDocuments(
        databaseId,
        collectionId,
        paginationQueries,
      );

      allQuestions = allQuestions.concat(response.documents);

      // Check if there are more documents to fetch
      if (response.documents.length < pageSize) {
        hasMore = false;
      } else {
        offset += pageSize;
      }
    }

    // Return error if no questions found
    if (allQuestions.length === 0) {
      return NextResponse.json(
        { error: "No questions found matching the criteria" },
        { status: 404 },
      );
    }

    // Shuffle the questions
    const shuffledQuestions = shuffleArray(allQuestions);

    // Take exactly 10 questions (or fewer if less than 10 available)
    const randomQuestions = shuffledQuestions.slice(0, 10);

    // Return the random questions
    return NextResponse.json({
      success: true,
      count: randomQuestions.length,
      questions: randomQuestions,
    });
  } catch (error) {
    console.error("Error fetching random questions:", error);
    return NextResponse.json(
      { error: "Failed to fetch random questions" },
      { status: 500 },
    );
  }
}
