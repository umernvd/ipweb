import { NextRequest, NextResponse } from "next/server";
import {
  Client,
  Databases,
  Query,
  Permission,
  Role as AppwriteRole,
  ID,
} from "node-appwrite";

interface BulkQuestionRequest {
  companyId: string;
  questions: Array<{
    questionText: string;
    roleName: string;
    experienceLevel: string;
    category: string;
    difficulty: string;
  }>;
}

interface MappedQuestion {
  questionText: string;
  roleId: string;
  experienceLevelId: string;
  category: string;
  difficulty: string;
}

interface ImportError {
  row: number;
  message: string;
  data: any;
}

/**
 * Process questions in batches to avoid Appwrite rate limits
 */
async function processBatch(
  databases: Databases,
  questions: MappedQuestion[],
  companyId: string,
  batchSize: number = 10,
): Promise<{ successCount: number; errors: ImportError[] }> {
  let successCount = 0;
  const errors: ImportError[] = [];

  // Process in chunks of batchSize
  for (let i = 0; i < questions.length; i += batchSize) {
    const batch = questions.slice(i, i + batchSize);

    // Process batch in parallel
    const batchPromises = batch.map(async (question, batchIndex) => {
      const globalIndex = i + batchIndex;
      try {
        const now = new Date().toISOString();

        await databases.createDocument(
          "interview_pro_db",
          "questions",
          ID.unique(),
          {
            question: question.questionText,
            roleId: question.roleId,
            experienceLevelId: question.experienceLevelId,
            category: question.category,
            difficulty: question.difficulty,
            companyId: companyId,
            isActive: true,
            createdAt: now,
            updatedAt: now,
          },
          [
            Permission.read(AppwriteRole.team(companyId)),
            Permission.write(AppwriteRole.team(companyId)),
            Permission.update(AppwriteRole.team(companyId)),
            Permission.delete(AppwriteRole.team(companyId)),
          ],
        );

        return { success: true, index: globalIndex };
      } catch (error: any) {
        return {
          success: false,
          index: globalIndex,
          error: error.message || "Failed to create question",
        };
      }
    });

    // Wait for batch to complete
    const batchResults = await Promise.all(batchPromises);

    // Process results
    batchResults.forEach((result) => {
      if (result.success) {
        successCount++;
      } else {
        errors.push({
          row: result.index + 1,
          message: result.error,
          data: questions[result.index],
        });
      }
    });

    // Small delay between batches to be respectful to Appwrite
    if (i + batchSize < questions.length) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  return { successCount, errors };
}

export async function POST(request: NextRequest) {
  try {
    const body: BulkQuestionRequest = await request.json();
    const { companyId, questions } = body;

    // Validate request
    if (!companyId || !questions || !Array.isArray(questions)) {
      return NextResponse.json(
        { error: "Missing required fields: companyId, questions" },
        { status: 400 },
      );
    }

    if (questions.length === 0) {
      return NextResponse.json(
        { error: "No questions provided" },
        { status: 400 },
      );
    }

    if (questions.length > 1000) {
      return NextResponse.json(
        { error: "Maximum 1000 questions allowed per batch" },
        { status: 400 },
      );
    }

    // Initialize Appwrite server SDK
    const appwriteClient = new Client()
      .setEndpoint("https://cloud.appwrite.io/v1")
      .setProject("interviewpro")
      .setKey(process.env.APPWRITE_API_KEY || "");

    const databases = new Databases(appwriteClient);

    // Fetch all roles and levels for this company
    const [rolesResponse, levelsResponse] = await Promise.all([
      databases.listDocuments("interview_pro_db", "roles", [
        Query.equal("companyId", companyId),
      ]),
      databases.listDocuments("interview_pro_db", "experience_levels", [
        Query.equal("companyId", companyId),
      ]),
    ]);

    // Create lookup maps for faster matching
    const roleMap = new Map<string, string>();
    rolesResponse.documents.forEach((role: any) => {
      roleMap.set(role.name.toLowerCase().trim(), role.$id);
    });

    const levelMap = new Map<string, string>();
    levelsResponse.documents.forEach((level: any) => {
      levelMap.set(level.title.toLowerCase().trim(), level.$id);
    });

    // Map and validate questions
    const mappedQuestions: MappedQuestion[] = [];
    const mappingErrors: ImportError[] = [];

    questions.forEach((question, index) => {
      const roleName = question.roleName.toLowerCase().trim();
      const levelName = question.experienceLevel.toLowerCase().trim();

      // Find role ID
      const roleId = roleMap.get(roleName);
      if (!roleId) {
        mappingErrors.push({
          row: index + 1,
          message: `Role "${question.roleName}" not found in your company`,
          data: question,
        });
        return;
      }

      // Find level ID
      const levelId = levelMap.get(levelName);
      if (!levelId) {
        mappingErrors.push({
          row: index + 1,
          message: `Experience level "${question.experienceLevel}" not found in your company`,
          data: question,
        });
        return;
      }

      // Validate question text
      if (!question.questionText.trim()) {
        mappingErrors.push({
          row: index + 1,
          message: "Question text cannot be empty",
          data: question,
        });
        return;
      }

      // Validate difficulty
      const validDifficulties = ["Easy", "Medium", "Hard"];
      if (!validDifficulties.includes(question.difficulty)) {
        mappingErrors.push({
          row: index + 1,
          message: `Invalid difficulty "${question.difficulty}". Must be: ${validDifficulties.join(", ")}`,
          data: question,
        });
        return;
      }

      mappedQuestions.push({
        questionText: question.questionText.trim(),
        roleId,
        experienceLevelId: levelId,
        category: question.category.trim() || "General",
        difficulty: question.difficulty,
      });
    });

    // If no valid questions after mapping, return error
    if (mappedQuestions.length === 0) {
      return NextResponse.json({
        success: false,
        successCount: 0,
        totalCount: questions.length,
        errors: mappingErrors,
      });
    }

    // Process valid questions in batches
    const { successCount, errors: processingErrors } = await processBatch(
      databases,
      mappedQuestions,
      companyId,
    );

    // Combine mapping and processing errors
    const allErrors = [...mappingErrors, ...processingErrors];

    return NextResponse.json({
      success: successCount > 0,
      successCount,
      totalCount: questions.length,
      errors: allErrors,
    });
  } catch (error: any) {
    console.error("Bulk import error:", error);
    return NextResponse.json(
      { error: error?.message || "Bulk import failed" },
      { status: 500 },
    );
  }
}
