type JudgeStatus = "QUEUED" | "COMPLETED" | "FAILED";

export type Judge0Result = {
  status: JudgeStatus;
  statusId: number;
  statusDescription: string;
  stdout?: string | null;
  stderr?: string | null;
  time?: number | null;
  memory?: number | null;
  token?: string;
};

export type Judge0Submission = {
  language: string;
  source: string;
  stdin?: string;
  expectedOutput?: string;
};

const LANGUAGE_MAPPING: Record<string, number> = {
  "C++": 54,
  "C#": 51,
  Go: 95,
  Java: 62,
  JavaScript: 63,
  Python: 92,
  Rust: 73,
  TypeScript: 74,
};

const ACCEPTED_STATUS_IDS = new Set([3]);
const PENDING_STATUS_IDS = new Set([1, 2]);

function resolveLanguageId(language: string): number | null {
  return LANGUAGE_MAPPING[language] ?? null;
}

function mapStatus(
  statusId: number,
  description: string,
): JudgeStatus {
  if (PENDING_STATUS_IDS.has(statusId)) {
    return "QUEUED";
  }
  if (ACCEPTED_STATUS_IDS.has(statusId)) {
    return "COMPLETED";
  }
  return "FAILED";
}

export async function evaluateWithJudge0(
  submission: Judge0Submission,
): Promise<Judge0Result | null> {
  const baseUrl = process.env.JUDGE0_BASE_URL;
  if (!baseUrl) {
    return null;
  }

  const languageId = resolveLanguageId(submission.language);
  if (!languageId) {
    return null;
  }

  const url = new URL("submissions", baseUrl);
  url.searchParams.set("base64_encoded", "false");
  url.searchParams.set("wait", "true");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (process.env.JUDGE0_API_KEY) {
    headers["X-RapidAPI-Key"] = process.env.JUDGE0_API_KEY;
  }
  if (process.env.JUDGE0_API_HOST) {
    headers["X-RapidAPI-Host"] = process.env.JUDGE0_API_HOST;
  }

  const response = await fetch(url.toString(), {
    method: "POST",
    headers,
    body: JSON.stringify({
      source_code: submission.source,
      language_id: languageId,
      stdin: submission.stdin,
      expected_output: submission.expectedOutput,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Judge0 request failed with status ${response.status}`,
    );
  }

  const result = await response.json();
  const statusId: number = result.status?.id ?? 0;
  const statusDescription: string =
    result.status?.description ?? "Unknown status";

  return {
    status: mapStatus(statusId, statusDescription),
    statusId,
    statusDescription,
    stdout: result.stdout,
    stderr: result.stderr ?? result.compile_output,
    time: result.time ? Number(result.time) : null,
    memory: result.memory ? Number(result.memory) : null,
    token: result.token,
  };
}
