'use client';

/**
 * Voice Interface — the primary UI for the interview session.
 * Shows mic state, waveform, transcript, timer, and controls.
 */

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Phone, AlertTriangle, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/cn';
import type { ConversationState } from '@/lib/conversation/engine';
import type { TranscriptionEntry } from '@/hooks/use-interview-session';

interface VoiceInterfaceProps {
  state: ConversationState;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'reconnecting';
  micPermission: 'prompt' | 'granted' | 'denied' | 'unavailable';
  transcription: TranscriptionEntry[];
  currentPartial: string;
  speaker: 'interviewer' | 'candidate' | null;
  aiSpeaking: boolean;
  error: string | null;
  durationSeconds: number;
  onStart: () => void;
  onEnd: () => void;
  onReconnect: () => void;
  onRequestMic: () => Promise<MediaStream | null>;
}

export function VoiceInterface({
  state,
  connectionStatus,
  micPermission,
  transcription,
  currentPartial,
  speaker,
  aiSpeaking,
  error,
  durationSeconds,
  onStart,
  onEnd,
  onReconnect,
  onRequestMic,
}: VoiceInterfaceProps) {
  const transcriptRef = useRef<HTMLDivElement>(null);

  // Auto-scroll transcript
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [transcription, currentPartial]);

  const isConnected = connectionStatus === 'connected';
  const isConnecting = connectionStatus === 'connecting' || connectionStatus === 'reconnecting';
  const isIdle = state === 'idle';

  // Format duration
  const mins = Math.floor(durationSeconds / 60);
  const secs = durationSeconds % 60;
  const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  return (
    <div className="flex h-full flex-col">
      {/* ---- Status Bar ---- */}
      <div className="flex items-center justify-between border-b border-border px-6 py-3">
        <div className="flex items-center gap-2">
          {isConnected ? (
            <span className="flex items-center gap-1.5 text-sm text-emerald-500">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Connected
            </span>
          ) : isConnecting ? (
            <span className="flex items-center gap-1.5 text-sm text-amber-500">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              {connectionStatus === 'reconnecting' ? 'Reconnecting...' : 'Connecting...'}
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <WifiOff className="h-3 w-3" />
              Disconnected
            </span>
          )}
        </div>
        <span className="text-sm tabular-nums text-muted-foreground">{timeStr}</span>
      </div>

      {/* ---- Main Area ---- */}
      <div className="flex flex-1 flex-col items-center justify-center p-8">
        {/* Idle state — start button */}
        {isIdle && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="mb-6 flex items-center justify-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
                <Mic className="h-10 w-10 text-primary" />
              </div>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Ready to interview?</h2>
            <p className="mt-2 text-muted-foreground">
              {micPermission === 'denied'
                ? 'Microphone access is required. Please enable it in your browser settings.'
                : 'Click below and grant microphone access to begin.'}
            </p>
            <div className="mt-6">
              {micPermission === 'prompt' ? (
                <Button size="lg" onClick={onStart} className="gap-2">
                  <Mic className="h-5 w-5" /> Start Interview
                </Button>
              ) : micPermission === 'denied' ? (
                <Button size="lg" variant="outline" onClick={() => onRequestMic()}>
                  Retry Microphone Access
                </Button>
              ) : (
                <Button size="lg" onClick={onStart} className="gap-2">
                  <Mic className="h-5 w-5" /> Start Interview
                </Button>
              )}
            </div>
          </motion.div>
        )}

        {/* Connected state — mic & waveform */}
        {isConnected && (
          <div className="flex w-full max-w-2xl flex-1 flex-col">
            {/* Mic status indicator */}
            <div className="mb-8 flex flex-col items-center">
              <motion.div
                animate={{
                  scale: speaker === 'candidate' ? [1, 1.15, 1] : 1,
                  opacity: aiSpeaking ? 0.5 : 1,
                }}
                transition={{ repeat: speaker === 'candidate' ? Infinity : 0, duration: 1.5 }}
                className={cn(
                  'flex h-20 w-20 items-center justify-center rounded-full transition-colors',
                  speaker === 'candidate'
                    ? 'bg-primary/20'
                    : aiSpeaking
                      ? 'bg-muted'
                      : 'bg-muted/50',
                )}
              >
                {speaker === 'candidate' ? (
                  <Mic className="h-8 w-8 text-primary" />
                ) : aiSpeaking ? (
                  <span className="text-muted-foreground text-xs">AI</span>
                ) : (
                  <Mic className="h-8 w-8 text-muted-foreground" />
                )}
              </motion.div>
              <p className="mt-3 text-sm text-muted-foreground">
                {speaker === 'candidate'
                  ? 'Listening...'
                  : aiSpeaking
                    ? 'AI speaking...'
                    : 'Waiting...'}
              </p>
            </div>

            {/* Transcript panel */}
            <div
              ref={transcriptRef}
              className="flex-1 space-y-4 overflow-y-auto rounded-lg border border-border bg-muted/30 p-4"
              style={{ maxHeight: '50vh' }}
            >
              <AnimatePresence>
                {transcription.map((entry) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      'max-w-[85%] rounded-lg px-4 py-3 text-sm',
                      entry.role === 'interviewer'
                        ? 'bg-muted mr-auto'
                        : 'bg-primary/10 ml-auto',
                    )}
                  >
                    <p className="mb-1 text-xs font-medium text-muted-foreground">
                      {entry.role === 'interviewer' ? 'Interviewer' : 'You'}
                    </p>
                    <p>{entry.text}</p>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Partial transcript (streaming) */}
              {currentPartial && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="max-w-[85%] mr-auto rounded-lg bg-muted px-4 py-3 text-sm italic"
                >
                  <p className="mb-1 text-xs font-medium text-muted-foreground">Interviewer</p>
                  <p>{currentPartial}</p>
                </motion.div>
              )}
            </div>

            {/* End interview button */}
            <div className="mt-4 flex justify-center">
              <Button
                variant="destructive"
                size="lg"
                onClick={onEnd}
                className="gap-2 rounded-full"
              >
                <Phone className="h-5 w-5 rotate-[135deg]" /> End Interview
              </Button>
            </div>
          </div>
        )}

        {/* Connecting state */}
        {isConnecting && (
          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <span className="h-3 w-3 animate-pulse rounded-full bg-amber-500" />
              <span className="h-3 w-3 animate-pulse rounded-full bg-amber-500" style={{ animationDelay: '0.2s' }} />
              <span className="h-3 w-3 animate-pulse rounded-full bg-amber-500" style={{ animationDelay: '0.4s' }} />
            </div>
            <p className="mt-4 text-muted-foreground">
              {connectionStatus === 'reconnecting'
                ? 'Reconnecting to the AI interviewer...'
                : 'Connecting to the AI interviewer...'}
            </p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <Card className="mx-4 mt-4 border-destructive/50 bg-destructive/5 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 shrink-0 text-destructive" />
              <div>
                <p className="text-sm font-medium text-destructive">Connection Issue</p>
                <p className="mt-1 text-sm text-muted-foreground">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={onReconnect}
                >
                  Retry Connection
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
