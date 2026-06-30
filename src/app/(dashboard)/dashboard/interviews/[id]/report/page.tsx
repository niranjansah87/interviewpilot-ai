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
    <div className="-m-6 flex h-screen flex-col gap-2 overflow-hidden p-6">
      {/* Header bar */}
      <div className="flex shrink-0 items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild className="h-7 text-xs text-muted-foreground -ml-2">
            <Link href={`/dashboard/interviews/${id}`}><ArrowLeft className="h-3 w-3" /> Back</Link>
          </Button>
          <div>
            <h1 className="text-lg font-bold leading-tight">Feedback Report</h1>
            <p className="text-[10px] text-muted-foreground capitalize">{interview.type?.toLowerCase()} · {interview.targetRole || 'General'}</p>
          </div>
        </div>
        <Badge variant={report.overallScore >= 80 ? 'default' : report.overallScore >= 60 ? 'secondary' : 'destructive'} className="text-[10px]">
          {report.overallScore >= 85 ? 'Strong Hire' : report.overallScore >= 70 ? 'Hire' : report.overallScore >= 55 ? 'Lean Hire' : 'Not Recommended'}
        </Badge>
      </div>

      {/* Score row - reduced size */}
      <Card className="shrink-0 rounded-lg border-border/50">
        <CardContent className="flex items-center gap-3 py-3 px-4">
          <div className="relative flex shrink-0 items-center justify-center">
            <svg width="72" height="72" className="-rotate-90">
              <circle cx="36" cy="36" r="30" fill="none" stroke="hsl(var(--muted))" strokeWidth="5" />
              <circle cx="36" cy="36" r="30" fill="none" stroke={scoreColor} strokeWidth="5" strokeLinecap="round"
                strokeDasharray={2*Math.PI*30} strokeDashoffset={(2*Math.PI*30)-(report.overallScore/100)*(2*Math.PI*30)} style={{ transition: 'stroke-dashoffset 1s ease' }} />
            </svg>
            <span className="absolute text-base font-bold">{report.overallScore}</span>
          </div>
          <div className="flex gap-3">
            {[
              { s: report.communicationScore, l: 'Comm', c: '#10b981' },
              { s: report.confidenceScore, l: 'Conf', c: '#3b82f6' },
              { s: report.technicalReasoning ?? 0, l: 'Tech', c: report.technicalReasoning != null ? '#f59e0b' : '#94a3b8' },
            ].map(({ s, l, c }) => (
              <div key={l} className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold w-6 text-right" style={{ color: c }}>{s}</span>
                <span className="text-[9px] text-muted-foreground">{l}</span>
              </div>
            ))}
          </div>
          <p className="min-w-0 flex-1 text-[11px] leading-snug text-muted-foreground">{report.summary}</p>
        </CardContent>
      </Card>

      {/* 3-column: fills remaining height */}
      <div className="grid flex-1 grid-cols-3 gap-2 overflow-hidden min-h-0">
        <Card className="flex flex-col rounded-lg overflow-hidden border-border/50">
          <CardHeader className="shrink-0 px-3 py-2">
            <CardTitle className="flex items-center gap-1.5 text-[11px] text-emerald-600"><Star className="h-3 w-3" /> Strengths</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto px-3 pb-2 pt-0">
            <ul className="space-y-1">
              {report.strengths?.slice(0,4).map((s, i) => (
                <li key={i} className="flex gap-1.5 text-[11px] leading-snug"><span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-emerald-500" />{s}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card className="flex flex-col rounded-lg overflow-hidden border-border/50">
          <CardHeader className="shrink-0 px-3 py-2">
            <CardTitle className="flex items-center gap-1.5 text-[11px] text-amber-600"><TrendingUp className="h-3 w-3" /> To Improve</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto px-3 pb-2 pt-0">
            <ul className="space-y-1">
              {report.weaknesses?.map((w, i) => (
                <li key={i} className="flex gap-1.5 text-[11px] leading-snug"><span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-amber-500" />{w}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card className="flex flex-col rounded-lg overflow-hidden border-border/50">
          <CardHeader className="shrink-0 px-3 py-2">
            <CardTitle className="flex items-center gap-1.5 text-[11px] text-blue-600"><Lightbulb className="h-3 w-3" /> Action Plan</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto px-3 pb-2 pt-0">
            <ul className="space-y-1">
              {report.improvements?.map((tip, i) => (
                <li key={i} className="flex gap-1.5 text-[11px] leading-snug"><span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-blue-500" />{tip}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
