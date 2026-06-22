import { api } from "@/lib/api";
import type { EmailNotification, EmailTemplate } from "@/lib/types";

export const emailService = {
  send: (payload: { to: string; templateId?: string; subject?: string; body?: string; variables?: Record<string, string> }) =>
    api.post<{ ok: true }>("/emails/send", payload),
  templates: () => api.get<EmailTemplate[]>("/emails/templates"),
  createTemplate: (payload: Omit<EmailTemplate, "id">) =>
    api.post<EmailTemplate>("/emails/templates", payload),
  history: () => api.get<EmailNotification[]>("/emails/history"),
};