'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Sparkles, FileText, Star, Loader2 } from 'lucide-react';

interface WrapUpProps {
  candidateName: string;
  interviewType: string;
  interviewId: string;
  onComplete: () => void;
}

const CLOSING_MESSAGES = [
  'Preparing your detailed feedback report…',
  'Analyzing your communication patterns…',
  'Evaluating technical depth and clarity…',
  'Identifying your key strengths…',
  'Mapping your improvement areas…',
  'Finalizing your personalized action plan…',
];

export function InterviewWrapUp({ candidateName, interviewType, interviewId, onComplete }: WrapUpProps) {
  const [step, setStep] = useState(0);
  const [showContent, setShowContent] = useState(false);
  const name = candidateName || 'there';

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 600);

    // Progress through steps
    const interval = setInterval(() => {
      setStep((s) => {
        if (s >= CLOSING_MESSAGES.length - 1) {
          clearInterval(interval);
          return s;
        }
        return s + 1;
      });
    }, 3000);

    // Auto-complete after ~20 seconds
    const complete = setTimeout(() => onComplete(), 20000);

    return () => {
      clearInterval(interval);
      clearTimeout(complete);
    };
  }, [onComplete]);

  return (
    <div className="flex h-full flex-col items-center justify-center px-8">
      <AnimatePresence>
        {showContent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="max-w-lg text-center"
          >
            {/* Animated sparkle icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.3 }}
              className="mx-auto mb-8"
            >
              <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
                {/* Rotating dashed ring */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
                  className="absolute inset-0"
                >
                  <svg width="80" height="80" viewBox="0 0 80 80" className="text-primary/30">
                    <circle cx="40" cy="40" r="36" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="6 4" />
                  </svg>
                </motion.div>
                {/* Pulsing sparkle icon */}
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                  className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10"
                >
                  <Sparkles className="h-7 w-7 text-primary" />
                </motion.div>
              </div>
            </motion.div>

            {/* Main message */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
            >
              <h2 className="text-2xl font-semibold tracking-tight">
                Thank you, {name}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {interviewType === 'BEHAVIORAL'
                  ? 'I enjoyed learning about your experiences and how you approach workplace situations. Your examples were thoughtful and demonstrated strong self-awareness.'
                  : interviewType === 'TECHNICAL'
                  ? 'You demonstrated solid technical knowledge and explained your reasoning clearly. I appreciated how you worked through problems step by step.'
                  : 'I enjoyed our conversation today. Your responses showed both technical depth and strong communication skills.'}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                I&apos;m now preparing your comprehensive feedback report with detailed scores, specific strengths, and an actionable improvement plan.
              </p>
            </motion.div>

            {/* Progress steps */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.5, duration: 0.8 }}
              className="mt-10 space-y-2"
            >
              {CLOSING_MESSAGES.map((msg, i) => (
                <motion.div
                  key={msg}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{
                    opacity: i <= step ? 1 : 0,
                    x: i <= step ? 0 : -10,
                  }}
                  transition={{ duration: 0.5 }}
                  className="flex items-center gap-3 text-sm"
                >
                  {i < step ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20"
                    >
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }}
                        className="h-2 w-2 rounded-full bg-emerald-500" />
                    </motion.div>
                  ) : i === step ? (
                    <Loader2 className="h-5 w-5 shrink-0 animate-spin text-primary" />
                  ) : (
                    <div className="h-5 w-5 shrink-0 rounded-full border border-border" />
                  )}
                  <span className={i <= step ? 'text-muted-foreground' : 'text-muted-foreground/30'}>
                    {msg}
                  </span>
                </motion.div>
              ))}
            </motion.div>

            {/* Skip button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 5, duration: 0.5 }}
              className="mt-10"
            >
              <button
                onClick={onComplete}
                className="flex items-center gap-2 mx-auto text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <FileText className="h-4 w-4" />
                View my report now
                <Star className="h-3 w-3" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
