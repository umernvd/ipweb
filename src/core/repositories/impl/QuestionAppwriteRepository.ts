import { Databases, ID, Query, Models } from "appwrite";
import { IQuestionRepository } from "../IQuestionRepository";
import { Question } from "../../entities/question";

export class QuestionAppwriteRepository implements IQuestionRepository {
  constructor(
    private readonly databases: Databases,
    private readonly databaseId: string,
  ) {}

  private toDomain(doc: Models.Document): Question {
    return {
      $id: doc.$id,
      question: (doc as any).question,
      roleId: (doc as any).roleId,
      experienceLevelId: (doc as any).experienceLevelId,
      category: (doc as any).category,
      difficulty: (doc as any).difficulty,
      companyId: (doc as any).companyId,
      isActive: (doc as any).isActive,
      createdAt: (doc as any).createdAt,
      updatedAt: (doc as any).updatedAt,
    };
  }

  async getQuestions(companyId: string): Promise<Question[]> {
    const response = await this.databases.listDocuments(
      this.databaseId,
      "questions",
      [Query.equal("companyId", companyId)],
    );
    return response.documents.map((doc) => this.toDomain(doc));
  }

  async createQuestion(data: {
    companyId: string;
    question: string;
    roleId: string;
    experienceLevelId: string;
    category: string;
    difficulty: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }): Promise<Question> {
    const response = await this.databases.createDocument(
      this.databaseId,
      "questions",
      ID.unique(),
      data,
    );
    return this.toDomain(response);
  }

  async updateQuestion(id: string, data: Partial<Question>): Promise<Question> {
    const response = await this.databases.updateDocument(
      this.databaseId,
      "questions",
      id,
      data,
    );
    return this.toDomain(response);
  }

  async deleteQuestion(id: string): Promise<void> {
    await this.databases.deleteDocument(this.databaseId, "questions", id);
  }
}
