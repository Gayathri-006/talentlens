import { createFileRoute } from "@tanstack/react-router";
import { RecruiterLayout } from "@/components/layouts/RecruiterLayout";
import { PageHeader } from "@/components/layouts/DashboardLayout";
import { useApi } from "@/hooks/useApi";
import { recruiterService } from "@/services/recruiterService";
import { applicationService } from "@/services/applicationService";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/states";
import { Users, Calendar, CheckCircle2, XCircle } from "lucide-react";
import { formatDate, scoreColor, statusColor, statusLabel } from "@/lib/format";
import type { ApplicationStatus } from "@/lib/types";
import { toast } from "sonner";

export const Route = createFileRoute("/recruiter/applicants")({
  ssr: false,
  component: () => (
    <RecruiterLayout>
      <Applicants />
    </RecruiterLayout>
  ),
});

function Applicants() {
  const { data, loading, error, refetch } = useApi(
    () => recruiterService.recentApplicants(),
    []
  );

  async function updateStatus(id: string, status: ApplicationStatus) {
    try {
      await applicationService.updateStatus(id, status);
      toast.success(`Application marked as ${statusLabel(status)}`);
      void refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update status");
    }
  }

  return (
    <>
      <PageHeader
        title="Applicants"
        description="All applicants across your jobs."
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
                icon={<Users className="h-6 w-6" />}
                title="No applicants yet"
                message="Applicants will appear here after candidates apply to your jobs."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Candidate</th>
                    <th className="px-4 py-3">Job</th>
                    <th className="px-4 py-3">Applied</th>
                    <th className="px-4 py-3">AI Score</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Resume</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {data.map((a) => (
                    <tr key={a.id} className="border-b border-border hover:bg-accent/40">
                      <td className="px-4 py-3">
                        <p className="font-medium">{a.candidateName ?? "Candidate"}</p>
                        <p className="text-xs text-muted-foreground">
                          {a.candidateEmail ?? "No email"}
                        </p>
                      </td>

                      <td className="px-4 py-3">
                        <p className="font-medium">{a.jobTitle ?? "Job"}</p>
                        <p className="text-xs text-muted-foreground">{a.company}</p>
                      </td>

                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDate(a.appliedAt)}
                      </td>

                      <td className="px-4 py-3">
                        {a.matchScore != null ? (
                          <span className={`font-semibold ${scoreColor(a.matchScore)}`}>
                            {a.matchScore}%
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Not scored</span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor(
                            a.status
                          )}`}
                        >
                          {statusLabel(a.status)}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        {a.resumeFilename ? (
                          <Badge variant="outline">{a.resumeFilename}</Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1"
                            onClick={() => updateStatus(a.id, "shortlisted")}
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            Shortlist
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1"
                            onClick={() => updateStatus(a.id, "interview")}
                          >
                            <Calendar className="h-3 w-3" />
                            Interview
                          </Button>

                          <Button
                            size="sm"
                            variant="destructive"
                            className="gap-1"
                            onClick={() => updateStatus(a.id, "rejected")}
                          >
                            <XCircle className="h-3 w-3" />
                            Reject
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
