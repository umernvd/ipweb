export interface Question {
  $id: string;
  question: string;
  roleId: string;
  experienceLevelId: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  companyId: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
