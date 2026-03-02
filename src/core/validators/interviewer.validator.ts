import { z } from "zod";

export const interviewerSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Please enter a valid email address"),
  status: z.enum(["Active", "Inactive"]),
});

export type InterviewerFormValues = z.infer<typeof interviewerSchema>;
