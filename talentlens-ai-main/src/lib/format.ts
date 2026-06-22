export function statusColor(status: string) {
  switch (status) {
    case "applied": return "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300";
    case "under_review": return "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300";
    case "shortlisted": return "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300";
    case "interview": return "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300";
    case "selected": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300";
    case "rejected": return "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300";
    default: return "bg-muted text-muted-foreground";
  }
}

export function statusLabel(status: string) {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatDate(d?: string) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return d;
  }
}

export function scoreColor(score?: number) {
  if (score == null) return "text-muted-foreground";
  if (score >= 80) return "text-emerald-600";
  if (score >= 60) return "text-amber-600";
  return "text-rose-600";
}