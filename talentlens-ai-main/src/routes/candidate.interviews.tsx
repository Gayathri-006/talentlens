import { createFileRoute } from "@tanstack/react-router";
import { CandidateLayout } from "@/components/layouts/CandidateLayout";
import { PageHeader } from "@/components/layouts/DashboardLayout";
import { useApi } from "@/hooks/useApi";
import { interviewService } from "@/services/interviewService";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/states";
import { Calendar as CalIcon, Clock, Video, User, Sparkles } from "lucide-react";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/candidate/interviews")({
  ssr: false,
  component: () => (
    <CandidateLayout>
      <CandidateInterviews />
    </CandidateLayout>
  ),
});

function CandidateInterviews() {
  const { data, loading, error, refetch } = useApi(() => interviewService.list(), []);
  return (
    <>
      <PageHeader title="Your interviews" description="Upcoming and past interview rounds." />
      {loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={refetch} /> :
        !data?.length ? <EmptyState icon={<CalIcon className="h-6 w-6" />} title="No interviews yet" message="When recruiters schedule an interview, it will appear here." /> : (
          <div className="grid gap-3 md:grid-cols-2">
            {data.map((i) => (
              <Card key={i.id} className="transition hover:border-primary/40 hover:shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-accent-foreground">{i.type}</span>
                      <h3 className="mt-2 font-semibold">{i.jobTitle}</h3>
                      <p className="text-xs text-muted-foreground">with {i.interviewerName}</p>
                    </div>
                    <span className={`text-[10px] font-medium uppercase ${i.status === "scheduled" ? "text-emerald-600" : "text-muted-foreground"}`}>{i.status}</span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2"><CalIcon className="h-4 w-4" />{formatDate(i.date)}</div>
                    <div className="flex items-center gap-2"><Clock className="h-4 w-4" />{i.time}</div>
                    <div className="flex items-center gap-2 col-span-2"><User className="h-4 w-4" />{i.interviewerName}</div>
                  </div>
                  {i.meetingLink && (
                    <a href={i.meetingLink} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
                      <Video className="h-4 w-4" /> Join meeting
                    </a>
                  )}
                  {i.notes && (
                    <p className="mt-4 flex gap-2 rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
                      <Sparkles className="h-4 w-4 shrink-0 text-primary" /> {i.notes}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )
      }
    </>
  );
}