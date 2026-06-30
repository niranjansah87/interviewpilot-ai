'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Phone, AlertTriangle, Wifi, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAudioAnalyzer } from '@/hooks/use-audio-analyzer';
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
  onStartDemo?: () => void;
}

const THINKING = [
  'Analyzing your response…',
  'Considering your experience…',
  'Preparing a follow-up…',
  'Evaluating technical depth…',
  'Reviewing your answer…',
  'Formulating the next question…',
];

export function VoiceInterface({
  state, connectionStatus, micPermission, transcription, currentPartial,
  speaker, aiSpeaking, error, durationSeconds,
  onStart, onEnd, onReconnect, onRequestMic, onStartDemo,
}: VoiceInterfaceProps) {
  const transcriptRef = useRef<HTMLDivElement>(null);
  const analyzer = useAudioAnalyzer();
  const [thinkMsg, setThinkMsg] = useState(THINKING[0]!);

  // Rotate thinking messages
  useEffect(() => {
    if (!aiSpeaking && speaker !== 'candidate' && connectionStatus === 'connected') {
      const i = setInterval(() => setThinkMsg(THINKING[Math.floor(Math.random() * THINKING.length)]!), 3000);
      return () => clearInterval(i);
    }
  }, [aiSpeaking, speaker, connectionStatus]);

  useEffect(() => {
    if (transcriptRef.current) transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
  }, [transcription, currentPartial]);

  const isConnected = connectionStatus === 'connected';
  const isConnecting = connectionStatus === 'connecting' || connectionStatus === 'reconnecting';
  const mins = Math.floor(durationSeconds / 60);
  const secs = durationSeconds % 60;
  const isListening = isConnected && speaker === 'candidate' && analyzer.micActive;
  const isAIThinking = isConnected && !aiSpeaking && speaker !== 'candidate';
  const micLevel = analyzer.micLevel;
  const micVad = analyzer.vad;
  const micActive = analyzer.micActive;

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Status Bar */}
      <div className="flex items-center justify-between border-b border-border/50 px-6 py-2.5">
        <div className="flex items-center gap-3">
          {isConnected ? (
            <span className="flex items-center gap-1.5 text-xs font-medium">
              <span className={cn('h-1.5 w-1.5 rounded-full', aiSpeaking ? 'bg-primary animate-pulse' : isListening ? 'bg-emerald-500 animate-pulse' : 'bg-emerald-500')} />
              <span className="text-emerald-600">Connected</span>
            </span>
          ) : isConnecting ? (
            <span className="flex items-center gap-1.5 text-xs font-medium text-amber-500">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />Connecting…
            </span>
          ) : null}
          {isConnected && (
            <span className="text-[11px] text-muted-foreground">
              {aiSpeaking ? '🎤 Interviewer' : isListening ? `🎙 ${micVad === 'loud' ? 'Speaking' : 'Listening'}` : isAIThinking ? '🧠 Thinking' : '⏳ Waiting'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-xs tabular-nums text-muted-foreground">
            <Clock className="h-3 w-3" />{String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </span>
          <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-destructive" onClick={onEnd}>
            <Phone className="h-3 w-3 rotate-[135deg]" /> End
          </Button>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center p-8">
        {/* Idle */}
        {!isConnected && !isConnecting && !error && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <motion.div animate={{ scale: [1, 1.04, 1] }} transition={{ repeat: Infinity, duration: 3 }}
              className="mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-muted/50">
              <Mic className="h-12 w-12 text-muted-foreground/60" />
            </motion.div>
            <h2 className="text-2xl font-semibold">Ready to begin</h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-xs mx-auto">
              {micPermission === 'denied' ? 'Microphone access required.' : 'Grant microphone access to start.'}
            </p>
            <div className="mt-6 flex gap-3 justify-center">
              <Button size="lg" onClick={onStart} className="gap-2 rounded-xl px-8">Start Interview</Button>
              {onStartDemo && <Button size="lg" variant="outline" onClick={onStartDemo} className="rounded-xl">Try Demo</Button>}
            </div>
          </motion.div>
        )}

        {/* Connecting */}
        {isConnecting && (
          <div className="text-center">
            <div className="mx-auto mb-4 flex items-center justify-center">
              <div className="relative flex h-20 w-20 items-center justify-center">
                <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }}
                  className="absolute inset-0 rounded-full bg-primary/10" />
                <Wifi className="h-8 w-8 text-primary animate-pulse" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Establishing secure connection…</p>
          </div>
        )}

        {/* Connected */}
        {isConnected && (
          <div className="flex w-full max-w-2xl flex-1 flex-col">
            {/* Audio Visualization */}
            <div className="mb-6 flex items-center justify-center gap-16">
              {/* AI side */}
              <div className="flex flex-col items-center gap-2">
                <motion.div
                  animate={aiSpeaking ? { scale: [1, 1.03, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className={cn('flex h-20 w-20 items-center justify-center rounded-full transition-all duration-500',
                    aiSpeaking ? 'bg-primary/10 ring-2 ring-primary/20' : 'bg-muted/30')}
                >
                  {aiSpeaking ? (
                    <motion.div className="h-8 w-8 rounded-full bg-primary/30" animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.6 }} />
                  ) : (
                    <span className="text-[10px] text-muted-foreground">AI</span>
                  )}
                </motion.div>
                <span className="text-[10px] text-muted-foreground">Interviewer</span>
                {/* Waveform bars for AI */}
                <div className="flex h-6 items-end justify-center gap-[2px]">
                  {Array.from({ length: 12 }).map((_, i) => {
                    const freq = analyzer.speakerFrequencies[i * 4] ?? 0;
                    const h = aiSpeaking ? Math.max(2, (freq / 255) * 100) : 2;
                    return (
                      <motion.div key={i} className="w-[3px] rounded-full bg-primary/60"
                        animate={{ height: `${h}%` }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} />
                    );
                  })}
                </div>
              </div>

              {/* Center state */}
              <div className="flex flex-col items-center min-w-[100px]">
                {aiSpeaking ? (
                  <span className="text-xs font-medium text-primary">Speaking</span>
                ) : isListening ? (
                  <span className="text-xs font-medium text-emerald-500">
                    {micVad === 'loud' || micVad === 'speaking' ? 'Speaking' : 'Listening'}
                  </span>
                ) : isAIThinking ? (
                  <motion.span key={thinkMsg} initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-muted-foreground text-center">{thinkMsg}</motion.span>
                ) : (
                  <span className="text-xs text-muted-foreground">Waiting</span>
                )}
              </div>

              {/* Candidate side */}
              <div className="flex flex-col items-center gap-2">
                <motion.div
                  animate={micActive ? { scale: 1 + micLevel * 0.15 } : { scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className={cn('flex h-20 w-20 items-center justify-center rounded-full transition-all duration-300',
                    micActive ? 'bg-emerald-500/15 ring-2 ring-emerald-500/25' : 'bg-muted/30')}
                >
                  {micActive ? (
                    <motion.div className="h-8 w-8 rounded-full bg-emerald-500/40"
                      animate={{ scale: [1, 1 + micLevel * 0.5, 1] }} transition={{ repeat: Infinity, duration: 0.5, ease: 'easeInOut' }} />
                  ) : (
                    <Mic className="h-8 w-8 text-muted-foreground/40" />
                  )}
                </motion.div>
                <span className="text-[10px] text-muted-foreground">You</span>
                {/* Waveform bars for mic */}
                <div className="flex h-6 items-end justify-center gap-[2px]">
                  {Array.from({ length: 12 }).map((_, i) => {
                    const freq = analyzer.micFrequencies[i * 4] ?? 0;
                    const h = micActive ? Math.max(2, (freq / 255) * 100) : 2;
                    return (
                      <motion.div key={i} className="w-[3px] rounded-full bg-emerald-500/60"
                        animate={{ height: `${h}%` }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} />
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Transcript */}
            <div ref={transcriptRef} className="flex-1 space-y-3 overflow-y-auto rounded-2xl bg-muted/20 p-4" style={{ maxHeight: '50vh' }}>
              <AnimatePresence>
                {transcription.length === 0 && !currentPartial && (
                  <div className="flex h-full items-center justify-center text-xs text-muted-foreground/40">
                    {aiSpeaking ? 'Interviewer is speaking…' : 'Your conversation will appear here'}
                  </div>
                )}
                {transcription.map((entry) => (
                  <motion.div key={entry.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    className={cn('flex', entry.role === 'candidate' ? 'justify-end' : 'justify-start')}>
                    <div className={cn('max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                      entry.role === 'candidate' ? 'rounded-tr-md bg-primary text-primary-foreground' : 'rounded-tl-md bg-card border border-border/50')}>
                      <span className="text-[10px] font-medium uppercase tracking-wider opacity-50">{entry.role === 'candidate' ? 'You' : 'Interviewer'}</span>
                      <p className="mt-0.5">{entry.text}</p>
                    </div>
                  </motion.div>
                ))}
                {currentPartial && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                    <div className="max-w-[80%] rounded-2xl rounded-tl-md bg-card border border-border/50 px-4 py-2.5 text-sm italic text-muted-foreground">{currentPartial}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center mx-4">
            <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-3" />
            <p className="text-sm text-destructive mb-4">{error}</p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" size="sm" onClick={onReconnect}>Retry Connection</Button>
              {onStartDemo && <Button size="sm" onClick={onStartDemo}>Try Demo Mode</Button>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
