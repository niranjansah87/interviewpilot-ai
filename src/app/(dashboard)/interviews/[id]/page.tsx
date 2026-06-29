'use client';

/**
 * Interview Session Page — the actual voice interview screen.
 */
import { use } from 'react';
import { VoiceInterface } from '@/components/features/interview/voice-interface';
import { useInterviewSession } from '@/hooks/use-interview-session';

export default function InterviewSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  // Ownership validated server-side: GET /api/v1/interviews/[id]
  // returns 403 if session.userId !== authenticated user
  const session = useInterviewSession(id);

  return (
    <div className="-m-6 flex h-[calc(100vh-3.5rem)] flex-col">
      <VoiceInterface
        state={session.state}
        connectionStatus={session.connectionStatus}
        micPermission={session.micPermission}
        transcription={session.transcription}
        currentPartial={session.currentPartial}
        speaker={session.speaker}
        aiSpeaking={session.aiSpeaking}
        error={session.error}
        durationSeconds={session.durationSeconds}
        onStart={session.startInterview}
        onEnd={session.endInterview}
        onReconnect={session.handleReconnect}
        onRequestMic={session.requestMic}
      />
    </div>
  );
}
