import { createFileRoute, Link } from "@tanstack/react-router";
import { RecruiterLayout } from "@/components/layouts/RecruiterLayout";
import { PageHeader, StatCard } from "@/components/layouts/DashboardLayout";
import { useApi } from "@/hooks/useApi";
import { recruiterService } from "@/services/recruiterService";
import { analyticsService } from "@/services/analyticsService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/states";
import { Briefcase, Users, CheckCircle2, Calendar, Sparkles } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Line, LineChart } from "recharts";
import { formatDate, scoreColor, statusColor, statusLabel } from "@/lib/format";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/recruiter/dashboard")({
  ssr: false,
  component: () => (
    <RecruiterLayout>
      <RecruiterDashboard />
    </RecruiterLayout>
  ),
});

function RecruiterDashboard() {
  const stats = useApi(() => recruiterService.stats(), []);
  const recent = useApi(() => recruiterService.recentApplicants(), []);
  const top = useApi(() => recruiterService.topCandidates(), []);
  const funnel = useApi(() => analyticsService.hiringFunnel(), []);
  const overTime = useApi(() => analyticsService.applicationsOverTime(), []);

  return (
    <>
      <PageHeader
        title="Recruiter dashboard"
        description="Your hiring pipeline at a glance."
        actions={<Link to="/recruiter/jobs/create"><Button>Post new job</Button></Link>}
      />

      {stats.loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />)}
        </div>
      ) : stats.error ? <ErrorState message={stats.error} onRetry={stats.refetch} /> : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <StatCard label="Active jobs" value={stats.data?.activeJobs ?? 0} icon={Briefcase} />
          <StatCard label="Applicants" value={stats.data?.totalApplicants ?? 0} icon={Users} />
          <StatCard label="Shortlisted" value={stats.data?.shortlisted ?? 0} icon={CheckCircle2} />
          <StatCard label="Interviews" value={stats.data?.interviewsScheduled ?? 0} icon={Calendar} />
          <StatCard label="Avg match" value={`${stats.data?.avgMatchScore ?? 0}%`} icon={Sparkles} />
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Applications over time</CardTitle></CardHeader>
          <CardContent>
            {overTime.loading ? <LoadingState /> : overTime.error ? <ErrorState message={overTime.error} onRetry={overTime.refetch} /> :
              !overTime.data?.length ? <EmptyState title="No data yet" /> :
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={overTime.data}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="var(--color-primary)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            }
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Hiring funnel</CardTitle></CardHeader>
          <CardContent>
            {funnel.loading ? <LoadingState /> : funnel.error ? <ErrorState message={funnel.error} onRetry={funnel.refetch} /> :
              !funnel.data?.length ? <EmptyState title="No data yet" /> :
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={funnel.data}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="stage" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            }
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Recent applicants</CardTitle></CardHeader>
          <CardContent>
            {recent.loading ? <LoadingState /> : recent.error ? <ErrorState message={recent.error} onRetry={recent.refetch} /> :
              !recent.data?.length ? <EmptyState title="No applicants yet" /> :
              <div className="space-y-3">
                {recent.data.slice(0, 6).map((a) => (
                  <div key={a.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{a.candidateName ?? "Candidate"}</p>
                      <p className="text-xs text-muted-foreground">{a.jobTitle} · {formatDate(a.appliedAt)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {a.matchScore != null && <span className={`text-sm font-semibold ${scoreColor(a.matchScore)}`}>{a.matchScore}%</span>}
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor(a.status)}`}>{statusLabel(a.status)}</span>
                    </div>
                  </div>
                ))}
              </div>
            }
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Top AI-ranked candidates</CardTitle></CardHeader>
          <CardContent>
            {top.loading ? <LoadingState /> : top.error ? <ErrorState message={top.error} onRetry={top.refetch} /> :
              !top.data?.length ? <EmptyState title="Run AI ranking on a job to see top candidates" /> :
              <div className="space-y-3">
                {top.data.slice(0, 6).map((c) => (
                  <div key={c.applicationId} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">#{c.rank}</div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{c.candidateName}</p>
                        <p className="truncate text-xs text-muted-foreground">{c.recommendation}</p>
                      </div>
                    </div>
                    <span className={`text-sm font-semibold ${scoreColor(c.matchScore)}`}>{c.matchScore}%</span>
                  </div>
                ))}
              </div>
            }
          </CardContent>
        </Card>
      </div>
    </>
  );
}