import { z } from "zod";

export const interviewerSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Please enter a valid email address"),
  status: z.enum(["active", "inactive"]),
});

export type InterviewerFormValues = z.infer<typeof interviewerSchema>;
