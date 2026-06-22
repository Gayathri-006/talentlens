import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { CandidateLayout } from "@/components/layouts/CandidateLayout";
import { PageHeader } from "@/components/layouts/DashboardLayout";
import { useApi } from "@/hooks/useApi";
import { jobService, type JobFilters } from "@/services/jobService";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/states";
import { Briefcase, MapPin, Building2, Search } from "lucide-react";

export const Route = createFileRoute("/candidate/jobs")({
  ssr: false,
  component: () => (
    <CandidateLayout>
      <CandidateJobs />
    </CandidateLayout>
  ),
});

function CandidateJobs() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isChildPage = pathname !== "/candidate/jobs";

  if (isChildPage) {
    return <Outlet />;
  }

  const [filters, setFilters] = useState<JobFilters>({});
  const stable = useMemo(() => filters, [filters]);
  const { data, loading, error, refetch } = useApi(() => jobService.list(stable), [stable]);

  return (
    <>
      <PageHeader title="Find your next role" description="Browse jobs tailored to your skills." />

      <Card className="mb-6">
        <CardContent className="grid gap-3 p-4 md:grid-cols-5">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search jobs, companies, skills..."
              className="pl-9"
              value={filters.search ?? ""}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>

          <Input
            placeholder="Location"
            value={filters.location ?? ""}
            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
          />

          <Select
            value={filters.jobType ?? "any"}
            onValueChange={(v) => setFilters({ ...filters, jobType: v === "any" ? undefined : v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Job type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any type</SelectItem>
              <SelectItem value="full-time">Full-time</SelectItem>
              <SelectItem value="part-time">Part-time</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
              <SelectItem value="internship">Internship</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.experienceLevel ?? "any"}
            onValueChange={(v) =>
              setFilters({ ...filters, experienceLevel: v === "any" ? undefined : v })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Experience" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any level</SelectItem>
              <SelectItem value="entry">Entry</SelectItem>
              <SelectItem value="mid">Mid</SelectItem>
              <SelectItem value="senior">Senior</SelectItem>
              <SelectItem value="lead">Lead</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : !data?.length ? (
        <EmptyState
          icon={<Briefcase className="h-6 w-6" />}
          title="No jobs found"
          message="Try adjusting your filters."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {data.map((j) => (
            <Card key={j.id} className="transition hover:border-primary/40">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{j.title}</h3>
                    <p className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {j.company}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {j.location}
                      </span>
                    </p>
                  </div>
                  <Badge variant="secondary">{j.jobType}</Badge>
                </div>

                {j.salaryRange && <p className="mt-3 text-sm text-foreground">{j.salaryRange}</p>}

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {(j.skills ?? []).slice(0, 5).map((s) => (
                    <Badge key={s} variant="outline">
                      {s}
                    </Badge>
                  ))}
                </div>

                <div className="mt-4 flex justify-end">
                  <Link to="/candidate/jobs/$id" params={{ id: j.id }}>
                    <Button size="sm">View & Apply</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}