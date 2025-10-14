export type DifficultyLevel = "Easy" | "Medium" | "Hard" | "Advanced";

export type AlgorithmListItem = {
  slug: string;
  title: string;
  difficulty: DifficultyLevel;
  tags: string[];
  summary: string;
  solved: number;
  university: string;
  updated: string;
};

export const algorithmList: AlgorithmListItem[] = [
  {
    slug: "dijkstras-shortest-path",
    title: "Dijkstra's Shortest Path",
    difficulty: "Medium",
    tags: ["Graphs", "Priority Queue"],
    summary:
      "Compute minimal travel costs across weighted networks by exploring greedy relaxations.",
    solved: 34,
    university: "ENA Rabat",
    updated: "45 minutes ago",
  },
  {
    slug: "kruskals-mst",
    title: "Kruskal's Minimum Spanning Tree",
    difficulty: "Medium",
    tags: ["Graphs", "Greedy"],
    summary:
      "Rank and union sets to connect every node with minimal wires. Practice DSU optimization.",
    solved: 28,
    university: "University of Manchester",
    updated: "2 hours ago",
  },
  {
    slug: "segment-tree-range-sum",
    title: "Segment Tree Range Sums",
    difficulty: "Hard",
    tags: ["Data Structures", "Binary Tree"],
    summary:
      "Engineer a tree that responds to updates and queries under 50 ms with lazy propagation.",
    solved: 12,
    university: "42 Paris",
    updated: "Yesterday",
  },
  {
    slug: "two-pointers-window",
    title: "Two Pointers Window",
    difficulty: "Easy",
    tags: ["Arrays", "Sliding Window"],
    summary:
      "Find the longest substring that satisfies frequency constraints using mobile window bounds.",
    solved: 110,
    university: "UM5R",
    updated: "Today",
  },
  {
    slug: "topological-course-planner",
    title: "Topological Course Planner",
    difficulty: "Medium",
    tags: ["Graphs", "Ordering"],
    summary:
      "Determine course orderings for crowded semesters while handling cycles gracefully.",
    solved: 52,
    university: "Waterloo",
    updated: "3 days ago",
  },
  {
    slug: "binary-search-precision",
    title: "Binary Search with Precision",
    difficulty: "Medium",
    tags: ["Search", "Floating Point"],
    summary:
      "Approximate square roots and tuning parameters with low error using mid-point refinement.",
    solved: 89,
    university: "KAIST",
    updated: "5 hours ago",
  },
];

export type AlgorithmDetail = {
  title: string;
  difficulty: DifficultyLevel;
  tags: string[];
  summary: string;
  constraints: string[];
  inputFormat: string[];
  outputFormat: string[];
  sample: {
    input: string;
    output: string;
    explanation: string;
  };
  related: { title: string; slug: string }[];
};

export const algorithmLibrary: Record<string, AlgorithmDetail> = {
  "dijkstras-shortest-path": {
    title: "Dijkstra's Shortest Path",
    difficulty: "Medium",
    tags: ["Graphs", "Greedy", "Priority Queue"],
    summary:
      "Given a weighted directed graph with non-negative edges, compute the minimal distance from a source node to every other node. Focus on building an optimal priority queue implementation that stays under 250 ms for graphs with up to 100k edges.",
    constraints: [
      "1 <= n <= 100000 nodes, 0 <= m <= 200000 edges",
      "Edge weights are integers in the range [0, 1e9]",
      "Multiple edges between the same nodes are allowed",
      "Unreachable nodes should return -1",
    ],
    inputFormat: [
      "n m s (number of nodes, edges, and starting node)",
      "m lines follow: u v w (edge from u to v with weight w)",
    ],
    outputFormat: [
      "Print n space-separated integers representing the shortest distances from s",
    ],
    sample: {
      input: `5 6 1
1 2 2
1 3 4
2 3 1
2 4 7
3 5 3
4 5 1`,
      output: "0 2 3 9 6",
      explanation:
        "The path 1 -> 2 -> 3 -> 5 yields distance 6, while 1 -> 2 -> 4 -> 5 yields 10.",
    },
    related: [
      { title: "Bellman-Ford Resilience", slug: "bellman-ford-resilience" },
      { title: "Floyd-Warshall Multi-Hop", slug: "floyd-warshall-multi-hop" },
      { title: "Binary Heap Fundamentals", slug: "binary-heap-fundamentals" },
    ],
  },
  "kruskals-mst": {
    title: "Kruskal's Minimum Spanning Tree",
    difficulty: "Medium",
    tags: ["Graphs", "Greedy", "Disjoint Set"],
    summary:
      "Design a minimal wiring layout for a university campus by connecting all labs with the smallest total cable length. Use a disjoint-set union (DSU) structure to keep operations almost linear.",
    constraints: [
      "2 <= n <= 200000 nodes",
      "1 <= m <= 300000 edges",
      "Edge weights are positive integers <= 1e9",
      "Return the MST cost or -1 if the graph is disconnected",
    ],
    inputFormat: [
      "n m (nodes and edges)",
      "m lines: u v w describing undirected weighted edges",
    ],
    outputFormat: [
      "Single integer representing the weight of the minimum spanning tree",
    ],
    sample: {
      input: `4 5
1 2 1
2 3 2
3 4 3
4 1 4
2 4 2`,
      output: "6",
      explanation:
        "Edges (1-2), (2-3), and (3-4) connect all nodes with total cost 6.",
    },
    related: [
      { title: "Disjoint Set Union Essentials", slug: "dsu-essentials" },
      { title: "Prim's Algorithm Rebuild", slug: "prims-algorithm-rebuild" },
      { title: "Graph Connectivity Checks", slug: "graph-connectivity" },
    ],
  },
};

