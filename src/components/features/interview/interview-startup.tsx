'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, FileText, User, Sparkles, Wifi, Loader2 } from 'lucide-react';

const STEPS = [
  { icon: User, label: 'Loading your profile…' },
  { icon: FileText, label: 'Reviewing interview context…' },
  { icon: Sparkles, label: 'Preparing AI interviewer…' },
  { icon: Wifi, label: 'Connecting voice provider…' },
  { icon: Mic, label: 'Warming up microphone…' },
];

interface StartupProps {
  candidateName: string;
  interviewType: string;
  onComplete: () => void;
}

export function InterviewStartup({ candidateName, interviewType, onComplete }: StartupProps) {
  const [step, setStep] = useState(0);
  const name = candidateName || 'there';

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((s) => {
        if (s >= STEPS.length) { clearInterval(interval); return s; }
        return s + 1;
      });
    }, 800);

    const complete = setTimeout(onComplete, STEPS.length * 800 + 500);
    return () => { clearInterval(interval); clearTimeout(complete); };
  }, [onComplete]);

  return (
    <div className="flex h-full flex-col items-center justify-center bg-background px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-sm text-center"
      >
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10"
        >
          <Mic className="h-10 w-10 text-primary" />
        </motion.div>

        <h2 className="text-xl font-semibold">
          Hello{name !== 'there' ? `, ${name}` : ''}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Setting up your {interviewType?.toLowerCase() ?? 'behavioral'} interview
        </p>

        <div className="mt-10 space-y-2">
          {STEPS.map(({ icon: Icon, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, x: -8 }}
              animate={{
                opacity: i <= step ? 1 : 0.3,
                x: i <= step ? 0 : -8,
              }}
              className="flex items-center gap-3 text-sm"
            >
              {i < step ? (
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                </div>
              ) : i === step ? (
                <Loader2 className="h-5 w-5 shrink-0 animate-spin text-primary" />
              ) : (
                <Icon className="h-5 w-5 shrink-0 text-muted-foreground/30" />
              )}
              <span className={i <= step ? 'text-muted-foreground' : 'text-muted-foreground/30'}>
                {label}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
