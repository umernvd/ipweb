import { NextRequest, NextResponse } from "next/server";
import {
  Account,
  ID,
  Client,
  Databases,
  Permission,
  Role as AppwriteRole,
} from "node-appwrite";
import { AppwriteTeamsService } from "@/core/services/AppwriteTeamsService";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, companyName } = body;

    if (!email || !password || !companyName) {
      return NextResponse.json(
        { error: "Missing required fields: email, password, companyName" },
        { status: 400 },
      );
    }

    // Initialize Appwrite server SDK
    const appwriteClient = new Client()
      .setEndpoint("https://cloud.appwrite.io/v1")
      .setProject("interviewpro")
      .setKey(process.env.APPWRITE_API_KEY || "");

    const account = new Account(appwriteClient);
    const databases = new Databases(appwriteClient);
    const teamsService = new AppwriteTeamsService();

    // 1. Create user account
    const user = await account.create(
      ID.unique(),
      email,
      password,
      companyName,
    );

    // 2. Create company document with team-based permissions
    const companyId = ID.unique();
    const company = await databases.createDocument(
      "interview_pro_db",
      "companies",
      companyId,
      {
        name: companyName,
        email: email,
        status: "pending",
        total_interviews: 0,
      },
      [
        Permission.read(AppwriteRole.team(companyId)),
        Permission.write(AppwriteRole.team(companyId)),
        Permission.update(AppwriteRole.team(companyId)),
        Permission.delete(AppwriteRole.team(companyId)),
      ],
    );

    // 3. Create Appwrite Team for the company
    await teamsService.createCompanyTeam(companyId, companyName);

    // 4. Add the company admin to the team
    await teamsService.addInterviewerToTeam(companyId, email, companyName);

    return NextResponse.json(
      {
        success: true,
        userId: user.$id,
        companyId: company.$id,
        message: "Company registered successfully",
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Registration error:", error);

    // Handle specific Appwrite errors
    if (error?.code === 400 && error?.message?.includes("email")) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: error?.message || "Registration failed" },
      { status: 500 },
    );
  }
}