export type StorySummary = {
  slug: string;
  title: string;
  author: string;
  university: string;
  summary: string;
  tags: string[];
  readingTime: string;
  featured?: boolean;
};

export const storySummaries: StorySummary[] = [
  {
    slug: "gpu-research-internship-rabat",
    title: "Landing a GPU research internship in Rabat",
    author: "Selma B.",
    university: "Mohammed V University",
    summary:
      "From robotics club debugging sessions to presenting a parallel computing project that wowed the lab director.",
    tags: ["Internships", "Research", "GPU"],
    readingTime: "7 min read",
    featured: true,
  },
  {
    slug: "hackathon-to-startup-lyon-tech",
    title: "How Lyon Tech turned hackathon chaos into a startup",
    author: "Nassim K.",
    university: "INSA Lyon",
    summary:
      "A 36-hour prototype became a climate-data SaaS after mentor-guided customer interviews.",
    tags: ["Startup", "Hackathon"],
    readingTime: "5 min read",
  },
  {
    slug: "erasmus-rust-capstone",
    title: "Crossing borders for Erasmus and mastering Rust",
    author: "Aiysha O.",
    university: "TU Delft",
    summary:
      "Switching languages, both spoken and programming, while leading a distributed systems capstone.",
    tags: ["Exchange", "Rust", "Capstone"],
    readingTime: "6 min read",
  },
  {
    slug: "ai-hack-figma-first",
    title: "Winning the campus AI hack with only Figma",
    author: "Omar G.",
    university: "UM6P",
    summary:
      "Design-first thinking, plus quick Python scripts, convinced judges that UX can lead an AI build.",
    tags: ["AI", "Design", "Teamwork"],
    readingTime: "4 min read",
  },
];

export type StoryDetail = {
  title: string;
  author: string;
  university: string;
  readingTime: string;
  publishedAt: string;
  tags: string[];
  content: string[];
};

export const storyLibrary: Record<string, StoryDetail> = {
  "gpu-research-internship-rabat": {
    title: "Landing a GPU research internship in Rabat",
    author: "Selma B.",
    university: "Mohammed V University",
    readingTime: "7 min read",
    publishedAt: "June 2025",
    tags: ["Internships", "Research", "GPU"],
    content: [
      "My first robotics club meeting was mostly wires and confusion. The seniors were optimising a vision pipeline to recognise lab equipment and I could barely compile the project.",
      "Instead of walking away, I documented every error the team hit. Within a month, I knew the debugging flow better than anyone. That visibility earned me an invite to assist a PhD candidate working on GPU memory optimisation.",
      "We built a synthetic dataset to stress-test video lectures at different frame rates. The final benchmark showed a 40 percent reduction in training time. The lab director asked if I wanted to join for the summer.",
      "If you are applying to research roles: publish your learning notes. The professors said my weekly write-ups were what convinced them I could handle the internship.",
    ],
  },
  "hackathon-to-startup-lyon-tech": {
    title: "How Lyon Tech turned hackathon chaos into a startup",
    author: "Nassim K.",
    university: "INSA Lyon",
    readingTime: "5 min read",
    publishedAt: "May 2025",
    tags: ["Startup", "Hackathon"],
    content: [
      "Our hackathon idea was to predict energy usage spikes for student housing. We had no production code, only Figma screens and a quick Node.js API with mock data.",
      "The judges loved the clarity of the demo, so we applied to the university incubator. The first mentor asked us to interview 20 facility managers before building anything new.",
      "Those calls changed everything. We realised the value was not the prediction itself but the alerts that could trigger maintenance crews. We pivoted and built a Slack integration universities can connect in under an hour.",
      "That feature landed our first customer. We are still mostly students, but we have paying users and a roadmap shaped by operations teams instead of hackathon judges.",
    ],
  },
};

