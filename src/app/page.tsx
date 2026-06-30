'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Mic, BarChart3, Zap, Shield, Sparkles, ChevronRight, FileText, MessageSquare, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.1 } }),
};

const features = [
  { icon: Mic, title: 'Real Voice Conversations', desc: 'Speak naturally. AI listens, adapts, and responds with contextual follow-up questions — just like a human interviewer would.' },
  { icon: Zap, title: 'Adaptive Intelligence', desc: 'Questions evolve based on your answers, resume, and target role. Every interview is unique and personalized to you.' },
  { icon: BarChart3, title: 'Detailed Feedback', desc: 'Get scored on communication, confidence, and technical depth with a personalized improvement action plan.' },
  { icon: Shield, title: 'Private & Secure', desc: 'Your practice data stays private. Enterprise-grade security with JWT authentication and HTTP-only cookies.' },
];

const steps = [
  { step: '01', title: 'Configure', desc: 'Choose interview type, target role, and experience level. Upload your resume for personalized questions.' },
  { step: '02', title: 'Speak', desc: 'Answer naturally. The AI challenges, probes, and adapts in real time. Interrupt anytime — like a real conversation.' },
  { step: '03', title: 'Improve', desc: 'Get a detailed report with scores, strengths, and a step-by-step improvement roadmap.' },
];

