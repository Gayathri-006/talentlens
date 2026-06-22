import { createFileRoute } from "@tanstack/react-router";
import { CandidateLayout } from "@/components/layouts/CandidateLayout";
import { PageHeader } from "@/components/layouts/DashboardLayout";
import { SettingsPage } from "@/components/common/SettingsPage";

export const Route = createFileRoute("/candidate/settings")({
  ssr: false,
  component: () => (
    <CandidateLayout>
      <PageHeader title="Settings" description="Account, notifications, and privacy." />
      <SettingsPage />
    </CandidateLayout>
  ),
});