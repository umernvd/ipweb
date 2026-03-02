export interface Question {
  $id: string;
  text: string;
  roleId: string;
  levelId: string;
  section: string;
  difficulty: "Easy" | "Medium" | "Hard";
  companyId: string;
  createdAt?: string;
  updatedAt?: string;
}