const techLogos = ['Next.js', 'TypeScript', 'PostgreSQL', 'Prisma', 'Redis', 'OpenAI', 'ElevenLabs'];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* ── Header ── */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border/30 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="group relative flex items-center">
            <Image src="/logo_dark.png" alt="InterviewPilot" width={34} height={34} className="hidden dark:block transition-transform duration-300 group-hover:scale-110" />
            <Image src="/logo_light.png" alt="InterviewPilot" width={34} height={34} className="block dark:hidden transition-transform duration-300 group-hover:scale-110" />
          </Link>
          <nav className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/login" className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">Sign in</Link>
            <Button asChild size="sm" className="gap-1 rounded-lg"><Link href="/register">Get started <ChevronRight className="h-3.5 w-3.5" /></Link></Button>
          </nav>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-1/4 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/[0.03] blur-3xl" />
          <div className="absolute left-1/3 top-1/2 h-[400px] w-[400px] rounded-full bg-violet-500/[0.02] blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl px-6 text-center">
          <motion.div custom={0} variants={fadeIn} initial="hidden" animate="visible">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-primary/[0.04] px-4 py-1.5 text-sm text-primary">
              <Sparkles className="h-3.5 w-3.5" /> AI-Powered Voice Interviews
            </span>
          </motion.div>

          <motion.h1 custom={1} variants={fadeIn} initial="hidden" animate="visible"
            className="mt-8 text-balance text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            Practice interviews with<br />
            <span className="bg-gradient-to-r from-primary via-violet-500 to-primary bg-clip-text text-transparent">AI that listens</span>
          </motion.h1>

          <motion.p custom={2} variants={fadeIn} initial="hidden" animate="visible"
            className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground">
            Speak naturally. Get challenged with real follow-up questions. Receive detailed feedback after every session. No scripted question lists.
          </motion.p>

          <motion.div custom={3} variants={fadeIn} initial="hidden" animate="visible"
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="gap-2 rounded-xl px-8 h-12 text-base"><Link href="/register">Start practicing free <ArrowRight className="h-4 w-4" /></Link></Button>
            <Button asChild variant="outline" size="lg" className="rounded-xl px-8 h-12 text-base"><Link href="/login">Sign in</Link></Button>
          </motion.div>

          <motion.p custom={4} variants={fadeIn} initial="hidden" animate="visible"
            className="mt-8 text-sm text-muted-foreground">
            Trusted by engineers preparing for roles at top tech companies
          </motion.p>

          {/* Product preview */}
          <motion.div custom={5} variants={fadeIn} initial="hidden" animate="visible"
            className="mx-auto mt-16 max-w-3xl overflow-hidden rounded-2xl border border-border/40 bg-card/50 shadow-2xl">
            <div className="flex items-center gap-2 border-b border-border/30 px-4 py-2.5">
              <div className="flex gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-red-400/60" /><div className="h-2.5 w-2.5 rounded-full bg-amber-400/60" /><div className="h-2.5 w-2.5 rounded-full bg-emerald-400/60" /></div>
              <span className="ml-2 text-[10px] text-muted-foreground">Interview Session — Behavioral • Product Manager</span>
            </div>
            <div className="flex items-center justify-center bg-background p-12">
              <div className="flex items-center gap-16">
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10 ring-1 ring-blue-500/20">
                    <span className="text-xs font-medium text-blue-400">AI</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">Interviewer</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <motion.div animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ repeat: Infinity, duration: 2 }}
                    className="text-xs text-muted-foreground">Speaking…</motion.div>
                  <div className="flex h-6 items-end gap-[2px]">
                    {[0.4, 0.8, 0.3, 0.9, 0.5, 1, 0.4, 0.7, 0.3, 0.6].map((h, i) => (
                      <motion.div key={i} className="w-[3px] rounded-full bg-primary/40"
                        animate={{ height: `${h * 100}%` }} transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.06 }} />
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/20">
                    <Mic className="h-6 w-6 text-emerald-400/60" />
                  </div>
                  <span className="text-[10px] text-muted-foreground">You</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="border-t border-border/30 px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <motion.div initial="hidden" whileInView="visible" variants={fadeIn} custom={0} viewport={{ once: true }} className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">Designed for real preparation</h2>
            <p className="mt-3 text-muted-foreground">Everything you need to practice, improve, and succeed</p>
          </motion.div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <motion.div key={title} initial="hidden" whileInView="visible" variants={fadeIn} custom={i}
                viewport={{ once: true }}
                className="group rounded-2xl border border-border/30 bg-card/50 p-8 transition-all duration-300 hover:border-border/60 hover:shadow-lg">
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/15">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="border-t border-border/30 bg-muted/30 px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <motion.div initial="hidden" whileInView="visible" variants={fadeIn} custom={0} viewport={{ once: true }} className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">How it works</h2>
          </motion.div>
          <div className="mt-16 grid gap-12 sm:grid-cols-3">
            {steps.map(({ step, title, desc }, i) => (
              <motion.div key={step} initial="hidden" whileInView="visible" variants={fadeIn} custom={i}
                viewport={{ once: true }} className="text-center">
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

      {/* ── Trust / Tech ── */}
      <section className="border-t border-border/30 px-6 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm text-muted-foreground">Built with modern technology</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {techLogos.map((tech) => (
              <span key={tech} className="rounded-full border border-border/40 px-4 py-1.5 text-xs font-medium text-muted-foreground">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="border-t border-border/30 px-6 py-24">
        <motion.div initial="hidden" whileInView="visible" variants={fadeIn} custom={0} viewport={{ once: true }}
          className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">Ready to ace your next interview?</h2>
          <p className="mt-3 text-muted-foreground">Start practicing with an AI interviewer that adapts, challenges, and helps you improve.</p>
          <Button asChild size="lg" className="mt-8 gap-2 rounded-xl px-8 h-12 text-base"><Link href="/register">Start free <ArrowRight className="h-4 w-4" /></Link></Button>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border/30 px-6 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <Image src="/logo_dark.png" alt="" width={18} height={18} className="hidden dark:block" />
            <Image src="/logo_light.png" alt="" width={18} height={18} className="block dark:hidden" />
            <span>&copy; {new Date().getFullYear()} InterviewPilot AI</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="transition-colors hover:text-foreground">Privacy</a>
            <a href="#" className="transition-colors hover:text-foreground">Terms</a>
            <a href="https://github.com/niranjansah87/interviewpilot-ai" className="transition-colors hover:text-foreground">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
