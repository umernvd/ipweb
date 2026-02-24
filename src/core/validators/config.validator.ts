import { z } from "zod";

export const roleSchema = z.object({
  name: z.string().min(2, "Role name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  icon: z.string().optional(),
});

export const levelSchema = z.object({
  title: z.string().min(2, "Level title must be at least 2 characters"),
  description: z.string().optional(),
  roleId: z.string().min(1, "You must select a role"),
  sortOrder: z.coerce.number().min(1, "Sort order must be 1 or greater"),
});

export type RoleFormValues = z.infer<typeof roleSchema>;
export type LevelFormValues = z.infer<typeof levelSchema>;
