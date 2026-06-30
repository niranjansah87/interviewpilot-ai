'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Link from 'next/link';
import { VoiceInterface } from '@/components/features/interview/voice-interface';
import { InterviewWrapUp } from '@/components/features/interview/interview-wrapup';
import { useInterviewSession } from '@/hooks/use-interview-session';

interface Interview {
  id: string;
  type: string;
  targetRole: string;
  experienceLevel: string;
  status: string;
  createdAt: string;
}

export default function InterviewDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(false);
  const [showingWrapUp, setShowingWrapUp] = useState(false);
  const [hasResume, setHasResume] = useState<boolean | null>(null);
  const [skipResume, setSkipResume] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const voiceSession = useInterviewSession(id);

  useEffect(() => {
    // Check if user has resume
    fetch('/api/v1/users/me/resume', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => setHasResume(!!d?.data?.text))
      .catch(() => setHasResume(false));
  }, []);

  useEffect(() => {
    fetch(`/api/v1/interviews/${id}`, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load interview');
        return res.json();
      })
      .then(({ data }) => {
        console.log('[InterviewDetail] Loaded:', data.id, 'status:', data.status, 'type:', data.type);
        setInterview(data);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="h-4 w-full animate-pulse rounded bg-muted" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Interview Not Found</h1>
        <p className="text-muted-foreground">This interview session does not exist or you don't have access.</p>
        <Button asChild>
          <Link href="/dashboard/interviews">Back to Interviews</Link>
        </Button>
      </div>
    );
  }

  const statusVariant =
    interview.status === 'COMPLETED' ? 'default' :
    interview.status === 'ACTIVE' ? 'secondary' :
    interview.status === 'FAILED' || interview.status === 'CANCELLED' ? 'destructive' :
    interview.status === 'SCHEDULED' ? 'outline' : 'outline';

  const scheduledDate = (interview as any).scheduledAt ? new Date((interview as any).scheduledAt) : null;
  const isPastScheduled = scheduledDate ? new Date() >= scheduledDate : true;
  const daysUntil = scheduledDate && !isPastScheduled
    ? Math.ceil((scheduledDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;
  const hoursUntil = scheduledDate && !isPastScheduled
    ? Math.ceil((scheduledDate.getTime() - Date.now()) / (1000 * 60 * 60))
    : 0;

  const canStart = interview.status === 'CREATED' || interview.status === 'READY'
    || (interview.status === 'SCHEDULED' && isPastScheduled);

  // Wrapped end handler — closes voice + patches DB + generates feedback + updates UI
  const handleEnd = async () => {
    // Show wrap-up IMMEDIATELY — before any async work
    setShowingWrapUp(true);

    // Background cleanup — doesn't block UI
    voiceSession.endInterview();
    try {
      const res = await fetch(`/api/v1/interviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'COMPLETED' }),
      });
      console.log('[handleEnd] PATCH result:', res.status);
      // Auto-generate feedback report
      toast.info('Generating your feedback report...');
      const fbRes = await fetch(`/api/v1/interviews/${id}/report`, {
        method: 'POST',
        credentials: 'include',
      });
      if (fbRes.ok) {
        const fb = await fbRes.json();
        console.log('[handleEnd] Feedback generated:', fb.data?.overallScore);
        toast.success(`Report ready! Score: ${fb.data?.overallScore}/100`);
      } else {
        toast.warning('Report generation queued — check back shortly');
      }
    } catch (err) {
      console.error('[handleEnd] Failed:', err);
    }
    setInterview(prev => prev ? { ...prev, status: 'COMPLETED' } : prev);
    // active stays true until wrap-up completes
  };

  const handleWrapUpComplete = () => {
    setActive(false);
    setShowingWrapUp(false);
    router.push(`/dashboard/interviews/${id}/report`);
  };

  const handleCancel = async () => {
    try {
      await fetch(`/api/v1/interviews/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ status: 'CANCELLED' }),
      });
      toast.success('Interview cancelled');
      setInterview(prev => prev ? { ...prev, status: 'CANCELLED' } : prev);
      setShowCancelDialog(false);
    } catch { toast.error('Failed to cancel'); }
  };

  if (showingWrapUp) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0a0a0b]">
      <InterviewWrapUp
        candidateName=""
        interviewType={interview?.type ?? 'BEHAVIORAL'}
        interviewId={id}
        onComplete={handleWrapUpComplete}
      />
      </div>
    );
  }

  if (active) {
    return (
      // Full-screen immersive overlay — hides dashboard chrome
      <div className="fixed inset-0 z-50 bg-[#0a0a0b]">
        <VoiceInterface
          state={voiceSession.state}
          connectionStatus={voiceSession.connectionStatus}
          micPermission={voiceSession.micPermission}
          transcription={voiceSession.transcription}
          currentPartial={voiceSession.currentPartial}
          speaker={voiceSession.speaker}
          aiSpeaking={voiceSession.aiSpeaking}
          error={voiceSession.error}
          durationSeconds={voiceSession.durationSeconds}
          onStart={voiceSession.startInterview}
          onEnd={handleEnd}
          onReconnect={voiceSession.handleReconnect}
          onRequestMic={voiceSession.requestMic}
          onStartDemo={voiceSession.startDemoMode}
        />
      </div>
    );
  }

  return (
    <>
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Hero */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Interview Session</h1>
          <p className="mt-1 text-sm text-muted-foreground capitalize">
            {interview.type?.toLowerCase()} interview{interview.targetRole ? ` for ${interview.targetRole}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={statusVariant as never} className="text-xs">{interview.status}</Badge>
          {(interview.status === 'CREATED' || interview.status === 'READY') && (
            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setShowCancelDialog(true)}>Cancel</Button>
          )}
        </div>
      </div>

      {/* Resume prompt */}
      {canStart && hasResume === false && !skipResume && (
        <div className="flex items-center gap-4 rounded-2xl border border-amber-200 bg-amber-50/50 px-6 py-5 dark:border-amber-800 dark:bg-amber-950/30">
          <div className="flex-1">
            <div className="font-medium text-amber-800 dark:text-amber-200">Add your resume for personalized questions</div>
            <p className="text-sm text-amber-600 dark:text-amber-400">The AI will reference your actual experience, projects, and skills.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" size="sm" onClick={() => setSkipResume(true)} className="text-amber-700">Skip</Button>
            <Button size="sm" asChild><Link href="/dashboard/profile/resume">Add Resume</Link></Button>
          </div>
        </div>
      )}

      {/* Info cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Type', value: interview.type?.charAt(0).toUpperCase() + interview.type?.slice(1).toLowerCase() },
          { label: 'Role', value: interview.targetRole || 'General' },
          { label: 'Level', value: interview.experienceLevel?.charAt(0).toUpperCase() + interview.experienceLevel?.slice(1).toLowerCase() || 'Mid' },
          { label: 'Created', value: new Date(interview.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-2xl border border-border/40 bg-card p-5">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</div>
            <div className="mt-1 text-lg font-semibold">{value}</div>
          </div>
        ))}
      </div>

      {/* Schedule section */}
      {canStart && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-border/40 bg-card p-5">
            <div className="mb-3 text-sm font-medium">Schedule for later</div>
            <div className="flex items-center gap-3">
              <input type="datetime-local" min={new Date().toISOString().slice(0, 16)}
                className="rounded-xl border border-border/50 bg-background px-4 py-2.5 text-sm"
                onChange={(e) => {
                  if (e.target.value) {
                    fetch(`/api/v1/interviews/${id}`, {
                      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
                      body: JSON.stringify({ status: 'SCHEDULED', scheduledAt: e.target.value }),
                    }).then(() => { setInterview(prev => prev ? { ...prev, status: 'SCHEDULED' } : prev); toast.success('Scheduled'); });
                  }
                }} />
              <span className="text-xs text-muted-foreground">or start now →</span>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl border-2 border-primary/20 bg-primary/[0.03] px-8 py-6">
            <div>
              <div className="text-lg font-semibold">Ready to begin</div>
              <p className="mt-1 text-sm text-muted-foreground">
                Your {interview.type?.toLowerCase()} interview for {interview.targetRole || 'your role'} is configured.
              </p>
            </div>
            <Button size="lg" onClick={() => setActive(true)} className="rounded-xl px-8">Begin Interview</Button>
          </div>
        </div>
      )}

      {/* SCHEDULED state */}
      {interview.status === 'SCHEDULED' && (
        <div className={`rounded-2xl border-2 p-6 ${isPastScheduled ? 'border-primary/20 bg-primary/[0.03]' : 'border-amber-200/50 bg-amber-50/10'}`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold">
                {isPastScheduled ? 'Ready to start' : `${daysUntil > 0 ? `${daysUntil}d` : `${hoursUntil}h`} remaining`}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {scheduledDate ? `Scheduled for ${scheduledDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}` : 'Scheduled'}
              </p>
            </div>
            <div className="flex gap-3">
              <input type="datetime-local" defaultValue={scheduledDate?.toISOString().slice(0, 16)} min={new Date().toISOString().slice(0, 16)}
                className="rounded-xl border border-border/50 bg-background px-4 py-2.5 text-sm"
                onChange={(e) => {
                  if (e.target.value) {
                    fetch(`/api/v1/interviews/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
                      body: JSON.stringify({ scheduledAt: e.target.value }),
                    }).then(() => { toast.success('Rescheduled'); window.location.reload(); });
                  }
                }} />
              {isPastScheduled && <Button size="lg" onClick={() => setActive(true)} className="rounded-xl">Start Now</Button>}
            </div>
          </div>
        </div>
      )}

      {/* Completed actions */}
      {interview.status === 'COMPLETED' && (
        <div className="flex gap-3">
          <Button asChild className="rounded-xl"><Link href={`/dashboard/interviews/${id}/report`}>View Report</Link></Button>
          <Button variant="outline" asChild className="rounded-xl"><Link href={`/dashboard/interviews/${id}/transcript`}>View Transcript</Link></Button>
        </div>
      )}
    </div>

      {/* Cancel Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCancelDialog(false)} />
          <div className="relative z-10 w-full max-w-sm rounded-2xl border border-border/40 bg-card p-6 shadow-2xl">
            <h3 className="text-lg font-semibold">Cancel this interview?</h3>
            <p className="mt-2 text-sm text-muted-foreground">This action cannot be undone. The interview will be marked as cancelled.</p>
            <div className="mt-6 flex gap-3 justify-end">
              <Button variant="outline" size="sm" onClick={() => setShowCancelDialog(false)} className="rounded-lg">Keep it</Button>
              <Button variant="destructive" size="sm" onClick={handleCancel} className="rounded-lg">Yes, cancel</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
