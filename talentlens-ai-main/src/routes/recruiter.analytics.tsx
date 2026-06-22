import { createFileRoute } from "@tanstack/react-router";
import { RecruiterLayout } from "@/components/layouts/RecruiterLayout";
import { PageHeader, StatCard } from "@/components/layouts/DashboardLayout";
import { useApi } from "@/hooks/useApi";
import { analyticsService } from "@/services/analyticsService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/states";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Users, Sparkles, TrendingUp, Clock, Target, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/recruiter/analytics")({
  ssr: false,
  component: () => (
    <RecruiterLayout>
      <Analytics />
    </RecruiterLayout>
  ),
});

const COLORS = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)", "var(--color-chart-5)"];

function Analytics() {
  const overview = useApi(() => analyticsService.overview(), []);
  const funnel = useApi(() => analyticsService.hiringFunnel(), []);
  const over = useApi(() => analyticsService.applicationsOverTime(), []);
  const pipeline = useApi(() => analyticsService.pipeline(), []);
  const scores = useApi(() => analyticsService.aiScores(), []);

  return (
    <>
      <PageHeader title="Analytics" description="Hiring funnel, conversion, and AI-score insights." />

      {overview.loading ? <LoadingState /> : overview.error ? <ErrorState message={overview.error} onRetry={overview.refetch} /> : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard label="Applications" value={overview.data?.totalApplications ?? 0} icon={Users} />
          <StatCard label="Avg match" value={`${overview.data?.avgMatchScore ?? 0}%`} icon={Sparkles} />
          <StatCard label="Shortlist rate" value={`${overview.data?.shortlistRate ?? 0}%`} icon={Target} />
          <StatCard label="Interview conv." value={`${overview.data?.interviewConversionRate ?? 0}%`} icon={TrendingUp} />
          <StatCard label="Selection rate" value={`${overview.data?.selectionRate ?? 0}%`} icon={CheckCircle2} />
          <StatCard label="Time to shortlist" value={`${overview.data?.avgTimeToShortlistDays ?? 0}d`} icon={Clock} />
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Applications over time</CardTitle></CardHeader>
          <CardContent>
            {over.loading ? <LoadingState /> : over.error ? <ErrorState message={over.error} onRetry={over.refetch} /> :
              !over.data?.length ? <EmptyState title="No data yet" /> :
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={over.data}>
                    <defs>
                      <linearGradient id="appsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="count" stroke="var(--color-primary)" strokeWidth={2} fill="url(#appsGrad)" />
                  </AreaChart>
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
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={funnel.data} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis dataKey="stage" type="category" tick={{ fontSize: 11 }} width={100} />
                    <Tooltip />
                    <Bar dataKey="count" fill="var(--color-primary)" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            }
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Pipeline distribution</CardTitle></CardHeader>
          <CardContent>
            {pipeline.loading ? <LoadingState /> : pipeline.error ? <ErrorState message={pipeline.error} onRetry={pipeline.refetch} /> :
              !pipeline.data?.length ? <EmptyState title="No data yet" /> :
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pipeline.data} dataKey="count" nameKey="stage" cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={2}>
                      {pipeline.data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            }
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>AI match score distribution</CardTitle></CardHeader>
          <CardContent>
            {scores.loading ? <LoadingState /> : scores.error ? <ErrorState message={scores.error} onRetry={scores.refetch} /> :
              !scores.data?.length ? <EmptyState title="No data yet" /> :
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scores.data}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="bucket" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="var(--color-chart-2)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            }
          </CardContent>
        </Card>
      </div>
    </>
  );
}