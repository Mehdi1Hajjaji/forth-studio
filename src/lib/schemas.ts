import { z } from 'zod';

export const suggestChallengeSchema = z.object({
  title: z.string().trim().min(4).max(120),
  topic: z.string().trim().min(2).max(60),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD', 'ADVANCED']).default('MEDIUM'),
  details: z.string().trim().min(10).max(2000),
});

export type SuggestChallengeInput = z.infer<typeof suggestChallengeSchema>;

