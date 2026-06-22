import { api } from "@/lib/api";

export interface AnalyticsOverview {
  totalApplications: number;
  avgMatchScore: number;
  shortlistRate: number;
  interviewConversionRate: number;
  selectionRate: number;
  avgTimeToShortlistDays: number;
}

export interface FunnelPoint {
  stage: string;
  count: number;
}

export interface TimeSeriesPoint {
  date: string;
  count: number;
}

export const analyticsService = {
  overview: () => api.get<AnalyticsOverview>("/analytics/overview"),
  hiringFunnel: () => api.get<FunnelPoint[]>("/analytics/hiring-funnel"),
  applicationsOverTime: () => api.get<TimeSeriesPoint[]>("/analytics/applications-over-time"),
  job: (jobId: string) => api.get<unknown>(`/analytics/jobs/${jobId}`),
  pipeline: () => api.get<FunnelPoint[]>("/analytics/pipeline"),
  aiScores: () => api.get<{ bucket: string; count: number }[]>("/analytics/ai-scores"),
};