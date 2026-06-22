import { createFileRoute } from "@tanstack/react-router";
import { CandidateLayout } from "@/components/layouts/CandidateLayout";
import { PageHeader } from "@/components/layouts/DashboardLayout";
import { useApi } from "@/hooks/useApi";
import { applicationService } from "@/services/applicationService";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/states";
import { formatDate, scoreColor, statusColor, statusLabel } from "@/lib/format";
import { FileText } from "lucide-react";

export const Route = createFileRoute("/candidate/applications")({
  ssr: false,
  component: () => (
    <CandidateLayout>
      <ApplicationsList />
    </CandidateLayout>
  ),
});

function ApplicationsList() {
  const { data, loading, error, refetch } = useApi(() => applicationService.mine(), []);

  return (
    <>
      <PageHeader title="My applications" description="Track every job you've applied to." />
      <Card>
        <CardContent className="p-0">
          {loading ? <LoadingState /> :
            error ? <div className="p-6"><ErrorState message={error} onRetry={refetch} /></div> :
            !data?.length ? <div className="p-6"><EmptyState icon={<FileText className="h-6 w-6" />} title="No applications yet" message="Browse jobs and submit your first application." /></div> :
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead>Match score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Interview</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.jobTitle}</TableCell>
                    <TableCell className="text-muted-foreground">{a.company ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(a.appliedAt)}</TableCell>
                    <TableCell className={`font-semibold ${scoreColor(a.matchScore)}`}>{a.matchScore != null ? `${a.matchScore}%` : "—"}</TableCell>
                    <TableCell><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor(a.status)}`}>{statusLabel(a.status)}</span></TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(a.interviewDate)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          }
        </CardContent>
      </Card>
    </>
  );
}