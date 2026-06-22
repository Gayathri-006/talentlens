import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Brain,
  Sparkles,
  Users,
  Calendar,
  Mail,
  BarChart3,
  FileSearch,
  Trophy,
  ListChecks,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TalentLens — Smarter Hiring. Better Talent." },
      { name: "description", content: "AI-powered recruitment intelligence for modern hiring teams. Screen resumes, score candidates, and rank your top 50 automatically." },
      { property: "og:title", content: "TalentLens — AI Recruitment Intelligence" },
      { property: "og:description", content: "AI-powered recruitment intelligence for modern hiring teams." },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: FileSearch, title: "AI resume screening", desc: "Parse and score every resume against the job in seconds." },
  { icon: Sparkles, title: "Candidate match scoring", desc: "Multi-dimensional fit score across skills, experience, and projects." },
  { icon: Trophy, title: "Top 50 ranking", desc: "Instantly surface the best candidates per role with explainable rankings." },
  { icon: ListChecks, title: "Pipeline tracking", desc: "Move candidates through your hiring stages with a clean Kanban view." },
  { icon: Calendar, title: "Interview scheduling", desc: "Schedule interviews with one-click meeting links and reminders." },
  { icon: Mail, title: "Email notifications", desc: "Branded, automated emails for every applicant touchpoint." },
  { icon: BarChart3, title: "Recruiter analytics", desc: "Funnel, conversion, and AI-score dashboards that drive decisions." },
  { icon: Users, title: "Candidate insights", desc: "Skill gaps, strengths, and interview questions tailored per applicant." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Brain className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold tracking-tight">TalentLens</span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#how" className="hover:text-foreground">How it works</a>
            <a href="#ai" className="hover:text-foreground">AI</a>
            <a href="#pricing" className="hover:text-foreground">Pricing</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link to="/signup">
              <Button size="sm">Get started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--color-accent)_0%,_transparent_60%)]" />
        <div className="mx-auto max-w-7xl px-6 pt-20 pb-24 text-center">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> AI Recruitment Intelligence Platform
          </div>
          <h1 className="mx-auto max-w-3xl text-5xl font-bold tracking-tight text-foreground md:text-6xl">
            Smarter Hiring. <span className="bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">Better Talent.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            AI-powered recruitment intelligence for modern hiring teams. Screen resumes,
            score candidates, and surface your top 50 automatically.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
  <Link to="/signup">
    <Button size="lg" className="gap-2">
      Get Started <ArrowRight className="h-4 w-4" />
    </Button>
  </Link>
</div>
          
          <div className="mt-16 rounded-2xl border border-border bg-card p-2 shadow-2xl shadow-primary/10">
            <div className="grid gap-4 rounded-xl bg-gradient-to-br from-accent/60 to-background p-8 md:grid-cols-3">
              {[
                { label: "Avg Match Score", value: "87%" },
                { label: "Time to Shortlist", value: "−68%" },
                { label: "Resumes Analyzed", value: "120k+" },
              ].map((s) => (
                <div key={s.label} className="rounded-lg border border-border bg-background p-6 text-left">
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Everything your hiring team needs</h2>
          <p className="mt-3 text-muted-foreground">Designed for recruiters who want AI insight without losing the human touch.</p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <Card key={f.title} className="border-border/70 transition hover:border-primary/40 hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How */}
      <section id="how" className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">How it works</h2>
            <p className="mt-3 text-muted-foreground">From job post to offer letter in record time.</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { n: "01", t: "Post a role", d: "Define the skills, experience, and requirements that matter." },
              { n: "02", t: "Let AI analyze", d: "Every resume is parsed, scored, and matched against the role." },
              { n: "03", t: "Hire the top 50", d: "Review ranked candidates, schedule interviews, send offers." },
            ].map((s) => (
              <Card key={s.n}>
                <CardContent className="p-8">
                  <span className="text-sm font-mono text-primary">{s.n}</span>
                  <h3 className="mt-3 text-xl font-semibold">{s.t}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* AI Section */}
      <section id="ai" className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">AI Intelligence</span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">Recruitment intelligence that explains itself</h2>
            <p className="mt-4 text-muted-foreground">
              Every score comes with a rationale. See exactly why a candidate ranks
              where they do, what skills they're missing, and what to ask in the
              interview.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {["Resume strength score", "Skill gap analysis", "Interview question generation", "Top 50 candidate ranking"].map((i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary" /> {i}
                </li>
              ))}
            </ul>
          </div>
          <Card className="border-primary/20 bg-gradient-to-br from-card to-accent/40">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ananya Sharma</p>
                  <p className="font-semibold">Senior Frontend Engineer</p>
                </div>
                <div className="rounded-lg bg-primary px-3 py-1 text-sm font-semibold text-primary-foreground">91% match</div>
              </div>
              <div className="mt-6 space-y-3">
                {[
                  { k: "Technical fit", v: 88 },
                  { k: "Experience fit", v: 84 },
                  { k: "Project quality", v: 92 },
                ].map((r) => (
                  <div key={r.k}>
                    <div className="flex justify-between text-xs text-muted-foreground"><span>{r.k}</span><span>{r.v}%</span></div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${r.v}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-6 rounded-lg border border-border bg-background p-4 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Strong shortlist.</span> Excellent React + Node depth, strong project portfolio. Missing: Docker.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Simple, transparent pricing</h2>
            <p className="mt-3 text-muted-foreground">Start free. Upgrade when your hiring scales.</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { name: "Starter", price: "$0", desc: "For individual recruiters trying out TalentLens.", features: ["3 active jobs", "AI resume screening", "Basic analytics"] },
              { name: "Growth", price: "$99", desc: "For teams hiring across multiple roles.", features: ["Unlimited jobs", "Top 50 ranking", "Interview scheduling", "Email automation"], featured: true },
              { name: "Enterprise", price: "Custom", desc: "For organizations with bespoke workflows.", features: ["SSO & SAML", "Advanced analytics", "Dedicated success manager"] },
            ].map((p) => (
              <Card key={p.name} className={p.featured ? "border-primary shadow-lg shadow-primary/10" : ""}>
                <CardContent className="p-8">
                  <h3 className="font-semibold">{p.name}</h3>
                  <p className="mt-3 text-4xl font-bold">{p.price}<span className="text-base font-normal text-muted-foreground">{p.price.startsWith("$") && p.price !== "$0" ? "/mo" : ""}</span></p>
                  <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
                  <ul className="mt-6 space-y-2 text-sm">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Link to="/signup"><Button className="mt-6 w-full" variant={p.featured ? "default" : "outline"}>Choose {p.name}</Button></Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { q: "We cut time-to-shortlist by 70%. The AI rankings are eerily accurate.", a: "Priya R.", r: "Head of Talent, Northwind" },
            { q: "Finally a recruiting tool that explains why a candidate is a fit.", a: "Marcus T.", r: "Recruiter, Helio Labs" },
            { q: "Pipeline view + AI scoring is the combo I didn't know I needed.", a: "Sara K.", r: "People Ops, Brightline" },
          ].map((t) => (
            <Card key={t.a}>
              <CardContent className="p-6">
                <p className="text-sm leading-relaxed text-foreground">"{t.q}"</p>
                <div className="mt-4">
                  <p className="text-sm font-semibold">{t.a}</p>
                  <p className="text-xs text-muted-foreground">{t.r}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-10 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Brain className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium">TalentLens</span>
          </div>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} TalentLens. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
