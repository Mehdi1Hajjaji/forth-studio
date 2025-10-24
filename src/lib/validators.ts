import { z } from "zod";

const cuid = () => z.string().cuid({ message: "Invalid identifier" });

function ensureSingleTarget<
  T extends {
    storyId?: string | null;
    projectId?: string | null;
    submissionId?: string | null;
  },
>(ctx: z.RefinementCtx, data: T) {
  const targets = [
    data.storyId ? "storyId" : null,
    data.projectId ? "projectId" : null,
    data.submissionId ? "submissionId" : null,
  ].filter(Boolean);

  if (targets.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Specify exactly one target resource.",
    });
  } else if (targets.length > 1) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Multiple targets provided (${targets.join(
        ", ",
      )}). Select only one.`,
    });
  }
}

export const commentInputSchema = z
  .object({
    authorId: cuid().optional(),
    body: z.string().trim().min(3, "Comment is too short.").max(2000),
    storyId: cuid().optional(),
    projectId: cuid().optional(),
    submissionId: cuid().optional(),
  })
  .superRefine((data, ctx) => ensureSingleTarget(ctx, data));

export type CommentInput = z.infer<typeof commentInputSchema>;

export const submissionInputSchema = z.object({
  userId: cuid().optional(),
  problemSlug: z.string().trim().min(1, "Problem slug is required."),
  language: z.string().trim().min(1, "Language is required."),
  code: z.string().min(10, "Code snippet is too short."),
  notes: z.string().trim().max(4000).optional(),
  makePublic: z.boolean().optional(),
});

export type SubmissionInput = z.infer<typeof submissionInputSchema>;

export const voteInputSchema = z
  .object({
    userId: cuid().optional(),
    value: z.union([z.literal(1), z.literal(-1), z.literal(0)]).default(1),
    storyId: cuid().optional(),
    projectId: cuid().optional(),
    submissionId: cuid().optional(),
  })
  .superRefine((data, ctx) => ensureSingleTarget(ctx, data));

export type VoteInput = z.infer<typeof voteInputSchema>;

export function parseCommentInput(payload: unknown): CommentInput {
  return commentInputSchema.parse(payload);
}

export function parseSubmissionInput(payload: unknown): SubmissionInput {
  return submissionInputSchema.parse(payload);
}

export function parseVoteInput(payload: unknown): VoteInput {
  return voteInputSchema.parse(payload);
}

// Auth-related validation
export const registerInputSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  name: z.string().trim().min(1).max(80).optional(),
  username: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters.')
    .max(30, 'Username must be at most 30 characters.')
    .regex(/^[a-z0-9_.-]+$/i, 'Username can only contain letters, numbers, dots, underscores, and hyphens.')
    .optional(),
  role: z.enum(['student', 'mentor', 'investor']).optional(),
  universityId: cuid().optional(),
});

export type RegisterInput = z.infer<typeof registerInputSchema>;

export const requestResetSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
});

export type RequestResetInput = z.infer<typeof requestResetSchema>;

export const resetPasswordSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  token: z.string().min(16),
  newPassword: z.string().min(8, 'Password must be at least 8 characters.'),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export function parseRegisterInput(payload: unknown): RegisterInput {
  return registerInputSchema.parse(payload);
}

export function parseRequestReset(payload: unknown): RequestResetInput {
  return requestResetSchema.parse(payload);
}

export function parseResetPassword(payload: unknown): ResetPasswordInput {
  return resetPasswordSchema.parse(payload);
}

export const updateProfileSchema = z.object({
  role: z.enum(['student', 'mentor', 'investor']).optional(),
  universityId: cuid().nullable().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(8, 'Current password is required.'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters.'),
});

export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;

export function parseUpdateProfile(payload: unknown): UpdateProfileInput {
  return updateProfileSchema.parse(payload);
}

export function parseUpdatePassword(payload: unknown): UpdatePasswordInput {
  return updatePasswordSchema.parse(payload);
}

export const failPostInputSchema = z.object({
  projectAttempt: z
    .string()
    .trim()
    .min(10, 'Describe what you attempted (at least 10 characters).')
    .max(240, 'Keep the attempt description under 240 characters.'),
  failureReason: z
    .string()
    .trim()
    .min(20, 'Share a bit more about why it failed (20+ characters).')
    .max(2000, 'Failure reason is too long.'),
  lessonLearned: z
    .string()
    .trim()
    .min(20, 'Tell us what you learned (20+ characters).')
    .max(2000, 'Lesson learned is too long.'),
});

export type FailPostInput = z.infer<typeof failPostInputSchema>;

export const failPostCommentSchema = z.object({
  body: z.string().trim().min(3, 'Comment is too short.').max(1000, 'Comment is too long.'),
});

export type FailPostCommentInput = z.infer<typeof failPostCommentSchema>;

export function parseFailPostInput(payload: unknown): FailPostInput {
  return failPostInputSchema.parse(payload);
}

export function parseFailPostComment(payload: unknown): FailPostCommentInput {
  return failPostCommentSchema.parse(payload);
}

// ============================
// Code & Cry feature validators
// ============================
export const codeCrySessionCreateSchema = z.object({
  title: z.string().trim().min(3, 'Title is too short.').max(120),
  description: z.string().trim().max(2000).optional(),
  isAnonymous: z.boolean().optional(),
  scheduledFor: z.coerce.date().optional(),
});

export type CodeCrySessionCreate = z.infer<typeof codeCrySessionCreateSchema>;

export const chatMessageInputSchema = z.object({
  message: z.string().trim().min(1, 'Message cannot be empty.').max(2000),
  isAnonymous: z.boolean().optional(),
  senderName: z.string().trim().min(2).max(80).optional(),
});

export type ChatMessageInput = z.infer<typeof chatMessageInputSchema>;

export const helpRequestInputSchema = z.object({
  topic: z.string().trim().min(3, 'Topic is too short.').max(140),
  details: z.string().trim().max(2000).optional(),
  isAnonymous: z.boolean().optional(),
  requesterName: z.string().trim().min(2).max(80).optional(),
});

export type HelpRequestInput = z.infer<typeof helpRequestInputSchema>;

export function parseCodeCrySessionCreate(payload: unknown): CodeCrySessionCreate {
  return codeCrySessionCreateSchema.parse(payload);
}

export function parseChatMessageInput(payload: unknown): ChatMessageInput {
  return chatMessageInputSchema.parse(payload);
}

export function parseHelpRequestInput(payload: unknown): HelpRequestInput {
  return helpRequestInputSchema.parse(payload);
}
