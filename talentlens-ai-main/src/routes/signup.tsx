import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/auth/AuthShell";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export const Route = createFileRoute("/signup")({
  ssr: false,
  head: () => ({ meta: [{ title: "Sign up — TalentLens" }] }),
  component: SignupPage,
});

function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", password: "", role: "candidate" as "candidate" | "recruiter" });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const user = await signup(form);
      toast.success("Account created!");
      void navigate({ to: user.role === "recruiter" ? "/recruiter/dashboard" : "/candidate/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start hiring smarter today"
      footer={<>Already have an account? <Link to="/login" className="font-medium text-primary hover:underline">Log in</Link></>}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>I am a</Label>
          <RadioGroup
            value={form.role}
            onValueChange={(v) => setForm({ ...form, role: v as "candidate" | "recruiter" })}
            className="grid grid-cols-2 gap-3"
          >
            {(["candidate", "recruiter"] as const).map((r) => (
              <label key={r} className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition ${form.role === r ? "border-primary bg-accent/50" : "border-border hover:border-primary/40"}`}>
                <RadioGroupItem value={r} />
                <span className="text-sm font-medium capitalize">{r}</span>
              </label>
            ))}
          </RadioGroup>
        </div>
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create account
        </Button>
        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
          <div className="relative flex justify-center text-xs"><span className="bg-background px-2 text-muted-foreground">OR</span></div>
        </div>
        <GoogleButton label="Sign up with Google" />
      </form>
    </AuthShell>
  );
}