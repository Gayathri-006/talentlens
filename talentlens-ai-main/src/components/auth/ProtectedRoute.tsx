import { useEffect, type ReactNode } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/context/AuthContext";
import type { UserRole } from "@/lib/types";
import { Loader2 } from "lucide-react";

interface Props {
  children: ReactNode;
  role?: UserRole;
}

export function ProtectedRoute({ children, role }: Props) {
  const { user, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      void navigate({ to: "/login", search: { redirect: pathname } as never });
      return;
    }
    if (role && user && user.role !== role) {
      void navigate({ to: "/unauthorized" });
    }
  }, [loading, isAuthenticated, role, user, navigate, pathname]);

  if (loading || !isAuthenticated || (role && user && user.role !== role)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}