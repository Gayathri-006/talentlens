import { Link } from "@tanstack/react-router";
import { Brain } from "lucide-react";
import type { ReactNode } from "react";

export function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
        <Link to="/" className="mb-10 inline-flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Brain className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">TalentLens</span>
        </Link>
        <div className="mx-auto w-full max-w-md">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>}
        </div>
      </div>
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-primary via-chart-1 to-chart-2 lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_rgba(255,255,255,0.2)_0%,_transparent_50%)]" />
        <div className="relative m-auto max-w-md px-12 text-primary-foreground">
          <h2 className="text-4xl font-bold leading-tight">Recruitment intelligence that explains itself.</h2>
          <p className="mt-4 text-primary-foreground/80">
            Screen resumes, rank candidates, schedule interviews, and ship offers — all powered by AI you can trust.
          </p>
          <div className="mt-10 grid gap-3">
            {["AI-ranked top 50 candidates", "Skill gap analysis per applicant", "One-click interview scheduling"].map((s) => (
              <div key={s} className="rounded-lg border border-white/15 bg-white/10 px-4 py-3 text-sm backdrop-blur">
                {s}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}