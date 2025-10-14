import type { ReactNode } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";

const tones = ["Practical guide", "Personal story", "Technical deep dive"];

export default function NewStoryPage() {
  return (
    <DashboardShell
      title="Publish a story"
      description="Capture what you learned from internships, hackathons, or campus builds."
      activePath="/stories/new"
    >
      <form className="space-y-6 rounded-2xl border border-white/10 bg-white/5 p-6">
        <Field label="Story title" htmlFor="title">
          <input
            id="title"
            name="title"
            required
            placeholder="How I landed a GPU research internship in Rabat"
            className="auth-input"
          />
        </Field>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="University" htmlFor="university">
            <input
              id="university"
              name="university"
              placeholder="e.g. Mohammed V University"
              className="auth-input"
            />
          </Field>
          <Field label="Tone" htmlFor="tone">
            <select id="tone" name="tone" defaultValue="" className="auth-input">
              <option value="" disabled>
                Choose a tone
              </option>
              {tones.map((tone) => (
                <option key={tone} value={tone}>
                  {tone}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field
          label="Hook"
          htmlFor="hook"
          helper="One or two sentences that summarise the outcome."
        >
          <textarea
            id="hook"
            name="hook"
            rows={2}
            className="auth-input"
            placeholder="Example: A robotics club debugging notebook helped me land a GPU internship with a 40 percent training speedup."
          />
        </Field>

        <Field
          label="Story body"
          htmlFor="content"
          helper="Use markdown. Add sections for context, process, and takeaways."
        >
          <textarea
            id="content"
            name="content"
            rows={12}
            className="auth-input font-mono text-xs leading-relaxed"
            placeholder="## Context"
          />
        </Field>

        <Field
          label="Tags"
          htmlFor="tags"
          helper="Separate with commas to help students discover it."
        >
          <input
            id="tags"
            name="tags"
            placeholder="Internship, Research, GPU"
            className="auth-input"
          />
        </Field>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-xs text-white/60">
            <input type="checkbox" className="h-4 w-4 rounded border-white/20 bg-transparent text-accent focus:ring-accent" />
            Allow mentors to suggest edits before publishing
          </label>
          <button
            type="submit"
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition hover:-translate-y-0.5 hover:bg-indigo-500"
          >
            Save draft
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
