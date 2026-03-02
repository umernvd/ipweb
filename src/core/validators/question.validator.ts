import { z } from "zod";

export const questionSchema = z.object({
  questionText: z
    .string()
    .min(10, "Question must be at least 10 characters long."),
  roleId: z.string().min(1, "Please select a Role."),
  levelId: z.string().min(1, "Please select a Level."),
  section: z.string().min(1, "Please select a Section."),
  difficulty: z.enum(["Easy", "Medium", "Hard"], {
    message: "Please select a valid difficulty.",
  }),
});

export type QuestionFormValues = z.infer<typeof questionSchema>;
