import type { Prisma } from "@prisma/client";
import {
  ProjectStatus,
  Role,
  StoryStatus,
  SubmissionStatus,
  TagDomain,
} from "@prisma/client";
import prisma from "@/lib/prisma";

export type ProblemListItem = {
  slug: string;
  title: string;
  difficulty: string;
  summary: string;
  university?: string;
  solved: number;
  tags: string[];
  updatedAt: string;
};

export async function fetchProblemList(): Promise<ProblemListItem[]> {
  const problems = await prisma.problem.findMany({
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
      submissions: {
        where: { status: SubmissionStatus.PASSED },
        select: { id: true },
      },
      createdBy: {
        include: {
          university: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return problems.map((problem) => ({
    slug: problem.slug,
    title: problem.title,
    difficulty: problem.difficulty,
    summary: problem.summary,
    university: problem.createdBy?.university?.name ?? undefined,
    solved: problem.submissions.length,
    tags: problem.tags.map((tag) => tag.tag.name),
    updatedAt: problem.updatedAt.toISOString(),
  }));
}

export async function fetchProblemDetail(slug: string) {
  const problem = await prisma.problem.findUnique({
    where: { slug },
    include: {
      tags: { include: { tag: true } },
      testcases: { orderBy: { isSample: "desc" } },
      submissions: {
        where: { status: SubmissionStatus.PASSED },
        select: { id: true },
      },
      createdBy: {
        include: {
          university: true,
        },
      },
    },
  });

  if (!problem) {
    return null;
  }

  const sample = problem.testcases.find((t) => t.isSample);
  return {
    problem,
    tags: problem.tags.map((tag) => tag.tag.name),
    sample,
    related: await prisma.problem.findMany({
      where: {
        slug: { not: slug },
        difficulty: problem.difficulty,
      },
      select: {
        slug: true,
        title: true,
      },
      take: 3,
    }),
  };
}

export type StorySummaryFilters = {
  search?: string;
  universitySlug?: string;
  tags?: string[];
  take?: number;
};

export async function fetchStorySummaries(filters?: StorySummaryFilters) {
  const { search, universitySlug, tags, take } = filters ?? {};

  const where: Prisma.StoryWhereInput = {
    status: StoryStatus.PUBLISHED,
  };

  if (search) {
    const term = search.trim();
    if (term) {
      where.OR = [
        { title: { contains: term } },
        { excerpt: { contains: term } },
        { body: { contains: term } },
        {
          tags: {
            some: {
              tag: { name: { contains: term } },
            },
          },
        },
        {
          author: {
            OR: [
              { name: { contains: term } },
              { username: { contains: term } },
            ],
          },
        },
      ];
    }
  }

  if (universitySlug) {
    where.university = { slug: universitySlug };
  }

  if (tags?.length) {
    where.tags = {
      some: {
        tag: {
          name: {
            in: tags,
          },
        },
      },
    };
  }

  const stories = await prisma.story.findMany({
    where,
    include: {
      author: true,
      university: true,
      tags: { include: { tag: true } },
    },
    orderBy: { publishedAt: "desc" },
    take: take && take > 0 ? take : undefined,
  });

  return stories.map((story) => ({
    slug: story.slug,
    title: story.title,
    summary: story.excerpt ?? story.body.slice(0, 180),
    readingTime: story.body.split(/\s+/).length > 0
      ? `${Math.max(3, Math.round(story.body.split(/\s+/).length / 200))} min read`
      : "5 min read",
    university: story.university?.name ?? "Independent",
    tags: story.tags.map((tag) => tag.tag.name),
  }));
}

export async function fetchStoryDetail(slug: string) {
  return prisma.story.findUnique({
    where: { slug, status: StoryStatus.PUBLISHED },
    include: {
      tags: { include: { tag: true } },
      author: {
        include: { university: true },
      },
      university: true,
    },
  });
}

export async function fetchProjectSummaries() {
  const projects = await prisma.project.findMany({
    include: {
      owner: true,
      university: true,
      tags: { include: { tag: true } },
      comments: { select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return projects.map((project) => ({
    slug: project.slug,
    title: project.title,
    summary: project.summary,
    status: project.status,
    feedbackCount: project.comments.length,
    author: project.owner.name ?? project.owner.username,
    university: project.university?.name ?? "Independent",
    tags: project.tags.map((tag) => tag.tag.name),
  }));
}

export async function fetchFailPosts(options?: {
  sort?: "newest" | "resilient";
  limit?: number;
  viewerId?: string | null;
}) {
  const sort = options?.sort ?? "newest";
  const limit = options?.limit ?? 20;

  const orderBy =
    sort === "resilient"
      ? [{ likesCount: "desc" as const }, { commentsCount: "desc" as const }, { createdAt: "desc" as const }]
      : [{ createdAt: "desc" as const }];

  const include: any = {
    author: {
      select: {
        id: true,
        username: true,
        name: true,
        avatarUrl: true,
        resilienceBadgeCount: true,
        resilienceBadgeEarnedAt: true,
      },
    },
  };

  if (options?.viewerId) {
    include.likes = {
      where: { userId: options.viewerId },
      select: { userId: true },
    };
  }

  const prismaAny = prisma as any;
  try {
    const posts = (await prismaAny.failPost.findMany({
      include,
      orderBy,
      take: Math.min(Math.max(limit, 1), 50),
    })) as Array<{
      id: string;
      userId: string;
      projectAttempt: string;
      failureReason: string;
      lessonLearned: string;
      likesCount: number;
      commentsCount: number;
      createdAt: Date;
      updatedAt: Date;
      author: {
        id: string;
        username: string | null;
        name: string | null;
        avatarUrl: string | null;
        resilienceBadgeCount?: number | null;
        resilienceBadgeEarnedAt?: Date | null;
      };
      likes?: { userId: string }[];
    }>;

    return posts.map((post) => {
      const { likes, ...rest } = post as typeof post & { likes?: { userId: string }[] };
      const likedByViewer = Array.isArray(likes) ? likes.length > 0 : false;
      return {
        ...rest,
        likedByViewer,
        engagementScore: rest.likesCount + rest.commentsCount * 2,
      };
    });
  } catch (error) {
    console.error("fetchFailPosts error", error);
    return [];
  }
}

export type FailPostSummary = Awaited<ReturnType<typeof fetchFailPosts>>[number];

export async function fetchProjectDetail(slug: string) {
  return prisma.project.findUnique({
    where: { slug },
    include: {
      university: true,
      owner: { include: { university: true } },
      tags: { include: { tag: true } },
      comments: {
        include: {
          author: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function fetchBestSubmissions(limit = 6) {
  const submissions = await prisma.submission.findMany({
    where: { status: SubmissionStatus.PASSED },
    include: {
      user: { include: { university: true } },
      problem: true,
    },
    orderBy: [
      { score: "desc" as Prisma.SortOrder },
      { createdAt: "desc" as Prisma.SortOrder },
    ],
    take: limit,
  });

  return submissions.map((submission) => ({
    id: submission.id,
    title: `${submission.problem.title} by ${submission.user.name ?? submission.user.username}`,
    algorithm: submission.problem.title,
    author: submission.user.name ?? submission.user.username,
    university: submission.user.university?.name ?? "Independent",
    language: submission.language,
    highlights:
      submission.reviewerNote ??
      "Mentor review queued. Highlights will appear once feedback is published.",
    votes: submission.score ?? 0,
    codeSnippet: submission.code,
  }));
}

export async function fetchSubmissionDetail(id: string) {
  return prisma.submission.findUnique({
    where: { id },
    include: {
      user: { include: { university: true } },
      problem: true,
    },
  });
}

export async function fetchPublicProfile(username: string) {
  return prisma.user.findUnique({
    where: { username },
    include: {
      university: true,
      stories: {
        where: { status: StoryStatus.PUBLISHED },
        select: { slug: true, title: true },
      },
      projects: {
        select: { slug: true, title: true, status: true },
      },
      followers: { select: { followerId: true } },
      following: { select: { followingId: true } },
    },
  });
}

export async function fetchLandingHighlights() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay);
  endOfDay.setHours(23, 59, 59, 999);

  const [dailyPick, problems, stories, projects] = await Promise.all([
    prisma.dailyPick.findFirst({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        problem: {
          include: {
            tags: { include: { tag: true } },
            submissions: {
              where: { status: SubmissionStatus.PASSED },
              select: { id: true },
            },
            createdBy: {
              include: {
                university: true,
              },
            },
          },
        },
      },
      orderBy: { date: "desc" },
    }),
    prisma.problem.findMany({
      include: {
        tags: { include: { tag: true } },
        submissions: {
          where: { status: SubmissionStatus.PASSED },
          select: { id: true },
        },
        createdBy: {
          include: {
            university: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 16,
    }),
    prisma.story.findMany({
      where: { status: StoryStatus.PUBLISHED },
      include: {
        university: true,
      },
      orderBy: { publishedAt: "desc" },
      take: 3,
    }),
    prisma.project.findMany({
      include: {
        university: true,
      },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
  ]);

  const algorithmOfDay =
    dailyPick?.problem ??
    (problems.length === 0
      ? null
      : problems[
          Number(new Date().toISOString().slice(0, 10).replace(/-/g, "")) %
            problems.length
        ]);

  return {
    algorithmOfDay,
    campusInsights: stories.map((story) => ({
      title: story.title,
      description: story.university?.name ?? "forth.studio",
      tag: "Story",
      meta: story.publishedAt
        ? story.publishedAt.toLocaleDateString()
        : "Recent",
      slug: story.slug,
    })),
    communityCreations: projects.map((project) => ({
      title: project.title,
      description: project.university?.name ?? "Independent",
      tag: project.status === ProjectStatus.LAUNCHED ? "Launched" : "Prototype",
      meta: project.createdAt.toLocaleDateString(),
      slug: project.slug,
    })),
  };
}

export async function fetchDashboardData(userId?: string) {
  const user =
    (userId
      ? await prisma.user.findUnique({ where: { id: userId } })
      : await prisma.user.findFirst({
          where: { role: Role.STUDENT },
          orderBy: { createdAt: "asc" },
        })) ?? null;

  const [
    solvedCount,
    submissionsThisWeek,
    feedbackCount,
    upcomingStory,
    recentProject,
  ] = await Promise.all([
    prisma.submission.count({
      where: { userId: user?.id, status: SubmissionStatus.PASSED },
    }),
    prisma.submission.count({
      where: {
        userId: user?.id,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    }),
    prisma.comment.count({
      where: { project: { ownerId: user?.id } },
    }),
    prisma.story.findFirst({
      where: { authorId: user?.id, status: StoryStatus.DRAFT },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.project.findFirst({
      where: { ownerId: user?.id },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  return {
    user,
    stats: {
      solvedCount,
      weeklySubmissions: submissionsThisWeek,
      feedbackCount,
    },
    draftStory: upcomingStory,
    latestProject: recentProject,
    nextProblem: await prisma.problem.findFirst({
      orderBy: { createdAt: "desc" },
      include: {
        tags: { include: { tag: true } },
        createdBy: { include: { university: true } },
      },
    }),
    featuredStory: await prisma.story.findFirst({
      where: { status: StoryStatus.PUBLISHED },
      orderBy: { publishedAt: "desc" },
    }),
    topSubmission: await prisma.submission.findFirst({
      where: { status: SubmissionStatus.PASSED },
      include: {
        user: { include: { university: true } },
        problem: true,
      },
      orderBy: [
        { score: "desc" },
        { createdAt: "desc" },
      ],
    }),
  };
}

export async function fetchCampusHighlights() {
  const universities = await prisma.institution.findMany({
    take: 4,
    orderBy: { createdAt: "asc" },
  });

  return universities.map((university) => ({
    name: university.name,
    headline: university.description ?? "Active chapter updates coming soon.",
    impact: `Community members from ${university.city ?? "campus"} are collaborating on studio challenges.`,
  }));
}

export async function fetchTopTags(domain: TagDomain, limit = 6) {
  const tags = await prisma.tag.findMany({
    where: { domain },
    include: {
      problemTags: domain === TagDomain.PROBLEM,
      storyTags: domain === TagDomain.STORY,
      projectTags: domain === TagDomain.PROJECT,
    },
    take: limit,
  });

  return tags.map((tag) => ({
    name: tag.name,
    usage:
      domain === TagDomain.PROBLEM
        ? tag.problemTags.length
        : domain === TagDomain.STORY
          ? tag.storyTags.length
          : tag.projectTags.length,
  }));
}

export async function fetchStoryFilterOptions() {
  const [universities, tags] = await Promise.all([
    prisma.institution.findMany({
      where: {
        stories: {
          some: { status: StoryStatus.PUBLISHED },
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: { name: "asc" },
    }),
    prisma.tag.findMany({
      where: { domain: TagDomain.STORY },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return {
    universities,
    tags,
  };
}
