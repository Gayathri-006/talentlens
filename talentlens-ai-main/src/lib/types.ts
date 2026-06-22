export type UserRole = "candidate" | "recruiter";

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  jobType: string;
  experienceLevel: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryRange?: string;
  skills: string[];
  description: string;
  responsibilities?: string[];
  requirements?: string[];
  status?: "active" | "draft" | "closed";
  applicantsCount?: number;
  avgMatchScore?: number;
  createdAt?: string;
}

export type ApplicationStatus =
  | "applied"
  | "under_review"
  | "shortlisted"
  | "interview"
  | "selected"
  | "rejected";

export interface Application {
  id: string;
  jobId: string;
  jobTitle?: string;
  company?: string;
  candidateId?: string;
  candidateName?: string;
  candidateEmail?: string;
  resumeId?: string;
  resumeFilename?: string;
  status: ApplicationStatus;
  matchScore?: number;
  appliedAt: string;
  interviewDate?: string;
  resumeAnalysisStatus?: "pending" | "completed" | "failed";
  topSkills?: string[];
  missingSkillsCount?: number;
}

export interface Resume {
  id: string;
  filename: string;
  uploadedAt: string;
  url?: string;
  analyzed?: boolean;
}

export interface ResumeScores {
  overall: number;
  technical: number;
  projects: number;
  experience: number;
  communication: number;
}

export interface ResumeAnalysis {
  resumeId: string;
  summary: string;
  candidateName?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  skills: string[];
  education: Array<{ degree: string; school: string; year?: string }>;
  experience: Array<{ company: string; role: string; duration?: string; description?: string }>;
  projects: Array<{ name: string; description?: string; tech?: string[] }>;
  certifications?: string[];
  achievements?: string[];
  strengths: string[];
  weaknesses: string[];
  missingSkills: string[];
  suggestions: string[];
  recommendedTech?: string[];
  interviewReadinessScore?: number;
  scores: ResumeScores;
}

export interface CandidateScore {
  applicationId: string;
  overall: number;
  technical: number;
  experience: number;
  education: number;
  projects: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  missingSkills: string[];
  riskFactors?: string[];
  recommendation: string;
}

export interface RankedCandidate {
  rank: number;
  applicationId: string;
  candidateName: string;
  matchScore: number;
  technicalFit: number;
  experienceFit: number;
  missingSkills: string[];
  strengths: string[];
  recommendation: string;
}

export interface Interview {
  id: string;
  applicationId: string;
  candidateName: string;
  jobTitle: string;
  date: string;
  time: string;
  type: "technical" | "hr" | "managerial" | "final";
  meetingLink: string;
  interviewerName: string;
  notes?: string;
  status: "scheduled" | "completed" | "cancelled";
}

export interface EmailNotification {
  id: string;
  candidate: string;
  type: string;
  sentAt: string;
  status: "sent" | "failed" | "queued";
  opened?: boolean;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

export interface RecruiterStats {
  activeJobs: number;
  totalApplicants: number;
  shortlisted: number;
  interviewsScheduled: number;
  avgMatchScore: number;
}

export interface CandidateStats {
  applicationsSubmitted: number;
  shortlisted: number;
  interviewsScheduled: number;
  resumeStrengthScore: number;
}

export interface PipelineStage {
  status: ApplicationStatus;
  applications: Application[];
}

export interface CandidateProfile {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  avatarUrl?: string;
}

export interface ApiError {
  message: string;
  status?: number;
}