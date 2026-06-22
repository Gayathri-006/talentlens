import { api } from "@/lib/api";
import type { Interview } from "@/lib/types";

export const interviewService = {
  list: () => api.get<Interview[]>("/interviews"),
  byId: (id: string) => api.get<Interview>(`/interviews/${id}`),
  create: (payload: Partial<Interview>) => api.post<Interview>("/interviews", payload),
  update: (id: string, payload: Partial<Interview>) =>
    api.patch<Interview>(`/interviews/${id}`, payload),
  remove: (id: string) => api.del<{ ok: true }>(`/interviews/${id}`),
};