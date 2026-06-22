import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { RecruiterLayout } from "@/components/layouts/RecruiterLayout";
import { PageHeader } from "@/components/layouts/DashboardLayout";
import { useApi } from "@/hooks/useApi";
import { recruiterService } from "@/services/recruiterService";
import { applicationService } from "@/services/applicationService";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/states";
import type { Application, ApplicationStatus } from "@/lib/types";
import { scoreColor, statusLabel } from "@/lib/format";
import { toast } from "sonner";
import { GripVertical } from "lucide-react";

export const Route = createFileRoute("/recruiter/pipeline")({
  ssr: false,
  component: () => (
    <RecruiterLayout>
      <Pipeline />
    </RecruiterLayout>
  ),
});

const STAGES: { key: ApplicationStatus; label: string; tint: string }[] = [
  { key: "applied", label: "Applied", tint: "from-blue-500/15 to-blue-500/0" },
  { key: "under_review", label: "Under Review", tint: "from-amber-500/15 to-amber-500/0" },
  { key: "shortlisted", label: "Shortlisted", tint: "from-violet-500/15 to-violet-500/0" },
  { key: "interview", label: "Interview", tint: "from-indigo-500/15 to-indigo-500/0" },
  { key: "selected", label: "Selected", tint: "from-emerald-500/15 to-emerald-500/0" },
  { key: "rejected", label: "Rejected", tint: "from-rose-500/15 to-rose-500/0" },
];

function Pipeline() {
  const { data, loading, error, refetch, setData } = useApi(() => recruiterService.pipeline(), []);
  const [dragId, setDragId] = useState<string | null>(null);

  const grouped = useMemo<Record<ApplicationStatus, Application[]>>(() => {
    const base: Record<ApplicationStatus, Application[]> = {
      applied: [], under_review: [], shortlisted: [], interview: [], selected: [], rejected: [],
    };
    if (!data) return base;
    for (const s of STAGES) base[s.key] = data[s.key] ?? [];
    return base;
  }, [data]);

  async function moveTo(appId: string, target: ApplicationStatus) {
    if (!data) return;
    const prev = data;
    const next: Record<string, Application[]> = {};
    let moved: Application | null = null;
    for (const k of Object.keys(prev)) {
      next[k] = (prev[k] ?? []).filter((a) => {
        if (a.id === appId) { moved = { ...a, status: target }; return false; }
        return true;
      });
    }
    if (!moved) return;
    next[target] = [moved, ...(next[target] ?? [])];
    setData(next);
    try {
      await applicationService.updateStatus(appId, target);
      toast.success(`Moved to ${statusLabel(target)}`);
    } catch (e) {
      setData(prev);
      toast.error(e instanceof Error ? e.message : "Failed to update");
    }
  }

  return (
    <>
      <PageHeader title="Pipeline" description="Drag candidates across stages to update their status." />
      {loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={refetch} /> : (
        <div className="grid auto-cols-[minmax(280px,1fr)] grid-flow-col gap-4 overflow-x-auto pb-4">
          {STAGES.map((s) => (
            <div
              key={s.key}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => dragId && moveTo(dragId, s.key)}
              className={`flex flex-col rounded-xl border border-border bg-gradient-to-b ${s.tint} bg-card`}
            >
              <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{s.label}</span>
                  <span className="rounded-full bg-background px-2 py-0.5 text-xs text-muted-foreground">
                    {grouped[s.key]?.length ?? 0}
                  </span>
                </div>
              </div>
              <div className="flex min-h-[200px] flex-col gap-2 p-3">
                {grouped[s.key]?.length === 0 && (
                  <p className="rounded-lg border border-dashed border-border/60 p-4 text-center text-xs text-muted-foreground">
                    Drop here
                  </p>
                )}
                {grouped[s.key]?.map((a) => (
                  <div
                    key={a.id}
                    draggable
                    onDragStart={() => setDragId(a.id)}
                    onDragEnd={() => setDragId(null)}
                    className="group cursor-grab rounded-lg border border-border bg-background p-3 shadow-sm transition hover:border-primary/40 hover:shadow active:cursor-grabbing"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{a.candidateName ?? "Candidate"}</p>
                        <p className="truncate text-xs text-muted-foreground">{a.jobTitle}</p>
                      </div>
                      <GripVertical className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground" />
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      {a.matchScore != null ? (
                        <span className={`text-xs font-semibold ${scoreColor(a.matchScore)}`}>{a.matchScore}% match</span>
                      ) : <span className="text-xs text-muted-foreground">No score</span>}
                      {a.topSkills && a.topSkills.length > 0 && (
                        <span className="truncate rounded-full bg-accent px-2 py-0.5 text-[10px] text-accent-foreground">
                          {a.topSkills[0]}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      {!loading && !error && data && Object.values(grouped).every((v) => v.length === 0) && (
        <EmptyState title="No applications yet" message="Once candidates apply, they'll appear here." />
      )}
    </>
  );
}