export type SolutionSummary = {
  slug: string;
  title: string;
  algorithm: string;
  author: string;
  university: string;
  language: string;
  highlights: string;
  votes: number;
};

export const solutionSummaries: SolutionSummary[] = [
  {
    slug: "annotated-dijkstra-ts",
    title: "Annotated Dijkstra with reusable priority queue",
    algorithm: "Dijkstra's Shortest Path",
    author: "Aya T.",
    university: "UM6P",
    language: "TypeScript",
    highlights:
      "Readable queue wrapper with instrumentation hooks for mentor feedback.",
    votes: 128,
  },
  {
    slug: "kruskal-rust-iterators",
    title: "Memory-safe Kruskal using Rust iterators",
    algorithm: "Kruskal's Minimum Spanning Tree",
    author: "Lukas P.",
    university: "TU Munich",
    language: "Rust",
    highlights:
      "Borrow checker tips inline plus benchmarks against C++ reference.",
    votes: 96,
  },
  {
    slug: "segment-tree-playground",
    title: "Segment tree template with live playground",
    algorithm: "Segment Tree Range Sums",
    author: "Maya R.",
    university: "KAIST",
    language: "C++",
    highlights:
      "Interactive visualiser with tests for updates and queries.",
    votes: 174,
  },
  {
    slug: "lcs-voice-notes",
    title: "Dynamic programming explained with voice notes",
    algorithm: "Longest Common Subsequence",
    author: "Diego S.",
    university: "PUC Chile",
    language: "Python",
    highlights:
      "Links to 2-minute voice notes that explain each transition.",
    votes: 153,
  },
];

export type SolutionDetail = {
  title: string;
  algorithm: string;
  author: string;
  university: string;
  language: string;
  votes: number;
  keyIdeas: string[];
  codeSnippet: string;
  notes: string[];
};

export const solutionLibrary: Record<string, SolutionDetail> = {
  "annotated-dijkstra-ts": {
    title: "Annotated Dijkstra with reusable priority queue",
    algorithm: "Dijkstra's Shortest Path",
    author: "Aya T.",
    university: "UM6P",
    language: "TypeScript",
    votes: 128,
    keyIdeas: [
      "Wraps the priority queue logic into a reusable class with explicit decreaseKey behaviour.",
      "Logs each relaxation step with mentor-friendly comment blocks that highlight edge cases.",
      "Includes a fallback BFS when all weights are zero to avoid wasted heap work.",
    ],
    codeSnippet: `type Edge = { to: number; weight: number };

class MinQueue {
  private heap: Array<{ node: number; dist: number }> = [];

  push(entry: { node: number; dist: number }) {
    this.heap.push(entry);
    this.bubbleUp(this.heap.length - 1);
  }

  pop(): { node: number; dist: number } | undefined {
    if (this.heap.length === 0) return undefined;
    const top = this.heap[0];
    const last = this.heap.pop();
    if (last && this.heap.length > 0) {
      this.heap[0] = last;
      this.bubbleDown(0);
    }
    return top;
  }

  private bubbleUp(index: number) {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.heap[parent].dist <= this.heap[index].dist) break;
      [this.heap[parent], this.heap[index]] = [this.heap[index], this.heap[parent]];
      index = parent;
    }
  }

  private bubbleDown(index: number) {
    const length = this.heap.length;
    while (true) {
      const left = index * 2 + 1;
      const right = index * 2 + 2;
      let smallest = index;
      if (left < length && this.heap[left].dist < this.heap[smallest].dist) smallest = left;
      if (right < length && this.heap[right].dist < this.heap[smallest].dist) smallest = right;
      if (smallest === index) break;
      [this.heap[smallest], this.heap[index]] = [this.heap[index], this.heap[smallest]];
      index = smallest;
    }
  }
}

export function dijkstra(graph: Edge[][], start: number) {
  const dist = Array(graph.length).fill(Infinity);
  dist[start] = 0;
  const queue = new MinQueue();
  queue.push({ node: start, dist: 0 });

  while (true) {
    const current = queue.pop();
    if (!current) break;
    if (current.dist > dist[current.node]) continue;

    for (const edge of graph[current.node]) {
      const nextDist = current.dist + edge.weight;
      if (nextDist < dist[edge.to]) {
        dist[edge.to] = nextDist;
        queue.push({ node: edge.to, dist: nextDist });
      }
    }
  }

  return dist;
}`,
    notes: [
      "Mentor feedback: share this queue class with the template repo so other languages can mirror the API.",
      "Performance: tested on the 200k-edge stress case with an average runtime of 220 ms.",
    ],
  },
};

