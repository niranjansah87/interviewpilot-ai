'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ArrowLeft, Star, Lightbulb, TrendingUp, Loader2, Sparkles, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { SkeletonCard } from '@/components/ui/skeleton';

interface InterviewData {
  id: string;
  type: string;
  targetRole: string | null;
  experienceLevel: string | null;
  status: string;
  feedback?: {
    overallScore: number; communicationScore: number; confidenceScore: number;
    technicalReasoning: number | null; strengths: string[]; weaknesses: string[];
    improvements: string[]; summary: string;
  } | null;
}

function MiniScore({ score, color }: { score: number; color: string }) {
  const r = 16; const sw = 3; const circ = 2 * Math.PI * r; const off = circ - (score / 100) * circ;
  return (
    <div className="relative flex items-center justify-center">
      <svg width="40" height="40" className="-rotate-90">
        <circle cx="20" cy="20" r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth={sw} />
        <circle cx="20" cy="20" r={r} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={off} style={{ transition: 'stroke-dashoffset 1s ease' }} />
      </svg>
      <span className="absolute text-[11px] font-bold">{score}</span>
    </div>
  );
}

export default function FeedbackReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [interview, setInterview] = useState<InterviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetch(`/api/v1/interviews/${id}`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(({ data }) => setInterview(data))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, [id]);

  async function generateReport() {
    setGenerating(true);
    try {
      const res = await fetch(`/api/v1/interviews/${id}/report`, { method: 'POST', credentials: 'include' });
      const body = await res.json();
      if (!res.ok) throw new Error(body.detail ?? 'Failed');
      setInterview(prev => prev ? { ...prev, feedback: body.data } : prev);
      toast.success(`Report ready! Score: ${body.data.overallScore}/100`);
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Failed'); }
    finally { setGenerating(false); }
  }

  if (loading) return (
    <div className="space-y-3">
      <SkeletonCard /><div className="grid grid-cols-3 gap-3"><SkeletonCard /><SkeletonCard /><SkeletonCard /></div><SkeletonCard />
    </div>
  );

  if (!interview) return (
    <div className="space-y-3">
      <h1 className="text-xl font-bold">Not Found</h1>
      <Button asChild variant="outline" size="sm"><Link href="/dashboard/interviews">Back</Link></Button>
    </div>
  );

  const report = interview.feedback;
  if (!report) return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" size="sm" asChild className="-ml-2 text-muted-foreground"><Link href={`/dashboard/interviews/${id}`}><ArrowLeft className="h-3.5 w-3.5" /> Back</Link></Button>
          <h1 className="text-xl font-bold">Feedback Report</h1>
        </div>
        <Button onClick={generateReport} disabled={generating} size="sm" className="gap-1.5">
          {generating ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Generating</> : <><Sparkles className="h-3.5 w-3.5" /> Generate</>}
        </Button>
      </div>
      <EmptyState icon={FileText} title="No feedback yet" description="Generate AI analysis of your interview." variant="compact"
        action={generating ? undefined : { label: 'Generate Report', onClick: generateReport }} />
    </div>
  );

  const scoreColor = report.overallScore >= 80 ? '#10b981' : report.overallScore >= 60 ? '#f59e0b' : '#ef4444';
  const mainR = 42; const mainSw = 6; const mainCirc = 2 * Math.PI * mainR; const mainOff = mainCirc - (report.overallScore / 100) * mainCirc;

  return (
    <div className="flex h-[calc(100vh-5.5rem)] flex-col gap-3">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between">
        <div>
          <Button variant="ghost" size="sm" asChild className="-ml-2 h-7 text-xs text-muted-foreground">
            <Link href={`/dashboard/interviews/${id}`}><ArrowLeft className="h-3 w-3" /> Back</Link>
          </Button>
          <h1 className="text-lg font-bold">Feedback Report</h1>
          <p className="text-xs text-muted-foreground capitalize">{interview.type?.toLowerCase()} interview{interview.targetRole ? ` · ${interview.targetRole}` : ''}</p>
        </div>
        <Badge variant={report.overallScore >= 80 ? 'default' : report.overallScore >= 60 ? 'secondary' : 'destructive'} className="text-xs">
          {report.overallScore >= 85 ? 'Strong Hire' : report.overallScore >= 70 ? 'Hire' : report.overallScore >= 55 ? 'Lean Hire' : 'Not Recommended'}
        </Badge>
      </div>

      {/* Score + Summary row */}
      <Card className="shrink-0 rounded-xl">
        <CardContent className="flex items-center gap-5 py-4">
          {/* Main score circle */}
          <div className="relative flex shrink-0 items-center justify-center">
            <svg width="100" height="100" className="-rotate-90">
              <circle cx="50" cy="50" r={mainR} fill="none" stroke="hsl(var(--muted))" strokeWidth={mainSw} />
              <circle cx="50" cy="50" r={mainR} fill="none" stroke={scoreColor} strokeWidth={mainSw} strokeLinecap="round"
                strokeDasharray={mainCirc} strokeDashoffset={mainOff} style={{ transition: 'stroke-dashoffset 1s ease' }} />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-xl font-bold">{report.overallScore}</span>
              <span className="text-[9px] text-muted-foreground">/100</span>
            </div>
          </div>

          {/* Sub-scores inline */}
          <div className="flex gap-4">
            {[
              { s: report.communicationScore, l: 'Communication', c: '#10b981' },
              { s: report.confidenceScore, l: 'Confidence', c: '#3b82f6' },
              { s: report.technicalReasoning ?? 0, l: 'Technical', c: report.technicalReasoning != null ? '#f59e0b' : '#94a3b8' },
            ].map(({ s, l, c }) => (
              <div key={l} className="flex flex-col items-center gap-0.5">
                <MiniScore score={s} color={c} />
                <span className="text-[9px] text-muted-foreground">{l}</span>
              </div>
            ))}
          </div>

          {/* Summary */}
          <p className="min-w-0 flex-1 text-xs leading-relaxed text-muted-foreground">{report.summary}</p>
        </CardContent>
      </Card>

      {/* 3-column: Strengths | Weaknesses | Action Plan */}
      <div className="grid flex-1 grid-cols-3 gap-3 overflow-hidden">
        <Card className="flex flex-col rounded-xl overflow-hidden">
          <CardHeader className="shrink-0 pb-2">
            <CardTitle className="flex items-center gap-1.5 text-xs text-emerald-600"><Star className="h-3 w-3" /> Strengths</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto pt-0">
            <ul className="space-y-1.5">
              {report.strengths?.map((s, i) => (
                <li key={i} className="flex gap-1.5 text-xs"><span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-emerald-500" />{s}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="flex flex-col rounded-xl overflow-hidden">
          <CardHeader className="shrink-0 pb-2">
            <CardTitle className="flex items-center gap-1.5 text-xs text-amber-600"><TrendingUp className="h-3 w-3" /> Improvements</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto pt-0">
            <ul className="space-y-1.5">
              {report.weaknesses?.map((w, i) => (
                <li key={i} className="flex gap-1.5 text-xs"><span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-amber-500" />{w}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="flex flex-col rounded-xl overflow-hidden">
          <CardHeader className="shrink-0 pb-2">
            <CardTitle className="flex items-center gap-1.5 text-xs text-blue-600"><Lightbulb className="h-3 w-3" /> Action Plan</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto pt-0">
            <ul className="space-y-1.5">
              {report.improvements?.map((tip, i) => (
                <li key={i} className="flex gap-1.5 text-xs"><span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-blue-500" />{tip}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
