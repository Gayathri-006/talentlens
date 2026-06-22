import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { RecruiterLayout } from "@/components/layouts/RecruiterLayout";
import { PageHeader } from "@/components/layouts/DashboardLayout";
import { useApi } from "@/hooks/useApi";
import { emailService } from "@/services/emailService";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/states";
import { Mail, CheckCircle2, XCircle, Clock, Send, FileText } from "lucide-react";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/recruiter/emails")({
  ssr: false,
  component: () => (
    <RecruiterLayout>
      <Emails />
    </RecruiterLayout>
  ),
});

function Emails() {
  const history = useApi(() => emailService.history(), []);
  const templates = useApi(() => emailService.templates(), []);
  const [form, setForm] = useState({ to: "", subject: "", body: "" });
  const [sending, setSending] = useState(false);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    try {
      await emailService.send(form);
      toast.success("Email sent");
      setForm({ to: "", subject: "", body: "" });
      void history.refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send");
    } finally {
      setSending(false);
    }
  }

  const stats = {
    sent: history.data?.filter((h) => h.status === "sent").length ?? 0,
    failed: history.data?.filter((h) => h.status === "failed").length ?? 0,
    queued: history.data?.filter((h) => h.status === "queued").length ?? 0,
    opened: history.data?.filter((h) => h.opened).length ?? 0,
  };

  return (
    <>
      <PageHeader title="Email notifications" description="Automated, branded emails for every candidate touchpoint." />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MiniStat label="Delivered" value={stats.sent} icon={CheckCircle2} tint="emerald" />
        <MiniStat label="Opened" value={stats.opened} icon={Mail} tint="indigo" />
        <MiniStat label="Queued" value={stats.queued} icon={Clock} tint="amber" />
        <MiniStat label="Failed" value={stats.failed} icon={XCircle} tint="rose" />
      </div>

      <Tabs defaultValue="compose" className="mt-8">
        <TabsList>
          <TabsTrigger value="compose">Compose</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="compose" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <form onSubmit={send} className="grid gap-4">
                <div className="grid gap-2"><Label>To</Label><Input type="email" placeholder="candidate@example.com" value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} required /></div>
                <div className="grid gap-2"><Label>Subject</Label><Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required /></div>
                <div className="grid gap-2"><Label>Message</Label><Textarea rows={8} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} required /></div>
                <div className="flex justify-end"><Button type="submit" disabled={sending} className="gap-2"><Send className="h-4 w-4" />{sending ? "Sending..." : "Send email"}</Button></div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          {history.loading ? <LoadingState /> : history.error ? <ErrorState message={history.error} onRetry={history.refetch} /> :
            !history.data?.length ? <EmptyState icon={<Mail className="h-6 w-6" />} title="No emails sent yet" /> : (
              <div className="overflow-hidden rounded-xl border border-border bg-card">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <tr><th className="px-4 py-3">Candidate</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Sent</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Opened</th></tr>
                  </thead>
                  <tbody>
                    {history.data.map((h) => (
                      <tr key={h.id} className="border-t border-border hover:bg-accent/40">
                        <td className="px-4 py-3 font-medium">{h.candidate}</td>
                        <td className="px-4 py-3 text-muted-foreground">{h.type}</td>
                        <td className="px-4 py-3 text-muted-foreground">{formatDate(h.sentAt)}</td>
                        <td className="px-4 py-3"><StatusBadge status={h.status} /></td>
                        <td className="px-4 py-3">{h.opened ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <span className="text-muted-foreground">—</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          }
        </TabsContent>

        <TabsContent value="templates" className="mt-4">
          {templates.loading ? <LoadingState /> : templates.error ? <ErrorState message={templates.error} onRetry={templates.refetch} /> :
            !templates.data?.length ? <EmptyState icon={<FileText className="h-6 w-6" />} title="No templates yet" message="Default templates will appear here." /> : (
              <div className="grid gap-3 md:grid-cols-2">
                {templates.data.map((t) => (
                  <Card key={t.id} className="transition hover:border-primary/40">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-primary" /><h3 className="font-semibold">{t.name}</h3></div>
                      <p className="mt-2 text-sm font-medium">{t.subject}</p>
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{t.body}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )
          }
        </TabsContent>
      </Tabs>
    </>
  );
}

function MiniStat({ label, value, icon: Icon, tint }: { label: string; value: number; icon: React.ComponentType<{ className?: string }>; tint: "emerald" | "indigo" | "amber" | "rose" }) {
  const tints = {
    emerald: "bg-emerald-50 text-emerald-700",
    indigo: "bg-indigo-50 text-indigo-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700",
  };
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold tracking-tight">{value}</p>
      </div>
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${tints[tint]}`}><Icon className="h-5 w-5" /></div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    sent: "bg-emerald-50 text-emerald-700",
    failed: "bg-rose-50 text-rose-700",
    queued: "bg-amber-50 text-amber-700",
  };
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${map[status] ?? "bg-muted text-muted-foreground"}`}>{status}</span>;
}