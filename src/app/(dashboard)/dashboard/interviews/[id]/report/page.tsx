'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ArrowLeft, Star, Lightbulb, TrendingUp, Loader2, Sparkles, Trophy, Target, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { SkeletonCard } from '@/components/ui/skeleton';
import { useMotionValue, useSpring, motion } from 'framer-motion';
import { useEffect as useEffectOnce } from 'react';

interface InterviewData {
  id: string;
  type: string;
  targetRole: string | null;
  experienceLevel: string | null;
  status: string;
  feedback?: {
    overallScore: number;
    communicationScore: number;
    confidenceScore: number;
    technicalReasoning: number | null;
    strengths: string[];
    weaknesses: string[];
    improvements: string[];
    summary: string;
  } | null;
}

function ScoreCircle({ score, label, size = 'lg' }: { score: number; label: string; size?: 'lg' | 'sm' }) {
  const isLg = size === 'lg';
  const r = isLg ? 50 : 28;
  const sw = isLg ? 8 : 5;
  const circ = 2 * Math.PI * r;
  const off = circ - (score / 100) * circ;
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative flex flex-col items-center">
      <svg width={isLg ? 120 : 72} height={isLg ? 120 : 72} className="-rotate-90">
        <circle cx="50%" cy="50%" r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth={sw} />
        <circle cx="50%" cy="50%" r={r} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={off} style={{ transition: 'stroke-dashoffset 1s ease' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={isLg ? 'text-2xl font-bold' : 'text-base font-bold'}>{score}</span>
        {isLg && <span className="text-[10px] text-muted-foreground">/100</span>}
      </div>
      <span className="mt-1 text-[10px] font-medium text-muted-foreground text-center">{label}</span>
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
      const res = await fetch(`/api/v1/interviews/${id}/report`, {
        method: 'POST',
        credentials: 'include',
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.detail ?? 'Failed');
      setInterview(prev => prev ? { ...prev, feedback: body.data } : prev);
      toast.success(`Report ready! Score: ${body.data.overallScore}/100`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    } finally {
      setGenerating(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <SkeletonCard />
        <div className="grid grid-cols-3 gap-4">
          <SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
        <SkeletonCard /><SkeletonCard />
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Not Found</h1>
        <Button asChild variant="outline"><Link href="/dashboard/interviews">Back</Link></Button>
      </div>
    );
  }

  const report = interview.feedback;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" size="sm" asChild className="-ml-2 mb-1 gap-1 text-muted-foreground">
            <Link href={`/dashboard/interviews/${id}`}><ArrowLeft className="h-4 w-4" /> Back</Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Feedback Report</h1>
          <p className="text-sm text-muted-foreground capitalize">
            {interview.type?.toLowerCase()} interview{interview.targetRole ? ` for ${interview.targetRole}` : ''}
          </p>
        </div>
        {!report && (
          <Button onClick={generateReport} disabled={generating} className="gap-2">
            {generating ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</> : <><Sparkles className="h-4 w-4" /> Generate Report</>}
          </Button>
        )}
      </div>

      {!report ? (
        <EmptyState icon={FileText} title="No feedback report yet" description="Generate a detailed AI analysis of your interview performance including scores, strengths, and actionable improvements."
          action={generating ? undefined : { label: 'Generate Report', onClick: generateReport }} />
      ) : (
        <>
          <Card className="rounded-2xl">
            <CardContent className="flex flex-col items-center py-8">
              <ScoreCircle score={report.overallScore} label="Overall" />
              <div className="mt-4">
                <Badge variant={report.overallScore >= 80 ? 'default' : report.overallScore >= 60 ? 'secondary' : 'destructive'}>
                  {report.overallScore >= 85 ? 'Strong Hire' : report.overallScore >= 70 ? 'Hire' : report.overallScore >= 55 ? 'Lean Hire' : 'Not Recommended'}
                </Badge>
              </div>
              <p className="mt-5 max-w-lg text-center text-sm text-muted-foreground">{report.summary}</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-3 gap-4">
            <Card className="rounded-2xl"><CardContent className="flex justify-center py-6"><ScoreCircle score={report.communicationScore} label="Communication" size="sm" /></CardContent></Card>
            <Card className="rounded-2xl"><CardContent className="flex justify-center py-6"><ScoreCircle score={report.confidenceScore} label="Confidence" size="sm" /></CardContent></Card>
            <Card className="rounded-2xl"><CardContent className="flex justify-center py-6">
              {report.technicalReasoning != null
                ? <ScoreCircle score={report.technicalReasoning} label="Technical" size="sm" />
                : <span className="text-sm text-muted-foreground">N/A</span>}
            </CardContent></Card>
          </div>

          <Card className="rounded-2xl">
            <CardHeader><CardTitle className="flex items-center gap-2 text-base text-emerald-600"><Star className="h-4 w-4" /> Strengths</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {report.strengths?.map((s: string, i: number) => (
                  <li key={i} className="flex gap-2 text-sm"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />{s}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader><CardTitle className="flex items-center gap-2 text-base text-amber-600"><TrendingUp className="h-4 w-4" /> Areas to Improve</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {report.weaknesses?.map((w: string, i: number) => (
                  <li key={i} className="flex gap-2 text-sm"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />{w}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader><CardTitle className="flex items-center gap-2 text-base text-blue-600"><Lightbulb className="h-4 w-4" /> Action Plan</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {report.improvements?.map((tip: string, i: number) => (
                  <li key={i} className="flex gap-2 text-sm"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />{tip}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
