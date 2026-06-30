'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, Star, MessageSquare, Lightbulb, TrendingUp, Target, Loader2, Sparkles } from 'lucide-react';

interface FeedbackReport {
  overallScore: number;
  communicationScore: number;
  confidenceScore: number;
  technicalReasoning: number | null;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  summary: string;
}

interface Interview {
  id: string;
  type: string;
  targetRole: string;
  experienceLevel: string;
  status: string;
}

function ScoreRing({ score, label, size = 'lg' }: { score: number; label: string; size?: 'lg' | 'sm' }) {
  const isLg = size === 'lg';
  const r = isLg ? 54 : 30;
  const strokeW = isLg ? 8 : 4;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? 'stroke-emerald-500' : score >= 60 ? 'stroke-amber-500' : 'stroke-red-500';

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={isLg ? 130 : 80} height={isLg ? 130 : 80} className="-rotate-90">
        <circle cx="50%" cy="50%" r={r} fill="none" stroke="currentColor" strokeWidth={strokeW} className="text-muted/20" />
        <circle cx="50%" cy="50%" r={r} fill="none" strokeWidth={strokeW} strokeLinecap="round"
          className={`${color} transition-all duration-1000`}
          strokeDasharray={circumference} strokeDashoffset={offset} />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={isLg ? 'text-3xl font-bold' : 'text-lg font-bold'}>{score}</span>
        {isLg && <span className="text-xs text-muted-foreground">/100</span>}
      </div>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
    </div>
  );
}

export default function FeedbackReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [interview, setInterview] = useState<Interview | null>(null);
  const [report, setReport] = useState<FeedbackReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/v1/interviews/${id}`, { credentials: 'include' }).then(r => r.json()),
      fetch(`/api/v1/interviews/${id}/report`, { credentials: 'include' }).then(r => r.ok ? r.json() : null),
    ]).then(([intData, repData]) => {
      setInterview(intData.data);
      setReport(repData?.data ?? null);
    }).catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, [id]);

  async function generateReport() {
    setGenerating(true);
    try {
      const res = await fetch(`/api/v1/interviews/${id}/report`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) throw new Error((await res.json()).detail ?? 'Failed');
      const { data } = await res.json();
      setReport(data);
      toast.success('Report generated');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate');
    } finally {
      setGenerating(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
        <div className="h-64 animate-pulse rounded-2xl bg-muted/50" />
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

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" size="sm" asChild className="-ml-2 mb-1 gap-1 text-muted-foreground">
            <Link href={`/dashboard/interviews/${id}`}><ArrowLeft className="h-4 w-4" /> Back</Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Feedback Report</h1>
          <p className="text-sm text-muted-foreground">
            {interview.type?.charAt(0).toUpperCase() + interview.type?.slice(1).toLowerCase()} interview
            {interview.targetRole ? ` for ${interview.targetRole}` : ''}
          </p>
        </div>
        {!report && (
          <Button onClick={generateReport} disabled={generating} className="gap-2">
            {generating ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</> : <><Sparkles className="h-4 w-4" /> Generate Report</>}
          </Button>
        )}
      </div>

      {!report ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20">
          <Star className="h-10 w-10 text-muted-foreground/30" />
          <p className="mt-3 text-sm text-muted-foreground">No feedback report yet</p>
          <p className="text-xs text-muted-foreground">Click "Generate Report" to analyze this interview</p>
        </div>
      ) : (
        <>
          {/* Overall Score */}
          <Card className="rounded-2xl">
            <CardContent className="flex flex-col items-center py-10">
              <div className="relative flex items-center justify-center">
                <ScoreRing score={report.overallScore} label="Overall" />
              </div>
              <p className="mt-6 max-w-lg text-center text-sm text-muted-foreground">{report.summary}</p>
            </CardContent>
          </Card>

          {/* Score Breakdown */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="rounded-2xl">
              <CardContent className="relative flex items-center justify-center py-8">
                <ScoreRing score={report.communicationScore} label="Communication" size="sm" />
              </CardContent>
            </Card>
            <Card className="rounded-2xl">
              <CardContent className="relative flex items-center justify-center py-8">
                <ScoreRing score={report.confidenceScore} label="Confidence" size="sm" />
              </CardContent>
            </Card>
            <Card className="rounded-2xl">
              <CardContent className="relative flex items-center justify-center py-8">
                {report.technicalReasoning != null ? (
                  <ScoreRing score={report.technicalReasoning} label="Technical" size="sm" />
                ) : (
                  <span className="text-xs text-muted-foreground">N/A</span>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Strengths */}
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-emerald-600">
                <Star className="h-4 w-4" /> Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {report.strengths.map((s, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                    {s}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Areas to Improve */}
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-amber-600">
                <TrendingUp className="h-4 w-4" /> Areas to Improve
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {report.weaknesses.map((w, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                    {w}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Actionable Tips */}
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-blue-600">
                <Lightbulb className="h-4 w-4" /> Action Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {report.improvements.map((tip, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                    {tip}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
