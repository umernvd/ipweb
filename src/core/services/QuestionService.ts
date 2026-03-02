import { IQuestionRepository } from "../repositories/IQuestionRepository";
import { Question } from "../entities/question";

export class QuestionService {
  constructor(private readonly repository: IQuestionRepository) {}

  async getAll(companyId: string): Promise<Question[]> {
    return this.repository.getQuestions(companyId);
  }

  async create(data: {
    companyId: string;
    questionText: string;
    roleId: string;
    levelId: string;
    section: string;
    difficulty: string;
  }): Promise<Question> {
    return this.repository.createQuestion(data);
  }

  async update(id: string, data: Partial<Question>): Promise<Question> {
    return this.repository.updateQuestion(id, data);
  }

  async delete(id: string): Promise<void> {
    return this.repository.deleteQuestion(id);
  }
}
