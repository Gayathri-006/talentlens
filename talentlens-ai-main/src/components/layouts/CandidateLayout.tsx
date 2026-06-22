import { LayoutDashboard, Briefcase, FileText, Sparkles, Calendar, User, Settings, type LucideIcon } from "lucide-react";
import { DashboardLayout, type NavItem } from "./DashboardLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import type { ReactNode } from "react";

const nav: NavItem[] = [
  { label: "Dashboard", to: "/candidate/dashboard", icon: LayoutDashboard as LucideIcon },
  { label: "Jobs", to: "/candidate/jobs", icon: Briefcase as LucideIcon },
  { label: "Applications", to: "/candidate/applications", icon: FileText as LucideIcon },
  { label: "Resume Analysis", to: "/candidate/resume-analysis", icon: Sparkles as LucideIcon },
  { label: "Interviews", to: "/candidate/interviews", icon: Calendar as LucideIcon },
  { label: "Profile", to: "/candidate/profile", icon: User as LucideIcon },
  { label: "Settings", to: "/candidate/settings", icon: Settings as LucideIcon },
];

export function CandidateLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute role="candidate">
      <DashboardLayout nav={nav}>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}