import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sparkles, Users, Calendar, Mail, BarChart3,
  FileSearch, Trophy, ListChecks, ArrowRight, CheckCircle2,
  Zap, Shield, Brain,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TalentLens — Smarter Hiring. Better Talent." },
      { name: "description", content: "AI-powered recruitment intelligence for modern hiring teams." },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: FileSearch, title: "AI Resume Screening", desc: "Parse and score every resume against the job description in seconds." },
  { icon: Sparkles, title: "Candidate Scoring", desc: "Multi-dimensional fit score across skills, experience, and projects." },
  { icon: Trophy, title: "Top 50 Ranking", desc: "Instantly surface the best candidates per role with explainable rankings." },
  { icon: ListChecks, title: "Pipeline Tracking", desc: "Move candidates through hiring stages with a clean Kanban board." },
  { icon: Calendar, title: "Interview Scheduling", desc: "Schedule interviews with one-click meeting links and reminders." },
  { icon: Mail, title: "Email Automation", desc: "Branded, automated emails for every applicant touchpoint." },
  { icon: BarChart3, title: "Recruiter Analytics", desc: "Funnel, conversion, and AI-score dashboards that drive decisions." },
  { icon: Users, title: "Candidate Insights", desc: "Skill gaps, strengths, and interview questions tailored per applicant." },
];

