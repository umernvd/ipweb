export interface Role {
  $id: string;
  name: string;
  description: string;
  icon?: string;
  isActive: boolean;
  companyId: string;
}

export interface Level {
  $id: string;
  title: string;
  description: string;
  roleIds?: string[]; // Optional - can be empty for shared levels
  companyId: string;
  sortOrder: number;
  isActive: boolean;
}
