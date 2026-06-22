import { api } from "@/lib/api";
import type { CandidateProfile, User } from "@/lib/types";

export const profileService = {
  getCandidate: () => api.get<CandidateProfile>("/profile/candidate"),
  updateCandidate: (payload: Partial<CandidateProfile>) =>
    api.put<CandidateProfile>("/profile/candidate", payload),
  getRecruiter: () => api.get<User>("/profile/recruiter"),
  updateRecruiter: (payload: Partial<User>) =>
    api.put<User>("/profile/recruiter", payload),
  changePassword: (payload: { currentPassword: string; newPassword: string }) =>
    api.post<{ ok: true }>("/profile/change-password", payload),
};