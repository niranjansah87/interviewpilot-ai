'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { ArrowLeft, Star, Lightbulb, TrendingUp, Loader2, Sparkles, FileText } from 'lucide-react';

interface InterviewData {
  id: string; type: string; targetRole: string | null;
  experienceLevel: string | null; status: string;
  feedback?: { overallScore: number; communicationScore: number; confidenceScore: number;
    technicalReasoning: number | null; strengths: string[]; weaknesses: string[];
    improvements: string[]; summary: string; } | null;
}

function ScoreRing({ score, label, size }: { score: number; label: string; size: number }) {
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
  const r = size / 2 - 5; const circ = 2 * Math.PI * r;
  const off = circ - (score / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="absolute inset-0 -rotate-90">
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="4" />
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={off} style={{ transition: 'stroke-dashoffset 1.2s ease' }} />
        </svg>
        <span className="text-sm font-bold" style={{ color }}>{score}</span>
      </div>
      <span className="text-[9px] font-medium text-muted-foreground">{label}</span>
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
      toast.success(`Report ready!`);
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Failed'); }
    finally { setGenerating(false); }
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  if (!interview) return <div className="space-y-3"><h1 className="text-lg font-bold">Not Found</h1><Button asChild variant="outline" size="sm"><Link href="/dashboard/interviews">Back</Link></Button></div>;

  const report = interview.feedback;

  if (!report) return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" asChild className="-ml-2"><Link href={`/dashboard/interviews/${id}`}><ArrowLeft className="h-3.5 w-3.5" /> Back</Link></Button>
      <EmptyState icon={FileText} title="No feedback yet" description="Generate AI analysis of your interview." variant="compact"
        action={generating ? undefined : { label: 'Generate', onClick: generateReport }} />
    </div>
  );

  return (
    <div className="-m-6 flex h-screen flex-col overflow-hidden p-6">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-2">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="-ml-2 text-muted-foreground">
              <Link href={`/dashboard/interviews/${id}`}><ArrowLeft className="h-3.5 w-3.5" /> Back</Link>
            </Button>
            <div>
              <h1 className="text-base font-bold leading-tight">Feedback Report</h1>
              <p className="text-[10px] text-muted-foreground capitalize">{interview.type?.toLowerCase()} · {interview.targetRole || 'General'}</p>
            </div>
          </div>
          <Badge className="text-[10px]">{report.overallScore >= 85 ? 'Strong Hire' : report.overallScore >= 70 ? 'Hire' : report.overallScore >= 55 ? 'Lean Hire' : 'No Hire'}</Badge>
        </div>

        {/* Score rings */}
        <div className="flex shrink-0 items-center justify-center gap-5 rounded-xl border border-border/50 bg-card px-4 py-3">
          <ScoreRing score={report.overallScore} label="Overall" size={72} />
          <div className="h-12 w-px bg-border/50" />
          <ScoreRing score={report.communicationScore} label="Comm" size={56} />
          <ScoreRing score={report.confidenceScore} label="Conf" size={56} />
          {report.technicalReasoning != null && <ScoreRing score={report.technicalReasoning} label="Tech" size={56} />}
        </div>

        {/* Summary */}
        <p className="shrink-0 text-center text-xs leading-relaxed text-muted-foreground">{report.summary}</p>

        {/* 3 columns — content height, no stretch */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-border/50 bg-card p-3">
            <h3 className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-emerald-600"><Star className="h-3.5 w-3.5" />Strengths</h3>
            <ul className="space-y-1">
              {report.strengths?.slice(0, 6).map((s, i) => (
                <li key={i} className="flex gap-1.5 text-xs leading-snug"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />{s}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-border/50 bg-card p-3">
            <h3 className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-amber-600"><TrendingUp className="h-3.5 w-3.5" />To Improve</h3>
            <ul className="space-y-1">
              {report.weaknesses?.slice(0, 6).map((w, i) => (
                <li key={i} className="flex gap-1.5 text-xs leading-snug"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />{w}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-border/50 bg-card p-3">
            <h3 className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-blue-600"><Lightbulb className="h-3.5 w-3.5" />Action Plan</h3>
            <ul className="space-y-1">
              {report.improvements?.slice(0, 6).map((tip, i) => (
                <li key={i} className="flex gap-1.5 text-xs leading-snug"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />{tip}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
