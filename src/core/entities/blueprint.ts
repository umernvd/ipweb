export interface BlueprintSection {
  id: string; // Unique ID for React keys
  title: string; // e.g., "Technical Basics"
  category: string; // e.g., "coding", "behavioral"
  questionCount: number;
  durationMinutes: number;
}

export interface Blueprint {
  $id: string;
  name: string;
  description?: string;
  companyId: string;
  roleId: string;
  levelId: string;
  structure: BlueprintSection[]; // We work with Arrays here, not strings
  createdAt: string;
}
