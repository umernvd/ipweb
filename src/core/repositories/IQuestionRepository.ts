import { Question } from "../entities/question";

export interface IQuestionRepository {
  getQuestions(companyId: string): Promise<Question[]>;
  createQuestion(data: {
    companyId: string;
    question: string;
    roleId: string;
    experienceLevelId: string;
    category: string;
    difficulty: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }): Promise<Question>;
  updateQuestion(id: string, data: Partial<Question>): Promise<Question>;
  deleteQuestion(id: string): Promise<void>;
}
