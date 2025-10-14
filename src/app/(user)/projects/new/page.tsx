import type { ReactNode } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";

const statuses = ["Prototype", "In review", "Launched"];

export default function NewProjectPage() {
  return (
    <DashboardShell
      title="Publish a project"
      description="Document your build, highlight the impact, and invite feedback from campus mentors."
      activePath="/projects/new"
    >
      <form className="space-y-6 rounded-2xl border border-white/10 bg-white/5 p-6">
        <Field label="Project title" htmlFor="title">
          <input
            id="title"
            name="title"
            required
            placeholder="Campus shuttle optimiser"
            className="auth-input"
          />
        </Field>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Status" htmlFor="status">
            <select
              id="status"
              name="status"
              defaultValue=""
              required
              className="auth-input"
            >
              <option value="" disabled>
                Choose status
              </option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Primary tech stack" htmlFor="tech">
            <input
              id="tech"
              name="tech"
              placeholder="TypeScript, Next.js, Prisma"
              className="auth-input"
            />
          </Field>
        </div>

        <Field
          label="Summary"
          htmlFor="summary"
          helper="One paragraph explaining the problem, solution, and impact."
        >
          <textarea
            id="summary"
            name="summary"
            rows={4}
            className="auth-input"
            placeholder="Describe the challenge you solved and the outcome..."
          />
        </Field>

        <Field
          label="Problem statement"
          htmlFor="problem"
          helper="What is the real-world pain point? Who experienced it?"
        >
          <textarea
            id="problem"
            name="problem"
            rows={4}
            className="auth-input"
          />
        </Field>

        <Field
          label="Solution details"
          htmlFor="solution"
          helper="Outline architecture decisions, constraints, and testing strategy."
        >
          <textarea
            id="solution"
            name="solution"
            rows={6}
            className="auth-input font-mono text-xs leading-relaxed"
          />
        </Field>

        <Field label="Repository URL" htmlFor="repo">
          <input
            id="repo"
            name="repo"
            type="url"
            placeholder="https://github.com/your-team/project"
            className="auth-input"
          />
        </Field>

        <Field label="Live demo URL" htmlFor="demo">
          <input
            id="demo"
            name="demo"
            type="url"
            placeholder="https://demo.example.com"
            className="auth-input"
          />
        </Field>

        <div className="space-y-3 rounded-xl border border-white/10 bg-black/30 p-4 text-xs text-white/60">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="h-4 w-4 rounded border-white/20 bg-transparent text-accent focus:ring-accent" />
            Allow mentors to view private repository access instructions
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="h-4 w-4 rounded border-white/20 bg-transparent text-accent focus:ring-accent" />
            Invite fellow students to beta test once approved
          </label>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition hover:-translate-y-0.5 hover:bg-indigo-500"
          >
            Save project
          </button>
        </div>
      </form>
    </DashboardShell>
  );
}

function Field({
  label,
  htmlFor,
  helper,
  children,
}: {
  label: string;
  htmlFor: string;
  helper?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={htmlFor}
        className="text-sm font-semibold text-white/70 transition hover:text-white"
      >
        {label}
      </label>
      {children}
      {helper ? <p className="text-xs text-white/45">{helper}</p> : null}
    </div>
  );
}
