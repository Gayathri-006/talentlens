import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { RecruiterLayout } from "@/components/layouts/RecruiterLayout";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { jobService } from "@/services/jobService";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/recruiter/jobs/create")({
  ssr: false,
  component: () => (
    <RecruiterLayout>
      <CreateJob />
    </RecruiterLayout>
  ),
});

function CreateJob() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "", company: "", location: "", jobType: "full-time", experienceLevel: "mid",
    salaryRange: "", skills: "", responsibilities: "", requirements: "", description: "",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await jobService.create({
        title: form.title,
        company: form.company,
        location: form.location,
        jobType: form.jobType,
        experienceLevel: form.experienceLevel,
        salaryRange: form.salaryRange,
        skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
        responsibilities: form.responsibilities.split("\n").map((s) => s.trim()).filter(Boolean),
        requirements: form.requirements.split("\n").map((s) => s.trim()).filter(Boolean),
        description: form.description,
      });
      toast.success("Job posted!");
      void navigate({ to: "/recruiter/jobs" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to post job");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold">Post a new job</h1>
      <p className="mt-1 text-sm text-muted-foreground">Provide details to start receiving AI-matched candidates.</p>
      <form onSubmit={submit} className="mt-6 space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Job details</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Field label="Job title" required value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
            <Field label="Company name" required value={form.company} onChange={(v) => setForm({ ...form, company: v })} />
            <Field label="Location" required value={form.location} onChange={(v) => setForm({ ...form, location: v })} />
            <Field label="Salary range" value={form.salaryRange} onChange={(v) => setForm({ ...form, salaryRange: v })} placeholder="e.g. $80k - $120k" />
            <Field label="Job type" value={form.jobType} onChange={(v) => setForm({ ...form, jobType: v })} />
            <Field label="Experience level" value={form.experienceLevel} onChange={(v) => setForm({ ...form, experienceLevel: v })} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Skills & description</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Required skills (comma-separated)</Label>
              <Input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="React, TypeScript, Node.js" />
            </div>
            <div className="space-y-2">
              <Label>Responsibilities (one per line)</Label>
              <Textarea rows={4} value={form.responsibilities} onChange={(e) => setForm({ ...form, responsibilities: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Requirements (one per line)</Label>
              <Textarea rows={4} value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Job description</Label>
              <Textarea rows={6} required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate({ to: "/recruiter/jobs" })}>Cancel</Button>
          <Button type="submit" disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Publish job
          </Button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, required, placeholder }: { label: string; value: string; onChange: (v: string) => void; required?: boolean; placeholder?: string }) {
  return (
    <div className="space-y-2">
      <Label>{label}{required && <span className="text-destructive"> *</span>}</Label>
      <Input required={required} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}