import { z } from "zod";

export const QuestionCategoryEnum = z.enum([
  "behavioral",
  "technical",
  "situational",
  "leadership",
  "problem_solving",
]);

export const CreateQuestionSchema = z.object({
  text: z.string().min(10, "Question must be at least 10 characters").max(500),
  category: QuestionCategoryEnum,
});

export const TextResponseSchema = z.object({
  question_id: z.string().uuid(),
  text_content: z
    .string()
    .min(20, "Response must be at least 20 characters")
    .max(5000),
});

export const AnalyzeRequestSchema = z.object({
  response_id: z.string().uuid(),
  frames: z.array(z.string()).max(20).optional(),
});

export type CreateQuestionInput = z.infer<typeof CreateQuestionSchema>;
export type TextResponseInput = z.infer<typeof TextResponseSchema>;
export type AnalyzeRequestInput = z.infer<typeof AnalyzeRequestSchema>;
