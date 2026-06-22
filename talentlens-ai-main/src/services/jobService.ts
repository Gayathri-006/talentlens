import { api } from "@/lib/api";
import type { Job } from "@/lib/types";

export interface JobFilters {
  search?: string;
  location?: string;
  jobType?: string;
  experienceLevel?: string;
  skills?: string[];
  minSalary?: number;
}

function qs(filters: JobFilters = {}) {
  const p = new URLSearchParams();
  if (filters.search) p.set("search", filters.search);
  if (filters.location) p.set("location", filters.location);
  if (filters.jobType) p.set("jobType", filters.jobType);
  if (filters.experienceLevel) p.set("experienceLevel", filters.experienceLevel);
  if (filters.minSalary) p.set("minSalary", String(filters.minSalary));
  if (filters.skills?.length) p.set("skills", filters.skills.join(","));
  const s = p.toString();
  return s ? `?${s}` : "";
}

export const jobService = {
  list: (filters?: JobFilters) => api.get<Job[]>(`/jobs${qs(filters)}`),
  recommended: () => api.get<Job[]>("/jobs/recommended"),
  byId: (id: string) => api.get<Job>(`/jobs/${id}`),
  recruiterList: () => api.get<Job[]>("/recruiter/jobs"),
  create: (payload: Partial<Job>) => api.post<Job>("/jobs", payload),
  update: (id: string, payload: Partial<Job>) => api.put<Job>(`/jobs/${id}`, payload),
  remove: (id: string) => api.del<{ ok: true }>(`/jobs/${id}`),
};