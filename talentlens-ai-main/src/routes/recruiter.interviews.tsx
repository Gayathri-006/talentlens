import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { RecruiterLayout } from "@/components/layouts/RecruiterLayout";
import { PageHeader } from "@/components/layouts/DashboardLayout";
import { useApi } from "@/hooks/useApi";
import { interviewService } from "@/services/interviewService";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/states";
import { Calendar as CalIcon, Clock, Video, Plus, User } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/recruiter/interviews")({
  ssr: false,
  component: () => (
    <RecruiterLayout>
      <Interviews />
    </RecruiterLayout>
  ),
});

function Interviews() {
  const { data, loading, error, refetch } = useApi(() => interviewService.list(), []);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    applicationId: "", candidateName: "", jobTitle: "", date: "", time: "",
    type: "technical", meetingLink: "", interviewerName: "", notes: "",
  });
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await interviewService.create({ ...form, status: "scheduled" } as never);
      toast.success("Interview scheduled");
      setOpen(false);
      void refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to schedule");
    } finally {
      setSaving(false);
    }
  }

  const scheduled = data?.filter((i) => i.status === "scheduled") ?? [];
  const past = data?.filter((i) => i.status !== "scheduled") ?? [];

  return (
    <>
      <PageHeader
        title="Interviews"
        description="Schedule, track, and review every interview in one place."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" />Schedule interview</Button></DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Schedule interview</DialogTitle></DialogHeader>
              <form onSubmit={submit} className="grid gap-4">
                <div className="grid gap-2"><Label>Application ID</Label><Input value={form.applicationId} onChange={(e) => setForm({ ...form, applicationId: e.target.value })} required /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2"><Label>Candidate</Label><Input value={form.candidateName} onChange={(e) => setForm({ ...form, candidateName: e.target.value })} required /></div>
                  <div className="grid gap-2"><Label>Job title</Label><Input value={form.jobTitle} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} required /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2"><Label>Date</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required /></div>
                  <div className="grid gap-2"><Label>Time</Label><Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} required /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2"><Label>Type</Label>
                    <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical">Technical</SelectItem>
                        <SelectItem value="hr">HR</SelectItem>
                        <SelectItem value="managerial">Managerial</SelectItem>
                        <SelectItem value="final">Final round</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2"><Label>Interviewer</Label><Input value={form.interviewerName} onChange={(e) => setForm({ ...form, interviewerName: e.target.value })} required /></div>
                </div>
                <div className="grid gap-2"><Label>Meeting link</Label><Input type="url" placeholder="https://meet..." value={form.meetingLink} onChange={(e) => setForm({ ...form, meetingLink: e.target.value })} /></div>
                <div className="grid gap-2"><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} /></div>
                <Button type="submit" disabled={saving}>{saving ? "Scheduling..." : "Schedule & send invite"}</Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={refetch} /> :
        !data || data.length === 0 ? (
          <EmptyState icon={<CalIcon className="h-6 w-6" />} title="No interviews yet" message="Schedule your first interview to get started." />
        ) : (
          <>
            <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Upcoming ({scheduled.length})</h2>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {scheduled.map((i) => <InterviewCard key={i.id} interview={i} />)}
            </div>
            {past.length > 0 && (
              <>
                <h2 className="mt-8 mb-3 text-sm font-semibold text-muted-foreground">Past ({past.length})</h2>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {past.map((i) => <InterviewCard key={i.id} interview={i} muted />)}
                </div>
              </>
            )}
          </>
        )
      }
    </>
  );
}

function InterviewCard({ interview, muted }: { interview: import("@/lib/types").Interview; muted?: boolean }) {
  return (
    <Card className={`group transition hover:border-primary/40 hover:shadow ${muted ? "opacity-70" : ""}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-accent-foreground">{interview.type}</span>
            <h3 className="mt-2 font-semibold">{interview.candidateName}</h3>
            <p className="text-xs text-muted-foreground">{interview.jobTitle}</p>
          </div>
          <span className={`text-[10px] font-medium uppercase ${interview.status === "scheduled" ? "text-emerald-600" : "text-muted-foreground"}`}>{interview.status}</span>
        </div>
        <div className="mt-4 space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2"><CalIcon className="h-4 w-4" />{formatDate(interview.date)}</div>
          <div className="flex items-center gap-2"><Clock className="h-4 w-4" />{interview.time}</div>
          <div className="flex items-center gap-2"><User className="h-4 w-4" />{interview.interviewerName}</div>
        </div>
        {interview.meetingLink && (
          <a href={interview.meetingLink} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
            <Video className="h-4 w-4" /> Join meeting
          </a>
        )}
      </CardContent>
    </Card>
  );
}