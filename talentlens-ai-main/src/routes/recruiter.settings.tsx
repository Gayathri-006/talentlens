import { createFileRoute } from "@tanstack/react-router";
import { RecruiterLayout } from "@/components/layouts/RecruiterLayout";
import { PageHeader } from "@/components/layouts/DashboardLayout";
import { SettingsPage } from "@/components/common/SettingsPage";

export const Route = createFileRoute("/recruiter/settings")({
  ssr: false,
  component: () => (
    <RecruiterLayout>
      <PageHeader title="Settings" description="Manage your account, team, and notifications." />
      <SettingsPage />
    </RecruiterLayout>
  ),
});