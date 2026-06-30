'use client';

import { use, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Link from 'next/link';
import { VoiceInterface } from '@/components/features/interview/voice-interface';
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
  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(false);
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
      .then(({ data }) => setInterview(data))
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
    interview.status === 'FAILED' ? 'destructive' : 'outline';

  const canStart = interview.status === 'CREATED' || interview.status === 'READY';

  if (active) {
    return (
      <div className="-m-6 flex h-[calc(100vh-3.5rem)] flex-col">
        <div className="flex items-center justify-between border-b border-border px-6 py-3">
          <div>
            <span className="text-sm font-medium">{interview.type?.charAt(0) + interview.type?.slice(1).toLowerCase()} Interview</span>
            <span className="mx-2 text-muted-foreground">·</span>
            <span className="text-sm text-muted-foreground">{interview.targetRole || 'General'}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setActive(false)}>End</Button>
        </div>
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
          onEnd={voiceSession.endInterview}
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
        <Badge variant={statusVariant as never}>{interview.status}</Badge>
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
