import { z } from "zod";

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Password must contain at least one symbol"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const updateEmailSchema = z.object({
  newEmail: z.string().email("Please enter a valid email address"),
  currentPassword: z
    .string()
    .min(1, "Password is required to verify this change"),
});

export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
export type UpdateEmailValues = z.infer<typeof updateEmailSchema>;
