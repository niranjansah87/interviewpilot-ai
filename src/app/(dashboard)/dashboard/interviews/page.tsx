'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { History, ArrowRight, Plus, Calendar, Clock, Star, Loader2, FileText, Mic } from 'lucide-react';

interface Interview {
  id: string;
  type: string;
  targetRole: string | null;
  experienceLevel: string | null;
  status: string;
  createdAt: string;
  durationSeconds: number | null;
  feedback?: { overallScore: number } | null;
}

interface InterviewList {
  data: Interview[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  CREATED:   { label: 'Ready',   className: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800' },
  READY:     { label: 'Ready',   className: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800' },
  ACTIVE:    { label: 'Active',  className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800' },
  COMPLETED: { label: 'Done',    className: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' },
  FAILED:    { label: 'Failed',  className: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800' },
};

const TYPE_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  BEHAVIORAL: Mic,
  TECHNICAL: FileText,
  MIXED: Mic,
};

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
}

function formatDuration(seconds: number | null) {
  if (!seconds) return null;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/interviews?limit=50', { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load interviews');
        return res.json();
      })
      .then(({ data }: { data: InterviewList }) => {
        setInterviews(data.data ?? []);
        setTotal(data.pagination?.total ?? 0);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-32 animate-pulse rounded-lg bg-muted" />
          <div className="h-10 w-40 animate-pulse rounded-xl bg-muted" />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-muted/50" />
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Interview History</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {total > 0 ? `${total} interview${total !== 1 ? 's' : ''} total` : 'No interviews yet'}
          </p>
        </div>
        <Button asChild className="gap-1.5">
          <Link href="/dashboard/interviews/new">
            <Plus className="h-4 w-4" />
            New Interview
          </Link>
        </Button>
      </div>

      {/* Empty state */}
      {interviews.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <History className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mt-5 text-lg font-semibold">No interviews yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">Start your first practice session and build your interview skills.</p>
          <Button asChild className="mt-6 gap-1.5">
            <Link href="/dashboard/interviews/new">
              <Plus className="h-4 w-4" />
              Start your first interview
            </Link>
          </Button>
        </div>
      )}

      {/* Interview list */}
      <div className="space-y-3">
        {interviews.map((i) => {
          const s = STATUS_MAP[i.status] ?? ({ label: i.status, className: 'bg-muted text-muted-foreground border-border' } as const);
          const TypeIcon = TYPE_ICON[i.type] ?? Mic;
          return (
            <Link
              key={i.id}
              href={`/dashboard/interviews/${i.id}`}
              className="group block rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-md"
            >
              <div className="flex items-center gap-5">
                {/* Type icon */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/5 transition-colors group-hover:bg-primary/10">
                  <TypeIcon className="h-5 w-5 text-primary" />
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold capitalize">
                      {i.type?.toLowerCase() ?? 'Unknown'}
                    </span>
                    <span className="text-sm text-muted-foreground">·</span>
                    <span className="text-sm text-muted-foreground truncate">
                      {i.targetRole || 'General'}
                    </span>
                    <span className="text-sm text-muted-foreground">·</span>
                    <span className="text-sm capitalize text-muted-foreground">
                      {(i.experienceLevel ?? 'mid').toLowerCase()}
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(i.createdAt)}
                    </span>
                    {i.durationSeconds != null && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDuration(i.durationSeconds)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Score */}
                {i.feedback?.overallScore != null && (
                  <div className="flex items-center gap-1.5 text-sm">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-bold tabular-nums">{i.feedback.overallScore}</span>
                    <span className="text-muted-foreground">/100</span>
                  </div>
                )}

                {/* Status badge */}
                <span className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium ${s.className}`}>
                  {s.label}
                </span>

                {/* Arrow */}
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/40 transition-colors group-hover:text-primary" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
