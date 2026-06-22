import {
  LayoutDashboard, Briefcase, Users, Trophy, Workflow, Calendar, Mail, BarChart3, Settings,
  type LucideIcon,
} from "lucide-react";
import { DashboardLayout, type NavItem } from "./DashboardLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import type { ReactNode } from "react";

const nav: NavItem[] = [
  { label: "Dashboard", to: "/recruiter/dashboard", icon: LayoutDashboard as LucideIcon },
  { label: "Jobs", to: "/recruiter/jobs", icon: Briefcase as LucideIcon },
  { label: "Applicants", to: "/recruiter/applicants", icon: Users as LucideIcon },
  { label: "Top Candidates", to: "/recruiter/top-candidates", icon: Trophy as LucideIcon },
  { label: "Pipeline", to: "/recruiter/pipeline", icon: Workflow as LucideIcon },
  { label: "Interviews", to: "/recruiter/interviews", icon: Calendar as LucideIcon },
  { label: "Emails", to: "/recruiter/emails", icon: Mail as LucideIcon },
  { label: "Analytics", to: "/recruiter/analytics", icon: BarChart3 as LucideIcon },
  { label: "Settings", to: "/recruiter/settings", icon: Settings as LucideIcon },
];

export function RecruiterLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute role="recruiter">
      <DashboardLayout nav={nav}>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}