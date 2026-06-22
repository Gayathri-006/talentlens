import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { RecruiterLayout } from "@/components/layouts/RecruiterLayout";
import { PageHeader } from "@/components/layouts/DashboardLayout";
import { useApi } from "@/hooks/useApi";
import { jobService } from "@/services/jobService";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/states";
import { Briefcase, Plus } from "lucide-react";
import { formatDate, scoreColor } from "@/lib/format";

export const Route = createFileRoute("/recruiter/jobs")({
  ssr: false,
  component: () => (
    <RecruiterLayout>
      <RecruiterJobs />
    </RecruiterLayout>
  ),
});

function RecruiterJobs() {
  const isCreatePage = window.location.pathname.endsWith("/create");

  if (isCreatePage) {
    return <Outlet />;
  }

  const { data, loading, error, refetch } = useApi(() => jobService.recruiterList(), []);

  return (
    <>
      <PageHeader
        title="Jobs"
        description="Manage your job postings and their applicants."
        actions={
          <Link to="/recruiter/jobs/create">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Post job
            </Button>
          </Link>
        }
      />

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <LoadingState />
          ) : error ? (
            <div className="p-6">
              <ErrorState message={error} onRetry={refetch} />
            </div>
          ) : !data?.length ? (
            <div className="p-6">
              <EmptyState
                icon={<Briefcase className="h-6 w-6" />}
                title="No jobs yet"
                message="Post your first job to start receiving applicants."
                action={
                  <Link to="/recruiter/jobs/create">
                    <Button>Post job</Button>
                  </Link>
                }
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Applicants</TableHead>
                  <TableHead>Avg score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((j) => (
                  <TableRow key={j.id}>
                    <TableCell className="font-medium">{j.title}</TableCell>
                    <TableCell className="text-muted-foreground">{j.location}</TableCell>
                    <TableCell>{j.applicantsCount ?? 0}</TableCell>
                    <TableCell className={scoreColor(j.avgMatchScore)}>
                      {j.avgMatchScore != null ? `${j.avgMatchScore}%` : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={j.status === "active" ? "default" : "secondary"}>
                        {j.status ?? "active"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(j.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}