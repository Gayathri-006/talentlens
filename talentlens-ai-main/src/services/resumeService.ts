import { api } from "@/lib/api";
import type { Resume } from "@/lib/types";

export const resumeService = {
  upload: (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return api.post<Resume>("/resumes/upload", fd, { isForm: true });
  },
  mine: () => api.get<Resume[]>("/resumes/my"),
};