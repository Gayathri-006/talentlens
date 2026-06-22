import { api } from "@/lib/api";
import type { CandidateScore, RankedCandidate, ResumeAnalysis } from "@/lib/types";

export const aiService = {
  analyzeResume: (resumeId: string) =>
    api.post<ResumeAnalysis>(`/ai/analyze-resume/${resumeId}`),
  resumeAnalysis: (resumeId: string) =>
    api.get<ResumeAnalysis>(`/ai/resume-analysis/${resumeId}`),
  latestResumeAnalysis: () =>
    api.get<ResumeAnalysis>("/ai/resume-analysis/latest"),
  scoreCandidate: (applicationId: string) =>
    api.post<CandidateScore>(`/ai/score-candidate/${applicationId}`),
  candidateAnalysis: (applicationId: string) =>
    api.get<CandidateScore>(`/ai/candidate-analysis/${applicationId}`),
  interviewQuestions: (applicationId: string) =>
    api.get<{
      technical: string[];
      project: string[];
      behavioral: string[];
      skillGap: string[];
    }>(`/ai/interview-questions/${applicationId}`),
  rankCandidates: (jobId: string) =>
    api.post<{ jobId: string; rankedCandidates: RankedCandidate[] }>(
      `/ai/rank-candidates/${jobId}`,
    ),
};