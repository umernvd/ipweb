import { NextResponse } from "next/server";
import { ID, Query, Permission, Role } from "node-appwrite";
import { createAdminClient } from "@/lib/appwriteAdminClient";
import { sendInterviewerOnboardingEmail } from "@/lib/emailService";

// Ambiguity-Free Auth Code Generator (No 0, O, 1, I, l)
const generateSecureAuthCode = () => {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export async function POST(req: Request) {
  try {
    const { email, name, companyId } = await req.json();
    // Generate it right here on the server
    const finalAuthCode = generateSecureAuthCode();
    const { users, databases, teams } = await createAdminClient();

    // 1. STRICT DB PRE-CHECK
    const existingDocs = await databases.listDocuments(
      "interview_pro_db",
      "interviewers",
      [Query.equal("email", email)],
    );
    if (existingDocs.total > 0) {
      return NextResponse.json(
        { error: "An interviewer with this email already exists." },
        { status: 409 },
      );
    }

    // 2. ORPHAN CLEANUP (Ensures clean slate)
    try {
      const existingUsers = await users.list([Query.equal("email", email)]);
      if (existingUsers.total > 0) {
        await users.delete(existingUsers.users[0].$id);
      }
    } catch (e) {
      // User doesn't exist, proceed safely
    }

    // 3. CREATE AUTH USER
    // Password must match Flutter app's convention: authCode + "_MagicLogin"
    const authUser = await users.create(
      ID.unique(),
      email,
      undefined,
      finalAuthCode + "_MagicLogin",
      name,
    );
    const userId = authUser.$id;

    // CRITICAL GUARD: Eradicate null userId fallback
    if (!userId) {
      console.error(
        "❌ CRITICAL: Cannot create document without a valid Auth userId",
      );
      return NextResponse.json(
        { error: "CRITICAL: Auth user creation failed - no userId available" },
        { status: 500 },
      );
    }

    // --- ATOMIC TRANSACTION BLOCK STARTS ---
    try {
      // 4. CREATE DB DOC (With Explicit Permissions!)
      const document = await databases.createDocument(
        "interview_pro_db",
        "interviewers",
        ID.unique(),
        {
          name,
          email,
          companyId,
          userId,
          authCode: finalAuthCode,
          isActive: true,
          status: "Active",
        },
        [
          // Allow unauthenticated reads so Flutter pre-auth login query can find the document
          Permission.read(Role.any()),
          // Give the specific user read/write access to their own profile
          Permission.read(Role.user(userId)),
          Permission.update(Role.user(userId)),
          // Give the company team read/write access
          Permission.read(Role.team(companyId)),
          Permission.update(Role.team(companyId)),
          Permission.delete(Role.team(companyId)),
        ],
      );

      // SUCCESS: Everything worked.
      // Background non-critical operations - don't wait for them

      // Add to team directly via userId — no email invite, no confirmation needed
      teams
        .createMembership(
          companyId,
          ["interviewer"],
          undefined,
          userId,
          undefined,
          undefined,
          name,
        )
        .catch((teamError) => {
          console.error("⚠️ Failed to add interviewer to team:", teamError);
        });

      // Send onboarding email — fire-and-forget, never blocks or rolls back
      databases
        .getDocument("interview_pro_db", "companies", companyId)
        .then((companyDoc) => {
          const companyName = (companyDoc as any).name || "Your Company";
          return sendInterviewerOnboardingEmail(
            email,
            name,
            companyName,
            finalAuthCode,
          );
        })
        .catch((emailError) => {
          console.error("⚠️ Failed to send onboarding email:", emailError);
        });

      return NextResponse.json(document, { status: 201 });
    } catch (transactionError: any) {
      // 🚨 ROLLBACK: The DB creation failed!
      // Destroy the Auth user so we don't leave broken data behind.
      console.error(
        "Transaction failed! Rolling back Auth User...",
        transactionError.message,
      );
      await users.delete(userId);
      throw transactionError; // Pass error to the outer catch for the 500 response
    }
    // --- ATOMIC TRANSACTION BLOCK ENDS ---
  } catch (error: any) {
    console.error("CRITICAL CREATION ERROR:", error.message);
    return NextResponse.json(
      { error: error.message || "Failed to create interviewer" },
      { status: 500 },
    );
  }
}
