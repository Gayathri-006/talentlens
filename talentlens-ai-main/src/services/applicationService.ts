import { api } from "@/lib/api";
import type { Application, ApplicationStatus } from "@/lib/types";

export const applicationService = {
  create: (jobId: string, form: FormData) => {
    form.append("jobId", jobId);
    return api.post<Application>("/applications", form, { isForm: true });
  },
  mine: () => api.get<Application[]>("/applications/my"),
  recentMine: () => api.get<Application[]>("/applications/my/recent"),
  byId: (id: string) => api.get<Application>(`/applications/${id}`),
  forJob: (jobId: string) => api.get<Application[]>(`/recruiter/jobs/${jobId}/applications`),
  updateStatus: (id: string, status: ApplicationStatus) =>
    api.patch<Application>(`/applications/${id}/status`, { status }),
};