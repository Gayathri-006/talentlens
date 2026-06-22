import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/auth/callback")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === "string" ? search.token : undefined,
    error: typeof search.error === "string" ? search.error : undefined,
  }),
  component: AuthCallback,
});

function AuthCallback() {
  const { token, error } = useSearch({ from: "/auth/callback" });
  const { setSession } = useAuth();
  const navigate = useNavigate();
  const [errMsg, setErrMsg] = useState<string | null>(error ?? null);

  useEffect(() => {
    if (!token) {
      if (!error) setErrMsg("Missing authentication token.");
      return;
    }
    (async () => {
      try {
        const user = await setSession(token);
        void navigate({
          to: user.role === "recruiter" ? "/recruiter/dashboard" : "/candidate/dashboard",
          replace: true,
        });
      } catch (e) {
        setErrMsg(e instanceof Error ? e.message : "Authentication failed");
      }
    })();
  }, [token, error, setSession, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      {errMsg ? (
        <div className="max-w-md text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-destructive" />
          <h1 className="mt-4 text-xl font-semibold">Sign-in failed</h1>
          <p className="mt-2 text-sm text-muted-foreground">{errMsg}</p>
          <Button className="mt-6" onClick={() => navigate({ to: "/login" })}>Back to login</Button>
        </div>
      ) : (
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">Completing sign in…</p>
        </div>
      )}
    </div>
  );
}