import { IQuestionRepository } from "../repositories/IQuestionRepository";
import { Question } from "../entities/question";

export class QuestionService {
  constructor(private readonly repository: IQuestionRepository) {}

  async getAll(companyId: string): Promise<Question[]> {
    return this.repository.getQuestions(companyId);
  }

  async create(data: {
    companyId: string;
    question: string;
    roleId: string;
    experienceLevelId: string;
    category: string;
    difficulty: string;
  }): Promise<Question> {
    return this.repository.createQuestion({
      ...data,
      isActive: true,
    });
  }

  async update(id: string, data: Partial<Question>): Promise<Question> {
    return this.repository.updateQuestion(id, data);
  }

  async delete(id: string): Promise<void> {
    return this.repository.deleteQuestion(id);
  }
}
