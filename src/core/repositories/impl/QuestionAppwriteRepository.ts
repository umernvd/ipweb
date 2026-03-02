import { Databases, ID, Query } from "appwrite";
import { IQuestionRepository } from "../IQuestionRepository";
import { Question } from "../../entities/question";

export class QuestionAppwriteRepository implements IQuestionRepository {
  constructor(
    private readonly databases: Databases,
    private readonly databaseId: string,
  ) {}

  async getQuestions(companyId: string): Promise<Question[]> {
    const response = await this.databases.listDocuments(
      this.databaseId,
      "questions",
      [Query.equal("companyId", companyId)],
    );
    return response.documents as unknown as Question[];
  }

  async createQuestion(data: any): Promise<Question> {
    const response = await this.databases.createDocument(
      this.databaseId,
      "questions",
      ID.unique(),
      data,
    );
    return response as unknown as Question;
  }

  async updateQuestion(id: string, data: Partial<Question>): Promise<Question> {
    const response = await this.databases.updateDocument(
      this.databaseId,
      "questions",
      id,
      data,
    );
    return response as unknown as Question;
  }

  async deleteQuestion(id: string): Promise<void> {
    await this.databases.deleteDocument(this.databaseId, "questions", id);
  }
}