export type ProjectSummary = {
  slug: string;
  title: string;
  author: string;
  university: string;
  summary: string;
  tags: string[];
  status: "Prototype" | "Launched" | "In review";
  feedbackCount: number;
};

export const projectSummaries: ProjectSummary[] = [
  {
    slug: "campus-shuttle-optimizer",
    title: "Campus shuttle optimiser",
    author: "Farah L.",
    university: "UM5R",
    summary:
      "Routing simulator that reduces shuttle wait time by 18 percent using historical GPS data and reinforcement learning.",
    tags: ["Transport", "Reinforcement Learning"],
    status: "Launched",
    feedbackCount: 42,
  },
  {
    slug: "inclusive-keyboard-haptics",
    title: "Inclusive keyboard with haptics",
    author: "Noah D.",
    university: "UCL",
    summary:
      "An accessible keyboard layout with vibration feedback designed with visually impaired students.",
    tags: ["Hardware", "Accessibility"],
    status: "Prototype",
    feedbackCount: 27,
  },
  {
    slug: "peer-grading-dashboard",
    title: "Peer grading dashboard",
    author: "Hiba R.",
    university: "Al Akhawayn",
    summary:
      "Web app that streamlines peer feedback for group projects with analytics on participation.",
    tags: ["EdTech", "Analytics"],
    status: "In review",
    feedbackCount: 18,
  },
  {
    slug: "esports-stream-overlay",
    title: "Low latency esports stream overlay",
    author: "Leo K.",
    university: "EPFL",
    summary:
      "Overlay generator for university tournaments with live stats, player intros, and sponsor slots.",
    tags: ["Media", "Real-time"],
    status: "Launched",
    feedbackCount: 65,
  },
];

export type ProjectDetail = {
  title: string;
  author: string;
  university: string;
  status: string;
  summary: string;
  goals: string[];
  milestones: { title: string; date: string; description: string }[];
  links: { label: string; href: string }[];
};

export const projectLibrary: Record<string, ProjectDetail> = {
  "campus-shuttle-optimizer": {
    title: "Campus shuttle optimiser",
    author: "Farah L.",
    university: "UM5R",
    status: "Launched",
    summary:
      "Routing simulator that uses historical GPS traces to recommend shuttle loops and reduce wait times by 18 percent across three campuses.",
    goals: [
      "Cut idle shuttle time by 12 percent before the winter semester",
      "Ship analytics dashboard for the operations team with hour-by-hour breakdowns",
      "Open source the reinforcement learning environment for other universities",
    ],
    milestones: [
      {
        title: "Data ingestion pipeline live",
        date: "February 2025",
        description:
          "Built cron jobs that pull GPS logs from the transport operator and normalise them into our Postgres schema.",
      },
      {
        title: "Driver beta testing",
        date: "April 2025",
        description:
          "Ran pilot on two shuttles with live recommendations and collected driver feedback about route clarity.",
      },
      {
        title: "Operations dashboard v1",
        date: "June 2025",
        description:
          "Released dashboard with daily summaries, bottleneck detection, and manual override controls.",
      },
    ],
    links: [
      { label: "Live demo", href: "https://demo.forth.studio/shuttle" },
      {
        label: "GitHub",
        href: "https://github.com/forth-studio/shuttle-optimizer",
      },
      { label: "Pitch deck", href: "https://forth.studio/shuttle-slides" },
    ],
  },
};

export type CampusStory = {
  name: string;
  headline: string;
  impact: string;
};

export const campusHighlights: CampusStory[] = [
  {
    name: "University of Manchester",
    headline: "Co-op pairing rotation launched",
    impact: "37 students matched with alumni for 1:1 code reviews this term.",
  },
  {
    name: "UM6P Benguerir",
    headline: "Robotics lab opens night hours",
    impact: "Extended access helped 12 teams complete capstone builds ahead of time.",
  },
];

export type CommunityMember = {
  username: string;
  name: string;
  university: string;
  bio: string;
  skills: string[];
  achievements: string[];
};

export const sampleProfile: CommunityMember = {
  username: "selma-b",
  name: "Selma B.",
  university: "Mohammed V University",
  bio: "Second-year CS student exploring GPU optimisations and inclusive tech education.",
  skills: ["C++", "CUDA", "React", "Technical writing"],
  achievements: [
    "GPU research intern at Rabat Digital Lab",
    "Winner of Campus AI Build 2025",
    "Lead mentor for forth.studio Rabat chapter",
  ],
};