function TalentLensLogo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "h-7 w-7", md: "h-9 w-9", lg: "h-11 w-11" };
  const icon = { sm: "h-3.5 w-3.5", md: "h-4.5 w-4.5", lg: "h-6 w-6" };
  const text = { sm: "text-sm", md: "text-base", lg: "text-xl" };
  return (
    <div className="flex items-center gap-2.5">
      <div className={`relative flex ${sizes[size]} items-center justify-center`}>
        <div className={`absolute inset-0 rounded-xl bg-gradient-to-br from-primary to-chart-2 opacity-90 shadow-md shadow-primary/30`} />
        <Brain className={`relative ${icon[size]} text-white`} />
      </div>
      <span className={`font-bold tracking-tight ${text[size]}`}>TalentLens</span>
    </div>
  );
}

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link to="/"><TalentLensLogo /></Link>
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how" className="hover:text-foreground transition-colors">How it works</a>
            <a href="#ai" className="hover:text-foreground transition-colors">AI</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login"><Button variant="ghost" size="sm">Log in</Button></Link>
            <Link to="/signup"><Button size="sm" className="gap-1.5"><Zap className="h-3.5 w-3.5" />Get started</Button></Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,color-mix(in_oklab,var(--color-primary)_18%,transparent),transparent)]" />
          <div className="absolute right-0 top-0 h-[600px] w-[600px] -translate-y-1/4 translate-x-1/4 rounded-full bg-chart-2/8 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-[400px] w-[400px] translate-y-1/4 -translate-x-1/4 rounded-full bg-primary/6 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-6 pt-20 pb-16">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            {/* Left: copy */}
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-3.5 py-1.5 text-xs font-medium text-primary">
                <Sparkles className="h-3 w-3" /> AI Recruitment Intelligence Platform
              </div>
              <h1 className="text-5xl font-bold tracking-tight leading-[1.1] md:text-6xl">
                Smarter hiring.{" "}
                <span className="bg-gradient-to-r from-primary via-chart-1 to-chart-2 bg-clip-text text-transparent">
                  Better talent.
                </span>
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground max-w-lg">
                Screen resumes, score candidates, and surface your top 50 automatically.
                AI that explains every decision — so your team can focus on people, not paperwork.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/signup">
                  <Button size="lg" className="gap-2 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-shadow">
                    Start for free <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <a href="#how">
                  <Button size="lg" variant="outline" className="gap-2">See how it works</Button>
                </a>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
                {["No credit card needed", "Free tier available", "Setup in 2 minutes"].map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" /> {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: visual dashboard mockup */}
            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-primary/10 to-chart-2/10 blur-2xl" />
              <div className="relative rounded-2xl border border-border/60 bg-card shadow-2xl shadow-primary/10 overflow-hidden">
                {/* Mock header bar */}
                <div className="flex items-center gap-2 border-b border-border px-5 py-3 bg-muted/30">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  <span className="ml-3 text-xs text-muted-foreground">TalentLens — AI Analysis</span>
                </div>
                <div className="p-6 space-y-4">
                  {/* Candidate card */}
                  <div className="flex items-center justify-between rounded-xl border border-border bg-background p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-chart-2 text-white font-bold text-sm">AS</div>
                      <div>
                        <p className="text-sm font-semibold">Ananya Sharma</p>
                        <p className="text-xs text-muted-foreground">Senior Frontend Engineer</p>
                      </div>
                    </div>
                    <div className="rounded-lg bg-emerald-100 dark:bg-emerald-900/40 px-3 py-1 text-sm font-bold text-emerald-700 dark:text-emerald-400">91%</div>
                  </div>
                  {/* Score bars */}
                  <div className="space-y-3">
                    {[
                      { k: "Technical Fit", v: 88, color: "bg-primary" },
                      { k: "Experience", v: 84, color: "bg-chart-2" },
                      { k: "Project Quality", v: 92, color: "bg-emerald-500" },
                      { k: "Communication", v: 76, color: "bg-chart-4" },
                    ].map((r) => (
                      <div key={r.k}>
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>{r.k}</span><span className="font-medium text-foreground">{r.v}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div className={`h-full rounded-full ${r.color}`} style={{ width: `${r.v}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* AI verdict */}
                  <div className="rounded-lg border border-border bg-muted/30 p-3.5">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      <span className="font-semibold text-foreground">AI Verdict:</span>{" "}
                      Strong shortlist. Excellent React + Node depth, impressive project portfolio. Missing: Docker, Kubernetes.
                    </p>
                  </div>
                  {/* Quick stats row */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "ATS Score", value: "87" },
                      { label: "Interview Ready", value: "82" },
                      { label: "Match Rank", value: "#2" },
                    ].map((s) => (
                      <div key={s.label} className="rounded-lg border border-border bg-background p-3 text-center">
                        <p className="text-lg font-bold text-primary">{s.value}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats band */}
        <div className="border-y border-border/50 bg-muted/20">
          <div className="mx-auto max-w-7xl px-6 py-8">
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { label: "Avg Match Score", value: "87%" },
                { label: "Faster Shortlisting", value: "68%" },
                { label: "Resumes Analyzed", value: "120k+" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-3xl font-bold text-foreground">{s.value}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center mb-14">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">Features</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">Everything your hiring team needs</h2>
          <p className="mt-3 text-muted-foreground">Designed for recruiters who want AI insight without losing the human touch.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <Card key={f.title} className="group border-border/60 transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold text-sm">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-t border-border bg-muted/20">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="mx-auto max-w-2xl text-center mb-14">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">Process</span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">From job post to offer in record time</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { n: "01", t: "Post a role", d: "Define the skills, experience, and requirements that matter most for your position.", icon: FileSearch },
              { n: "02", t: "Let AI analyze", d: "Every resume is parsed, scored, and matched against your role requirements automatically.", icon: Brain },
              { n: "03", t: "Hire the best", d: "Review AI-ranked candidates, schedule interviews, and send offers with one click.", icon: Trophy },
            ].map((s, i) => (
              <div key={s.n} className="relative">
                {i < 2 && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 -translate-x-0 hidden w-8 items-center justify-center md:flex z-10">
                    <ArrowRight className="h-4 w-4 text-muted-foreground/40" />
                  </div>
                )}
                <Card className="border-border/60 hover:border-primary/30 transition-colors duration-300 h-full">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-5">
                      <span className="text-4xl font-black text-primary/15">{s.n}</span>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <s.icon className="h-5 w-5" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold">{s.t}</h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.d}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI section */}
      <section id="ai" className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">AI Intelligence</span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">Recruitment AI that explains itself</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Every score comes with a rationale. See exactly why a candidate ranks where they do,
              what skills they're missing, and what to ask in the interview.
            </p>
            <ul className="mt-6 space-y-3.5 text-sm">
              {[
                { t: "Resume strength score", d: "Multi-dimensional ATS and quality scoring" },
                { t: "Skill gap analysis", d: "Identifies exactly what's missing for the role" },
                { t: "Interview question generation", d: "Tailored questions based on the resume" },
                { t: "Top 50 candidate ranking", d: "Explainable rankings your team can trust" },
              ].map((i) => (
                <li key={i.t} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                  <div>
                    <span className="font-medium">{i.t}</span>
                    <span className="text-muted-foreground"> — {i.d}</span>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex gap-3">
              <Link to="/signup"><Button className="gap-2">Try it free <ArrowRight className="h-3.5 w-3.5" /></Button></Link>
            </div>
          </div>
          <Card className="border-primary/20 bg-gradient-to-br from-card to-accent/30 shadow-xl shadow-primary/8">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Candidate</p>
                  <p className="font-semibold text-lg mt-0.5">Ananya Sharma</p>
                  <p className="text-sm text-muted-foreground">Senior Frontend Engineer</p>
                </div>
                <div className="flex h-16 w-16 flex-col items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
                  <span className="text-xl font-black">91</span>
                  <span className="text-xs opacity-80">match</span>
                </div>
              </div>
              <div className="space-y-3.5">
                {[
                  { k: "Technical fit", v: 88, color: "bg-primary" },
                  { k: "Experience fit", v: 84, color: "bg-chart-2" },
                  { k: "Project quality", v: 92, color: "bg-emerald-500" },
                ].map((r) => (
                  <div key={r.k}>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                      <span>{r.k}</span><span className="font-semibold text-foreground">{r.v}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div className={`h-full rounded-full ${r.color}`} style={{ width: `${r.v}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-xl border border-border bg-background/70 p-4 backdrop-blur-sm">
                <p className="text-xs leading-relaxed text-muted-foreground">
                  <span className="font-semibold text-foreground">AI Verdict:</span>{" "}
                  Strong shortlist. Excellent React + Node.js depth, impressive project portfolio with real-world impact.
                  <span className="text-amber-600"> Missing: Docker, Kubernetes.</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-border bg-muted/20">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="mx-auto max-w-2xl text-center mb-14">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">Pricing</span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">Simple, transparent pricing</h2>
            <p className="mt-3 text-muted-foreground">Start free. Upgrade when your hiring scales.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { name: "Starter", price: "$0", desc: "For individual recruiters exploring TalentLens.", features: ["3 active jobs", "AI resume screening", "Basic analytics"], featured: false },
              { name: "Growth", price: "$99", desc: "For teams hiring across multiple roles.", features: ["Unlimited jobs", "Top 50 ranking", "Interview scheduling", "Email automation", "Advanced analytics"], featured: true },
              { name: "Enterprise", price: "Custom", desc: "For organizations with bespoke workflows.", features: ["SSO & SAML", "Custom integrations", "Dedicated success manager", "SLA guarantee"], featured: false },
            ].map((p) => (
              <Card key={p.name} className={`relative border transition-all duration-300 hover:-translate-y-1 ${p.featured ? "border-primary shadow-2xl shadow-primary/15 scale-[1.02]" : "border-border/60 hover:border-primary/30 hover:shadow-lg"}`}>
                {p.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground shadow-md shadow-primary/30">Most popular</span>
                  </div>
                )}
                <CardContent className="p-8">
                  <h3 className="font-bold text-lg">{p.name}</h3>
                  <div className="mt-3 flex items-end gap-1">
                    <span className="text-4xl font-black">{p.price}</span>
                    {p.price.startsWith("$") && p.price !== "$0" && <span className="text-muted-foreground mb-1">/month</span>}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
                  <ul className="mt-6 space-y-2.5 text-sm">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Link to="/signup">
                    <Button className="mt-8 w-full" variant={p.featured ? "default" : "outline"}>
                      {p.name === "Enterprise" ? "Contact us" : `Get started with ${p.name}`}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center mb-14">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">Testimonials</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight">Trusted by hiring teams</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { q: "We cut time-to-shortlist by 70%. The AI rankings are eerily accurate.", a: "Priya R.", r: "Head of Talent, Northwind" },
            { q: "Finally a recruiting tool that explains why a candidate is a fit — not just a score.", a: "Marcus T.", r: "Recruiter, Helio Labs" },
            { q: "Pipeline view + AI scoring is the combo I didn't know I needed.", a: "Sara K.", r: "People Ops, Brightline" },
          ].map((t) => (
            <Card key={t.a} className="border-border/60 hover:border-primary/30 hover:shadow-md transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="h-4 w-4 fill-amber-400 text-amber-400" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-foreground">"{t.q}"</p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                    {t.a.split(" ").map(p => p[0]).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.a}</p>
                    <p className="text-xs text-muted-foreground">{t.r}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-4xl px-6 py-24 text-center">
          <div className="relative rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/8 to-chart-2/8 p-12 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,color-mix(in_oklab,var(--color-primary)_12%,transparent),transparent)] pointer-events-none" />
            <Shield className="mx-auto mb-4 h-10 w-10 text-primary opacity-80" />
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Ready to hire smarter?</h2>
            <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
              Join thousands of recruiters using TalentLens to find the right talent, faster.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/signup"><Button size="lg" className="gap-2 shadow-lg shadow-primary/25">Get started free <ArrowRight className="h-4 w-4" /></Button></Link>
              <Link to="/login"><Button size="lg" variant="outline">Log in</Button></Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/10">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <TalentLensLogo size="sm" />
            <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} TalentLens. All rights reserved.</p>
            <div className="flex gap-6 text-xs text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
