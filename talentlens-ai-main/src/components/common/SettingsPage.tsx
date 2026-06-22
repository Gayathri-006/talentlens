import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { profileService } from "@/services/profileService";
import { toast } from "sonner";

export function SettingsPage() {
  const { user, refresh } = useAuth();
  const [name, setName] = useState(user?.fullName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [saving, setSaving] = useState(false);
  const [notif, setNotif] = useState({ email: true, product: true, weekly: false });
  const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });

  async function saveAccount(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (user?.role === "recruiter") {
        await profileService.updateRecruiter({ fullName: name, email });
      } else {
        await profileService.updateCandidate({ fullName: name, email });
      }
      await refresh();
      toast.success("Account updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setSaving(false);
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pwd.next !== pwd.confirm) { toast.error("Passwords don't match"); return; }
    try {
      await profileService.changePassword({ currentPassword: pwd.current, newPassword: pwd.next });
      toast.success("Password changed");
      setPwd({ current: "", next: "", confirm: "" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to change");
    }
  }

  return (
    <Tabs defaultValue="account">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>

      <TabsContent value="account" className="mt-4">
        <Card><CardContent className="p-6">
          <form onSubmit={saveAccount} className="grid max-w-xl gap-4">
            <div className="grid gap-2"><Label>Full name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div className="grid gap-2"><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <div><Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save changes"}</Button></div>
          </form>
        </CardContent></Card>
      </TabsContent>

      <TabsContent value="security" className="mt-4">
        <Card><CardContent className="p-6">
          <form onSubmit={changePassword} className="grid max-w-xl gap-4">
            <div className="grid gap-2"><Label>Current password</Label><Input type="password" value={pwd.current} onChange={(e) => setPwd({ ...pwd, current: e.target.value })} /></div>
            <div className="grid gap-2"><Label>New password</Label><Input type="password" value={pwd.next} onChange={(e) => setPwd({ ...pwd, next: e.target.value })} /></div>
            <div className="grid gap-2"><Label>Confirm password</Label><Input type="password" value={pwd.confirm} onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })} /></div>
            <div><Button type="submit">Update password</Button></div>
          </form>
        </CardContent></Card>
      </TabsContent>

      <TabsContent value="notifications" className="mt-4">
        <Card><CardContent className="p-6">
          <div className="grid max-w-xl gap-4">
            <ToggleRow label="Email notifications" desc="Receive transactional emails for important events." value={notif.email} onChange={(v) => setNotif({ ...notif, email: v })} />
            <ToggleRow label="Product updates" desc="New features and improvements." value={notif.product} onChange={(v) => setNotif({ ...notif, product: v })} />
            <ToggleRow label="Weekly digest" desc="A summary of activity every Monday." value={notif.weekly} onChange={(v) => setNotif({ ...notif, weekly: v })} />
          </div>
        </CardContent></Card>
      </TabsContent>
    </Tabs>
  );
}

function ToggleRow({ label, desc, value, onChange }: { label: string; desc: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border p-4">
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </div>
      <Switch checked={value} onCheckedChange={onChange} />
    </div>
  );
}