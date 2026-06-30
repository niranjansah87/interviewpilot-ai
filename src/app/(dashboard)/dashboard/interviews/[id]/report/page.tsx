'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Star, Lightbulb, TrendingUp, Loader2, Sparkles, FileText } from 'lucide-react';

interface InterviewData {
  id: string; type: string; targetRole: string | null;
  experienceLevel: string | null; status: string;
  feedback?: { overallScore: number; communicationScore: number; confidenceScore: number;
    technicalReasoning: number | null; strengths: string[]; weaknesses: string[];
    improvements: string[]; summary: string; } | null;
}

function BigScore({ score, label }: { score: number; label: string }) {
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
  const r = 48; const sw = 6; const circ = 2 * Math.PI * r; const off = circ - (score / 100) * circ;
  return (
    <div className="relative flex items-center justify-center" style={{ width: 110, height: 110 }}>
      <svg width="110" height="110" className="absolute inset-0 -rotate-90">
        <circle cx="55" cy="55" r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth={sw} />
        <circle cx="55" cy="55" r={r} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={off} style={{ transition: 'stroke-dashoffset 1s ease' }} />
      </svg>
      <div className="flex flex-col items-center">
        <span className="text-2xl font-bold" style={{ color }}>{score}</span>
        <span className="text-[10px] text-muted-foreground">/100</span>
      </div>
    </div>
  );
}

function BarScore({ score, label, color }: { score: number; label: string; color: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold tabular-nums" style={{ color }}>{score}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
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
      toast.success('Report ready!');
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Failed'); }
    finally { setGenerating(false); }
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  if (!interview) return <div className="space-y-3"><Button asChild variant="outline" size="sm"><Link href="/dashboard/interviews">Back</Link></Button><p className="text-sm text-muted-foreground">Not Found</p></div>;

  const r = interview.feedback;
  if (!r) return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" asChild className="-ml-2"><Link href={`/dashboard/interviews/${id}`}><ArrowLeft className="h-3.5 w-3.5" /> Back</Link></Button>
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border py-20">
        <FileText className="h-12 w-12 text-muted-foreground/20" />
        <div className="text-center">
          <h2 className="text-lg font-semibold">No feedback report yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">Generate an AI-powered analysis of this interview</p>
        </div>
        <Button onClick={generateReport} disabled={generating} size="lg" className="gap-2">
          {generating ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</> : <><Sparkles className="h-4 w-4" /> Generate Report</>}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="-m-6 p-6">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between">
          <div>
            <Button variant="ghost" size="sm" asChild className="-ml-2 h-7 text-xs text-muted-foreground">
              <Link href={`/dashboard/interviews/${id}`}><ArrowLeft className="h-3 w-3" /> Back</Link>
            </Button>
            <h1 className="text-lg font-bold">Feedback Report</h1>
            <p className="text-[11px] capitalize text-muted-foreground">{interview.type?.toLowerCase()} · {interview.targetRole || 'General'} · {interview.experienceLevel?.toLowerCase() || 'Mid'}</p>
          </div>
          <Badge className="px-3 py-1 text-xs font-semibold" variant={r.overallScore >= 80 ? 'default' : r.overallScore >= 60 ? 'secondary' : 'destructive'}>
            {r.overallScore >= 85 ? 'Strong Hire' : r.overallScore >= 70 ? 'Hire' : r.overallScore >= 55 ? 'Lean Hire' : 'No Hire'}
          </Badge>
        </div>

        {/* Score + Summary + Bars row */}
        <div className="flex shrink-0 items-center gap-6 rounded-xl border border-border/50 bg-card p-4">
          <BigScore score={r.overallScore} label="Overall" />
          <div className="flex min-w-0 flex-1 flex-col gap-2.5">
            <p className="text-xs leading-relaxed text-muted-foreground">{r.summary}</p>
            <div className="space-y-2">
              <BarScore score={r.communicationScore} label="Communication" color="#10b981" />
              <BarScore score={r.confidenceScore} label="Confidence" color="#3b82f6" />
              {r.technicalReasoning != null && <BarScore score={r.technicalReasoning} label="Technical" color="#f59e0b" />}
            </div>
          </div>
        </div>

        {/* 3-column cards — height follows content */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20"><Star className="h-3.5 w-3.5 text-emerald-600" /></div>
              <h3 className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Strengths</h3>
            </div>
            <ul className="space-y-1.5">
              {r.strengths?.slice(0, 5).map((s, i) => (
                <li key={i} className="flex gap-2 text-xs leading-relaxed"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />{s}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20"><TrendingUp className="h-3.5 w-3.5 text-amber-600" /></div>
              <h3 className="text-sm font-semibold text-amber-700 dark:text-amber-400">To Improve</h3>
            </div>
            <ul className="space-y-1.5">
              {r.weaknesses?.slice(0, 5).map((w, i) => (
                <li key={i} className="flex gap-2 text-xs leading-relaxed"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />{w}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/20"><Lightbulb className="h-3.5 w-3.5 text-blue-600" /></div>
              <h3 className="text-sm font-semibold text-blue-700 dark:text-blue-400">Action Plan</h3>
            </div>
            <ul className="space-y-1.5">
              {r.improvements?.slice(0, 5).map((tip, i) => (
                <li key={i} className="flex gap-2 text-xs leading-relaxed"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />{tip}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
