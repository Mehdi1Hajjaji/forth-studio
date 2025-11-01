import "dotenv/config";
import {
  Difficulty,
  PrismaClient,
  ProjectStatus,
  Role,
  StoryStatus,
  SubmissionStatus,
  TagDomain,
} from "@prisma/client";

const datasourceUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!datasourceUrl) {
  throw new Error(
    "DATABASE_URL (or DIRECT_URL) must be set to run the seed script.",
  );
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: datasourceUrl,
    },
  },
});

async function ensureTag(domain: TagDomain, name: string) {
  return prisma.tag.upsert({
    where: {
      domain_name: {
        domain,
        name,
      },
    },
    update: {},
    create: {
      domain,
      name,
    },
  });
}

async function main() {
  const [um5r, um6p, insaLyon] = await prisma.$transaction([
    prisma.university.create({
      data: {
        name: "Mohammed V University",
        slug: "um5r",
        country: "Morocco",
        city: "Rabat",
        description:
          "Leading Moroccan university with vibrant CS and AI research communities.",
      },
    }),
    prisma.university.create({
      data: {
        name: "Mohammed VI Polytechnic University",
        slug: "um6p",
        country: "Morocco",
        city: "Benguerir",
        description:
          "Polytechnic campus focused on engineering, robotics, and sustainable tech.",
      },
    }),
    prisma.university.create({
      data: {
        name: "INSA Lyon",
        slug: "insa-lyon",
        country: "France",
        city: "Lyon",
        description:
          "French engineering school with a strong culture of hackathons and startups.",
      },
    }),
  ]);

  const [selma, aya, lukas, farah] = await prisma.$transaction([
    prisma.user.create({
      data: {
        username: "selma-b",
        email: "selma@example.com",
        hashedPassword:
          "$2b$10$CwTycUXWue0Thq9StjUM0uJ8w7oOJPfm6.H/EjV116IhVQbK5EOi.",
        name: "Selma B.",
        pronouns: "She/Her",
        bio: "Second-year CS student exploring GPU optimisations and inclusive tech education.",
        major: "Computer Science",
        graduationYear: new Date().getFullYear() + 1,
        role: Role.STUDENT,
        universityId: um5r.id,
      },
    }),
    prisma.user.create({
      data: {
        username: "aya-t",
        email: "aya@example.com",
        hashedPassword:
          "$2b$10$CwTycUXWue0Thq9StjUM0uJ8w7oOJPfm6.H/EjV116IhVQbK5EOi.",
        name: "Aya T.",
        pronouns: "She/Her",
        bio: "Full-stack engineer and mentor at forth.studio UM6P chapter.",
        major: "Software Engineering",
        graduationYear: new Date().getFullYear(),
        role: Role.MENTOR,
        universityId: um6p.id,
      },
    }),
    prisma.user.create({
      data: {
        username: "lukas-p",
        email: "lukas@example.com",
        hashedPassword:
          "$2b$10$CwTycUXWue0Thq9StjUM0uJ8w7oOJPfm6.H/EjV116IhVQbK5EOi.",
        name: "Lukas P.",
        pronouns: "He/Him",
        bio: "Rust enthusiast exploring graph algorithms and functional programming.",
        major: "Computer Science",
        graduationYear: new Date().getFullYear() - 1,
        role: Role.STUDENT,
        universityId: insaLyon.id,
      },
    }),
    prisma.user.create({
      data: {
        username: "farah-l",
        email: "farah@example.com",
        hashedPassword:
          "$2b$10$CwTycUXWue0Thq9StjUM0uJ8w7oOJPfm6.H/EjV116IhVQbK5EOi.",
        name: "Farah L.",
        pronouns: "She/Her",
        bio: "Transportation data analyst turning reinforcement learning into campus wins.",
        major: "Data Science",
        graduationYear: new Date().getFullYear(),
        role: Role.STUDENT,
        universityId: um5r.id,
      },
    }),
  ]);

  const graphTag = await ensureTag(TagDomain.PROBLEM, "Graphs");
  const greedyTag = await ensureTag(TagDomain.PROBLEM, "Greedy");
  const dsuTag = await ensureTag(TagDomain.PROBLEM, "Disjoint Set");
  const arraysTag = await ensureTag(TagDomain.PROBLEM, "Arrays");
  const slidingWindowTag = await ensureTag(
    TagDomain.PROBLEM,
    "Sliding Window",
  );

  const internshipTag = await ensureTag(TagDomain.STORY, "Internships");
  const researchTag = await ensureTag(TagDomain.STORY, "Research");
  const gpuTag = await ensureTag(TagDomain.STORY, "GPU");
  const startupTag = await ensureTag(TagDomain.STORY, "Startup");

  const transportTag = await ensureTag(TagDomain.PROJECT, "Transport");
  const rlTag = await ensureTag(TagDomain.PROJECT, "Reinforcement Learning");
  const accessibilityTag = await ensureTag(TagDomain.PROJECT, "Accessibility");

  const dijkstra = await prisma.problem.create({
    data: {
      slug: "dijkstras-shortest-path",
      title: "Dijkstra's Shortest Path",
      summary:
        "Compute minimal travel costs across weighted networks by exploring greedy relaxations.",
      statement:
        "Given a weighted directed graph with non-negative edges, compute the minimal distance from a source node to every other node. Output -1 for unreachable nodes.",
      difficulty: Difficulty.MEDIUM,
      createdById: aya.id,
      tags: {
        create: [
          { tagId: graphTag.id },
          { tagId: greedyTag.id },
        ],
      },
      testcases: {
        create: [
          {
            input: "5 6 1\n1 2 2\n1 3 4\n2 3 1\n2 4 7\n3 5 3\n4 5 1",
            output: "0 2 3 9 6",
            isSample: true,
          },
          {
            input: "3 3 2\n2 1 5\n2 3 2\n1 3 9",
            output: "5 0 2",
            isSample: false,
          },
        ],
      },
    },
    include: {
      tags: { include: { tag: true } },
      testcases: true,
    },
  });

  const kruskal = await prisma.problem.create({
    data: {
      slug: "kruskals-mst",
      title: "Kruskal's Minimum Spanning Tree",
      summary:
        "Rank and union sets to connect every node with minimal wires. Practice DSU optimization.",
      statement:
        "Design a minimal wiring layout for an undirected weighted graph. Output the MST cost or -1 if the graph is disconnected.",
      difficulty: Difficulty.MEDIUM,
      createdById: lukas.id,
      tags: {
        create: [
          { tagId: graphTag.id },
          { tagId: dsuTag.id },
        ],
      },
      testcases: {
        create: [
          {
            input: "4 5\n1 2 1\n2 3 2\n3 4 3\n4 1 4\n2 4 2",
            output: "6",
            isSample: true,
          },
        ],
      },
    },
  });

  await prisma.story.create({
    data: {
      slug: "gpu-research-internship-rabat",
      authorId: selma.id,
      universityId: um5r.id,
      title: "Landing a GPU research internship in Rabat",
      excerpt:
        "From robotics club debugging to a 40% training speedup that impressed lab directors.",
      body: [
        "My first robotics club meeting was mostly wires and confusion. The seniors were optimising a vision pipeline and I could barely compile the project.",
        "Instead of walking away, I documented every error the team hit. Within a month, I knew the debugging flow better than anyone and joined a GPU memory project.",
        "We built a synthetic dataset to stress-test video lectures at different frame rates. The final benchmark showed a 40 percent reduction in training time.",
        "If you are applying to research roles: publish your learning notes. Professors told me those weekly write-ups proved I could handle the internship.",
      ].join("\n\n"),
      status: StoryStatus.PUBLISHED,
      publishedAt: new Date(),
      tags: {
        create: [
          { tagId: internshipTag.id },
          { tagId: researchTag.id },
          { tagId: gpuTag.id },
        ],
      },
    },
  });

  await prisma.story.create({
    data: {
      slug: "hackathon-to-startup-lyon-tech",
      authorId: lukas.id,
      universityId: insaLyon.id,
      title: "How Lyon Tech turned hackathon chaos into a startup",
      excerpt:
        "A 36-hour prototype became a climate-data SaaS after mentor-guided customer interviews.",
      body: [
        "Our hackathon idea was to predict energy usage spikes for student housing. We had no production code, only Figma screens and a Node.js API with mock data.",
        "Mentors asked us to interview facility managers before building anything else. That process revealed the value was rapid alerts, not the predictions themselves.",
        "We pivoted to a Slack integration universities could connect in under an hour. That single feature landed our first paying customer.",
      ].join("\n\n"),
      status: StoryStatus.PUBLISHED,
      publishedAt: new Date(),
      tags: {
        create: [
          { tagId: startupTag.id },
          { tagId: researchTag.id },
        ],
      },
    },
  });

  const project = await prisma.project.create({
    data: {
      slug: "campus-shuttle-optimizer",
      ownerId: farah.id,
      universityId: um5r.id,
      title: "Campus shuttle optimiser",
      summary:
        "Routing simulator that reduces shuttle wait time by 18 percent using historical GPS data and reinforcement learning.",
      description:
        "The project ingests historical GPS traces, runs reinforcement learning policies to optimise shuttle loops, and provides an operations dashboard for the transport team.",
      repoUrl: "https://github.com/forth-studio/shuttle-optimizer",
      demoUrl: "https://demo.forth.studio/shuttle",
      status: ProjectStatus.LAUNCHED,
      tags: {
        create: [
          { tagId: transportTag.id },
          { tagId: rlTag.id },
        ],
      },
    },
  });

  await prisma.project.create({
    data: {
      slug: "inclusive-keyboard-haptics",
      ownerId: aya.id,
      universityId: um6p.id,
      title: "Inclusive keyboard with haptics",
      summary:
        "An accessible keyboard with vibration feedback designed with visually impaired students.",
      description:
        "Prototype hardware keyboard with an embedded microcontroller that provides context-aware haptics for keyboard shortcuts.",
      status: ProjectStatus.PROTOTYPE,
      tags: {
        create: [
          { tagId: accessibilityTag.id },
        ],
      },
    },
  });

  await prisma.submission.create({
    data: {
      userId: aya.id,
      problemId: dijkstra.id,
      language: "TypeScript",
      code: `type Edge = { to: number; weight: number };

function dijkstra(graph: Edge[][], start: number) {
  const dist = Array(graph.length).fill(Infinity);
  dist[start] = 0;
  const visited = new Set<number>();

  while (visited.size < graph.length) {
    let u = -1;
    for (let i = 0; i < graph.length; i++) {
      if (!visited.has(i) && (u === -1 || dist[i] < dist[u])) {
        u = i;
      }
    }
    if (u === -1 || dist[u] === Infinity) break;
    visited.add(u);
    for (const edge of graph[u]) {
      if (dist[u] + edge.weight < dist[edge.to]) {
        dist[edge.to] = dist[u] + edge.weight;
      }
    }
  }
  return dist;
}

export default dijkstra;`,
      status: SubmissionStatus.PASSED,
      score: 5,
      runtimeMs: 210,
      memoryKb: 12800,
      reviewerId: selma.id,
      reviewerNote:
        "Great clarity. Consider refactoring the visited scan with a heap for larger datasets.",
    },
  });

  await prisma.comment.create({
    data: {
      authorId: selma.id,
      projectId: project.id,
      body: "Impressive improvement on shuttle wait time! Curious about how you validated the simulator.",
    },
  });

  await prisma.follow.create({
    data: {
      followerId: selma.id,
      followingId: aya.id,
    },
  });

  console.log("Database seeded with demo data.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
