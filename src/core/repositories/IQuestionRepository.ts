import { Question } from "../entities/question";

export interface IQuestionRepository {
  getQuestions(companyId: string): Promise<Question[]>;
  createQuestion(data: {
    companyId: string;
    questionText: string;
    roleId: string;
    levelId: string;
    section: string;
    difficulty: string;
  }): Promise<Question>;
  updateQuestion(id: string, data: Partial<Question>): Promise<Question>;
  deleteQuestion(id: string): Promise<void>;
}
