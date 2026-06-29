'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Mic, BarChart3, Zap, Shield, Sparkles, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRef } from 'react';

const features = [
  { icon: Mic, title: 'Real Voice Interviews', desc: 'Speak naturally. Our AI listens, adapts, and responds — just like a human interviewer.' },
  { icon: Zap, title: 'Adaptive Intelligence', desc: 'Questions evolve based on your answers. No two interviews are ever the same.' },
  { icon: BarChart3, title: 'Deep Feedback', desc: 'Get scored on communication, confidence, and technical depth with specific improvements.' },
  { icon: Shield, title: 'Private & Secure', desc: 'End-to-end encrypted. Your practice data stays private and accessible only to you.' },
];

const steps = [
  { step: '01', title: 'Configure', desc: 'Choose interview type, role, and experience level in seconds.' },
  { step: '02', title: 'Speak', desc: 'Answer questions naturally. The AI challenges, probes, and adapts in real time.' },
  { step: '03', title: 'Improve', desc: 'Get a detailed report with strengths, weaknesses, and a personalized improvement plan.' },
];

export default function LandingPage() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);

  return (
    <div className="min-h-screen bg-background" ref={ref}>
      {/* ---- Header ---- */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo_dark.png" alt="InterviewPilot AI" width={32} height={32} className="hidden dark:block" />
            <Image src="/logo_light.png" alt="InterviewPilot AI" width={32} height={32} className="block dark:hidden" />
            <span className="text-sm font-semibold tracking-tight">InterviewPilot</span>
          </Link>
          <nav className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Sign in</Link>
            <Button asChild size="sm" className="gap-1.5">
              <Link href="/register">Get started <ChevronRight className="h-3.5 w-3.5" /></Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* ---- Hero ---- */}
      <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-32">
        {/* Background effects */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-1/4 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute left-1/4 top-1/2 h-[400px] w-[400px] rounded-full bg-violet-500/5 blur-3xl" />
          <motion.div
            style={{ y }}
            className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,hsl(var(--primary)/0.06),transparent_60%)]"
          />
        </div>

        <div className="mx-auto max-w-5xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              AI-Powered Voice Interviews
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-8 text-balance text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl"
          >
            Practice interviews with
            <br />
            <span className="bg-gradient-to-r from-primary via-violet-500 to-primary bg-clip-text text-transparent">
              AI that listens
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground"
          >
            Speak naturally. Get challenged with real follow-up questions.
            Receive detailed feedback after every session. No scripted question lists.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          >
            <Button asChild size="lg" className="gap-2 px-8 py-6 text-base">
              <Link href="/register">Start practicing free <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="px-8 py-6 text-base">
              <Link href="/login">Sign in</Link>
            </Button>
          </motion.div>

          {/* Social proof */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 text-sm text-muted-foreground"
          >
            Trusted by engineers preparing for roles at top tech companies
          </motion.p>
        </div>
      </section>

      {/* ---- Features Grid ---- */}
      <section className="border-t border-border/50 px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Why InterviewPilot?
            </h2>
            <p className="mt-4 text-muted-foreground">
              Everything you need to practice, improve, and ace your interviews
            </p>
          </motion.div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.01 }}
                className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-8 backdrop-blur-sm transition-shadow hover:shadow-lg"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/15">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- How It Works ---- */}
      <section className="border-t border-border/50 bg-muted/20 px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              How it works
            </h2>
          </motion.div>

          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {steps.map(({ step, title, desc }, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                  <span className="text-lg font-bold text-primary">{step}</span>
                </div>
                <h3 className="mt-5 font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- CTA ---- */}
      <section className="border-t border-border/50 px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-3xl text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to ace your next interview?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Start practicing with an AI interviewer that adapts, challenges, and helps you improve.
          </p>
          <Button asChild size="lg" className="mt-8 gap-2 px-8 py-6 text-base">
            <Link href="/register">Start free <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </motion.div>
      </section>

      {/* ---- Footer ---- */}
      <footer className="border-t border-border/50 px-6 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <Image src="/logo_dark.png" alt="" width={20} height={20} className="hidden dark:block" />
            <Image src="/logo_light.png" alt="" width={20} height={20} className="block dark:hidden" />
            <span>&copy; {new Date().getFullYear()} InterviewPilot AI</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="transition-colors hover:text-foreground">Privacy</a>
            <a href="#" className="transition-colors hover:text-foreground">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
