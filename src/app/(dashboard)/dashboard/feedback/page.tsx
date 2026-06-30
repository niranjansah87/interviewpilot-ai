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
  const PER_PAGE = 6;

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
    <div className="mx-auto max-w-4xl space-y-3">
      <div>
        <h1 className="text-lg font-bold tracking-tight">Feedback</h1>
        <p className="text-xs text-muted-foreground">
          {withReport.length > 0
            ? `${withReport.length} report${withReport.length !== 1 ? 's' : ''} · Avg score: ${avgScore}/100`
            : 'Complete interviews to see feedback reports'}
        </p>
      </div>

      {withReport.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { v: withReport.length, l: 'Reports' },
            { v: avgScore, l: 'Avg Score' },
            { v: interviews.length, l: 'Completed' },
          ].map(({ v, l }) => (
            <Card key={l} className="rounded-xl">
              <CardContent className="py-3 text-center">
                <div className="text-xl font-bold">{v}</div>
                <p className="text-[10px] text-muted-foreground">{l}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : interviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16">
          <ClipboardCheck className="h-8 w-8 text-muted-foreground/30" />
          <p className="mt-2 text-sm text-muted-foreground">No feedback yet</p>
          <p className="text-xs text-muted-foreground">Complete an interview to see your feedback report</p>
          <Button asChild className="mt-4 gap-1.5" size="sm"><Link href="/dashboard/interviews/new"><Mic className="h-3.5 w-3.5" /> Start Interview</Link></Button>
        </div>
      ) : (
        <div className="space-y-2">
          {paginated.map((i) => (
            <Link
              key={i.id}
              href={i.feedback ? `/dashboard/interviews/${i.id}/report` : `/dashboard/interviews/${i.id}`}
              className="group flex items-center gap-4 rounded-xl border border-border bg-card px-4 py-3 transition-all hover:border-primary/30 hover:shadow-sm"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/5">
                {i.type === 'TECHNICAL' ? <FileText className="h-4 w-4 text-primary" /> : <Mic className="h-4 w-4 text-primary" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-sm">
                  <span className="font-medium capitalize">{i.type?.toLowerCase()}</span>
                  {i.targetRole && <span className="text-xs text-muted-foreground">· {i.targetRole}</span>}
                </div>
                <p className="text-xs text-muted-foreground">{new Date(i.createdAt).toLocaleDateString()}{i.durationSeconds ? ` · ${Math.floor(i.durationSeconds / 60)}m` : ''}</p>
              </div>
              {i.feedback?.overallScore != null ? (
                <div className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-bold">{i.feedback.overallScore}</span>
                </div>
              ) : (
                <Badge variant="outline" className="text-[10px]">Pending</Badge>
              )}
              <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/30 transition-colors group-hover:text-primary" />
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="rounded-lg text-xs h-7">Previous</Button>
          <span className="text-xs text-muted-foreground">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-lg text-xs h-7">Next</Button>
        </div>
      )}
    </div>
  );
}
