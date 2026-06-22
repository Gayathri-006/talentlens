import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { CandidateLayout } from "@/components/layouts/CandidateLayout";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { applicationService } from "@/services/applicationService";
import { toast } from "sonner";
import { Loader2, Upload, FileText, X } from "lucide-react";

export const Route = createFileRoute("/candidate/jobs/$id/apply")({
  ssr: false,
  component: () => (
    <CandidateLayout>
      <ApplyPage />
    </CandidateLayout>
  ),
});

function ApplyPage() {
  const { id } = useParams({ from: "/candidate/jobs/$id/apply" });
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", linkedin: "", github: "", portfolio: "", coverLetter: "" });
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return toast.error("Please upload your resume.");
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append("resume", file);
      await applicationService.create(id, fd);
      toast.success("Application submitted!");
      void navigate({ to: "/candidate/applications" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold">Apply for this job</h1>
      <p className="mt-1 text-sm text-muted-foreground">Fill out the form below. Our AI will analyze your resume and match it to the job.</p>
      <form onSubmit={submit} className="mt-6 space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Personal information</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Field label="Full name" required value={form.fullName} onChange={(v) => setForm({ ...form, fullName: v })} />
            <Field label="Email" type="email" required value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
            <Field label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
            <Field label="LinkedIn URL" value={form.linkedin} onChange={(v) => setForm({ ...form, linkedin: v })} />
            <Field label="GitHub URL" value={form.github} onChange={(v) => setForm({ ...form, github: v })} />
            <Field label="Portfolio URL" value={form.portfolio} onChange={(v) => setForm({ ...form, portfolio: v })} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Resume</CardTitle></CardHeader>
          <CardContent>
            {file ? (
              <div className="flex items-center justify-between rounded-lg border border-border bg-accent/30 p-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <button type="button" onClick={() => setFile(null)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/30 py-10 text-center transition hover:border-primary/40">
                <Upload className="h-6 w-6 text-muted-foreground" />
                <p className="text-sm font-medium">Click to upload resume</p>
                <p className="text-xs text-muted-foreground">PDF, DOC, or DOCX (max 10MB)</p>
                <input type="file" accept=".pdf,.doc,.docx,application/pdf" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
              </label>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Cover letter</CardTitle></CardHeader>
          <CardContent>
            <Textarea rows={6} placeholder="Tell us why you're a great fit..." value={form.coverLetter} onChange={(e) => setForm({ ...form, coverLetter: e.target.value })} />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate({ to: "/candidate/jobs/$id", params: { id } })}>Cancel</Button>
          <Button type="submit" disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Submit application
          </Button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <div className="space-y-2">
      <Label>{label}{required && <span className="text-destructive"> *</span>}</Label>
      <Input type={type} required={required} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}