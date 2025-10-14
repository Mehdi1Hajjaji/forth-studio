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
