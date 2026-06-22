import { createFileRoute } from "@tanstack/react-router";
import { CandidateLayout } from "@/components/layouts/CandidateLayout";
import { PageHeader } from "@/components/layouts/DashboardLayout";
import { useState } from "react";
import { useApi } from "@/hooks/useApi";
import { resumeService } from "@/services/resumeService";
import { aiService } from "@/services/aiService";
import type { Resume, ResumeAnalysis } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/states";
import { toast } from "sonner";
import { Upload, FileText, Sparkles, Loader2, X, CheckCircle2, AlertTriangle, Lightbulb } from "lucide-react";
import { formatDate, scoreColor } from "@/lib/format";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";

export const Route = createFileRoute("/candidate/resume-analysis")({
  ssr: false,
  component: () => (
    <CandidateLayout>
      <ResumeAnalysisPage />
    </CandidateLayout>
  ),
});

function ResumeAnalysisPage() {
  const { data: resumes, loading, error, refetch, setData } = useApi<Resume[]>(() => resumeService.mine(), []);
  const [uploading, setUploading] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  async function upload(file: File) {
    setUploading(true);
    try {
      const r = await resumeService.upload(file);
      setData([r, ...(resumes ?? [])]);
      toast.success("Resume uploaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function analyze(id: string) {
    setActiveId(id);
    setAnalyzing(true);
    setAnalysisError(null);
    setAnalysis(null);
    try {
      const r = await aiService.analyzeResume(id);
      setAnalysis(r);
    } catch (e) {
      setAnalysisError(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <>
      <PageHeader title="Resume Analysis" description="Upload your resume and let AI break down your strengths, weaknesses, and gaps." />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="text-base">Upload resume</CardTitle></CardHeader>
          <CardContent>
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/30 py-8 text-center transition hover:border-primary/40">
              {uploading ? <Loader2 className="h-6 w-6 animate-spin text-primary" /> : <Upload className="h-6 w-6 text-muted-foreground" />}
              <p className="text-sm font-medium">{uploading ? "Uploading..." : "Click to upload"}</p>
              <p className="text-xs text-muted-foreground">PDF, DOC, DOCX</p>
              <input type="file" accept=".pdf,.doc,.docx" className="hidden" disabled={uploading}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) void upload(f); }} />
            </label>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">My resumes</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {loading ? <LoadingState /> :
              error ? <ErrorState message={error} onRetry={refetch} /> :
              !resumes?.length ? <EmptyState icon={<FileText className="h-6 w-6" />} title="No resumes yet" message="Upload your first resume to get started." /> :
              resumes.map((r) => (
                <div key={r.id} className={`flex items-center justify-between rounded-lg border p-3 transition ${activeId === r.id ? "border-primary bg-accent/30" : "border-border"}`}>
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className="h-5 w-5 text-primary shrink-0" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{r.filename}</p>
                      <p className="text-xs text-muted-foreground">Uploaded {formatDate(r.uploadedAt)}</p>
                    </div>
                  </div>
                  <Button size="sm" onClick={() => analyze(r.id)} disabled={analyzing && activeId === r.id}>
                    {analyzing && activeId === r.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    <span className="ml-2">Analyze</span>
                  </Button>
                </div>
              ))
            }
          </CardContent>
        </Card>
      </div>

      {analyzing && (
        <Card className="mt-6">
          <CardContent className="flex flex-col items-center justify-center gap-3 py-12">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
            <p className="font-medium">Analyzing your resume...</p>
            <p className="text-sm text-muted-foreground">Our AI is reading, scoring, and benchmarking your profile.</p>
          </CardContent>
        </Card>
      )}

      {analysisError && (
        <div className="mt-6"><ErrorState message={analysisError} onRetry={() => activeId && analyze(activeId)} /></div>
      )}

      {analysis && !analyzing && <AnalysisResult analysis={analysis} />}
    </>
  );
}

function AnalysisResult({ analysis }: { analysis: ResumeAnalysis }) {
  const scoreData = Object.entries(analysis.scores ?? {}).map(([k, v]) => ({ axis: k, value: v as number }));

  return (
    <div className="mt-8 space-y-6">
      <Card>
        <CardHeader><CardTitle>Resume overview</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-muted-foreground">{analysis.summary}</p>
          {(analysis.candidateName || analysis.email) && (
            <div className="mt-4 grid gap-3 text-sm md:grid-cols-3">
              {analysis.candidateName && <Info label="Name" value={analysis.candidateName} />}
              {analysis.email && <Info label="Email" value={analysis.email} />}
              {analysis.phone && <Info label="Phone" value={analysis.phone} />}
              {analysis.linkedin && <Info label="LinkedIn" value={analysis.linkedin} />}
              {analysis.github && <Info label="GitHub" value={analysis.github} />}
              {analysis.portfolio && <Info label="Portfolio" value={analysis.portfolio} />}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>AI score breakdown</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(analysis.scores ?? {}).map(([k, v]) => (
              <div key={k}>
                <div className="flex justify-between text-sm"><span className="capitalize">{k}</span><span className={`font-semibold ${scoreColor(v as number)}`}>{v}%</span></div>
                <Progress value={v as number} className="mt-1.5 h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Skills radar</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={scoreData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="axis" tick={{ fontSize: 11 }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar dataKey="value" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <InsightCard icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />} title="Strengths" items={analysis.strengths} />
        <InsightCard icon={<AlertTriangle className="h-5 w-5 text-amber-600" />} title="Weaknesses" items={analysis.weaknesses} />
        <InsightCard icon={<Lightbulb className="h-5 w-5 text-violet-600" />} title="Suggestions" items={analysis.suggestions} />
      </div>

      <Card>
        <CardHeader><CardTitle>Skills detected</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1.5">
            {analysis.skills?.length ? analysis.skills.map((s) => <Badge key={s} variant="secondary">{s}</Badge>) : <p className="text-sm text-muted-foreground">No skills extracted.</p>}
          </div>
          {analysis.missingSkills?.length ? (
            <>
              <p className="mt-4 text-sm font-medium">Missing skills</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {analysis.missingSkills.map((s) => <Badge key={s} variant="outline" className="border-amber-400 text-amber-700">{s}</Badge>)}
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 truncate font-medium">{value}</p>
    </div>
  );
}

function InsightCard({ icon, title, items }: { icon: React.ReactNode; title: string; items?: string[] }) {
  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2 text-base">{icon} {title}</CardTitle></CardHeader>
      <CardContent>
        {items?.length ? (
          <ul className="space-y-2 text-sm text-muted-foreground">
            {items.map((s, i) => <li key={i} className="flex gap-2"><span className="text-primary">•</span>{s}</li>)}
          </ul>
        ) : <p className="text-sm text-muted-foreground">None detected.</p>}
      </CardContent>
    </Card>
  );
}