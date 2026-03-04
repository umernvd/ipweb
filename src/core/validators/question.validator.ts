import { z } from "zod";

export const questionSchema = z.object({
  question: z.string().min(10, "Question must be at least 10 characters long."),
  roleId: z.string().min(1, "Please select a Role."),
  experienceLevelId: z.string().min(1, "Please select a Level."),
  category: z.string().min(1, "Please select a Category."),
  difficulty: z.enum(["Easy", "Medium", "Hard"], {
    message: "Please select a valid difficulty.",
  }),
});

export type QuestionFormValues = z.infer<typeof questionSchema>;
