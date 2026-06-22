import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CandidateLayout } from "@/components/layouts/CandidateLayout";
import { PageHeader } from "@/components/layouts/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useApi } from "@/hooks/useApi";
import { profileService } from "@/services/profileService";
import { LoadingState, ErrorState } from "@/components/common/states";
import { toast } from "sonner";

export const Route = createFileRoute("/candidate/profile")({
  ssr: false,
  component: () => (
    <CandidateLayout>
      <Profile />
    </CandidateLayout>
  ),
});

function Profile() {
  const { data, loading, error, refetch } = useApi(() => profileService.getCandidate(), []);
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", linkedin: "", github: "", portfolio: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) setForm({
      fullName: data.fullName ?? "", email: data.email ?? "", phone: data.phone ?? "",
      linkedin: data.linkedin ?? "", github: data.github ?? "", portfolio: data.portfolio ?? "",
    });
  }, [data]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await profileService.updateCandidate(form);
      toast.success("Profile updated");
      void refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader title="Your profile" description="How recruiters see you across TalentLens." />
      {loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={refetch} /> : (
        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          <Card>
            <CardContent className="p-6 text-center">
              <Avatar className="mx-auto h-24 w-24">
                <AvatarFallback className="bg-gradient-to-br from-primary to-chart-2 text-2xl text-primary-foreground">
                  {form.fullName.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <h3 className="mt-4 font-semibold">{form.fullName || "Your name"}</h3>
              <p className="text-sm text-muted-foreground">{form.email}</p>
              <Button variant="outline" className="mt-4 w-full" disabled>Change avatar</Button>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <form onSubmit={save} className="grid gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2"><Label>Full name</Label><Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></div>
                  <div className="grid gap-2"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                </div>
                <div className="grid gap-2"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                <div className="grid gap-2"><Label>LinkedIn</Label><Input type="url" value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} /></div>
                <div className="grid gap-2"><Label>GitHub</Label><Input type="url" value={form.github} onChange={(e) => setForm({ ...form, github: e.target.value })} /></div>
                <div className="grid gap-2"><Label>Portfolio</Label><Input type="url" value={form.portfolio} onChange={(e) => setForm({ ...form, portfolio: e.target.value })} /></div>
                <div><Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save profile"}</Button></div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}