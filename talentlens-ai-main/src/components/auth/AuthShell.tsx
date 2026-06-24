import { Link } from "@tanstack/react-router";
import { Brain } from "lucide-react";
import type { ReactNode } from "react";

function TalentLensLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative flex h-9 w-9 items-center justify-center">
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary to-chart-2 shadow-md shadow-primary/30" />
        <Brain className="relative h-5 w-5 text-white" />
      </div>
      <span className="text-lg font-bold tracking-tight">TalentLens</span>
    </div>
  );
}

export function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
        <Link to="/" className="mb-10 inline-block">
          <TalentLensLogo />
        </Link>
        <div className="mx-auto w-full max-w-md">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>}
        </div>
      </div>
      <div className="relative hidden overflow-hidden lg:flex">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-chart-1 to-chart-2" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_rgba(255,255,255,0.15)_0%,_transparent_50%)]" />
        <div className="absolute bottom-0 right-0 h-96 w-96 translate-x-1/3 translate-y-1/3 rounded-full bg-white/5 blur-3xl" />
        <div className="relative m-auto max-w-md px-12 text-primary-foreground">
          <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
            <Brain className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-4xl font-bold leading-tight">Recruitment intelligence that explains itself.</h2>
          <p className="mt-4 text-primary-foreground/80 leading-relaxed">
            Screen resumes, rank candidates, schedule interviews, and ship offers — all powered by AI you can trust.
          </p>
          <div className="mt-10 grid gap-3">
            {["AI-ranked top 50 candidates", "Skill gap analysis per applicant", "One-click interview scheduling"].map((s) => (
              <div key={s} className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm backdrop-blur">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20">
                  <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                {s}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}