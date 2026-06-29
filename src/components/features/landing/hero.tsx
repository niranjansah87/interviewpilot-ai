'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Mic } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 py-24 sm:py-32 lg:px-8">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_35%,hsl(var(--primary)/0.08),transparent)]" />

      <div className="mx-auto max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
            <Mic className="mr-1.5 h-3.5 w-3.5" />
            AI-Powered Voice Interviews
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-8 text-balance text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl"
        >
          Practice interviews with an AI that{' '}
          <span className="text-primary">actually listens</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground"
        >
          Speak naturally. Get challenged. Receive detailed feedback.
          InterviewPilot simulates real interviews — not scripted question lists.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
        >
          <Button asChild size="lg" className="gap-2">
            <Link href="/register">
              Start practicing free <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/login">Sign in</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
