import { api } from "@/lib/api";
import type { Application, RankedCandidate, RecruiterStats } from "@/lib/types";

export const recruiterService = {
  stats: () => api.get<RecruiterStats>("/recruiter/stats"),
  recentApplicants: () => api.get<Application[]>("/recruiter/recent-applicants"),
  topCandidates: () => api.get<RankedCandidate[]>("/recruiter/top-candidates"),
  topCandidatesForJob: (jobId: string, limit = 50) =>
    api.get<{ jobId: string; rankedCandidates: RankedCandidate[] }>(
      `/recruiter/jobs/${jobId}/top-candidates?limit=${limit}`,
    ),
  pipeline: () => api.get<Record<string, Application[]>>("/recruiter/pipeline"),
};