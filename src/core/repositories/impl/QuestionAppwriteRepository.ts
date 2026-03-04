import { Databases, ID, Query } from "appwrite";
import { IQuestionRepository } from "../IQuestionRepository";
import { Question } from "../../entities/question";

export class QuestionAppwriteRepository implements IQuestionRepository {
  constructor(
    private readonly databases: Databases,
    private readonly databaseId: string,
  ) {}

  private toDomain(doc: any): Question {
    return {
      $id: doc.$id,
      question: doc.question,
      roleId: doc.roleId,
      experienceLevelId: doc.experienceLevelId,
      category: doc.category,
      difficulty: doc.difficulty,
      companyId: doc.companyId,
      isActive: doc.isActive,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
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

  async createQuestion(data: any): Promise<Question> {
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
