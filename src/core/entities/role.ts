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
  roleId: string;
  companyId: string;
  sortOrder: number;
  isActive: boolean;
}
