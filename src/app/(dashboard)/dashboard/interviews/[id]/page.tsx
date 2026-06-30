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

  // Cancel handler
  const handleCancel = async () => {
    if (!confirm('Cancel this interview? This cannot be undone.')) return;
    try {
      await fetch(`/api/v1/interviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'CANCELLED' }),
      });
      toast.success('Interview cancelled');
      setInterview(prev => prev ? { ...prev, status: 'CANCELLED' } : prev);
    } catch {
      toast.error('Failed to cancel');
    }
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Interview Session</h1>
        <div className="flex items-center gap-3">
          <Badge variant={statusVariant as never}>{interview.status}</Badge>
          {(interview.status === 'CREATED' || interview.status === 'READY') && (
            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={handleCancel}>
              Cancel
            </Button>
          )}
        </div>
      </div>

      {canStart && hasResume === false && !skipResume && (
        <Card className="rounded-2xl border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
          <CardContent className="flex items-center justify-between py-5">
            <div>
              <CardTitle className="text-base text-amber-700 dark:text-amber-300">Add your resume?</CardTitle>
              <p className="text-sm text-amber-600 dark:text-amber-400">
                Your resume helps the AI ask personalized questions about your experience. It only takes a minute.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" onClick={() => setSkipResume(true)}>Skip</Button>
              <Button size="sm" asChild>
                <Link href="/dashboard/profile/resume">Add Resume</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {canStart && (hasResume || skipResume || hasResume === null) && (
        <>
          {/* Schedule option */}
          <Card className="rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Schedule for later</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <input
                  type="datetime-local"
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  onChange={(e) => {
                    if (e.target.value) {
                      fetch(`/api/v1/interviews/${id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ status: 'SCHEDULED', scheduledAt: e.target.value }),
                      }).then(() => {
                        setInterview(prev => prev ? { ...prev, status: 'SCHEDULED' } : prev);
                        toast.success('Interview scheduled');
                      });
                    }
                  }}
                />
                <span className="text-xs text-muted-foreground">or start now →</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/30 bg-primary/5 rounded-2xl">
            <CardContent className="flex items-center justify-between py-6">
              <div>
                <CardTitle className="text-lg">Ready to begin</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Your&nbsp;
                  {interview.type?.charAt(0) + interview.type?.slice(1).toLowerCase()}
                  &nbsp;interview for&nbsp;
                  {interview.targetRole || 'a general position'}
                  &nbsp;is ready. Click below to start the voice interview.
                </p>
              </div>
              <Button size="lg" onClick={() => setActive(true)}>Begin Interview</Button>
            </CardContent>
          </Card>
        </>
      )}

      {/* Reschedule button for SCHEDULED interviews */}
      {interview.status === 'SCHEDULED' && (
        <Card className={`rounded-2xl ${isPastScheduled ? 'border-primary/30' : 'border-amber-200 dark:border-amber-800'}`}>
          <CardContent className="flex items-center justify-between py-6">
            <div>
              <CardTitle className="text-lg">
                {isPastScheduled ? 'Scheduled — Ready' : `Scheduled — ${daysUntil > 0 ? `${daysUntil} day${daysUntil > 1 ? 's' : ''} left` : `${hoursUntil} hour${hoursUntil > 1 ? 's' : ''} left`}`}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {scheduledDate
                  ? `Scheduled for ${scheduledDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`
                  : 'Scheduled interview'}
                {isPastScheduled ? ' — you can start now.' : ' — interview will be available after this time.'}
              </p>
            </div>
            <div className="flex gap-3">
              <input
                type="datetime-local"
                defaultValue={scheduledDate?.toISOString().slice(0, 16)}
                min={new Date().toISOString().slice(0, 16)}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                onChange={(e) => {
                  if (e.target.value) {
                    fetch(`/api/v1/interviews/${id}`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      credentials: 'include',
                      body: JSON.stringify({ status: 'SCHEDULED', scheduledAt: e.target.value }),
                    }).then(() => {
                      toast.success('Rescheduled');
                      window.location.reload();
                    });
                  }
                }}
              />
              {isPastScheduled && (
                <Button size="lg" onClick={() => setActive(true)}>Start Now</Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Type</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{interview.type.charAt(0) + interview.type.slice(1).toLowerCase()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Target Role</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{interview.targetRole || '—'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Experience Level</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{interview.experienceLevel?.charAt(0).toUpperCase() + interview.experienceLevel?.slice(1).toLowerCase() || '—'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Created</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold">{new Date(interview.createdAt).toLocaleDateString()}</p>
          </CardContent>
        </Card>
      </div>

      {interview.status === 'COMPLETED' && (
        <div className="flex gap-4">
          <Button asChild>
            <Link href={`/dashboard/interviews/${id}/report`}>View Report</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/dashboard/interviews/${id}/transcript`}>View Transcript</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
