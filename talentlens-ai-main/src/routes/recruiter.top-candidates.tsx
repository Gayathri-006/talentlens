import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { RecruiterLayout } from "@/components/layouts/RecruiterLayout";
import { PageHeader } from "@/components/layouts/DashboardLayout";
import { useApi } from "@/hooks/useApi";
import { jobService } from "@/services/jobService";
import { recruiterService } from "@/services/recruiterService";
import { aiService } from "@/services/aiService";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/states";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Crown, Sparkles, Trophy, Medal } from "lucide-react";
import { scoreColor } from "@/lib/format";
import { toast } from "sonner";
import type { RankedCandidate } from "@/lib/types";

export const Route = createFileRoute("/recruiter/top-candidates")({
  ssr: false,
  component: () => (
    <RecruiterLayout>
      <TopCandidates />
    </RecruiterLayout>
  ),
});

function TopCandidates() {
  const jobs = useApi(() => jobService.recruiterList(), []);
  const [jobId, setJobId] = useState<string>("");
  const [running, setRunning] = useState(false);
  const [ranked, setRanked] = useState<RankedCandidate[] | null>(null);

  const list = useApi(
    () => (jobId ? recruiterService.topCandidatesForJob(jobId, 50).then((r) => r.rankedCandidates) : Promise.resolve([] as RankedCandidate[])),
    [jobId],
  );

  const data = ranked ?? list.data;

  async function runRanking() {
    if (!jobId) { toast.error("Select a job first"); return; }
    setRunning(true);
    try {
      const res = await aiService.rankCandidates(jobId);
      setRanked(res.rankedCandidates);
      toast.success("AI ranking complete");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to rank");
    } finally {
      setRunning(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Top 50 candidates"
        description="AI-ranked best matches per job, with explainable scoring."
        actions={
          <div className="flex gap-2">
            <Select value={jobId} onValueChange={setJobId}>
              <SelectTrigger className="w-[260px]"><SelectValue placeholder={jobs.loading ? "Loading jobs..." : "Select a job"} /></SelectTrigger>
              <SelectContent>
                {jobs.data?.map((j) => <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={runRanking} disabled={!jobId || running} className="gap-2">
              <Sparkles className="h-4 w-4" />
              {running ? "Ranking..." : "Run AI Ranking"}
            </Button>
          </div>
        }
      />

      {!jobId ? (
        <EmptyState icon={<Trophy className="h-6 w-6" />} title="Select a job" message="Pick a role to see its top 50 candidates ranked by the AI." />
      ) : list.loading ? <LoadingState label="Loading ranked candidates..." /> :
        list.error ? <ErrorState message={list.error} onRetry={list.refetch} /> :
        !data || data.length === 0 ? (
          <EmptyState icon={<Sparkles className="h-6 w-6" />} title="No ranking yet" message='Click "Run AI Ranking" to generate the top 50 for this role.' />
        ) : (
          <>
            {/* Podium */}
            <div className="grid gap-4 md:grid-cols-3">
              {data.slice(0, 3).map((c, i) => {
                const podium = [
                  { icon: Crown, ring: "ring-amber-300", bg: "from-amber-100 to-amber-50", text: "text-amber-700" },
                  { icon: Medal, ring: "ring-slate-300", bg: "from-slate-100 to-slate-50", text: "text-slate-700" },
                  { icon: Trophy, ring: "ring-orange-300", bg: "from-orange-100 to-orange-50", text: "text-orange-700" },
                ][i];
                const Icon = podium.icon;
                return (
                  <Card key={c.applicationId} className={`relative overflow-hidden ring-2 ${podium.ring}`}>
                    <div className={`absolute inset-0 -z-10 bg-gradient-to-br ${podium.bg}`} />
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-white shadow ${podium.text}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="text-3xl font-bold tracking-tight">#{c.rank}</span>
                      </div>
                      <h3 className="mt-4 text-lg font-semibold">{c.candidateName}</h3>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{c.recommendation}</p>
                      <div className="mt-4 flex items-end justify-between">
                        <div className="text-xs text-muted-foreground">Match score</div>
                        <div className={`text-2xl font-bold ${scoreColor(c.matchScore)}`}>{c.matchScore}%</div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* List */}
            <div className="mt-6 overflow-hidden rounded-xl border border-border bg-card">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Rank</th>
                    <th className="px-4 py-3">Candidate</th>
                    <th className="px-4 py-3">Match</th>
                    <th className="px-4 py-3 hidden md:table-cell">Technical</th>
                    <th className="px-4 py-3 hidden md:table-cell">Experience</th>
                    <th className="px-4 py-3 hidden lg:table-cell">Missing skills</th>
                    <th className="px-4 py-3">Verdict</th>
                  </tr>
                </thead>
                <tbody>
                  {data.slice(3).map((c) => (
                    <tr key={c.applicationId} className="border-t border-border hover:bg-accent/40">
                      <td className="px-4 py-3 font-semibold text-muted-foreground">#{c.rank}</td>
                      <td className="px-4 py-3 font-medium">{c.candidateName}</td>
                      <td className={`px-4 py-3 font-semibold ${scoreColor(c.matchScore)}`}>{c.matchScore}%</td>
                      <td className="px-4 py-3 hidden md:table-cell">{c.technicalFit}%</td>
                      <td className="px-4 py-3 hidden md:table-cell">{c.experienceFit}%</td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {c.missingSkills.slice(0, 3).map((s) => (
                            <span key={s} className="rounded-full bg-rose-50 px-2 py-0.5 text-xs text-rose-700">{s}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 max-w-xs truncate text-muted-foreground">{c.recommendation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )
      }
    </>
  );
}