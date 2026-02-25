import { z } from "zod";

// 1. Validation for a Single Section
export const blueprintSectionSchema = z.object({
  id: z.string(), // We need this for React keys
  title: z.string().min(3, "Title must be at least 3 characters"),
  category: z.string().min(1, "Please select a category"),
  questionCount: z.coerce
    .number()
    .min(1, "At least 1 question required")
    .max(10, "Max 10 questions per section"),
  durationMinutes: z.coerce
    .number()
    .min(5, "Minimum 5 minutes")
    .max(60, "Max 60 minutes per section"),
});

// 2. Validation for the Entire Blueprint
export const blueprintSchema = z.object({
  name: z.string().min(5, "Blueprint name must be at least 5 characters"),
  description: z.string().optional(),
  roleId: z.string().min(1, "You must assign a Role"),
  levelId: z.string().min(1, "You must assign a Seniority Level"),

  // The Dynamic Array
  structure: z
    .array(blueprintSectionSchema)
    .min(1, "You must add at least one section to the interview")
    .max(10, "An interview cannot have more than 10 sections"),
});

// 3. Export the Type for use in the Component
export type BlueprintFormValues = z.infer<typeof blueprintSchema>;
