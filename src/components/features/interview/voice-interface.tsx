'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Mic, MicOff, Phone, Clock, MessageSquare, X } from 'lucide-react';
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
  onToggleMute?: () => void;
  isMuted?: boolean;
  candidateName?: string;
}

const THINKING = [
  'Analyzing your response…',
  'Reviewing your experience…',
  'Preparing a follow-up…',
  'Evaluating technical depth…',
  'Considering trade-offs…',
  'Formulating next question…',
];

export function VoiceInterface({
  state, connectionStatus, micPermission, transcription, currentPartial,
  speaker, aiSpeaking, error, durationSeconds,
  onStart, onEnd, onReconnect, onRequestMic, onStartDemo, onToggleMute, isMuted, candidateName,
}: VoiceInterfaceProps) {
  const transcriptRef = useRef<HTMLDivElement>(null);
  const analyzer = useAudioAnalyzer();
  const [transcriptOpen, setTranscriptOpen] = useState(true);
  const muted = isMuted ?? false;
  const [thinkIdx, setThinkIdx] = useState(0);

  useEffect(() => {
    if (!aiSpeaking && speaker !== 'candidate' && connectionStatus === 'connected') {
      const i = setInterval(() => setThinkIdx(n => (n + 1) % THINKING.length), 3000);
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
  const micLevel = analyzer.micLevel;
  const micActive = analyzer.micActive;
  const hasTranscript = transcription.length > 0 || currentPartial.length > 0;

  // ── Idle / Pre-Start ──
  if (!isConnected && !isConnecting && !error) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <motion.div animate={{ scale: [1, 1.04, 1] }} transition={{ repeat: Infinity, duration: 3 }}
            className="mx-auto mb-10 flex h-32 w-32 items-center justify-center rounded-full bg-white/[0.03] ring-1 ring-white/[0.06]">
            <Mic className="h-14 w-14 text-white/20" />
          </motion.div>
          <h2 className="text-2xl font-light tracking-wide text-white/80">Ready to begin</h2>
          <p className="mt-3 text-sm text-white/30 max-w-xs mx-auto">
            {micPermission === 'denied' ? 'Microphone access is required.' : 'Grant microphone access to start your interview.'}
          </p>
          <div className="mt-8 flex gap-3 justify-center">
            <Button size="lg" onClick={onStart} className="gap-2 rounded-xl bg-white text-black hover:bg-white/90 px-8 h-12 text-base">
              <Mic className="h-4 w-4" /> Start Interview
            </Button>
            {onStartDemo && (
              <Button size="lg" variant="ghost" onClick={onStartDemo} className="rounded-xl text-white/40 hover:text-white/80 h-12">
                Try Demo
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Connecting ──
  if (isConnecting) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-center"
        >
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center">
            <div className="flex gap-1.5">
              {[0, 1, 2].map(i => (
                <motion.div key={i}
                  animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
                  className="h-2.5 w-2.5 rounded-full bg-white/40"
                />
              ))}
            </div>
          </div>
          <p className="text-sm text-white/30">Establishing connection…</p>
        </motion.div>
      </div>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-8 text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
          <MicOff className="h-8 w-8 text-red-400" />
        </div>
        <p className="text-sm text-red-400 max-w-md">{error}</p>
        <div className="mt-6 flex gap-3">
          <Button variant="outline" size="sm" onClick={onReconnect} className="border-white/10 text-white/60 hover:text-white">Retry</Button>
          {onStartDemo && <Button variant="ghost" size="sm" onClick={onStartDemo} className="text-white/30">Demo Mode</Button>}
        </div>
      </div>
    );
  }

  // ── Connected — Immersive Voice Experience ──
  return (
    <div className="relative flex h-full flex-col bg-[#0a0a0b]">
      {/* Subtle background gradient */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.04),transparent_70%)]" />

      {/* Top bar — minimal Zoom-style */}
      <div className="relative z-10 flex items-center justify-center px-6 py-3">
        <div className="flex items-center gap-6">
          <span className={cn('flex items-center gap-2 text-xs', aiSpeaking ? 'text-blue-400' : micActive ? 'text-emerald-400' : 'text-white/20')}>
            <span className={cn('h-2 w-2 rounded-full', aiSpeaking || micActive ? 'animate-pulse' : '')}
              style={{ backgroundColor: aiSpeaking ? '#60a5fa' : micActive ? '#34d399' : 'currentColor' }} />
            {aiSpeaking ? 'AI Speaking' : micActive ? 'Listening' : 'Connected'}
          </span>
          <span className="text-xs tabular-nums text-white/15">
            <Clock className="mr-1 inline h-3 w-3" />{String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Center Stage — Avatars only, never move */}
      <div className="relative z-10 flex flex-1 items-center justify-center">
        <div className="flex items-center gap-24">
          {/* AI Avatar */}
          <div className="flex flex-col items-center gap-4">
            <motion.div
              animate={aiSpeaking ? { scale: [1, 1.04, 1] } : {}}
              transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
              className={cn(
                'relative flex h-24 w-24 items-center justify-center rounded-full transition-all duration-700',
                aiSpeaking
                  ? 'bg-blue-500/10 ring-2 ring-blue-500/20 shadow-[0_0_40px_rgba(59,130,246,0.1)]'
                  : 'bg-white/[0.02] ring-1 ring-white/[0.04]',
              )}
            >
{/* Static outer rings */}
              <div className="absolute -inset-3 rounded-full ring-2 ring-white/[0.25]" />
              <div className="absolute -inset-5 rounded-full ring-1 ring-white/[0.15]" />
              {aiSpeaking && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
                  className="absolute -inset-3"
                >
                  <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
                    <circle cx="60" cy="60" r="56" stroke="#60a5fa" strokeWidth="2" strokeDasharray="12 8" opacity="0.4" />
                  </svg>
                </motion.div>
              )}
              {/* Breathing ring */}
              {aiSpeaking && (
                <motion.div
                  animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0, 0.2] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 rounded-full bg-blue-500/10"
                />
              )}
              {/* AI avatar image */}
              <Image src="/ai-interviewer.webp" alt="AI Interviewer" width={96} height={96}
                className="h-full w-full rounded-full object-cover" />
            </motion.div>
            <span className="text-sm font-bold tracking-wide text-white/60">Interviewer</span>
            {/* AI waveform */}
            <div className="flex h-5 items-end justify-center gap-[2px]">
              {Array.from({ length: 16 }).map((_, i) => {
                const freq = analyzer.speakerFrequencies[i * 4] ?? 0;
                const h = aiSpeaking ? Math.max(1.5, (freq / 255) * 100) : 1.5;
                return (
                  <motion.div key={i} className="w-[2px] rounded-full bg-blue-400/40"
                    animate={{ height: `${h}%` }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }} />
                );
              })}
            </div>
          </div>

          {/* Center state indicator */}
          <div className="flex w-32 flex-col items-center gap-1">
            {aiSpeaking ? (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-base font-bold text-blue-300/90">Speaking</motion.span>
            ) : micActive ? (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-base font-bold text-emerald-300/90">Listening</motion.span>
            ) : (
              <motion.span
                key={thinkIdx}
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs font-light text-white/20 text-center">
                {THINKING[thinkIdx]}
              </motion.span>
            )}
          </div>

          {/* Candidate Avatar */}
          <div className="flex flex-col items-center gap-4">
            <motion.div
              animate={micActive ? { scale: 1 + micLevel * 0.15 } : { scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className={cn(
                'relative flex h-24 w-24 items-center justify-center rounded-full transition-all duration-300',
                micActive
                  ? 'bg-emerald-500/10 ring-2 ring-emerald-500/20 shadow-[0_0_40px_rgba(52,211,153,0.1)]'
                  : 'bg-white/[0.02] ring-1 ring-white/[0.04]',
              )}
            >
              {micActive && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
                  className="absolute -inset-3"
                >
                  <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
                    <circle cx="60" cy="60" r="56" stroke="#34d399" strokeWidth="2" strokeDasharray="10 6" opacity="0.5" />
                  </svg>
                </motion.div>
              )}
{/* Static outer rings */}
              <div className="absolute -inset-3 rounded-full ring-2 ring-emerald-500/[0.25]" />
              <div className="absolute -inset-5 rounded-full ring-1 ring-emerald-500/[0.15]" />
              {micActive && (
                <motion.div
                  animate={{ scale: [1, 1.25, 1], opacity: [0.15, 0, 0.15] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="absolute inset-0 rounded-full bg-emerald-500/10"
                />
              )}
              {/* Candidate avatar image */}
              <Image src="/illustrations/candidate-avatar.svg" alt="Candidate" width={96} height={96}
                className="h-full w-full rounded-full object-cover" />
            </motion.div>
            <span className="text-sm font-bold tracking-wide text-white/60">{candidateName || 'You'}</span>
            {/* Mic waveform */}
            <div className="flex h-5 items-end justify-center gap-[2px]">
              {Array.from({ length: 16 }).map((_, i) => {
                const freq = analyzer.micFrequencies[i * 4] ?? 0;
                const h = micActive ? Math.max(1.5, (freq / 255) * 100) : 1.5;
                return (
                  <motion.div key={i} className="w-[2px] rounded-full bg-emerald-400/40"
                    animate={{ height: `${h}%` }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }} />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Floating bottom controls — Zoom-style */}
      <div className="relative z-20 flex items-center justify-center pb-6">
        <div className="flex items-center gap-3 rounded-2xl bg-white/[0.04] backdrop-blur-xl px-5 py-3 ring-1 ring-white/[0.06]">
          <button
            onClick={() => onToggleMute?.()}
            className={cn('flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300',
              muted ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30')}
            title={muted ? 'Unmute (M)' : 'Mute (M)'}>
            <motion.div
              animate={muted ? { rotate: [0, -10, 10, 0] } : { scale: [1, 1.1, 1] }}
              transition={{ duration: 0.3 }}
              key={String(muted)}>
              {muted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </motion.div>
          </button>
          <button
            onClick={() => setTranscriptOpen(!transcriptOpen)}
            className={cn('flex h-11 w-11 items-center justify-center rounded-full transition-all',
              transcriptOpen ? 'bg-primary/20 text-primary' : 'bg-white/[0.06] text-white/30 hover:bg-white/[0.10]')}
            title="Transcript (T)">
            <MessageSquare className="h-5 w-5" />
          </button>
          <button onClick={onEnd} className="flex h-11 w-11 items-center justify-center rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all" title="End (Esc)">
            <Phone className="h-5 w-5 rotate-[135deg]" />
          </button>
        </div>
      </div>

      {/* Transcript — right side overlay panel */}
      <AnimatePresence>
        {transcriptOpen && (
          <motion.div
            initial={{ x: 340, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 340, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute right-0 top-0 z-30 h-full w-[340px] border-l border-white/[0.06] bg-[#0a0a0b]/95 backdrop-blur-xl"
          >
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-white/[0.04] px-5 py-3.5">
                <span className="text-sm font-medium text-white/60">Transcript</span>
                <button onClick={() => setTranscriptOpen(false)} className="rounded-lg p-1 text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-all">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div ref={transcriptRef} className="flex-1 space-y-3 overflow-y-auto p-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {!hasTranscript && (
                  <p className="py-12 text-center text-sm text-white/10">
                    {aiSpeaking ? 'Interviewer is speaking…' : 'Speak to begin the conversation'}
                  </p>
                )}
                {transcription.map((entry) => (
                  <motion.div key={entry.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                    <div className={cn(
                      'rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                      entry.role === 'candidate'
                        ? 'rounded-tr-md bg-primary/25 text-white font-medium ml-6'
                        : 'rounded-tl-md bg-white/[0.06] text-white/85 mr-6',
                    )}>
                      <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">
                        {entry.role === 'candidate' ? (candidateName || 'You') : 'Interviewer'}
                      </span>
                      <p className="mt-0.5">{entry.text}</p>
                    </div>
                  </motion.div>
                ))}
                {currentPartial && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="rounded-2xl rounded-tl-md bg-white/[0.04] px-4 py-2.5 text-sm text-white/40 mr-6">{currentPartial}</div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
