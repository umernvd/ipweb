import { NextRequest, NextResponse } from "next/server";
import { Client, Databases, Users } from "node-appwrite";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { interviewerId, companyId } = body;

    if (!interviewerId || !companyId) {
      return NextResponse.json(
        { error: "Missing required fields: interviewerId, companyId" },
        { status: 400 },
      );
    }

    // Initialize Appwrite server SDK with Admin API key
    const appwriteClient = new Client()
      .setEndpoint("https://cloud.appwrite.io/v1")
      .setProject("interviewpro")
      .setKey(process.env.APPWRITE_API_KEY || "");

    const databases = new Databases(appwriteClient);
    const users = new Users(appwriteClient);

    // Fetch the interviewer document to get the userId
    let userId: string | null = null;
    try {
      const doc = await databases.getDocument(
        "interview_pro_db",
        "interviewers",
        interviewerId,
      );
      userId = (doc as any).userId || null;
    } catch (error: any) {
      console.error("Failed to fetch interviewer document:", error);
      // Continue with deletion even if fetch fails
    }

    // Delete the database document
    try {
      await databases.deleteDocument(
        "interview_pro_db",
        "interviewers",
        interviewerId,
      );
      console.log(`Deleted interviewer document ${interviewerId}`);
    } catch (error: any) {
      console.error("Failed to delete interviewer document:", error);
      return NextResponse.json(
        { error: error?.message || "Failed to delete interviewer" },
        { status: 500 },
      );
    }

    // Delete the Auth user if userId exists
    if (userId) {
      try {
        await users.delete(userId);
        console.log(
          `Deleted Auth user ${userId} for interviewer ${interviewerId}`,
        );
      } catch (error: any) {
        console.error(`Failed to delete Auth user ${userId}:`, error);
        // Don't fail the entire operation if Auth user deletion fails
        // The database document is already deleted
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Interviewer deleted successfully",
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error deleting interviewer:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete interviewer" },
      { status: 500 },
    );
  }
}
