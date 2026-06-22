import { createFileRoute, Link } from "@tanstack/react-router";
import { CandidateLayout, } from "@/components/layouts/CandidateLayout";
import { PageHeader, StatCard } from "@/components/layouts/DashboardLayout";
import { useApi } from "@/hooks/useApi";
import { applicationService } from "@/services/applicationService";
import { jobService } from "@/services/jobService";
import { aiService } from "@/services/aiService";
import { api } from "@/lib/api";
import type { CandidateStats } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/states";
import { Briefcase, FileText, CheckCircle2, Sparkles, MapPin, Building2 } from "lucide-react";
import { formatDate, scoreColor, statusColor, statusLabel } from "@/lib/format";

export const Route = createFileRoute("/candidate/dashboard")({
  ssr: false,
  head: () => ({ meta: [{ title: "Dashboard — TalentLens" }] }),
  component: () => (
    <CandidateLayout>
      <CandidateDashboard />
    </CandidateLayout>
  ),
});

function CandidateDashboard() {
  const stats = useApi(() => api.get<CandidateStats>("/candidate/stats"), []);
  const recommended = useApi(() => jobService.recommended(), []);
  const recent = useApi(() => applicationService.recentMine(), []);
  const analysis = useApi(() => aiService.latestResumeAnalysis().catch(() => null), []);

  return (
    <>
      <PageHeader title="Welcome back" description="Here's your hiring activity at a glance." />

      {stats.loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />)}
        </div>
      ) : stats.error ? (
        <ErrorState message={stats.error} onRetry={stats.refetch} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Applications" value={stats.data?.applicationsSubmitted ?? 0} icon={FileText} />
          <StatCard label="Shortlisted" value={stats.data?.shortlisted ?? 0} icon={CheckCircle2} />
          <StatCard label="Interviews" value={stats.data?.interviewsScheduled ?? 0} icon={Briefcase} />
          <StatCard label="Resume score" value={`${stats.data?.resumeStrengthScore ?? 0}%`} icon={Sparkles} />
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recommended jobs</CardTitle>
            <Link to="/candidate/jobs"><Button size="sm" variant="ghost">View all</Button></Link>
          </CardHeader>
          <CardContent>
            {recommended.loading ? <LoadingState /> :
              recommended.error ? <ErrorState message={recommended.error} onRetry={recommended.refetch} /> :
              !recommended.data?.length ? <EmptyState title="No recommendations yet" message="Upload your resume to get AI-matched job recommendations." /> :
              <div className="space-y-3">
                {recommended.data.slice(0, 5).map((j) => (
                  <Link key={j.id} to="/candidate/jobs/$id" params={{ id: j.id }} className="block rounded-lg border border-border p-4 transition hover:border-primary/40 hover:bg-accent/30">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{j.title}</p>
                        <p className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1"><Building2 className="h-3 w-3" /> {j.company}</span>
                          <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {j.location}</span>
                        </p>
                      </div>
                      <Badge variant="secondary">{j.jobType}</Badge>
                    </div>
                  </Link>
                ))}
              </div>
            }
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent applications</CardTitle></CardHeader>
          <CardContent>
            {recent.loading ? <LoadingState /> :
              recent.error ? <ErrorState message={recent.error} onRetry={recent.refetch} /> :
              !recent.data?.length ? <EmptyState title="No applications yet" /> :
              <div className="space-y-3">
                {recent.data.slice(0, 5).map((a) => (
                  <div key={a.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{a.jobTitle}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(a.appliedAt)}</p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor(a.status)}`}>{statusLabel(a.status)}</span>
                  </div>
                ))}
              </div>
            }
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Latest AI resume analysis</CardTitle>
            <Link to="/candidate/resume-analysis"><Button size="sm" variant="outline">Open analysis</Button></Link>
          </CardHeader>
          <CardContent>
            {analysis.loading ? <LoadingState /> :
              !analysis.data ? <EmptyState title="No analysis yet" message="Upload a resume to see your AI breakdown." /> :
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Summary</p>
                  <p className="mt-1 text-sm">{analysis.data.summary}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {analysis.data.missingSkills?.slice(0, 6).map((s) => <Badge key={s} variant="outline">{s}</Badge>)}
                  </div>
                </div>
                <div className="space-y-3">
                  {Object.entries(analysis.data.scores ?? {}).map(([k, v]) => (
                    <div key={k}>
                      <div className="flex justify-between text-xs"><span className="capitalize text-muted-foreground">{k}</span><span className={scoreColor(v as number)}>{v}%</span></div>
                      <div className="mt-1 h-1.5 rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${v}%` }} /></div>
                    </div>
                  ))}
                </div>
              </div>
            }
          </CardContent>
        </Card>
      </div>
    </>
  );
}