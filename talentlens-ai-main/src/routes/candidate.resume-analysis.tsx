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
import {
  Upload, FileText, Sparkles, Loader2, CheckCircle2,
  AlertTriangle, Lightbulb, RefreshCw, TrendingUp, Target, Brain,
  ChevronRight, Star, Zap
} from "lucide-react";
import { formatDate, scoreColor } from "@/lib/format";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, ResponsiveContainer
} from "recharts";

export const Route = createFileRoute("/candidate/resume-analysis")({
  ssr: false,
  component: () => (
    <CandidateLayout>
      <ResumeAnalysisPage />
    </CandidateLayout>
  ),
});

function ResumeAnalysisPage() {
  const { data: resumes, loading, error, refetch, setData } = useApi<Resume[]>(
    () => resumeService.mine(), []
  );
  const [uploading, setUploading] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isReAnalyze, setIsReAnalyze] = useState(false);

  async function upload(file: File) {
    setUploading(true);
    try {
      const r = await resumeService.upload(file);
      setData([r, ...(resumes ?? [])]);
      toast.success("Resume uploaded successfully");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function analyze(id: string, forceRefresh = false) {
    setActiveId(id);
    setAnalyzing(true);
    setAnalysisError(null);
    setIsReAnalyze(forceRefresh);

    // If not forcing refresh, try to load cached result first
    if (!forceRefresh) {
      try {
        const cached = await aiService.resumeAnalysis(id);
        if (cached) {
          setAnalysis(cached);
          setAnalyzing(false);
          return;
        }
      } catch {
        // No cached result — run fresh analysis
      }
    }

    try {
      const r = await aiService.analyzeResume(id);
      setAnalysis(r);
      toast.success("Analysis complete");
    } catch (e) {
      setAnalysisError(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  }

  const overallScore = analysis?.scores?.overall ?? 0;

  return (
    <>
      <PageHeader
        title="Resume Analysis"
        description="Upload your resume and get a detailed AI-powered breakdown of your profile."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upload card */}
        <Card className="lg:col-span-1 border-border/60 hover:border-primary/30 transition-colors duration-300">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Upload className="h-4 w-4 text-primary" />
              Upload resume
            </CardTitle>
          </CardHeader>
          <CardContent>
            <label className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed py-10 text-center transition-all duration-300 ${uploading ? "border-primary/60 bg-primary/5" : "border-border bg-muted/20 hover:border-primary/50 hover:bg-primary/5"}`}>
              <div className={`flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 ${uploading ? "bg-primary/20" : "bg-muted"}`}>
                {uploading
                  ? <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  : <Upload className="h-5 w-5 text-muted-foreground" />
                }
              </div>
              <div>
                <p className="text-sm font-medium">{uploading ? "Uploading..." : "Click to upload"}</p>
                <p className="mt-1 text-xs text-muted-foreground">PDF, DOC, DOCX</p>
              </div>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                disabled={uploading}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) void upload(f); }}
              />
            </label>
          </CardContent>
        </Card>

        {/* Resume list */}
        <Card className="lg:col-span-2 border-border/60">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              My resumes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? <LoadingState /> :
              error ? <ErrorState message={error} onRetry={refetch} /> :
              !resumes?.length
                ? <EmptyState icon={<FileText className="h-6 w-6" />} title="No resumes yet" message="Upload your first resume to get started." />
                : resumes.map((r) => (
                  <div
                    key={r.id}
                    className={`group flex items-center justify-between rounded-xl border p-4 transition-all duration-200 ${activeId === r.id ? "border-primary/60 bg-primary/5 shadow-sm shadow-primary/10" : "border-border hover:border-primary/30 hover:bg-muted/30"}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors duration-200 ${activeId === r.id ? "bg-primary/20" : "bg-muted group-hover:bg-primary/10"}`}>
                        <FileText className={`h-4 w-4 transition-colors duration-200 ${activeId === r.id ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{r.filename}</p>
                        <p className="text-xs text-muted-foreground">Uploaded {formatDate(r.uploadedAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {activeId === r.id && analysis && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => analyze(r.id, true)}
                          disabled={analyzing}
                          className="text-muted-foreground hover:text-foreground"
                          title="Re-analyze with fresh AI scan"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        onClick={() => analyze(r.id)}
                        disabled={analyzing && activeId === r.id}
                        className="gap-1.5"
                      >
                        {analyzing && activeId === r.id
                          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          : <Sparkles className="h-3.5 w-3.5" />
                        }
                        {activeId === r.id && analysis ? "View" : "Analyze"}
                      </Button>
                    </div>
                  </div>
                ))
            }
          </CardContent>
        </Card>
      </div>

      {/* Analyzing state */}
      {analyzing && (
        <Card className="mt-6 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
          <CardContent className="flex flex-col items-center justify-center gap-4 py-16">
            <div className="relative">
              <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
              <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Brain className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="text-center">
              <p className="font-semibold text-lg">
                {isReAnalyze ? "Re-analyzing your resume..." : "Analyzing your resume..."}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Our AI is reading, scoring, and benchmarking your profile against industry standards.
              </p>
            </div>
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-2 w-2 rounded-full bg-primary/60 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {analysisError && (
        <div className="mt-6">
          <ErrorState message={analysisError} onRetry={() => activeId && analyze(activeId)} />
        </div>
      )}

      {analysis && !analyzing && (
        <AnalysisResult
          analysis={analysis}
          onReAnalyze={() => activeId && analyze(activeId, true)}
        />
      )}
    </>
  );
}

function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = (score / 100) * circumference;
  const color = score >= 75 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--color-muted)" strokeWidth="8" />
      <circle
        cx="50" cy="50" r={radius}
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={`${strokeDash} ${circumference}`}
        transform="rotate(-90 50 50)"
        style={{ transition: "stroke-dasharray 1s ease" }}
      />
      <text x="50" y="46" textAnchor="middle" fontSize="18" fontWeight="bold" fill="currentColor">{score}</text>
      <text x="50" y="60" textAnchor="middle" fontSize="9" fill="var(--color-muted-foreground)">/ 100</text>
    </svg>
  );
}

function AnalysisResult({ analysis, onReAnalyze }: { analysis: ResumeAnalysis; onReAnalyze: () => void }) {
  const scoreData = Object.entries(analysis.scores ?? {}).map(([k, v]) => ({
    axis: k.charAt(0).toUpperCase() + k.slice(1),
    value: v as number,
  }));

  const overallScore = analysis.scores?.overall ?? 0;
  const atsScore = analysis.atsScore ?? 0;
  const interviewScore = analysis.interviewReadinessScore ?? 0;

  return (
    <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/8 to-chart-2/8 p-5">
        <div className="flex items-center gap-4">
          <ScoreRing score={overallScore} />
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Overall Score</p>
            <p className="text-2xl font-bold mt-0.5">
              {overallScore >= 75 ? "Strong Profile" : overallScore >= 50 ? "Developing Profile" : "Needs Work"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">{analysis.candidateName || "Candidate"}</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{atsScore}</p>
            <p className="text-xs text-muted-foreground">ATS Score</p>
          </div>
          <div className="w-px bg-border" />
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-600">{interviewScore}</p>
            <p className="text-xs text-muted-foreground">Interview Ready</p>
          </div>
          <div className="w-px bg-border hidden sm:block" />
          <Button variant="outline" size="sm" onClick={onReAnalyze} className="hidden sm:flex gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" /> Re-analyze
          </Button>
        </div>
      </div>

      {/* Overview + contact */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Resume overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-muted-foreground">{analysis.summary}</p>
          {(analysis.candidateName || analysis.email) && (
            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 md:grid-cols-3">
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

      {/* Score breakdown + radar */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Score breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {Object.entries(analysis.scores ?? {}).map(([k, v]) => {
              const val = v as number;
              const barColor = val >= 75 ? "bg-emerald-500" : val >= 50 ? "bg-amber-500" : "bg-red-500";
              return (
                <div key={k}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="capitalize font-medium">{k}</span>
                    <span className={`font-bold text-sm ${scoreColor(val)}`}>{val}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ease-out ${barColor}`}
                      style={{ width: `${val}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Skills radar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={scoreData}>
                  <PolarGrid stroke="var(--color-border)" />
                  <PolarAngleAxis dataKey="axis" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    dataKey="value"
                    stroke="var(--color-primary)"
                    fill="var(--color-primary)"
                    fillOpacity={0.25}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Strengths / Weaknesses / Suggestions */}
      <div className="grid gap-6 md:grid-cols-3">
        <InsightCard
          icon={<CheckCircle2 className="h-4 w-4" />}
          title="Strengths"
          items={analysis.strengths}
          colorClass="text-emerald-600"
          bgClass="bg-emerald-50 dark:bg-emerald-950/30"
          dotColor="text-emerald-500"
        />
        <InsightCard
          icon={<AlertTriangle className="h-4 w-4" />}
          title="Weaknesses"
          items={analysis.weaknesses}
          colorClass="text-amber-600"
          bgClass="bg-amber-50 dark:bg-amber-950/30"
          dotColor="text-amber-500"
        />
        <InsightCard
          icon={<Lightbulb className="h-4 w-4" />}
          title="Suggestions"
          items={analysis.suggestions}
          colorClass="text-violet-600"
          bgClass="bg-violet-50 dark:bg-violet-950/30"
          dotColor="text-violet-500"
        />
      </div>

      {/* Skills */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            Skills detected
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {analysis.skills?.length
              ? analysis.skills.map((s) => (
                <Badge key={s} variant="secondary" className="rounded-full px-3 py-0.5 text-xs font-medium">
                  {s}
                </Badge>
              ))
              : <p className="text-sm text-muted-foreground">No skills extracted.</p>
            }
          </div>
          {analysis.missingSkills?.length ? (
            <div className="mt-5">
              <p className="text-sm font-semibold text-amber-700 dark:text-amber-500 mb-2 flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" /> Missing skills
              </p>
              <div className="flex flex-wrap gap-2">
                {analysis.missingSkills.map((s) => (
                  <Badge key={s} variant="outline" className="rounded-full border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-400 px-3 py-0.5 text-xs">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Improvement plan */}
      {analysis.improvementPlan?.length ? (
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-4 w-4 text-primary" />
              Improvement plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analysis.improvementPlan.map((item, i) => {
              const priorityColor = item.priority === "high"
                ? "border-l-red-400 bg-red-50 dark:bg-red-950/20"
                : item.priority === "medium"
                ? "border-l-amber-400 bg-amber-50 dark:bg-amber-950/20"
                : "border-l-blue-400 bg-blue-50 dark:bg-blue-950/20";
              const badge = item.priority === "high"
                ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
                : item.priority === "medium"
                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                : "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400";
              return (
                <div key={i} className={`rounded-lg border-l-4 p-4 ${priorityColor}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{item.issue}</p>
                      <p className="mt-1 text-sm text-muted-foreground flex items-start gap-1.5">
                        <ChevronRight className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                        {item.fix}
                      </p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium capitalize ${badge}`}>
                      {item.priority}
                    </span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ) : null}

      {/* Project recommendations */}
      {analysis.projectRecommendations?.length ? (
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Recommended projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {analysis.projectRecommendations.map((p, i) => (
                <div key={i} className="rounded-lg border border-border bg-muted/30 p-4 text-sm hover:border-primary/30 transition-colors duration-200">
                  <p className="font-medium">{p}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 p-3 hover:border-primary/30 transition-colors duration-200">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-sm font-medium">{value}</p>
    </div>
  );
}

function InsightCard({
  icon, title, items, colorClass, bgClass, dotColor,
}: {
  icon: React.ReactNode;
  title: string;
  items?: string[];
  colorClass: string;
  bgClass: string;
  dotColor: string;
}) {
  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className={`flex items-center gap-2 text-sm font-semibold ${colorClass}`}>
          <span className={`flex h-6 w-6 items-center justify-center rounded-md ${bgClass}`}>{icon}</span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items?.length ? (
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            {items.map((s, i) => (
              <li key={i} className="flex gap-2 leading-relaxed">
                <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${dotColor.replace("text-", "bg-")}`} />
                {s}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">None detected.</p>
        )}
      </CardContent>
    </Card>
  );
}
