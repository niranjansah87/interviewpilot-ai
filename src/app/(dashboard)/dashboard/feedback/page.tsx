'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ClipboardCheck, Star, ArrowRight, Loader2, FileText, Mic, TrendingUp } from 'lucide-react';

interface InterviewItem {
  id: string;
  type: string;
  targetRole: string | null;
  experienceLevel: string | null;
  status: string;
  createdAt: string;
  durationSeconds: number | null;
  feedback?: {
    overallScore: number;
    communicationScore: number;
    confidenceScore: number;
    summary: string;
  } | null;
}

export default function FeedbackPage() {
  const [interviews, setInterviews] = useState<InterviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const PER_PAGE = 5;

  useEffect(() => {
    fetch('/api/v1/interviews?limit=100', { credentials: 'include' })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => {
        const all = (d.data?.data ?? []) as InterviewItem[];
        setInterviews(all.filter(i => i.status === 'COMPLETED'));
      })
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, []);
  const paginated = interviews.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(interviews.length / PER_PAGE);

  const withReport = interviews.filter(i => i.feedback?.overallScore != null);
  const avgScore = withReport.length > 0
    ? Math.round(withReport.reduce((s, i) => s + (i.feedback?.overallScore ?? 0), 0) / withReport.length)
    : null;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Feedback</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {withReport.length > 0
            ? `${withReport.length} report${withReport.length !== 1 ? 's' : ''} · Avg score: ${avgScore}/100`
            : 'Complete interviews to see feedback reports'}
        </p>
      </div>

      {/* Stats */}
      {withReport.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <Card className="rounded-2xl">
            <CardContent className="py-6 text-center">
              <div className="text-3xl font-bold">{withReport.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Reports</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl">
            <CardContent className="py-6 text-center">
              <div className="text-3xl font-bold">{avgScore}</div>
              <p className="text-xs text-muted-foreground mt-1">Avg Score</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl">
            <CardContent className="py-6 text-center">
              <div className="text-3xl font-bold">{interviews.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Completed</p>
            </CardContent>
          </Card>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : interviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20">
          <ClipboardCheck className="h-10 w-10 text-muted-foreground/30" />
          <p className="mt-3 text-sm text-muted-foreground">No feedback yet</p>
          <p className="text-xs text-muted-foreground">Complete an interview to see your feedback report</p>
          <Button asChild className="mt-6 gap-1.5"><Link href="/dashboard/interviews/new"><Mic className="h-4 w-4" /> Start Interview</Link></Button>
        </div>
      ) : (
        <div className="space-y-3">
          {paginated.map((i) => (
            <Link
              key={i.id}
              href={i.feedback ? `/dashboard/interviews/${i.id}/report` : `/dashboard/interviews/${i.id}`}
              className="group block rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-md"
            >
              <div className="flex items-center gap-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/5">
                  {i.type === 'TECHNICAL' ? <FileText className="h-5 w-5 text-primary" /> : <Mic className="h-5 w-5 text-primary" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold capitalize">{i.type?.toLowerCase()}</span>
                    {i.targetRole && <><span className="text-muted-foreground">·</span><span className="text-sm text-muted-foreground">{i.targetRole}</span></>}
                    {i.experienceLevel && <><span className="text-muted-foreground">·</span><span className="text-sm capitalize text-muted-foreground">{i.experienceLevel.toLowerCase()}</span></>}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{new Date(i.createdAt).toLocaleDateString()}{i.durationSeconds ? ` · ${Math.floor(i.durationSeconds / 60)}m` : ''}</p>
                </div>
                {i.feedback?.overallScore != null ? (
                  <div className="flex items-center gap-1.5">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-bold">{i.feedback.overallScore}</span>
                    <span className="text-muted-foreground text-sm">/100</span>
                  </div>
                ) : (
                  <Badge variant="outline">Pending</Badge>
                )}
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/40 transition-colors group-hover:text-primary" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="rounded-lg text-xs">Previous</Button>
          <span className="text-xs text-muted-foreground px-2">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-lg text-xs">Next</Button>
        </div>
      )}
    </div>
  );
}
