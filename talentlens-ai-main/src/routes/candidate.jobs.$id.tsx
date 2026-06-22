import { createFileRoute, Link, Outlet, useParams, useRouterState } from "@tanstack/react-router";
import { CandidateLayout } from "@/components/layouts/CandidateLayout";
import { useApi } from "@/hooks/useApi";
import { jobService } from "@/services/jobService";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ErrorState, LoadingState } from "@/components/common/states";
import { ArrowLeft, Building2, MapPin } from "lucide-react";

export const Route = createFileRoute("/candidate/jobs/$id")({
  ssr: false,
  component: () => (
    <CandidateLayout>
      <JobDetail />
    </CandidateLayout>
  ),
});

function JobDetail() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isApplyPage = pathname.endsWith("/apply");

  if (isApplyPage) {
    return <Outlet />;
  }

  const { id } = useParams({ from: "/candidate/jobs/$id" });
  const { data, loading, error, refetch } = useApi(() => jobService.byId(id), [id]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!data) return null;

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        to="/candidate/jobs"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to jobs
      </Link>

      <Card>
        <CardContent className="p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">{data.title}</h1>

              <p className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  {data.company}
                </span>

                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {data.location}
                </span>

                <Badge variant="secondary">{data.jobType}</Badge>
                <Badge variant="outline">{data.experienceLevel}</Badge>
              </p>
            </div>

            <Link to="/candidate/jobs/$id/apply" params={{ id }}>
              <Button size="lg">Apply now</Button>
            </Link>
          </div>

          {data.salaryRange && (
            <p className="mt-6 text-lg font-semibold">{data.salaryRange}</p>
          )}

          <Section title="Description">
            <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {data.description}
            </p>
          </Section>

          {data.responsibilities?.length ? (
            <Section title="Responsibilities">
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {data.responsibilities.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </Section>
          ) : null}

          {data.requirements?.length ? (
            <Section title="Requirements">
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {data.requirements.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </Section>
          ) : null}

          {data.skills?.length ? (
            <Section title="Required skills">
              <div className="flex flex-wrap gap-1.5">
                {data.skills.map((s) => (
                  <Badge key={s} variant="secondary">
                    {s}
                  </Badge>
                ))}
              </div>
            </Section>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-6">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-foreground">
        {title}
      </h2>
      {children}
    </div>
  );
}